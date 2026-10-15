/**
 * HOCFRONT-28F / ORG-3 — список регистраций (mock) в кабинете организатора
 */

import {Text} from '@gravity-ui/uikit'
import {useMemo, useState} from 'react'
import {Link} from 'react-router'

import type {GameEvent} from '@/entities/event'
import {eventDetailsPath} from '@/features/events/lib/eventDetailsPath'
import {collectOrganizerRegistrations} from '@/features/events/lib/organizerWorkspace'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

const STATUS_LABELS = {
  going: 'Записан',
  maybe: 'Лист ожидания',
  not_going: 'Отказался',
} as const

type RegFilter = 'all' | 'going' | 'maybe'

const FILTER_LABELS: Record<RegFilter, string> = {
  all: 'Все',
  going: 'Записаны',
  maybe: 'Ожидание',
}

export interface OrganizerRegistrationsPanelProps {
  events: GameEvent[]
}

export function OrganizerRegistrationsPanel({events}: OrganizerRegistrationsPanelProps) {
  const [filter, setFilter] = useState<RegFilter>('all')
  const rows = useMemo(() => collectOrganizerRegistrations(events), [events])
  const eventById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events])

  const counts = useMemo(() => {
    let going = 0
    let maybe = 0
    for (const row of rows) {
      if (row.status === 'going') going += 1
      if (row.status === 'maybe') maybe += 1
    }
    return {going, maybe, all: rows.length}
  }, [rows])

  const filtered = useMemo(() => {
    if (filter === 'all') return rows
    return rows.filter((row) => row.status === filter)
  }, [rows, filter])

  return (
    <IceCard padding="m" data-testid={testId('events', 'organizer-regs', 'panel')}>
      <div className="org-cab__regs hockey-stack hockey-stack--gap-12">
        <div>
          <Text
            variant="subheader-2"
            data-testid={testId('events', 'organizer-regs', 'text', 'title')}
          >
            Участники и заявки
          </Text>
          <Text color="secondary" data-testid={testId('events', 'organizer-regs', 'text', 'hint')}>
            Записи на ваши тренировки и игры. Примите решение на карточке события (mock inbox).
          </Text>
          <Text
            color="secondary"
            className="hockey-mt-4"
            data-testid={testId('events', 'organizer-regs', 'text', 'stats')}
          >
            Всего {counts.all} · записаны {counts.going} · ожидание {counts.maybe}
          </Text>
        </div>

        <div
          className="hockey-segmented org-cab__filters"
          role="tablist"
          aria-label="Фильтр участников"
          data-testid={testId('events', 'organizer-regs', 'panel', 'filters')}
        >
          {(Object.keys(FILTER_LABELS) as RegFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={filter === item}
              className={`hockey-segmented__item${filter === item ? ' is-active' : ''}`}
              onClick={() => setFilter(item)}
              data-testid={testId('events', 'organizer-regs', 'btn', 'filter', item)}
            >
              {FILTER_LABELS[item]} ({counts[item]})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyNetState
            title="Пока нет записей"
            copy="Когда игроки запишутся, они появятся здесь."
            testIdPrefix="events"
            data-testid={testId('events', 'organizer-regs', 'empty')}
          />
        ) : (
          <div
            className="org-cab__regs-list"
            data-testid={testId('events', 'organizer-regs', 'list')}
          >
            {filtered.map((row) => {
              const event = eventById.get(row.eventId)
              const when = event
                ? new Date(event.startsAt).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : null
              const initial = row.displayName.trim().charAt(0).toUpperCase() || '?'
              return (
                <div
                  key={row.id}
                  className="org-cab__regs-row"
                  data-testid={testId('events', 'organizer-regs', 'row', row.id)}
                >
                  <span className="org-cab__regs-avatar" aria-hidden>
                    {initial}
                  </span>
                  <div className="org-cab__regs-copy">
                    <Text data-testid={testId('events', 'organizer-regs', 'text', 'name', row.id)}>
                      {row.displayName}
                    </Text>
                    <Text
                      color="secondary"
                      data-testid={testId('events', 'organizer-regs', 'text', 'meta', row.id)}
                    >
                      {row.eventTitle}
                      {when ? ` · ${when}` : ''} · {STATUS_LABELS[row.status]}
                    </Text>
                  </div>
                  <div className="org-cab__regs-actions">
                    <Link
                      to={`/players/${row.userId}`}
                      data-testid={testId('events', 'organizer-regs', 'link', 'player', row.id)}
                    >
                      <HockeyButton
                        view="flat"
                        size="s"
                        data-testid={testId('events', 'organizer-regs', 'btn', 'player', row.id)}
                      >
                        Профиль
                      </HockeyButton>
                    </Link>
                    {event ? (
                      <Link
                        to={eventDetailsPath(event)}
                        data-testid={testId('events', 'organizer-regs', 'link', 'event', row.id)}
                      >
                        <HockeyButton
                          view="outlined"
                          size="s"
                          data-testid={testId('events', 'organizer-regs', 'btn', 'event', row.id)}
                        >
                          К событию
                        </HockeyButton>
                      </Link>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </IceCard>
  )
}
