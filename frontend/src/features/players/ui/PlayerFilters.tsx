/**
 * SPEC-FR-2.3.2
 * HOCFRONT-20, HOCFRONT-23
 */

import {Checkbox, Select, TextInput} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'

import type {PlayerPosition, SkillLevel} from '@/entities/common'
import type {PlayersFilterParams} from '@/entities/profile'
import {fetchTeams} from '@/entities/team'
import {testId} from '@/shared/testing/testId'
import {CatalogFilterBar} from '@/shared/ui/CatalogFilterBar'

const POSITION_OPTIONS = [
  {value: '', content: 'Все амплуа'},
  {value: 'forward', content: 'Нападающий'},
  {value: 'defense', content: 'Защитник'},
  {value: 'goalie', content: 'Вратарь'},
]

const SKILL_OPTIONS = [
  {value: '', content: 'Все уровни'},
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'novice_theorist', content: 'Начинающий теоретик'},
  {value: 'theorist', content: 'Теоретик'},
  {value: 'confident_theorist', content: 'Уверенный теоретик'},
  {value: 'practitioner', content: 'Практик'},
  {value: 'master', content: 'Мастер'},
]

type PlayerChipId = 'forward' | 'defense' | 'goalie' | 'verified'

const PLAYER_CHIPS: Array<{id: PlayerChipId; label: string}> = [
  {id: 'forward', label: 'Нападающие'},
  {id: 'defense', label: 'Защитники'},
  {id: 'goalie', label: 'Вратари'},
  {id: 'verified', label: 'Подтверждённые'},
]

/** @spec HOCFRONT-20 - Props фильтров игроков */
export interface PlayerFiltersProps {
  /** @spec HOCFRONT-20 */
  filters: PlayersFilterParams
  /** @spec HOCFRONT-20 */
  onChange: (filters: PlayersFilterParams) => void
  /** @spec HOCFRONT-20 - Сбросить фильтры */
  onReset?: () => void
  /** @spec HOCFRONT-20 - Количество активных значений */
  activeCount?: number
  resultsCount?: number
  resultsPending?: boolean
}

function isChipActive(chipId: PlayerChipId, filters: PlayersFilterParams): boolean {
  if (chipId === 'verified') return Boolean(filters.verified)
  return filters.position === chipId
}

function toggleChip(chipId: PlayerChipId, filters: PlayersFilterParams): PlayersFilterParams {
  if (chipId === 'verified') {
    return {...filters, verified: filters.verified ? undefined : true}
  }
  return {
    ...filters,
    position: filters.position === chipId ? undefined : (chipId as PlayerPosition),
  }
}

/**
 * @spec SPEC-FR-2.3.2 - Фильтры по амплуа, уровню, району и роли вратаря
 * @spec HOCFRONT-20 - Панель фильтров списка игроков: имя, амплуа, уровень, верификация, команда, город
 * @spec HOCFRONT-23 - Фильтр «только подтверждённые» (verified-only)
 */
export function PlayerFilters({
  filters,
  onChange,
  onReset,
  activeCount = 0,
  resultsCount,
  resultsPending,
}: PlayerFiltersProps) {
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: () => fetchTeams()})

  const teamOptions = useMemo(
    () => [
      {value: '', content: 'Все команды'},
      ...teams.map((t) => ({value: t.id, content: t.name})),
    ],
    [teams],
  )

  const cityOptions = useMemo(() => {
    const uniqueCities = Array.from(
      new Set(teams.map((team) => team.city).filter((city): city is string => Boolean(city))),
    ).sort((a, b) => a.localeCompare(b, 'ru'))
    return [
      {value: '', content: 'Все города'},
      ...uniqueCities.map((c) => ({value: c, content: c})),
    ]
  }, [teams])

  const chips = useMemo(
    () =>
      PLAYER_CHIPS.map((chip) => ({
        id: chip.id,
        label: chip.label,
        active: isChipActive(chip.id, filters),
      })),
    [filters],
  )

  return (
    <CatalogFilterBar
      testIdPrefix="players"
      testIdSection="player-filters"
      searchValue={filters.q ?? ''}
      onSearchChange={(value) => onChange({...filters, q: value || undefined})}
      searchPlaceholder="Имя или фамилия игрока…"
      searchLabel="Поиск игроков"
      chips={chips}
      onChipToggle={(chipId) => onChange(toggleChip(chipId as PlayerChipId, filters))}
      activeCount={activeCount}
      onReset={onReset}
      resultsCount={resultsCount}
      resultsPending={resultsPending}
      advanced={
        <>
          <Select
            label="Амплуа"
            value={[filters.position ?? '']}
            onUpdate={(v) =>
              onChange({...filters, position: (v[0] || undefined) as PlayerPosition | undefined})
            }
            options={POSITION_OPTIONS}
            data-testid={testId('players', 'player-filters', 'select', 'position')}
          />
          <Select
            label="Уровень"
            value={[filters.skillLevel ?? '']}
            onUpdate={(v) =>
              onChange({...filters, skillLevel: (v[0] || undefined) as SkillLevel | undefined})
            }
            options={SKILL_OPTIONS}
            data-testid={testId('players', 'player-filters', 'select', 'skill-level')}
          />
          <TextInput
            label="Район"
            value={filters.district ?? ''}
            onUpdate={(v) => onChange({...filters, district: v || undefined})}
            data-testid={testId('players', 'player-filters', 'field', 'district')}
          />
          <Select
            label="Команда"
            value={[filters.teamId ?? '']}
            onUpdate={(v) => onChange({...filters, teamId: v[0] || undefined})}
            options={teamOptions}
            data-testid={testId('players', 'player-filters', 'select', 'team')}
          />
          <Select
            label="Город"
            value={[filters.city ?? '']}
            onUpdate={(v) => onChange({...filters, city: v[0] || undefined})}
            options={cityOptions}
            data-testid={testId('players', 'player-filters', 'select', 'city')}
          />
          <div
            className="catalog-filters__check"
            data-testid={testId('players', 'player-filters', 'checkbox', 'verified')}
          >
            <Checkbox
              checked={Boolean(filters.verified)}
              onUpdate={(checked) => onChange({...filters, verified: checked || undefined})}
              content="Только подтверждённые"
            />
          </div>
          <div
            className="catalog-filters__check"
            data-testid={testId('players', 'player-filters', 'checkbox', 'goalie-only')}
          >
            <Checkbox
              checked={Boolean(filters.goalieOnly)}
              onUpdate={(checked) => onChange({...filters, goalieOnly: checked || undefined})}
              content="Только вратари"
            />
          </div>
        </>
      }
    />
  )
}
