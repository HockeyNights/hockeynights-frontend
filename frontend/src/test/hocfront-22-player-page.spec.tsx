/**
 * HOCFRONT-22 — публичная страница игрока `/players/:userId`
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router'
import {beforeEach, describe, expect, it} from 'vitest'

import {resetMockSession} from '@/mocks/data/session'
import {PublicPlayerProfilePage} from '@/pages/PublicPlayerProfilePage'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

function renderPlayerPage(userId: string, initialEntries?: string[]) {
  return renderWithProviders(
    <Routes>
      <Route path="/profile" element={<div data-testid="profile-page">Профиль</div>} />
      <Route path="/players/:userId" element={<PublicPlayerProfilePage />} />
    </Routes>,
    {routerProps: {initialEntries: initialEntries ?? [`/players/${userId}`]}},
  )
}

describe('HOCFRONT-22 страница игрока', () => {
  beforeEach(() => {
    clearTestStorage()
    resetMockSession()
  })

  it('композиция как «О себе»: паспорт, публичная инфа, календарь, история', async () => {
    renderPlayerPage('user-002')

    await waitFor(() => {
      expect(screen.getByTestId('players-public-player-profile-page-user-002')).toBeInTheDocument()
    })

    expect(screen.getByTestId('players-public-info-card-user-002')).toBeInTheDocument()
    await waitFor(() => {
      expect(
        screen.getByTestId('players-public-info-text-team-user-002-team-002'),
      ).toHaveTextContent('Соколы ЮАО (игровой номер: 02)')
    })
    expect(screen.getByTestId('players-public-info-img-team-logo-team-002')).toBeInTheDocument()
    expect(screen.getByTestId('players-public-info-link-team-team-002')).toHaveAttribute(
      'href',
      '/teams/team-002',
    )
    expect(screen.queryByTestId('players-player-card-text-team-user-002')).not.toBeInTheDocument()
    expect(screen.getByTestId('players-player-card-text-birth-user-002')).toBeInTheDocument()
    expect(screen.getByTestId('players-player-card-text-index-user-002')).toHaveTextContent('8')
    expect(screen.getByTestId('players-public-info-text-city-user-002')).toHaveTextContent('Москва')
    expect(screen.getByTestId('players-public-info-list-achievements-user-002')).toBeInTheDocument()
    expect(screen.getByTestId('players-public-info-text-city-user-002')).not.toHaveTextContent(
      'СЗАО',
    )
    expect(screen.queryByTestId('players-player-card-text-metro-user-002')).not.toBeInTheDocument()
    expect(screen.getByTestId('players-player-card-text-city-user-002')).toHaveTextContent('Москва')
    expect(screen.getByTestId('players-player-card-text-city-user-002')).not.toHaveTextContent(
      'СЗАО',
    )

    expect(
      screen.queryByTestId('players-public-player-profile-section-team'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('players-public-player-profile-section-favorites'),
    ).not.toBeInTheDocument()

    expect(screen.getByTestId('players-public-player-profile-section-calendar')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-shell-page')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-shell-text-title')).toHaveTextContent('Календарь игрока')

    expect(screen.getByTestId('players-public-player-profile-card-history')).toBeInTheDocument()
    expect(screen.getByTestId('profile-participation-history-list')).toBeInTheDocument()
    expect(screen.getByTestId('profile-participation-history-item-event-003')).toBeInTheDocument()
    expect(screen.getByTestId('players-public-player-profile-btn-back')).toHaveTextContent(
      'Вернуться',
    )
  })

  it('кнопка «Назад» возвращает на предыдущий экран', async () => {
    const user = userEvent.setup()
    renderPlayerPage('user-001', ['/profile', '/players/user-001'])

    await waitFor(() => {
      expect(screen.getByTestId('players-public-player-profile-page-user-001')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('players-public-player-profile-btn-back'))

    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument()
    })
  })

  it('скрытый профиль не показывает паспорт', async () => {
    renderPlayerPage('user-008')

    await waitFor(() => {
      expect(screen.getByTestId('players-public-player-profile-card-hidden')).toBeInTheDocument()
    })
    expect(screen.getByText('Профиль скрыт')).toBeInTheDocument()
    expect(screen.queryByTestId('players-player-card-card-user-008')).not.toBeInTheDocument()
  })
})
