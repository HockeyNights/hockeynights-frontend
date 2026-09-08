/**
 * HOCFRONT-25 — FSD page: создание команды
 */

import {useSessionAccess} from '@/features/access'
import {TeamCreateWizard} from '@/features/teams'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {PageBackLink} from '@/shared/ui/PageBackLink'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'
import {PageStatePanel} from '@/shared/ui/PageStatePanel'

/**
 * Отдельный экран мастера создания команды (не блок каталога).
 */
export function CreateTeamPage() {
  const {teamPermissions} = useSessionAccess()
  const {canCreateTeam} = teamPermissions('player')

  if (!canCreateTeam) {
    return (
      <PageHub data-testid={testId('teams', 'create-page', 'page', 'denied')}>
        <PageBackLink
          to={routes.teams}
          label="К каталогу команд"
          testIdPrefix="teams"
          testIdSection="create-page"
        />
        <PageStatePanel
          title="Нет доступа"
          copy="Создавать команды могут капитан, организатор или администратор. Выберите подходящую роль при входе."
          testIdPrefix="teams"
          data-testid={testId('teams', 'create-page', 'card', 'denied')}
        />
      </PageHub>
    )
  }

  return (
    <PageHub data-testid={testId('teams', 'create-page', 'page')}>
      <PageBackLink
        to={routes.teams}
        label="К каталогу команд"
        testIdPrefix="teams"
        testIdSection="create-page"
      />

      <PageHeader
        title="Новая команда"
        subtitle="Пошагово: основы, образ, состав, площадка и группа в мессенджере."
        testIdPrefix="teams"
        testIdSection="create-page"
      />

      <div className="page-hub__panel">
        <IceCard padding="m" data-testid={testId('teams', 'create-page', 'card', 'wizard')}>
          <TeamCreateWizard />
        </IceCard>
      </div>
    </PageHub>
  )
}
