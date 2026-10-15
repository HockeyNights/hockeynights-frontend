/**
 * SPEC-FR-2.1.1
 * Логотип Hockey Nights для экранов авторизации.
 */

import hockeyWordmark from '@/shared/icons/HockeyNightsWordmark.svg'
import hockeyMark from '@/shared/icons/MinusCircleOutlined.svg'
import {testId} from '@/shared/testing/testId'

export interface AuthBrandLogoProps {
  size?: 'sm' | 'lg'
}

export function AuthBrandLogo({size = 'lg'}: AuthBrandLogoProps) {
  return (
    <div
      className={`auth-brand auth-brand--${size}`}
      data-testid={testId('auth', 'shell', 'panel', 'brand')}
    >
      <div className="auth-brand__lockup">
        <img
          src={hockeyMark}
          alt=""
          className="auth-brand__mark"
          data-testid={testId('auth', 'shell', 'img', 'mark')}
        />
        <img
          src={hockeyWordmark}
          alt="Hockey Nights"
          className="auth-brand__wordmark"
          data-testid={testId('auth', 'shell', 'text', 'wordmark')}
        />
      </div>
    </div>
  )
}
