/**
 * Блоки деталки тренировки/игры по макету: плитки «Время и дата» / «Стоимость»,
 * список фактов, слоты с прогрессом, контакты организатора.
 */

/* Хелперы формата даты рядом с UI-блоками — один модуль деталки. */
/* eslint-disable react-refresh/only-export-components */

import {CircleCheck, Person} from '@gravity-ui/icons'
import {Icon, Text} from '@gravity-ui/uikit'
import type {ReactNode} from 'react'
import {Link} from 'react-router'

import type {PlayerPosition} from '@/entities/common'
import type {GameEvent} from '@/entities/event'
import {POSITION_LABELS} from '@/features/events/lib/eventLabels'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {PositionLabel} from '@/shared/ui/PositionLabel'

export type EventDetailsSection = 'training-page' | 'game-page'

type Tone = 'accent' | 'teal' | 'green' | 'red' | 'muted'

export function formatEventTimeRange(startsAt: string, endsAt: string): string {
  const options: Intl.DateTimeFormatOptions = {hour: '2-digit', minute: '2-digit'}
  const start = new Date(startsAt).toLocaleTimeString('ru-RU', options)
  const end = new Date(endsAt).toLocaleTimeString('ru-RU', options)
  return `${start} – ${end}`
}

export function formatEventLongDate(startsAt: string): string {
  return new Date(startsAt)
    .toLocaleDateString('ru-RU', {day: 'numeric', month: 'long', year: 'numeric'})
    .replace(/\s?г\.$/, '')
}

export function EventStatTile({
  label,
  value,
  hint,
  tone = 'accent',
  'data-testid': dataTestId,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: Tone
  'data-testid'?: string
}) {
  return (
    <div className="event-details__tile" data-testid={dataTestId}>
      <span className="event-details__tile-label">{label}</span>
      <span className={`event-details__tile-value event-details__tone--${tone}`}>{value}</span>
      {hint ? <span className="event-details__tile-hint">{hint}</span> : null}
    </div>
  )
}

export function EventFactRow({
  label,
  children,
  hint,
  'data-testid': dataTestId,
}: {
  label: string
  children: ReactNode
  hint?: ReactNode
  'data-testid'?: string
}) {
  return (
    <div className="event-details__fact" data-testid={dataTestId}>
      <span className="event-details__fact-label">{label}</span>
      <span className="event-details__fact-value">
        <span className="event-details__fact-main">{children}</span>
        {hint ? <span className="event-details__fact-hint">{hint}</span> : null}
      </span>
    </div>
  )
}

export function EventStatusPill({tone, children}: {tone: Tone; children: ReactNode}) {
  return <span className={`event-details__pill event-details__tone--${tone}`}>{children}</span>
}

const SLOT_TITLES: Partial<Record<PlayerPosition, string>> = {
  forward: 'Нападение / Полевые',
}

