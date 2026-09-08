/**
 * HOCFRONT-20 - Тесты панели фильтров списка игроков
 * SPEC-FR-2.3.1, SPEC-FR-2.3.2
 */

import {screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {delay, http, HttpResponse} from 'msw'
import {beforeEach, describe, expect, it} from 'vitest'

import {PlayersPage} from '@/pages/PlayersPage'
import {clearTestStorage} from '@/test/clearTestStorage'
import {server} from '@/test/msw-server'
import {renderWithProviders} from '@/test/render'

/** Расширенные фильтры в CatalogFilterBar на mobile (jsdom matchMedia) свёрнуты. */
async function openAdvancedFilters() {
  const user = userEvent.setup()
  const toggle = await screen.findByTestId('players-player-filters-btn-filters-toggle')
  if (toggle.getAttribute('aria-expanded') === 'false') {
    await user.click(toggle)
  }
  return screen.getByTestId('players-player-filters-grid-filters')
}

async function selectOption(testIdValue: string, optionLabel: string) {
  const user = userEvent.setup()
  await openAdvancedFilters()
  await user.click(screen.getByTestId(testIdValue))
  const option = await screen.findByRole('option', {name: optionLabel})
  await user.click(option)
}

describe('PlayersPage filters', () => {
  beforeEach(() => {
    clearTestStorage()
  })

  it('отображает панель фильтров со всеми полями HOCFRONT-20', async () => {
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByTestId('players-player-filters-panel-filters')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Поиск игроков')).toBeInTheDocument()

    const form = await openAdvancedFilters()
    expect(within(form).getByText('Амплуа')).toBeInTheDocument()
    expect(within(form).getByText('Уровень')).toBeInTheDocument()
    expect(within(form).getByLabelText('Район')).toBeInTheDocument()
    expect(within(form).getByText('Команда')).toBeInTheDocument()
    expect(within(form).getByText('Город')).toBeInTheDocument()
    expect(within(form).getByText('Только подтверждённые')).toBeInTheDocument()
    expect(within(form).getByText('Только вратари')).toBeInTheDocument()
  })

  it('фильтрует по имени; поиск не считает фильтром', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Лебедев Артур Олегович')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Поиск игроков'), 'Артур')

    await waitFor(
      () => {
        expect(screen.getByText('Лебедев Артур Олегович')).toBeInTheDocument()
        expect(screen.queryByText('Смирнов Алексей Дмитриевич')).not.toBeInTheDocument()
      },
      {timeout: 3000},
    )

    expect(screen.queryByTestId('players-player-filters-btn-reset-filters')).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText('Поиск игроков'))

    await waitFor(() => {
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
      expect(screen.getByText('Лебедев Артур Олегович')).toBeInTheDocument()
    })
  })

  it('фильтрует только подтверждённых игроков', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Волков Сергей Николаевич')).toBeInTheDocument()
    })

    await openAdvancedFilters()
    await user.click(screen.getByLabelText('Только подтверждённые'))

    await waitFor(() => {
      expect(screen.queryByText('Волков Сергей Николаевич')).not.toBeInTheDocument()
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
      expect(screen.getByText('Лебедев Артур Олегович')).toBeInTheDocument()
    })
  })

  it('фильтрует по амплуа быстрым chip', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('players-player-filters-btn-chip-goalie'))

    await waitFor(() => {
      expect(screen.getByTestId('players-player-filters-btn-chip-goalie')).toHaveClass('is-active')
      expect(screen.queryByText('Козлов Дмитрий Александрович')).not.toBeInTheDocument()
    })
  })

  it('снимает verified без оставшихся активных фильтров', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
    })

    await openAdvancedFilters()
    const verifiedCheckbox = screen.getByLabelText('Только подтверждённые')
    await user.click(verifiedCheckbox)

    await waitFor(() => {
      expect(screen.getByTestId('players-player-filters-text-active-filters')).toHaveTextContent(
        'Фильтров: 1',
      )
      expect(screen.getByTestId('players-player-filters-btn-reset-filters')).toBeInTheDocument()
    })

    await user.click(verifiedCheckbox)

    await waitFor(() => {
      expect(
        screen.queryByTestId('players-player-filters-text-active-filters'),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('players-player-filters-btn-reset-filters'),
      ).not.toBeInTheDocument()
    })
  })

  it('фильтрует по команде', async () => {
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
    })

    await selectOption('players-player-filters-select-team', 'Медведи САО')

    await waitFor(() => {
      expect(screen.queryByText('Смирнов Алексей Дмитриевич')).not.toBeInTheDocument()
      expect(screen.queryByText('Лебедев Артур Олегович')).not.toBeInTheDocument()
      expect(screen.getByText('Козлов Дмитрий Александрович')).toBeInTheDocument()
      expect(screen.getByText('Волков Сергей Николаевич')).toBeInTheDocument()
    })
  })

  it('фильтрует по городу', async () => {
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Лебедев Артур Олегович')).toBeInTheDocument()
    })

    await selectOption('players-player-filters-select-city', 'Санкт-Петербург')

    await waitFor(() => {
      expect(screen.getByText('Лебедев Артур Олегович')).toBeInTheDocument()
      expect(screen.queryByText('Смирнов Алексей Дмитриевич')).not.toBeInTheDocument()
      expect(screen.queryByText('Козлов Дмитрий Александрович')).not.toBeInTheDocument()
    })
  })

  it('фильтрует по амплуа и уровню', async () => {
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
    })

    await selectOption('players-player-filters-select-position', 'Вратарь')
    await selectOption('players-player-filters-select-skill-level', 'Практик')

    await waitFor(() => {
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
      expect(screen.queryByText('Морозов Никита Алексеевич')).not.toBeInTheDocument()
      expect(screen.queryByText('Козлов Дмитрий Александрович')).not.toBeInTheDocument()
    })
  })

  it('сворачивает расширенные фильтры и поддерживает aria-expanded', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    const toggle = await screen.findByTestId('players-player-filters-btn-filters-toggle')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls')
    const panel = screen.getByTestId('players-player-filters-grid-filters')
    expect(panel).not.toBeVisible()

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(panel).toBeVisible()

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(panel).not.toBeVisible()
  })

  it('показывает индикатор загрузки при refetch со stale-данными', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
    })

    server.use(
      http.get('/mock-api/v1/players', async () => {
        await delay(300)
        return HttpResponse.json([
          {
            userId: 'user-006',
            displayName: 'Лебедев Артур Олегович',
            fullName: 'Лебедев Артур Олегович',
            city: 'Санкт-Петербург',
            position: 'forward',
            skillLevel: 'amateur',
            stickHand: 'right',
            availability: [],
            profileCompleteness: 72,
            karmaScore: 80,
            verificationStatus: 'verified',
          },
        ])
      }),
    )

    await user.type(screen.getByLabelText('Поиск игроков'), 'Артур')

    await waitFor(
      () => {
        expect(screen.getByTestId('players-players-page-progress')).toHaveClass(
          'players-page__progress--active',
        )
        expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
      },
      {timeout: 3000},
    )

    await waitFor(
      () => {
        expect(screen.getByText('Лебедев Артур Олегович')).toBeInTheDocument()
        expect(screen.queryByText('Смирнов Алексей Дмитриевич')).not.toBeInTheDocument()
      },
      {timeout: 3000},
    )
  })

  it('показывает пустое состояние с кнопкой сброса при отсутствии совпадений', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Игроки')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Поиск игроков'), 'НесуществующийИгрок')

    const emptyState = await screen.findByTestId('players-players-page-empty', {}, {timeout: 3000})
    expect(within(emptyState).getByText('Пустая сетка')).toBeInTheDocument()
    expect(
      within(emptyState).getByText('Игроки не найдены по выбранным фильтрам.'),
    ).toBeInTheDocument()
    expect(within(emptyState).getByText('Сбросить фильтры')).toBeInTheDocument()
  })
})
