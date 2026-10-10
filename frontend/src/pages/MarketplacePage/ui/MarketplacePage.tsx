/**
 * SPEC-FR-9.3.1
 */

import {Select, Switch, Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {type ReactNode, useEffect, useMemo, useRef, useState} from 'react'
import {useSearchParams} from 'react-router'

import type {PlayerPosition} from '@/entities/common'
import type {MarketplaceFilters, MarketplaceSort} from '@/entities/shop'
import {fetchMarketplaceFeed} from '@/entities/shop'
import {MarketplaceProductCard, MarketplaceShopStrip} from '@/features/shops'
import {testId} from '@/shared/testing/testId'
import {CatalogFilterBar} from '@/shared/ui/CatalogFilterBar'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {SectionHeading} from '@/shared/ui/SectionHeading'

const DEFAULT_FILTERS: MarketplaceFilters = {sort: 'recommended', inStockOnly: false}
const SHOP_CHIP_ID = 'shop-filter'
const ALL_CATEGORIES_CHIP_ID = 'all-categories'

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function productsCountLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  const word =
    mod10 === 1 && mod100 !== 11
      ? 'товар'
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? 'товара'
        : 'товаров'
  return `${count} ${word}`
}

const SORT_OPTIONS = [
  {value: 'recommended', content: 'Рекомендуемые'},
  {value: 'price_asc', content: 'Сначала дешевле'},
  {value: 'price_desc', content: 'Сначала дороже'},
]

const POSITION_OPTIONS = [
  {value: 'any', content: 'Любая позиция'},
  {value: 'forward', content: 'Нападающий'},
  {value: 'defense', content: 'Защитник'},
  {value: 'goalie', content: 'Вратарь'},
]

/** Поиск не считается фильтром: его сбрасывает само поле. Сортировка ленту не сужает. */
function countActiveFilters(filters: MarketplaceFilters): number {
  return (
    [filters.category, filters.position, filters.shopId].filter(Boolean).length +
    (filters.inStockOnly ? 1 : 0)
  )
}

/**
 * @spec SPEC-FR-9.3.1 - Маркетплейс экипировки (лента товаров)
 */
