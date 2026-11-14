/**
 * HOCFRONT-46 — схема половины площадки с пятью позициями звена.
 */

import {Person, Plus} from '@gravity-ui/icons'
import {Icon} from '@gravity-ui/uikit'
import type {CSSProperties} from 'react'

import type {EventLine, EventLineSlotKey} from '@/entities/event'
import {EVENT_LINE_SLOT_KEYS, EVENT_LINE_SLOT_LABELS} from '@/entities/event'
import {
  type EventLinePlayer,
  playerInitials,
  slotFaceLabel,
} from '@/features/events/lib/eventLinesModel'
import {testId} from '@/shared/testing/testId'

export interface EventLineRinkProps {
  line: EventLine
  players: Map<string, EventLinePlayer>
  currentUserId: string
  /** Режим тренера: пустые позиции тоже кликабельны. */
  editing?: boolean
  selectedSlot?: EventLineSlotKey
  onSlotClick?: (slot: EventLineSlotKey) => void
}

export function EventLineRink({
  line,
  players,
  currentUserId,
  editing = false,
  selectedSlot,
  onSlotClick,
}: EventLineRinkProps) {
  return (
    <div
      className="event-lines-rink"
      style={{'--event-line-color': line.jerseyColor} as CSSProperties}
      data-testid={testId('events', 'lines', 'panel', 'rink', line.number)}
    >
      <span className="event-lines-rink__mark event-lines-rink__mark--center-line" aria-hidden />
      <span className="event-lines-rink__mark event-lines-rink__mark--center-circle" aria-hidden />
      <span className="event-lines-rink__mark event-lines-rink__mark--blue-line" aria-hidden />
      <span className="event-lines-rink__mark event-lines-rink__mark--circle-left" aria-hidden />
      <span className="event-lines-rink__mark event-lines-rink__mark--circle-right" aria-hidden />
      <span className="event-lines-rink__mark event-lines-rink__mark--goal-line" aria-hidden />
      <span className="event-lines-rink__mark event-lines-rink__mark--crease" aria-hidden />

      {EVENT_LINE_SLOT_KEYS.map((slot) => {
        const userId = line.slots[slot]
        const stored = userId ? players.get(userId) : undefined
        const player = stored && stored.eligible !== false ? stored : undefined
        const isMe = Boolean(player && player.userId === currentUserId)
        const isSelected = editing && selectedSlot === slot
        const label = slotFaceLabel(userId, player, currentUserId)
        const faceLabel = editing && !userId ? 'Добавить' : label
        const className = [
          'event-lines-slot',
          `event-lines-slot--${slot}`,
          isMe ? 'event-lines-slot--me' : '',
          isSelected ? 'event-lines-slot--selected' : '',
        ]
          .filter(Boolean)
          .join(' ')

        const avatar = player ? (
          <span className="event-lines-slot__avatar">
            {player.avatarUrl ? (
              <img src={player.avatarUrl} alt="" loading="lazy" />
            ) : (
              playerInitials(player.displayName)
            )}
          </span>
        ) : (
          <span className="event-lines-slot__avatar event-lines-slot__avatar--empty">
            <Icon data={editing ? Plus : Person} size={18} />
          </span>
        )
        const content = (
          <>
            {avatar}
            <span className="event-lines-slot__name">{faceLabel}</span>
          </>
        )
        const slotTestId = testId('events', 'lines', 'btn', 'slot', line.number, slot)

        if (!editing && !player) {
          return (
            <div key={slot} className={className} data-testid={slotTestId}>
              {content}
            </div>
          )
        }

        return (
          <button
            key={slot}
            type="button"
            className={className}
            aria-pressed={editing ? isSelected : undefined}
            aria-label={`${EVENT_LINE_SLOT_LABELS[slot]}: ${player?.displayName ?? (userId ? 'не в составе' : 'свободно')}`}
            onClick={() => onSlotClick?.(slot)}
            data-testid={slotTestId}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
