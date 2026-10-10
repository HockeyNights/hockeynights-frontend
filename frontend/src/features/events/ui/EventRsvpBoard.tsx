/**
 * SPEC-FR-25.6.1
 * Состав команды с RSVP-статусами на лиговую игру.
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'

import type {EventRsvpStatus} from '@/entities/event'
import {fetchEventRsvp} from '@/entities/event'
import {useSessionAccess} from '@/features/access'
import {testId} from '@/shared/testing/testId'

export interface EventRsvpBoardProps {
  eventId: string
  /** Заголовок уже есть снаружи (подпись секции на странице игры) */
  hideTitle?: boolean
}

const STATUS_LABELS: Record<EventRsvpStatus, string> = {
  confirmed: 'Подтвердил',
  declined: 'Отказался',
  pending: 'Не ответил',
}

const STATUS_COLORS: Record<EventRsvpStatus, 'positive' | 'danger' | 'secondary'> = {
  confirmed: 'positive',
  declined: 'danger',
  pending: 'secondary',
}

export function EventRsvpBoard({eventId, hideTitle = false}: EventRsvpBoardProps) {
  const {userId} = useSessionAccess()
  const {data: board} = useQuery({
    queryKey: ['event-rsvp', eventId],
    queryFn: () => fetchEventRsvp(eventId),
  })

  if (!board) return null

  return (
    <div className="event-rsvp-board" data-testid={testId('events', 'rsvp', 'panel', eventId)}>
      {!hideTitle && (
        <Text
          className="event-rsvp-board__title"
          data-testid={testId('events', 'rsvp', 'text', 'title', eventId)}
        >
          RSVP команды · {board.teamName} vs {board.opponentName}
        </Text>
      )}
      <div data-testid={testId('events', 'rsvp', 'list', eventId)}>
        {board.players.map((player) => {
          const isMe = player.userId === userId
          return (
            <div
              key={player.userId}
              className="hockey-list-row event-rsvp-board__row"
              data-testid={testId('events', 'rsvp', 'item', player.userId, eventId)}
            >
              <Text
                className="event-rsvp-board__name"
                data-testid={testId('events', 'rsvp', 'text', 'name', player.userId)}
              >
                {player.displayName}
                {isMe ? ' (вы)' : ''}
              </Text>
              <Text
                color={STATUS_COLORS[player.status]}
                data-testid={testId('events', 'rsvp', 'text', 'status', player.userId)}
              >
                {STATUS_LABELS[player.status]}
                {player.declineReason ? ` · ${player.declineReason}` : ''}
              </Text>
            </div>
          )
        })}
      </div>
    </div>
  )
}
