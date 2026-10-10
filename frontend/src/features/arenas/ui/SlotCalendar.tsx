/**
 * SPEC-FR-6.3.1, SPEC-FR-6.3.2, SPEC-FR-6.4.2
 * SPEC-UI-2.2
 */

import {CircleInfo} from '@gravity-ui/icons'
import {Icon, Text} from '@gravity-ui/uikit'
import {useMemo, useState} from 'react'

import type {Arena} from '@/entities/arena'
import type {IceSlot} from '@/entities/arena'
import {ExternalBookingButton} from '@/features/arenas/ui/ExternalBookingButton'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

/** Сколько слотов видно до «Все даты» — как в макете страницы площадки. */
const COLLAPSED_SLOTS = 3

/** @spec SPEC-FR-6.3.1 */
export interface SlotCalendarProps {
  slots: IceSlot[]
  arena: Arena
}

function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function timeRange(slot: IceSlot): string {
  const start = new Date(slot.startsAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const end = new Date(slot.endsAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${start}–${end}`
}

/**
 * @spec SPEC-FR-6.3.1 - Календарь временных слотов
 * @spec SPEC-FR-6.4.2 - Бронирование выбранного слота
 */
export function SlotCalendar({slots, arena}: SlotCalendarProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  const sorted = useMemo(
    () => [...slots].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [slots],
  )
  const canCollapse = sorted.length > COLLAPSED_SLOTS
  const visible = expanded || !canCollapse ? sorted : sorted.slice(0, COLLAPSED_SLOTS)

  const grouped = useMemo(() => {
    const map = new Map<string, IceSlot[]>()
    for (const slot of visible) {
      const key = dayKey(slot.startsAt)
      const list = map.get(key) ?? []
      list.push(slot)
      map.set(key, list)
    }
    return [...map.entries()]
  }, [visible])

  if (slots.length === 0) {
    return (
      <Text color="secondary" data-testid={testId('arenas', 'slot-calendar', 'empty', arena.id)}>
        Свободные слоты не опубликованы.
      </Text>
    )
  }

  return (
    <div
      className="slot-calendar"
      data-testid={testId('arenas', 'slot-calendar', 'calendar', arena.id)}
    >
      {grouped.map(([day, daySlots]) => (
        <section
          key={day}
          className="slot-calendar__day"
          data-testid={testId('arenas', 'slot-calendar', 'panel', day)}
        >
          <div
            className="slot-calendar__day-label"
            data-testid={testId('arenas', 'slot-calendar', 'text', 'day', day)}
          >
            {day}
          </div>
          <div
            className="slot-calendar__grid"
            data-testid={testId('arenas', 'slot-calendar', 'list', day)}
          >
            {daySlots.map((slot) => {
              const selected = slot.id === selectedSlotId
              const disabled = slot.status !== 'free'
              return (
                <div
                  key={slot.id}
                  className={[
                    'slot-calendar__row',
                    selected ? 'slot-calendar__row--selected' : '',
                    disabled ? 'slot-calendar__row--busy' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <button
                    type="button"
                    className="slot-calendar__chip"
                    onClick={() => !disabled && setSelectedSlotId(slot.id)}
                    disabled={disabled}
                    aria-pressed={selected}
                    data-testid={testId('arenas', 'slot-calendar', 'slot', slot.id)}
                  >
                    <span
                      className="slot-calendar__time"
                      data-testid={testId('arenas', 'slot-calendar', 'text', 'time', slot.id)}
                    >
                      {timeRange(slot)}
                    </span>
                    <span className="slot-calendar__meta">
                      <span
                        className="slot-calendar__status"
                        data-testid={testId('arenas', 'slot-calendar', 'text', 'status', slot.id)}
                      >
                        {slot.status === 'free' ? 'Свободно' : 'Занято'}
                      </span>
                      {slot.price != null && (
                        <span
                          className="slot-calendar__price"
                          data-testid={testId('arenas', 'slot-calendar', 'text', 'price', slot.id)}
                        >
                          {slot.price.toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                    </span>
                  </button>
                  {!disabled && (
                    <ExternalBookingButton
                      arena={arena}
                      slot={slot}
                      label="Забронировать слот"
                      view="action"
                      size="l"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <div
        className="slot-calendar__booking"
        data-testid={testId('arenas', 'slot-calendar', 'panel', 'booking', arena.id)}
      >
        <span className="slot-calendar__booking-icon" aria-hidden>
          <Icon data={CircleInfo} size={20} />
        </span>
        <Text
          className="slot-calendar__booking-text"
          data-testid={testId('arenas', 'slot-calendar', 'text', 'confirm-note', arena.id)}
        >
          Бронь подтверждается администратором в течение 15 минут
        </Text>
        {canCollapse && (
          <HockeyButton
            view="action"
            size="l"
            className="slot-calendar__all"
            aria-expanded={expanded}
            onClick={() => setExpanded((prev) => !prev)}
            data-testid={testId('arenas', 'slot-calendar', 'btn', 'all-dates', arena.id)}
          >
            {expanded ? 'Свернуть' : 'Все даты'}
          </HockeyButton>
        )}
      </div>
    </div>
  )
}
