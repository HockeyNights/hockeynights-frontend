/**
 * SPEC-FR-25.6.1, SPEC-FR-25.6.2
 * MSW handlers RSVP на игру команды.
 */

import {http, HttpResponse} from 'msw'

import type {
  EventRsvpStatus,
  UpdateEventLinesPayload,
  UpdateEventRsvpPayload,
} from '@/entities/event'
import {EVENT_LINES_MAX} from '@/entities/event'
import {canManageEventLines} from '@/features/access/lib/teamAccess'
import {
  getMockEventLines,
  updateMockEventLines,
  validateEventLinesPayload,
} from '@/mocks/data/eventLines'
import {getMockEventRsvp, updateMockEventRsvp} from '@/mocks/data/eventRsvp'
import {mockEvents} from '@/mocks/data/events'
import {mockUser} from '@/mocks/data/session'
import {mockRoster} from '@/mocks/data/teams'

/** Участник состава команды события (активный или в запасе) — иначе звенья не показываем. */
function findLinesActor(eventId: string) {
  const event = mockEvents.find((item) => item.id === eventId)
  if (!event?.teamId) return {event: undefined, member: undefined}
  const member = mockRoster.find(
    (item) =>
      item.teamId === event.teamId &&
      item.userId === mockUser.id &&
      (item.rosterStatus === 'active' || item.rosterStatus === 'bench'),
  )
  return {event, member}
}

export const eventHandlers = [
  http.get('/mock-api/v1/events/:eventId/lines', ({params}) => {
    const {event, member} = findLinesActor(params.eventId as string)
    if (!event?.teamId) {
      return HttpResponse.json({message: 'Звенья доступны только у событий команды'}, {status: 404})
    }
    if (!member) {
      return HttpResponse.json({message: 'Звенья видят только участники команды'}, {status: 403})
    }
    return HttpResponse.json(getMockEventLines(event.id, event.teamId))
  }),

  http.put('/mock-api/v1/events/:eventId/lines', async ({params, request}) => {
    const {event, member} = findLinesActor(params.eventId as string)
    if (!event?.teamId) {
      return HttpResponse.json({message: 'Звенья доступны только у событий команды'}, {status: 404})
    }
    if (!member || !canManageEventLines(mockUser.roles, member.teamRole)) {
      return HttpResponse.json({message: 'Настраивать звенья может только тренер'}, {status: 403})
    }
    const body = (await request.json()) as UpdateEventLinesPayload
    const error = validateEventLinesPayload(body, EVENT_LINES_MAX)
    if (error) {
      return HttpResponse.json({message: error}, {status: 400})
    }
    return HttpResponse.json(updateMockEventLines(event.id, event.teamId, body))
  }),

  http.get('/mock-api/v1/events/:eventId/rsvp', ({params}) => {
    const board = getMockEventRsvp(params.eventId as string)
    if (!board) {
      return HttpResponse.json({message: 'RSVP board not found'}, {status: 404})
    }
    return HttpResponse.json(board)
  }),

  http.post('/mock-api/v1/events/:eventId/rsvp', async ({params, request}) => {
    const body = (await request.json()) as UpdateEventRsvpPayload
    const status = body.status as EventRsvpStatus
    if (!['confirmed', 'declined', 'pending'].includes(status)) {
      return HttpResponse.json({message: 'Invalid RSVP status'}, {status: 400})
    }

    const updated = updateMockEventRsvp(
      params.eventId as string,
      mockUser.id,
      status,
      body.declineReason,
    )
    if (!updated) {
      return HttpResponse.json({message: 'RSVP board not found'}, {status: 404})
    }

    const currentPlayer = updated.players.find((player) => player.userId === mockUser.id)
    return HttpResponse.json({
      eventId: updated.eventId,
      userId: mockUser.id,
      status: currentPlayer?.status ?? status,
      declineReason: currentPlayer?.declineReason,
      updatedAt: currentPlayer?.updatedAt ?? new Date().toISOString(),
    })
  }),
]
