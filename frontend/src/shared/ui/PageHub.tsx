/**
 * SPEC-UI-2 — единая оболочка страницы (паттерн profile-hub / messenger-hub)
 */

import type {ReactNode} from 'react'

export interface PageHubProps {
  children: ReactNode
  className?: string
  'data-testid'?: string
}

/**
 * Стандартная сетка страницы: gap 16px, радиусы карточек и полей 16px.
 * Заменяет `hockey-stack hockey-stack--gap-16|20` на верхнем уровне страницы.
 */
export function PageHub({children, className, 'data-testid': dataTestId}: PageHubProps) {
  return (
    <div className={['page-hub', className].filter(Boolean).join(' ')} data-testid={dataTestId}>
      {children}
    </div>
  )
}
