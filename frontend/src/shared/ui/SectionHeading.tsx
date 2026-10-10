/**
 * Подпись секции из макета: «БЛИЖАЙШИЕ СОБЫТИЯ» слева, жёлтая ссылка справа.
 */

import type {ReactNode} from 'react'
import {Link} from 'react-router'

export interface SectionHeadingProps {
  title: ReactNode
  /** Подпись действия справа, напр. «Все». */
  actionLabel?: ReactNode
  /** Ссылка действия; без неё рендерится кнопка с `onAction`. */
  actionTo?: string
  onAction?: () => void
  /** Произвольный контент справа вместо ссылки. */
  extra?: ReactNode
  as?: 'h2' | 'h3'
  className?: string
  'data-testid'?: string
}

export function SectionHeading({
  title,
  actionLabel,
  actionTo,
  onAction,
  extra,
  as: Tag = 'h2',
  className,
  'data-testid': dataTestId,
}: SectionHeadingProps) {
  let action: ReactNode = extra ?? null
  if (!action && actionLabel) {
    action = actionTo ? (
      <Link to={actionTo} className="hockey-section-link">
        {actionLabel}
      </Link>
    ) : (
      <button type="button" className="hockey-section-link" onClick={onAction}>
        {actionLabel}
      </button>
    )
  }

  return (
    <div
      className={['hockey-section-head', className].filter(Boolean).join(' ')}
      data-testid={dataTestId}
    >
      <Tag className="hockey-section-label">{title}</Tag>
      {action}
    </div>
  )
}
