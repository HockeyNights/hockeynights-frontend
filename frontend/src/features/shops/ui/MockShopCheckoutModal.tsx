/**
 * SPEC-FR-9.2.3, SPEC-FR-9.2.2
 * Макет Figma 27:62359 / 27:62425 — mock «Оформление оплаты»
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation} from '@tanstack/react-query'
import {useState} from 'react'

import type {CheckoutIntent} from '@/entities/external-flow'
import {createCheckoutIntent} from '@/entities/external-flow'
import type {ProductOffer, Shop} from '@/entities/shop'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {MockExternalFlowDialog} from '@/shared/ui/MockExternalFlowDialog'

const TIER_LABELS = {
  premium: 'Премиум',
  boosted: 'Продвижение',
  standard: '',
} as const

const AVAILABILITY_LABELS: Record<ProductOffer['availability'], string> = {
  in_stock: 'В наличии',
  out_of_stock: 'Нет в наличии',
  unknown: 'Уточняйте',
}

/** @spec SPEC-FR-9.2.3 - Props mock-checkout */
export interface MockShopCheckoutModalProps {
  /** @spec SPEC-FR-9.2.3 */
  open: boolean
  /** @spec SPEC-FR-9.2.3 */
  onClose: () => void
  /** @spec SPEC-FR-9.2.1 */
  offer: ProductOffer
  /** @spec SPEC-FR-9.1.2 */
  shopName: string
  shopCity?: string
  shopCategories?: string[]
  shopAdTier?: NonNullable<Shop['adTier']>
  promoTitle?: string
  promoDiscount?: number
}

/**
 * @spec SPEC-FR-9.2.3 - Mock-переход к покупке на сайте магазина
 */
