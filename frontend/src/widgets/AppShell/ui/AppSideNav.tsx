/**
 * Боковое меню: карточка игрока, разделы и текущая роль.
 */

import {
  ArrowRightFromSquare,
  Briefcase,
  Calendar,
  Comment,
  Cup,
  Gear,
  ListUl,
  Pencil,
  Person,
  Persons,
  ShoppingBag,
  Snowflake,
} from '@gravity-ui/icons'
import {Icon, type IconData} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link, useLocation} from 'react-router'

import {fetchEvents, type GameEvent} from '@/entities/event'
import {fetchChats, getTotalUnreadCount} from '@/entities/messenger'
import {fetchMyProfile} from '@/entities/profile'
import {
  type NavItem,
  resolveNavItems,
  shouldUsePartnerWorkspace,
  useSessionAccess,
} from '@/features/access'
import {routes} from '@/shared/const/appRoutes'
import {partnerCabinetLabel, partnerCabinetPath} from '@/shared/const/partnerRoutes'
import {routeToTestSlug, testId} from '@/shared/testing/testId'
import type {AttendanceStatus, PlayerPosition} from '@/shared/types'

const SIDE_NAV_ORDER: readonly string[] = [
  routes.profile,
  routes.events,
  routes.teams,
  routes.messenger,
  routes.arenas,
  routes.calendar,
  routes.leagues,
  routes.shops,
  routes.feedback,
  routes.players,
  routes.admin,
  routes.partner,
]

const SIDE_NAV_ICONS: Record<string, IconData> = {
  [routes.profile]: Person,
  [routes.events]: Calendar,
  [routes.teams]: Persons,
  [routes.messenger]: Comment,
  [routes.arenas]: Snowflake,
  [routes.calendar]: Calendar,
  [routes.leagues]: Cup,
  [routes.shops]: ShoppingBag,
  [routes.feedback]: Pencil,
  [routes.players]: Person,
  [routes.admin]: Gear,
  [routes.partner]: Briefcase,
}

const NAV_LABELS: Partial<Record<string, string>> = {
  [routes.leagues]: 'Лиги и турниры',
}

const ROLE_POSITION: Record<PlayerPosition, string> = {
  forward: 'Нападающий',
  defense: 'Защитник',
  goalie: 'Вратарь',
  any: 'Универсал',
}

const UPCOMING_ATTENDANCE: AttendanceStatus[] = ['going', 'maybe']

interface AppSideNavProps {
  onLogout: () => void
  logoutPending?: boolean
}

function navIcon(path: string): IconData {
  if (SIDE_NAV_ICONS[path]) return SIDE_NAV_ICONS[path]
  if (path.startsWith('/partner')) return Briefcase
  return ListUl
}

function navLabel(item: NavItem): string {
  return NAV_LABELS[item.to] ?? item.label
}

function orderNavItems(items: NavItem[]): NavItem[] {
  return [...items].sort((left, right) => {
    const leftIndex = SIDE_NAV_ORDER.indexOf(left.to)
    const rightIndex = SIDE_NAV_ORDER.indexOf(right.to)
    return (leftIndex === -1 ? 100 : leftIndex) - (rightIndex === -1 ? 100 : rightIndex)
  })
}

function teamInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('ru-RU')
  const first = parts[0][0] ?? ''
  const last = parts[parts.length - 1][0] ?? ''
  return `${first}${last}`.toLocaleUpperCase('ru-RU')
}

function countUpcomingEvents(events: GameEvent[], userId: string, now: number): number {
  return events.filter((event) => {
    const startsAt = new Date(event.startsAt).getTime()
    if (Number.isNaN(startsAt) || startsAt < now) return false
    return event.participation.some(
      (entry) => entry.userId === userId && UPCOMING_ATTENDANCE.includes(entry.status),
    )
  }).length
}

function roleStatus(status: string | undefined): {label: string; tone: 'ok' | 'wait' | 'bad'} {
  if (status === 'pending') return {label: 'На проверке', tone: 'wait'}
  if (status === 'rejected') return {label: 'Отклонён', tone: 'bad'}
  if (status === 'unverified') return {label: 'Не подтверждён', tone: 'wait'}
  return {label: 'Активен', tone: 'ok'}
}

