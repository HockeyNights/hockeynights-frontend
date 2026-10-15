/**
 * SPEC-FR-1.2.1, SPEC-FR-1.2.4
 * SPEC-UI-4.3, SPEC-UI-5.1, SPEC-UI-5.2, SPEC-UI-5.5, SPEC-UI-5.6, SPEC-UI-6.1
 * Тулбар и боковое меню по макету портала.
 */

import {ArrowRightFromSquare, Persons} from '@gravity-ui/icons'
import {type DropdownMenuItem, Icon} from '@gravity-ui/uikit'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useEffect, useId, useMemo, useRef, useState} from 'react'
import {Outlet, useLocation, useNavigate} from 'react-router'

import {logoutSession} from '@/entities/auth'
import {shouldUsePartnerWorkspace, useSessionAccess} from '@/features/access'
import {COLUMN_LAYOUT_QUERY} from '@/shared/config/layout'
import {testId} from '@/shared/testing/testId'
import {MobileNav} from '@/widgets/MobileNav'
import {SideBoard} from '@/widgets/SideBoard'

import {AppSideNav} from './AppSideNav'
import {ShellToolbar} from './ShellToolbar'

function useColumnLayout(): boolean {
  const [isColumnLayout, setIsColumnLayout] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(COLUMN_LAYOUT_QUERY).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(COLUMN_LAYOUT_QUERY)
    const sync = () => setIsColumnLayout(media.matches)
    sync()
    media.addEventListener('change', sync)
    window.addEventListener('resize', sync)
    return () => {
      media.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  return isColumnLayout
}

/**
 * @spec SPEC-FR-1.2.1 - Базовый layout приложения
 * @spec SPEC-UI-5.1 - Desktop 3-col layout
 * @spec SPEC-UI-5.2 - Mobile bottom nav
 * HOCFRONT-15/17: уведомления в header; SOS FAB скрыт из MVP
 */
export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const drawerTitleId = useId()
  const drawerPanelRef = useRef<HTMLDivElement>(null)
  const isDesktop = useColumnLayout()
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)
  const [isRightCollapsed, setIsRightCollapsed] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerPath, setDrawerPath] = useState(location.pathname)

  const {session} = useSessionAccess()
  const partnerWorkspace = shouldUsePartnerWorkspace(session)
  const isArenasRoute = location.pathname === '/arenas' || location.pathname.startsWith('/arenas/')

  if (drawerPath !== location.pathname) {
    setDrawerPath(location.pathname)
    setIsDrawerOpen(false)
  }

  const logoutMutation = useMutation({
    mutationFn: logoutSession,
    onSuccess: () => {
      void queryClient.clear()
      navigate('/')
    },
  })

  const [wasArenasRoute, setWasArenasRoute] = useState(isArenasRoute)
  if (isArenasRoute !== wasArenasRoute) {
    setWasArenasRoute(isArenasRoute)
    if (isArenasRoute) setIsRightCollapsed(true)
  }

  const menuExpanded = isDesktop ? !isLeftCollapsed : isDrawerOpen
  const showPageHeader = isDesktop || !isDrawerOpen

  function toggleMenu() {
    if (isDesktop) {
      setIsLeftCollapsed((prev) => !prev)
      return
    }
    setIsDrawerOpen((prev) => !prev)
  }

  useEffect(() => {
    if (!isDrawerOpen) return
    const panel = drawerPanelRef.current
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusable = () => {
      if (!panel) return []
      return Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
    }

    const firstNavItem = panel?.querySelector<HTMLElement>(
      '.app-nav-drawer__body a, .app-nav-drawer__body button',
    )
    ;(firstNavItem ?? focusable()[0])?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false)
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const items = focusable()
      if (items.length === 0) return
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      const active = document.activeElement
      if (!(active instanceof Node) || !panel.contains(active)) {
        event.preventDefault()
        ;(event.shiftKey ? lastItem : firstItem).focus()
        return
      }
      if (event.shiftKey && active === firstItem) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && active === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus()
    }
  }, [isDrawerOpen])

  const sessionMenuItems = useMemo<(DropdownMenuItem | DropdownMenuItem[])[]>(
    () => [
      [
        {
          text: 'Сменить роль',
          iconStart: <Icon data={Persons} size={16} />,
          action: () => navigate('/'),
          qa: testId('app', 'shell', 'btn', 'switch-role'),
        },
      ],
      [
        {
          text: logoutMutation.isPending ? 'Выход…' : 'Выйти',
          theme: 'danger' as const,
          disabled: logoutMutation.isPending,
          iconStart: <Icon data={ArrowRightFromSquare} size={16} />,
          action: () => logoutMutation.mutate(),
          qa: testId('app', 'shell', 'btn', 'logout'),
        },
      ],
    ],
    [logoutMutation, navigate],
  )

  const drawerInert = !isDesktop && isDrawerOpen

  const bodyClasses = [
    'app-shell__body',
    'app-shell__body--grid',
    isLeftCollapsed ? 'app-shell__body--left-collapsed' : '',
    isRightCollapsed ? 'app-shell__body--right-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const sideNav = (
    <AppSideNav onLogout={() => logoutMutation.mutate()} logoutPending={logoutMutation.isPending} />
  )

  return (
    <div className="app-shell" data-testid={testId('app', 'shell', 'page')}>
      {showPageHeader && (
        <header className="app-shell__header" data-testid={testId('app', 'shell', 'header')}>
          <ShellToolbar
            menuExpanded={menuExpanded}
            onMenuClick={toggleMenu}
            menuLabel={
              isDesktop
                ? {open: 'Показать меню', close: 'Свернуть меню'}
                : {open: 'Открыть меню', close: 'Закрыть меню'}
            }
            showBoardToggle={isDesktop}
            boardCollapsed={isRightCollapsed}
            onToggleBoard={() => setIsRightCollapsed((prev) => !prev)}
            sessionMenuItems={sessionMenuItems}
          />
        </header>
      )}

      <div className={bodyClasses} data-testid={testId('app', 'shell', 'body')}>
        {isDesktop && !isLeftCollapsed && (
          <nav
            className="app-shell__nav-col"
            aria-label="Основная навигация"
            data-testid={testId('app', 'nav', 'nav')}
          >
            {sideNav}
          </nav>
        )}

        <main
          className="app-shell__main-col"
          data-testid={testId('app', 'shell', 'main')}
          inert={drawerInert || undefined}
        >
          <Outlet />
        </main>

        <div
          className="app-shell__board-col"
          data-testid={testId('app', 'shell', 'board-col')}
          inert={drawerInert || undefined}
        >
          {isDesktop && !isRightCollapsed && !partnerWorkspace && <SideBoard />}
        </div>
      </div>

      {!isDesktop && isDrawerOpen && (
        <div className="app-nav-drawer" data-testid={testId('app', 'nav', 'panel', 'drawer')}>
          <button
            type="button"
            className="app-nav-drawer__backdrop"
            aria-label="Закрыть меню"
            onClick={() => setIsDrawerOpen(false)}
            data-testid={testId('app', 'nav', 'btn', 'drawer-backdrop')}
          />
          <div
            ref={drawerPanelRef}
            className="app-nav-drawer__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={drawerTitleId}
            data-testid={testId('app', 'nav', 'sheet', 'drawer')}
          >
            <header className="app-shell__header app-shell__header--drawer">
              <ShellToolbar
                menuExpanded
                onMenuClick={() => setIsDrawerOpen(false)}
                menuLabel={{open: 'Открыть меню', close: 'Закрыть меню'}}
                sessionMenuItems={sessionMenuItems}
              />
            </header>
            <h2 id={drawerTitleId} className="hockey-sr-only">
              Меню
            </h2>
            <nav
              className="app-nav-drawer__body"
              aria-label="Основная навигация"
              data-testid={testId('app', 'nav', 'nav')}
            >
              {sideNav}
            </nav>
          </div>
        </div>
      )}

      <MobileNav inert={drawerInert} />
      {/* HOCFRONT-15/17: SosFab скрыт из MVP — маршрут /sos сохранён */}
    </div>
  )
}
