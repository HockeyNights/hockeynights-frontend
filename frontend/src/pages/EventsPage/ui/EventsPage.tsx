/**
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.3.1, SPEC-FR-4.3.2
 * SPEC-UI-2.5, SPEC-UI-3.1
 * HOCFRONT-28A/28C — каталог с вкладками, chips и URL-фильтрами
 */

import {Select, Text, TextInput} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useId, useMemo, useRef, useState} from 'react'
import {Link, useSearchParams} from 'react-router'

import {LEAGUE_SATURDAY_EVENT_ID} from '@/entities/event'
import {fetchEvents} from '@/entities/event'
import {fetchTeams} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {
  ACCESS_SCOPE_FILTER_OPTIONS,
  canViewTraining,
  CATALOG_CHIPS,
  CATALOG_TABS,
  type CatalogChipId,
  type CatalogFiltersState,
  type CatalogTab,
  countActiveCatalogFilters,
  DEFAULT_CATALOG_FILTERS,
  EventCard,
  eventNeedsGoalie,
  getUserClubIds,
  getUserTeamIds,
  isCatalogChipActive,
  isPlayerCatalogEvent,
  isUpcomingEvent,
  matchesAccessScopeFilter,
  matchesCatalogDateFilters,
  parseCatalogFilters,
  serializeCatalogFilters,
  SKILL_LEVEL_FILTER_OPTIONS,
  toggleCatalogChip,
  TRAINING_FORMAT_FILTER_OPTIONS,
} from '@/features/events'
import {LeagueGameRsvp, TeamRsvpList} from '@/features/radar'
import {getApiMode} from '@/shared/config/apiMode'
import {LAUNCH_REGION} from '@/shared/config/geo'
import {EVENTS_LABEL} from '@/shared/config/navigationLabels'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {CatalogFilterBar, CatalogFilterField} from '@/shared/ui/CatalogFilterBar'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {HockeyRinkLoader} from '@/shared/ui/HockeyRinkLoader'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScrollReveal} from '@/shared/ui/ScrollStory'

const MOCK_RESULTS_LOADER_MS = 3000
const RESULTS_LOADER_MS =
  isDemoLoaderEnabled() && getApiMode() === 'mock' && import.meta.env.MODE !== 'test'
    ? MOCK_RESULTS_LOADER_MS
    : 240

function isDemoLoaderEnabled(): boolean {
  return import.meta.env.VITE_DEMO_LOADER !== 'false'
}

const SHOW_MOCK_DEMO_LOADER =
  isDemoLoaderEnabled() && getApiMode() === 'mock' && import.meta.env.MODE !== 'test'

const TAB_TITLES: Record<CatalogTab, string> = {
  'for-me': 'Для меня',
  training: 'Тренировки',
  game: 'Игры',
  my: 'Мои записи',
}

/**
 * @spec SPEC-UI-2.5 - Раздел «Игры и тренировки»
 * @spec SPEC-FR-4.1.1 - Список будущих игр и тренировок
 * @spec HOCFRONT-28A - каталог игрока отдельно от create/organizer
 * @spec HOCFRONT-28C - chips + URLSearchParams
 */
