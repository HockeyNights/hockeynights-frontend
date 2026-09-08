/**
 * HOCFRONT-34A — поиск, chips и расширенные фильтры лиг (как /arenas)
 */

import {Select} from '@gravity-ui/uikit'
import {useMemo} from 'react'

import type {SkillLevel} from '@/entities/common'
import type {LeagueFilters as LeagueFiltersType} from '@/entities/league'
import {SKILL_LEVEL_LABELS} from '@/features/events'
import {
  countActiveLeagueFilters,
  isLeagueCatalogChipActive,
  LEAGUE_CATALOG_CHIPS,
  type LeagueCatalogChipId,
  toggleLeagueCatalogChip,
} from '@/features/leagues/lib/leagueCatalogFilters'
import {testId} from '@/shared/testing/testId'
import {CatalogFilterBar} from '@/shared/ui/CatalogFilterBar'

export interface LeagueFiltersProps {
  filters: LeagueFiltersType
  onChange: (filters: LeagueFiltersType) => void
  onReset?: () => void
  resultsCount?: number
  resultsPending?: boolean
}

const LEVEL_OPTIONS: Array<{value: '' | SkillLevel; content: string}> = [
  {value: '', content: 'Любой уровень'},
  {value: 'beginner', content: SKILL_LEVEL_LABELS.beginner},
  {value: 'amateur', content: SKILL_LEVEL_LABELS.amateur},
  {value: 'advanced', content: SKILL_LEVEL_LABELS.advanced},
  {value: 'league', content: SKILL_LEVEL_LABELS.league},
]

const RECRUITING_OPTIONS: Array<{
  value: '' | NonNullable<LeagueFiltersType['recruitingStatus']>
  content: string
}> = [
  {value: '', content: 'Любой статус набора'},
  {value: 'open', content: 'Набор открыт'},
  {value: 'waitlist', content: 'Лист ожидания'},
  {value: 'closed', content: 'Набор закрыт'},
]

/**
 * HOCFRONT-34A - Поиск, chips и расширенные фильтры каталога лиг
 */
export function LeagueFilters({
  filters,
  onChange,
  onReset,
  resultsCount,
  resultsPending,
}: LeagueFiltersProps) {
  const patch = (partial: Partial<LeagueFiltersType>) => onChange({...filters, ...partial})

  const chips = useMemo(
    () =>
      LEAGUE_CATALOG_CHIPS.map((chip) => ({
        id: chip.id,
        label: chip.label,
        active: isLeagueCatalogChipActive(chip.id, filters),
      })),
    [filters],
  )

  return (
    <CatalogFilterBar
      testIdPrefix="leagues"
      testIdSection="filters"
      searchValue={filters.query ?? ''}
      onSearchChange={(value) => patch({query: value || undefined})}
      searchPlaceholder="Название лиги…"
      searchLabel="Поиск лиг"
      chips={chips}
      onChipToggle={(chipId) =>
        onChange(toggleLeagueCatalogChip(chipId as LeagueCatalogChipId, filters))
      }
      activeCount={countActiveLeagueFilters(filters)}
      onReset={onReset}
      resultsCount={resultsCount}
      resultsPending={resultsPending}
      advanced={
        <>
          <Select
            label="Уровень"
            value={[filters.level ?? '']}
            onUpdate={(value) => patch({level: (value[0] as SkillLevel) || undefined})}
            options={LEVEL_OPTIONS}
            data-testid={testId('leagues', 'filters', 'select', 'level')}
          />
          <Select
            label="Набор команд"
            value={[filters.recruitingStatus ?? '']}
            onUpdate={(value) =>
              patch({
                recruitingStatus: (value[0] as LeagueFiltersType['recruitingStatus']) || undefined,
              })
            }
            options={RECRUITING_OPTIONS}
            data-testid={testId('leagues', 'filters', 'select', 'recruiting')}
          />
        </>
      }
    />
  )
}
