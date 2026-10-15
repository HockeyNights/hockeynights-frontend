/**
 * HOCFRONT-28A — каталог «Игры и тренировки» + create gate
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import {CreateEventPage} from '@/pages/CreateEventPage'
import {EventsPage} from '@/pages/EventsPage'
import {EVENTS_LABEL} from '@/shared/config/navigationLabels'
import {routes} from '@/shared/const/appRoutes'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('HOCFRONT-28A EventsPage IA', () => {
  beforeEach(() => {
    clearTestStorage()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows new catalog tabs and upcoming games + trainings', async () => {
    renderWithProviders(<EventsPage />)

    await waitFor(() => {
      expect(screen.getByText(EVENTS_LABEL)).toBeInTheDocument()
      expect(screen.getByTestId('events-page-btn-type-for-me')).toBeInTheDocument()
      expect(screen.getByTestId('events-page-btn-type-training')).toBeInTheDocument()
      expect(screen.getByTestId('events-page-btn-type-game')).toBeInTheDocument()
      expect(screen.getByTestId('events-page-btn-type-my')).toBeInTheDocument()
      expect(screen.getByTestId('events-page-text-details-title')).toHaveTextContent(
        'Ближайшие события',
      )
      expect(screen.getAllByTestId(/events-card-card-/).length).toBeGreaterThan(1)
      expect(screen.getByText('Товарищеская игра — Медведи САО')).toBeInTheDocument()
      expect(screen.getByText('Публичная тренировка 2-сторонка')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('events-create-form-panel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('events-organizer-card')).not.toBeInTheDocument()
  })

  it('links organizer actions to create and organizer routes', async () => {
    renderWithProviders(<EventsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('events-page-btn-create')).toBeInTheDocument()
      expect(screen.getByTestId('events-page-btn-organizer')).toBeInTheDocument()
    })

    expect(screen.getByTestId('events-page-link-create')).toHaveAttribute(
      'href',
      routes.eventsCreate,
    )
    expect(screen.getByTestId('events-page-link-organizer')).toHaveAttribute(
      'href',
      routes.eventsOrganizer,
    )
  })

  it('filters catalog to trainings only', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await screen.findByTestId('events-page-btn-type-training')
    await user.click(screen.getByTestId('events-page-btn-type-training'))

    await waitFor(() => {
      expect(screen.queryByText('Товарищеская игра — Медведи САО')).not.toBeInTheDocument()
      expect(screen.getByText('Публичная тренировка 2-сторонка')).toBeInTheDocument()
      expect(screen.getByTestId('events-page-text-details-title')).toHaveTextContent(
        'Ближайшие события',
      )
    })
  })

  it('shows only confirmed registrations in Мои записи', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await screen.findByTestId('radar-team-rsvp-response-btn-confirm-event-league-sat')
    await user.click(screen.getByTestId('radar-team-rsvp-response-btn-confirm-event-league-sat'))

    await waitFor(() => {
      expect(
        screen.getByTestId('radar-team-rsvp-response-text-status-event-league-sat'),
      ).toHaveTextContent('Вы идёте')
    })

    await user.click(screen.getByTestId('events-page-btn-type-my'))

    await waitFor(() => {
      expect(screen.getByTestId('events-page-text-details-title')).toHaveTextContent(
        'Ближайшие события',
      )
      expect(screen.getByText('Лига — Медведи САО vs Вымпел')).toBeInTheDocument()
      expect(screen.queryByText('Товарищеская игра — Медведи САО')).not.toBeInTheDocument()
    })
  })

  it('blocks public_open create without subscription after mock paid period', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true})
    vi.setSystemTime(new Date('2026-08-16T12:00:00+03:00'))
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime})
    renderWithProviders(
      <Routes>
        <Route path={routes.eventsCreate} element={<CreateEventPage />} />
      </Routes>,
      {routerProps: {initialEntries: [routes.eventsCreate]}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('events-create-page-page')).toBeInTheDocument()
      expect(screen.getByTestId('events-create-form-panel')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Название'), 'Открытая тренировка теста')
    for (let i = 0; i < 6; i += 1) {
      await user.click(screen.getByTestId('events-create-form-btn-next'))
    }

    await waitFor(() => {
      expect(screen.getByTestId('events-create-form-btn-submit')).toBeInTheDocument()
    })
    await user.click(screen.getByTestId('events-create-form-btn-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('events-create-form-error-gate')).toBeInTheDocument()
    })
    vi.useRealTimers()
  })

  it('applies chips into URL and restores filters from search params', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path={routes.events} element={<EventsPage />} />
      </Routes>,
      {routerProps: {initialEntries: [`${routes.events}?time=evening&maxPrice=1500`]}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('events-page-btn-chip-evening')).toBeInTheDocument()
      expect(screen.getByTestId('events-page-text-active-filters')).toHaveTextContent('Фильтров: 2')
    })

    await user.click(screen.getByTestId('events-page-btn-chip-needs-goalie'))
    await waitFor(() => {
      expect(screen.getByTestId('events-page-text-active-filters')).toHaveTextContent('Фильтров: 3')
    })

    await user.click(screen.getByTestId('events-page-btn-reset-filters'))
    await waitFor(() => {
      expect(screen.queryByTestId('events-page-text-active-filters')).not.toBeInTheDocument()
      expect(screen.queryByTestId('events-page-btn-reset-filters')).not.toBeInTheDocument()
    })
  })
})
