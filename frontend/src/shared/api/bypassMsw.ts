/**
 * Обход MSW service worker для реальных сетевых запросов.
 *
 * Без bypass SW перехватывает fetch → passthrough → на Safari/WebKit
 * часто «FetchEvent.respondWith received an error: TypeError: Load failed».
 */

import {bypass} from 'msw'

/** URL/Request, который MSW не перехватывает */
export function bypassMsw(url: string): Request {
  return bypass(url)
}
