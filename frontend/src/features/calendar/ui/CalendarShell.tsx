/**
 * HOCFRONT-28 — calendar shell UI
 */

import {Select, Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import {useSearchParams} from 'react-router'

import type {AttendanceStatus, EventType} from '@/entities/common'
import {fetchMyIceAgreements} from '@/entities/external-flow'
import {useSessionAccess} from '@/features/access'
import {agreementToCalendarEvent} from '@/features/events'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

import {eventDateKey} from '../lib/calendarDays'
import {
  type CalendarLens,
  calendarLensEmptyCopy,
  calendarScopeTitle,
  type CalendarUiState,
  type CalendarViewMode,
  countActiveCalendarFilters,
  defaultLensFromRoles,
  localDateKey,
  parseCalendarState,
  serializeCalendarState,
} from '../lib/calendarState'
import {filterCalendarEvents, loadCalendarEvents} from '../lib/loadCalendarEvents'
import {AvailabilityWindowsPanel} from './AvailabilityWindowsPanel'
import {CalendarAgenda} from './CalendarAgenda'
import {CalendarFeaturedEvent} from './CalendarFeaturedEvent'
import {CalendarFilters} from './CalendarFilters'
import {CalendarMonthGrid} from './CalendarMonthGrid'
import {CalendarQuickChips} from './CalendarQuickChips'
import {GoalieRequestsInbox} from './GoalieRequestsInbox'

const LENS_OPTIONS: {id: CalendarLens; label: string}[] = [
  {id: 'player', label: 'Игрок'},
  {id: 'goalie', label: 'Вратарь'},
  {id: 'organizer', label: 'Организатор'},
]

export interface CalendarShellProps {
  title?: string
  compact?: boolean
  /** Переопределение варианта заголовка (по умолчанию: compact → subheader-2, иначе header-1) */
  titleVariant?: 'header-1' | 'subheader-2'
  forcedScope?: Pick<CalendarUiState, 'scope' | 'scopeId'>
  showActions?: boolean
}

/**
 * @spec SPEC-FR-4.2.1 - Календарь пользователя
 */
export function CalendarShell({
  title,
  compact = false,
  titleVariant,
  forcedScope,
  showActions = true,
}: CalendarShellProps) {
  const {userId, roles, session} = useSessionAccess()
  const fallbackLens = defaultLensFromRoles(roles, session?.personaId)
  const [searchParams, setSearchParams] = useSearchParams()
  const state = useMemo(() => {
    const parsed = parseCalendarState(searchParams, fallbackLens)
    if (!forcedScope) return parsed
    return {...parsed, scope: forcedScope.scope, scopeId: forcedScope.scopeId}
  }, [searchParams, forcedScope, fallbackLens])

  const {
    data: rawEvents = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['calendar-shell', state.scope, state.scopeId, state.type, state.status],
    queryFn: () => loadCalendarEvents(state),
  })

  const showIceMarkers = !compact && state.scope === 'me' && state.lens === 'organizer'
  const {data: iceAgreements = []} = useQuery({
    queryKey: ['my-ice-agreements'],
    queryFn: fetchMyIceAgreements,
    enabled: showIceMarkers,
  })

  const events = useMemo(() => {
    const markers = showIceMarkers
      ? iceAgreements
          .map((item) => agreementToCalendarEvent(item, userId))
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
      : []
    const known = new Set(rawEvents.map((event) => event.id))
    const merged = [...rawEvents]
    for (const marker of markers) {
      if (!known.has(marker.id)) merged.push(marker)
    }
    return filterCalendarEvents(merged, state, userId)
  }, [rawEvents, state, userId, showIceMarkers, iceAgreements])

  function patchState(patch: Partial<CalendarUiState>) {
    const next: CalendarUiState = {
      ...state,
      ...patch,
      ...(forcedScope ? {scope: forcedScope.scope, scopeId: forcedScope.scopeId} : {}),
    }
    setSearchParams(serializeCalendarState(next), {replace: true})
  }

  function resetFilters() {
    patchState({
      type: '',
      status: '',
      range: null,
      mineOnly: false,
      needsGoalie: false,
      date: localDateKey(),
    })
  }

  const lensTitle =
    state.lens === 'goalie'
      ? 'Календарь вратаря'
      : state.lens === 'organizer'
        ? 'Календарь организатора'
        : 'Календарь игрока'
  const heading = title ?? (state.scope === 'me' ? lensTitle : calendarScopeTitle(state))
  const scopeDenied =
    (state.scope === 'team' || state.scope === 'club' || state.scope === 'player') && !state.scopeId
  const selectedDate = state.date || localDateKey()
  const allowActions = showActions && state.scope !== 'player'
  const showWindows = !compact && state.scope === 'me' && state.lens === 'goalie'
  const showGoalieInbox = !compact && state.scope === 'me' && state.lens === 'goalie'
  const activeFilterCount = countActiveCalendarFilters(state)
  const ready = !isLoading && !isError && !scopeDenied

  const dayEvents = events.filter((event) => eventDateKey(event.startsAt) === selectedDate)
  const featuredEvent =
    dayEvents[0] ?? events.find((event) => eventDateKey(event.startsAt) > selectedDate)
  const featuredOnSelectedDay = Boolean(featuredEvent && dayEvents.includes(featuredEvent))

  const widget = (
    <>
      <header className="hockey-calendar-shell__header">
        <div className="hockey-calendar-shell__title-block">
          <Text
            variant={titleVariant ?? (compact ? 'subheader-2' : 'header-1')}
            className="hockey-calendar-shell__title"
            data-testid={testId('calendar', 'shell', 'text', 'title')}
          >
            {heading}
          </Text>
          <Text
            color="secondary"
            className="hockey-calendar-shell__summary"
            data-testid={testId('calendar', 'shell', 'text', 'summary')}
          >
            {events.length === 0
              ? 'Нет событий по текущим фильтрам'
              : `${eventsCountLabel(events.length)} запланировано`}
            {activeFilterCount > 0 ? ` · фильтров: ${activeFilterCount}` : ''}
          </Text>
        </div>

        <div
          className="hockey-calendar-shell__view-toggle"
          data-testid={testId('calendar', 'shell', 'panel', 'view-toggle')}
          role="group"
          aria-label="Режим просмотра"
        >
          {(['month', 'agenda'] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`hockey-calendar-shell__view-btn${state.view === mode ? ' is-active' : ''}`}
              aria-pressed={state.view === mode}
              onClick={() => patchState({view: mode})}
              data-testid={testId('calendar', 'shell', 'btn', 'view', mode)}
            >
              {mode === 'month' ? 'Месяц' : 'Лента'}
            </button>
          ))}
        </div>
      </header>

      {scopeDenied && (
        <div data-testid={testId('calendar', 'shell', 'empty', 'scope')}>
          <EmptyNetState
            title="Выберите контекст"
            copy="Укажите игрока, команду или клуб, чтобы открыть календарь."
          />
        </div>
      )}

      {isLoading && (
        <div data-testid={testId('calendar', 'shell', 'loader')}>
          <ScoreboardLoader label="Загрузка календаря" />
        </div>
      )}

      {isError && (
        <div data-testid={testId('calendar', 'shell', 'error')}>
          <EmptyNetState title="Не удалось загрузить" copy="Попробуйте обновить страницу." />
        </div>
      )}

      {ready && state.view === 'month' && (
        <>
          <CalendarMonthGrid
            selectedDate={selectedDate}
            events={events}
            onSelectDate={(date) => patchState({date})}
            onNavigateMonth={(date) => patchState({date})}
          />
          {featuredEvent && (
            <CalendarFeaturedEvent
              event={featuredEvent}
              currentUserId={userId}
              showDate={!featuredOnSelectedDay}
            />
          )}
        </>
      )}

      {ready && state.view === 'agenda' && (
        <>
          {events.length === 0 ? (
            <div data-testid={testId('calendar', 'shell', 'empty')}>
              <EmptyNetState title="Пустая сетка" copy={calendarLensEmptyCopy(state.lens)} />
            </div>
          ) : (
            <CalendarAgenda
              selectedDate={selectedDate}
              events={events}
              currentUserId={userId}
              showActions={allowActions}
              showOrganizerMeta={state.lens === 'organizer'}
            />
          )}
        </>
      )}
    </>
  )

  if (compact) {
    return (
      <div
        className="hockey-calendar-shell hockey-calendar-shell--compact"
        data-testid={testId('calendar', 'shell', 'page')}
      >
        {widget}
      </div>
    )
  }

  return (
    <div className="hockey-calendar-shell" data-testid={testId('calendar', 'shell', 'page')}>
      <IceCard
        padding="m"
        className="hockey-calendar-shell__controls"
        data-testid={testId('calendar', 'shell', 'card', 'controls')}
      >
        <Text
          variant="header-1"
          className="hockey-calendar-shell__page-title"
          data-testid={testId('calendar', 'shell', 'text', 'page-title')}
        >
          Календарь
        </Text>

        <div className="hockey-calendar-shell__toolbar">
          <div className="hockey-calendar-shell__toolbar-main">
            <div className="hockey-calendar-shell__lens-block">
              <span
                className="hockey-calendar-shell__lens-hint"
                data-testid={testId('calendar', 'shell', 'text', 'lens-hint')}
              >
                Смотреть как
              </span>
              <div
                className="hockey-calendar-shell__lenses"
                data-testid={testId('calendar', 'shell', 'panel', 'lenses')}
                role="radiogroup"
                aria-label="Смотреть календарь как"
              >
                {LENS_OPTIONS.map((lens) => (
                  <button
                    key={lens.id}
                    type="button"
                    role="radio"
                    aria-checked={state.lens === lens.id}
                    className={`hockey-calendar-shell__lens${state.lens === lens.id ? ' is-active' : ''}`}
                    onClick={() => patchState({lens: lens.id})}
                    data-testid={testId('calendar', 'shell', 'btn', 'lens', lens.id)}
                  >
                    {lens.label}
                  </button>
                ))}
              </div>
            </div>

            <CalendarQuickChips state={state} onChange={patchState} onReset={resetFilters} />
          </div>

          <div
            className="hockey-calendar-shell__filters"
            data-testid={testId('calendar', 'shell', 'panel', 'filters')}
          >
            <CalendarFilters
              stacked
              filters={{
                type: (state.type || undefined) as EventType | undefined,
                attendanceStatus: (state.status || undefined) as AttendanceStatus | undefined,
              }}
              onChange={(filters) =>
                patchState({
                  type: filters.type ?? '',
                  status: filters.attendanceStatus ?? '',
                })
              }
            />
            {!forcedScope && (
              <div
                className="hockey-calendar-shell__scope"
                data-testid={testId('calendar', 'shell', 'panel', 'scope')}
              >
                <Select
                  label="Чей календарь"
                  value={[state.scope]}
                  onUpdate={(value) => {
                    const scope = (value[0] as CalendarUiState['scope']) ?? 'me'
                    patchState({
                      scope,
                      scopeId: scope === 'me' ? '' : state.scopeId,
                    })
                  }}
                  options={[
                    {value: 'me', content: 'Мой'},
                    {value: 'player', content: 'Игрок'},
                    {value: 'team', content: 'Команда'},
                    {value: 'club', content: 'Клуб'},
                  ]}
                  width="max"
                  size="xl"
                  data-testid={testId('calendar', 'shell', 'select', 'scope')}
                />
                {state.scope !== 'me' && (
                  <Select
                    label="Выбор"
                    value={[state.scopeId || '']}
                    onUpdate={(value) => patchState({scopeId: value[0] ?? ''})}
                    options={
                      state.scope === 'team'
                        ? [
                            {value: 'team-001', content: 'Медведи САО'},
                            {value: 'team-002', content: 'Вымпел'},
                          ]
                        : state.scope === 'club'
                          ? [{value: 'club-001', content: 'Клуб Медведи'}]
                          : [
                              {
                                value: userId,
                                content: session?.user.displayName ?? 'Я',
                              },
                              {value: 'user-003', content: 'Дмитрий Козлов'},
                            ].filter((option) => Boolean(option.value))
                    }
                    width="max"
                    size="xl"
                    data-testid={testId('calendar', 'shell', 'select', 'scope-id')}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </IceCard>

      {showGoalieInbox && <GoalieRequestsInbox userId={userId} />}
      {showWindows && <AvailabilityWindowsPanel userId={userId} />}

      <div
        className={`hockey-calendar-shell__layout${state.view === 'month' && ready ? '' : ' hockey-calendar-shell__layout--single'}`}
        data-testid={testId(
          'calendar',
          'shell',
          'panel',
          state.view === 'month' ? 'month-layout' : 'agenda-layout',
        )}
      >
        <IceCard
          padding="m"
          className="hockey-calendar-shell__widget"
          data-testid={testId('calendar', 'shell', 'card', 'widget')}
        >
          {widget}
        </IceCard>

        {ready && state.view === 'month' && (
          <CalendarAgenda
            selectedDate={selectedDate}
            events={events}
            currentUserId={userId}
            showActions={allowActions}
            showOrganizerMeta={state.lens === 'organizer'}
          />
        )}
      </div>
    </div>
  )
}

function eventsCountLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} событие`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} события`
  return `${count} событий`
}
