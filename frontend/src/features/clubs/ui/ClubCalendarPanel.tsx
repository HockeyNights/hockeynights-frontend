/**
 * HOCFRONT-25 — календарь клуба в кабинете: ближайшие события + полный список
 */

import {useState} from 'react'
import {Link} from 'react-router'

import type {GameEvent} from '@/entities/event'
import {EVENT_TYPE_LABELS, eventDetailsPath, eventNeedsGoalie} from '@/features/events'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {SectionHeading} from '@/shared/ui/SectionHeading'

export interface ClubCalendarPanelProps {
  clubId: string
  events: GameEvent[]
}

const PREVIEW_LIMIT = 5

function formatWhen(startsAt: string): string {
  return new Date(startsAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ClubCalendarPanel({clubId, events}: ClubCalendarPanelProps) {
  const [nowMs] = useState(() => Date.now())
  const sorted = [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  const upcoming = sorted
    .filter((event) => new Date(event.endsAt).getTime() >= nowMs)
    .slice(0, PREVIEW_LIMIT)
  const openHref = `${routes.calendar}?${new URLSearchParams({
    view: 'agenda',
    scope: 'club',
    scopeId: clubId,
  }).toString()}`

  return (
    <section className="club-hq__section" data-testid={testId('clubs', 'calendar', 'panel')}>
      <SectionHeading
        title="Календарь клуба"
        extra={
          <Link to={openHref} data-testid={testId('clubs', 'schedule-preview', 'link', 'open')}>
            <HockeyButton
              view="outlined"
              size="m"
              data-testid={testId('clubs', 'schedule-preview', 'btn', 'open')}
            >
              Открыть календарь
            </HockeyButton>
          </Link>
        }
        data-testid={testId('clubs', 'schedule-preview', 'text', 'title')}
      />
      <div className="club-hq__card club-hq__calendar">
        {upcoming.length > 0 ? (
          <ul className="club-hq__agenda" data-testid={testId('clubs', 'schedule-preview', 'list')}>
            {upcoming.map((event) => (
              <li
                key={event.id}
                className={`club-hq__agenda-row club-hq__agenda-row--${event.type}`}
                data-testid={testId('clubs', 'schedule-preview', 'row', event.id)}
              >
                <strong>{formatWhen(event.startsAt)}</strong>
                <span className="club-hq__agenda-type">
                  · {EVENT_TYPE_LABELS[event.type] ?? event.type} ·
                </span>
                <span>{event.title}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {sorted.length === 0 ? (
          <p className="club-hq__empty" data-testid={testId('clubs', 'calendar', 'empty')}>
            В календаре клуба пока нет событий
          </p>
        ) : (
          <ul className="club-hq__calendar-list" data-testid={testId('clubs', 'calendar', 'list')}>
            {sorted.map((event) => (
              <li
                key={event.id}
                className="club-hq__calendar-row"
                data-testid={testId('clubs', 'calendar', 'row', event.id)}
              >
                <Link
                  to={eventDetailsPath(event)}
                  className="club-hq__calendar-title"
                  data-testid={testId('clubs', 'calendar', 'link', event.id)}
                >
                  <span data-testid={testId('clubs', 'calendar', 'text', 'title', event.id)}>
                    {event.title}
                  </span>
                </Link>
                <span
                  className="club-hq__calendar-meta"
                  data-testid={testId('clubs', 'calendar', 'text', 'meta', event.id)}
                >
                  {formatWhen(event.startsAt)} · {EVENT_TYPE_LABELS[event.type] ?? event.type}
                  {eventNeedsGoalie(event) ? (
                    <span className="club-hq__calendar-need">нужен вратарь</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
