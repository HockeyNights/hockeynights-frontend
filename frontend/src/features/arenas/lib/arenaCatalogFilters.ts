/**
 * HOCFRONT-32 — chips / счётчик фильтров каталога арен (как events catalog)
 */

import type {ArenaFilters} from '@/entities/arena'

export type ArenaCatalogChipId =
  'moscow' | 'moscow_oblast' | 'free_slots' | 'slot_calendar' | 'external_portal' | 'parking'

export const ARENA_CATALOG_CHIPS: Array<{id: ArenaCatalogChipId; label: string}> = [
  {id: 'moscow', label: 'Москва'},
  {id: 'moscow_oblast', label: 'Подмосковье'},
  {id: 'free_slots', label: 'Есть слоты'},
  {id: 'slot_calendar', label: 'Слоты по времени'},
  {id: 'external_portal', label: 'Заявка'},
  {id: 'parking', label: 'Парковка'},
]

export function countActiveArenaFilters(filters: ArenaFilters): number {
  let count = 0
  if (filters.cityRegion) count += 1
  if (filters.district?.trim()) count += 1
  if (filters.metro?.trim()) count += 1
  if (filters.amenity) count += 1
  if (filters.bookingMode) count += 1
  if (filters.hasFreeSlots) count += 1
  return count
}

export function isArenaCatalogChipActive(
  chipId: ArenaCatalogChipId,
  filters: ArenaFilters,
): boolean {
  switch (chipId) {
    case 'moscow':
      return filters.cityRegion === 'moscow'
    case 'moscow_oblast':
      return filters.cityRegion === 'moscow_oblast'
    case 'free_slots':
      return Boolean(filters.hasFreeSlots)
    case 'slot_calendar':
      return filters.bookingMode === 'slot_calendar'
    case 'external_portal':
      return filters.bookingMode === 'external_portal'
    case 'parking':
      return filters.amenity === 'parking'
    default:
      return false
  }
}

export function toggleArenaCatalogChip(
  chipId: ArenaCatalogChipId,
  filters: ArenaFilters,
): ArenaFilters {
  const next = {...filters}
  switch (chipId) {
    case 'moscow':
      next.cityRegion = filters.cityRegion === 'moscow' ? undefined : 'moscow'
      break
    case 'moscow_oblast':
      next.cityRegion = filters.cityRegion === 'moscow_oblast' ? undefined : 'moscow_oblast'
      break
    case 'free_slots':
      next.hasFreeSlots = filters.hasFreeSlots ? undefined : true
      break
    case 'slot_calendar':
      next.bookingMode = filters.bookingMode === 'slot_calendar' ? undefined : 'slot_calendar'
      break
    case 'external_portal':
      next.bookingMode = filters.bookingMode === 'external_portal' ? undefined : 'external_portal'
      break
    case 'parking':
      next.amenity = filters.amenity === 'parking' ? undefined : 'parking'
      break
  }
  return next
}
