/**
 * HOCFRONT-28F / ORG-2-3 — список тренировок в кабинете организатора
 * Карточки как в фиде событий: время, бейджи, площадка, действия.
 */

import {MapPin} from '@gravity-ui/icons'
import {Icon, Text} from '@gravity-ui/uikit'
import {useMemo, useState} from 'react'
import {Link} from 'react-router'

import type {GameEvent} from '@/entities/event'
import {countOpenSlots, formatEventPriceRub} from '@/features/events/lib/eventCardMeta'
import {
  eventCopyCreatePath,
  eventDetailsPath,
  eventEditPath,
} from '@/features/events/lib/eventDetailsPath'
import {ACCESS_LABELS, EVENT_TYPE_LABELS} from '@/features/events/lib/eventLabels'
import {
  countOrganizerStatuses,
  eventDeficitSummary,
  eventFillPercent,
  filterOrganizerEvents,
  ORGANIZER_FILTER_LABELS,
  ORGANIZER_FILTERS,
  ORGANIZER_STATUS_LABELS,
  type OrganizerEventFilter,
  type OrganizerEventStatus,
  resolveOrganizerEventStatus,
} from '@/features/events/lib/organizerWorkspace'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

export interface OrganizerTrainingsPanelProps {
  /** Уже отфильтрованные и отсортированные события организатора. */
  events: GameEvent[]
}

const ACCESS_BADGE: Record<NonNullable<GameEvent['accessScope']>, string> = {
  club_only: 'Для клуба',
  private_club: 'Для клуба',
  limited: 'По приглашению',
  public: 'Публичная',
  public_open: 'Публичная',
}

const STATUS_BADGE: Record<OrganizerEventStatus, {label: string; tone: string}> = {
  open: {label: 'Набор открыт', tone: 'hockey-badge--green'},
  full: {label: 'Заполнена', tone: 'hockey-badge--muted'},
  draft: {label: 'Черновик', tone: 'hockey-badge--muted'},
  past: {label: 'Прошедшая', tone: 'hockey-badge--muted'},
  cancelled: {label: 'Отменена', tone: 'hockey-badge--red'},
}

function OrganizerEventCard({event}: {event: GameEvent}) {
  const status = resolveOrganizerEventStatus(event)
  const href = eventDetailsPath(event)
  const access = event.accessScope
  const start = new Date(event.startsAt)
  const time = start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})
  const fill = eventFillPercent(event)
  const slots = countOpenSlots(event)
  const place = [
    event.arenaName ?? event.arenaId,
    event.district,
    formatEventPriceRub(event.pricePerPlayer),
  ]
    .filter(Boolean)
    .join(' · ')
  const statusBadge = STATUS_BADGE[status]
  const isFull = status === 'full' || event.registrationStatus === 'full'

  return (
    <article
      className="org-cab__event"
      data-testid={testId('events', 'organizer', 'row', event.id)}
    >
      <div className="org-cab__event-head">
        <span
          className="org-cab__event-time"
          data-testid={testId('events', 'organizer', 'text', 'time', event.id)}
        >
          {time}
        </span>
        <span className="org-cab__event-badges">
          {access ? (
            <span
              className="hockey-badge hockey-badge--gold"
              data-testid={testId('events', 'organizer', 'badge', 'access', event.id)}
            >
              {ACCESS_BADGE[access] ?? ACCESS_LABELS[access]}
            </span>
          ) : null}
          <span
            className={`hockey-badge${event.type === 'game' ? ' hockey-badge--red' : ''}`}
            data-testid={testId('events', 'organizer', 'badge', 'type', event.id)}
          >
            {EVENT_TYPE_LABELS[event.type] ?? event.type}
          </span>
          <span
            className={`hockey-badge ${statusBadge.tone}`}
            data-testid={testId('events', 'organizer', 'badge', 'status', event.id)}
          >
            {statusBadge.label}
          </span>
        </span>
      </div>

      <div
        className="org-cab__event-title"
        data-testid={testId('events', 'organizer', 'text', 'name', event.id)}
      >
        {event.title}
      </div>

      {place ? (
        <div
          className="org-cab__event-place"
          data-testid={testId('events', 'organizer', 'text', 'place', event.id)}
        >
          <Icon data={MapPin} size={16} />
          <span>{place}</span>
        </div>
      ) : null}

      <div
        className="org-cab__event-meta"
        data-testid={testId('events', 'organizer', 'text', 'meta', event.id)}
      >
        <span data-testid={testId('events', 'organizer', 'text', 'status', event.id)}>
          {ORGANIZER_STATUS_LABELS[status]}
        </span>
        {' · '}
        <span data-testid={testId('events', 'organizer', 'text', 'fill', event.id)}>
          Заполнено {fill}% ({slots.total - slots.open}/{slots.total}) ·{' '}
          {eventDeficitSummary(event)}
        </span>
      </div>

      {isFull ? <p className="org-cab__event-note">Мест нет</p> : null}

      <div className="org-cab__event-actions">
        <Link to={href} data-testid={testId('events', 'organizer', 'link', 'open', event.id)}>
          <HockeyButton
            view="action"
            size="m"
            data-testid={testId('events', 'organizer', 'btn', 'open', event.id)}
          >
            Открыть
          </HockeyButton>
        </Link>
        {event.type === 'training' ? (
          <Link
            to={eventEditPath(event)}
            data-testid={testId('events', 'organizer', 'link', 'edit', event.id)}
          >
            <HockeyButton
              view="outlined"
              size="m"
              data-testid={testId('events', 'organizer', 'btn', 'edit', event.id)}
            >
              Редактировать
            </HockeyButton>
          </Link>
        ) : null}
        <Link
          to={eventCopyCreatePath(event)}
          data-testid={testId('events', 'organizer', 'link', 'copy', event.id)}
        >
          <HockeyButton
            view="outlined"
            size="m"
            data-testid={testId('events', 'organizer', 'btn', 'copy', event.id)}
          >
            Создать похожую
          </HockeyButton>
        </Link>
      </div>
    </article>
  )
}

