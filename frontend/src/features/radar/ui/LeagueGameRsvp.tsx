/**
 * HOCFRONT-9 — hero «Ближайшая игра» с RSVP игрока.
 */

import {Calendar, MapPin} from '@gravity-ui/icons'
import {Icon, Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'

import {fetchEventRsvp} from '@/entities/event'
import {useSessionAccess} from '@/features/access'
import {
  TeamRsvpMyStatus,
  TeamRsvpResponseControl,
} from '@/features/radar/ui/TeamRsvpResponseControl'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

export interface LeagueGameRsvpProps {
  eventId: string
  currentUserId?: string
  /**
   * Кнопка «Изменить» в hero. Если задана — ответ «Буду / Не смогу» рендерится
   * отдельным блоком снаружи, а hero показывает только текущий статус.
   */
  onChangeAnswer?: () => void
}

function formatGameDateTime(startsAt: string): string {
  const start = new Date(startsAt)
  const date = start.toLocaleDateString('ru-RU', {weekday: 'long', day: 'numeric', month: 'long'})
  const time = start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})
  return `${date.charAt(0).toUpperCase()}${date.slice(1)} в ${time}`
}

export function LeagueGameRsvp({eventId, currentUserId, onChangeAnswer}: LeagueGameRsvpProps) {
  const {userId: sessionUserId} = useSessionAccess()
  const resolvedUserId = currentUserId || sessionUserId
  const {
    data: board,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['event-rsvp', eventId],
    queryFn: () => fetchEventRsvp(eventId),
  })

  if (isLoading) {
    return <ScoreboardLoader label="Загрузка RSVP" testIdPrefix="radar" />
  }

  if (isError || !board) {
    return (
      <EmptyNetState
        title="Не удалось загрузить RSVP"
        copy="Проверь соединение и попробуй ещё раз."
        testIdPrefix="radar"
        action={
          <HockeyButton view="outlined" size="s" onClick={() => void refetch()}>
            Повторить
          </HockeyButton>
        }
      />
    )
  }

  return (
    <IceCard
      padding="l"
      className="league-game-rsvp"
      data-testid={testId('radar', 'league-rsvp', 'card', eventId)}
    >
      <div className="league-game-rsvp__hero">
        <div className="league-game-rsvp__badges">
          <span
            className="hockey-badge"
            data-testid={testId('radar', 'league-rsvp', 'text', 'title', eventId)}
          >
            Ближайшая игра
          </span>
          <span
            className="hockey-badge hockey-badge--muted"
            data-testid={testId('radar', 'league-rsvp', 'text', 'league', eventId)}
          >
            {board.leagueName}
          </span>
        </div>
        <Text
          variant="header-1"
          as="h2"
          className="league-game-rsvp__matchup"
          data-testid={testId('radar', 'league-rsvp', 'text', 'matchup', eventId)}
        >
          {board.teamName} vs {board.opponentName}
        </Text>
        <div className="league-game-rsvp__meta">
          <span
            className="league-game-rsvp__line"
            data-testid={testId('radar', 'league-rsvp', 'text', 'arena', eventId)}
          >
            <Icon data={MapPin} size={16} />
            {board.arenaName}
          </span>
          <span
            className="league-game-rsvp__line"
            data-testid={testId('radar', 'league-rsvp', 'text', 'datetime', eventId)}
          >
            <Icon data={Calendar} size={16} />
            {formatGameDateTime(board.startsAt)}
          </span>
        </div>
      </div>

      {onChangeAnswer ? (
        <div
          className="league-game-rsvp__answer"
          data-testid={testId('radar', 'league-rsvp', 'panel', 'cta', eventId)}
        >
          <TeamRsvpMyStatus eventId={eventId} currentUserId={resolvedUserId} />
          <HockeyButton
            view="outlined"
            size="l"
            onClick={onChangeAnswer}
            data-testid={testId('radar', 'league-rsvp', 'btn', 'change', eventId)}
          >
            Изменить
          </HockeyButton>
        </div>
      ) : (
        <div
          className="league-game-rsvp__actions"
          data-testid={testId('radar', 'league-rsvp', 'panel', 'cta', eventId)}
        >
          <TeamRsvpResponseControl eventId={eventId} currentUserId={resolvedUserId} />
        </div>
      )}
    </IceCard>
  )
}
