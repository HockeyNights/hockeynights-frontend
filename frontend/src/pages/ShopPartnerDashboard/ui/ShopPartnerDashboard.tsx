/**
 * SPEC-FR-24.7.3, SPEC-FR-24.7.4
 */

import {Text, TextArea, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'
import {Link, useParams} from 'react-router'

import type {Shop} from '@/entities/shop'
import {fetchShops, updateShopPartnerProfile} from '@/entities/shop'
import {useSessionAccess} from '@/features/access'
import {
  ShopAnalyticsPanel,
  ShopCatalogImportPanel,
  ShopProductManager,
  ShopPromoManager,
} from '@/features/shops'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {PageHeader} from '@/shared/ui/PageHeader'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {SectionHeading} from '@/shared/ui/SectionHeading'

type PartnerTab = 'profile' | 'products' | 'import' | 'promos' | 'analytics'

const PARTNER_TABS: {id: PartnerTab; label: string}[] = [
  {id: 'profile', label: 'О магазине'},
  {id: 'products', label: 'Товары'},
  {id: 'import', label: 'Импорт'},
  {id: 'promos', label: 'Промо'},
  {id: 'analytics', label: 'Аналитика'},
]

/** @spec SPEC-FR-24.7.3 - Кабинет партнёра магазина */
export function ShopPartnerDashboard() {
  const {shopId = ''} = useParams()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<PartnerTab>('products')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const {session} = useSessionAccess()
  const {
    data: shops = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({queryKey: ['shops'], queryFn: fetchShops})
  const shop = shops.find((item) => item.id === shopId)

  const [draft, setDraft] = useState<Partial<Shop>>({})

  const canManage =
    session?.user.roles.includes('admin') ||
    session?.user.partnerMemberships?.some((m) => m.kind === 'shop' && m.entityId === shopId)

  const saveMutation = useMutation({
    mutationFn: (patch: Partial<Shop>) => updateShopPartnerProfile(shopId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['shops']})
      setStatusMessage('Профиль отправлен на модерацию. Изменения появятся после проверки.')
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось сохранить профиль')
    },
  })

  if (isLoading) {
    return (
      <div data-testid={testId('shops', shopId, 'dashboard', 'loader')}>
        <ScoreboardLoader label="Загрузка кабинета магазина" />
      </div>
    )
  }

  if (isError) {
    return (
      <QueryErrorState
        title="Не удалось загрузить кабинет магазина"
        onRetry={() => refetch()}
        testIdPrefix="shops"
        data-testid={testId('shops', shopId, 'dashboard', 'error')}
      />
    )
  }

  if (!shop) {
    return (
      <div
        className="hockey-stack hockey-stack--gap-12"
        data-testid={testId('shops', shopId, 'dashboard', 'empty')}
      >
        <EmptyNetState
          title="Магазин не найден"
          copy="Возможно, ссылка устарела или магазин скрыт."
        />
        <Link to="/shops" data-testid={testId('shops', shopId, 'dashboard', 'link', 'back-empty')}>
          <HockeyButton
            view="flat"
            size="m"
            data-testid={testId('shops', shopId, 'dashboard', 'btn', 'back-empty')}
          >
            К маркету
          </HockeyButton>
        </Link>
      </div>
    )
  }

  const form = {...shop, ...draft}

  if (!canManage) {
    return (
      <IceCard padding="m">
        <div data-testid={testId('shops', shopId, 'dashboard', 'panel', 'denied')}>
          <Text data-testid={testId('shops', shopId, 'dashboard', 'text', 'denied')}>
            Кабинет доступен только представителю магазина. Выберите роль при входе.
          </Text>
          <Link
            to="/"
            className="hockey-mt-12"
            data-testid={testId('shops', shopId, 'dashboard', 'link', 'login')}
          >
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId('shops', shopId, 'dashboard', 'btn', 'login')}
            >
              Перейти к входу
            </HockeyButton>
          </Link>
        </div>
      </IceCard>
    )
  }

  return (
    <div
      className="partner-dashboard partner-cabinet partner-cabinet--shop"
      data-testid={testId('shops', shopId, 'dashboard', 'page')}
    >
      <PageHeader
        title="Кабинет магазина"
        subtitle={shop.name}
        testIdPrefix="shops"
        testIdSection="dashboard"
        actions={
          <span data-testid={testId('shops', shopId, 'dashboard', 'badge', 'profile')}>
            <EntityProfileBadge kind="shop" />
          </span>
        }
      />

      <div
        className="hockey-segmented partner-cabinet__tabs"
        role="tablist"
        data-testid={testId('shops', shopId, 'dashboard', 'nav')}
      >
        {PARTNER_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`hockey-segmented__item${tab === item.id ? ' is-active' : ''}`}
            data-testid={testId('shops', shopId, 'dashboard', 'tab', item.id)}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <section className="partner-cabinet__block">
          <SectionHeading
            title="Публичный профиль"
            data-testid={testId('shops', shopId, 'dashboard', 'text', 'profile-title')}
          />
          <IceCard padding="m" className="partner-cabinet__card">
            <div
              className="partner-cabinet__form"
              data-testid={testId('shops', shopId, 'dashboard', 'form', 'profile')}
            >
              <TextInput
                label="Описание"
                value={form.description ?? ''}
                data-testid={testId('shops', shopId, 'dashboard', 'field', 'description')}
                onUpdate={(value) => setDraft((prev) => ({...prev, description: value}))}
              />
              <div className="partner-cabinet__field">
                <span className="partner-cabinet__label">Доставка</span>
                <TextArea
                  rows={3}
                  value={form.deliveryInfo ?? ''}
                  data-testid={testId('shops', shopId, 'dashboard', 'field', 'delivery')}
                  onUpdate={(value) => setDraft((prev) => ({...prev, deliveryInfo: value}))}
                />
              </div>
              <div className="partner-cabinet__field">
                <span className="partner-cabinet__label">Самовывоз</span>
                <TextArea
                  rows={3}
                  value={form.pickupInfo ?? ''}
                  data-testid={testId('shops', shopId, 'dashboard', 'field', 'pickup')}
                  onUpdate={(value) => setDraft((prev) => ({...prev, pickupInfo: value}))}
                />
              </div>
              <div className="partner-cabinet__form-row">
                <TextInput
                  label="Email"
                  value={form.contactEmail ?? ''}
                  data-testid={testId('shops', shopId, 'dashboard', 'field', 'email')}
                  onUpdate={(value) => setDraft((prev) => ({...prev, contactEmail: value}))}
                />
                <TextInput
                  label="Телефон"
                  value={form.contactPhone ?? ''}
                  data-testid={testId('shops', shopId, 'dashboard', 'field', 'phone')}
                  onUpdate={(value) => setDraft((prev) => ({...prev, contactPhone: value}))}
                />
              </div>
              <Text
                className="partner-cabinet__note"
                data-testid={testId('shops', shopId, 'dashboard', 'text', 'moderation-status')}
              >
                Статус модерации: {form.moderationStatus ?? 'draft'}
              </Text>
              <HockeyButton
                view="action"
                width="max"
                loading={saveMutation.isPending}
                data-testid={testId('shops', shopId, 'dashboard', 'btn', 'save-profile')}
                onClick={() => saveMutation.mutate(draft)}
              >
                Сохранить профиль
              </HockeyButton>
              {statusMessage && (
                <Text
                  className="partner-cabinet__note"
                  data-testid={testId('shops', shopId, 'dashboard', 'text', 'status-message')}
                >
                  {statusMessage}
                </Text>
              )}
            </div>
          </IceCard>
        </section>
      )}

      {tab === 'products' && (
        <div
          className="partner-cabinet__panel partner-cabinet__panel--products"
          data-testid={testId('shops', shopId, 'dashboard', 'panel', 'products')}
        >
          <ShopProductManager shopId={shopId} />
        </div>
      )}

      {tab === 'import' && (
        <div
          className="partner-cabinet__panel partner-cabinet__panel--import"
          data-testid={testId('shops', shopId, 'dashboard', 'panel', 'import')}
        >
          <ShopCatalogImportPanel shopId={shopId} />
        </div>
      )}

      {tab === 'promos' && (
        <div
          className="partner-cabinet__panel partner-cabinet__panel--promos"
          data-testid={testId('shops', shopId, 'dashboard', 'panel', 'promos')}
        >
          <ShopPromoManager shopId={shopId} />
        </div>
      )}

      {tab === 'analytics' && (
        <div
          className="partner-cabinet__panel partner-cabinet__panel--leads"
          data-testid={testId('shops', shopId, 'dashboard', 'panel', 'analytics')}
        >
          <ShopAnalyticsPanel shopId={shopId} />
        </div>
      )}

      <Link
        to="/shops"
        className="partner-cabinet__back"
        data-testid={testId('shops', shopId, 'dashboard', 'link', 'back')}
      >
        <HockeyButton
          view="outlined"
          size="s"
          data-testid={testId('shops', shopId, 'dashboard', 'btn', 'back')}
        >
          ← К каталогу магазинов
        </HockeyButton>
      </Link>
    </div>
  )
}
