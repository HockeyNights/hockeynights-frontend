/**
 * SPEC-FR-1.2.2, SPEC-FR-12.1.2, SPEC-NFR-2
 */

import '@gravity-ui/uikit/styles/fonts.css'
import '@gravity-ui/uikit/styles/styles.css'
import './index.scss'

import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import {App} from '@/app/App'
import {startMockApi} from '@/mocks/browser'
import {getApiMode} from '@/shared/config/apiMode'

/**
 * @spec SPEC-NFR-2 - Bootstrap с MSW в mock-режиме
 */
async function bootstrap() {
  // В backend-режиме auth/profile идут на VITE_BACKEND_URL, остальные домены —
  // через MSW (/mock-api/v1), пока для них нет Public API.
  if (getApiMode() === 'mock' || getApiMode() === 'backend') {
    try {
      await startMockApi()
    } catch (error) {
      // Не блокируем рендер: приложение поднимется и покажет внятные
      // ошибки загрузки вместо белого экрана.
      console.error('[mock-api] Не удалось запустить mock API:', error)
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
