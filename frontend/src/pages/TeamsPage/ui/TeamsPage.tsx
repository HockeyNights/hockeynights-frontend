/**
 * SPEC-FR-3.1.1, SPEC-FR-3.1.2
 * SPEC-UI-2.3
 * HOCFRONT-25 — лента команд: отдельный поиск + фильтры
 * HOCFRONT-19 — FavoriteButton на TeamCard; deep-link /teams/:teamId
 */

import {useQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {Link} from 'react-router'

import type {SkillLevel} from '@/entities/common'
import {favoriteKey, fetchFavorites} from '@/entities/favorites'
import {fetchTeams, type TeamsFilterParams} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {TeamCard, TeamFilters} from '@/features/teams'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {CatalogFilterBar} from '@/shared/ui/CatalogFilterBar'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {ScrollReveal} from '@/shared/ui/ScrollStory'

const EMPTY_FILTERS: TeamsFilterParams = {}

const SKILL_CHIPS: Array<{id: SkillLevel; label: string}> = [
  {id: 'beginner', label: 'Дебютант'},
  {id: 'amateur', label: 'Любитель'},
  {id: 'advanced', label: 'Продвинутый'},
  {id: 'league', label: 'Лига'},
]

function countActiveFilters(filters: TeamsFilterParams): number {
  return Object.values(filters).filter((value) => value !== undefined && value !== '').length
}

/**
 * @spec SPEC-UI-2.3 - Лента команд
 * @spec SPEC-FR-3.1.1 - Публичный список с поиском и фильтрами
 */
export function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<TeamsFilterParams>(EMPTY_FILTERS)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const {teamPermissions} = useSessionAccess()
  const {canCreateTeam} = teamPermissions('player')

  const queryFilters = useMemo<TeamsFilterParams>(
    () => ({
      ...filters,
      q: searchQuery.trim() || undefined,
    }),
    [filters, searchQuery],
  )

  const activeCount = countActiveFilters(filters) + (favoritesOnly ? 1 : 0)
  const hasSearch = Boolean(searchQuery.trim())

  const {
    data: teams = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['teams', queryFilters],
    queryFn: () => fetchTeams(queryFilters),
    placeholderData: (previous) => previous,
  })

  // Тот же ключ, что у FavoriteButton: сердечко на карточке сразу меняет выборку.
  const {data: favorites = []} = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    select: (data) => data.items,
  })

  const visibleTeams = useMemo(() => {
    if (!favoritesOnly) return teams
    const ids = new Set(favorites.map((item) => item.id))
    return teams.filter((team) => ids.has(favoriteKey('team', team.id)))
  }, [teams, favorites, favoritesOnly])

  const skillChips = useMemo(
    () =>
      SKILL_CHIPS.map((chip) => ({
        id: chip.id,
        label: chip.label,
        active: filters.skillLevel === chip.id,
      })),
    [filters.skillLevel],
  )

  const handleResetAll = () => {
    setSearchQuery('')
    setFilters(EMPTY_FILTERS)
    setFavoritesOnly(false)
  }

  // Макет игрока (27:53078) — поиск + 3 фильтра; club-admin/admin — chips, «Уровень» и «Создать».
  const showExtendedFilters = canCreateTeam

  const header = (
    <PageHeader
      title="Команды"
      subtitle="Лента публичных команд: поиск, фильтры, профиль и чат в мессенджере."
      testIdPrefix="teams"
      testIdSection="teams-page"
      actions={
        canCreateTeam ? (
          <Link
            to={routes.teamsCreate}
            className="teams-hero__create"
            data-testid={testId('teams', 'teams-page', 'link', 'create')}
          >
            <HockeyButton
              view="action"
              size="l"
              data-testid={testId('teams', 'teams-page', 'btn', 'create')}
            >
              Создать команду
            </HockeyButton>
          </Link>
        ) : undefined
      }
    />
  )

  return (
    <PageHub data-testid={testId('teams', 'teams-page', 'page')}>
      <CatalogFilterBar
        className={`teams-hero${showExtendedFilters ? ' teams-hero--extended' : ''}`}
        testIdPrefix="teams"
        testIdSection="teams-page"
        header={header}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Поиск.."
        searchLabel="Поиск команд"
        chips={showExtendedFilters ? skillChips : undefined}
        onChipToggle={
          showExtendedFilters
            ? (chipId) =>
                setFilters((prev) => ({
                  ...prev,
                  skillLevel: prev.skillLevel === chipId ? undefined : (chipId as SkillLevel),
                }))
            : undefined
        }
        advanced={
          <div
            className="teams-hero__filters"
            data-testid={testId('teams', 'teams-page', 'panel', 'selects')}
          >
            <span className="catalog-filters__chips-label">Фильтры</span>
            <div className="teams-hero__filters-row">
              <TeamFilters
                filters={filters}
                onChange={setFilters}
                showSkillLevel={showExtendedFilters}
              />
            </div>
          </div>
        }
      />

      <div className="teams-results" data-testid={testId('teams', 'teams-page', 'row', 'results')}>
        <p
          className="teams-results__count"
          aria-live="polite"
          data-testid={testId('teams', 'teams-page', 'text', 'results')}
        >
          {isFetching && !isLoading ? (
            'Обновляем результаты…'
          ) : (
            <>
              Найдено: <strong>{visibleTeams.length}</strong>
            </>
          )}
        </p>
        <div className="teams-results__actions">
          {activeCount > 0 || hasSearch ? (
            <button
              type="button"
              className="hockey-section-link teams-results__reset"
              onClick={handleResetAll}
              data-testid={testId('teams', 'teams-page', 'btn', 'reset-filters')}
            >
              Сбросить
            </button>
          ) : null}
          <button
            type="button"
            className={`hockey-section-link teams-results__favorites${favoritesOnly ? ' is-active' : ''}`}
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly((prev) => !prev)}
            data-testid={testId('teams', 'teams-page', 'btn', 'favorites')}
          >
            {favoritesOnly ? 'Все команды' : 'Избранные'}
          </button>
        </div>
      </div>

      {isLoading && (
        <ScoreboardLoader
          testIdPrefix="teams"
          data-testid={testId('teams', 'teams-page', 'loader')}
        />
      )}

      {isError && !isLoading && (
        <QueryErrorState
          title="Не удалось загрузить команды"
          onRetry={() => void refetch()}
          testIdPrefix="teams"
          data-testid={testId('teams', 'teams-page', 'error')}
        />
      )}

      {!isLoading && !isError && visibleTeams.length === 0 && (
        <EmptyNetState
          title={favoritesOnly ? 'В избранном нет команд' : 'Команды не найдены'}
          copy={
            favoritesOnly
              ? 'Отметьте команды сердечком — они появятся здесь.'
              : 'Измените поиск или сбросьте фильтры.'
          }
          testIdPrefix="teams"
          data-testid={testId('teams', 'teams-page', 'empty')}
          action={
            activeCount > 0 || hasSearch ? (
              <HockeyButton
                view="outlined"
                size="s"
                onClick={handleResetAll}
                data-testid={testId('teams', 'teams-page', 'btn', 'reset-empty')}
              >
                Сбросить
              </HockeyButton>
            ) : undefined
          }
        />
      )}

      {!isError && (
        <div
          className="team-feed hockey-stack hockey-stack--gap-12"
          data-testid={testId('teams', 'teams-page', 'panel', 'feed')}
        >
          {visibleTeams.map((team, index) => (
            <ScrollReveal
              key={team.id}
              direction={index % 2 === 0 ? 'left' : 'right'}
              data-testid={testId('teams', 'teams-page', 'item', team.id)}
            >
              <TeamCard team={team} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </PageHub>
  )
}
