/**
 * HOCFRONT-23 — подтверждённый игрок: галочка + фильтр verified-only
 * SPEC-FR-17.1.2, SPEC-FR-2.3.1, SPEC-FR-2.3.2
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router'
import {beforeEach, describe, expect, it, vi} from 'vitest'

import {mockPlayers} from '@/mocks/data/players'
import {PlayersPage} from '@/pages/PlayersPage'
import {PublicPlayerProfilePage} from '@/pages/PublicPlayerProfilePage'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'
import {PlayerCard} from '@/widgets/PlayerCard'

function findPlayer(userId: string) {
  const player = mockPlayers.find((p) => p.userId === userId)
  if (!player) throw new Error(`player ${userId} not found in mocks`)
  return player
}

function mockMatchMedia(matchesMobile: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: matchesMobile && query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('HOCFRONT-23 verified player', () => {
  beforeEach(() => {
    clearTestStorage()
    mockMatchMedia(false)
  })

  it('shows verified checkmark badge on player card', () => {
    const player = findPlayer('user-002')
    renderWithProviders(
      <Routes>
        <Route path="/" element={<PlayerCard player={player} />} />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )

    const badge = screen.getByTestId('players-player-card-badge-verified-user-002')
    expect(badge).toHaveTextContent('Подтверждён')
    expect(badge).toHaveAttribute('title', 'Профиль подтверждён')
    expect(badge).not.toHaveAttribute('aria-label')
    expect(badge.querySelector('svg')).not.toBeNull()
  })

  it('hides verified badge for unverified and pending players', () => {
    const unverified = findPlayer('user-004')
    const pending = findPlayer('user-005')

    const {unmount} = renderWithProviders(
      <Routes>
        <Route path="/" element={<PlayerCard player={unverified} />} />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )
    expect(
      screen.queryByTestId('players-player-card-badge-verified-user-004'),
    ).not.toBeInTheDocument()
    unmount()

    renderWithProviders(
      <Routes>
        <Route path="/" element={<PlayerCard player={pending} />} />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )
    expect(
      screen.queryByTestId('players-player-card-badge-verified-user-005'),
    ).not.toBeInTheDocument()
  })

  it('shows verified badge on public player page', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/players/:userId" element={<PublicPlayerProfilePage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/players/user-002']}},
    )

    await screen.findByTestId('players-public-player-profile-page-user-002')
    const badge = screen.getByTestId('players-player-card-badge-verified-user-002')
    expect(badge).toHaveTextContent('Подтверждён')
    expect(badge.querySelector('svg')).not.toBeNull()
  })

  it('hides page verified badge for unverified player', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/players/:userId" element={<PublicPlayerProfilePage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/players/user-004']}},
    )

    await screen.findByTestId('players-public-player-profile-page-user-004')
    expect(
      screen.queryByTestId('players-player-card-badge-verified-user-004'),
    ).not.toBeInTheDocument()
  })

  it('filters list to verified-only players', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Волков Сергей Николаевич')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('players-player-filters-btn-filters-toggle'))
    expect(screen.getByTestId('players-player-filters-checkbox-verified')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Только подтверждённые'))

    await waitFor(() => {
      expect(screen.queryByText('Волков Сергей Николаевич')).not.toBeInTheDocument()
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
    })
  })
})