export function OrganizerTrainingsPanel({events}: OrganizerTrainingsPanelProps) {
  const [filter, setFilter] = useState<OrganizerEventFilter>('all')

  const counts = useMemo(() => countOrganizerStatuses(events), [events])
  const filtered = useMemo(() => filterOrganizerEvents(events, filter), [events, filter])

  return (
    <IceCard padding="m" data-testid={testId('events', 'organizer', 'card')}>
      <div className="org-cab__trainings hockey-stack hockey-stack--gap-12">
        <div>
          <Text variant="subheader-2" data-testid={testId('events', 'organizer', 'text', 'title')}>
            Мои тренировки и игры
          </Text>
          <Text color="secondary" data-testid={testId('events', 'organizer', 'text', 'hint')}>
            Статусы, заполненность состава и быстрые действия.
          </Text>
          <Text
            color="secondary"
            className="hockey-mt-4"
            data-testid={testId('events', 'organizer', 'text', 'stats')}
          >
            Набор {counts.open} · заполнены {counts.full} · черновики {counts.draft} · прошедшие{' '}
            {counts.past}
            {counts.cancelled > 0 ? ` · отменены ${counts.cancelled}` : ''}
          </Text>
        </div>

        <div
          className="hockey-segmented org-cab__filters"
          role="tablist"
          aria-label="Фильтр тренировок"
          data-testid={testId('events', 'organizer', 'panel', 'filters')}
        >
          {ORGANIZER_FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={filter === item}
              className={`hockey-segmented__item${filter === item ? ' is-active' : ''}`}
              onClick={() => setFilter(item)}
              data-testid={testId('events', 'organizer', 'btn', 'filter', item)}
            >
              {ORGANIZER_FILTER_LABELS[item]}
              {item !== 'all' ? ` (${counts[item]})` : ` (${events.length})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyNetState
            title="Нет событий в этом фильтре"
            copy="Создайте тренировку или смените фильтр."
            testIdPrefix="events"
            data-testid={testId('events', 'organizer', 'empty')}
          />
        ) : (
          <div className="org-cab__event-list" data-testid={testId('events', 'organizer', 'list')}>
            {filtered.map((event) => (
              <OrganizerEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </IceCard>
  )
}
