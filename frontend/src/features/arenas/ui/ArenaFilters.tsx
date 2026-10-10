/**
 * SPEC-FR-6.1.2
 * HOCFRONT-32 — каталожный поиск/chips как на /events
 */

import {Select} from '@gravity-ui/uikit'
import {type ReactNode, useMemo} from 'react'

import type {ArenaFilters as ArenaFiltersType} from '@/entities/arena'
import {
  ARENA_CATALOG_CHIPS,
  type ArenaCatalogChipId,
  countActiveArenaFilters,
  isArenaCatalogChipActive,
  toggleArenaCatalogChip,
} from '@/features/arenas/lib/arenaCatalogFilters'
import {testId} from '@/shared/testing/testId'
import {CatalogFilterBar} from '@/shared/ui/CatalogFilterBar'

export type ArenaCatalogView = 'list' | 'map'

/** @spec SPEC-FR-6.1.2 - Props фильтров арен */
export interface ArenaFiltersProps {
  /** @spec SPEC-FR-6.1.2 */
  filters: ArenaFiltersType
  /** @spec SPEC-FR-6.1.2 */
  onChange: (filters: ArenaFiltersType) => void
  /** @spec SPEC-FR-6.1.2 - Сбросить фильтры */
  onReset?: () => void
  /** Шапка страницы внутри карточки фильтров */
  header?: ReactNode
  /** Значения для выпадающих «Район» / «Метро» — из полного каталога */
  districtOptions?: readonly string[]
  metroOptions?: readonly string[]
  resultsCount?: number
  resultsPending?: boolean
}

const AMENITY_OPTIONS = [
  {value: 'parking', content: 'Парковка'},
  {value: 'shower', content: 'Душ'},
  {value: 'skate_sharpening', content: 'Заточка'},
  {value: 'rental', content: 'Прокат'},
  {value: 'cafe', content: 'Кафе'},
]

function toOptions(values: readonly string[], current?: string) {
  const all = current && !values.includes(current) ? [...values, current] : values
  return all.map((value) => ({value, content: value}))
}

/**
 * @spec SPEC-FR-6.1.2 - Поиск, chips и выпадающие фильтры арен
 */
export function ArenaFilters({
  filters,
  onChange,
  onReset,
  header,
  districtOptions = [],
  metroOptions = [],
  resultsCount,
  resultsPending,
}: ArenaFiltersProps) {
  const patch = (partial: Partial<ArenaFiltersType>) => onChange({...filters, ...partial})

  const chips = useMemo(
    () =>
      ARENA_CATALOG_CHIPS.map((chip) => ({
        id: chip.id,
        label: chip.label,
        active: isArenaCatalogChipActive(chip.id, filters),
      })),
    [filters],
  )

  return (
    <CatalogFilterBar
      testIdPrefix="arenas"
      testIdSection="filters"
      className="arenas-filters"
      header={header}
      advancedDefaultOpen
      searchValue={filters.query ?? ''}
      onSearchChange={(value) => patch({query: value || undefined})}
      searchPlaceholder="Название, метро, район, город…"
      searchLabel="Поиск ледовых арен"
      chips={chips}
      onChipToggle={(chipId) =>
        onChange(toggleArenaCatalogChip(chipId as ArenaCatalogChipId, filters))
      }
      activeCount={countActiveArenaFilters(filters)}
      onReset={onReset}
      resultsCount={resultsCount}
      resultsPending={resultsPending}
      advanced={
        <>
          <div
            className="arenas-filters__select"
            data-testid={testId('arenas', 'filters', 'field', 'district')}
          >
            <Select
              size="l"
              width="max"
              placeholder="Район"
              aria-label="Район"
              hasClear
              value={filters.district ? [filters.district] : []}
              onUpdate={(value) => patch({district: value[0] || undefined})}
              options={toOptions(districtOptions, filters.district)}
            />
          </div>
          <div
            className="arenas-filters__select"
            data-testid={testId('arenas', 'filters', 'field', 'metro')}
          >
            <Select
              size="l"
              width="max"
              placeholder="Метро"
              aria-label="Метро"
              hasClear
              value={filters.metro ? [filters.metro] : []}
              onUpdate={(value) => patch({metro: value[0] || undefined})}
              options={toOptions(metroOptions, filters.metro)}
            />
          </div>
          <div
            className="arenas-filters__select"
            data-testid={testId('arenas', 'filters', 'select', 'amenity')}
          >
            <Select
              size="l"
              width="max"
              placeholder="Удобства"
              aria-label="Удобства"
              hasClear
              value={filters.amenity ? [filters.amenity] : []}
              onUpdate={(value) => patch({amenity: value[0] || undefined})}
              options={AMENITY_OPTIONS}
            />
          </div>
        </>
      }
    />
  )
}
