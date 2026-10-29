/**
 * SPEC-FR-1.2.3, SPEC-FR-12.1.1, SPEC-FR-12.1.3
 */

/** @spec SPEC-FR-12.1.3 - Режим API: mock или backend */
export type ApiMode = 'mock' | 'backend'

/**
 * @spec SPEC-FR-12.1.3 - Возвращает текущий режим API из env
 */
export function getApiMode(): ApiMode {
  const mode = import.meta.env.VITE_API_MODE
  return mode === 'backend' ? 'backend' : 'mock'
}

/** Auth/profile ходят в реальный Public API */
export function usesBackendAuth(): boolean {
  return getApiMode() === 'backend'
}

/**
 * @spec SPEC-FR-12.1.1 - Базовый URL для доменов без Public API (MSW).
 *
 * Даже при VITE_API_MODE=backend команды/события/… остаются на mock,
 * пока бэкенд не отдаёт эти маршруты. Auth/profile — через getAuthApiBaseUrl().
 */
export function getApiBaseUrl(): string {
  return '/mock-api/v1'
}

/**
 * База для AuthService / ProfileService.
 *
 * Всегда same-origin `/api/v1` (Vite/Nginx proxy): прямой
 * `https://api.hockeynights.appard.tech` ломает CORS (OPTIONS → 501)
 * и падает в MSW service worker с «FetchEvent.respondWith / Load failed».
 */
export function getAuthApiBaseUrl(): string {
  if (!usesBackendAuth()) {
    return '/mock-api/v1'
  }
  const configured = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? '/api/v1'
  if (/^https?:\/\//i.test(configured) || configured.includes('api.hockeynights.appard.tech')) {
    return '/api/v1'
  }
  return configured.replace(/\/$/, '') || '/api/v1'
}

/** Имя устройства для login / verify */
export function getDeviceName(): string {
  if (typeof navigator === 'undefined') return 'HockeyNights Web'
  const ua = navigator.userAgent || ''
  if (/iPhone|iPad/i.test(ua)) return 'HockeyNights iOS Web'
  if (/Android/i.test(ua)) return 'HockeyNights Android Web'
  return 'HockeyNights Web'
}