/** Слоты по амплуа с прогрессом и список записавшихся. */
export function EventSlotsCard({
  event,
  section,
  currentUserId,
  resolveName,
}: {
  event: GameEvent
  section: EventDetailsSection
  currentUserId?: string
  resolveName: (userId: string) => string
}) {
  const participants = event.participation.filter(
    (item) => item.status === 'going' || item.status === 'maybe',
  )

  return (
    <IceCard padding="l" className="event-details__slots">
      <div
        className="event-details__slots-list"
        data-testid={testId('events', section, 'panel', 'slots', event.id)}
      >
        {event.requiredSlots.map((slot) => {
          const open = Math.max(slot.count - slot.filledCount, 0)
          const percent = slot.count > 0 ? Math.min((slot.filledCount / slot.count) * 100, 100) : 0
          const isEmpty = slot.filledCount === 0
          return (
            <div
              key={slot.position}
              className="event-details__slot"
              data-testid={testId('events', section, 'text', 'slot', event.id, slot.position)}
            >
              <div className="event-details__slot-head">
                <span className="event-details__slot-name">
                  <PositionLabel position={slot.position} testIdPrefix="events" />
                  <span>{SLOT_TITLES[slot.position] ?? POSITION_LABELS[slot.position]}</span>
                </span>
                <span className="event-details__slot-count">
                  <span className={isEmpty ? undefined : 'event-details__tone--accent'}>
                    {slot.filledCount} / {slot.count}
                  </span>
                  {open === 0 ? (
                    <EventStatusPill tone="muted">Укомплектовано</EventStatusPill>
                  ) : isEmpty ? (
                    <EventStatusPill tone="red">Нужен {open}</EventStatusPill>
                  ) : (
                    <EventStatusPill tone="green">Свободно {open}</EventStatusPill>
                  )}
                </span>
              </div>
              <div
                className="event-details__progress"
                role="progressbar"
                aria-label={`${POSITION_LABELS[slot.position]}: ${slot.filledCount} из ${slot.count}`}
                aria-valuemin={0}
                aria-valuemax={slot.count}
                aria-valuenow={slot.filledCount}
              >
                <span style={{width: `${percent}%`}} />
              </div>
            </div>
          )
        })}

        {participants.length > 0 && (
          <div
            className="event-details__slot event-details__participants"
            data-testid={testId('events', section, 'list', 'participants', event.id)}
          >
            <span className="event-details__participants-title">Записались</span>
            {participants.map((item) => {
              const name = item.displayName ?? resolveName(item.userId)
              return (
                <div
                  key={item.userId}
                  className="event-details__participant"
                  data-testid={testId('events', section, 'item', 'participant', item.userId)}
                >
                  <span className="event-details__participant-name">
                    <span className="event-details__avatar" aria-hidden>
                      {name.charAt(0)}
                    </span>
                    {name}
                    {item.userId === currentUserId ? ' (Вы)' : ''}
                  </span>
                  <span
                    className={
                      item.status === 'going'
                        ? 'event-details__tone--accent'
                        : 'event-details__tone--muted'
                    }
                  >
                    {item.status === 'going' ? 'Основной состав' : 'Лист ожидания'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </IceCard>
  )
}

/** Карточка «Контакты организатора»: аватар, телефон, мессенджер, предоплата. */
export function EventOrganizerCard({
  eventId,
  section,
  organizerName,
  organizerUserId,
  roleLabel = 'Организатор',
  phone,
  showPrepay = false,
}: {
  eventId: string
  section: EventDetailsSection
  organizerName: string
  organizerUserId: string
  roleLabel?: string
  phone?: string
  showPrepay?: boolean
}) {
  return (
    <IceCard padding="m">
      <div
        className="event-details__contacts"
        data-testid={testId('events', section, 'panel', 'contacts', eventId)}
      >
        <div className="event-details__organizer">
          <span className="event-details__organizer-avatar" aria-hidden>
            <Icon data={Person} size={24} />
          </span>
          <span className="event-details__organizer-copy">
            <Text
              className="event-details__organizer-name"
              data-testid={testId('events', section, 'text', 'owner', eventId)}
            >
              {organizerName}
            </Text>
            <span className="event-details__organizer-role">{roleLabel}</span>
          </span>
        </div>
        {phone ? (
          <HockeyButton
            view="outlined-action"
            size="l"
            width="max"
            className="event-details__contact-btn"
            href={`tel:${phone.replace(/[^\d+]/g, '')}`}
            data-testid={testId('events', section, 'btn', 'phone', eventId)}
          >
            {phone}
          </HockeyButton>
        ) : null}
        <HockeyButton
          view="outlined-action"
          size="l"
          width="max"
          className="event-details__contact-btn"
          component={Link}
          to={`/messenger?userId=${organizerUserId}`}
          data-testid={testId('events', section, 'btn', 'messenger', eventId)}
        >
          Связаться в мессенджере
        </HockeyButton>
        {showPrepay ? (
          <HockeyButton
            view="outlined"
            size="l"
            width="max"
            disabled
            data-testid={testId('events', section, 'btn', 'prepay', eventId)}
          >
            Внести предоплату (скоро)
          </HockeyButton>
        ) : null}
      </div>
    </IceCard>
  )
}

/** Плитка статуса записи: зелёная с галочкой, когда игрок уже в составе. */
export function EventRegistrationNotice({
  positive,
  children,
}: {
  positive: boolean
  children: ReactNode
}) {
  return (
    <div className={`event-details__notice${positive ? ' event-details__notice--positive' : ''}`}>
      {positive ? (
        <Icon data={CircleCheck} size={24} className="event-details__notice-icon" />
      ) : null}
      <div className="event-details__notice-copy">{children}</div>
    </div>
  )
}
