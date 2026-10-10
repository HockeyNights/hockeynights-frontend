/**
 * HOCFRONT-28CAL-B — общие части карточек события календаря
 */

import {MapPin} from '@gravity-ui/icons'

import type {GameEvent} from '@/entities/event'
import {EVENT_TYPE_LABELS, formatEventPriceRub} from '@/features/events'
import {testId} from '@/shared/testing/testId'

import {
  CALENDAR_STATUS_BADGE,
  CALENDAR_TYPE_BADGE,
  type CalendarStatusTone,
  isClubOnlyEvent,
} from '../lib/useCalendarEventStatus'

export function CalendarEventBadges({
  event,
  statusLabel,
  statusTone,
  scope,
}: {
  event: GameEvent
  statusLabel: string
  statusTone: CalendarStatusTone
  scope: 'agenda' | 'featured'
}) {
  return (
    <div className="hockey-calendar-event__badges">
      {isClubOnlyEvent(event) && (
        <span
          className="hockey-badge hockey-badge--gold"
          data-testid={testId('calendar', scope, 'badge', 'access', event.id)}
        >
          Для клуба
        </span>
      )}
      <span
        className={`hockey-badge ${CALENDAR_TYPE_BADGE[event.type] ?? ''}`}
        data-testid={testId('calendar', scope, 'badge', 'type', event.id)}
      >
        {EVENT_TYPE_LABELS[event.type] ?? event.type}
      </span>
      <span
        className={`hockey-badge ${CALENDAR_STATUS_BADGE[statusTone]}`}
        data-testid={testId('calendar', scope, 'text', 'status', event.id)}
      >
        {statusLabel}
      </span>
    </div>
  )
}

export function CalendarEventPlace({
  event,
  scope,
}: {
  event: GameEvent
  scope: 'agenda' | 'featured'
}) {
  return (
    <div
      className="hockey-calendar-event__meta"
      data-testid={testId('calendar', scope, 'text', 'meta', event.id)}
    >
      <MapPin className="hockey-calendar-event__pin" width={14} height={14} aria-hidden />
      <span>
        {event.arenaName ?? event.arenaId}
        {event.district ? ` · ${event.district}` : ''}
        {` · ${formatEventPriceRub(event.pricePerPlayer)}`}
      </span>
    </div>
  )
}
