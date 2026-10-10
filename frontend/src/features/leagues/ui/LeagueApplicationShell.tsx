/**
 * SPEC-FR-24.5.4 — оболочка блока «Заявка команды»: подпись секции + карточка.
 */

import type {ReactNode} from 'react'

import {IceCard} from '@/shared/ui/IceCard'
import {SectionHeading} from '@/shared/ui/SectionHeading'

export interface LeagueApplicationShellProps {
  title: ReactNode
  children?: ReactNode
  /** Кнопки портала/сайта лиги — нижняя строка карточки. */
  actions?: ReactNode
  'data-testid'?: string
  titleTestId?: string
}

export function LeagueApplicationShell({
  title,
  children,
  actions,
  'data-testid': dataTestId,
  titleTestId,
}: LeagueApplicationShellProps) {
  return (
    <section className="league-application" data-testid={dataTestId}>
      <SectionHeading title={title} data-testid={titleTestId} />
      <IceCard padding="m" className="league-application__card">
        {children}
        {actions}
      </IceCard>
    </section>
  )
}
