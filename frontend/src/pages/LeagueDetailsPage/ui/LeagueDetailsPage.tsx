/**
 * SPEC-FR-7.1.1, SPEC-FR-7.1.2, SPEC-FR-7.2.1, SPEC-FR-7.2.2
 * SPEC-UI-2.7, SPEC-UI-2.8
 * HOCFRONT-34A — полноценная страница лиги (вместо inline-панели в каталоге)
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useParams} from 'react-router'

import {fetchLeague, fetchLeagueSchedule, fetchLeagueStandings} from '@/entities/league'
import {
  LeagueApplicationPanel,
  LeagueProfilePanel,
  LeagueSchedule,
  LeagueStandings,
} from '@/features/leagues'
import {isNotFoundError} from '@/shared/api/client'
import {LEAGUES_LABEL} from '@/shared/config/navigationLabels'
import {routes} from '@/shared/const/appRoutes'
import {useDocumentTitle} from '@/shared/hooks/useDocumentTitle'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {PageBackLink} from '@/shared/ui/PageBackLink'
import {PageHub} from '@/shared/ui/PageHub'
import {PageStatePanel} from '@/shared/ui/PageStatePanel'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {SectionHeading} from '@/shared/ui/SectionHeading'
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
    <PageHub
      className="league-details"
      data-testid={testId('leagues', 'details', 'page', league.id)}
    >
      <PageBackLink
        to={routes.leagues}
        label="К каталогу лиг"
        testIdPrefix="leagues"
        testIdSection="details"
      />

      <LeagueProfilePanel league={league} />

      <div
        className="league-details__grid"
        data-testid={testId('leagues', 'details', 'grid', league.id)}
      >
        <section
          className="league-details__main"
          data-testid={testId('leagues', 'details', 'card', 'stats', league.id)}
        >
          <SectionHeading
            title="Статистика и расписание"
            data-testid={testId('leagues', 'details', 'text', 'stats-title', league.id)}
          />
          <IceCard padding="m" className="league-details__stats">
            <Text
              variant="header-2"
              className="league-details__stats-title"
              data-testid={testId('leagues', 'details', 'text', 'stats-subtitle', league.id)}
            >
              {league.name}
            </Text>
            {standingsLoading ? (
              <div data-testid={testId('leagues', 'details', 'loader', 'standings', league.id)}>
                <ScoreboardLoader label="Загрузка таблицы" />
              </div>
            ) : (
              <LeagueStandings
                standings={standings}
                leagueName={league.name}
                headerAside={
                  <div data-testid={testId('leagues', 'details', 'badge', 'source', league.id)}>
                    <SourceMetaBadge sourceMeta={league.sourceMeta} />
                  </div>
                }
              />
            )}
          </IceCard>
        </section>

        <aside className="league-details__aside">
          <LeagueApplicationPanel league={league} />

          <section
            className="league-details__schedule"
            data-testid={testId('leagues', 'details', 'panel', 'schedule', league.id)}
          >
            <SectionHeading
              title="Расписание лиги"
              data-testid={testId('leagues', 'details', 'text', 'schedule-title', league.id)}
            />
            {scheduleLoading ? (
              <div data-testid={testId('leagues', 'details', 'loader', 'schedule', league.id)}>
                <ScoreboardLoader label="Загрузка расписания" />
              </div>
            ) : (
              <LeagueSchedule schedule={schedule} />
            )}
          </section>
        </aside>
      </div>
    </PageHub>
  )
}
