/**
 * SPEC-FR-3.1.1
 * HOCFRONT-25 / TASK-04-01 — фильтры публичного списка команд (без поиска)
 */

import {Select} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'

import type {SkillLevel} from '@/entities/common'
import {fetchLeagues} from '@/entities/league'
import {fetchPlayers} from '@/entities/profile'
import {fetchTeams, type TeamsFilterParams} from '@/entities/team'
import {testId} from '@/shared/testing/testId'

export interface TeamFiltersProps {
  filters: TeamsFilterParams
  onChange: (filters: TeamsFilterParams) => void
  /** В макете игрока — 3 селекта; у club-admin/admin есть ещё «Уровень». */
  showSkillLevel?: boolean
}

const SKILL_OPTIONS: Array<{value: SkillLevel; content: string}> = [
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
  {value: 'league', content: 'Лига'},
]

function toValue(value: string | undefined): string[] {
  return value ? [value] : []
}

/**
 * @spec SPEC-FR-3.1.1 - Фильтры: лига, игрок, город, уровень
 *
 * Выпадающие списки «Лига / Игрок в составе / Город / Уровень» как в макете:
 * пока значение не выбрано, контрол показывает название фильтра.
 */
export function TeamFilters({filters, onChange, showSkillLevel = true}: TeamFiltersProps) {
  const {data: leagues = []} = useQuery({queryKey: ['leagues'], queryFn: () => fetchLeagues()})
  const {data: players = []} = useQuery({queryKey: ['players'], queryFn: () => fetchPlayers()})
  // Список городов берём из всей ленты команд, а не из отфильтрованной выдачи.
  const {data: allTeams = []} = useQuery({queryKey: ['teams', {}], queryFn: () => fetchTeams({})})

  const leagueOptions = useMemo(
    () => leagues.map((l) => ({value: l.id, content: l.name})),
    [leagues],
  )

  const playerOptions = useMemo(
    () => players.map((p) => ({value: p.userId, content: p.displayName})),
    [players],
  )

  const cityOptions = useMemo(() => {
    const cities = new Set(allTeams.map((team) => team.city).filter(Boolean))
    if (filters.city) cities.add(filters.city)
    return [...cities]
      .sort((a, b) => a.localeCompare(b, 'ru'))
      .map((city) => ({
        value: city,
        content: city,
      }))
  }, [allTeams, filters.city])

  return (
    <>
      <Select
        size="l"
        width="auto"
        hasClear
        placeholder="Лига"
        aria-label="Лига"
        value={toValue(filters.leagueId)}
        onUpdate={(v) => onChange({...filters, leagueId: v[0] || undefined})}
        options={leagueOptions}
        className="team-filters__select"
        data-testid={testId('teams', 'team-filters', 'select', 'league')}
      />
      <Select
        size="l"
        width="auto"
        hasClear
        filterable={playerOptions.length > 8}
        placeholder="Игрок в составе"
        aria-label="Игрок в составе"
        value={toValue(filters.playerId)}
        onUpdate={(v) => onChange({...filters, playerId: v[0] || undefined})}
        options={playerOptions}
        className="team-filters__select"
        data-testid={testId('teams', 'team-filters', 'select', 'player')}
      />
      <Select
        size="l"
        width="auto"
        hasClear
        placeholder="Город"
        aria-label="Город"
        value={toValue(filters.city)}
        onUpdate={(v) => onChange({...filters, city: v[0] || undefined})}
        options={cityOptions}
        className="team-filters__select"
        data-testid={testId('teams', 'team-filters', 'field', 'city')}
      />
      {showSkillLevel ? (
        <Select
          size="l"
          width="auto"
          hasClear
          placeholder="Уровень"
          aria-label="Уровень"
          value={toValue(filters.skillLevel)}
          onUpdate={(v) =>
            onChange({
              ...filters,
              skillLevel: (v[0] as SkillLevel | undefined) || undefined,
            })
          }
          options={SKILL_OPTIONS}
          className="team-filters__select"
          data-testid={testId('teams', 'team-filters', 'select', 'skill')}
        />
      ) : null}
    </>
  )
}
