/**
 * HOCFRONT-46 — вкладка «Звенья» на странице игры/тренировки команды.
 */

import {screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {http, HttpResponse} from 'msw'
import {Route, Routes} from 'react-router'
import {beforeEach, describe, expect, it} from 'vitest'

import {canManageEventLines} from '@/features/access'
import {
  goalieSelectPlaceholder,
  pickSlotCandidates,
  slotFaceLabel,
} from '@/features/events/lib/eventLinesModel'
import {
  getMockEventLines,
  updateMockEventLines,
  validateEventLinesPayload,
} from '@/mocks/data/eventLines'
import {resetMockSession, selectMockPersona} from '@/mocks/data/session'
import {mockRoster} from '@/mocks/data/teams'
import {GameDetailsPage} from '@/pages/GameDetailsPage'
import {TrainingDetailsPage} from '@/pages/TrainingDetailsPage'
import {clearTestStorage} from '@/test/clearTestStorage'
import {server} from '@/test/msw-server'
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

  it('слот с игроком вне состава не называется свободным', () => {
    expect(slotFaceLabel(undefined, undefined, 'me')).toBe('Свободно')
    expect(slotFaceLabel('gone', undefined, 'me')).toBe('Не в составе')
    expect(
      slotFaceLabel('f1', {userId: 'f1', displayName: 'Белов Иван', position: 'forward'}, 'me'),
    ).toBe('Белов')
  })

  it('пустой слот вратаря отличает «нет вратарей» от «все уже назначены»', () => {
    const goalie = {userId: 'g1', displayName: 'Вратарев', position: 'goalie' as const}
    const forward = {userId: 'f1', displayName: 'Белов', position: 'forward' as const}

    expect(goalieSelectPlaceholder([forward], [])).toBe('В команде нет вратарей')
    expect(goalieSelectPlaceholder([goalie], [])).toBe('Все вратари уже назначены')
    expect(goalieSelectPlaceholder([goalie], [goalie])).toBe('Не назначен')
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
    expect(screen.getByText('Слоты и укомплектованность')).not.toBeVisible()
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

  it('черновик звена сохраняется при переходе на вкладку «Состав»', async () => {
    selectMockPersona('coach')
    const user = userEvent.setup()
    renderGame('/events/games/event-001?tab=lines')

    await user.click(await screen.findByTestId('events-lines-btn-edit-1'))
    await user.click(screen.getByTestId('events-lines-btn-color-1d4ed8'))
    await user.click(screen.getByTestId('events-game-page-btn-tab-roster'))
    expect(screen.getByText('Слоты и укомплектованность')).toBeInTheDocument()
    await user.click(screen.getByTestId('events-game-page-btn-tab-lines'))

    expect(screen.getByTestId('events-lines-btn-save')).toBeInTheDocument()
    expect(screen.getByTestId('events-lines-btn-color-1d4ed8')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('игрок вне состава не выглядит свободной позицией', async () => {
    const current = getMockEventLines('event-001', 'team-001')
    updateMockEventLines('event-001', 'team-001', {
      goalies: current.goalies,
      lines: current.lines.map((line) =>
        line.number === 1 ? {...line, slots: {...line.slots, rw: 'user-006'}} : line,
      ),
    })

    try {
      renderGame('/events/games/event-001?tab=lines')
      const slot = await screen.findByTestId('events-lines-btn-slot-1-rw')
      expect(slot).toHaveTextContent('Не в составе')
      expect(slot).not.toHaveTextContent('Свободно')
    } finally {
      updateMockEventLines('event-001', 'team-001', {
        goalies: current.goalies,
        lines: current.lines,
      })
    }
  })

  it('запасной вратарь не пишет «в команде нет вратарей», если основной уже назначен', async () => {
    const current = getMockEventLines('event-001', 'team-001')
    server.use(
      http.get('/mock-api/v1/teams/:teamId/roster', ({params}) => {
        const roster = mockRoster.filter((member) => member.teamId === params.teamId)
        return HttpResponse.json([
          ...roster,
          {
            teamId: params.teamId,
            userId: 'user-goalie',
            displayName: 'Вратарев Иван',
            position: 'goalie',
            teamRole: 'player',
            rosterStatus: 'active',
            joinedAt: '2026-01-01T00:00:00Z',
          },
        ])
      }),
    )
    updateMockEventLines('event-001', 'team-001', {
      goalies: {starter: 'user-goalie'},
      lines: current.lines,
    })

    try {
      selectMockPersona('coach')
      const user = userEvent.setup()
      renderGame('/events/games/event-001?tab=lines')
      await user.click(await screen.findByTestId('events-lines-btn-edit-goalies'))
      expect(screen.getByText('Все вратари уже назначены')).toBeInTheDocument()
    } finally {
      updateMockEventLines('event-001', 'team-001', {
        goalies: current.goalies,
        lines: current.lines,
      })
    }
  })

  it('ошибка состава не прячет вкладку «Звенья»', async () => {
    server.use(
      http.get('/mock-api/v1/teams/:teamId/roster', () =>
        HttpResponse.json({message: 'boom'}, {status: 500}),
      ),
    )
    renderGame('/events/games/event-001')

    expect(await screen.findByTestId('events-game-page-error-roster')).toBeInTheDocument()
    expect(screen.getByText('Не удалось загрузить состав команды')).toBeInTheDocument()
    expect(screen.queryByTestId('events-game-page-panel-tabs')).not.toBeInTheDocument()
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
