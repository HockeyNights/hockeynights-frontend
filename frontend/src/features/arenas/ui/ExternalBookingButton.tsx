/**
 * SPEC-FR-6.2.2, SPEC-FR-6.4.2
 */

import {useState} from 'react'

import type {Arena} from '@/entities/arena'
import type {IceSlot} from '@/entities/arena'
import {MockIceBookingModal} from '@/features/arenas/ui/MockIceBookingModal'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

/** @spec SPEC-FR-6.2.2 - Props кнопки записи */
export interface ExternalBookingButtonProps {
  /** @spec SPEC-FR-6.2.1 */
  arena: Arena
  /** @spec SPEC-FR-6.3.1 */
  slot?: IceSlot
  /** @spec SPEC-FR-6.2.2 */
  label?: string
  /** @spec SPEC-FR-6.2.2 */
  size?: 's' | 'm' | 'l' | 'xl'
  view?: 'outlined' | 'action'
}

/**
 * @spec SPEC-FR-6.2.2 - Кнопка записи на лёд через mock-flow
 * @spec SPEC-FR-6.4.2 - Открывает mock-мастер вместо мёртвой внешней ссылки
 */
export function ExternalBookingButton({
  arena,
  slot,
  label = 'Записаться на лёд',
  size = 'm',
  view = 'outlined',
}: ExternalBookingButtonProps) {
  const [open, setOpen] = useState(false)
  const canBook = slot ? slot.status === 'free' : Boolean(arena.bookingUrl ?? arena.websiteUrl)

  if (!canBook) return null

  const btnTestId = slot
    ? testId('arenas', 'booking', 'btn', 'book', arena.id, slot.id)
    : testId('arenas', 'booking', 'btn', 'book', arena.id)

  return (
    <>
      <HockeyButton
        view={view}
        size={size}
        className="arena-book-btn"
        onClick={() => setOpen(true)}
        data-testid={btnTestId}
      >
        {label}
      </HockeyButton>
      <MockIceBookingModal open={open} onClose={() => setOpen(false)} arena={arena} slot={slot} />
    </>
  )
}