export function MarketplacePage({banner}: {banner?: ReactNode} = {}) {
  const [searchParams] = useSearchParams()
  const productIdFromUrl = searchParams.get('productId')
  const [filters, setFilters] = useState<MarketplaceFilters>(DEFAULT_FILTERS)
  const productCardRefs = useRef<Map<string, HTMLElement | null>>(new Map())
  const scrollOnNextProductRef = useRef(false)

  useEffect(() => {
    if (!productIdFromUrl) return
    scrollOnNextProductRef.current = true
  }, [productIdFromUrl])

  const {data, isLoading, isFetching, isError, refetch} = useQuery({
    queryKey: ['marketplace', filters],
    queryFn: () => fetchMarketplaceFeed(filters),
  })

  const listings = data?.listings ?? []
  const spotlightShops = data?.spotlightShops ?? []
  const listingIdsKey = listings.map((listing) => listing.offer.id).join(',')

  useEffect(() => {
    if (!productIdFromUrl || !scrollOnNextProductRef.current) return
    if (isLoading) return
    const node = productCardRefs.current.get(productIdFromUrl)
    if (!node) return
    scrollOnNextProductRef.current = false
    if (typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({behavior: 'smooth', block: 'nearest'})
    }
  }, [productIdFromUrl, listingIdsKey, isLoading])

  function patchFilters(patch: Partial<MarketplaceFilters>) {
    setFilters((prev) => ({...prev, ...patch}))
  }

  const categoryChips = useMemo(
    () => [
      {id: ALL_CATEGORIES_CHIP_ID, label: 'Все категории', active: !filters.category},
      ...(data?.categories ?? []).map((category) => ({
        id: category,
        label: capitalize(category),
        active: filters.category === category,
      })),
    ],
    [data?.categories, filters.category],
  )

  const chips = useMemo(() => {
    if (!filters.shopId) return categoryChips
    const shopName =
      data?.spotlightShops.find((item) => item.shop.id === filters.shopId)?.shop.name ??
      data?.listings.find((listing) => listing.shopId === filters.shopId)?.shopName ??
      'Магазин'
    return [{id: SHOP_CHIP_ID, label: shopName, active: true}, ...categoryChips]
  }, [categoryChips, data?.listings, data?.spotlightShops, filters.shopId])

  return (
    <PageHub className="marketplace" data-testid={testId('shops', 'marketplace', 'page')}>
      <CatalogFilterBar
        testIdPrefix="shops"
        testIdSection="marketplace"
        className="marketplace-filters"
        header={
          <div className="marketplace-filters__header">
            <PageHeader
              title="Маркет экипировки"
              subtitle="Лента товаров от партнёрских магазинов — как маркетплейс, с приоритетом для продвигаемых продавцов."
              testIdPrefix="shops"
              testIdSection="marketplace"
            />
            {banner}
            <MarketplaceShopStrip
              shops={spotlightShops}
              activeShopId={filters.shopId}
              onSelectShop={(shopId) => patchFilters({shopId})}
            />
          </div>
        }
        searchValue={filters.q ?? ''}
        onSearchChange={(value) => patchFilters({q: value || undefined})}
        searchPlaceholder="Поиск…"
        searchLabel="Поиск по маркету"
        chips={chips}
        onChipToggle={(chipId) => {
          if (chipId === SHOP_CHIP_ID) {
            patchFilters({shopId: undefined})
            return
          }
          if (chipId === ALL_CATEGORIES_CHIP_ID) {
            patchFilters({category: undefined})
            return
          }
          patchFilters({category: filters.category === chipId ? undefined : chipId})
        }}
        activeCount={countActiveFilters(filters)}
        onReset={() =>
          setFilters((prev) => ({...DEFAULT_FILTERS, sort: prev.sort ?? 'recommended'}))
        }
        resultsCount={listings.length}
        resultsPending={isFetching}
        advanced={
          <>
            <Select
              label="Сортировка"
              size="l"
              value={[filters.sort ?? 'recommended']}
              onUpdate={(value) => patchFilters({sort: value[0] as MarketplaceSort})}
              options={SORT_OPTIONS}
              data-testid={testId('shops', 'marketplace', 'select', 'sort')}
            />
            <Select
              label="Для позиции"
              size="l"
              value={[filters.position ?? 'any']}
              onUpdate={(value) => {
                const next = value[0] as PlayerPosition | 'any'
                patchFilters({position: next === 'any' ? undefined : next})
              }}
              options={POSITION_OPTIONS}
              data-testid={testId('shops', 'marketplace', 'select', 'position')}
            />
            <div
              className="catalog-filters__check marketplace-filters__stock"
              data-testid={testId('shops', 'marketplace', 'toggle', 'in-stock')}
            >
              <Switch
                size="l"
                checked={Boolean(filters.inStockOnly)}
                onUpdate={(checked) => patchFilters({inStockOnly: checked})}
                content="Только в наличии"
              />
            </div>
          </>
        }
      />

      {isLoading ? (
        <div data-testid={testId('shops', 'marketplace', 'loader')}>
          <ScoreboardLoader label="Загрузка маркетплейса" />
        </div>
      ) : isError ? (
        <QueryErrorState
          title="Не удалось загрузить маркетплейс"
          copy="Проверь соединение и попробуй ещё раз."
          onRetry={() => void refetch()}
          testIdPrefix="shops"
          data-testid={testId('shops', 'marketplace', 'error')}
        />
      ) : listings.length === 0 ? (
        <div className="marketplace__empty" data-testid={testId('shops', 'marketplace', 'empty')}>
          <Text
            variant="subheader-2"
            data-testid={testId('shops', 'marketplace', 'text', 'empty-title')}
          >
            Ничего не нашли
          </Text>
          <Text
            color="secondary"
            data-testid={testId('shops', 'marketplace', 'text', 'empty-hint')}
          >
            Попробуйте другой запрос или снимите фильтры.
          </Text>
        </div>
      ) : (
        <section className="marketplace__feed" aria-label="Товары">
          <SectionHeading
            title={productsCountLabel(listings.length)}
            data-testid={testId('shops', 'marketplace', 'text', 'count')}
          />
          <div className="marketplace__grid" data-testid={testId('shops', 'marketplace', 'list')}>
            {listings.map((listing) => (
              <MarketplaceProductCard
                key={listing.offer.id}
                listing={listing}
                highlighted={productIdFromUrl === listing.offer.id}
                cardRef={(node) => {
                  productCardRefs.current.set(listing.offer.id, node)
                }}
              />
            ))}
          </div>
        </section>
      )}
    </PageHub>
  )
}
