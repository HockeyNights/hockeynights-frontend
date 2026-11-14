/**
 * HOCFRONT-46 — mock звеньев (пятёрок) на события команды.
 */

import type {EventLines, UpdateEventLinesPayload} from '@/entities/event'
import {LEAGUE_SATURDAY_EVENT_ID} from '@/entities/event'

function seedLines(eventId: string, teamId: string): EventLines {
  return {
    eventId,
    teamId,
    goalies: {},
    lines: [
      {
        id: `${eventId}-line-1`,
        number: 1,
        jerseyColor: '#e10600',
        slots: {c: 'user-001', lw: 'user-004', ld: 'user-003', rd: 'user-005'},
      },
    ],
    updatedAt: '2026-11-01T10:00:00Z',
  }
}

/** Заполненные звенья у пары событий «Медведей САО»; у остальных звеньев пока нет. */
export let mockEventLines: EventLines[] = [
  seedLines('event-001', 'team-001'),
  seedLines(LEAGUE_SATURDAY_EVENT_ID, 'team-001'),
]

export function getMockEventLines(eventId: string, teamId: string): EventLines {
  return (
    mockEventLines.find((item) => item.eventId === eventId) ?? {
      eventId,
      teamId,
      goalies: {},
      lines: [],
    }
  )
}

export function updateMockEventLines(
  eventId: string,
  teamId: string,
  payload: UpdateEventLinesPayload,
): EventLines {
  const next: EventLines = {
    eventId,
    teamId,
    goalies: payload.goalies,
    lines: payload.lines,
    updatedAt: new Date().toISOString(),
  }
  mockEventLines = [...mockEventLines.filter((item) => item.eventId !== eventId), next]
  return next
}

/** Ошибка проверки звеньев или null, если всё в порядке. */
export function validateEventLinesPayload(
  payload: UpdateEventLinesPayload,
  maxLines: number,
): string | null {
  if (!Array.isArray(payload.lines) || payload.lines.length > maxLines) {
    return `Не больше ${maxLines} звеньев`
  }
  const used = new Set<string>()
  const ids = [
    ...Object.values(payload.goalies ?? {}),
    ...payload.lines.flatMap((line) => Object.values(line.slots ?? {})),
  ].filter((id): id is string => Boolean(id))
  for (const id of ids) {
    if (used.has(id)) return 'Игрок не может стоять в двух местах сразу'
    used.add(id)
  }
  return null
}
