/**
 * HOCFRONT-28CAL-B — сетка месяца
 */

import {ChevronLeft, ChevronRight} from '@gravity-ui/icons'

import type {GameEvent} from '@/entities/event'
import {testId} from '@/shared/testing/testId'

import {
  buildMonthCells,
  groupEventsByDay,
  type MonthCell,
  monthCursorFromDateKey,
  monthTitle,
  shiftMonth,
  weekdayLabels,
} from '../lib/calendarDays'

export interface CalendarMonthGridProps {
  selectedDate: string
  events: GameEvent[]
  onSelectDate: (dateKey: string) => void
  /** Смена месяца без переключения в agenda */
  onNavigateMonth?: (dateKey: string) => void
}

export function CalendarMonthGrid({
  selectedDate,
  events,
  onSelectDate,
  onNavigateMonth,
}: CalendarMonthGridProps) {
  const monthCursor = monthCursorFromDateKey(selectedDate)
  const eventsByDay = groupEventsByDay(events)
  const allCells = buildMonthCells(monthCursor, eventsByDay)
  // Последняя неделя целиком из следующего месяца — не рисуем, как в макете (5 строк).
  const cells = allCells.slice(35).some((cell) => cell.inCurrentMonth)
    ? allCells
    : allCells.slice(0, 35)
  const labels = weekdayLabels()

  function goMonth(delta: number) {
    const nextMonth = shiftMonth(monthCursor, delta)
    const nextKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`
    ;(onNavigateMonth ?? onSelectDate)(nextKey)
  }

  return (
    <div className="hockey-calendar-month" data-testid={testId('calendar', 'month', 'panel')}>
      <div className="hockey-calendar-month__nav">
        <button
          type="button"
          className="hockey-calendar-month__nav-btn"
          onClick={() => goMonth(-1)}
          aria-label="Предыдущий месяц"
          data-testid={testId('calendar', 'month', 'btn', 'prev')}
        >
          <ChevronLeft width={16} height={16} />
        </button>
        <span
          className="hockey-calendar-month__title"
          data-testid={testId('calendar', 'month', 'text', 'title')}
        >
          {monthTitle(monthCursor)}
        </span>
        <button
          type="button"
          className="hockey-calendar-month__nav-btn"
          onClick={() => goMonth(1)}
          aria-label="Следующий месяц"
          data-testid={testId('calendar', 'month', 'btn', 'next')}
        >
          <ChevronRight width={16} height={16} />
        </button>
      </div>

      <div className="hockey-calendar-month__board">
        <div
          className="hockey-calendar-month__weekdays"
          data-testid={testId('calendar', 'month', 'row', 'weekdays')}
        >
          {labels.map((label) => (
            <span key={label} className="hockey-calendar-month__weekday">
              {label}
            </span>
          ))}
        </div>

        <div
          className="hockey-calendar-month__grid"
          data-testid={testId('calendar', 'month', 'grid')}
        >
          {cells.map((cell) => (
            <MonthDayButton
              key={cell.dateKey}
              cell={cell}
              selected={cell.dateKey === selectedDate}
              onSelect={() => onSelectDate(cell.dateKey)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function MonthDayButton({
  cell,
  selected,
  onSelect,
}: {
  cell: MonthCell
  selected: boolean
  onSelect: () => void
}) {
  const className = [
    'hockey-calendar-month__day',
    cell.inCurrentMonth ? '' : 'hockey-calendar-month__day--muted',
    cell.isToday ? 'hockey-calendar-month__day--today' : '',
    selected ? 'hockey-calendar-month__day--selected' : '',
    cell.eventCount > 0 ? 'hockey-calendar-month__day--has-events' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={className}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      aria-pressed={selected}
      aria-current={selected ? 'date' : undefined}
      aria-label={`${cell.dateKey}, событий: ${cell.eventCount}`}
      data-testid={testId('calendar', 'month', 'btn', 'day', cell.dateKey)}
    >
      <span className="hockey-calendar-month__day-num">{cell.dayOfMonth}</span>
      {cell.eventCount > 0 && (
        <span
          className="hockey-calendar-month__day-count"
          data-testid={testId('calendar', 'month', 'text', 'count', cell.dateKey)}
        >
          {cell.eventCount > 3 ? '3+' : cell.eventCount}
        </span>
      )}
    </button>
  )
}
