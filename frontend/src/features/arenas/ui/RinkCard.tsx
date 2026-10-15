/**
 * SPEC-FR-6.2.1, SPEC-FR-6.2.2, SPEC-FR-6.4.2
 * SPEC-UI-1.3, SPEC-UI-2.2
 */

import {Text} from '@gravity-ui/uikit'
import {forwardRef} from 'react'

import type {Arena} from '@/entities/arena'
import {formatArenaAmenities} from '@/entities/arena'
import {formatArenaPrice} from '@/features/arenas/lib/formatArenaPrice'
import {FavoriteButton} from '@/features/favorites'
import {testId} from '@/shared/testing/testId'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

const BOOKING_MODE_LABELS = {
  slot_calendar: 'Слоты',
  external_portal: 'Заявка',
} as const

/** @spec SPEC-FR-6.2.1 - Props карточки катка */
export interface RinkCardProps {
  /** @spec SPEC-FR-6.2.1 */
  arena: Arena
  /** @spec SPEC-FR-6.2.2 */
  onOpenDetails?: (arenaId: string) => void
  /** @spec SPEC-UI-2.2 */
  hasFreeSlot?: boolean
  /** HOCFRONT-32E — число опубликованных объявлений льда */
  publishedListingsCount?: number
  /** @spec SPEC-FR-6.2.2 - Активная карточка (синхронизирована с картой) */
  selected?: boolean
}

/**
 * @spec SPEC-UI-2.2 - Ледовая карточка катка с лампой доступности
 * @spec SPEC-FR-6.2.1 - Карточка катка
 * @spec SPEC-FR-6.2.2 - Кликабельная карточка, открывающая детали
 */
export const RinkCard = forwardRef<HTMLDivElement, RinkCardProps>(function RinkCard(
  {arena, onOpenDetails, hasFreeSlot, publishedListingsCount = 0, selected = false},
  ref,
) {
  const handleSelect = onOpenDetails ? () => onOpenDetails(arena.id) : undefined
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!handleSelect || e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect()
    }
  }

  const amenities =
    arena.amenities.length > 0 ? formatArenaAmenities(arena.amenities) : 'Удобства не указаны'
  const metroLine = arena.metro
    ? `м. ${arena.metro}${arena.district ? ` · ${arena.district}` : ''}`
    : arena.district || 'Метро не указано'
  const isSlots = arena.bookingMode === 'slot_calendar'

  return (
    <IceCard
      ref={ref}
      padding="m"
      className={[
        'rink-card',
        selected ? 'rink-card--selected' : '',
        handleSelect ? 'rink-card--clickable' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role={handleSelect ? 'button' : undefined}
      tabIndex={handleSelect ? 0 : undefined}
      aria-pressed={handleSelect ? selected : undefined}
      onClick={handleSelect}
      onKeyDown={handleSelect ? handleKeyDown : undefined}
      data-testid={testId('arenas', 'rink', 'card', arena.id)}
    >
      <div className="rink-card__head">
        <div className="rink-card__heading">
          <Text
            variant="header-2"
            className="rink-card__title"
            data-testid={testId('arenas', 'rink', 'text', 'name', arena.id)}
          >
            {arena.name}
          </Text>
          <div
            className="rink-card__badges"
            data-testid={testId('arenas', 'rink', 'panel', 'chips', arena.id)}
          >
            <EntityProfileBadge
              kind="arena"
              className="hockey-badge arena-badge"
              data-testid={testId('arenas', 'rink', 'badge', 'profile', arena.id)}
            />
            <span
              className={`hockey-badge arena-badge ${isSlots ? 'hockey-badge--green' : 'hockey-badge--gold'}`}
              data-testid={testId('arenas', 'rink', 'badge', 'mode', arena.id)}
            >
              {BOOKING_MODE_LABELS[arena.bookingMode]}
            </span>
          </div>
        </div>
        <FavoriteButton
          type="arena"
          entityId={arena.id}
          title={arena.name}
          size="m"
          className="arena-favorite"
        />
      </div>

      <div
        className="rink-card__status"
        data-testid={testId('arenas', 'rink', 'panel', 'status', arena.id)}
      >
        {isSlots ? (
          <span
            className={`rink-slot-lamp${hasFreeSlot ? '' : ' rink-slot-lamp--busy'}`}
            aria-label={
              hasFreeSlot === undefined
                ? 'Статус слотов неизвестен'
                : hasFreeSlot
                  ? 'Есть свободные слоты'
                  : 'Слоты заняты'
            }
            data-testid={testId('arenas', 'rink', 'badge', 'slot-lamp', arena.id)}
          >
            <span className="rink-slot-lamp__dot" aria-hidden />
            {hasFreeSlot === undefined
              ? 'Слоты уточняются'
              : hasFreeSlot
                ? 'Есть свободные слоты'
                : 'Сейчас занято'}
          </span>
        ) : (
          <span
            className="rink-slot-lamp rink-slot-lamp--portal"
            data-testid={testId('arenas', 'rink', 'badge', 'portal-status', arena.id)}
          >
            <span className="rink-slot-lamp__dot" aria-hidden />
            Запись по заявке
          </span>
        )}
      </div>

      <Text
        className="rink-card__line rink-card__address"
        data-testid={testId('arenas', 'rink', 'text', 'address', arena.id)}
      >
        {arena.address}
      </Text>

      <div className="rink-card__facts">
        <Text
          className="rink-card__line"
          data-testid={testId('arenas', 'rink', 'text', 'metro', arena.id)}
        >
          {metroLine}
        </Text>
        {arena.priceRange ? (
          <Text
            className="rink-card__line rink-card__price"
            data-testid={testId('arenas', 'rink', 'text', 'price', arena.id)}
          >
            {formatArenaPrice(arena.priceRange)}
          </Text>
        ) : (
          <Text
            className="rink-card__line"
            data-testid={testId('arenas', 'rink', 'text', 'price-empty', arena.id)}
          >
            Цена по запросу
          </Text>
        )}
        <Text
          className="rink-card__line"
          data-testid={testId('arenas', 'rink', 'text', 'amenities', arena.id)}
        >
          {amenities}
        </Text>
        <Text
          className="rink-card__line"
          data-testid={testId('arenas', 'rink', 'text', 'listings', arena.id)}
        >
          {publishedListingsCount > 0
            ? `Объявлений льда: ${publishedListingsCount}`
            : 'Нет объявлений льда'}
        </Text>
      </div>

      {handleSelect && (
        <div className="rink-card__footer">
          <HockeyButton
            view="outlined"
            size="xl"
            className="rink-card__open"
            onClick={(e) => {
              e.stopPropagation()
              handleSelect()
            }}
            data-testid={testId('arenas', 'rink', 'btn', 'open', arena.id)}
          >
            {selected ? 'Открыто' : 'Подробнее'}
          </HockeyButton>
        </div>
      )}
    </IceCard>
  )
})
