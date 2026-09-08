/**
 * HOCFRONT-28A — отдельный экран создания игры/тренировки
 */

import {Link} from 'react-router'

import {useSessionAccess} from '@/features/access'
import {EventCreateForm} from '@/features/events'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {PageBackLink} from '@/shared/ui/PageBackLink'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'
import {PageStatePanel} from '@/shared/ui/PageStatePanel'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

export function CreateEventPage() {
  const {canOrganizeEvents, isLoading} = useSessionAccess()

  if (isLoading) {
    return (
      <PageHub data-testid={testId('events', 'create-page', 'loader', 'session')}>
        <ScoreboardLoader label="Проверка сессии…" />
      </PageHub>
    )
  }

  if (!canOrganizeEvents) {
    return (
      <PageHub data-testid={testId('events', 'create-page', 'page', 'denied')}>
        <PageBackLink
          to={routes.events}
          label="К каталогу"
          testIdPrefix="events"
          testIdSection="create-page"
        />
        <PageStatePanel
          title="Нет доступа"
          copy="Создавать игры и тренировки могут организатор тренировок, админ клуба, капитан, тренер или администратор."
          testIdPrefix="events"
          data-testid={testId('events', 'create-page', 'card', 'denied')}
        />
      </PageHub>
    )
  }

  return (
    <PageHub data-testid={testId('events', 'create-page', 'page')}>
      <PageBackLink
        to={routes.events}
        label="К каталогу"
        testIdPrefix="events"
        testIdSection="create-page"
      />

      <PageHeader
        title="Создать игру или тренировку"
        subtitle="Заполните параметры события — игроки увидят его в каталоге."
        testIdPrefix="events"
        testIdSection="create-page"
        actions={
          <Link
            to={routes.eventsOrganizer}
            data-testid={testId('events', 'create-page', 'link', 'cabinet')}
          >
            <HockeyButton
              view="outlined"
              size="m"
              data-testid={testId('events', 'create-page', 'btn', 'cabinet')}
            >
              Кабинет
            </HockeyButton>
          </Link>
        }
      />

      <div className="page-hub__panel">
        <IceCard padding="m" data-testid={testId('events', 'create-page', 'card', 'form')}>
          <EventCreateForm />
        </IceCard>
      </div>
    </PageHub>
  )
}
