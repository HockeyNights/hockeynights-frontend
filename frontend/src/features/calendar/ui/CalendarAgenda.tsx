/**
 * HOCFRONT-28CAL-B/C — agenda выбранного дня + CTA
 */

import {Calendar} from '@gravity-ui/icons'
import {Text} from '@gravity-ui/uikit'
import {Link} from 'react-router'

import type {GameEvent} from '@/entities/event'
import {eventDetailsPath, TrainingRegistrationControl} from '@/features/events'
import {TeamRsvpResponseControl} from '@/features/radar'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {SectionHeading} from '@/shared/ui/SectionHeading'

import {eventDateKey, formatEventTime, groupEventsByDay} from '../lib/calendarDays'
import {parseDateKey} from '../lib/calendarState'
import {downloadEventIcs} from '../lib/icsExport'
import {eventFillRatio} from '../lib/loadCalendarEvents'
import {useCalendarEventStatus} from '../lib/useCalendarEventStatus'
import {CalendarEventBadges, CalendarEventPlace} from './CalendarEventParts'

export interface CalendarAgendaProps {
  selectedDate: string
  events: GameEvent[]
  currentUserId: string
  showActions?: boolean
  showOrganizerMeta?: boolean
}

export function CalendarAgenda({
  selectedDate,
  events,
  currentUserId,
  showActions = true,
  showOrganizerMeta = false,
}: CalendarAgendaProps) {
  const byDay = groupEventsByDay(events)
  const dayEvents = byDay.get(selectedDate) ?? []
  const parsed = parseDateKey(selectedDate)
  const dayLabel = parsed
    ? parsed.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : selectedDate

  const upcoming = events.filter((event) => eventDateKey(event.startsAt) > selectedDate).slice(0, 8)

  return (
    <div className="hockey-calendar-agenda" data-testid={testId('calendar', 'agenda', 'panel')}>
      <div className="hockey-calendar-agenda__section">
        <SectionHeading
          title={
            <span data-testid={testId('calendar', 'agenda', 'text', 'day-title')}>{dayLabel}</span>
          }
          extra={
            dayEvents.length > 0 ? (
              <Text
                color="secondary"
                className="hockey-calendar-agenda__count"
                data-testid={testId('calendar', 'agenda', 'text', 'day-count')}
              >
                {`${dayEvents.length} ${dayEvents.length === 1 ? 'событие' : 'события'}`}
              </Text>
            ) : undefined
          }
        />

        {dayEvents.length === 0 ? (
          <div
            className="hockey-calendar-agenda__empty"
            data-testid={testId('calendar', 'agenda', 'empty', 'day')}
          >
            <span className="hockey-empty-tile" aria-hidden>
              <Calendar width={32} height={32} />
            </span>
            <span className="hockey-calendar-agenda__empty-title">Событий пока нет</span>
            <span className="hockey-calendar-agenda__empty-copy">
              Ближайшие игры и тренировки появятся здесь.
            </span>
          </div>
        ) : (
          <div
            className="hockey-calendar-agenda__list"
            data-testid={testId('calendar', 'agenda', 'list', 'day')}
          >
            {dayEvents.map((event) => (
              <AgendaEventCard
                key={event.id}
                event={event}
                currentUserId={currentUserId}
                showActions={showActions}
                showOrganizerMeta={showOrganizerMeta}
              />
            ))}
          </div>
        )}
      </div>

      {upcoming.length > 0 && (
        <div
          className="hockey-calendar-agenda__section"
          data-testid={testId('calendar', 'agenda', 'panel', 'upcoming')}
        >
          <SectionHeading
            title={
              <span data-testid={testId('calendar', 'agenda', 'text', 'upcoming-title')}>
                Дальше
              </span>
            }
          />
          <div
            className="hockey-calendar-agenda__list"
            data-testid={testId('calendar', 'agenda', 'list', 'upcoming')}
          >
            {upcoming.map((event) => (
              <AgendaEventCard
                key={event.id}
                event={event}
                currentUserId={currentUserId}
                showActions={showActions}
                showOrganizerMeta={showOrganizerMeta}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AgendaEventCard({
  event,
  currentUserId,
  showActions,
  showOrganizerMeta,
}: {
  event: GameEvent
  currentUserId: string
  showActions: boolean
  showOrganizerMeta: boolean
}) {
  const {time, date} = formatEventTime(event.startsAt)
  const {myAttendance, statusLabel, statusTone, goalieOpen} = useCalendarEventStatus(
    event,
    currentUserId,
  )
  const detailsPath = eventDetailsPath(event)
  const fillPercent = Math.round(eventFillRatio(event) * 100)

  return (
    <article
      className={`hockey-calendar-event hockey-calendar-event--${event.type}`}
      data-testid={testId('calendar', 'agenda', 'card', event.id)}
    >
      <div className="hockey-calendar-event__top">
        <div
          className="hockey-calendar-event__time"
          data-testid={testId('calendar', 'agenda', 'text', 'time', event.id)}
        >
          <span className="hockey-calendar-event__clock">{time}</span>
          <span className="hockey-calendar-event__date">{date}</span>
        </div>
        <CalendarEventBadges
          event={event}
          statusLabel={statusLabel}
          statusTone={statusTone}
          scope="agenda"
        />
      </div>

      <div className="hockey-calendar-event__body">
        <Link
          to={detailsPath}
          className="hockey-calendar-event__title-link"
          data-testid={testId('calendar', 'agenda', 'link', 'event', event.id)}
        >
          <span
            className="hockey-calendar-event__title"
            data-testid={testId('calendar', 'agenda', 'text', 'title', event.id)}
          >
            {event.title}
          </span>
        </Link>

        <CalendarEventPlace event={event} scope="agenda" />

        {showOrganizerMeta && (
          <span
            className="hockey-calendar-event__note"
            data-testid={testId('calendar', 'agenda', 'text', 'fill', event.id)}
          >
            Заполненность {fillPercent}%{goalieOpen ? ' · нужен вратарь' : ''}
          </span>
        )}
      </div>

      <div className="hockey-calendar-event__actions">
        {showActions && (
          <div className="hockey-calendar-event__primary">
            {event.hasTeamRsvp ? (
              <TeamRsvpResponseControl eventId={event.id} currentUserId={currentUserId} />
            ) : (
              <TrainingRegistrationControl
                eventId={event.id}
                eventType={event.type}
                currentStatus={myAttendance}
                registrationStatus={event.registrationStatus}
                currentUserId={currentUserId}
                compact
              />
            )}
          </div>
        )}
        <HockeyButton
          view="flat"
          size="m"
          onClick={() => downloadEventIcs(event)}
          data-testid={testId('calendar', 'agenda', 'btn', 'ics', event.id)}
        >
          В календарь
        </HockeyButton>
        <Link
          to={detailsPath}
          data-testid={testId('calendar', 'agenda', 'link', 'details', event.id)}
        >
          <HockeyButton
            view="outlined"
            size="m"
            data-testid={testId('calendar', 'agenda', 'btn', 'details', event.id)}
          >
            Подробнее
          </HockeyButton>
        </Link>
      </div>
    </article>
  )
}
