/**
 * SPEC-UI-3.2 — пустое / ошибочное состояние страницы в IceCard
 */

import type {ReactNode} from 'react'

import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {IceCard} from '@/shared/ui/IceCard'

export interface PageStatePanelProps {
  title: string
  copy?: string
  action?: ReactNode
  testIdPrefix: string
  'data-testid'?: string
}

/**
 * EmptyNetState внутри IceCard — единый вид для not-found / access-denied на страницах.
 */
export function PageStatePanel({
  title,
  copy,
  action,
  testIdPrefix,
  'data-testid': dataTestId,
}: PageStatePanelProps) {
  return (
    <IceCard padding="m" data-testid={dataTestId}>
      <EmptyNetState title={title} copy={copy} action={action} testIdPrefix={testIdPrefix} />
    </IceCard>
  )
}
