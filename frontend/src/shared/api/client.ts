/**
 * SPEC-FR-1.2.3, SPEC-FR-12.1.1, SPEC-FR-12.1.2, SPEC-FR-12.1.3
 */

import {bypassMsw} from '@/shared/api/bypassMsw'
import {extractApiErrorMessage} from '@/shared/api/parseApiError'
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  saveTokenPair,
} from '@/shared/api/tokenStorage'
import {
  getApiBaseUrl,
  getApiMode,
  getAuthApiBaseUrl,
  usesBackendAuth,
} from '@/shared/config/apiMode'

/** @spec SPEC-FR-12.1.1 - Опции HTTP-запроса */
export interface RequestOptions {
  /** @spec SPEC-FR-12.1.1 */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** @spec SPEC-FR-12.1.1 */
  body?: unknown
  /** @spec SPEC-FR-12.1.1 */
  headers?: Record<string, string>
  /** Не добавлять Authorization (login/register/refresh) */
  skipAuth?: boolean
  /** База: mock/общий или auth/profile backend */
  baseUrl?: string
  /** Не пытаться обновить токен при 401 */
  skipRefresh?: boolean
}

/**
 * Запрос не дошёл до mock/backend API и был обслужен dev-сервером
 * (SPA-fallback отдаёт index.html со статусом 200).
 *
 * В mock-режиме это значит, что MSW не перехватил запрос: service worker
 * не контролирует страницу (hard-reload / первый запуск / SW выгружен)
 * либо на путь нет handler'а. Без этой проверки `response.json()` падал
 * с «Unexpected token '<'», и UI показывал ошибку загрузки без причины.
 */
export class ApiNotInterceptedError extends Error {
  readonly method: string
  readonly path: string

  constructor(method: string, path: string) {
    super(
      `API ${method} ${path}: запрос не дошёл до ${getApiMode() === 'mock' ? 'mock API' : 'backend'} — ` +
        'dev-сервер вернул HTML вместо JSON. ' +
        (getApiMode() === 'mock'
          ? 'Скорее всего mock service worker не контролирует страницу — обновите страницу (Cmd/Ctrl+R).'
          : 'Проверьте VITE_BACKEND_URL и доступность бэкенда.'),
    )
    this.name = 'ApiNotInterceptedError'
    this.method = method
    this.path = path
  }
}

/**
 * Ошибка со статусом ответа. Позволяет UI отличить «сущности нет» (404)
 * от «запрос не прошёл» — раньше и то и другое показывалось как
 * «не найдено», хотя во втором случае нужен retry, а не возврат в каталог.
 */
export class ApiError extends Error {
  readonly status: number
  readonly method: string
  readonly path: string

  constructor(method: string, path: string, status: number, details: string) {
    super(`API ${method} ${path} failed: ${status} ${details}`)
    this.name = 'ApiError'
    this.status = status
    this.method = method
    this.path = path
  }
}

/** Сущность отсутствует на сервере (а не сбой загрузки) */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404
}

/** Ответ — HTML/текст вместо ожидаемого JSON */
function isNonJsonResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type') ?? ''
  return contentType !== '' && !contentType.includes('json')
}

/** Реальный Public API не должен проходить через MSW SW */
function resolveFetchInput(url: string, baseUrl: string): RequestInfo {
  if (usesBackendAuth() && baseUrl === getAuthApiBaseUrl()) {
    return bypassMsw(url)
  }
  return url
}

let refreshInFlight: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const url = `${getAuthApiBaseUrl()}/auth/refresh`
        const response = await fetch(resolveFetchInput(url, getAuthApiBaseUrl()), {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({refreshToken}),
        })
        if (!response.ok) {
          clearAuthTokens()
          return false
        }
        const data = (await response.json()) as {
          tokens?: {accessToken: string; refreshToken: string; expiresIn?: string}
        }
        if (!data.tokens?.accessToken || !data.tokens.refreshToken) {
          clearAuthTokens()
          return false
        }
        saveTokenPair(data.tokens)
        return true
      } catch {
        clearAuthTokens()
        return false
      } finally {
        refreshInFlight = null
      }
    })()
  }

  return refreshInFlight
}

async function ensureFreshAccessToken(): Promise<string | null> {
  const access = getAccessToken()
  if (access && !isAccessTokenExpired()) return access
  if (!getRefreshToken()) return access
  const refreshed = await refreshAccessToken()
  return refreshed ? getAccessToken() : null
}

/**
 * @spec SPEC-FR-12.1.1 - Единый API client для mock и backend
 * @spec SPEC-FR-12.1.3 - Не меняет контракт при переключении режима
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    skipAuth = false,
    baseUrl = getApiBaseUrl(),
    skipRefresh = false,
  } = options
  const url = `${baseUrl}${path}`

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (!skipAuth) {
    const token = await ensureFreshAccessToken()
    if (token) requestHeaders.Authorization = `Bearer ${token}`
  }

  const response = await fetch(resolveFetchInput(url, baseUrl), {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (
    response.status === 401 &&
    !skipAuth &&
    !skipRefresh &&
    getRefreshToken() &&
    !path.includes('/auth/refresh')
  ) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return apiRequest<T>(path, {...options, skipRefresh: true})
    }
  }

  if (!response.ok) {
    const errorText = await response.text()
    const apiMessage = extractApiErrorMessage(errorText)
    throw new ApiError(method, path, response.status, apiMessage ?? errorText)
  }

  if (response.status === 204) {
    return undefined as T
  }

  // 200 + text/html = SPA-fallback dev-сервера, а не ответ API
  if (isNonJsonResponse(response)) {
    throw new ApiNotInterceptedError(method, path)
  }

  return response.json() as Promise<T>
}

/** Запрос к Auth/Profile Public API (учитывает backend base URL). */
export function authApiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return apiRequest<T>(path, {...options, baseUrl: getAuthApiBaseUrl()})
}
