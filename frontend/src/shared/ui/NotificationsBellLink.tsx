/**
 * HOCFRONT-17 — иконка уведомлений в header.
 * Жёлтая круглая кнопка с колокольчиком и точкой непрочитанных.
 */

import {Bell} from '@gravity-ui/icons'
import {Icon} from '@gravity-ui/uikit'
import {Link} from 'react-router'

import {testId} from '@/shared/testing/testId'

interface NotificationsBellLinkProps {
  to?: string
  unreadCount: number
  active?: boolean
}

export function NotificationsBellLink({
  to = '/notifications',
  unreadCount,
  active = false,
}: NotificationsBellLinkProps) {
  const hasUnread = unreadCount > 0
  const unreadLabel = unreadCount > 99 ? '99+' : String(unreadCount)

  return (
    <Link
      to={to}
      className={`app-shell__notify${active ? ' app-shell__notify--active' : ''}${hasUnread ? ' app-shell__notify--unread' : ''}`}
      aria-label={hasUnread ? `Уведомления, непрочитанных: ${unreadCount}` : 'Уведомления'}
      aria-current={active ? 'page' : undefined}
      data-testid={testId('app', 'shell', 'link', 'notifications')}
    >
      <Icon data={Bell} size={18} />
      {hasUnread && (
        <span
          className="app-shell__notify-badge"
          data-testid={testId('app', 'shell', 'badge', 'notifications')}
        >
          <span className="hockey-sr-only">{unreadLabel}</span>
        </span>
      )}
    </Link>
  )
}
