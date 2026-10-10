/**
 * SPEC-FR-9.2.2, SPEC-FR-9.2.3
 */

import {useState} from 'react'

import type {ProductOffer, Shop} from '@/entities/shop'
import {MockShopCheckoutModal} from '@/features/shops/ui/MockShopCheckoutModal'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

/** @spec SPEC-FR-9.2.3 - Props mock-покупки */
export interface ExternalProductLinkProps {
  /** @spec SPEC-FR-9.2.1 */
  offer: ProductOffer
  /** @spec SPEC-FR-9.1.2 */
  shopName: string
  shopCity?: string
  shopCategories?: string[]
  shopAdTier?: NonNullable<Shop['adTier']>
  promoTitle?: string
  promoDiscount?: number
  /** @spec SPEC-FR-9.3.1 - Компактная кнопка для карточки маркетплейса */
  compact?: boolean
}

/**
 * @spec SPEC-FR-9.2.3 - Mock-переход к покупке вместо мёртвой внешней ссылки
 */
export function ExternalProductLink({
  offer,
  shopName,
  shopCity,
  shopCategories,
  shopAdTier,
  promoTitle,
  promoDiscount,
  compact = false,
}: ExternalProductLinkProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <HockeyButton
        view={compact ? 'action' : 'outlined'}
        size={compact ? 'm' : 's'}
        width={compact ? 'max' : undefined}
        disabled={offer.availability === 'out_of_stock'}
        data-testid={testId('shops', 'product-link', 'btn', 'buy', offer.id)}
        onClick={() => setOpen(true)}
      >
        {offer.availability === 'out_of_stock'
          ? 'Нет в наличии'
          : compact
            ? 'Купить'
            : `Купить: ${offer.title}`}
      </HockeyButton>
      <MockShopCheckoutModal
        open={open}
        onClose={() => setOpen(false)}
        offer={offer}
        shopName={shopName}
        shopCity={shopCity}
        shopCategories={shopCategories}
        shopAdTier={shopAdTier}
        promoTitle={promoTitle}
        promoDiscount={promoDiscount}
      />
    </>
  )
}
