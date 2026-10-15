/**
 * SPEC-FR-9.3.1
 */

import {Text} from '@gravity-ui/uikit'
import {useState} from 'react'

import type {MarketplaceProductListing} from '@/entities/shop'
import {FavoriteButton} from '@/features/favorites'
import {ExternalProductLink} from '@/features/shops/ui/ExternalProductLink'
import {testId} from '@/shared/testing/testId'

const TIER_LABELS = {
  premium: 'Топ',
  boosted: 'Реклама',
  standard: '',
} as const

export interface MarketplaceProductCardProps {
  listing: MarketplaceProductListing
  highlighted?: boolean
  cardRef?: (node: HTMLElement | null) => void
}

/** @spec SPEC-FR-9.3.1 - Карточка товара в ленте маркетплейса */
export function MarketplaceProductCard({
  listing,
  highlighted = false,
  cardRef,
}: MarketplaceProductCardProps) {
  const {offer, shopName, shopCity, shopAdTier, isPromoted, promoDiscount} = listing
  const [imgError, setImgError] = useState(false)
  const tierLabel = TIER_LABELS[shopAdTier]
  const showDiscount = promoDiscount && promoDiscount > 0
  const discountedPrice = showDiscount
    ? Math.round(offer.price * (1 - promoDiscount / 100))
    : offer.price

  const promotedClass = isPromoted ? ` marketplace-card--${shopAdTier}` : ''
  const highlightClass = highlighted ? ' marketplace-card--deep-linked' : ''

  return (
    <article
      ref={cardRef}
      className={`marketplace-card${promotedClass}${highlightClass}`}
      data-testid={testId('shops', 'marketplace-card', 'card', offer.id)}
      data-highlighted={highlighted ? 'true' : undefined}
      aria-current={highlighted ? 'true' : undefined}
    >
      <div className="marketplace-card__media">
        {offer.imageUrl && !imgError ? (
          <img
            src={offer.imageUrl}
            alt={offer.title}
            className="marketplace-card__image"
            loading="lazy"
            data-testid={testId('shops', 'marketplace-card', 'cell', 'image', offer.id)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="marketplace-card__placeholder"
            aria-hidden
            data-testid={testId('shops', 'marketplace-card', 'cell', 'placeholder', offer.id)}
          >
            🏒
          </div>
        )}
        <div className="marketplace-card__badges">
          {tierLabel && (
            <span
              className="marketplace-card__badge marketplace-card__badge--tier"
              data-testid={testId('shops', 'marketplace-card', 'badge', 'tier', offer.id)}
            >
              {tierLabel}
            </span>
          )}
          {showDiscount && (
            <span
              className="marketplace-card__badge marketplace-card__badge--sale"
              data-testid={testId('shops', 'marketplace-card', 'badge', 'sale', offer.id)}
            >
              −{promoDiscount}%
            </span>
          )}
          {offer.availability === 'in_stock' && (
            <span
              className="marketplace-card__badge marketplace-card__badge--stock"
              data-testid={testId('shops', 'marketplace-card', 'badge', 'stock', offer.id)}
            >
              В наличии
            </span>
          )}
        </div>
        <div className="marketplace-card__favorite">
          <FavoriteButton type="product" entityId={offer.id} title={offer.title} />
        </div>
      </div>

      <div className="marketplace-card__body">
        <div className="marketplace-card__price-row">
          <Text
            className="marketplace-card__price"
            data-testid={testId('shops', 'marketplace-card', 'text', 'price', offer.id)}
          >
            {discountedPrice.toLocaleString('ru-RU')} ₽
          </Text>
          {showDiscount && (
            <Text
              color="secondary"
              className="marketplace-card__price-old"
              data-testid={testId('shops', 'marketplace-card', 'text', 'price-old', offer.id)}
            >
              {offer.price.toLocaleString('ru-RU')} ₽
            </Text>
          )}
        </div>
        <Text
          variant="header-2"
          className="marketplace-card__title hockey-entity-title--compact"
          data-testid={testId('shops', 'marketplace-card', 'text', 'title', offer.id)}
        >
          {offer.title}
        </Text>
        <Text
          color="secondary"
          variant="caption-1"
          className="marketplace-card__meta"
          data-testid={testId('shops', 'marketplace-card', 'text', 'meta', offer.id)}
        >
          {shopName} · {offer.category}
        </Text>
        <div className="marketplace-card__action">
          <ExternalProductLink
            offer={offer}
            shopName={shopName}
            shopCity={shopCity}
            shopCategories={[offer.category]}
            shopAdTier={shopAdTier}
            promoTitle={
              isPromoted && promoDiscount ? `Скидка партнёра −${promoDiscount}%` : undefined
            }
            promoDiscount={promoDiscount}
            compact
          />
        </div>
      </div>
    </article>
  )
}
