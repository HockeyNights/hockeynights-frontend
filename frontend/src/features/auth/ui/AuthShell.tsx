/**
 * SPEC-FR-2.1.1, SPEC-FR-25.1.1
 * Оболочка экранов входа, подтверждения почты и выбора роли.
 */

import {SunOutlined} from '@ant-design/icons'
import {Button} from 'antd'
import {type CSSProperties, type ReactNode, useLayoutEffect, useRef, useState} from 'react'
import {Link, NavLink} from 'react-router'

import {AuthAntdProvider} from '@/features/auth/ui/AuthAntdProvider'
import {AuthBrandLogo} from '@/features/auth/ui/AuthBrandLogo'
import {testId} from '@/shared/testing/testId'
import {useHockeyTheme} from '@/shared/theme/HockeyThemeProvider'

export type AuthShellMode = 'login' | 'register' | 'verify' | 'create-profile' | 'personas'

export interface AuthShellProps {
  children: ReactNode
  mode?: AuthShellMode
  showModeTabs?: boolean
  wide?: boolean
}

function AuthAnimatedPanel({children, flat}: {children: ReactNode; flat: boolean}) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>()
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    if (flat) return
    const node = innerRef.current
    if (!node) return

    const apply = () => {
      setHeight(Math.round(node.getBoundingClientRect().height))
    }

    apply()
    const frame = window.requestAnimationFrame(() => setReady(true))

    if (typeof ResizeObserver === 'undefined') {
      return () => window.cancelAnimationFrame(frame)
    }

    const observer = new ResizeObserver(apply)
    observer.observe(node)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [children, flat])

  if (flat) {
    return (
      <div
        className="auth-shell__panel auth-shell__panel--flat"
        data-testid={testId('auth', 'shell', 'panel', 'main')}
      >
        <div
          className="auth-shell__content"
          data-testid={testId('auth', 'shell', 'panel', 'content')}
        >
          {children}
        </div>
      </div>
    )
  }

  const clipStyle: CSSProperties | undefined = height == null ? undefined : {height}

  return (
    <div className="auth-shell__panel" data-testid={testId('auth', 'shell', 'panel', 'main')}>
      <div
        className={`auth-shell__clip${ready ? ' auth-shell__clip--ready' : ''}`}
        style={clipStyle}
      >
        <div
          ref={innerRef}
          className="auth-shell__content"
          data-testid={testId('auth', 'shell', 'panel', 'content')}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function AuthShell({
  children,
  mode = 'login',
  showModeTabs = true,
  wide = false,
}: AuthShellProps) {
  const {themeId, toggleTheme} = useHockeyTheme()
  const isPersonas = mode === 'personas' || wide

  return (
    <AuthAntdProvider>
      <div
        className={`auth-shell${isPersonas ? ' auth-shell--wide' : ''}`}
        data-testid={testId('auth', 'shell', 'page')}
      >
        <div className="auth-shell__glow" aria-hidden />

        {isPersonas ? (
          <header
            className="auth-shell__topbar"
            data-testid={testId('auth', 'shell', 'panel', 'topbar')}
          >
            <AuthBrandLogo size="sm" />
            <Button
              className="auth-shell__theme-btn"
              shape="circle"
              size="large"
              aria-label={themeId === 'ice' ? 'Включить светлую тему' : 'Включить тёмную тему'}
              icon={<SunOutlined />}
              onClick={toggleTheme}
              data-testid={testId('auth', 'shell', 'btn', 'theme')}
            />
          </header>
        ) : (
          <AuthBrandLogo size="lg" />
        )}

        {showModeTabs && (
          <nav
            className={`auth-tabs${mode === 'register' ? ' auth-tabs--register' : ''}`}
            aria-label="Вход или регистрация"
            data-testid={testId('auth', 'shell', 'nav', 'mode-tabs')}
          >
            <span className="auth-tabs__thumb" aria-hidden />
            <NavLink
              to="/"
              end
              className={({isActive}) =>
                `auth-tabs__tab${isActive ? ' auth-tabs__tab--active' : ''}`
              }
              data-testid={testId('auth', 'shell', 'tab', 'login')}
            >
              Вход
            </NavLink>
            <NavLink
              to="/register"
              className={({isActive}) =>
                `auth-tabs__tab${isActive ? ' auth-tabs__tab--active' : ''}`
              }
              data-testid={testId('auth', 'shell', 'tab', 'register')}
            >
              Регистрация
            </NavLink>
          </nav>
        )}

        <AuthAnimatedPanel flat={isPersonas}>{children}</AuthAnimatedPanel>

        {!isPersonas && (
          <p className="auth-shell__legal" data-testid={testId('auth', 'shell', 'panel', 'legal')}>
            <Link
              to="/terms"
              className="auth-shell__legal-link"
              data-testid={testId('auth', 'login', 'link', 'terms')}
            >
              Условия использования и конфиденциальность
            </Link>
          </p>
        )}
      </div>
    </AuthAntdProvider>
  )
}
