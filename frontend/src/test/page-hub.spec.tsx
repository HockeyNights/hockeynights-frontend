/**
 * HOCFRONT-43 — PageBackLink как один контрол; PageStatePanel без page-testid.
 */

import {screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'

import {PageBackLink} from '@/shared/ui/PageBackLink'
import {PageHub} from '@/shared/ui/PageHub'
import {PageStatePanel} from '@/shared/ui/PageStatePanel'
import {renderWithProviders} from '@/test/render'

describe('PageBackLink', () => {
  it('рендерит ссылку-кнопку без вложенного button', () => {
    renderWithProviders(
      <PageBackLink
        to="/events"
        label="К списку игр"
        testIdPrefix="events"
        testIdSection="game-page"
      />,
    )

    const control = screen.getByTestId('events-game-page-btn-back')
    expect(control.tagName).toBe('A')
    expect(control).toHaveAttribute('href', '/events')
    expect(control.querySelector('button')).toBeNull()
    expect(screen.queryByTestId('events-game-page-link-back')).not.toBeInTheDocument()
  })
})

describe('PageStatePanel', () => {
  it('экран «нет доступа» не занимает page-testid загруженной страницы', () => {
    renderWithProviders(
      <PageHub data-testid="events-training-page-error-access-denied">
        <PageStatePanel title="Нет доступа к тренировке" testIdPrefix="events" />
      </PageHub>,
    )

    expect(screen.getByTestId('events-training-page-error-access-denied')).toBeInTheDocument()
    expect(screen.queryByTestId('events-training-page-page')).not.toBeInTheDocument()
    expect(screen.getByText('Нет доступа к тренировке')).toBeInTheDocument()
  })
})
