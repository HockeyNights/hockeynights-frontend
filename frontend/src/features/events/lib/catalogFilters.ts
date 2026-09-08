/**
 * HOCFRONT-28C — URL-фильтры и быстрые chips каталога /events
 */

import type {GameEvent} from '@/entities/event'

export type CatalogTab = 'for-me' | 'training' | 'game' | 'my'
export type DayPreset = 'today' | 'tomorrow' | 'weekend'

export interface CatalogFiltersState {
  tab: CatalogTab
  q: string
  date: string
  dayPreset: DayPreset | null
  format: string
  time: string
  level: string
  arena: string
  status: string
  district: string
  access: string
  fill: string
  minPrice: string
  maxPrice: string
  needsGoalie: boolean
}

export type CatalogChipId =
  'today' | 'tomorrow' | 'weekend' | 'evening' | 'price-1500' | 'has-seats' | 'needs-goalie'

export interface CatalogChip {
  id: CatalogChipId
  label: string
}

export const CATALOG_TABS: {id: CatalogTab; label: string}[] = [
  {id: 'for-me', label: 'Для меня'},
  {id: 'training', label: 'Тренировки'},
  {id: 'game', label: 'Игры'},
  {id: 'my', label: 'Мои записи'},
]

export const CATALOG_CHIPS: CatalogChip[] = [
  {id: 'today', label: 'Сегодня'},
  {id: 'tomorrow', label: 'Завтра'},
  {id: 'weekend', label: 'На выходных'},
  {id: 'evening', label: 'Вечером'},
  {id: 'price-1500', label: 'До 1 500 ₽'},
  {id: 'has-seats', label: 'Есть места'},
  {id: 'needs-goalie', label: 'Ищут вратаря'},
]

export const DEFAULT_CATALOG_FILTERS: CatalogFiltersState = {
  tab: 'for-me',
  q: '',
  date: '',
  dayPreset: null,
  format: 'all',
  time: 'all',
  level: 'all',
  arena: 'all',
  status: 'all',
  district: 'all',
  access: 'all',
  fill: 'all',
  minPrice: '',
  maxPrice: '',
  needsGoalie: false,
}

const TABS = new Set<CatalogTab>(['for-me', 'training', 'game', 'my'])
const DAY_PRESETS = new Set<DayPreset>(['today', 'tomorrow', 'weekend'])

function localDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getLocalDateKey(now = new Date()): string {
  return localDateKey(now)
}

export function getTomorrowDateKey(now = new Date()): string {
  const next = new Date(now)
  next.setDate(next.getDate() + 1)
  return localDateKey(next)
}

export function isWeekendDateKey(dateKey: string): boolean {
  const [year, month, day] = dateKey.split('-').map(Number)
  if (!year || !month || !day) return false
  const weekday = new Date(year, month - 1, day).getDay()
  return weekday === 0 || weekday === 6
}

export function eventNeedsGoalie(event: GameEvent): boolean {
  return event.requiredSlots.some(
    (slot) => slot.position === 'goalie' && slot.filledCount < slot.count,
  )
}

export function parseCatalogFilters(params: URLSearchParams): CatalogFiltersState {
  const tabRaw = params.get('tab')
  const dayRaw = params.get('day')

  return {
    tab: tabRaw && TABS.has(tabRaw as CatalogTab) ? (tabRaw as CatalogTab) : 'for-me',
    q: params.get('q') ?? '',
    date: params.get('date') ?? '',
    dayPreset: dayRaw && DAY_PRESETS.has(dayRaw as DayPreset) ? (dayRaw as DayPreset) : null,
    format: params.get('format') ?? 'all',
    time: params.get('time') ?? 'all',
    level: params.get('level') ?? 'all',
    arena: params.get('arena') ?? 'all',
    status: params.get('status') ?? 'all',
    district: params.get('district') ?? 'all',
    access: params.get('access') ?? 'all',
    fill: params.get('fill') ?? 'all',
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    needsGoalie: params.get('needsGoalie') === '1',
  }
}

