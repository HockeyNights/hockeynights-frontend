/**
 * AuthService — реальные REST-эндпоинты Public API.
 */

import type {
  ApiGetMeResponse,
  ApiLoginRequest,
  ApiLoginResponse,
  ApiRegisterRequest,
  ApiRegisterResponse,
  ApiRequestPasswordResetResponse,
  ApiResendCodeRequest,
  ApiResetPasswordRequest,
  ApiVerifyEmailRequest,
  ApiVerifyEmailResponse,
  ApiVerifyLoginCodeRequest,
  ApiVerifyLoginCodeResponse,
  CodePurposeValue,
} from '@/entities/auth/model/types/backendAuthTypes'
import {authApiRequest} from '@/shared/api/client'
import {parseApiErrorMessage} from '@/shared/api/parseApiError'
import {
  clearAuthTokens,
  getDeviceToken,
  saveDeviceToken,
  saveTokenPair,
} from '@/shared/api/tokenStorage'
import {getDeviceName} from '@/shared/config/apiMode'

function wrap<T>(promise: Promise<T>, fallback: string): Promise<T> {
  return promise.catch((error) => {
    throw new Error(parseApiErrorMessage(error, fallback), {cause: error})
  })
}

function persistAuthSuccess(payload: {
  tokens?: {accessToken: string; refreshToken: string; expiresIn?: string}
  deviceToken?: string
}): void {
  if (payload.tokens?.accessToken && payload.tokens.refreshToken) {
    saveTokenPair(payload.tokens)
  }
  if (payload.deviceToken) {
    saveDeviceToken(payload.deviceToken)
  }
}

export function backendRegister(payload: ApiRegisterRequest): Promise<ApiRegisterResponse> {
  return wrap(
    authApiRequest<ApiRegisterResponse>('/auth/register', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    }),
    'Не удалось зарегистрироваться',
  )
}

export async function backendLogin(payload: {
  email: string
  password: string
}): Promise<ApiLoginResponse> {
  const body: ApiLoginRequest = {
    email: payload.email,
    password: payload.password,
    deviceName: getDeviceName(),
  }
  const deviceToken = getDeviceToken()
  if (deviceToken) body.deviceToken = deviceToken

  const response = await wrap(
    authApiRequest<ApiLoginResponse>('/auth/login', {
      method: 'POST',
      body,
      skipAuth: true,
    }),
    'Не удалось войти',
  )

  if (!response.codeRequired && response.tokens) {
    persistAuthSuccess({tokens: response.tokens})
  }
  return response
}

export async function backendVerifyEmail(
  payload: ApiVerifyEmailRequest,
): Promise<ApiVerifyEmailResponse> {
  const response = await wrap(
    authApiRequest<ApiVerifyEmailResponse>('/auth/verify-email', {
      method: 'POST',
      body: {...payload, deviceName: payload.deviceName ?? getDeviceName()},
      skipAuth: true,
    }),
    'Не удалось подтвердить почту',
  )
  persistAuthSuccess(response)
  return response
}

export async function backendVerifyLoginCode(
  payload: ApiVerifyLoginCodeRequest,
): Promise<ApiVerifyLoginCodeResponse> {
  const response = await wrap(
    authApiRequest<ApiVerifyLoginCodeResponse>('/auth/verify-login', {
      method: 'POST',
      body: {...payload, deviceName: payload.deviceName ?? getDeviceName()},
      skipAuth: true,
    }),
    'Не удалось подтвердить вход',
  )
  persistAuthSuccess(response)
  return response
}

export function backendResendCode(email: string, purpose: CodePurposeValue) {
  const body: ApiResendCodeRequest = {email, purpose}
  return wrap(
    authApiRequest<{code: ApiRegisterResponse['code']}>('/auth/resend-code', {
      method: 'POST',
      body,
      skipAuth: true,
    }),
    'Не удалось отправить код повторно',
  )
}

export function backendRequestPasswordReset(
  email: string,
): Promise<ApiRequestPasswordResetResponse> {
  return wrap(
    authApiRequest<ApiRequestPasswordResetResponse>('/auth/password/reset-request', {
      method: 'POST',
      body: {email},
      skipAuth: true,
    }),
    'Не удалось запросить восстановление пароля',
  )
}

export function backendResetPassword(payload: ApiResetPasswordRequest): Promise<void> {
  return wrap(
    authApiRequest<Record<string, never>>('/auth/password/reset', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    }).then(() => undefined),
    'Не удалось установить новый пароль',
  )
}

export function backendGetMe(): Promise<ApiGetMeResponse> {
  return wrap(authApiRequest<ApiGetMeResponse>('/auth/me'), 'Не удалось загрузить аккаунт')
}

export async function backendLogout(): Promise<void> {
  try {
    await authApiRequest<Record<string, never>>('/auth/logout', {
      method: 'POST',
      body: {},
    })
  } catch {
    // локальный выход важнее сетевой ошибки
  } finally {
    clearAuthTokens()
  }
}

export async function backendLogoutAll(): Promise<void> {
  try {
    await authApiRequest<Record<string, never>>('/auth/logout-all', {
      method: 'POST',
      body: {},
    })
  } finally {
    clearAuthTokens()
  }
}
