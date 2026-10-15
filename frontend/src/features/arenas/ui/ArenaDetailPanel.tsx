/**
 * SPEC-FR-6.1.1, SPEC-FR-6.2.1, SPEC-FR-6.2.2, SPEC-FR-6.3.1
 * SPEC-UI-2.2
 * HOCFRONT-32 — страница арены в общем стиле IceCard
 */

import {Text} from '@gravity-ui/uikit'

import type {Arena, IceSlot} from '@/entities/arena'
import {
  ARENA_CITY_REGION_LABELS,
  formatArenaAmenities,
  resolveArenaCityRegion,
} from '@/entities/arena'
import {formatArenaPrice} from '@/features/arenas/lib/formatArenaPrice'
import {ArenaBookingPanel} from '@/features/arenas/ui/ArenaBookingPanel'
import {ArenaListingsPanel} from '@/features/arenas/ui/ArenaListingsPanel'
import {FavoriteButton} from '@/features/favorites'
import {testId} from '@/shared/testing/testId'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {SectionHeading} from '@/shared/ui/SectionHeading'

const MODE_LABELS = {
  slot_calendar: 'Запись по слотам',
  external_portal: 'Заявка на площадку',
} as const

/** @spec SPEC-FR-6.2.1 */
export interface ArenaDetailPanelProps {
  arena: Arena
  slots: IceSlot[]
  hasFreeSlot?: boolean
}

/**
 * @spec SPEC-FR-6.2.1 - Контент публичной страницы арены
 */
export function ArenaDetailPanel({arena, slots, hasFreeSlot}: ArenaDetailPanelProps) {
  const freeCount = slots.filter((s) => s.status === 'free').length
  const cityRegion = resolveArenaCityRegion(arena.city)
  const cityLabel = ARENA_CITY_REGION_LABELS[cityRegion]
  const isSlots = arena.bookingMode === 'slot_calendar'

  return (
    <div className="arena-detail" data-testid={testId('arenas', 'detail', 'panel', arena.id)}>
      <IceCard
        padding="m"
        className="arena-detail__hero"
        data-testid={testId('arenas', 'detail', 'panel', 'hero', arena.id)}
      >
        <div className="arena-detail__title-row">
          <Text
            variant="header-1"
            className="arena-detail__name"
            data-testid={testId('arenas', 'detail', 'text', 'name', arena.id)}
          >
            {arena.name}
          </Text>
          <FavoriteButton
            type="arena"
            entityId={arena.id}
            title={arena.name}
            size="m"
            className="arena-favorite"
          />
        </div>
        <Text
          color="secondary"
          className="arena-detail__address"
          data-testid={testId('arenas', 'detail', 'text', 'address', arena.id)}
        >
          {arena.address}
        </Text>
        {arena.priceRange && (
          <Text
            className="arena-detail__price"
            data-testid={testId('arenas', 'detail', 'text', 'price', arena.id)}
          >
            {formatArenaPrice(arena.priceRange)}
          </Text>
        )}
        <div
          className="arena-detail__badges"
          data-testid={testId('arenas', 'detail', 'panel', 'chips', arena.id)}
        >
          <EntityProfileBadge
            kind="arena"
            className="hockey-badge arena-badge arena-badge--lg"
            data-testid={testId('arenas', 'detail', 'badge', 'profile', arena.id)}
          />
          <span
            className={`hockey-badge arena-badge arena-badge--lg ${isSlots ? 'hockey-badge--green' : 'hockey-badge--gold'}`}
            data-testid={testId('arenas', 'detail', 'badge', 'mode', arena.id)}
          >
            {MODE_LABELS[arena.bookingMode]}
          </span>
        </div>
        {isSlots && (
          <span
            className={`rink-slot-lamp rink-slot-lamp--compact${hasFreeSlot ? '' : ' rink-slot-lamp--busy'}`}
            data-testid={testId('arenas', 'detail', 'badge', 'slot-lamp', arena.id)}
          >
            <span className="rink-slot-lamp__dot" aria-hidden />
            {hasFreeSlot === false
              ? 'Сейчас занято'
              : freeCount > 0
                ? `Свободных слотов: ${freeCount}`
                : 'Слоты скоро появятся'}
          </span>
        )}
        {arena.websiteUrl && (
          <a
            href={arena.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="arena-detail__website"
            data-testid={testId('arenas', 'detail', 'link', 'website', arena.id)}
          >
            <HockeyButton
              view="outlined"
              size="xl"
              width="max"
              tabIndex={-1}
              data-testid={testId('arenas', 'detail', 'btn', 'website', arena.id)}
            >
              Сайт арены
            </HockeyButton>
          </a>
        )}
      </IceCard>

      <div className="arena-detail__grid">
        <div className="arena-detail__aside">
          <section className="arena-detail__section">
            <SectionHeading
              title="О площадке"
              as="h3"
              data-testid={testId('arenas', 'detail', 'text', 'about-title', arena.id)}
            />
            <IceCard
              padding="m"
              className="arena-detail__card"
              data-testid={testId('arenas', 'detail', 'panel', 'meta', arena.id)}
            >
              <dl className="arena-detail__facts">
                <div className="arena-detail__fact">
                  <dt>Локация</dt>
                  <dd data-testid={testId('arenas', 'detail', 'text', 'city', arena.id)}>
                    {cityLabel}
                    {arena.city !== cityLabel ? ` · ${arena.city}` : ''}
                  </dd>
                </div>
                {arena.metro && (
                  <div className="arena-detail__fact">
                    <dt>Метро</dt>
                    <dd data-testid={testId('arenas', 'detail', 'text', 'metro', arena.id)}>
                      м. {arena.metro}
                      {arena.district ? ` · ${arena.district}` : ''}
                    </dd>
                  </div>
                )}
                {arena.phone && (
                  <div className="arena-detail__fact">
                    <dt>Телефон</dt>
                    <dd data-testid={testId('arenas', 'detail', 'text', 'phone', arena.id)}>
                      <a href={`tel:${arena.phone.replace(/\s/g, '')}`}>{arena.phone}</a>
                    </dd>
                  </div>
                )}
                {arena.amenities.length > 0 && (
                  <div className="arena-detail__fact">
                    <dt>Удобства</dt>
                    <dd data-testid={testId('arenas', 'detail', 'text', 'amenities', arena.id)}>
                      {formatArenaAmenities(arena.amenities)}
                    </dd>
                  </div>
                )}
                {isSlots && (
                  <div className="arena-detail__fact">
                    <dt>Слоты</dt>
                    <dd
                      className={`arena-detail__free${freeCount > 0 ? '' : ' arena-detail__free--none'}`}
                      data-testid={testId('arenas', 'detail', 'text', 'free-slots', arena.id)}
                    >
                      <span className="rink-slot-lamp__dot" aria-hidden />
                      Свободных: {freeCount}
                      {hasFreeSlot === false ? ' · сейчас всё занято' : ''}
                    </dd>
                  </div>
                )}
              </dl>
            </IceCard>
          </section>

          <ArenaListingsPanel arenaId={arena.id} />
        </div>

        <ArenaBookingPanel
          arena={arena}
          slots={slots}
          data-testid={testId('arenas', 'detail', 'panel', 'booking', arena.id)}
        />
      </div>
    </div>
  )
}
