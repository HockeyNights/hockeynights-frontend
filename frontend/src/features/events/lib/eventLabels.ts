import type {PlayerPosition, SkillLevel} from '@/entities/common'
import type {GameEvent} from '@/entities/event'

export const ACCESS_LABELS: Record<NonNullable<GameEvent['accessScope']>, string> = {
  club_only: 'Для клуба',
  limited: 'По приглашению',
  public: 'Публичная',
  private_club: 'Для клуба',
  public_open: 'Публичная',
}

export const TRAINING_FORMAT_LABELS: Record<NonNullable<GameEvent['trainingFormat']>, string> = {
  two_way: 'Двухсторонка',
  training: 'Тренировка',
  training_two_way: 'Тренировка + двухсторонка',
}

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Дебютант',
  amateur: 'Любитель',
  novice_theorist: 'Начинающий теоретик',
  theorist: 'Теоретик',
  confident_theorist: 'Уверенный теоретик',
  practitioner: 'Практик',
  master: 'Мастер',
  advanced: 'Продвинутый',
  league: 'Лига',
  unknown: 'Не указан',
}

export const POSITION_LABELS: Record<PlayerPosition, string> = {
  goalie: 'Вратарь',
  defense: 'Защита',
  forward: 'Нападение',
  any: 'Универсал',
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  game: 'Игра',
  training: 'Тренировка',
  open_ice: 'Открытый лёд',
}

export const TRAINING_FORMAT_FILTER_OPTIONS = [
  {value: 'all', content: 'Любой формат'},
  {value: 'two_way', content: TRAINING_FORMAT_LABELS.two_way},
  {value: 'training', content: TRAINING_FORMAT_LABELS.training},
  {value: 'training_two_way', content: TRAINING_FORMAT_LABELS.training_two_way},
] as const

export const SKILL_LEVEL_FILTER_OPTIONS = [
  {value: 'all', content: 'Любой уровень'},
  {value: 'beginner', content: SKILL_LEVEL_LABELS.beginner},
  {value: 'amateur', content: SKILL_LEVEL_LABELS.amateur},
  {value: 'advanced', content: SKILL_LEVEL_LABELS.advanced},
  {value: 'league', content: SKILL_LEVEL_LABELS.league},
] as const

/** TASK-05-03 — фильтр типа доступа (private / public) */
export const ACCESS_SCOPE_FILTER_OPTIONS = [
  {value: 'all', content: 'Любой доступ'},
  {value: 'public_open', content: 'Публичная'},
  {value: 'private_club', content: 'Только для клуба'},
  {value: 'limited', content: 'По приглашению'},
] as const

/** Сопоставление UI-фильтра с legacy `public` / `club_only` в моках. */
export function matchesAccessScopeFilter(
  accessScope: GameEvent['accessScope'] | undefined,
  selected: string,
): boolean {
  if (selected === 'all') return true
  if (!accessScope) return false
  if (selected === 'public_open') {
    return accessScope === 'public_open' || accessScope === 'public'
  }
  if (selected === 'private_club') {
    return accessScope === 'private_club' || accessScope === 'club_only'
  }
  return accessScope === selected
}
