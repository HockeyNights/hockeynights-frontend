/**
 * SPEC-FR-4.2.2
 */

import {Select} from '@gravity-ui/uikit'

import type {AttendanceStatus, EventType} from '@/entities/common'
import type {CalendarFilters as CalendarFiltersType} from '@/entities/event'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-4.2.2 - Props фильтров календаря */
export interface CalendarFiltersProps {
  /** @spec SPEC-FR-4.2.2 */
  filters: CalendarFiltersType
  /** @spec SPEC-FR-4.2.2 */
  onChange: (filters: CalendarFiltersType) => void
  /** Поля во всю ширину столбцом (карточка фильтров страницы календаря) */
  stacked?: boolean
}

const TYPE_OPTIONS = [
  {value: '', content: 'Все типы'},
  {value: 'game', content: 'Игра'},
  {value: 'training', content: 'Тренировка'},
  {value: 'open_ice', content: 'Открытый лёд'},
]

const STATUS_OPTIONS = [
  {value: '', content: 'Любой статус'},
  {value: 'going', content: 'Иду'},
  {value: 'not_going', content: 'Не иду'},
  {value: 'maybe', content: 'Под вопросом'},
]

/**
 * @spec SPEC-FR-4.2.2 - Фильтр календаря по типу и статусу участия
 */
export function CalendarFilters({filters, onChange, stacked = false}: CalendarFiltersProps) {
  const fieldWidth = stacked ? 'max' : 200
  const fieldSize = stacked ? 'xl' : undefined
  return (
    <div
      className={
        stacked
          ? 'hockey-calendar-filters--stacked'
          : 'hockey-row hockey-row--gap-12 hockey-row--wrap'
      }
      data-testid={testId('calendar', 'filters', 'filter')}
    >
      <Select
        label="Тип события"
        value={[filters.type ?? '']}
        onUpdate={(v) => onChange({...filters, type: (v[0] || undefined) as EventType | undefined})}
        options={TYPE_OPTIONS}
        width={fieldWidth}
        size={fieldSize}
        data-testid={testId('calendar', 'filters', 'select', 'type')}
      />
      <Select
        label="Статус участия"
        value={[filters.attendanceStatus ?? '']}
        onUpdate={(v) =>
          onChange({
            ...filters,
            attendanceStatus: (v[0] || undefined) as AttendanceStatus | undefined,
          })
        }
        options={STATUS_OPTIONS}
        width={fieldWidth}
        size={fieldSize}
        data-testid={testId('calendar', 'filters', 'select', 'attendance')}
      />
    </div>
  )
}
