/**
 * HOCFRONT-28G / ORG-4 — редактирование тренировки
 */

import {useQuery} from '@tanstack/react-query'
import {Link, useParams} from 'react-router'

import {fetchEventById} from '@/entities/event'
import {useSessionAccess} from '@/features/access'
import {EventCreateForm, eventDetailsPath} from '@/features/events'
import {isNotFoundError} from '@/shared/api/client'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {PageBackLink} from '@/shared/ui/PageBackLink'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'
import {PageStatePanel} from '@/shared/ui/PageStatePanel'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

export function EditTrainingPage() {
  const {eventId = ''} = useParams()
  const {userId, canOrganizeEvents, roles, isLoading: sessionLoading} = useSessionAccess()
  const {
    data: event,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEventById(eventId),
    enabled: Boolean(eventId) && !sessionLoading && canOrganizeEvents,
  })

  if (sessionLoading) {
    return (
      <PageHub data-testid={testId('events', 'edit-page', 'loader', 'session')}>
        <ScoreboardLoader label="Проверка сессии…" />
      </PageHub>
    )
  }

  if (!canOrganizeEvents) {
    return (
      <PageHub>
        <PageStatePanel
          title="Нет доступа"
          copy="Раздел редактирования доступен организатору тренировок, админу клуба, капитану, тренеру или администратору."
          testIdPrefix="events"
          data-testid={testId('events', 'edit-page', 'card', 'denied')}
        />
      </PageHub>
    )
  }

  if (isLoading) {
    return (
      <PageHub data-testid={testId('events', 'edit-page', 'loader')}>
        <ScoreboardLoader label="Загрузка тренировки..." />
      </PageHub>
    )
  }

  if (error && !isNotFoundError(error)) {
    return (
      <PageHub>
        <QueryErrorState
          title="Не удалось загрузить тренировку"
          onRetry={() => void refetch()}
          testIdPrefix="events"
          data-testid={testId('events', 'edit-page', 'error')}
        />
      </PageHub>
    )
  }

  if (!event || event.type !== 'training') {
    return (
      <PageHub>
        <PageBackLink
          to={routes.eventsOrganizer}
          label="К моим тренировкам"
          testIdPrefix="events"
          testIdSection="edit-page"
        />
        <PageStatePanel
          title="Тренировка не найдена"
          copy="Вернитесь к списку «Мои тренировки»."
          testIdPrefix="events"
          data-testid={testId('events', 'edit-page', 'empty')}
        />
      </PageHub>
    )
  }

  const canEdit =
    event.organizerUserId === userId || roles.includes('admin') || roles.includes('club_admin')

  if (!canEdit) {
    return (
      <PageHub data-testid={testId('events', 'edit-page', 'error', 'access-denied')}>
        <PageBackLink
          to={eventDetailsPath(event)}
          label="К карточке"
          testIdPrefix="events"
          testIdSection="edit-page"
        />
        <PageStatePanel
          title="Нет прав на редактирование"
          copy="Редактировать может только организатор этой тренировки."
          testIdPrefix="events"
        />
      </PageHub>
    )
  }

  return (
    <PageHub data-testid={testId('events', 'edit-page', 'page', event.id)}>
      <PageBackLink
        to={eventDetailsPath(event)}
        label="К карточке"
        testIdPrefix="events"
        testIdSection="edit-page"
      />

      <PageHeader
        title="Редактирование"
        subtitle={event.title}
        testIdPrefix="events"
        testIdSection="edit-page"
        actions={
          <Link
            to={routes.eventsOrganizer}
            data-testid={testId('events', 'edit-page', 'link', 'back')}
          >
            <HockeyButton
              view="outlined"
              size="m"
              data-testid={testId('events', 'edit-page', 'btn', 'back')}
            >
              К моим тренировкам
            </HockeyButton>
          </Link>
        }
      />

      <div className="page-hub__panel">
        <IceCard padding="m" data-testid={testId('events', 'edit-page', 'card', 'form')}>
          <EventCreateForm mode="edit" initialEvent={event} />
        </IceCard>
      </div>
    </PageHub>
  )
}
