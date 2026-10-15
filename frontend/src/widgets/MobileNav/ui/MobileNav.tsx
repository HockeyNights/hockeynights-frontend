/**
 * SPEC-UI-5.2, SPEC-FR-1.2.1, SPEC-FR-13.1.1, SPEC-FR-16.1.1
 * HOCFRONT-17 — bottom ≤5: core + sheet «Ещё»
 */

import {Xmark} from '@gravity-ui/icons'
import {Icon} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useId, useState} from 'react'
import {Link, useLocation} from 'react-router'

import {fetchChats, getTotalUnreadCount} from '@/entities/messenger'
import {
  isMobileMorePathActive,
  isMobileNavItemActive,
  resolveMobileMoreNavItems,
  resolveMobileNavItems,
  shouldUsePartnerWorkspace,
  useSessionAccess,
} from '@/features/access'
import {routeToTestSlug, testId} from '@/shared/testing/testId'

import {MOBILE_NAV_ICON_BY_PATH, MOBILE_NAV_MORE_ICON} from '../lib/mobileNavIcons'

function formatUnreadBadge(count: number): string {
  return count > 99 ? '99+' : String(count)
}

/**
 * @spec SPEC-UI-5.2 - Bottom navigation для mobile
 */
export function MobileNav({inert = false}: {inert?: boolean}) {
  const location = useLocation()
  const moreTitleId = useId()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [sheetPath, setSheetPath] = useState(location.pathname)
  if (sheetPath !== location.pathname) {
    setSheetPath(location.pathname)
    setIsMoreOpen(false)
  }
  const {session} = useSessionAccess()
  const partnerMembership = session?.user.partnerMemberships?.[0]
  const partnerCount = session?.user.partnerMemberships?.length ?? 0
  const showLegacyPartnerLink =
    partnerMembership && !shouldUsePartnerWorkspace(session) && partnerCount > 1
  const mobileNav = resolveMobileNavItems(session)
  const moreNav = resolveMobileMoreNavItems(session)
  const showMoreSlot = moreNav.length > 0
  const moreActive = isMobileMorePathActive(location.pathname)
  const {data: chats = []} = useQuery({
    queryKey: ['messenger-chats'],
    queryFn: fetchChats,
  })
  const unreadChatCount = getTotalUnreadCount(chats)

  useEffect(() => {
    if (!isMoreOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMoreOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isMoreOpen])

  return (
    <>
      <nav
        className="mobile-nav"
        aria-label="Основная навигация"
        data-testid={testId('app', 'mobile-nav', 'nav')}
        inert={inert || undefined}
      >
        {showLegacyPartnerLink && (
          <Link
            to="/partner"
            className={`mobile-nav__link${
              isMobileNavItemActive(location.pathname, '/partner')
                ? ' mobile-nav__link--active'
                : ''
            }`}
            data-testid={testId('app', 'mobile-nav', 'link', routeToTestSlug('/partner'))}
          >
            <span
              className="mobile-nav__icon"
              aria-hidden
              data-testid={testId('app', 'mobile-nav', 'icon', 'partner')}
            >
              🏪
            </span>
            <span
              className="mobile-nav__label"
              data-testid={testId('app', 'mobile-nav', 'text', 'partner')}
            >
              Партнёр
            </span>
          </Link>
        )}
        {mobileNav.map((item) => {
          const active = isMobileNavItemActive(location.pathname, item.to)
          const showUnreadBadge = item.to === '/messenger' && unreadChatCount > 0
          const iconData = MOBILE_NAV_ICON_BY_PATH[item.to]
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`mobile-nav__link${active ? ' mobile-nav__link--active' : ''}`}
              aria-current={active ? 'page' : undefined}
              data-testid={testId('app', 'mobile-nav', 'link', routeToTestSlug(item.to))}
            >
              <span className="mobile-nav__icon-wrap">
                <span
                  className="mobile-nav__icon"
                  aria-hidden
                  data-testid={testId('app', 'mobile-nav', 'icon', routeToTestSlug(item.to))}
                >
                  {iconData ? <Icon data={iconData} size={22} /> : item.icon}
                </span>
                {showUnreadBadge && (
                  <span
                    className="mobile-nav__badge"
                    aria-label={`${unreadChatCount} непрочитанных`}
                    data-testid={testId('app', 'mobile-nav', 'badge', routeToTestSlug(item.to))}
                  >
                    {formatUnreadBadge(unreadChatCount)}
                  </span>
                )}
              </span>
              <span
                className="mobile-nav__label"
                data-testid={testId('app', 'mobile-nav', 'text', routeToTestSlug(item.to))}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
        {showMoreSlot && (
          <button
            type="button"
            className={`mobile-nav__link mobile-nav__link--button${moreActive || isMoreOpen ? ' mobile-nav__link--active' : ''}`}
            aria-expanded={isMoreOpen}
            aria-controls={moreTitleId}
            aria-haspopup="dialog"
            onClick={() => setIsMoreOpen(true)}
            data-testid={testId('app', 'mobile-nav', 'btn', 'more')}
          >
            <span className="mobile-nav__icon-wrap">
              <span
                className="mobile-nav__icon"
                aria-hidden
                data-testid={testId('app', 'mobile-nav', 'icon', 'more')}
              >
                <Icon data={MOBILE_NAV_MORE_ICON} size={22} />
              </span>
            </span>
            <span
              className="mobile-nav__label"
              data-testid={testId('app', 'mobile-nav', 'text', 'more')}
            >
              Ещё
            </span>
          </button>
        )}
      </nav>

      {isMoreOpen && showMoreSlot && (
        <div
          className="mobile-nav-more"
          role="presentation"
          data-testid={testId('app', 'mobile-nav', 'panel', 'more')}
          inert={inert || undefined}
        >
          <button
            type="button"
            className="mobile-nav-more__backdrop"
            aria-label="Закрыть меню"
            onClick={() => setIsMoreOpen(false)}
            data-testid={testId('app', 'mobile-nav', 'btn', 'more-close-backdrop')}
          />
          <div
            className="mobile-nav-more__sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={moreTitleId}
            data-testid={testId('app', 'mobile-nav', 'sheet', 'more')}
          >
            <div className="mobile-nav-more__handle" aria-hidden />
            <div className="mobile-nav-more__header">
              <h2
                id={moreTitleId}
                className="mobile-nav-more__title"
                data-testid={testId('app', 'mobile-nav', 'text', 'more-title')}
              >
                Ещё разделы
              </h2>
              <button
                type="button"
                className="mobile-nav-more__close"
                aria-label="Закрыть"
                onClick={() => setIsMoreOpen(false)}
                data-testid={testId('app', 'mobile-nav', 'btn', 'more-close')}
              >
                <Icon data={Xmark} size={16} />
              </button>
            </div>
            <ul
              className="mobile-nav-more__list"
              data-testid={testId('app', 'mobile-nav', 'list', 'more')}
            >
              {moreNav.map((item) => {
                const active = isMobileNavItemActive(location.pathname, item.to)
                const iconData = MOBILE_NAV_ICON_BY_PATH[item.to]
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`mobile-nav-more__link${active ? ' mobile-nav-more__link--active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setIsMoreOpen(false)}
                      data-testid={testId(
                        'app',
                        'mobile-nav',
                        'link',
                        `more-${routeToTestSlug(item.to)}`,
                      )}
                    >
                      <span
                        className="mobile-nav-more__icon"
                        aria-hidden
                        data-testid={testId(
                          'app',
                          'mobile-nav',
                          'icon',
                          `more-${routeToTestSlug(item.to)}`,
                        )}
                      >
                        {iconData ? <Icon data={iconData} size={22} /> : item.icon}
                      </span>
                      <span
                        className="mobile-nav-more__label"
                        data-testid={testId(
                          'app',
                          'mobile-nav',
                          'text',
                          `more-${routeToTestSlug(item.to)}`,
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
