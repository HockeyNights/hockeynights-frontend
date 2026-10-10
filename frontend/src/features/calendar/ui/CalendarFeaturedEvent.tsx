/**
 * HOCFRONT-28CAL-B — карточка ближайшего события под сеткой месяца
 */

import {Link} from 'react-router'

import type {GameEvent} from '@/entities/event'
import {eventDetailsPath} from '@/features/events'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

import {formatEventTime} from '../lib/calendarDays'
import {downloadEventIcs} from '../lib/icsExport'
import {useCalendarEventStatus} from '../lib/useCalendarEventStatus'
import {CalendarEventBadges, CalendarEventPlace} from './CalendarEventParts'

export interface CalendarFeaturedEventProps {
  event: GameEvent
  currentUserId: string
  /** Событие не в выбранный день — показываем дату рядом со временем */
  showDate?: boolean
}

export function CalendarFeaturedEvent({
  event,
  currentUserId,
  showDate,
}: CalendarFeaturedEventProps) {
  const {time, date} = formatEventTime(event.startsAt)
  const {statusLabel, statusTone} = useCalendarEventStatus(event, currentUserId)
  const detailsPath = eventDetailsPath(event)

  return (
    <article
      className="hockey-calendar-featured"
      data-testid={testId('calendar', 'featured', 'card', event.id)}
    >
      <div className="hockey-calendar-event__top">
        <div
          className="hockey-calendar-event__time"
          data-testid={testId('calendar', 'featured', 'text', 'time', event.id)}
        >
          <span className="hockey-calendar-event__clock hockey-calendar-event__clock--s">
            {time}
          </span>
          {showDate && <span className="hockey-calendar-event__date">{date}</span>}
        </div>
        <CalendarEventBadges
          event={event}
          statusLabel={statusLabel}
          statusTone={statusTone}
          scope="featured"
        />
      </div>

      <div className="hockey-calendar-event__body">
        <Link
          to={detailsPath}
          className="hockey-calendar-event__title-link"
          data-testid={testId('calendar', 'featured', 'link', 'event', event.id)}
        >
          <span className="hockey-calendar-event__title">{event.title}</span>
        </Link>
        <CalendarEventPlace event={event} scope="featured" />
      </div>

      <div className="hockey-calendar-featured__actions">
        <HockeyButton
          view="action"
          size="xl"
          onClick={() => downloadEventIcs(event)}
          data-testid={testId('calendar', 'featured', 'btn', 'ics', event.id)}
        >
          В календарь
        </HockeyButton>
        <Link
          to={detailsPath}
          className="hockey-calendar-featured__details"
          data-testid={testId('calendar', 'featured', 'link', 'details', event.id)}
        >
          <HockeyButton
            view="outlined"
            size="xl"
            width="max"
            data-testid={testId('calendar', 'featured', 'btn', 'details', event.id)}
          >
            Подробнее
          </HockeyButton>
        </Link>
      </div>
    </article>
  )
}
