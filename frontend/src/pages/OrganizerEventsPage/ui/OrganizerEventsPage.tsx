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

type CabinetTab = 'trainings' | 'agreements' | 'calendar' | 'registrations' | 'profile'

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

  return (
    <PageHub data-testid={testId('events', 'organizer-page', 'page')}>
      <PageHeader
        title="Кабинет организатора тренировок"
        subtitle={`Тренировки, договорённости по льду, календарь, участники и профиль · всего ${mine.length} · набор ${counts.open} · заполнены ${counts.full} · черновики ${counts.draft}`}
        testIdPrefix="events"
        testIdSection="organizer-page"
        actions={
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
        }
      />

      <div
        className="page-hub__toolbar"
        data-testid={testId('events', 'organizer-page', 'panel', 'tabs')}
      >
        <div className="page-hub__tabs" role="group" aria-label="Разделы кабинета">
          <HockeyButton
            view={tab === 'trainings' ? 'action' : 'outlined'}
            size="s"
            onClick={() => setTab('trainings')}
            data-testid={testId('events', 'organizer-page', 'btn', 'tab-trainings')}
          >
            Тренировки
          </HockeyButton>
          <HockeyButton
            view={tab === 'agreements' ? 'action' : 'outlined'}
            size="s"
            onClick={() => setTab('agreements')}
            data-testid={testId('events', 'organizer-page', 'btn', 'tab-agreements')}
          >
            Договорённости
          </HockeyButton>
          <HockeyButton
            view={tab === 'calendar' ? 'action' : 'outlined'}
            size="s"
            onClick={() => setTab('calendar')}
            data-testid={testId('events', 'organizer-page', 'btn', 'tab-calendar')}
          >
            Календарь
          </HockeyButton>
          <HockeyButton
            view={tab === 'registrations' ? 'action' : 'outlined'}
            size="s"
            onClick={() => setTab('registrations')}
            data-testid={testId('events', 'organizer-page', 'btn', 'tab-registrations')}
          >
            Участники
          </HockeyButton>
          <HockeyButton
            view={tab === 'profile' ? 'action' : 'outlined'}
            size="s"
            onClick={() => setTab('profile')}
            data-testid={testId('events', 'organizer-page', 'btn', 'tab-profile')}
          >
            Профиль
          </HockeyButton>
        </div>
      </div>

      <div className="page-hub__panel">
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
