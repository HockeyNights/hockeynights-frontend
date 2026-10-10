/**
 * SPEC-FR-7.2.1, SPEC-FR-7.2.2
 * SPEC-UI-2.8
 */

import type {LeagueScheduleItem} from '@/entities/league'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {IceCard} from '@/shared/ui/IceCard'

/** @spec SPEC-FR-7.2.1 - Props расписания */
export interface LeagueScheduleProps {
  /** @spec SPEC-FR-7.2.1 */
  schedule: LeagueScheduleItem[]
}

function teamInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

function ScheduleTeam({name, align}: {name: string; align: 'home' | 'away'}) {
  return (
    <div className={`league-match__team league-match__team--${align}`}>
      <span className="league-match__avatar" aria-hidden>
        {teamInitial(name)}
      </span>
      <span className="league-match__team-name">{name}</span>
    </div>
  )
}

/**
 * @spec SPEC-UI-2.8 - Расписание лиги карточками матчей
 * @spec SPEC-FR-7.2.1 - Расписание матчей лиги
 */
export function LeagueSchedule({schedule}: LeagueScheduleProps) {
  if (schedule.length === 0) {
    return (
      <div data-testid={testId('leagues', 'schedule', 'empty')}>
        <EmptyNetState title="Нет матчей" copy="Расписание лиги пока недоступно." />
      </div>
    )
  }

  return (
    <div className="league-schedule" data-testid={testId('leagues', 'schedule', 'list')}>
      {schedule.map((item) => {
        const startsAt = new Date(item.startsAt)
        const hasScore =
          item.status === 'completed' &&
          item.homeScore !== undefined &&
          item.awayScore !== undefined
        const meta = [startsAt.toLocaleDateString('ru-RU'), item.arenaName]
          .filter(Boolean)
          .join(' · ')

        return (
          <IceCard
            key={item.id}
            padding="m"
            className={`league-match${item.status === 'cancelled' ? ' league-match--cancelled' : ''}`}
            data-testid={testId('leagues', 'schedule', 'item', item.id)}
          >
            <div className="league-match__head">
              <span className="league-match__kind">
                {item.status === 'cancelled' ? 'Игра отменена' : 'Игра'}
              </span>
              <span
                className="league-match__time"
                data-testid={testId('leagues', 'schedule', 'text', 'time', item.id)}
              >
                {startsAt.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
              </span>
            </div>
            <div
              className="league-match__teams"
              role="group"
              aria-label={
                hasScore
                  ? `${item.homeTeam} ${item.homeScore}:${item.awayScore} ${item.awayTeam}`
                  : `${item.homeTeam} — ${item.awayTeam}`
              }
            >
              <ScheduleTeam name={item.homeTeam} align="home" />
              <span
                className="league-match__score"
                data-testid={testId('leagues', 'schedule', 'text', 'score', item.id)}
              >
                {hasScore ? `${item.homeScore} : ${item.awayScore}` : 'VS'}
              </span>
              <ScheduleTeam name={item.awayTeam} align="away" />
            </div>
            {meta && (
              <span
                className="league-match__meta"
                data-testid={testId('leagues', 'schedule', 'text', 'meta', item.id)}
              >
                {meta}
              </span>
            )}
          </IceCard>
        )
      })}
    </div>
  )
}
