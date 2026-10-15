/**
 * SPEC-FR-6.1.1, SPEC-FR-6.1.2, SPEC-FR-6.2.1, SPEC-FR-6.3.1
 * SPEC-UI-2.2, SPEC-UI-3.1
 * HOCFRONT-32 — каталог; карточка арены → /arenas/:arenaId
 */

import {useQuery} from '@tanstack/react-query'
import {useEffect, useMemo, useRef, useState} from 'react'
import {useNavigate, useSearchParams} from 'react-router'

import type {
  ArenaBookingMode,
  ArenaCityRegion,
  ArenaFilters as ArenaFiltersType,
} from '@/entities/arena'
import {
  arenaHasFreeSlots,
  fetchArenas,
  fetchArenaSlots,
  fetchPublishedIceListings,
} from '@/entities/arena'
import {type ArenaCatalogView, ArenaFilters, ArenaMap, RinkCard} from '@/features/arenas'
import {ARENAS_PAGE_TITLE} from '@/shared/config/navigationLabels'
import {arenaDetailsPath} from '@/shared/const/appRoutes'
import {useDocumentTitle} from '@/shared/hooks/useDocumentTitle'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {IceSkeleton} from '@/shared/ui/IceSkeleton'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {ScrollReveal} from '@/shared/ui/ScrollStory'
import {SectionHeading} from '@/shared/ui/SectionHeading'

const EMPTY_FILTERS: ArenaFiltersType = {}

const VIEW_OPTIONS: Array<{id: ArenaCatalogView; label: string}> = [
  {id: 'list', label: 'Список'},
  {id: 'map', label: 'Карта'},
]

function hasActiveFilters(filters: ArenaFiltersType): boolean {
  return Object.values(filters).some((v) => v !== undefined && v !== '' && v !== false)
}

function uniqueSorted(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))].sort((a, b) =>
    a.localeCompare(b, 'ru'),
  )
}

function viewFromSearchParams(params: URLSearchParams): ArenaCatalogView {
  return params.get('view') === 'map' ? 'map' : 'list'
}

function filtersFromSearchParams(params: URLSearchParams): ArenaFiltersType {
  const cityRegion = params.get('city')
  return {
    query: params.get('q') || undefined,
    cityRegion:
      cityRegion === 'moscow' || cityRegion === 'moscow_oblast'
        ? (cityRegion as ArenaCityRegion)
        : undefined,
    district: params.get('district') || undefined,
    metro: params.get('metro') || undefined,
    amenity: params.get('amenity') || undefined,
    bookingMode:
      params.get('bookingMode') === 'slot_calendar' ||
      params.get('bookingMode') === 'external_portal'
        ? (params.get('bookingMode') as ArenaBookingMode)
        : undefined,
    hasFreeSlots: params.get('hasFreeSlots') === 'true' ? true : undefined,
  }
}

function writeFiltersToSearchParams(
  filters: ArenaFiltersType,
  view: ArenaCatalogView,
): URLSearchParams {
  const next = new URLSearchParams()
  if (filters.query) next.set('q', filters.query)
  if (filters.cityRegion) next.set('city', filters.cityRegion)
  if (filters.district) next.set('district', filters.district)
  if (filters.metro) next.set('metro', filters.metro)
  if (filters.amenity) next.set('amenity', filters.amenity)
  if (filters.bookingMode) next.set('bookingMode', filters.bookingMode)
  if (filters.hasFreeSlots) next.set('hasFreeSlots', 'true')
  if (view === 'map') next.set('view', 'map')
  return next
}

/**
 * @spec SPEC-FR-6.1.1 - Страница списка и карты арен
 * @spec SPEC-FR-6.1.2 - Фильтрация и синхронизация списка и карты
 * @spec SPEC-FR-6.2.1 - Выбор арены открывает страницу деталей
 */
