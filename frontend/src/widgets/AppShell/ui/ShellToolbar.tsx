/**
 * Верхний тулбар оболочки: марка, тема и колокольчик.
 * Кнопка слева открывает или закрывает боковое меню.
 */

import {Bars, LayoutSideContentRight, Moon, Sun, Xmark} from '@gravity-ui/icons'
import {type DropdownMenuItem, Icon} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useLocation} from 'react-router'

import {fetchNotifications} from '@/entities/notification'
import hockeyMark from '@/shared/icons/MinusCircleOutlined.svg'
import {testId} from '@/shared/testing/testId'
import {useHockeyTheme} from '@/shared/theme/HockeyThemeProvider'
import {NotificationsBellLink} from '@/shared/ui/NotificationsBellLink'
import {HeaderProfile} from '@/widgets/HeaderProfile'

interface ShellToolbarProps {
  menuExpanded: boolean
  onMenuClick: () => void
  menuLabel?: {open: string; close: string}
  showBoardToggle?: boolean
  boardCollapsed?: boolean
  onToggleBoard?: () => void
  sessionMenuItems?: (DropdownMenuItem | DropdownMenuItem[])[]
}

export function ShellToolbar({
  menuExpanded,
  onMenuClick,
  menuLabel = {open: 'Открыть меню', close: 'Закрыть меню'},
  showBoardToggle = false,
  boardCollapsed = false,
  onToggleBoard,
  sessionMenuItems = [],
}: ShellToolbarProps) {
  const location = useLocation()
  const {themeId, toggleTheme} = useHockeyTheme()
  const {data: notifications = []} = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })
  const unreadCount = notifications.filter((item) => !item.readAt).length
  const notificationsActive =
    location.pathname === '/notifications' || location.pathname.startsWith('/notifications/')
  const isLocker = themeId === 'locker'

  return (
    <div className="app-shell__toolbar">
      <button
        type="button"
        className="app-shell__round-btn"
        onClick={onMenuClick}
        aria-label={menuExpanded ? menuLabel.close : menuLabel.open}
        title={menuExpanded ? menuLabel.close : menuLabel.open}
        aria-expanded={menuExpanded}
        data-testid={testId('app', 'shell', 'btn', 'toggle-left-panel')}
      >
        <Icon data={menuExpanded ? Xmark : Bars} size={18} />
      </button>

      <div className="app-shell__brand" data-testid={testId('app', 'shell', 'brand')}>
        <div
          className="app-shell__crest"
          aria-hidden
          data-testid={testId('app', 'shell', 'icon', 'crest')}
        >
          <img src={hockeyMark} alt="" className="app-shell__crest-mark" />
        </div>
        <div className="app-shell__brand-text">
          <span className="app-shell__title" data-testid={testId('app', 'shell', 'text', 'title')}>
            Портал любителей спорта
          </span>
          <span
            className="app-shell__region"
            data-testid={testId('app', 'shell', 'text', 'region')}
          >
            Хоккей
          </span>
        </div>
      </div>

      <div
        className="app-shell__header-actions"
        data-testid={testId('app', 'shell', 'header-actions')}
      >
        <button
          type="button"
          className="app-shell__round-btn"
          onClick={toggleTheme}
          aria-label={isLocker ? 'Переключить на тему Лёд' : 'Переключить на тему Раздевалка'}
          title={isLocker ? 'Тема: Раздевалка → Лёд' : 'Тема: Лёд → Раздевалка'}
          data-testid={testId('app', 'shell', 'btn', 'toggle-theme')}
        >
          <Icon data={isLocker ? Moon : Sun} size={18} />
        </button>
        <NotificationsBellLink unreadCount={unreadCount} active={notificationsActive} />
        <HeaderProfile sessionMenuItems={sessionMenuItems} />
        {showBoardToggle && onToggleBoard && (
          <div
            className="app-shell__panel-controls"
            aria-label="Управление панелями"
            data-testid={testId('app', 'shell', 'panel-controls')}
          >
            <button
              type="button"
              className={`app-shell__round-btn${boardCollapsed ? ' app-shell__round-btn--accent' : ''}`}
              onClick={onToggleBoard}
              aria-label={boardCollapsed ? 'Показать борт' : 'Свернуть борт'}
              title={boardCollapsed ? 'Показать борт' : 'Свернуть борт'}
              data-testid={testId('app', 'shell', 'btn', 'toggle-right-panel')}
            >
              <Icon data={LayoutSideContentRight} size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