export function MockShopCheckoutModal({
  open,
  onClose,
  offer,
  shopName,
  shopCity,
  shopCategories,
  shopAdTier = 'standard',
  promoTitle,
  promoDiscount,
}: MockShopCheckoutModalProps) {
  const [result, setResult] = useState<CheckoutIntent | null>(null)
  const [imgError, setImgError] = useState(false)

  const mutation = useMutation({
    mutationFn: createCheckoutIntent,
    onSuccess: (intent) => setResult(intent),
  })

  function handleClose() {
    setResult(null)
    mutation.reset()
    onClose()
  }

  const tierLabel = TIER_LABELS[shopAdTier]
  const showDiscount = Boolean(promoDiscount && promoDiscount > 0)
  const discountedPrice = showDiscount
    ? Math.round(offer.price * (1 - (promoDiscount ?? 0) / 100))
    : offer.price
  const shopMeta = [shopCity ?? 'Онлайн', ...(shopCategories?.slice(0, 2) ?? [])]
    .filter(Boolean)
    .join(' · ')

  return (
    <MockExternalFlowDialog
      open={open}
      onClose={handleClose}
      flowType="shop_checkout"
      partnerName={shopName}
      externalUrl={offer.externalUrl}
      testIdPrefix="shops"
      footer={
        result ? (
          <HockeyButton
            data-testid={testId('shops', 'checkout-modal', 'btn', 'confirm', offer.id)}
            onClick={handleClose}
          >
            Понятно
          </HockeyButton>
        ) : (
          <>
            <HockeyButton
              view="outlined"
              data-testid={testId('shops', 'checkout-modal', 'btn', 'cancel', offer.id)}
              onClick={handleClose}
            >
              Отменить
            </HockeyButton>
            <HockeyButton
              loading={mutation.isPending}
              data-testid={testId('shops', 'checkout-modal', 'btn', 'checkout', offer.id)}
              onClick={() => mutation.mutate({offerId: offer.id})}
            >
              Перейти к покупке
            </HockeyButton>
          </>
        )
      }
    >
      {result ? (
        <div
          className="shop-checkout-modal hockey-stack hockey-stack--gap-8"
          data-testid={testId('shops', 'checkout-modal', 'panel', 'result', offer.id)}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('shops', 'checkout-modal', 'text', 'result-title', offer.id)}
          >
            Переход подготовлен (mock)
          </Text>
          <Text data-testid={testId('shops', 'checkout-modal', 'text', 'result-offer', offer.id)}>
            {result.offerTitle} — {result.price.toLocaleString('ru-RU')} {result.currency}
          </Text>
          <Text
            color="secondary"
            data-testid={testId('shops', 'checkout-modal', 'text', 'result-hint', offer.id)}
          >
            В Phase 2 откроется {result.externalUrl}. Сейчас покупка не выполняется.
          </Text>
        </div>
      ) : (
        <div
          className="shop-checkout-modal"
          data-testid={testId('shops', 'checkout-modal', 'panel', 'confirm', offer.id)}
        >
          {tierLabel ? (
            <div
              className={`shop-checkout-modal__shop shop-checkout-modal__shop--${shopAdTier}`}
              data-testid={testId('shops', 'checkout-modal', 'card', 'shop', offer.id)}
            >
              <span
                className="shop-checkout-modal__tier"
                data-testid={testId('shops', 'checkout-modal', 'badge', 'tier', offer.id)}
              >
                {tierLabel}
              </span>
              <Text
                className="shop-checkout-modal__shop-name"
                data-testid={testId('shops', 'checkout-modal', 'text', 'shop-name', offer.id)}
              >
                {shopName}
              </Text>
              {shopMeta ? (
                <Text
                  color="secondary"
                  className="shop-checkout-modal__shop-meta"
                  data-testid={testId('shops', 'checkout-modal', 'text', 'shop-meta', offer.id)}
                >
                  {shopMeta}
                </Text>
              ) : null}
              {promoTitle ? (
                <Text
                  className="shop-checkout-modal__shop-promo"
                  data-testid={testId('shops', 'checkout-modal', 'text', 'shop-promo', offer.id)}
                >
                  {promoTitle}
                </Text>
              ) : null}
            </div>
          ) : null}

          <div
            className="shop-checkout-modal__product"
            data-testid={testId('shops', 'checkout-modal', 'card', 'product', offer.id)}
          >
            <div
              className="shop-checkout-modal__thumb"
              data-testid={testId('shops', 'checkout-modal', 'cell', 'thumb', offer.id)}
            >
              {offer.imageUrl && !imgError ? (
                <img
                  src={offer.imageUrl}
                  alt=""
                  className="shop-checkout-modal__thumb-img"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span aria-hidden className="shop-checkout-modal__thumb-fallback">
                  {offer.title.split(' ').slice(-1)[0]}
                </span>
              )}
            </div>
            <div className="shop-checkout-modal__product-copy">
              <div className="shop-checkout-modal__product-badges">
                <span
                  className={`shop-checkout-modal__stock shop-checkout-modal__stock--${offer.availability}`}
                  data-testid={testId('shops', 'checkout-modal', 'badge', 'stock', offer.id)}
                >
                  {AVAILABILITY_LABELS[offer.availability]}
                </span>
                {showDiscount ? (
                  <span
                    className="shop-checkout-modal__sale"
                    data-testid={testId('shops', 'checkout-modal', 'badge', 'sale', offer.id)}
                  >
                    −{promoDiscount}%
                  </span>
                ) : null}
              </div>
              <Text
                className="shop-checkout-modal__product-title"
                data-testid={testId('shops', 'checkout-modal', 'text', 'title', offer.id)}
              >
                {offer.title}
              </Text>
              <div className="shop-checkout-modal__price-row">
                <Text
                  className="shop-checkout-modal__price"
                  data-testid={testId('shops', 'checkout-modal', 'text', 'price', offer.id)}
                >
                  {discountedPrice.toLocaleString('ru-RU')} ₽
                </Text>
                {showDiscount ? (
                  <Text
                    color="secondary"
                    className="shop-checkout-modal__price-old"
                    data-testid={testId('shops', 'checkout-modal', 'text', 'price-old', offer.id)}
                  >
                    {offer.price.toLocaleString('ru-RU')} ₽
                  </Text>
                ) : null}
              </div>
            </div>
          </div>

          <div
            className="shop-checkout-modal__hint"
            data-testid={testId('shops', 'checkout-modal', 'text', 'hint', offer.id)}
          >
            <span className="shop-checkout-modal__hint-icon" aria-hidden>
              i
            </span>
            <Text color="secondary">
              Подтвердите mock-переход на сайт партнёра для демонстрации сценария покупки.
            </Text>
          </div>
        </div>
      )}
    </MockExternalFlowDialog>
  )
}
