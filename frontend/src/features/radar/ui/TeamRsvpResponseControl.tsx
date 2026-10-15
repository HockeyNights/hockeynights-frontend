/**
 * HOCFRONT-9 / страница игры — ответ игрока на командный RSVP с причиной отказа.
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {EventRsvpStatus} from '@/entities/event'
import {fetchEventRsvp, updateEventRsvp} from '@/entities/event'
import {useSessionAccess} from '@/features/access'
import {DeclineReasonField} from '@/features/radar/ui/DeclineReasonField'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceSkeleton} from '@/shared/ui/IceSkeleton'

export interface TeamRsvpResponseControlProps {
  eventId: string
  currentUserId?: string
  /** Без строки статуса — статус показан рядом (hero LeagueGameRsvp) */
  hideStatus?: boolean
  /** id контейнера — якорь для кнопки «Изменить» */
  anchorId?: string
}

const STATUS_LABELS: Record<EventRsvpStatus, string> = {
  confirmed: 'Вы идёте',
  declined: 'Вы не сможете',
  pending: 'Ответ не отправлен',
}

const STATUS_COLORS: Record<EventRsvpStatus, 'positive' | 'danger' | 'warning'> = {
  confirmed: 'positive',
  declined: 'danger',
  pending: 'warning',
}

function formatMyStatus(status: EventRsvpStatus, declineReason?: string): string {
  const label = STATUS_LABELS[status]
  return status === 'declined' && declineReason ? `${label} · ${declineReason}` : label
}

/** Текущий ответ игрока «Твой ответ: …» — для hero ближайшей игры. */
export function TeamRsvpMyStatus({
  eventId,
  currentUserId,
}: Pick<TeamRsvpResponseControlProps, 'eventId' | 'currentUserId'>) {
  const {userId: sessionUserId} = useSessionAccess()
  const resolvedUserId = currentUserId || sessionUserId
  const {data: board} = useQuery({
    queryKey: ['event-rsvp', eventId],
    queryFn: () => fetchEventRsvp(eventId),
  })
  const me = board?.players.find((player) => player.userId === resolvedUserId)
  const myStatus = me?.status ?? 'pending'

  return (
    <div className="team-rsvp-my-status">
      <span className="team-rsvp-my-status__label">Твой ответ</span>
      <Text
        className="team-rsvp-my-status__value"
        color={STATUS_COLORS[myStatus]}
        data-testid={testId('radar', 'team-rsvp-response', 'text', 'status', eventId)}
      >
        {formatMyStatus(myStatus, me?.declineReason)}
      </Text>
    </div>
  )
}

export function TeamRsvpResponseControl({
  eventId,
  currentUserId,
  hideStatus = false,
  anchorId,
}: TeamRsvpResponseControlProps) {
  const queryClient = useQueryClient()
  const {userId: sessionUserId} = useSessionAccess()
  const resolvedUserId = currentUserId || sessionUserId
  const [showDeclineReason, setShowDeclineReason] = useState(false)

  const {data: board, isLoading} = useQuery({
    queryKey: ['event-rsvp', eventId],
    queryFn: () => fetchEventRsvp(eventId),
  })

  const mutation = useMutation({
    mutationFn: (payload: {status: EventRsvpStatus; declineReason?: string}) =>
      updateEventRsvp(eventId, payload),
    onSuccess: () => {
      setShowDeclineReason(false)
      void queryClient.invalidateQueries({queryKey: ['event-rsvp', eventId]})
      void queryClient.invalidateQueries({queryKey: ['events']})
      void queryClient.invalidateQueries({queryKey: ['event', eventId]})
      void queryClient.invalidateQueries({queryKey: ['calendar']})
      void queryClient.invalidateQueries({queryKey: ['calendar-shell']})
    },
  })

  if (isLoading) {
    return (
      <div
        className="hockey-stack hockey-stack--gap-8"
        data-testid={testId('radar', 'team-rsvp-response', 'loader', eventId)}
        aria-busy="true"
      >
        <IceSkeleton height={36} count={2} testIdPrefix="radar" />
      </div>
    )
  }

  if (!board) return null

  const me = board.players.find((player) => player.userId === resolvedUserId)
  const myStatus = me?.status ?? 'pending'

  function confirmAttendance() {
    mutation.mutate({status: 'confirmed'})
  }

  function submitDecline(reason: string) {
    mutation.mutate({status: 'declined', declineReason: reason})
  }

  return (
    <div
      id={anchorId}
      className="team-rsvp-response"
      data-testid={testId('radar', 'team-rsvp-response', 'panel', eventId)}
    >
      <div className="hockey-stack hockey-stack--gap-4">
        {!hideStatus && (
          <Text
            className="team-rsvp-response__status"
            color={STATUS_COLORS[myStatus]}
            data-testid={testId('radar', 'team-rsvp-response', 'text', 'status', eventId)}
          >
            {formatMyStatus(myStatus, me?.declineReason)}
          </Text>
        )}
        <Text
          color="secondary"
          className="team-rsvp-response__hint"
          data-testid={testId('radar', 'team-rsvp-response', 'text', 'hint', eventId)}
        >
          Капитан видит причину отказа и сможет скорректировать состав.
        </Text>
      </div>

      {!showDeclineReason ? (
        <div
          className="team-rsvp-response__actions"
          data-testid={testId('radar', 'team-rsvp-response', 'list', 'actions', eventId)}
        >
          <HockeyButton
            view={myStatus === 'declined' ? 'outlined' : 'action'}
            size="xl"
            loading={mutation.isPending}
            onClick={confirmAttendance}
            aria-pressed={myStatus === 'confirmed'}
            data-testid={testId('radar', 'team-rsvp-response', 'btn', 'confirm', eventId)}
          >
            Буду
          </HockeyButton>
          <HockeyButton
            view={myStatus === 'declined' ? 'action' : 'outlined'}
            size="xl"
            loading={mutation.isPending}
            onClick={() => setShowDeclineReason(true)}
            aria-pressed={myStatus === 'declined'}
            data-testid={testId('radar', 'team-rsvp-response', 'btn', 'decline', eventId)}
          >
            Не смогу
          </HockeyButton>
        </div>
      ) : (
        <DeclineReasonField
          onConfirm={submitDecline}
          onCancel={() => setShowDeclineReason(false)}
          isPending={mutation.isPending}
        />
      )}
    </div>
  )
}
