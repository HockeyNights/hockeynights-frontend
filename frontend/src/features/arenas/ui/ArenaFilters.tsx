/**
 * SPEC-FR-6.1.2
 * HOCFRONT-32 — каталожный поиск/chips как на /events
 */

import {Select, TextInput} from '@gravity-ui/uikit'
import {useMemo} from 'react'

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
  /** Режим списка / поиска на карте */
  view?: ArenaCatalogView
  onViewChange?: (view: ArenaCatalogView) => void
  resultsCount?: number
  resultsPending?: boolean
}

const AMENITY_OPTIONS = [
  {value: '', content: 'Все удобства'},
  {value: 'parking', content: 'Парковка'},
  {value: 'shower', content: 'Душ'},
  {value: 'skate_sharpening', content: 'Заточка'},
  {value: 'rental', content: 'Прокат'},
  {value: 'cafe', content: 'Кафе'},
]

const VIEW_TABS: Array<{id: ArenaCatalogView; label: string}> = [
  {id: 'list', label: 'Список'},
  {id: 'map', label: 'Карта'},
]

/**
 * @spec SPEC-FR-6.1.2 - Поиск, chips и расширенные фильтры арен
 */
export function ArenaFilters({
  filters,
  onChange,
  onReset,
  view = 'list',
  onViewChange,
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
      toolbar={
        onViewChange ? (
          <div
            className="page-hub__tabs"
            role="group"
            aria-label="Режим просмотра"
            data-testid={testId('arenas', 'filters', 'panel', 'view')}
          >
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`catalog-filters__chip${view === tab.id ? ' is-active' : ''}`}
                aria-pressed={view === tab.id}
                onClick={() => onViewChange(tab.id)}
                data-testid={testId('arenas', 'filters', 'btn', 'view', tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : undefined
      }
      advanced={
        <>
          <TextInput
            label="Район"
            value={filters.district ?? ''}
            onUpdate={(value) => patch({district: value.trim() ? value : undefined})}
            data-testid={testId('arenas', 'filters', 'field', 'district')}
          />
          <TextInput
            label="Метро"
            value={filters.metro ?? ''}
            onUpdate={(value) => patch({metro: value.trim() ? value : undefined})}
            data-testid={testId('arenas', 'filters', 'field', 'metro')}
          />
          <Select
            label="Удобство"
            value={[filters.amenity ?? '']}
            onUpdate={(value) => patch({amenity: value[0] || undefined})}
            options={AMENITY_OPTIONS}
            data-testid={testId('arenas', 'filters', 'select', 'amenity')}
          />
        </>
      }
    />
  )
}
