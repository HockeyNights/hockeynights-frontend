/**
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.1.2, SPEC-FR-4.2.1, SPEC-FR-4.3.1
 */

import type {AttendanceStatus} from '@/entities/common'
import type {EventRsvpBoard, EventRsvpStatus, UpdateEventRsvpPayload} from '@/entities/event/model'
import type {
  CalendarFilters,
  CreateEventPayload,
  EventLines,
  GameEvent,
  RosterStatus,
  UpdateEventLinesPayload,
  UpdateEventPayload,
} from '@/entities/event/model'
import {apiRequest} from '@/shared/api/client'

/**
 * @spec SPEC-FR-4.1.1 - Список событий
 */
export function fetchEvents(): Promise<GameEvent[]> {
  return apiRequest<GameEvent[]>('/events')
}

/** Получить одно событие по id. */
export function fetchEventById(eventId: string): Promise<GameEvent> {
  return apiRequest<GameEvent>(`/events/${eventId}`)
}

/**
 * @spec SPEC-FR-4.1.1 - Создать событие
 */
export function createEvent(payload: CreateEventPayload): Promise<GameEvent> {
  return apiRequest<GameEvent>('/events', {method: 'POST', body: payload})
}

/** HOCFRONT-28G — обновить событие */
export function updateEvent(eventId: string, payload: UpdateEventPayload): Promise<GameEvent> {
  return apiRequest<GameEvent>(`/events/${eventId}`, {method: 'PATCH', body: payload})
}

/**
 * @spec SPEC-FR-4.2.1 - Календарь пользователя
 * @spec SPEC-FR-4.2.2 - Фильтры календаря
 */
export function fetchCalendar(filters: CalendarFilters = {}): Promise<GameEvent[]> {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.attendanceStatus) params.set('attendanceStatus', filters.attendanceStatus)
  const query = params.toString()
  return apiRequest<GameEvent[]>(`/calendar${query ? `?${query}` : ''}`)
}

/**
 * @spec SPEC-FR-25.6.1 - RSVP состава на игру
 */
export function fetchEventRsvp(eventId: string): Promise<EventRsvpBoard> {
  return apiRequest<EventRsvpBoard>(`/events/${eventId}/rsvp`)
}

/**
 * @spec SPEC-FR-25.6.2 - Обновить RSVP текущего игрока
 */
export function updateEventRsvp(
  eventId: string,
  payload: UpdateEventRsvpPayload,
): Promise<{
  eventId: string
  userId: string
  status: EventRsvpStatus
  declineReason?: string
  updatedAt: string
}> {
  return apiRequest(`/events/${eventId}/rsvp`, {method: 'POST', body: payload})
}

/**
 * @spec SPEC-FR-3.3.1 - Обновить посещаемость
 */
export function updateAttendance(
  eventId: string,
  status: AttendanceStatus,
  displayName?: string,
): Promise<GameEvent> {
  return apiRequest<GameEvent>(`/events/${eventId}/attendance`, {
    method: 'PATCH',
    body: {status, displayName},
  })
}

/** Звенья (пятёрки) на событие команды — видят участники команды. */
export function fetchEventLines(eventId: string): Promise<EventLines> {
  return apiRequest<EventLines>(`/events/${eventId}/lines`)
}

/** Сохранить звенья события — только тренер команды. */
export function updateEventLines(
  eventId: string,
  payload: UpdateEventLinesPayload,
): Promise<EventLines> {
  return apiRequest<EventLines>(`/events/${eventId}/lines`, {method: 'PUT', body: payload})
}

/**
 * @spec SPEC-FR-4.3.1 - Получить дефицит состава
 */
export function fetchRosterStatus(eventId: string): Promise<RosterStatus> {
  return apiRequest<RosterStatus>(`/events/${eventId}/roster-status`)
}
