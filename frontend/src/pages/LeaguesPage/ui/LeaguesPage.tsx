/**
 * SPEC-FR-7.1.1, SPEC-FR-7.1.2, SPEC-FR-7.2.1, SPEC-FR-7.2.2
 * SPEC-UI-2.7, SPEC-UI-2.8
 * HOCFRONT-34A — каталог: поиск/фильтры, карточка → /leagues/:leagueId
 */

import {useQuery} from '@tanstack/react-query'
import {useEffect} from 'react'
import {useNavigate, useSearchParams} from 'react-router'

import type {League, LeagueFilters as LeagueFiltersType} from '@/entities/league'
import {fetchLeagues} from '@/entities/league'
import {useSessionAccess} from '@/features/access'
import {
  countActiveLeagueFilters,
  LeagueCard,
  LeagueFilters,
  MyLeagueWidget,
  parseLeagueFiltersFromSearchParams,
  writeLeagueFiltersToSearchParams,
} from '@/features/leagues'
import {PartnerAccessHint, PartnerCabinetBanner} from '@/features/partners'
import {LEAGUES_PAGE_TITLE} from '@/shared/config/navigationLabels'
import {leagueDetailsPath} from '@/shared/const/appRoutes'
import {useDocumentTitle} from '@/shared/hooks/useDocumentTitle'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceSkeleton} from '@/shared/ui/IceSkeleton'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const EMPTY_FILTERS: LeagueFiltersType = {}

/**
 * @spec SPEC-UI-2.7 - Табло турнирной таблицы
 * @spec SPEC-FR-7.1.1 - Страница списка лиг
 */
export function LeaguesPage() {
  useDocumentTitle(LEAGUES_PAGE_TITLE)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const legacyLeagueId = searchParams.get('leagueId')

  const filters = parseLeagueFiltersFromSearchParams(searchParams)

  // Старые ссылки ?leagueId= → полноценная страница лиги
  useEffect(() => {
    if (!legacyLeagueId) return
    navigate(leagueDetailsPath(legacyLeagueId), {replace: true})
  }, [legacyLeagueId, navigate])

  const {session} = useSessionAccess()
  const leagueMembership = session?.user.partnerMemberships?.find((m) => m.kind === 'league')

  const {
    data: leagues = [],
    isPending,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['leagues', filters],
    queryFn: () => fetchLeagues(filters),
    placeholderData: (previous) => previous,
    enabled: !legacyLeagueId,
  })

  const applyFilters = (nextFilters: LeagueFiltersType) => {
    setSearchParams(writeLeagueFiltersToSearchParams(nextFilters), {replace: true})
  }

  const handleResetFilters = () => applyFilters(EMPTY_FILTERS)

  const openLeague = (id: string) => navigate(leagueDetailsPath(id))

  const isFiltered = countActiveLeagueFilters(filters) > 0 || Boolean(filters.query?.trim())
  const showLayout = !isPending && !isError && !legacyLeagueId
  const showEmpty = showLayout && leagues.length === 0

  return (
    <PageHub data-testid={testId('leagues', 'page')}>
      <PageHeader
        title={LEAGUES_PAGE_TITLE}
        subtitle="Лиги Москвы и России. Данные могут быть mock, manual, imported или external — смотрите бейдж источника."
        testIdPrefix="leagues"
      />

      <div data-testid={testId('leagues', 'page', 'panel', 'partner-access')}>
        {leagueMembership ? (
          <PartnerCabinetBanner membership={leagueMembership} />
        ) : (
          <PartnerAccessHint kind="league" />
        )}
      </div>

      <MyLeagueWidget />

      <LeagueFilters
        filters={filters}
        onChange={applyFilters}
        onReset={handleResetFilters}
        resultsCount={leagues.length}
        resultsPending={isFetching}
      />

      {isPending && (
        <div data-testid={testId('leagues', 'page', 'loader')}>
          <ScoreboardLoader label="Загрузка лиг" />
          <div className="arenas-page__skeleton">
            <IceSkeleton count={3} height={220} />
          </div>
        </div>
      )}

      {isError && !isPending && (
        <QueryErrorState
          title="Не удалось загрузить лиги"
          onRetry={() => void refetch()}
          testIdPrefix="leagues"
          data-testid={testId('leagues', 'page', 'error')}
        />
      )}

      {showEmpty && (
        <div data-testid={testId('leagues', 'page', 'empty')}>
          <EmptyNetState
            title="Лиг по фильтру не найдено"
            copy="Попробуйте другой регион, уровень или сбросьте фильтры."
            action={
              isFiltered ? (
                <HockeyButton
                  view="outlined"
                  size="s"
                  onClick={handleResetFilters}
                  data-testid={testId('leagues', 'page', 'btn', 'reset')}
                >
                  Сбросить фильтры
                </HockeyButton>
              ) : undefined
            }
          />
        </div>
      )}

      {showLayout && leagues.length > 0 && (
        <div
          className="hockey-grid hockey-grid--cards-300"
          data-testid={testId('leagues', 'page', 'list')}
        >
          {leagues.map((league: League) => (
            <LeagueCard key={league.id} league={league} onOpenDetails={openLeague} />
          ))}
        </div>
      )}
    </PageHub>
  )
}
