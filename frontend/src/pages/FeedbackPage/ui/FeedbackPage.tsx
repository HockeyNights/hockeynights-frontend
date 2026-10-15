/**
 * SPEC-FR-8.1.1, SPEC-FR-8.1.2, SPEC-FR-8.2.2
 */

import {ShieldCheck} from '@gravity-ui/icons'
import {useState} from 'react'

import type {PlayersFilterParams} from '@/entities/profile'
import {FeedbackPlayerFilters, PostGameFeedbackForm} from '@/features/feedback'
import {KarmaHint} from '@/features/karma'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'

const KARMA_HINT =
  'Карма растёт за участие в жизни лиги: подтверждённая явка повышает рейтинг, а неявка без предупреждения снижает. Это сигнал дисциплины и надёжности.'

/**
 * @spec SPEC-FR-8.1.1 - Страница feedback
 */
export function FeedbackPage() {
  const [playerFilters, setPlayerFilters] = useState<PlayersFilterParams>({})

  return (
    <PageHub data-testid={testId('feedback', 'page', 'page')}>
      <PageHeader
        title="Feedback после игры"
        subtitle="Оцени явку, уровень и поведение участников — это напрямую влияет на Karma игрока."
        testIdPrefix="feedback"
      />

      <div className="hockey-feedback-layout" data-testid={testId('feedback', 'page', 'layout')}>
        <div
          className="hockey-feedback-layout__main"
          data-testid={testId('feedback', 'page', 'card', 'form')}
        >
          <PostGameFeedbackForm playerFilters={playerFilters} />
        </div>

        <aside className="hockey-feedback-layout__aside">
          <IceCard padding="m" data-testid={testId('feedback', 'page', 'card', 'filters')}>
            <FeedbackPlayerFilters filters={playerFilters} onChange={setPlayerFilters} />
          </IceCard>
          <IceCard
            padding="m"
            className="hockey-feedback-karma"
            data-testid={testId('feedback', 'page', 'card', 'karma-hint')}
          >
            <span className="hockey-feedback-karma__icon" aria-hidden>
              <ShieldCheck width={18} height={18} />
            </span>
            <KarmaHint hint={KARMA_HINT} />
          </IceCard>
        </aside>
      </div>
    </PageHub>
  )
}
