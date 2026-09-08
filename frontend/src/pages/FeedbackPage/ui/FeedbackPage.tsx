/**
 * SPEC-FR-8.1.1, SPEC-FR-8.1.2, SPEC-FR-8.2.2
 */

import {PostGameFeedbackForm} from '@/features/feedback'
import {KarmaHint} from '@/features/karma'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'

/**
 * @spec SPEC-FR-8.1.1 - Страница feedback
 */
export function FeedbackPage() {
  return (
    <PageHub data-testid={testId('feedback', 'page', 'page')}>
      <PageHeader
        title="Feedback после игры"
        subtitle="Оцени явку, уровень и поведение участников — это влияет на karma."
        testIdPrefix="feedback"
      />

      <div className="page-hub__panel">
        <IceCard padding="m" data-testid={testId('feedback', 'page', 'card', 'karma-hint')}>
          <KarmaHint />
        </IceCard>
        <IceCard padding="m" data-testid={testId('feedback', 'page', 'card', 'form')}>
          <PostGameFeedbackForm />
        </IceCard>
      </div>
    </PageHub>
  )
}
