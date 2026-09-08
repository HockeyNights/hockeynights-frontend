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
  const {teamPermissions} = useSessionAccess()
  const {canCreateTeam} = teamPermissions('player')

  const queryFilters = useMemo<TeamsFilterParams>(
    () => ({
      ...filters,
      q: searchQuery.trim() || undefined,
    }),
    [filters, searchQuery],
  )

  const activeCount = countActiveFilters(filters)
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
  }

  return (
    <PageHub data-testid={testId('teams', 'teams-page', 'page')}>
      <PageHeader
        title="Команды"
        subtitle="Лента публичных команд: поиск, фильтры, профиль и чат в мессенджере."
        testIdPrefix="teams"
        testIdSection="teams-page"
        actions={
          canCreateTeam ? (
            <Link
              to={routes.teamsCreate}
              data-testid={testId('teams', 'teams-page', 'link', 'create')}
            >
              <HockeyButton
                view="outlined"
                size="s"
                data-testid={testId('teams', 'teams-page', 'btn', 'create')}
              >
                Создать команду
              </HockeyButton>
            </Link>
          ) : undefined
        }
      />

      <CatalogFilterBar
        testIdPrefix="teams"
        testIdSection="teams-page"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Название или описание команды…"
        searchLabel="Поиск команд"
        chips={skillChips}
        onChipToggle={(chipId) =>
          setFilters((prev) => ({
            ...prev,
            skillLevel: prev.skillLevel === chipId ? undefined : (chipId as SkillLevel),
          }))
        }
        activeCount={activeCount}
        onReset={handleResetAll}
        resultsCount={teams.length}
        resultsPending={isFetching}
        advanced={<TeamFilters filters={filters} onChange={setFilters} />}
      />

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

      {!isLoading && !isError && teams.length === 0 && (
        <EmptyNetState
          title="Команды не найдены"
          copy="Измените поиск или сбросьте фильтры."
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
          {teams.map((team, index) => (
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
