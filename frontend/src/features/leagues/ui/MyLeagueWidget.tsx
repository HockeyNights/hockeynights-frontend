/**
 * HOCFRONT-34A — краткий виджет «Моя лига»: место в таблице и ближайший матч своей команды.
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useState} from 'react'
import {Link} from 'react-router'

import {fetchLeague, fetchLeagueSchedule, fetchLeagueStandings} from '@/entities/league'
import {fetchTeams} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {normalizeLeagueTeamName} from '@/features/leagues/lib/leagueCatalogFilters'
import {leagueDetailsPath} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

/**
 * Компактная карточка «Моя лига»: показывается, только если у игрока есть команда,
 * привязанная к лиге (`Team.leagueId`, @spec SPEC-FR-24.4.2).
 */
export function MyLeagueWidget() {
  const [nowMs] = useState(() => Date.now())
  const {userId} = useSessionAccess()

  const {data: teams = []} = useQuery({
    queryKey: ['teams', {playerId: userId}],
    queryFn: () => fetchTeams({playerId: userId}),
    enabled: Boolean(userId),
  })

  const linkedTeams = teams.filter((team) => team.leagueId)
  // Если команд несколько — берём первую с leagueId; сопоставление таблицы/матчей — по нормализованному имени.
  const myTeam = linkedTeams[0]
  const teamKey = myTeam ? normalizeLeagueTeamName(myTeam.name) : ''

  const {data: league} = useQuery({
    queryKey: ['league', myTeam?.leagueId],
    queryFn: () => fetchLeague(myTeam!.leagueId!),
    enabled: Boolean(myTeam?.leagueId),
  })

  const {data: standings = []} = useQuery({
    queryKey: ['league-standings', myTeam?.leagueId],
    queryFn: () => fetchLeagueStandings(myTeam!.leagueId!),
    enabled: Boolean(myTeam?.leagueId),
  })

  const {data: schedule = []} = useQuery({
    queryKey: ['league-schedule', myTeam?.leagueId],
    queryFn: () => fetchLeagueSchedule(myTeam!.leagueId!),
    enabled: Boolean(myTeam?.leagueId),
  })

  if (!myTeam || !league) return null

  const ranked = [...standings].sort((a, b) => b.points - a.points)
  const rankIndex = ranked.findIndex((row) => normalizeLeagueTeamName(row.teamName) === teamKey)
  const myStanding = rankIndex >= 0 ? ranked[rankIndex] : undefined

  const nextMatch = schedule
    .filter((item) => {
      if (item.status === 'completed' || item.status === 'cancelled') return false
      if (new Date(item.startsAt).getTime() < nowMs) return false
      const home = normalizeLeagueTeamName(item.homeTeam)
      const away = normalizeLeagueTeamName(item.awayTeam)
      return home === teamKey || away === teamKey
    })
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0]

  return (
    <div data-testid={testId('leagues', 'my-league', 'card', league.id)}>
      <IceCard padding="m" className="my-league-widget">
        <div className="my-league-widget__top">
          <div className="my-league-widget__copy">
            <Text
              color="secondary"
              className="my-league-widget__eyebrow"
              data-testid={testId('leagues', 'my-league', 'text', 'eyebrow', league.id)}
            >
              Моя лига · {myTeam.name}
            </Text>
            <Text
              variant="header-2"
              className="my-league-widget__name"
              data-testid={testId('leagues', 'my-league', 'text', 'name', league.id)}
            >
              {league.name}
            </Text>
            {myStanding ? (
              <Text
                className="my-league-widget__rank"
                data-testid={testId('leagues', 'my-league', 'text', 'rank', league.id)}
              >
                {rankIndex + 1}-е место из {ranked.length} · {myStanding.points} очк.
              </Text>
            ) : (
              <Text
                color="secondary"
                className="my-league-widget__eyebrow"
                data-testid={testId('leagues', 'my-league', 'text', 'rank-empty', league.id)}
              >
                Таблица пока не сформирована
              </Text>
            )}
          </div>
          <Link
            to={leagueDetailsPath(league.id)}
            className="my-league-widget__open"
            data-testid={testId('leagues', 'my-league', 'link', 'open', league.id)}
          >
            <HockeyButton
              view="outlined"
              size="l"
              data-testid={testId('leagues', 'my-league', 'btn', 'open', league.id)}
            >
              Открыть лигу
            </HockeyButton>
          </Link>
        </div>
        {nextMatch ? (
          <Text
            color="secondary"
            className="my-league-widget__next"
            data-testid={testId('leagues', 'my-league', 'text', 'next-match', league.id)}
          >
            Следующая игра: {nextMatch.homeTeam} — {nextMatch.awayTeam},{' '}
            {new Date(nextMatch.startsAt).toLocaleString('ru-RU', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        ) : (
          <Text
            color="secondary"
            className="my-league-widget__next"
            data-testid={testId('leagues', 'my-league', 'text', 'next-match-empty', league.id)}
          >
            Ближайшая игра пока не назначена
          </Text>
        )}
      </IceCard>
    </div>
  )
}
