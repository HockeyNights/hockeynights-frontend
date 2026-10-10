/**
 * HOCFRONT-9 — сценарий RSVP ближайшей игры в разделе "Игры и тренировки".
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it} from 'vitest'

import {resetMockEventRsvp} from '@/mocks/data/eventRsvp'
import {EventsPage} from '@/pages/EventsPage'
import {EVENTS_LABEL} from '@/shared/config/navigationLabels'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('Events page RSVP block', () => {
  beforeEach(() => {
    resetMockEventRsvp()
    clearTestStorage()
  })

  async function waitForLeagueRsvp() {
    await screen.findByTestId('events-page-panel-league-rsvp')
    await screen.findByTestId('radar-league-rsvp-card-event-league-sat')
  }

  it('shows league RSVP column by default (Figma /events)', async () => {
    renderWithProviders(<EventsPage />)

    await waitFor(() => {
      expect(screen.getByText(EVENTS_LABEL)).toBeInTheDocument()
      expect(screen.getByTestId('events-page-panel-nearest-game')).toBeInTheDocument()
      expect(screen.getByTestId('events-page-panel-league-rsvp')).toBeInTheDocument()
    })
    // «Показать» слева раскрывает карточку игры в основной колонке, не сайдбар.
    expect(screen.queryByTestId('events-page-panel-nearest-game-card')).not.toBeInTheDocument()
  })

  it('shows league game hero and team RSVP list in the aside', async () => {
    renderWithProviders(<EventsPage />)

    await waitFor(() => {
      expect(screen.getByText(EVENTS_LABEL)).toBeInTheDocument()
    })
    await waitForLeagueRsvp()

    expect(screen.getByText('Ближайшая игра')).toBeInTheDocument()
    expect(
      screen.getByTestId('radar-league-rsvp-text-matchup-event-league-sat'),
    ).toBeInTheDocument()
    expect(screen.getByText('Кто идёт из команды')).toBeInTheDocument()
    expect(screen.getByText('Вратари')).toBeInTheDocument()
    expect(screen.getByText('Нападающие')).toBeInTheDocument()
  })

  it('confirms attendance with Буду CTA', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await waitForLeagueRsvp()
    await user.click(screen.getByTestId('radar-team-rsvp-response-btn-confirm-event-league-sat'))

    await waitFor(() => {
      expect(
        screen.getByTestId('radar-team-rsvp-response-text-status-event-league-sat'),
      ).toHaveTextContent('Вы идёте')
    })
  })

  it('declines with preset reason and updates team list', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await waitForLeagueRsvp()
    await user.click(screen.getByTestId('radar-team-rsvp-response-btn-decline-event-league-sat'))
    await user.click(screen.getByTestId('radar-decline-reason-btn-work'))
    await user.click(screen.getByTestId('radar-decline-reason-btn-confirm'))

    await waitFor(() => {
      expect(
        screen.getByTestId('radar-team-rsvp-response-text-status-event-league-sat'),
      ).toHaveTextContent('Вы не сможете')
      expect(screen.getAllByText(/Работаю/).length).toBeGreaterThan(0)
    })
  })

  it('shows upcoming trainings list alongside league RSVP', async () => {
    renderWithProviders(<EventsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('events-page-text-details-title')).toBeInTheDocument()
      expect(screen.getAllByTestId(/events-card-card-/).length).toBeGreaterThan(0)
      expect(screen.getByTestId('events-page-panel-league-rsvp')).toBeInTheDocument()
    })
  })

  it('keeps trainings visible when nearest-game card stays collapsed', async () => {
    renderWithProviders(<EventsPage />)

    await screen.findByTestId('events-page-text-details-title')

    await waitFor(() => {
      expect(screen.getByTestId('events-page-text-details-title')).toBeInTheDocument()
      expect(screen.getAllByTestId(/events-card-card-/).length).toBeGreaterThan(0)
      expect(screen.queryByTestId('events-page-panel-nearest-game-card')).not.toBeInTheDocument()
    })
  })

  it('keeps trainings list when filters block is collapsed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await waitFor(() => {
      expect(screen.getAllByTestId(/events-card-card-/).length).toBeGreaterThan(0)
    })
    const before = screen.getAllByTestId(/events-card-card-/).length

    await user.click(screen.getByTestId('events-page-btn-filters-toggle'))

    await waitFor(() => {
      expect(screen.getByTestId('events-page-text-details-title')).toBeInTheDocument()
      expect(screen.getAllByTestId(/events-card-card-/).length).toBe(before)
    })
  })
})
