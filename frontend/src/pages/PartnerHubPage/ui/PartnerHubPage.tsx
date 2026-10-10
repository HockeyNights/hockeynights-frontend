/**
 * SPEC-FR-24.5.3, SPEC-FR-24.7.3
 */

import {Link} from 'react-router'

import {useSessionAccess} from '@/features/access'
import {partnerCabinetLabel, partnerCabinetPath} from '@/shared/const/partnerRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {PageHeader} from '@/shared/ui/PageHeader'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'

const CABINET_FEATURES: Record<string, string[]> = {
  league: ['Профиль лиги', 'Заявки команд', 'Расписание и таблица', 'Публикации', 'Аналитика'],
  shop: ['Профиль магазина', 'Товары', 'Импорт каталога', 'Промо', 'Аналитика и лиды'],
  club: [
    'Профиль клуба и контакты',
    'Состав и управление звеньями',
    'Тренерский и административный штаб',
    'Клубный календарь матчей',
    'Приватные тренировки для своих игроков',
  ],
  arena: [
    'Профиль арены',
    'Объявления льда',
    'Расписание слотов',
    'Публичность в каталоге',
    'Заявки на лёд',
  ],
}

const CABINET_TAGLINES: Record<string, string> = {
  league: 'расписание, заявки и публикации',
  shop: 'каталог, промо и лиды',
  club: 'управление составом и тренировками',
  arena: 'лёд, слоты и заявки',
}

/** @spec SPEC-FR-24.5.3 - Хаб партнёрских кабинетов */
export function PartnerHubPage() {
  const {session, isError, refetch} = useSessionAccess()
  const memberships = session?.user.partnerMemberships ?? []

  // Без этой ветки сбой запроса выглядел бы как «у вас нет кабинетов»
  if (isError) {
    return (
      <QueryErrorState
        title="Не удалось загрузить партнёрские кабинеты"
        onRetry={() => refetch()}
        testIdPrefix="partners"
        data-testid={testId('partners', 'hub', 'error')}
      />
    )
  }

  if (memberships.length === 0) {
    return (
      <IceCard padding="m">
        <div
          className="partner-hub hockey-stack hockey-stack--gap-12"
          data-testid={testId('partners', 'hub', 'page', 'empty')}
        >
          <PageHeader
            title="Партнёрские кабинеты"
            subtitle="Кабинеты лиги, магазина, клуба и ледовой арены доступны после mock-входа с ролью представителя партнёра."
            testIdPrefix="partners"
            testIdSection="hub"
          />
          <Link to="/" data-testid={testId('partners', 'hub', 'link', 'login')}>
            <HockeyButton view="action" data-testid={testId('partners', 'hub', 'btn', 'login')}>
              Перейти к входу
            </HockeyButton>
          </Link>
        </div>
      </IceCard>
    )
  }

  return (
    <div
      className="partner-hub fin-pc hockey-stack hockey-stack--gap-16"
      data-testid={testId('partners', 'hub', 'page')}
    >
      <PageHeader
        title="Партнёрские кабинеты"
        subtitle="Управление профилем, контентом и операционкой внутри HockeyNights — без перехода только на внешний сайт."
        testIdPrefix="partners"
        testIdSection="hub"
      />

      <div className="partner-hub__grid" data-testid={testId('partners', 'hub', 'list')}>
        {memberships.map((membership, index) => (
          <IceCard
            key={`${membership.kind}-${membership.entityId}`}
            padding="m"
            className="partner-hub__card-shell"
          >
            <div
              className="partner-hub__card"
              data-testid={testId('partners', 'hub', 'card', membership.kind, membership.entityId)}
            >
              <div className="partner-hub__card-head">
                <div className="partner-hub__card-copy">
                  <h2
                    className="partner-hub__card-title"
                    data-testid={testId(
                      'partners',
                      'hub',
                      'text',
                      'cabinet-label',
                      membership.kind,
                      membership.entityId,
                    )}
                  >
                    {partnerCabinetLabel(membership)}
                  </h2>
                  <p
                    className="partner-hub__card-subtitle"
                    data-testid={testId(
                      'partners',
                      'hub',
                      'text',
                      'entity-name',
                      membership.kind,
                      membership.entityId,
                    )}
                  >
                    {membership.entityName}
                    {CABINET_TAGLINES[membership.kind]
                      ? ` · ${CABINET_TAGLINES[membership.kind]}`
                      : ''}
                  </p>
                </div>
                {index === 0 ? (
                  <span
                    className="partner-hub__primary-badge"
                    data-testid={testId(
                      'partners',
                      'hub',
                      'badge',
                      'primary',
                      membership.kind,
                      membership.entityId,
                    )}
                  >
                    Основной
                  </span>
                ) : null}
              </div>
              <ul
                className="partner-hub__features"
                data-testid={testId(
                  'partners',
                  'hub',
                  'list',
                  'features',
                  membership.kind,
                  membership.entityId,
                )}
              >
                {CABINET_FEATURES[membership.kind].map((feature) => (
                  <li
                    key={feature}
                    className="partner-hub__feature"
                    data-testid={testId(
                      'partners',
                      'hub',
                      'item',
                      'feature',
                      membership.kind,
                      membership.entityId,
                      feature,
                    )}
                  >
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to={partnerCabinetPath(membership)}
                className="partner-hub__open"
                data-testid={testId(
                  'partners',
                  'hub',
                  'link',
                  'cabinet',
                  membership.kind,
                  membership.entityId,
                )}
              >
                <HockeyButton
                  view="action"
                  size="l"
                  width="max"
                  data-testid={testId(
                    'partners',
                    'hub',
                    'btn',
                    'open-cabinet',
                    membership.kind,
                    membership.entityId,
                  )}
                >
                  Открыть кабинет
                </HockeyButton>
              </Link>
            </div>
          </IceCard>
        ))}
      </div>
    </div>
  )
}
