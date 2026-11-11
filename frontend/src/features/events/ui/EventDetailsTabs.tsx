/**
 * HOCFRONT-46 — вкладки «Состав | Звенья» на странице игры или тренировки команды.
 */

import type {EventDetailsTab} from '@/features/events/lib/useEventDetailsTab'
import {testId} from '@/shared/testing/testId'

const TABS: Array<{id: EventDetailsTab; label: string}> = [
  {id: 'roster', label: 'Состав'},
  {id: 'lines', label: 'Звенья'},
]

export interface EventDetailsTabsProps {
  value: EventDetailsTab
  onChange: (tab: EventDetailsTab) => void
  /** `game-page` / `training-page` — для data-testid. */
  section: string
}

export function EventDetailsTabs({value, onChange, section}: EventDetailsTabsProps) {
  return (
    <div
      className="hockey-segmented event-details__tabs"
      role="tablist"
      aria-label="Состав и звенья"
      data-testid={testId('events', section, 'panel', 'tabs')}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={`hockey-segmented__item${value === tab.id ? ' is-active' : ''}`}
          onClick={() => onChange(tab.id)}
          data-testid={testId('events', section, 'btn', 'tab', tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
