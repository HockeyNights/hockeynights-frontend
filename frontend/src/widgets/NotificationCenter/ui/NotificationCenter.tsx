/**
 * SPEC-FR-10.1.1, SPEC-FR-10.1.2
 */

import type {Notification} from '@/entities/notification'
import {MarkNotificationReadButton} from '@/features/notifications'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'

/** @spec SPEC-FR-10.1.1 - Props центра уведомлений */
export interface NotificationCenterProps {
  /** @spec SPEC-FR-10.1.1 */
  notifications: Notification[]
}

const TYPE_LABELS: Record<Notification['type'], string> = {
  sos: 'SOS',
  roster: 'Состав',
  response: 'Отклик',
  event_reminder: 'Событие',
  goalie_request: 'Вратарь',
}

function formatNotificationTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * @spec SPEC-FR-10.1.1 - Список in-app уведомлений
 * @spec SPEC-FR-10.1.2 - Действие mark as read
 */
export function NotificationCenter({notifications}: NotificationCenterProps) {
  if (notifications.length === 0) {
    return (
      <EmptyNetState
        title="Нет уведомлений"
        copy="Когда появится активность по SOS, составу или событиям — она будет здесь."
        testIdPrefix="notifications"
        data-testid={testId('notifications', 'center', 'empty')}
      />
    )
  }

  return (
    <div className="hockey-notifications" data-testid={testId('notifications', 'center', 'list')}>
      {notifications.map((notification) => {
        const unread = !notification.readAt
        return (
          <article
            key={notification.id}
            className={`hockey-notification${unread ? ' hockey-notification--unread' : ''}`}
            data-testid={testId('notifications', 'center', 'card', notification.id)}
          >
            <div className="hockey-notification__head">
              <div className="hockey-notification__heading">
                <span
                  className="hockey-notification__type"
                  data-testid={testId('notifications', 'center', 'badge', 'type', notification.id)}
                >
                  {TYPE_LABELS[notification.type]}
                </span>
                <span
                  className="hockey-notification__title"
                  data-testid={testId('notifications', 'center', 'text', 'title', notification.id)}
                >
                  {notification.title}
                </span>
              </div>
              {unread && (
                <span
                  className="hockey-notification__new"
                  data-testid={testId('notifications', 'center', 'text', 'new', notification.id)}
                >
                  Новое
                </span>
              )}
            </div>
            <p
              className="hockey-notification__body"
              data-testid={testId('notifications', 'center', 'text', 'body', notification.id)}
            >
              {notification.body}
            </p>
            <div className="hockey-notification__foot">
              <time
                className="hockey-notification__time"
                dateTime={notification.createdAt}
                data-testid={testId('notifications', 'center', 'text', 'time', notification.id)}
              >
                {formatNotificationTime(notification.createdAt)}
              </time>
              {unread && <MarkNotificationReadButton notificationId={notification.id} />}
            </div>
          </article>
        )
      })}
    </div>
  )
}
