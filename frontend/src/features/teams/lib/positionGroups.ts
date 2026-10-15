import type {PlayerPosition} from '@/entities/common'

/** Порядок групп состава: вратари → защитники → нападающие → универсалы. */
export const POSITION_GROUP_ORDER: readonly PlayerPosition[] = [
  'goalie',
  'defense',
  'forward',
  'any',
]

export const POSITION_GROUP_LABELS: Record<PlayerPosition, string> = {
  goalie: 'Вратари',
  defense: 'Защитники',
  forward: 'Нападающие',
  any: 'Универсалы',
}

export const POSITION_SHORT_LABELS: Record<PlayerPosition, string> = {
  goalie: 'ВР',
  defense: 'ЗЩ',
  forward: 'НП',
  any: 'УН',
}

/** Группирует участников по амплуа, пустые группы отбрасывает. */
export function groupByPosition<T extends {position: PlayerPosition}>(
  members: readonly T[],
): Array<{position: PlayerPosition; label: string; members: T[]}> {
  return POSITION_GROUP_ORDER.map((position) => ({
    position,
    label: POSITION_GROUP_LABELS[position],
    members: members.filter((member) => member.position === position),
  })).filter((group) => group.members.length > 0)
}
