/**
 * SPEC-FR-7.1.1, SPEC-FR-7.1.2, SPEC-FR-7.2.1, SPEC-FR-7.2.2
 * SPEC-UI-2.7, SPEC-UI-2.8
 * HOCFRONT-34A — полноценная страница лиги (вместо inline-панели в каталоге)
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useParams} from 'react-router'

import {fetchLeague, fetchLeagueSchedule, fetchLeagueStandings} from '@/entities/league'
import {LeagueProfilePanel, LeagueSchedule, LeagueStandings} from '@/features/leagues'
import {isNotFoundError} from '@/shared/api/client'
import {LEAGUES_LABEL} from '@/shared/config/navigationLabels'
import {routes} from '@/shared/const/appRoutes'
import {useDocumentTitle} from '@/shared/hooks/useDocumentTitle'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {PageBackLink} from '@/shared/ui/PageBackLink'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'
import {PageStatePanel} from '@/shared/ui/PageStatePanel'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'

/**
 * @spec SPEC-UI-2.7 - Табло турнирной таблицы
 * @spec SPEC-FR-7.1.2 - Отдельная страница карточки лиги
 */
export function LeagueDetailsPage() {
  const {leagueId = ''} = useParams()

  const {
    data: league,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['league', leagueId],
    queryFn: () => fetchLeague(leagueId),
    enabled: Boolean(leagueId),
  })

  const {data: standings = [], isLoading: standingsLoading} = useQuery({
    queryKey: ['league-standings', leagueId],
    queryFn: () => fetchLeagueStandings(leagueId),
    enabled: Boolean(leagueId),
  })

  const {data: schedule = [], isLoading: scheduleLoading} = useQuery({
    queryKey: ['league-schedule', leagueId],
    queryFn: () => fetchLeagueSchedule(leagueId),
    enabled: Boolean(leagueId),
  })

  useDocumentTitle(league ? `${league.name} · ${LEAGUES_LABEL}` : LEAGUES_LABEL)

  if (isLoading) {
    return (
      <PageHub data-testid={testId('leagues', 'details', 'loader')}>
        <ScoreboardLoader label="Загрузка лиги..." />
      </PageHub>
    )
  }

  if (error && !isNotFoundError(error)) {
    return (
      <PageHub>
        <QueryErrorState
          title="Не удалось загрузить лигу"
          onRetry={() => void refetch()}
          testIdPrefix="leagues"
          data-testid={testId('leagues', 'details', 'error')}
        />
      </PageHub>
    )
  }

  if (!league) {
    return (
      <PageHub>
        <PageBackLink
          to={routes.leagues}
          label="К каталогу лиг"
          testIdPrefix="leagues"
          testIdSection="details"
        />
        <PageStatePanel
          title="Лига не найдена"
          copy="Вернитесь к каталогу и выберите лигу из списка."
          testIdPrefix="leagues"
          data-testid={testId('leagues', 'details', 'empty')}
        />
      </PageHub>
    )
  }

  return (
    <PageHub data-testid={testId('leagues', 'details', 'page', league.id)}>
      <PageBackLink
        to={routes.leagues}
        label="К каталогу лиг"
        testIdPrefix="leagues"
        testIdSection="details"
      />

      <PageHeader
        title={league.name}
        subtitle={league.region}
        testIdPrefix="leagues"
        testIdSection="details"
      />

      <LeagueProfilePanel league={league} />

      <div
        className="page-hub__panel"
        data-testid={testId('leagues', 'details', 'card', 'stats', league.id)}
      >
        <IceCard padding="m">
          <div className="hockey-row hockey-row--gap-12 hockey-row--between hockey-mb-16">
            <div>
              <Text
                variant="subheader-2"
                data-testid={testId('leagues', 'details', 'text', 'stats-title', league.id)}
              >
                Статистика и расписание
              </Text>
              <Text
                color="secondary"
                data-testid={testId('leagues', 'details', 'text', 'stats-subtitle', league.id)}
              >
                {league.name} · {league.region}
              </Text>
            </div>
            <div data-testid={testId('leagues', 'details', 'badge', 'source', league.id)}>
              <SourceMetaBadge sourceMeta={league.sourceMeta} />
            </div>
          </div>

          <div className="hockey-stack hockey-stack--gap-20">
            {standingsLoading ? (
              <div data-testid={testId('leagues', 'details', 'loader', 'standings', league.id)}>
                <ScoreboardLoader label="Загрузка таблицы" />
              </div>
            ) : (
              <LeagueStandings standings={standings} leagueName={league.name} />
            )}

            {scheduleLoading ? (
              <div data-testid={testId('leagues', 'details', 'loader', 'schedule', league.id)}>
                <ScoreboardLoader label="Загрузка расписания" />
              </div>
            ) : (
              <LeagueSchedule schedule={schedule} />
            )}
          </div>
        </IceCard>
      </div>
    </PageHub>
  )
}