export function EventsPage() {
  const {
    data: events = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({queryKey: ['events'], queryFn: fetchEvents})
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: () => fetchTeams()})
  const {userId, roles, session, canOrganizeEvents} = useSessionAccess()
  const canSeeDeclineDetails =
    roles.includes('captain') || roles.includes('coach') || roles.includes('admin')
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseCatalogFilters(searchParams), [searchParams])

  const upcomingCatalog = useMemo(
    () =>
      events
        .filter(
          (event) =>
            (event.type === 'training' || event.type === 'game') &&
            isPlayerCatalogEvent(event) &&
            isUpcomingEvent(event.startsAt),
        )
        .slice()
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [events],
  )

  const dateFieldId = useId()
  const [isNearestGameVisible, setIsNearestGameVisible] = useState(false)
  const [isResultsLoading, setIsResultsLoading] = useState(false)
  const [isDemoLoaderVisible, setIsDemoLoaderVisible] = useState(SHOW_MOCK_DEMO_LOADER)
  const didMountRef = useRef(false)

  useEffect(() => {
    if (!SHOW_MOCK_DEMO_LOADER) return
    const timer = window.setTimeout(() => {
      setIsDemoLoaderVisible(false)
    }, MOCK_RESULTS_LOADER_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const userTeamIds = useMemo(() => getUserTeamIds(teams, userId), [teams, userId])
  const userClubIds = useMemo(() => getUserClubIds(teams, userId), [teams, userId])
  const isAdmin = roles.includes('admin')
  const clubMembershipIds = useMemo(
    () =>
      new Set(
        (session?.user.partnerMemberships ?? [])
          .filter((membership) => membership.kind === 'club')
          .map((membership) => membership.entityId),
      ),
    [session?.user.partnerMemberships],
  )
  const allUserClubIds = useMemo(
    () => [...new Set([...userClubIds, ...clubMembershipIds])],
    [userClubIds, clubMembershipIds],
  )

  const formatOptions = [...TRAINING_FORMAT_FILTER_OPTIONS]
  const timeOptions = [
    {value: 'all', content: 'Любое время'},
    {value: 'morning', content: 'Утро (06:00-11:59)'},
    {value: 'day', content: 'День (12:00-17:59)'},
    {value: 'evening', content: 'Вечер (18:00-23:59)'},
  ]
  const levelOptions = [...SKILL_LEVEL_FILTER_OPTIONS]
  const statusOptions = [
    {value: 'all', content: 'Любой статус'},
    {value: 'open', content: 'Открыт для записи'},
    {value: 'full', content: 'Состав укомплектован'},
  ]
  const accessOptions = [...ACCESS_SCOPE_FILTER_OPTIONS]
  const fillStateOptions = [
    {value: 'all', content: 'Любая заполненность'},
    {value: 'guaranteed', content: 'Точно состоится'},
    {value: 'questionable', content: 'Под вопросом'},
    {value: 'full', content: 'Полностью укомплектована'},
  ]
  const arenaOptions = [
    {value: 'all', content: 'Любая арена'},
    ...Array.from(new Set(upcomingCatalog.map((item) => item.arenaId))).map((arenaId) => ({
      value: arenaId,
      content: upcomingCatalog.find((item) => item.arenaId === arenaId)?.arenaName ?? arenaId,
    })),
  ]
  const districtOptions = [
    {value: 'all', content: 'Любой округ'},
    ...Array.from(new Set(upcomingCatalog.map((item) => item.district).filter(Boolean))).map(
      (district) => ({
        value: district!,
        content: district!,
      }),
    ),
  ]

  const activeFilterCount = countActiveCatalogFilters(filters)
  const catalogChips = useMemo(
    () =>
      CATALOG_CHIPS.map((chip) => ({
        id: chip.id,
        label: chip.label,
        active: isCatalogChipActive(chip.id, filters),
      })),
    [filters],
  )

  function patchFilters(patch: Partial<CatalogFiltersState>) {
    const next = {...filters, ...patch}
    setSearchParams(serializeCatalogFilters(next), {replace: true})
  }

  function resetFilters() {
    setSearchParams(serializeCatalogFilters({...DEFAULT_CATALOG_FILTERS, tab: filters.tab}), {
      replace: true,
    })
  }

  const filteredCatalog = upcomingCatalog
    .filter((item) => {
      if (filters.tab === 'training') return item.type === 'training'
      if (filters.tab === 'game') return item.type === 'game'
      if (filters.tab === 'my') {
        const status = item.participation.find((entry) => entry.userId === userId)?.status
        // Командный RSVP: в «Мои» только confirmed (attendance = going).
        // pending/declined мапятся в not_going и сюда не попадают.
        if (item.hasTeamRsvp) return status === 'going'
        return status === 'going' || status === 'maybe'
      }
      return true
    })
    .filter((item) =>
      canViewTraining(item, userId, userTeamIds, {
        isAdmin,
        canManageClub: Boolean(item.clubId && clubMembershipIds.has(item.clubId)),
        userClubIds: allUserClubIds,
      }),
    )
    .filter((item) => {
      const query = filters.q.trim().toLowerCase()
      if (!query) return true
      const haystack = [
        item.title,
        item.arenaName,
        item.arenaId,
        item.district,
        item.requiredSkillLevel,
        item.trainingFormat,
        item.organizerDisplayName,
        item.organizerPhone,
        item.type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
    .filter((item) => matchesCatalogDateFilters(item.startsAt, filters))
    .filter((item) => {
      if (filters.format === 'all') return true
      if (item.type !== 'training') return true
      return item.trainingFormat === filters.format
    })
    .filter((item) => {
      if (filters.level === 'all') return true
      return item.requiredSkillLevel === filters.level
    })
    .filter((item) => {
      if (filters.arena === 'all') return true
      return item.arenaId === filters.arena
    })
    .filter((item) => {
      if (filters.status === 'all') return true
      return item.registrationStatus === filters.status
    })
    .filter((item) => {
      if (filters.district === 'all') return true
      return item.district === filters.district
    })
    .filter((item) => {
      if (item.type !== 'training' && filters.access !== 'all') return true
      return matchesAccessScopeFilter(item.accessScope, filters.access)
    })
    .filter((item) => {
      if (filters.fill === 'all') return true
      const requiredTotal = item.requiredSlots.reduce((acc, slot) => acc + slot.count, 0)
      const filledTotal = item.requiredSlots.reduce((acc, slot) => acc + slot.filledCount, 0)
      const fillRatio = requiredTotal > 0 ? filledTotal / requiredTotal : 0
      if (filters.fill === 'full') {
        return item.registrationStatus === 'full' || fillRatio >= 1
      }
      if (filters.fill === 'guaranteed') {
        return fillRatio >= 0.7 || item.registrationStatus === 'full'
      }
      return fillRatio < 0.7 && item.registrationStatus !== 'full'
    })
    .filter((item) => {
      const price = item.pricePerPlayer ?? 0
      if (filters.minPrice && price < Number(filters.minPrice)) return false
      return !(filters.maxPrice && price > Number(filters.maxPrice))
    })
    .filter((item) => (filters.needsGoalie ? eventNeedsGoalie(item) : true))

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    setIsResultsLoading(true)
    const timer = window.setTimeout(() => {
      setIsResultsLoading(false)
    }, RESULTS_LOADER_MS)
    return () => window.clearTimeout(timer)
  }, [filters])

  return (
    <PageHub data-testid={testId('events', 'page')}>
      <ScrollReveal direction="down">
        <div className="hockey-stack hockey-stack--gap-8">
          <PageHeader
            title={EVENTS_LABEL}
            subtitle="Найдите будущую тренировку или игру и запишитесь. Создание — отдельным экраном."
            testIdPrefix="events"
            actions={
              canOrganizeEvents ? (
                <div
                  className="hockey-row hockey-row--gap-8"
                  data-testid={testId('events', 'page', 'panel', 'organizer-actions')}
                >
                  <Link
                    to={routes.eventsCreate}
                    data-testid={testId('events', 'page', 'link', 'create')}
                  >
                    <HockeyButton
                      view="action"
                      size="m"
                      data-testid={testId('events', 'page', 'btn', 'create')}
                    >
                      Создать
                    </HockeyButton>
                  </Link>
                  <Link
                    to={routes.eventsOrganizer}
                    data-testid={testId('events', 'page', 'link', 'organizer')}
                  >
                    <HockeyButton
                      view="outlined"
                      size="m"
                      data-testid={testId('events', 'page', 'btn', 'organizer')}
                    >
                      Кабинет организатора
                    </HockeyButton>
                  </Link>
                </div>
              ) : undefined
            }
          />
          <Text color="secondary" data-testid={testId('events', 'page', 'text', 'geoblock')}>
            Геоблок MVP: {LAUNCH_REGION}
          </Text>
        </div>
      </ScrollReveal>

      <CatalogFilterBar
        testIdPrefix="events"
        searchValue={filters.q}
        onSearchChange={(value) => patchFilters({q: value})}
        searchPlaceholder="Название, арена, округ, организатор…"
        searchLabel="Поиск игр и тренировок"
        chips={catalogChips}
        onChipToggle={(chipId) => patchFilters(toggleCatalogChip(chipId as CatalogChipId, filters))}
        activeCount={activeFilterCount}
        onReset={resetFilters}
        resultsCount={filteredCatalog.length}
        resultsPending={isLoading || isResultsLoading || isDemoLoaderVisible}
        toolbar={
          <div
            className="page-hub__tabs"
            data-testid={testId('events', 'page', 'panel', 'type-tabs')}
          >
            {CATALOG_TABS.map((tab) => (
              <HockeyButton
                key={tab.id}
                view={filters.tab === tab.id ? 'action' : 'outlined'}
                size="s"
                onClick={() => patchFilters({tab: tab.id})}
                data-testid={testId('events', 'page', 'btn', 'type', tab.id)}
              >
                {tab.label}
              </HockeyButton>
            ))}
          </div>
        }
        advanced={
          <>
            <CatalogFilterField label="Дата" htmlFor={dateFieldId}>
              <input
                id={dateFieldId}
                type="date"
                className="catalog-filters__native-input"
                value={filters.date}
                onChange={(event) => patchFilters({date: event.target.value, dayPreset: null})}
                data-testid={testId('events', 'page', 'field', 'date')}
              />
            </CatalogFilterField>
            <Select
              label="Формат"
              value={[filters.format]}
              onUpdate={(value) => patchFilters({format: value[0] ?? 'all'})}
              options={formatOptions}
              data-testid={testId('events', 'page', 'select', 'format')}
            />
            <Select
              label="Время"
              value={[filters.time]}
              onUpdate={(value) => patchFilters({time: value[0] ?? 'all'})}
              options={timeOptions}
              data-testid={testId('events', 'page', 'select', 'time')}
            />
            <Select
              label="Уровень"
              value={[filters.level]}
              onUpdate={(value) => patchFilters({level: value[0] ?? 'all'})}
              options={levelOptions}
              data-testid={testId('events', 'page', 'select', 'level')}
            />
            <Select
              label="Арена"
              value={[filters.arena]}
              onUpdate={(value) => patchFilters({arena: value[0] ?? 'all'})}
              options={arenaOptions}
              data-testid={testId('events', 'page', 'select', 'arena')}
            />
            <Select
              label="Статус"
              value={[filters.status]}
              onUpdate={(value) => patchFilters({status: value[0] ?? 'all'})}
              options={statusOptions}
              data-testid={testId('events', 'page', 'select', 'status')}
            />
            <Select
              label="Округ"
              value={[filters.district]}
              onUpdate={(value) => patchFilters({district: value[0] ?? 'all'})}
              options={districtOptions}
              data-testid={testId('events', 'page', 'select', 'district')}
            />
            <Select
              label="Доступ"
              value={[filters.access]}
              onUpdate={(value) => patchFilters({access: value[0] ?? 'all'})}
              options={accessOptions}
              data-testid={testId('events', 'page', 'select', 'access')}
            />
            <Select
              label="Заполненность"
              value={[filters.fill]}
              onUpdate={(value) => patchFilters({fill: value[0] ?? 'all'})}
              options={fillStateOptions}
              data-testid={testId('events', 'page', 'select', 'fill-state')}
            />
            <TextInput
              label="Цена от"
              controlProps={{inputMode: 'numeric'}}
              value={filters.minPrice}
              onUpdate={(value) => patchFilters({minPrice: value})}
              data-testid={testId('events', 'page', 'field', 'price-min')}
            />
            <TextInput
              label="Цена до"
              controlProps={{inputMode: 'numeric'}}
              value={filters.maxPrice}
              onUpdate={(value) => patchFilters({maxPrice: value})}
              data-testid={testId('events', 'page', 'field', 'price-max')}
            />
          </>
        }
      />

      {(isLoading || isResultsLoading || isDemoLoaderVisible) && (
        <div data-testid={testId('events', 'page', 'loader')}>
          <HockeyRinkLoader
            label={
              isLoading || isDemoLoaderVisible
                ? 'Загрузка игр и тренировок...'
                : 'Обновляем результаты...'
            }
            testIdPrefix="events"
          />
        </div>
      )}

      {isError && !isLoading && (
        <QueryErrorState
          title="Не удалось загрузить игры и тренировки"
          onRetry={() => void refetch()}
          testIdPrefix="events"
          data-testid={testId('events', 'page', 'error')}
        />
      )}

      {!isLoading &&
        !isError &&
        !isResultsLoading &&
        !isDemoLoaderVisible &&
        upcomingCatalog.length === 0 && (
          <div data-testid={testId('events', 'page', 'empty', 'upcoming')}>
            <EmptyNetState
              title="Событий пока нет"
              copy="Ближайшие игры и тренировки появятся здесь."
            />
          </div>
        )}

      {!isLoading &&
        !isError &&
        !isResultsLoading &&
        !isDemoLoaderVisible &&
        filteredCatalog.length > 0 && (
          <div
            className="hockey-stack hockey-stack--gap-12"
            data-testid={testId('events', 'page', 'list', 'details')}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('events', 'page', 'text', 'details-title')}
            >
              {TAB_TITLES[filters.tab]}
            </Text>
            {filteredCatalog.map((event, index) => (
              <ScrollReveal key={event.id} direction={index % 2 === 0 ? 'up' : 'down'}>
                <div id={event.id}>
                  <EventCard event={event} currentUserId={userId} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

      {!isLoading &&
        !isError &&
        !isResultsLoading &&
        !isDemoLoaderVisible &&
        upcomingCatalog.length > 0 &&
        filteredCatalog.length === 0 && (
          <div data-testid={testId('events', 'page', 'empty', 'trainings')}>
            <EmptyNetState
              title={filters.tab === 'my' ? 'Пока нет записей' : 'Ничего не найдено'}
              copy={
                filters.tab === 'my'
                  ? 'Запишитесь на тренировку или игру — они появятся здесь.'
                  : 'Нет будущих событий по текущим фильтрам. Измените вкладку, фильтры или поиск.'
              }
            />
          </div>
        )}

      <div
        className="hockey-stack hockey-stack--gap-12"
        data-testid={testId('events', 'page', 'panel', 'nearest-game')}
      >
        <div className="hockey-row hockey-row--between hockey-row--align-center">
          <Text
            variant="subheader-2"
            data-testid={testId('events', 'page', 'text', 'nearest-game-title')}
          >
            Ближайшая игра команды
          </Text>
          <HockeyButton
            view="outlined"
            size="s"
            onClick={() => setIsNearestGameVisible((prev) => !prev)}
            data-testid={testId('events', 'page', 'btn', 'nearest-game-toggle')}
          >
            {isNearestGameVisible ? 'Скрыть' : 'Показать'}
          </HockeyButton>
        </div>
        {isNearestGameVisible && (
          <div
            className="nearest-game-record"
            data-testid={testId('events', 'page', 'panel', 'league-rsvp')}
          >
            <LeagueGameRsvp eventId={LEAGUE_SATURDAY_EVENT_ID} currentUserId={userId} />
            <TeamRsvpList
              eventId={LEAGUE_SATURDAY_EVENT_ID}
              canSeeDeclineDetails={canSeeDeclineDetails}
            />
          </div>
        )}
      </div>
    </PageHub>
  )
}