export function ArenasPage() {
  useDocumentTitle(ARENAS_PAGE_TITLE)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const legacyArenaId = searchParams.get('arenaId')

  const [filters, setFilters] = useState<ArenaFiltersType>(() =>
    filtersFromSearchParams(searchParams),
  )
  const [view, setView] = useState<ArenaCatalogView>(() => viewFromSearchParams(searchParams))
  const [selectedArenaId, setSelectedArenaId] = useState<string | null>(null)
  const mapSectionRef = useRef<HTMLElement | null>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())

  // Старые ссылки ?arenaId= → полноценная страница арены
  useEffect(() => {
    if (!legacyArenaId) return
    navigate(arenaDetailsPath(legacyArenaId), {replace: true})
  }, [legacyArenaId, navigate])

  const {
    data: arenas = [],
    isPending,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['arenas', filters],
    queryFn: () => fetchArenas(filters),
    placeholderData: (previous) => previous,
  })

  // Опции «Район» / «Метро» берём из полного каталога, иначе фильтр сам себя сужает.
  const {data: catalogArenas = []} = useQuery({
    queryKey: ['arenas', EMPTY_FILTERS],
    queryFn: () => fetchArenas(EMPTY_FILTERS),
  })
  const districtOptions = useMemo(
    () => uniqueSorted(catalogArenas.map((a) => a.district)),
    [catalogArenas],
  )
  const metroOptions = useMemo(
    () => uniqueSorted(catalogArenas.map((a) => a.metro)),
    [catalogArenas],
  )

  const activeArenaId =
    selectedArenaId && arenas.some((a) => a.id === selectedArenaId)
      ? selectedArenaId
      : (arenas[0]?.id ?? null)

  const {data: allSlots = []} = useQuery({
    queryKey: ['arena-slots-all', arenas.map((arena) => arena.id).join(',')],
    queryFn: async () => {
      const slotGroups = await Promise.all(arenas.map((arena) => fetchArenaSlots(arena.id)))
      return slotGroups.flat()
    },
    enabled: arenas.length > 0,
  })

  const freeSlotArenaIds = useMemo(
    () => new Set(arenas.filter((a) => arenaHasFreeSlots(a.id, allSlots)).map((a) => a.id)),
    [allSlots, arenas],
  )

  const {data: publishedListings = []} = useQuery({
    queryKey: ['ice-listings-published'],
    queryFn: fetchPublishedIceListings,
  })

  const publishedListingsByArena = useMemo(() => {
    const map = new Map<string, number>()
    for (const listing of publishedListings) {
      map.set(listing.arenaId, (map.get(listing.arenaId) ?? 0) + 1)
    }
    return map
  }, [publishedListings])

  const syncUrl = (nextFilters: ArenaFiltersType, nextView: ArenaCatalogView) => {
    setSearchParams(writeFiltersToSearchParams(nextFilters, nextView), {replace: true})
  }

  const applyFilters = (nextFilters: ArenaFiltersType) => {
    setFilters(nextFilters)
    syncUrl(nextFilters, view)
  }

  const handleViewChange = (nextView: ArenaCatalogView) => {
    setView(nextView)
    syncUrl(filters, nextView)
    if (nextView === 'map') {
      requestAnimationFrame(() => {
        const node = mapSectionRef.current
        if (node && typeof node.scrollIntoView === 'function') {
          node.scrollIntoView({behavior: 'smooth', block: 'start'})
        }
      })
    }
  }

  const openArena = (id: string) => {
    setSelectedArenaId(id)
    navigate(arenaDetailsPath(id))
  }

  const handleResetFilters = () => {
    applyFilters(EMPTY_FILTERS)
  }

  const isFiltered = hasActiveFilters(filters)
  const showLayout = !isPending && !isError && !legacyArenaId
  const showEmpty = showLayout && arenas.length === 0
  const showProgress = isFetching && !isPending

  return (
    <PageHub className="arenas-page" data-testid={testId('arenas', 'page')}>
      <div
        className={`arenas-page__progress${showProgress ? ' arenas-page__progress--active' : ''}`}
        aria-hidden
        data-testid={testId('arenas', 'page', 'progress')}
      />
      <ScrollReveal direction="down">
        <ArenaFilters
          filters={filters}
          onChange={applyFilters}
          onReset={handleResetFilters}
          districtOptions={districtOptions}
          metroOptions={metroOptions}
          resultsCount={arenas.length}
          resultsPending={isFetching}
          header={
            <PageHeader
              title={ARENAS_PAGE_TITLE}
              subtitle="Найдите площадку рядом: список, карта и свободные слоты"
              testIdPrefix="arenas"
              actions={
                <div
                  className="arenas-view-toggle"
                  role="group"
                  aria-label="Режим просмотра"
                  data-testid={testId('arenas', 'filters', 'panel', 'view')}
                >
                  {VIEW_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`arenas-view-toggle__btn${view === option.id ? ' is-active' : ''}`}
                      aria-pressed={view === option.id}
                      onClick={() => handleViewChange(option.id)}
                      data-testid={testId('arenas', 'filters', 'btn', 'view', option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              }
            />
          }
        />
      </ScrollReveal>

      {isPending && (
        <div data-testid={testId('arenas', 'page', 'loader')}>
          <ScoreboardLoader label="Загрузка ледовых арен" />
          <div className="arenas-page__skeleton">
            <IceSkeleton height={380} />
            <IceSkeleton count={2} height={200} />
          </div>
        </div>
      )}

      {isError && !isPending && (
        <QueryErrorState
          title="Не удалось загрузить ледовые арены"
          onRetry={() => refetch()}
          testIdPrefix="arenas"
          data-testid={testId('arenas', 'page', 'error')}
        />
      )}

      {showEmpty && (
        <div data-testid={testId('arenas', 'page', 'empty')}>
          <EmptyNetState
            title="Пустая сетка"
            copy="По выбранным фильтрам ледовые арены не найдены."
            action={
              isFiltered ? (
                <HockeyButton
                  view="outlined"
                  size="s"
                  onClick={handleResetFilters}
                  data-testid={testId('arenas', 'page', 'btn', 'reset')}
                >
                  Сбросить фильтры
                </HockeyButton>
              ) : undefined
            }
          />
        </div>
      )}

      {showLayout && arenas.length > 0 && (
        <div
          className={`arenas-page__layout arenas-page__layout--${view} arenas-page__layout--catalog`}
          aria-busy={showProgress}
          data-testid={testId('arenas', 'page', 'layout')}
        >
          {view === 'list' && (
            <section className="arenas-page__catalog">
              <SectionHeading
                title="Поиск по списку"
                data-testid={testId('arenas', 'page', 'text', 'list-title')}
              />
              <div
                className={`arenas-page__list${showProgress ? ' arenas-page__list--refreshing' : ''}`}
                role="list"
                aria-label="Список ледовых арен"
                data-testid={testId('arenas', 'page', 'list')}
              >
                {arenas.map((arena) => (
                  <ScrollReveal key={arena.id} direction="up">
                    <RinkCard
                      ref={(node) => {
                        if (node) cardRefs.current.set(arena.id, node)
                        else cardRefs.current.delete(arena.id)
                      }}
                      arena={arena}
                      selected={arena.id === activeArenaId}
                      onOpenDetails={openArena}
                      hasFreeSlot={
                        arena.bookingMode === 'slot_calendar'
                          ? arenaHasFreeSlots(arena.id, allSlots)
                          : undefined
                      }
                      publishedListingsCount={publishedListingsByArena.get(arena.id) ?? 0}
                    />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}

          {view === 'map' && (
            <section
              ref={mapSectionRef}
              className="arenas-page__map"
              data-testid={testId('arenas', 'page', 'card', 'map')}
            >
              <SectionHeading
                title="Поиск по карте"
                data-testid={testId('arenas', 'page', 'text', 'map-title')}
              />
              <IceCard padding="m" className="arenas-page__map-card">
                <ArenaMap
                  arenas={arenas}
                  selectedArenaId={activeArenaId}
                  onSelectArena={openArena}
                  freeSlotArenaIds={freeSlotArenaIds}
                />
              </IceCard>
            </section>
          )}
        </div>
      )}
    </PageHub>
  )
}
