/**
 * HOCFRONT-28CAL-B — статус участия текущего пользователя для карточек календаря
 */

import {useQuery} from '@tanstack/react-query'

import type {AttendanceStatus} from '@/entities/common'
import type {GameEvent} from '@/entities/event'
import {fetchEventRsvp} from '@/entities/event'
import {registrationStatusLabel, teamRsvpStatusLabel} from '@/features/events'

export type CalendarStatusTone = 'going' | 'wait' | 'need' | 'open'

export interface CalendarEventStatus {
  myAttendance?: AttendanceStatus
  statusLabel: string
  statusTone: CalendarStatusTone
  goalieOpen: boolean
}

export const CALENDAR_STATUS_BADGE: Record<CalendarStatusTone, string> = {
  going: 'hockey-badge--green',
  wait: 'hockey-badge--gold',
  need: 'hockey-badge--muted',
  open: 'hockey-badge--muted',
}

export const CALENDAR_TYPE_BADGE: Record<string, string> = {
  game: 'hockey-badge--red',
  training: '',
  open_ice: 'hockey-badge--gold',
}

export function useCalendarEventStatus(
  event: GameEvent,
  currentUserId: string,
): CalendarEventStatus {
  const myAttendance = event.participation.find((entry) => entry.userId === currentUserId)?.status
  const {data: rsvpBoard} = useQuery({
    queryKey: ['event-rsvp', event.id],
    queryFn: () => fetchEventRsvp(event.id),
    enabled: Boolean(event.hasTeamRsvp),
  })
  const myRsvp = rsvpBoard?.players.find((player) => player.userId === currentUserId)
  const goalieOpen = event.requiredSlots.some(
    (slot) => slot.position === 'goalie' && slot.filledCount < slot.count,
  )

  const statusLabel = event.hasTeamRsvp
    ? rsvpBoard
      ? teamRsvpStatusLabel(myRsvp?.status, myRsvp?.declineReason)
      : 'Загрузка…'
    : registrationStatusLabel(myAttendance, event.registrationStatus)

  const statusTone: CalendarStatusTone = event.hasTeamRsvp
    ? myRsvp?.status === 'confirmed'
      ? 'going'
      : myRsvp?.status === 'declined'
        ? 'need'
        : 'wait'
    : myAttendance === 'going'
      ? 'going'
      : myAttendance === 'maybe'
        ? 'wait'
        : goalieOpen
          ? 'need'
          : 'open'

  return {myAttendance, statusLabel, statusTone, goalieOpen}
}

export function isClubOnlyEvent(event: GameEvent): boolean {
  return event.accessScope === 'club_only' || event.accessScope === 'private_club'
}
