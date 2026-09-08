/**
 * SPEC-FR-3.1.1
 * HOCFRONT-25 / TASK-04-01 — фильтры публичного списка команд (без поиска)
 */

import {Select, TextInput} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'

import type {SkillLevel} from '@/entities/common'
import {fetchLeagues} from '@/entities/league'
import {fetchPlayers} from '@/entities/profile'
import type {TeamsFilterParams} from '@/entities/team'
import {testId} from '@/shared/testing/testId'

export interface TeamFiltersProps {
  filters: TeamsFilterParams
  onChange: (filters: TeamsFilterParams) => void
}

const SKILL_OPTIONS: Array<{value: '' | SkillLevel; content: string}> = [
  {value: '', content: 'Любой уровень'},
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
  {value: 'league', content: 'Лига'},
]

/**
 * @spec SPEC-FR-3.1.1 - Фильтры: лига, игрок, город, уровень
 *
 * Контролы для слота `advanced` в `CatalogFilterBar`: поиск, сброс и раскрытие
 * панели живут в общем компоненте.
 */
export function TeamFilters({filters, onChange}: TeamFiltersProps) {
  const {data: leagues = []} = useQuery({queryKey: ['leagues'], queryFn: () => fetchLeagues()})
  const {data: players = []} = useQuery({queryKey: ['players'], queryFn: () => fetchPlayers()})

  const leagueOptions = useMemo(
    () => [
      {value: '', content: 'Все лиги'},
      ...leagues.map((l) => ({value: l.id, content: l.name})),
    ],
    [leagues],
  )

  const playerOptions = useMemo(
    () => [
      {value: '', content: 'Любой игрок'},
      ...players.map((p) => ({value: p.userId, content: p.displayName})),
    ],
    [players],
  )

  return (
    <>
      <Select
        label="Лига"
        value={[filters.leagueId ?? '']}
        onUpdate={(v) => onChange({...filters, leagueId: v[0] || undefined})}
        options={leagueOptions}
        data-testid={testId('teams', 'team-filters', 'select', 'league')}
      />
      <Select
        label="Игрок в составе"
        value={[filters.playerId ?? '']}
        onUpdate={(v) => onChange({...filters, playerId: v[0] || undefined})}
        options={playerOptions}
        data-testid={testId('teams', 'team-filters', 'select', 'player')}
      />
      <TextInput
        label="Город"
        value={filters.city ?? ''}
        onUpdate={(v) => onChange({...filters, city: v || undefined})}
        data-testid={testId('teams', 'team-filters', 'field', 'city')}
      />
      <Select
        label="Уровень"
        value={[filters.skillLevel ?? '']}
        onUpdate={(v) =>
          onChange({
            ...filters,
            skillLevel: (v[0] as SkillLevel | undefined) || undefined,
          })
        }
        options={SKILL_OPTIONS}
        data-testid={testId('teams', 'team-filters', 'select', 'skill')}
      />
    </>
  )
}
