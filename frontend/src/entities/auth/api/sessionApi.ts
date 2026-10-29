/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-2.1.3
 */

import {
  backendGetMe,
  backendLogin,
  backendLogout,
  backendLogoutAll,
  backendRegister,
} from '@/entities/auth/api/backendAuthApi'
import {
  buildBackendSession,
  emptyUnauthenticatedSession,
} from '@/entities/auth/lib/buildBackendSession'
import type {AuthLoginResponse, SelectPersonaPayload} from '@/entities/auth/model'
import {backendFetchMyProfile} from '@/entities/profile/api/backendProfileApi'
import type {OnboardingPayload, Session} from '@/entities/user'
import {apiRequest, isNotFoundError} from '@/shared/api/client'
import {parseApiErrorMessage} from '@/shared/api/parseApiError'
import {clearAuthTokens, hasAuthTokens} from '@/shared/api/tokenStorage'
import {usesBackendAuth} from '@/shared/config/apiMode'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  displayName: string
  email: string
  password: string
}

export type BackendLoginResult =
  | {kind: 'authenticated'; session: Session}
  | {kind: 'code_required'; email: string; maskedEmail?: string; resendAfter?: string}

/**
 * @spec SPEC-FR-25.1.1 - Демо-вход: POST /auth/login → карточки ролей (demo@hockey.local).
 * Используется при isDemoCredentials() в LoginForm.
 */
export async function authLogin(payload: LoginPayload): Promise<AuthLoginResponse> {
  try {
    return await apiRequest<AuthLoginResponse>('/auth/login', {method: 'POST', body: payload})
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Не удалось войти'), {cause: error})
  }
}

/**
 * @spec SPEC-FR-2.1.1 - Локальный вход: POST /login → PersonaSelection без auth-login cache.
 * Используется для аккаунтов из localAuthMemory (не demo@hockey.local).
 */
export async function loginWithCredentials(payload: LoginPayload): Promise<{ok: true}> {
  try {
    return await apiRequest<{ok: true}>('/login', {method: 'POST', body: payload})
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Не удалось войти'), {cause: error})
  }
}

/** Вход через Public API (токены / codeRequired). */
export async function loginWithBackend(payload: LoginPayload): Promise<BackendLoginResult> {
  const response = await backendLogin(payload)
  if (response.codeRequired) {
    return {
      kind: 'code_required',
      email: payload.email,
      maskedEmail: response.code?.maskedEmail,
      resendAfter: response.code?.resendAfter,
    }
  }
  const session = await fetchBackendSession()
  return {kind: 'authenticated', session}
}

/**
 * @spec SPEC-FR-2.1.1 - Mock-регистрация (Phase 1)
 */
export async function registerAccount(payload: RegisterPayload): Promise<{ok: true}> {
  if (usesBackendAuth()) {
    await backendRegister({email: payload.email, password: payload.password})
    return {ok: true}
  }
  try {
    return await apiRequest<{ok: true}>('/register', {method: 'POST', body: payload})
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Не удалось зарегистрироваться'), {cause: error})
  }
}

async function fetchBackendSession(): Promise<Session> {
  if (!hasAuthTokens()) {
    return emptyUnauthenticatedSession()
  }

  try {
    const me = await backendGetMe()
    let profile = null
    try {
      profile = await backendFetchMyProfile()
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message !== 'PROFILE_NOT_FOUND' && !isNotFoundError((error as Error).cause)) {
        // профиль недоступен по сети — не считаем это «нужно создать»
        throw error
      }
    }
    return buildBackendSession({account: me.account, profile})
  } catch (error) {
    // 401 после неудачного refresh уже чистит токены в client
    if (!hasAuthTokens()) {
      return emptyUnauthenticatedSession()
    }
    throw new Error(parseApiErrorMessage(error, 'Не удалось загрузить сессию'), {cause: error})
  }
}

/**
 * @spec SPEC-FR-2.1.1 - Получить текущую mock-сессию
 */
export function fetchSession(): Promise<Session> {
  if (usesBackendAuth()) {
    return fetchBackendSession()
  }
  return apiRequest<Session>('/session')
}

/**
 * @spec SPEC-FR-25.1.2 - Выбор демо-роли
 */
export function selectPersona(payload: SelectPersonaPayload): Promise<Session> {
  return apiRequest<Session>('/session/persona', {method: 'POST', body: payload})
}

/**
 * @spec SPEC-FR-2.1.2 - Сохранить onboarding (legacy)
 * @spec SPEC-FR-2.1.3 - Вернуть обновлённую сессию
 * @deprecated Используйте selectPersona (POST /session/persona). Не выставляет personaId / homePath.
 */
export function submitOnboarding(payload: OnboardingPayload): Promise<Session> {
  return apiRequest<Session>('/onboarding', {method: 'POST', body: payload})
}

/** @spec SPEC-FR-2.1.1 - Выход из mock-сессии / backend */
export async function logoutSession(): Promise<Session> {
  if (usesBackendAuth()) {
    await backendLogout()
    return emptyUnauthenticatedSession()
  }
  return apiRequest<Session>('/logout', {method: 'POST'})
}

/** Выход со всех устройств (только backend). */
export async function logoutAllSessions(): Promise<Session> {
  if (usesBackendAuth()) {
    await backendLogoutAll()
    return emptyUnauthenticatedSession()
  }
  clearAuthTokens()
  return logoutSession()
}
