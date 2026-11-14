/**
 * HOCFRONT-46 — справочники для звеньев (пятёрок).
 */

import type {EventGoalieSlotKey, EventLineSlotKey} from '../types/eventLinesTypes'

/** Не больше 7 звеньев: 7 × 5 = 35 полевых игроков + 2 вратаря. */
export const EVENT_LINES_MAX = 7

/** Порядок позиций в звене: сначала нападающие, затем защитники. */
export const EVENT_LINE_SLOT_KEYS: EventLineSlotKey[] = ['c', 'lw', 'rw', 'ld', 'rd']

export const EVENT_GOALIE_SLOT_KEYS: EventGoalieSlotKey[] = ['starter', 'backup']

/** Амплуа, которое позиция ожидает по умолчанию. */
export const EVENT_LINE_SLOT_ROLE: Record<EventLineSlotKey, 'forward' | 'defense'> = {
  lw: 'forward',
  c: 'forward',
  rw: 'forward',
  ld: 'defense',
  rd: 'defense',
}

export const EVENT_LINE_SLOT_LABELS: Record<EventLineSlotKey, string> = {
  lw: 'Левый край',
  c: 'Центр',
  rw: 'Правый край',
  ld: 'Левый защитник',
  rd: 'Правый защитник',
}

export const EVENT_GOALIE_SLOT_LABELS: Record<EventGoalieSlotKey, string> = {
  starter: 'Основной',
  backup: 'Запасной',
}

/** Готовые цвета маек; тренер может выбрать и свой. */
export const EVENT_LINE_JERSEY_PRESETS: Array<{color: string; label: string}> = [
  {color: '#111827', label: 'Чёрные'},
  {color: '#e10600', label: 'Красные'},
  {color: '#1d4ed8', label: 'Синие'},
  {color: '#f8fafc', label: 'Белые'},
  {color: '#facc15', label: 'Жёлтые'},
  {color: '#16a34a', label: 'Зелёные'},
]
