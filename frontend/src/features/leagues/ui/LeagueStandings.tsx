/**
 * SPEC-FR-7.2.1, SPEC-FR-7.2.2
 * SPEC-UI-2.7, SPEC-UI-1.5
 */

import {TrophyOutlined} from '@ant-design/icons'
import {type ReactNode, useMemo} from 'react'

import type {LeagueStanding} from '@/entities/league'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

const RANK_MEDAL: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

/** @spec SPEC-FR-7.2.1 - Props таблицы */
export interface LeagueStandingsProps {
  /** @spec SPEC-FR-7.2.1 */
  standings: LeagueStanding[]
  /** @spec SPEC-UI-2.7 */
  leagueName?: string
  /** @spec SPEC-UI-2.7 */
  compact?: boolean
  /** Контент справа в шапке таблицы (бейдж источника) — вместо названия лиги. */
  headerAside?: ReactNode
}

function rowId(row: LeagueStanding & {rank: number}): string {
  return `${row.leagueId}-${row.teamName}`
}

/**
 * @spec SPEC-UI-2.7 - Турнирная таблица как табло арены
 * @spec SPEC-FR-7.2.1 - Турнирная таблица лиги
 */
export function LeagueStandings({
  standings,
  leagueName,
  compact = false,
  headerAside,
}: LeagueStandingsProps) {
  const ranked = useMemo(
    () =>
      [...standings]
        .sort((a, b) => b.points - a.points || b.wins - a.wins)
        .map((row, index) => ({...row, rank: index + 1})),
    [standings],
  )

  const maxPoints = ranked[0]?.points ?? 1

  if (ranked.length === 0) {
    return (
      <div data-testid={testId('leagues', 'standings', 'empty')}>
        <EmptyNetState
          title="Таблица пуста"
          copy="Данные турнирной таблицы пока не загружены — проверьте источник лиги."
        />
      </div>
    )
  }

  const rows = compact ? ranked.slice(0, 3) : ranked

  return (
    <div
      className={`standings-board${compact ? ' standings-board--compact' : ''}`}
      role="table"
      aria-label={leagueName ? `Турнирная таблица: ${leagueName}` : 'Турнирная таблица'}
      data-testid={testId('leagues', 'standings', 'table')}
    >
      <div
        className="standings-board__header"
        data-testid={testId('leagues', 'standings', 'panel', 'header')}
      >
        <div
          className="standings-board__title"
          data-testid={testId('leagues', 'standings', 'text', 'title')}
        >
          {compact ? null : <TrophyOutlined className="standings-board__title-icon" aria-hidden />}
          {compact ? 'Топ-3' : 'Турнирная таблица'}
        </div>
        {headerAside ? (
          <div
            className="standings-board__aside"
            data-testid={testId('leagues', 'standings', 'panel', 'aside')}
          >
            {headerAside}
          </div>
        ) : null}
        {leagueName && !headerAside && (
          <div
            className="standings-board__league"
            data-testid={testId('leagues', 'standings', 'text', 'league')}
          >
            {leagueName}
          </div>
        )}
      </div>

      {!compact && (
        <div
          className="standings-board__cols"
          role="row"
          data-testid={testId('leagues', 'standings', 'row', 'header')}
        >
          <span role="columnheader" data-testid={testId('leagues', 'standings', 'column', 'rank')}>
            #
          </span>
          <span role="columnheader" data-testid={testId('leagues', 'standings', 'column', 'team')}>
            Команда
          </span>
          <span role="columnheader" data-testid={testId('leagues', 'standings', 'column', 'games')}>
            И
          </span>
          <span role="columnheader" data-testid={testId('leagues', 'standings', 'column', 'wins')}>
            В
          </span>
          <span
            role="columnheader"
            data-testid={testId('leagues', 'standings', 'column', 'losses')}
          >
            П
          </span>
          <span
            role="columnheader"
            data-testid={testId('leagues', 'standings', 'column', 'points')}
          >
            О
          </span>
          <span role="columnheader" data-testid={testId('leagues', 'standings', 'column', 'form')}>
            Форма
          </span>
        </div>
      )}

      {rows.map((row) => {
        const isLeader = row.rank === 1
        const rankClass = row.rank <= 3 ? `standings-board__rank--${row.rank}` : ''
        const fillPercent = Math.round((row.points / maxPoints) * 100)
        const id = rowId(row)

        if (compact) {
          return (
            <div
              key={id}
              className={`standings-board__row standings-board__row--compact${isLeader ? ' standings-board__row--leader' : ''}`}
              role="row"
              data-testid={testId('leagues', 'standings', 'row', id)}
            >
              <div
                className={`standings-board__rank ${rankClass}`}
                role="cell"
                data-testid={testId('leagues', 'standings', 'cell', 'rank', id)}
              >
                {RANK_MEDAL[row.rank] ?? row.rank}
              </div>
              <div
                className="standings-board__team"
                role="cell"
                data-testid={testId('leagues', 'standings', 'cell', 'team', id)}
              >
                {row.teamName}
              </div>
              <div
                className="standings-board__stat"
                role="cell"
                data-testid={testId('leagues', 'standings', 'cell', 'points', id)}
              >
                <ScoreboardText tone={isLeader ? 'gold' : 'accent'}>{row.points} О</ScoreboardText>
              </div>
            </div>
          )
        }

        return (
          <div
            key={id}
            className={`standings-board__row standings-board__row--rank-${Math.min(row.rank, 4)}${isLeader ? ' standings-board__row--leader' : ''}`}
            role="row"
            data-testid={testId('leagues', 'standings', 'row', id)}
          >
            <div
              className={`standings-board__rank ${rankClass}`}
              role="cell"
              aria-label={`Место ${row.rank}`}
              data-testid={testId('leagues', 'standings', 'cell', 'rank', id)}
            >
              {row.rank <= 3 ? <TrophyOutlined aria-hidden /> : row.rank}
            </div>
            <div
              className="standings-board__team"
              role="cell"
              data-testid={testId('leagues', 'standings', 'cell', 'team', id)}
            >
              <span className="standings-board__avatar" aria-hidden>
                {row.teamName.trim().charAt(0).toUpperCase()}
              </span>
              <span className="standings-board__team-name">{row.teamName}</span>
            </div>
            <div
              className="standings-board__stat"
              role="cell"
              data-testid={testId('leagues', 'standings', 'cell', 'games', id)}
            >
              {row.gamesPlayed}
            </div>
            <div
              className="standings-board__stat standings-board__stat--wins"
              role="cell"
              data-testid={testId('leagues', 'standings', 'cell', 'wins', id)}
            >
              {row.wins}
            </div>
            <div
              className="standings-board__stat"
              role="cell"
              data-testid={testId('leagues', 'standings', 'cell', 'losses', id)}
            >
              {row.losses}
            </div>
            <div
              className="standings-board__stat standings-board__stat--points"
              role="cell"
              data-testid={testId('leagues', 'standings', 'cell', 'points', id)}
            >
              {row.points}
            </div>
            <div
              className="standings-board__bar-cell"
              role="cell"
              data-testid={testId('leagues', 'standings', 'cell', 'form', id)}
            >
              <div className="standings-board__points-bar" aria-hidden>
                <div
                  className="standings-board__points-fill hockey-fill"
                  style={{['--hockey-fill-width' as string]: `${fillPercent}%`}}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
