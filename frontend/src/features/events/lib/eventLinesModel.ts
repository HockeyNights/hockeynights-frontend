/**
 * HOCFRONT-46 — чистая логика звеньев: кандидаты в слот, цвета маек, сборка сохранения.
 */

import type {EventGoalieSlotKey, EventLine, EventLines, EventLineSlotKey} from '@/entities/event'
import {EVENT_LINE_JERSEY_PRESETS} from '@/entities/event'
import type {PlayerPosition} from '@/shared/types/common'

/** Игрок, которого можно поставить в звено. */
export interface EventLinePlayer {
  userId: string
  displayName: string
  position: PlayerPosition
  avatarUrl?: string
  /** Активный или запасной. `false` — приглашён, отказался или удалён из состава. */
  eligible?: boolean
}

export type EventLineRole = 'forward' | 'defense' | 'goalie'

/** Все userId, уже стоящие в звеньях и у ворот. */
export function collectAssignedUserIds(
  goalies: EventLines['goalies'],
  lines: EventLine[],
): Set<string> {
  const ids = [
    ...Object.values(goalies),
    ...lines.flatMap((line) => Object.values(line.slots)),
  ].filter((id): id is string => Boolean(id))
  return new Set(ids)
}

/**
 * Кандидаты в слот: игроки нужного амплуа (или универсалы), которые ещё нигде не стоят.
 * Игрок, уже занимающий этот слот, остаётся в списке.
 */
export function pickSlotCandidates(
  players: EventLinePlayer[],
  role: EventLineRole,
  assigned: Set<string>,
  currentUserId?: string,
): EventLinePlayer[] {
  return players
    .filter((player) => player.eligible !== false)
    .filter((player) => player.position === role || player.position === 'any')
    .filter((player) => player.userId === currentUserId || !assigned.has(player.userId))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'ru'))
}

/** Подпись цвета маек: название готового цвета или «Свой цвет». */
export function jerseyColorLabel(color: string): string {
  const preset = EVENT_LINE_JERSEY_PRESETS.find(
    (item) => item.color.toLowerCase() === color.toLowerCase(),
  )
  return preset?.label ?? 'Свой цвет'
}

/** Первый готовый цвет, которого ещё нет у других звеньев. */
export function nextJerseyColor(lines: EventLine[]): string {
  const used = new Set(lines.map((line) => line.jerseyColor.toLowerCase()))
  const free = EVENT_LINE_JERSEY_PRESETS.find((item) => !used.has(item.color.toLowerCase()))
  return (free ?? EVENT_LINE_JERSEY_PRESETS[lines.length % EVENT_LINE_JERSEY_PRESETS.length]).color
}

/** Новое пустое звено в конце списка. */
export function createEmptyLine(lines: EventLine[]): EventLine {
  return {
    id: `line-${Date.now().toString(36)}`,
    number: lines.length + 1,
    jerseyColor: nextJerseyColor(lines),
    slots: {},
  }
}

/** Вставить/заменить звено и перенумеровать по порядку. */
export function upsertLine(lines: EventLine[], draft: EventLine): EventLine[] {
  const exists = lines.some((line) => line.id === draft.id)
  const next = exists
    ? lines.map((line) => (line.id === draft.id ? draft : line))
    : [...lines, draft]
  return renumberLines(next)
}

/** Удалить звено и перенумеровать оставшиеся. */
export function removeLine(lines: EventLine[], lineId: string): EventLine[] {
  return renumberLines(lines.filter((line) => line.id !== lineId))
}

export function renumberLines(lines: EventLine[]): EventLine[] {
  return lines.map((line, index) => ({...line, number: index + 1}))
}

/** Поставить игрока в слот звена (или освободить слот при пустом userId). */
export function assignSlot(
  line: EventLine,
  slot: EventLineSlotKey,
  userId: string | undefined,
): EventLine {
  const slots = {...line.slots}
  if (userId) {
    slots[slot] = userId
  } else {
    delete slots[slot]
  }
  return {...line, slots}
}

/** Поставить вратаря (или освободить место). */
export function assignGoalie(
  goalies: EventLines['goalies'],
  slot: EventGoalieSlotKey,
  userId: string | undefined,
): EventLines['goalies'] {
  const next = {...goalies}
  if (userId) {
    next[slot] = userId
  } else {
    delete next[slot]
  }
  return next
}

/** Инициалы для кружка без аватарки: «Петров Иван» → «ПИ». */
export function playerInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** Короткое имя под кружком: фамилия. */
export function playerShortName(displayName: string): string {
  return displayName.split(/\s+/)[0] ?? displayName
}

/**
 * Подпись кружка. Игрок с userId, которого нет среди доступных,
 * не показывается как свободная позиция.
 */
export function slotFaceLabel(
  userId: string | undefined,
  player: EventLinePlayer | undefined,
  currentUserId: string,
): string {
  if (userId && !player) return 'Не в составе'
  if (!player) return 'Свободно'
  if (player.userId === currentUserId) return 'Вы'
  return playerShortName(player.displayName)
}

/** Пустой слот вратаря: нет вратарей в команде или все уже стоят в другом слоте. */
export function goalieSelectPlaceholder(
  eligiblePlayers: EventLinePlayer[],
  candidates: EventLinePlayer[],
): string {
  if (candidates.length > 0) return 'Не назначен'
  const teamHasGoalie = eligiblePlayers.some(
    (player) => player.position === 'goalie' || player.position === 'any',
  )
  return teamHasGoalie ? 'Все вратари уже назначены' : 'В команде нет вратарей'
}

export const EVENT_LINE_ROLE_LABELS: Record<EventLineRole, string> = {
  forward: 'Нападающий',
  defense: 'Защитник',
  goalie: 'Вратарь',
}
