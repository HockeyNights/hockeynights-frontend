/**
 * HOCFRONT-25 / HOCFRONT-28CAL-E — календарь команды / клуба
 */

import {Text} from '@gravity-ui/uikit'
import {Link} from 'react-router'

import type {GameEvent} from '@/entities/event'
import {CalendarScopePreview} from '@/features/calendar'
import {EVENT_TYPE_LABELS, eventDetailsPath, eventNeedsGoalie} from '@/features/events'
import {testId} from '@/shared/testing/testId'

export interface TeamCalendarSectionProps {
  events: GameEvent[]
  emptyText?: string
  testIdPrefix?: string
  scope?: 'team' | 'club'
  scopeId?: string
}

/** HOCFRONT-28CAL-E — preview + список с badge дефицита вратаря */
export function TeamCalendarSection({
  events,
  emptyText = 'Событий пока нет',
  testIdPrefix = 'teams',
  scope = 'team',
  scopeId,
}: TeamCalendarSectionProps) {
  return (
    <div
      className="hockey-stack hockey-stack--gap-12"
      data-testid={testId(testIdPrefix, 'calendar', 'panel')}
    >
      {scopeId && (
        <CalendarScopePreview
          scope={scope}
          scopeId={scopeId}
          title={scope === 'club' ? 'Календарь клуба' : 'Календарь команды'}
          limit={5}
          testIdPrefix={testIdPrefix}
        />
      )}

      {events.length === 0 ? (
        <Text color="secondary" data-testid={testId(testIdPrefix, 'calendar', 'empty')}>
          {emptyText}
        </Text>
      ) : (
        <ul
          className="hockey-stack hockey-stack--gap-8 team-calendar-section"
          data-testid={testId(testIdPrefix, 'calendar', 'list')}
        >
          {events.map((event) => {
            const dateLabel = new Date(event.startsAt).toLocaleString('ru-RU', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
            const typeLabel = EVENT_TYPE_LABELS[event.type] ?? event.type
            const needsGoalie = eventNeedsGoalie(event)

            return (
              <li
                key={event.id}
                className="team-calendar-section__row"
                data-testid={testId(testIdPrefix, 'calendar', 'row', event.id)}
              >
                <div className="hockey-stack hockey-stack--gap-4">
                  <Link
                    to={eventDetailsPath(event)}
                    data-testid={testId(testIdPrefix, 'calendar', 'link', event.id)}
                  >
                    <Text
                      variant="subheader-2"
                      data-testid={testId(testIdPrefix, 'calendar', 'text', 'title', event.id)}
                    >
                      {event.title}
                    </Text>
                  </Link>
                  <Text
                    color="secondary"
                    data-testid={testId(testIdPrefix, 'calendar', 'text', 'meta', event.id)}
                  >
                    {dateLabel} · {typeLabel}
                    {needsGoalie && (
                      <span className="team-calendar-section__need">
                        <span aria-hidden> · </span>нужен вратарь
                      </span>
                    )}
                  </Text>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
