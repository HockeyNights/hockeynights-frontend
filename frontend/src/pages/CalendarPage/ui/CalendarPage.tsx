/**
 * SPEC-FR-4.2.1, SPEC-FR-4.2.2
 * SPEC-UI-2.6, SPEC-UI-3.1
 * HOCFRONT-28 — Календарь как отдельная фича
 */

import {CalendarShell} from '@/features/calendar'
import {testId} from '@/shared/testing/testId'
import {PageHub} from '@/shared/ui/PageHub'

/**
 * @spec SPEC-UI-2.6 - Календарь как расписание табло
 * @spec SPEC-FR-4.2.1 - Календарь пользователя
 * @spec HOCFRONT-28CAL-A - product page на CalendarShell
 */
export function CalendarPage() {
  return (
    <PageHub data-testid={testId('calendar', 'page')}>
      <div data-testid={testId('calendar', 'page', 'card', 'shell')}>
        <CalendarShell />
      </div>
    </PageHub>
  )
}
