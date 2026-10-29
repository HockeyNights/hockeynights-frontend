/**
 * SPEC-FR-12.1.2, SPEC-NFR-2
 */

import {http, passthrough} from 'msw'
import {setupWorker} from 'msw/browser'

import {handlers} from '@/mocks/handlers'
import {usesBackendAuth} from '@/shared/config/apiMode'

/** В backend-режиме /api/* (Vite proxy → Public API) не должен ломаться в SW */
const backendPassthroughHandlers = usesBackendAuth()
  ? [
      http.all('/api/*', () => passthrough()),
      http.all('https://api.hockeynights.appard.tech/*', () => passthrough()),
    ]
  : []

/** @spec SPEC-NFR-2 - MSW worker для Phase 1 */
export const worker = setupWorker(...backendPassthroughHandlers, ...handlers)

/** Ключ разовой авто-перезагрузки, чтобы не уйти в цикл при неподнявшемся SW */
const RELOAD_GUARD_KEY = 'hockey-msw-reload-attempted'

/**
 * Непойманный запрос к `/mock-api/**` — это дыра в handlers: MSW пропустит его
 * в сеть, dev-сервер отдаст index.html, и UI покажет ошибку загрузки без причины.
 * Логируем явно, чтобы такие пути не терялись молча. Остальное (assets,
 * HMR, шрифты) пропускаем без шума.
 */
function reportUnhandled(request: Request, print: {warning: () => void}): void {
  const pathname = new URL(request.url).pathname
  if (pathname.startsWith('/api/')) return
  if (pathname.startsWith('/mock-api/')) {
    print.warning()
  }
}

/**
 * @spec SPEC-FR-12.1.2 - Запуск mock API в браузере
 *
 * После `start()` дополнительно убеждаемся, что service worker реально
 * контролирует страницу. При hard-reload (Cmd/Ctrl+Shift+R) страница остаётся
 * неконтролируемой, запросы уходят мимо MSW на dev-сервер и всё приложение
 * показывает ошибки загрузки «до следующего обычного обновления». Здесь мы
 * делаем это обновление сами — один раз, под guard'ом от цикла.
 */
export async function startMockApi(): Promise<void> {
  await worker.start({
    onUnhandledRequest: reportUnhandled,
    serviceWorker: {url: '/mockServiceWorker.js'},
  })

  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  if (navigator.serviceWorker.controller) {
    sessionStorage.removeItem(RELOAD_GUARD_KEY)
    return
  }

  if (sessionStorage.getItem(RELOAD_GUARD_KEY)) {
    // Перезагрузка уже была и не помогла — не зацикливаемся.
    // Дальше запросы упадут с понятной ApiNotInterceptedError.
    console.error(
      '[mock-api] Service worker не контролирует страницу даже после перезагрузки. ' +
        'Проверьте, что /mockServiceWorker.js отдаётся, и что SW не отключён в DevTools.',
    )
    return
  }

  sessionStorage.setItem(RELOAD_GUARD_KEY, '1')
  window.location.reload()
  // Ждём перезагрузку, чтобы не отрендерить приложение с нерабочим API
  await new Promise(() => {})
}
