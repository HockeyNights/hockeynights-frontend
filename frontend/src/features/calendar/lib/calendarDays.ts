/**
 * HOCFRONT-28CAL-B — месяц и группировка дней
 */

import type {GameEvent} from '@/entities/event'

import {localDateKey, parseDateKey, startOfWeekMonday} from './calendarState'

const WEEKDAY_LABELS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'] as const

export interface MonthCell {
  dateKey: string
  dayOfMonth: number
  inCurrentMonth: boolean
  isToday: boolean
  eventCount: number
}

export function eventDateKey(startsAt: string): string {
  return localDateKey(new Date(startsAt))
}

export function formatEventTime(startsAt: string): {time: string; date: string} {
  const start = new Date(startsAt)
  return {
    time: start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}),
    date: start.toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'}),
  }
}

export function groupEventsByDay(events: GameEvent[]): Map<string, GameEvent[]> {
  const map = new Map<string, GameEvent[]>()
  for (const event of events) {
    const key = eventDateKey(event.startsAt)
    const list = map.get(key) ?? []
    list.push(event)
    map.set(key, list)
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  }
  return map
}

export function buildMonthCells(
  monthCursor: Date,
  eventsByDay: Map<string, GameEvent[]>,
  todayKey = localDateKey(),
): MonthCell[] {
  const year = monthCursor.getFullYear()
  const month = monthCursor.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const gridStart = startOfWeekMonday(firstOfMonth)
  const cells: MonthCell[] = []

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    const dateKey = localDateKey(date)
    cells.push({
      dateKey,
      dayOfMonth: date.getDate(),
      inCurrentMonth: date.getMonth() === month,
      isToday: dateKey === todayKey,
      eventCount: eventsByDay.get(dateKey)?.length ?? 0,
    })
  }

  return cells
}

export function monthTitle(monthCursor: Date): string {
  return monthCursor.toLocaleDateString('ru-RU', {month: 'long', year: 'numeric'})
}

export function weekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS
}

export function shiftMonth(monthCursor: Date, delta: number): Date {
  return new Date(monthCursor.getFullYear(), monthCursor.getMonth() + delta, 1)
}

export function monthCursorFromDateKey(dateKey: string): Date {
  const parsed = parseDateKey(dateKey)
  if (!parsed) {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), 1)
}
