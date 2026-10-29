/**
 * Хранение JWT-пары и device-токена для публичного API HockeyNights.
 */

const ACCESS_KEY = 'hockey-auth-access-token'
const REFRESH_KEY = 'hockey-auth-refresh-token'
const DEVICE_KEY = 'hockey-auth-device-token'
const EXPIRES_KEY = 'hockey-auth-expires-at'

export interface StoredTokenPair {
  accessToken: string
  refreshToken: string
  /** Unix ms, когда access считается истёкшим (с небольшим запасом) */
  expiresAt?: number
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) return null
  return window.localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null
  return window.localStorage.getItem(REFRESH_KEY)
}

export function getDeviceToken(): string | null {
  if (!canUseStorage()) return null
  return window.localStorage.getItem(DEVICE_KEY)
}

export function hasAuthTokens(): boolean {
  return Boolean(getAccessToken() || getRefreshToken())
}

/** expiresIn из API — длительность в секундах (строка или число). */
export function saveTokenPair(tokens: {
  accessToken: string
  refreshToken: string
  expiresIn?: string | number
}): void {
  if (!canUseStorage()) return
  window.localStorage.setItem(ACCESS_KEY, tokens.accessToken)
  window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
  if (tokens.expiresIn != null && tokens.expiresIn !== '') {
    const seconds = Number(tokens.expiresIn)
    if (Number.isFinite(seconds) && seconds > 0) {
      // минус 30с — обновляем чуть раньше реального истечения
      window.localStorage.setItem(
        EXPIRES_KEY,
        String(Date.now() + Math.max(0, seconds - 30) * 1000),
      )
      return
    }
  }
  window.localStorage.removeItem(EXPIRES_KEY)
}

export function saveDeviceToken(deviceToken: string): void {
  if (!canUseStorage() || !deviceToken) return
  window.localStorage.setItem(DEVICE_KEY, deviceToken)
}

export function clearAuthTokens(): void {
  if (!canUseStorage()) return
  window.localStorage.removeItem(ACCESS_KEY)
  window.localStorage.removeItem(REFRESH_KEY)
  window.localStorage.removeItem(DEVICE_KEY)
  window.localStorage.removeItem(EXPIRES_KEY)
}

export function isAccessTokenExpired(): boolean {
  if (!canUseStorage()) return true
  const raw = window.localStorage.getItem(EXPIRES_KEY)
  if (!raw) return false
  const expiresAt = Number(raw)
  if (!Number.isFinite(expiresAt)) return false
  return Date.now() >= expiresAt
}
