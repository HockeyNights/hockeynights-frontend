/**
 * HOCFRONT-46 — вкладка «Звенья» на странице игры/тренировки команды.
 */

import {screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router'
import {beforeEach, describe, expect, it} from 'vitest'

import {canManageEventLines} from '@/features/access'
import {pickSlotCandidates} from '@/features/events/lib/eventLinesModel'
import {validateEventLinesPayload} from '@/mocks/data/eventLines'
import {resetMockSession, selectMockPersona} from '@/mocks/data/session'
import {GameDetailsPage} from '@/pages/GameDetailsPage'
import {TrainingDetailsPage} from '@/pages/TrainingDetailsPage'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

function renderGame(path: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/events/games/:eventId" element={<GameDetailsPage />} />
    </Routes>,
    {routerProps: {initialEntries: [path]}},
  )
}

describe('event lines — права и логика', () => {
  it('настраивать звенья может только тренер из состава команды', () => {
    expect(canManageEventLines(['coach'], 'coach')).toBe(true)
    expect(canManageEventLines(['coach'], 'owner')).toBe(true)
    expect(canManageEventLines(['coach'], 'player')).toBe(false)
    expect(canManageEventLines(['coach'], undefined)).toBe(false)
    expect(canManageEventLines(['player', 'captain'], 'owner')).toBe(false)
    expect(canManageEventLines(['admin'], 'owner')).toBe(false)
  })

  it('в слот предлагаются только свободные игроки нужного амплуа', () => {
    const players = [
      {userId: 'f1', displayName: 'Белов', position: 'forward' as const},
      {userId: 'f2', displayName: 'Агеев', position: 'forward' as const},
      {userId: 'd1', displayName: 'Дьяков', position: 'defense' as const},
      {userId: 'u1', displayName: 'Ершов', position: 'any' as const},
    ]
    const assigned = new Set(['f1'])

    expect(pickSlotCandidates(players, 'forward', assigned).map((p) => p.userId)).toEqual([
      'f2',
      'u1',
    ])
    expect(pickSlotCandidates(players, 'forward', assigned, 'f1').map((p) => p.userId)).toEqual([
      'f2',
      'f1',
      'u1',
    ])
    expect(pickSlotCandidates(players, 'defense', assigned).map((p) => p.userId)).toEqual([
      'd1',
      'u1',
    ])
  })

  it('мок-сервер не даёт больше 7 звеньев и одного игрока в двух местах', () => {
    const line = (id: string, slots: Record<string, string>) => ({
      id,
      number: 1,
      jerseyColor: '#e10600',
      slots,
    })
    expect(
      validateEventLinesPayload(
        {goalies: {}, lines: Array.from({length: 8}, (_, i) => line(`l${i}`, {}))},
        7,
      ),
    ).toMatch(/7/)
    expect(
      validateEventLinesPayload(
        {goalies: {}, lines: [line('a', {c: 'u1'}), line('b', {lw: 'u1'})]},
        7,
      ),
    ).toMatch(/двух местах/)
    expect(validateEventLinesPayload({goalies: {}, lines: [line('a', {c: 'u1'})]}, 7)).toBeNull()
  })
})

describe('event lines — страница игры', () => {
  beforeEach(() => {
    clearTestStorage()
    resetMockSession()
  })

  it('по умолчанию открыт «Состав» со старыми блоками, «Звенья» — по вкладке', async () => {
    const user = userEvent.setup()
    renderGame('/events/games/event-001')

    await waitFor(() => {
      expect(screen.getByTestId('events-game-page-panel-tabs')).toBeInTheDocument()
    })
    expect(screen.getByTestId('events-game-page-btn-tab-roster')).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Слоты и укомплектованность')).toBeInTheDocument()

    await user.click(screen.getByTestId('events-game-page-btn-tab-lines'))

    await waitFor(() => {
      expect(screen.getByTestId('events-lines-card-line-1')).toBeInTheDocument()
    })
    expect(screen.queryByText('Слоты и укомплектованность')).not.toBeInTheDocument()
    expect(screen.getByTestId('events-lines-btn-slot-1-c')).toHaveTextContent('Вы')
    expect(screen.getByText('Ваше звено')).toBeInTheDocument()
    // Капитан (сессия по умолчанию) только смотрит
    expect(screen.queryByTestId('events-lines-btn-edit-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('events-lines-btn-add')).not.toBeInTheDocument()
  })

  it('по нажатию на игрока открывается карточка с переходом в профиль', async () => {
    const user = userEvent.setup()
    renderGame('/events/games/event-001?tab=lines')

    await waitFor(() => {
      expect(screen.getByTestId('events-lines-btn-slot-1-ld')).toBeInTheDocument()
    })
    await user.click(screen.getByTestId('events-lines-btn-slot-1-ld'))

    const link = await screen.findByTestId('events-lines-link-player-profile')
    expect(link).toHaveAttribute('href', '/players/user-003')
    expect(screen.queryByText('Написать')).not.toBeInTheDocument()
  })

  it('тренер освобождает позицию и фиксирует звено', async () => {
    selectMockPersona('coach')
    const user = userEvent.setup()
    renderGame('/events/games/event-001?tab=lines')

    await user.click(await screen.findByTestId('events-lines-btn-edit-1'))
    await user.click(screen.getByTestId('events-lines-btn-slot-1-lw'))
    await user.click(screen.getByTestId('events-lines-btn-unassign'))
    await user.click(screen.getByTestId('events-lines-btn-color-1d4ed8'))
    await user.click(screen.getByTestId('events-lines-btn-save'))

    await waitFor(() => {
      expect(screen.queryByTestId('events-lines-btn-save')).not.toBeInTheDocument()
    })
    const card = screen.getByTestId('events-lines-card-line-1')
    expect(within(card).getByText('Синие')).toBeInTheDocument()
    expect(screen.getByTestId('events-lines-btn-slot-1-lw')).toHaveTextContent('Свободно')
  })

  it('тренер добавляет новое звено', async () => {
    selectMockPersona('coach')
    const user = userEvent.setup()
    renderGame('/events/games/event-001?tab=lines')

    await user.click(await screen.findByTestId('events-lines-btn-add'))
    expect(screen.getByTestId('events-lines-card-line-2')).toBeInTheDocument()
    await user.click(screen.getByTestId('events-lines-btn-save'))

    await waitFor(() => {
      expect(screen.queryByTestId('events-lines-btn-save')).not.toBeInTheDocument()
      expect(screen.getByTestId('events-lines-card-line-2')).toBeInTheDocument()
    })
  })
})

describe('event lines — без команды вкладок нет', () => {
  beforeEach(() => {
    clearTestStorage()
    resetMockSession()
  })

  it('тренировка без команды выглядит как раньше', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/events/trainings/:eventId" element={<TrainingDetailsPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/events/trainings/event-005']}},
    )

    await waitFor(() => {
      expect(screen.getByText('Слоты и укомплектованность')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('events-training-page-panel-tabs')).not.toBeInTheDocument()
  })
})
