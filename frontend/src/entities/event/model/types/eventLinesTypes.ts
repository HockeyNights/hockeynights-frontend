/**
 * HOCFRONT-46 — звенья (пятёрки) на игру или тренировку команды.
 * Звено = 3 нападающих + 2 защитника, у каждого звена свой цвет маек.
 */

/** Позиция полевого игрока в звене: крайние, центр, защитники. */
export type EventLineSlotKey = 'lw' | 'c' | 'rw' | 'ld' | 'rd'

/** Место вратаря: основной и запасной. */
export type EventGoalieSlotKey = 'starter' | 'backup'

/** Одно звено: номер, цвет маек и игроки по позициям (userId). */
export interface EventLine {
  id: string
  /** Порядковый номер звена, с 1. */
  number: number
  /** Цвет маек звена в формате #rrggbb. */
  jerseyColor: string
  slots: Partial<Record<EventLineSlotKey, string>>
}

/** Звенья события целиком. */
export interface EventLines {
  eventId: string
  teamId: string
  goalies: Partial<Record<EventGoalieSlotKey, string>>
  lines: EventLine[]
  updatedAt?: string
}

/** Сохранение звеньев — только тренер команды. */
export interface UpdateEventLinesPayload {
  goalies: EventLines['goalies']
  lines: EventLine[]
}
