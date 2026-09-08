/**
 * SPEC-FR-5.1.1, SPEC-FR-5.1.2, SPEC-FR-5.1.3, SPEC-FR-5.2.1, SPEC-FR-5.2.2, SPEC-FR-5.2.3
 * SPEC-UI-2.5
 */

import {Text} from '@gravity-ui/uikit'

import {SosFeed, SosRequestForm} from '@/features/sos'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'

/**
 * @spec SPEC-FR-5.1.1 - Страница Goalkeeper SOS
 */
export function SosPage() {
  return (
    <PageHub data-testid={testId('sos', 'page', 'page')}>
      <PageHeader
        title="Goalkeeper SOS"
        subtitle="Срочный поиск вратаря на игру или тренировку — запрос уходит в ленту и уведомления."
        testIdPrefix="sos"
      />

      <div
        className="hockey-grid hockey-grid--cards-280"
        data-testid={testId('sos', 'page', 'panel', 'grid')}
      >
        <div data-testid={testId('sos', 'page', 'card', 'form')}>
          <IceCard padding="m">
            <SosRequestForm />
          </IceCard>
        </div>
        <div data-testid={testId('sos', 'page', 'card', 'feed')}>
          <IceCard padding="m">
            <Text variant="subheader-2" data-testid={testId('sos', 'page', 'text', 'feed-title')}>
              Открытые запросы
            </Text>
            <div className="hockey-mt-12" data-testid={testId('sos', 'page', 'feed')}>
              <SosFeed />
            </div>
          </IceCard>
        </div>
      </div>
    </PageHub>
  )
}
