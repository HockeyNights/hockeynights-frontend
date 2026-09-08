/**
 * SPEC-FR-11.1.1, SPEC-FR-11.1.2, SPEC-FR-11.2.1, SPEC-FR-11.2.2
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'

import {fetchSourceStatuses} from '@/entities/admin'
import {AdminEntityForm, PartnerModerationPanel, SourceStatusTable} from '@/features/admin'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'
import {QueryState} from '@/shared/ui/QueryState'

/**
 * @spec SPEC-FR-11.1.1 - Admin prototype
 * @spec SPEC-FR-11.2.1 - Статусы источников
 */
export function AdminDashboard() {
  const {
    data: sources = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-sources'],
    queryFn: fetchSourceStatuses,
  })

  return (
    <PageHub data-testid={testId('admin', 'dashboard', 'page')}>
      <PageHeader
        title="Админка справочников"
        subtitle="Prototype для ручного управления аренами, лигами и магазинами."
        testIdPrefix="admin"
        testIdSection="dashboard"
      />

      <AdminEntityForm />

      <IceCard padding="m">
        <div data-testid={testId('admin', 'dashboard', 'panel', 'moderation')}>
          <Text
            variant="subheader-2"
            data-testid={testId('admin', 'dashboard', 'text', 'moderation-title')}
          >
            Модерация партнёров
          </Text>
          <Text
            color="secondary"
            className="hockey-mb-12"
            data-testid={testId('admin', 'dashboard', 'text', 'moderation-hint')}
          >
            Профили лиг/магазинов и товары со статусом «на проверке». Войдите с ролью
            «Администратор».
          </Text>
          <PartnerModerationPanel />
        </div>
      </IceCard>

      <Text
        variant="subheader-2"
        data-testid={testId('admin', 'dashboard', 'text', 'sources-title')}
      >
        Статусы источников и видимость
      </Text>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        loadingLabel="Загрузка статусов источников"
        errorTitle="Не удалось загрузить статусы"
        onRetry={() => void refetch()}
        testIdPrefix="admin"
      >
        <SourceStatusTable items={sources} />
      </QueryState>
    </PageHub>
  )
}
