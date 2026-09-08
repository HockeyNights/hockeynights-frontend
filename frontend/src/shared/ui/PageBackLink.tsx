/**
 * SPEC-UI-2 — стандартная навигация «назад» на детальных страницах
 */

import {Link} from 'react-router'

import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface PageBackLinkProps {
  label: string
  /** Маршрут для Link; если не задан — используется onClick */
  to?: string
  onClick?: () => void
  testIdPrefix: string
  testIdSection?: string
}

/**
 * Кнопка «назад» в toolbar hub-страницы — как на публичном профиле игрока.
 * Один фокусируемый элемент: `HockeyButton` рендерится как `Link`, а не внутри него.
 */
export function PageBackLink({
  label,
  to,
  onClick,
  testIdPrefix,
  testIdSection = 'page',
}: PageBackLinkProps) {
  return (
    <div
      className="page-hub__toolbar"
      data-testid={testId(testIdPrefix, testIdSection, 'nav', 'back')}
    >
      {to ? (
        <HockeyButton
          view="outlined"
          size="s"
          component={Link}
          to={to}
          onClick={onClick}
          data-testid={testId(testIdPrefix, testIdSection, 'btn', 'back')}
        >
          {label}
        </HockeyButton>
      ) : (
        <HockeyButton
          view="outlined"
          size="s"
          onClick={onClick}
          data-testid={testId(testIdPrefix, testIdSection, 'btn', 'back')}
        >
          {label}
        </HockeyButton>
      )}
    </div>
  )
}
