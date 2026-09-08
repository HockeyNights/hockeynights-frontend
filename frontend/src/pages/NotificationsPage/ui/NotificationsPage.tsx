/**
 * SPEC-FR-10.1.1, SPEC-FR-10.1.2
 */

import {useQuery} from '@tanstack/react-query'

import {fetchNotifications} from '@/entities/notification'
import {testId} from '@/shared/testing/testId'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'
import {QueryState} from '@/shared/ui/QueryState'
import {NotificationCenter} from '@/widgets/NotificationCenter'

/**
 * @spec SPEC-FR-10.1.1 - Страница уведомлений
 */
export function NotificationsPage() {
  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <PageHub data-testid={testId('notifications', 'page', 'page')}>
      <PageHeader
        title="Уведомления"
        testIdPrefix="notifications"
        subtitle={
          unreadCount > 0
            ? `Важные сигналы по SOS, составу и событиям · ${unreadCount} непрочитанных`
            : 'Важные сигналы по SOS, составу и событиям'
        }
      />

      <div className="page-hub__panel">
        <QueryState
          isLoading={isLoading}
          isError={isError}
          loadingLabel="Загрузка уведомлений"
          errorTitle="Не удалось загрузить уведомления"
          onRetry={() => void refetch()}
          testIdPrefix="notifications"
        >
          <NotificationCenter notifications={notifications} />
        </QueryState>
      </div>
    </PageHub>
  )
}
