/**
 * SPEC-FR-6.2.2, SPEC-FR-6.3.1, SPEC-FR-6.4.2
 */

import {Text} from '@gravity-ui/uikit'

import type {Arena} from '@/entities/arena'
import type {IceSlot} from '@/entities/arena'
import {ArenaQuickRequestForm} from '@/features/arenas/ui/ArenaQuickRequestForm'
import {SlotCalendar} from '@/features/arenas/ui/SlotCalendar'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {SectionHeading} from '@/shared/ui/SectionHeading'

/** @spec SPEC-FR-6.2.2 */
export interface ArenaBookingPanelProps {
  arena: Arena
  slots: IceSlot[]
  'data-testid'?: string
}

function monthLabel(slots: IceSlot[]): string | null {
  const first = slots[0]
  if (!first) return null
  const label = new Date(first.startsAt).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1).replace(/\s*г\.$/, '')
}

/**
 * @spec SPEC-FR-6.2.2 - Разные механизмы записи по типу площадки
 */
export function ArenaBookingPanel({
  arena,
  slots,
  'data-testid': dataTestId,
}: ArenaBookingPanelProps) {
  const isSlots = arena.bookingMode === 'slot_calendar'
  const month = isSlots ? monthLabel(slots) : null

  return (
    <section className="arena-detail__section arena-booking" data-testid={dataTestId}>
      <SectionHeading
        title={isSlots ? 'Свободное время' : 'Заявка на лёд'}
        as="h3"
        data-testid={testId('arenas', 'booking', 'text', 'title', arena.id)}
      />
      <IceCard
        padding="m"
        className={`arena-booking__card arena-booking--${isSlots ? 'slots' : 'portal'}`}
        data-testid={testId('arenas', 'booking', 'panel', isSlots ? 'slots' : 'portal', arena.id)}
      >
        {isSlots ? (
          <>
            <div className="arena-booking__head">
              <Text
                className="arena-booking__lead"
                data-testid={testId('arenas', 'booking', 'text', 'subtitle', arena.id)}
              >
                Выберите слот — отправим заявку на бронь.
              </Text>
              {month && (
                <span
                  className="arena-booking__month"
                  data-testid={testId('arenas', 'booking', 'text', 'month', arena.id)}
                >
                  {month}
                </span>
              )}
            </div>
            <SlotCalendar slots={slots} arena={arena} />
          </>
        ) : (
          <>
            <Text
              color="secondary"
              className="arena-booking__note"
              data-testid={testId('arenas', 'booking', 'text', 'subtitle', arena.id)}
            >
              У этой площадки нет календаря слотов — оставьте заявку, администратор свяжется с вами.
            </Text>
            {arena.phone && (
              <Text
                className="arena-booking__phone"
                data-testid={testId('arenas', 'booking', 'text', 'phone', arena.id)}
              >
                <span className="arena-booking__phone-label">Телефон:</span>
                <strong>{arena.phone}</strong>
              </Text>
            )}
            <ArenaQuickRequestForm arena={arena} />
          </>
        )}
      </IceCard>
    </section>
  )
}