export function serializeCatalogFilters(state: CatalogFiltersState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.tab !== 'for-me') params.set('tab', state.tab)
  if (state.q.trim()) params.set('q', state.q.trim())
  if (state.date) params.set('date', state.date)
  if (state.dayPreset) params.set('day', state.dayPreset)
  if (state.format !== 'all') params.set('format', state.format)
  if (state.time !== 'all') params.set('time', state.time)
  if (state.level !== 'all') params.set('level', state.level)
  if (state.arena !== 'all') params.set('arena', state.arena)
  if (state.status !== 'all') params.set('status', state.status)
  if (state.district !== 'all') params.set('district', state.district)
  if (state.access !== 'all') params.set('access', state.access)
  if (state.fill !== 'all') params.set('fill', state.fill)
  if (state.minPrice) params.set('minPrice', state.minPrice)
  if (state.maxPrice) params.set('maxPrice', state.maxPrice)
  if (state.needsGoalie) params.set('needsGoalie', '1')
  return params
}

export function isCatalogChipActive(chipId: CatalogChipId, state: CatalogFiltersState): boolean {
  switch (chipId) {
    case 'today':
      return state.dayPreset === 'today'
    case 'tomorrow':
      return state.dayPreset === 'tomorrow'
    case 'weekend':
      return state.dayPreset === 'weekend'
    case 'evening':
      return state.time === 'evening'
    case 'price-1500':
      return state.maxPrice === '1500'
    case 'has-seats':
      return state.status === 'open'
    case 'needs-goalie':
      return state.needsGoalie
    default:
      return false
  }
}

export function toggleCatalogChip(
  chipId: CatalogChipId,
  state: CatalogFiltersState,
): CatalogFiltersState {
  const active = isCatalogChipActive(chipId, state)

  switch (chipId) {
    case 'today':
      return {
        ...state,
        dayPreset: active ? null : 'today',
        date: '',
      }
    case 'tomorrow':
      return {
        ...state,
        dayPreset: active ? null : 'tomorrow',
        date: '',
      }
    case 'weekend':
      return {
        ...state,
        dayPreset: active ? null : 'weekend',
        date: '',
      }
    case 'evening':
      return {...state, time: active ? 'all' : 'evening'}
    case 'price-1500':
      return {...state, maxPrice: active ? '' : '1500'}
    case 'has-seats':
      return {...state, status: active ? 'all' : 'open'}
    case 'needs-goalie':
      return {...state, needsGoalie: !active}
    default:
      return state
  }
}

export function countActiveCatalogFilters(state: CatalogFiltersState): number {
  let count = 0
  if (state.date) count += 1
  if (state.dayPreset) count += 1
  if (state.format !== 'all') count += 1
  if (state.time !== 'all') count += 1
  if (state.level !== 'all') count += 1
  if (state.arena !== 'all') count += 1
  if (state.status !== 'all') count += 1
  if (state.district !== 'all') count += 1
  if (state.access !== 'all') count += 1
  if (state.fill !== 'all') count += 1
  if (state.minPrice) count += 1
  if (state.maxPrice) count += 1
  if (state.needsGoalie) count += 1
  return count
}

export function matchesDayPreset(
  startsAt: string,
  dayPreset: DayPreset | null,
  now = new Date(),
): boolean {
  if (!dayPreset) return true
  const dateKey = startsAt.slice(0, 10)
  if (dayPreset === 'today') return dateKey === getLocalDateKey(now)
  if (dayPreset === 'tomorrow') return dateKey === getTomorrowDateKey(now)
  return isWeekendDateKey(dateKey)
}

export function matchesCatalogDateFilters(
  startsAt: string,
  state: Pick<CatalogFiltersState, 'date' | 'dayPreset' | 'time'>,
  now = new Date(),
): boolean {
  if (state.date && startsAt.slice(0, 10) !== state.date) return false
  if (!matchesDayPreset(startsAt, state.dayPreset, now)) return false
  if (state.time === 'all') return true
  const hour = new Date(startsAt).getHours()
  if (state.time === 'morning') return hour >= 6 && hour < 12
  if (state.time === 'day') return hour >= 12 && hour < 18
  return hour >= 18 || hour < 6
}
