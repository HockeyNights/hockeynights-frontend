/**
 * HOCFRONT-34A — chips / счётчик / URL-парсинг фильтров каталога лиг (как arenas catalog)
 */

import type {SkillLevel} from '@/entities/common'
import type {League, LeagueFilters, LeagueRegionFilter} from '@/entities/league'

export type LeagueCatalogChipId =
  'moscow' | 'russia' | 'recruiting_open' | 'beginner' | 'amateur' | 'advanced'

export const LEAGUE_CATALOG_CHIPS: Array<{id: LeagueCatalogChipId; label: string}> = [
  {id: 'moscow', label: 'Москва'},
  {id: 'russia', label: 'Россия'},
  {id: 'recruiting_open', label: 'Набор открыт'},
  {id: 'beginner', label: 'Дебютант'},
  {id: 'amateur', label: 'Любитель'},
  {id: 'advanced', label: 'Продвинутый'},
]

const SKILL_LEVEL_VALUES = new Set<string>(['beginner', 'amateur', 'advanced', 'league', 'unknown'])
const RECRUITING_STATUS_VALUES = new Set<string>(['open', 'waitlist', 'closed'])

function parseSkillLevel(value: string | null): SkillLevel | undefined {
  if (!value || !SKILL_LEVEL_VALUES.has(value)) return undefined
  return value as SkillLevel
}

function parseRecruitingStatus(value: string | null): League['recruitingStatus'] | undefined {
  if (!value || !RECRUITING_STATUS_VALUES.has(value)) return undefined
  return value as League['recruitingStatus']
}

function parseRegion(value: string | null): LeagueRegionFilter | undefined {
  return value === 'moscow' || value === 'russia' ? value : undefined
}

/** Разбор фильтров каталога из URL; неизвестные значения отбрасываются. */
export function parseLeagueFiltersFromSearchParams(params: URLSearchParams): LeagueFilters {
  const query = params.get('q')?.trim()
  return {
    query: query || undefined,
    region: parseRegion(params.get('region')),
    level: parseSkillLevel(params.get('level')),
    recruitingStatus: parseRecruitingStatus(params.get('recruitingStatus')),
  }
}

export function writeLeagueFiltersToSearchParams(filters: LeagueFilters): URLSearchParams {
  const next = new URLSearchParams()
  if (filters.query) next.set('q', filters.query)
  if (filters.region) next.set('region', filters.region)
  if (filters.level) next.set('level', filters.level)
  if (filters.recruitingStatus) next.set('recruitingStatus', filters.recruitingStatus)
  return next
}

export function countActiveLeagueFilters(filters: LeagueFilters): number {
  let count = 0
  if (filters.region) count += 1
  if (filters.level) count += 1
  if (filters.recruitingStatus) count += 1
  return count
}

export function isLeagueCatalogChipActive(
  chipId: LeagueCatalogChipId,
  filters: LeagueFilters,
): boolean {
  switch (chipId) {
    case 'moscow':
      return filters.region === 'moscow'
    case 'russia':
      return filters.region === 'russia'
    case 'recruiting_open':
      return filters.recruitingStatus === 'open'
    case 'beginner':
      return filters.level === 'beginner'
    case 'amateur':
      return filters.level === 'amateur'
    case 'advanced':
      return filters.level === 'advanced'
    default:
      return false
  }
}

export function toggleLeagueCatalogChip(
  chipId: LeagueCatalogChipId,
  filters: LeagueFilters,
): LeagueFilters {
  const next = {...filters}
  switch (chipId) {
    case 'moscow':
      next.region = filters.region === 'moscow' ? undefined : 'moscow'
      break
    case 'russia':
      next.region = filters.region === 'russia' ? undefined : 'russia'
      break
    case 'recruiting_open':
      next.recruitingStatus = filters.recruitingStatus === 'open' ? undefined : 'open'
      break
    case 'beginner':
      next.level = filters.level === 'beginner' ? undefined : 'beginner'
      break
    case 'amateur':
      next.level = filters.level === 'amateur' ? undefined : 'amateur'
      break
    case 'advanced':
      next.level = filters.level === 'advanced' ? undefined : 'advanced'
      break
  }
  return next
}

/** Нормализация имени команды для сопоставления таблицы/расписания. */
export function normalizeLeagueTeamName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}
