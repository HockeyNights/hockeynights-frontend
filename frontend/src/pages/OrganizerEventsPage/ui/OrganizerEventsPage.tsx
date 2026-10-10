/**
 * HOCFRONT-28A/F — кабинет организатора тренировок
 * ORG-2/3 — статусы, табы, регистрации, профиль
 */

import {useQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {Link} from 'react-router'

import {fetchEvents} from '@/entities/event'
import {useSessionAccess} from '@/features/access'
import {CalendarShell} from '@/features/calendar'
import {
  countOrganizerStatuses,
  OrganizerAgreementsPanel,
  OrganizerProfilePanel,
  OrganizerRegistrationsPanel,
  OrganizerTrainingsPanel,
  sortOrganizerEvents,
} from '@/features/events'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {PageBackLink} from '@/shared/ui/PageBackLink'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'
import {PageStatePanel} from '@/shared/ui/PageStatePanel'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {SectionHeading} from '@/shared/ui/SectionHeading'

type CabinetTab = 'trainings' | 'agreements' | 'calendar' | 'registrations' | 'profile'

interface CabinetTabMeta {
  key: CabinetTab
  label: string
  /** Подзаголовок вкладки внутри hero-карточки */
  heroTitle?: string
  heroHint?: string
  /** Подпись секции над панелью вкладки */
  sectionTitle?: string
}

const CABINET_TABS: CabinetTabMeta[] = [
  {key: 'trainings', label: 'Тренировки'},
  {
    key: 'agreements',
    label: 'Договорённости',
    heroTitle: 'Заявки на лёд',
    heroHint:
      'Статусы от черновика до подтверждённой брони. Краткая инфа, телефон арены и чат — в карточке заявки.',
  },
  {key: 'calendar', label: 'Календарь'},
  {key: 'registrations', label: 'Участники', sectionTitle: 'Участники и заявки'},
  {key: 'profile', label: 'Профиль', sectionTitle: 'Профиль организатора'},
]

export function OrganizerEventsPage() {
  const {userId, session, canOrganizeEvents, isLoading: sessionLoading} = useSessionAccess()
  const [tab, setTab] = useState<CabinetTab>('trainings')
  const {
    data: events = [],
    isLoading: eventsLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    enabled: Boolean(userId) && canOrganizeEvents,
  })

  const mine = useMemo(
    () =>
      sortOrganizerEvents(
        events.filter(
          (event) =>
            Boolean(userId) &&
            event.organizerUserId === userId &&
            (event.type === 'training' || event.type === 'game'),
        ),
      ),
    [events, userId],
  )

  const counts = useMemo(() => countOrganizerStatuses(mine), [mine])
  const isLoading = sessionLoading || eventsLoading

  if (sessionLoading) {
    return (
      <PageHub data-testid={testId('events', 'organizer-page', 'loader', 'session')}>
        <ScoreboardLoader label="Проверка сессии…" />
      </PageHub>
    )
  }

  if (!canOrganizeEvents) {
    return (
      <PageHub data-testid={testId('events', 'organizer-page', 'page', 'denied')}>
        <PageBackLink
          to={routes.events}
          label="К разделу"
          testIdPrefix="events"
          testIdSection="organizer-page"
        />
        <PageStatePanel
          title="Нет доступа"
          copy="Кабинет организатора тренировок доступен организатору, админу клуба, капитану, тренеру или администратору."
          testIdPrefix="events"
          data-testid={testId('events', 'organizer-page', 'card', 'denied')}
        />
      </PageHub>
    )
  }

  const activeTab = CABINET_TABS.find((item) => item.key === tab)

  return (
    <PageHub
      className="organizer-cabinet fin-pc"
      data-testid={testId('events', 'organizer-page', 'page')}
    >
      <div
        className="hockey-segmented organizer-cabinet__tabs"
        role="tablist"
        aria-label="Разделы кабинета"
        data-testid={testId('events', 'organizer-page', 'panel', 'tabs')}
      >
        {CABINET_TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={`hockey-segmented__item${tab === item.key ? ' is-active' : ''}`}
            onClick={() => setTab(item.key)}
            data-testid={testId('events', 'organizer-page', 'btn', `tab-${item.key}`)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section
        className="organizer-cabinet__hero"
        data-testid={testId('events', 'organizer-page', 'card', 'hero')}
      >
        <PageHeader
          title="Кабинет организатора тренировок"
          subtitle={
            tab === 'trainings'
              ? `Тренировки, договорённости по льду, календарь, участники и профиль — всего ${mine.length} · набор ${counts.open} · заполнены ${counts.full} · черновики ${counts.draft}`
              : 'Тренировки, договорённости по льду, календарь, участники и профиль —'
          }
          testIdPrefix="events"
          testIdSection="organizer-page"
          actions={
            tab === 'trainings' ? (
              <div className="page-hub__actions">
                <Link
                  to={routes.eventsCreate}
                  data-testid={testId('events', 'organizer-page', 'link', 'create')}
                >
                  <HockeyButton
                    view="action"
                    size="m"
                    data-testid={testId('events', 'organizer-page', 'btn', 'create')}
                  >
                    Создать
                  </HockeyButton>
                </Link>
                <Link
                  to={routes.events}
                  data-testid={testId('events', 'organizer-page', 'link', 'back')}
                >
                  <HockeyButton
                    view="outlined"
                    size="m"
                    data-testid={testId('events', 'organizer-page', 'btn', 'back')}
                  >
                    К каталогу
                  </HockeyButton>
                </Link>
              </div>
            ) : undefined
          }
        />
        {activeTab?.heroTitle ? (
          <div className="organizer-cabinet__hero-sub">
            <h2
              className="organizer-cabinet__hero-title"
              data-testid={testId('events', 'organizer-page', 'text', 'tab-title')}
            >
              {activeTab.heroTitle}
            </h2>
            {activeTab.heroHint ? (
              <p className="organizer-cabinet__hero-hint">{activeTab.heroHint}</p>
            ) : null}
          </div>
        ) : null}
      </section>

      <div className={`page-hub__panel organizer-cabinet__panel organizer-cabinet__panel--${tab}`}>
        {activeTab?.sectionTitle ? <SectionHeading title={activeTab.sectionTitle} /> : null}
        {isLoading ? (
          <div data-testid={testId('events', 'organizer-page', 'loader')}>
            <ScoreboardLoader label="Загрузка…" />
          </div>
        ) : isError ? (
          <QueryErrorState
            title="Не удалось загрузить тренировки"
            onRetry={() => void refetch()}
            testIdPrefix="events"
            data-testid={testId('events', 'organizer-page', 'error')}
          />
        ) : (
          <>
            {tab === 'trainings' ? <OrganizerTrainingsPanel events={mine} /> : null}

            {tab === 'agreements' ? <OrganizerAgreementsPanel /> : null}

            {tab === 'calendar' ? (
              <div data-testid={testId('events', 'organizer-page', 'panel', 'calendar')}>
                <CalendarShell title="Календарь организатора" />
              </div>
            ) : null}

            {tab === 'registrations' ? <OrganizerRegistrationsPanel events={mine} /> : null}

            {tab === 'profile' ? (
              <OrganizerProfilePanel
                events={mine}
                displayName={session?.user.displayName ?? 'Организатор'}
                userId={userId}
              />
            ) : null}
          </>
        )}
      </div>
    </PageHub>
  )
}