export function AppSideNav({onLogout, logoutPending = false}: AppSideNavProps) {
  const location = useLocation()
  const {session} = useSessionAccess()
  const partnerWorkspace = shouldUsePartnerWorkspace(session)
  const partnerMemberships = session?.user.partnerMemberships ?? []
  const hasPartnerAccess = partnerMemberships.length > 0 && !partnerWorkspace
  const userId = session?.user.id ?? ''

  const {data: profile} = useQuery({
    queryKey: ['profile'],
    queryFn: fetchMyProfile,
    enabled: Boolean(session) && !partnerWorkspace,
  })
  const {data: chats = []} = useQuery({
    queryKey: ['messenger-chats'],
    queryFn: fetchChats,
  })
  const {data: upcomingCount = 0} = useQuery({
    queryKey: ['events', 'nav-upcoming', userId],
    queryFn: async () => countUpcomingEvents(await fetchEvents(), userId, Date.now()),
    enabled: Boolean(userId) && !partnerWorkspace,
  })

  const unreadChatCount = getTotalUnreadCount(chats)

  const fullName = session?.user.displayName?.trim() || profile?.fullName?.trim() || 'Профиль'
  const teamName = profile?.teamName?.trim() ?? ''
  const position = profile?.position
  const roleLabel = partnerWorkspace
    ? 'Партнёр'
    : position
      ? `Игрок (${ROLE_POSITION[position]})`
      : 'Игрок'
  const status = roleStatus(profile?.verificationStatus)
  const profileHref = routes.profile

  const items = orderNavItems([
    ...(partnerWorkspace
      ? []
      : [{to: routes.profile, label: 'Мой профиль', tier: 'active' as const}]),
    ...resolveNavItems(session),
  ])

  function isNavActive(path: string): boolean {
    if (path === routes.partner) return location.pathname === routes.partner
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <div className="app-side-nav">
      <Link
        to={partnerWorkspace ? (items[0]?.to ?? routes.partner) : profileHref}
        className="app-side-nav__profile"
        data-testid={testId('app', 'nav', 'card', 'profile')}
      >
        <span className="app-side-nav__avatar" aria-hidden>
          {profile?.avatarUrl ? (
            <img
              className="app-side-nav__avatar-photo"
              src={profile.avatarUrl}
              alt=""
              data-testid={testId('app', 'nav', 'img', 'avatar')}
            />
          ) : (
            <Icon data={Person} size={22} />
          )}
        </span>
        <span className="app-side-nav__identity">
          <span className="app-side-nav__name" data-testid={testId('app', 'nav', 'text', 'name')}>
            {fullName}
          </span>
          {teamName && (
            <span className="app-side-nav__meta">
              <span
                className="app-side-nav__team-badge"
                data-testid={testId('app', 'nav', 'badge', 'team')}
              >
                {teamInitials(teamName)}
              </span>
              <span
                className="app-side-nav__team"
                data-testid={testId('app', 'nav', 'text', 'team')}
              >
                {teamName}
              </span>
            </span>
          )}
        </span>
      </Link>

      <div className="app-side-nav__menu">
        <div className="hockey-nav">
          {items.map((item) => {
            const active = isNavActive(item.to)
            const showCount = item.to === routes.events && upcomingCount > 0
            const showDot = item.to === routes.messenger && unreadChatCount > 0
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`hockey-nav__link${active ? ' hockey-nav__link--active' : ''}`}
                data-active={active ? 'true' : undefined}
                aria-current={active ? 'page' : undefined}
                data-testid={testId('app', 'nav', 'link', routeToTestSlug(item.to))}
              >
                <Icon data={navIcon(item.to)} size={18} />
                <span className="hockey-nav__label">{navLabel(item)}</span>
                {showCount && (
                  <span
                    className="hockey-nav__count"
                    data-testid={testId('app', 'nav', 'badge', routeToTestSlug(item.to))}
                  >
                    {upcomingCount > 99 ? '99+' : upcomingCount}
                  </span>
                )}
                {showDot && (
                  <span
                    className="hockey-nav__dot"
                    aria-label={`${unreadChatCount} непрочитанных`}
                    data-testid={testId('app', 'nav', 'badge', routeToTestSlug(item.to))}
                  />
                )}
              </Link>
            )
          })}
          {hasPartnerAccess && (
            <>
              <div
                className="hockey-nav__section-label"
                data-testid={testId('app', 'nav', 'text', 'partner-section')}
              >
                Партнёр
              </div>
              <Link
                to={routes.partner}
                className={`hockey-nav__link${isNavActive(routes.partner) ? ' hockey-nav__link--active' : ''}`}
                data-active={isNavActive(routes.partner) ? 'true' : undefined}
                data-testid={testId('app', 'nav', 'link', routeToTestSlug(routes.partner))}
              >
                <Icon data={Briefcase} size={18} />
                <span className="hockey-nav__label">Все кабинеты</span>
              </Link>
              {partnerMemberships.map((membership) => {
                const path = partnerCabinetPath(membership)
                const active = location.pathname === path
                return (
                  <Link
                    key={`${membership.kind}-${membership.entityId}`}
                    to={path}
                    className={`hockey-nav__link${active ? ' hockey-nav__link--active' : ''}`}
                    data-active={active ? 'true' : undefined}
                    title={membership.entityName}
                    data-testid={testId('app', 'nav', 'link', routeToTestSlug(path))}
                  >
                    <Icon data={Briefcase} size={18} />
                    <span className="hockey-nav__label">{partnerCabinetLabel(membership)}</span>
                  </Link>
                )
              })}
            </>
          )}
        </div>
      </div>

      <div className="app-side-nav__foot">
        <div className="app-side-nav__role" data-testid={testId('app', 'nav', 'card', 'role')}>
          <span className="app-side-nav__role-kicker">Текущая роль</span>
          <div className="app-side-nav__role-row">
            <span
              className="app-side-nav__role-name"
              data-testid={testId('app', 'nav', 'text', 'role')}
            >
              {roleLabel}
            </span>
            <span
              className={`app-side-nav__role-status app-side-nav__role-status--${status.tone}`}
              data-testid={testId('app', 'nav', 'badge', 'status')}
            >
              {status.label}
            </span>
          </div>
        </div>
        <div className="app-side-nav__actions">
          {!partnerWorkspace && (
            <Link
              to={`${routes.profile}?section=settings`}
              className="app-side-nav__action"
              data-testid={testId('app', 'nav', 'link', 'settings')}
            >
              <Icon data={Gear} size={16} />
              Настройки
            </Link>
          )}
          <Link
            to={routes.home}
            className="app-side-nav__action"
            data-testid={testId('app', 'shell', 'btn', 'switch-role')}
          >
            <Icon data={Persons} size={16} />
            Сменить роль
          </Link>
          <button
            type="button"
            className="app-side-nav__action"
            onClick={onLogout}
            disabled={logoutPending}
            data-testid={testId('app', 'shell', 'btn', 'logout')}
          >
            <Icon data={ArrowRightFromSquare} size={16} />
            {logoutPending ? 'Выход…' : 'Выйти'}
          </button>
        </div>
      </div>
    </div>
  )
}
