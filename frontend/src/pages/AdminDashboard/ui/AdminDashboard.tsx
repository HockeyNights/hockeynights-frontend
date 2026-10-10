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
import {SectionHeading} from '@/shared/ui/SectionHeading'

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
    <PageHub
      className="partner-cabinet admin-cabinet"
      data-testid={testId('admin', 'dashboard', 'page')}
    >
      <PageHeader
        title="Админка справочников"
        subtitle="Prototype для ручного управления аренами, лигами и магазинами."
        testIdPrefix="admin"
        testIdSection="dashboard"
      />

      <section className="partner-cabinet__block">
        <SectionHeading
          title="Добавить запись"
          data-testid={testId('admin', 'entity-form', 'text', 'title')}
        />
        <IceCard padding="m" className="partner-cabinet__card">
          <div className="partner-cabinet__form">
            <AdminEntityForm />

            <div
              className="admin-cabinet__moderation"
              data-testid={testId('admin', 'dashboard', 'panel', 'moderation')}
            >
              <Text
                variant="subheader-2"
                data-testid={testId('admin', 'dashboard', 'text', 'moderation-title')}
              >
                Модерация партнёров
              </Text>
              <Text
                color="secondary"
                data-testid={testId('admin', 'dashboard', 'text', 'moderation-hint')}
              >
                Профили лиг/магазинов и товары со статусом «на проверке». Войдите с ролью
                «Администратор».
              </Text>
              <PartnerModerationPanel />
            </div>
          </div>
        </IceCard>
      </section>

      <section className="partner-cabinet__block">
        <SectionHeading
          title="Статусы источников и видимость"
          data-testid={testId('admin', 'dashboard', 'text', 'sources-title')}
        />
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
      </section>
    </PageHub>
  )
}
