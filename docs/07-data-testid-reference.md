# Справочник data-testid

Атрибуты `data-testid` размечают все интерактивные и текстовые элементы UI для E2E-тестов (Playwright) и интеграционных сценариев.

## Формат имени

```
{scope}-{component}-{element}[-{qualifier}]
```

| Часть         | Описание                               | Пример                                      |
|---------------|----------------------------------------|---------------------------------------------|
| **scope**     | Домен / раздел приложения              | `app`, `auth`, `arenas`, `leagues`, `shops` |
| **component** | Компонент или экран                    | `login`, `standings`, `player-card`         |
| **element**   | Тип элемента (см. таблицу ниже)        | `btn`, `field`, `text`, `table`             |
| **qualifier** | Уникализатор (id сущности, slug роута) | `user-42`, `players`, `shop-1`              |

Все части в **kebab-case**, только латиница и цифры. Строки строятся через хелпер `testId()`:

```ts
import {testId, routeToTestSlug} from '@/shared/testing/testId'

// auth-login-btn-player
testId('auth', 'login', 'btn', 'player')

// leagues-standings-row-team-42 (динамический id)
testId('leagues', 'standings', 'row', teamId)

// app-nav-link-players (навигация по роуту)
testId('app', 'nav', 'link', routeToTestSlug('/players'))
```

В JSX:

```tsx
<Button data-testid={testId('auth', 'login', 'btn', 'player')}>
```

## Типы элементов (element)

| Suffix     | Значение                              | Примеры использования                    |
|------------|---------------------------------------|------------------------------------------|
| `page`     | Корневой контейнер страницы / экрана  | `players-page`, `arenas-page`            |
| `panel`    | Панель, секция, блок контента         | `teams-roster-panel`                     |
| `text`     | Заголовок, описание, label, параграф  | `auth-login-text-title`                  |
| `btn`      | Кнопка (HockeyButton, Button, button) | `app-header-btn-logout`                  |
| `link`     | Ссылка навигации (Link, a)            | `app-nav-link-messenger`                 |
| `field`    | Текстовое поле, textarea              | `profile-form-field-display-name`        |
| `checkbox` | Чекбокс                               | `auth-login-checkbox-role-player`        |
| `select`   | Выпадающий список (Select)            | `players-player-filters-select-position` |
| `dropdown` | Dropdown / popup меню                 | `messenger-chat-dropdown-actions`        |
| `toggle`   | Переключатель                         | `admin-visibility-toggle`                |
| `table`    | Таблица или role=table                | `leagues-standings-table`                |
| `column`   | Заголовок колонки                     | `leagues-standings-column-team`          |
| `row`      | Строка таблицы / списка               | `leagues-standings-row-{teamId}`         |
| `cell`     | Ячейка таблицы                        | `leagues-standings-cell-points-{teamId}` |
| `card`     | Карточка сущности                     | `players-player-card-card-{userId}`      |
| `list`     | Список элементов                      | `notifications-center-list`              |
| `item`     | Элемент списка                        | `messenger-sidebar-item-{chatId}`        |
| `modal`    | Модальное окно / Dialog               | `arenas-ice-booking-modal`               |
| `form`     | Форма                                 | `events-create-form`                     |
| `filter`   | Блок фильтров                         | `calendar-filters-filter`                |
| `nav`      | Навигационный контейнер               | `app-nav-nav`, `mobile-nav-nav`          |
| `badge`    | Бейдж, счётчик                        | `app-nav-badge-notifications`            |
| `tab`      | Вкладка Tabs                          | `shops-dashboard-tab-products`           |
| `loader`   | Индикатор загрузки                    | `shared-scoreboard-loader-loader`        |
| `empty`    | Пустое состояние                      | `shared-empty-net-empty`                 |
| `map`      | Карта                                 | `arenas-map-map`                         |
| `icon`     | Декоративная иконка                   | `app-header-icon-crest`                  |
| `header`   | Шапка блока                           | `app-shell-header`                       |
| `footer`   | Подвал блока                          | `shared-external-flow-modal-footer`      |
| `feed`     | Лента (SOS, уведомления)              | `sos-feed-feed`                          |
| `bubble`   | Сообщение чата                        | `messenger-chat-bubble-{messageId}`      |
| `video`    | Видеоплеер                            | `highlights-video-board-video`           |
| `comment`  | Комментарий                           | `highlights-comments-comment-{id}`       |
| `slot`     | Слот бронирования                     | `arenas-slot-calendar-slot-{slotId}`     |
| `calendar` | Календарный виджет                    | `calendar-page-calendar`                 |

## Уникальность

- **Статические** элементы (кнопки, заголовки страниц) — фиксированный id без суффикса.
- **Динамические** списки — в `qualifier` добавляется id сущности: `players-player-card-card-{userId}`, `leagues-standings-row-{teamId}`.
- **Навигация** — slug из пути: `routeToTestSlug('/partner/shops/:shopId')` → `partner-shops-shopid`.
- **Партнёрские кабинеты** — shopId/leagueId в scope: `shops-{shopId}-dashboard-page`.

Shared-компоненты принимают `data-testid` или `testIdPrefix` для генерации дочерних id:

| Компонент                | Prop                            | Дочерние id                                                                                             |
|--------------------------|---------------------------------|---------------------------------------------------------------------------------------------------------|
| `IceCard`                | `data-testid`                   | —                                                                                                       |
| `PageHub`                | `data-testid`                   | —                                                                                                       |
| `PageStatePanel`         | `data-testid` + `testIdPrefix`  | `{prefix}-empty-net-panel`, `{prefix}-empty-net-text-title`, `{prefix}-empty-net-text-copy`              |
| `EmptyNetState`          | `testIdPrefix`                  | `{prefix}-empty-net-panel`, `{prefix}-empty-net-icon`, `{prefix}-empty-net-text-title`, `…-text-copy`    |
| `ScoreboardLoader`       | `testIdPrefix`                  | `{prefix}-scoreboard-loader-loader`, `{prefix}-scoreboard-loader-text-ticker`                            |
| `QueryErrorState`        | `data-testid` + `testIdPrefix`  | `{prefix}-query-error-error`, `{prefix}-query-error-btn-retry`                                           |
| `KarmaScore`             | `testIdPrefix`                  | `{prefix}-karma-score-badge`, `{prefix}-karma-score-text-value`                                          |
| `MockExternalFlowDialog` | `testIdPrefix`                  | `{prefix}-mock-external-flow-dialog-modal`, `…-text-partner-name`, `…-btn-close`                         |
| `PageHeader`             | `testIdPrefix` + `testIdSection`| `{prefix}-{section}-header`, `{prefix}-{section}-text-title`, `{prefix}-{section}-text-subtitle`          |
| `PageBackLink`           | `testIdPrefix` + `testIdSection`| `{prefix}-{section}-nav-back`, `{prefix}-{section}-btn-back`                                              |
| `CatalogFilterBar`       | `testIdPrefix` + `testIdSection`| см. «Панель поиска и фильтров каталогов» ниже                                                            |

## Панель поиска и фильтров каталогов

`CatalogFilterBar` (`src/shared/ui/CatalogFilterBar.tsx`) — единая шапка списков на
`/events`, `/teams`, `/leagues`, `/arenas`, `/marketplace`, `/players`. Все id строятся как
`{prefix}-{section}-…`, поэтому один и тот же E2E-хелпер работает на всех шести страницах.

| Элемент панели                    | Паттерн                                    |
|-----------------------------------|--------------------------------------------|
| Корень (`role="search"`)          | `{prefix}-{section}-panel-filters`         |
| Слот тулбара (табы, вид списка)   | `{prefix}-{section}-panel-toolbar`         |
| Обёртка поиска                    | `{prefix}-{section}-card-search`           |
| Поле поиска                       | `{prefix}-{section}-field-search`          |
| Блок быстрых фильтров             | `{prefix}-{section}-panel-chips`           |
| Ряд chips                         | `{prefix}-{section}-row-chips`             |
| Chip                              | `{prefix}-{section}-btn-chip-{chipId}`     |
| Строка состояния                  | `{prefix}-{section}-row-meta`              |
| Счётчик результатов               | `{prefix}-{section}-text-results`          |
| Счётчик активных фильтров         | `{prefix}-{section}-text-active-filters`   |
| Сброс фильтров                    | `{prefix}-{section}-btn-reset-filters`     |
| Раскрытие расширенных фильтров    | `{prefix}-{section}-btn-filters-toggle`    |
| Сетка расширенных фильтров        | `{prefix}-{section}-grid-filters`          |

Prefix / section по страницам:

| Страница      | `testIdPrefix` | `testIdSection`  | Пример поля поиска                       |
|---------------|----------------|------------------|------------------------------------------|
| Игры и тренировки | `events`   | `page`           | `events-page-field-search`               |
| Команды       | `teams`        | `teams-page`     | `teams-teams-page-field-search`          |
| Лиги          | `leagues`      | `filters`        | `leagues-filters-field-search`           |
| Ледовые арены | `arenas`       | `filters`        | `arenas-filters-field-search`            |
| Маркет        | `shops`        | `marketplace`    | `shops-marketplace-field-search`         |
| Игроки        | `players`      | `player-filters` | `players-player-filters-field-search`    |

Расширенные фильтры по умолчанию свёрнуты: в тестах сначала нажмите
`{prefix}-{section}-btn-filters-toggle`, затем обращайтесь к контролам внутри
`{prefix}-{section}-grid-filters`. Поиск применяется с дебаунсом 250 мс.

## Использование в тестах

```ts
// Playwright (testIdAttribute по умолчанию: 'data-testid')
await page.getByTestId('auth-login-btn-player').click()
await page.getByTestId('leagues-standings-row-team-1').isVisible()

// React Testing Library (при необходимости)
screen.getByTestId('players-page')
```

Unit-тесты по-прежнему предпочитают `getByRole` / `getByLabelText` — `data-testid` предназначен для E2E.

## Реестр паттернов по доменам

> Автогенерация из `testId(...)` в исходниках: `node scripts/generate-testid-reference.mjs`.
> Динамические части (`{id}`) — placeholder для runtime-значения.

### admin

| Паттерн testId                                             | Файл                                               |
|------------------------------------------------------------|----------------------------------------------------|
| `admin-dashboard-page`                                     | `src/pages/AdminDashboard/ui/AdminDashboard.tsx`   |
| `admin-dashboard-panel-moderation`                         | `src/pages/AdminDashboard/ui/AdminDashboard.tsx`   |
| `admin-dashboard-text-moderation-hint`                     | `src/pages/AdminDashboard/ui/AdminDashboard.tsx`   |
| `admin-dashboard-text-moderation-title`                    | `src/pages/AdminDashboard/ui/AdminDashboard.tsx`   |
| `admin-dashboard-text-sources-title`                       | `src/pages/AdminDashboard/ui/AdminDashboard.tsx`   |
| `admin-entity-form-btn-create`                             | `src/features/admin/ui/AdminEntityForm.tsx`        |
| `admin-entity-form-field-city`                             | `src/features/admin/ui/AdminEntityForm.tsx`        |
| `admin-entity-form-field-name`                             | `src/features/admin/ui/AdminEntityForm.tsx`        |
| `admin-entity-form-field-website`                          | `src/features/admin/ui/AdminEntityForm.tsx`        |
| `admin-entity-form-form`                                   | `src/features/admin/ui/AdminEntityForm.tsx`        |
| `admin-entity-form-select-type`                            | `src/features/admin/ui/AdminEntityForm.tsx`        |
| `admin-entity-form-text-title`                             | `src/features/admin/ui/AdminEntityForm.tsx`        |
| `admin-moderation-btn-publish-{item-id}`                   | `src/features/admin/ui/PartnerModerationPanel.tsx` |
| `admin-moderation-btn-reject-{item-id}`                    | `src/features/admin/ui/PartnerModerationPanel.tsx` |
| `admin-moderation-empty`                                   | `src/features/admin/ui/PartnerModerationPanel.tsx` |
| `admin-moderation-item-{item-id}`                          | `src/features/admin/ui/PartnerModerationPanel.tsx` |
| `admin-moderation-list`                                    | `src/features/admin/ui/PartnerModerationPanel.tsx` |
| `admin-moderation-loader`                                  | `src/features/admin/ui/PartnerModerationPanel.tsx` |
| `admin-moderation-panel`                                   | `src/features/admin/ui/PartnerModerationPanel.tsx` |
| `admin-moderation-text-kind-{item-id}`                     | `src/features/admin/ui/PartnerModerationPanel.tsx` |
| `admin-moderation-text-status-{item-id}`                   | `src/features/admin/ui/PartnerModerationPanel.tsx` |
| `admin-moderation-text-title-{item-id}`                    | `src/features/admin/ui/PartnerModerationPanel.tsx` |
| `admin-source-table-cell-name-{entity-type}-{entity-id}`   | `src/features/admin/ui/SourceStatusTable.tsx`      |
| `admin-source-table-cell-source-{entity-type}-{entity-id}` | `src/features/admin/ui/SourceStatusTable.tsx`      |
| `admin-source-table-cell-type-{entity-type}-{entity-id}`   | `src/features/admin/ui/SourceStatusTable.tsx`      |
| `admin-source-table-empty`                                 | `src/features/admin/ui/SourceStatusTable.tsx`      |
| `admin-source-table-row-{entity-type}-{entity-id}`         | `src/features/admin/ui/SourceStatusTable.tsx`      |
| `admin-source-table-table`                                 | `src/features/admin/ui/SourceStatusTable.tsx`      |
| `admin-visibility-toggle-{entity-type}-{entity-id}`        | `src/features/admin/ui/VisibilityToggle.tsx`       |

### app

| Паттерн testId                               | Файл                                             |
|----------------------------------------------|--------------------------------------------------|
| `app-error-boundary-btn-reload`              | `src/app/AppErrorBoundary.tsx`                   |
| `app-error-boundary-panel`                   | `src/app/AppErrorBoundary.tsx`                   |
| `app-header-profile-btn-menu`                | `src/widgets/HeaderProfile/ui/HeaderProfile.tsx` |
| `app-header-profile-btn-open`                | `src/widgets/HeaderProfile/ui/HeaderProfile.tsx` |
| `app-header-profile-btn-public-view`         | `src/widgets/HeaderProfile/ui/HeaderProfile.tsx` |
| `app-header-profile-icon-avatar`             | `src/widgets/HeaderProfile/ui/HeaderProfile.tsx` |
| `app-header-profile-img-avatar`              | `src/widgets/HeaderProfile/ui/HeaderProfile.tsx` |
| `app-header-profile-panel`                   | `src/widgets/HeaderProfile/ui/HeaderProfile.tsx` |
| `app-header-profile-text-meta`               | `src/widgets/HeaderProfile/ui/HeaderProfile.tsx` |
| `app-header-profile-text-name`               | `src/widgets/HeaderProfile/ui/HeaderProfile.tsx` |
| `app-login-layout-page`                      | `src/app/LoginLayout.tsx`                        |
| `app-mobile-nav-badge-{route-to-test-slug}`  | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-btn-more`                    | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-btn-more-close`              | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-btn-more-close-backdrop`     | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-icon-{route-to-test-slug}`   | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-icon-{value}`                | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-icon-more`                   | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-icon-partner`                | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-link-{route-to-test-slug}`   | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-link-{value}`                | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-list-more`                   | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-nav`                         | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-panel-more`                  | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-sheet-more`                  | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-text-{route-to-test-slug}`   | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-text-{value}`                | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-text-more`                   | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-text-more-title`             | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-mobile-nav-text-partner`                | `src/widgets/MobileNav/ui/MobileNav.tsx`         |
| `app-nav-badge-{route-to-test-slug}`         | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-nav-divider-incubating`                 | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-nav-link-{route-to-test-slug}`          | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-nav-nav`                                | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-nav-text-partner-section`               | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-persona-gate-loader`                    | `src/app/PersonaGate.tsx`                        |
| `app-require-auth-error`                     | `src/app/RequireAuth.tsx`                        |
| `app-require-auth-loader`                    | `src/app/RequireAuth.tsx`                        |
| `app-require-organizer-loader`               | `src/app/RequireOrganizerAccess.tsx`             |
| `app-shell-badge-notifications`              | `src/shared/ui/NotificationsBellLink.tsx`        |
| `app-shell-board-col`                        | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-body`                             | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-brand`                            | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-btn-logout`                       | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-btn-switch-role`                  | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-btn-toggle-left-panel`            | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-btn-toggle-right-panel`           | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-btn-toggle-theme`                 | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-header`                           | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-header-actions`                   | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-icon-crest`                       | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-link-notifications`               | `src/shared/ui/NotificationsBellLink.tsx`        |
| `app-shell-main`                             | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-page`                             | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-panel-controls`                   | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-text-region`                      | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-shell-text-title`                       | `src/widgets/AppShell/ui/AppShell.tsx`           |
| `app-side-board-btn-all-leagues`             | `src/widgets/SideBoard/ui/SideBoard.tsx`         |
| `app-side-board-btn-events`                  | `src/widgets/SideBoard/ui/SideBoard.tsx`         |
| `app-side-board-card-events`                 | `src/widgets/SideBoard/ui/SideBoard.tsx`         |
| `app-side-board-card-standings`              | `src/widgets/SideBoard/ui/SideBoard.tsx`         |
| `app-side-board-empty-events`                | `src/widgets/SideBoard/ui/SideBoard.tsx`         |
| `app-side-board-item-event-{event-id}`       | `src/widgets/SideBoard/ui/SideBoard.tsx`         |
| `app-side-board-link-events`                 | `src/widgets/SideBoard/ui/SideBoard.tsx`         |
| `app-side-board-link-leagues`                | `src/widgets/SideBoard/ui/SideBoard.tsx`         |
| `app-side-board-panel`                       | `src/widgets/SideBoard/ui/SideBoard.tsx`         |
| `app-side-board-text-event-arena-{event-id}` | `src/widgets/SideBoard/ui/SideBoard.tsx`         |
| `app-side-board-text-event-time-{event-id}`  | `src/widgets/SideBoard/ui/SideBoard.tsx`         |
| `app-side-board-text-event-title-{event-id}` | `src/widgets/SideBoard/ui/SideBoard.tsx`         |
| `app-side-board-text-events-title`           | `src/widgets/SideBoard/ui/SideBoard.tsx`         |
| `app-side-board-text-standings-title`        | `src/widgets/SideBoard/ui/SideBoard.tsx`         |
| `app-sos-fab-link`                           | `src/widgets/SosFab/ui/SosFab.tsx`               |

### arenas

| Паттерн testId                                            | Файл                                                           |
|-----------------------------------------------------------|----------------------------------------------------------------|
| `arenas-booking-btn-book-{arena-id}`                      | `src/features/arenas/ui/ExternalBookingButton.tsx`             |
| `arenas-booking-btn-book-{arena-id}-{slot-id}`            | `src/features/arenas/ui/ExternalBookingButton.tsx`             |
| `arenas-booking-panel-portal-{arena-id}`                  | `src/features/arenas/ui/ArenaBookingPanel.tsx`                 |
| `arenas-booking-panel-slots-{arena-id}`                   | `src/features/arenas/ui/ArenaBookingPanel.tsx`                 |
| `arenas-booking-text-phone-{arena-id}`                    | `src/features/arenas/ui/ArenaBookingPanel.tsx`                 |
| `arenas-booking-text-subtitle-{arena-id}`                 | `src/features/arenas/ui/ArenaBookingPanel.tsx`                 |
| `arenas-booking-text-title-{arena-id}`                    | `src/features/arenas/ui/ArenaBookingPanel.tsx`                 |
| `arenas-detail-badge-mode-{arena-id}`                     | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-badge-profile-{arena-id}`                  | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-badge-slot-lamp-{arena-id}`                | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-btn-website-{arena-id}`                    | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-link-website-{arena-id}`                   | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-panel-{arena-id}`                          | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-panel-booking-{arena-id}`                  | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-panel-chips-{arena-id}`                    | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-panel-hero-{arena-id}`                     | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-panel-meta-{arena-id}`                     | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-text-about-title-{arena-id}`               | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-text-address-{arena-id}`                   | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-text-amenities-{arena-id}`                 | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-text-city-{arena-id}`                      | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-text-free-slots-{arena-id}`                | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-text-metro-{arena-id}`                     | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-text-name-{arena-id}`                      | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-text-phone-{arena-id}`                     | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-detail-text-price-{arena-id}`                     | `src/features/arenas/ui/ArenaDetailPanel.tsx`                  |
| `arenas-details-empty`                                    | `src/pages/ArenaDetailsPage/ui/ArenaDetailsPage.tsx`           |
| `arenas-details-error`                                    | `src/pages/ArenaDetailsPage/ui/ArenaDetailsPage.tsx`           |
| `arenas-details-loader`                                   | `src/pages/ArenaDetailsPage/ui/ArenaDetailsPage.tsx`           |
| `arenas-details-page-{arena-id}`                          | `src/pages/ArenaDetailsPage/ui/ArenaDetailsPage.tsx`           |
| `arenas-filters-btn-view-{tab-id}`                        | `src/features/arenas/ui/ArenaFilters.tsx`                      |
| `arenas-filters-field-district`                           | `src/features/arenas/ui/ArenaFilters.tsx`                      |
| `arenas-filters-field-metro`                              | `src/features/arenas/ui/ArenaFilters.tsx`                      |
| `arenas-filters-panel-view`                               | `src/features/arenas/ui/ArenaFilters.tsx`                      |
| `arenas-filters-select-amenity`                           | `src/features/arenas/ui/ArenaFilters.tsx`                      |
| `arenas-ice-booking-modal`                                | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-btn-cancel`                     | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-btn-done`                       | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-btn-submit`                     | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-field-comment`                  | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-field-phone`                    | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-panel-form`                     | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-panel-success`                  | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-text-address`                   | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-text-comment-label`             | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-text-confirmation-code`         | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-text-error`                     | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-text-general-request`           | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-text-phase-note`                | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-text-slot`                      | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-text-slot-label`                | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-ice-booking-modal-text-success-title`             | `src/features/arenas/ui/MockIceBookingModal.tsx`               |
| `arenas-listings-card-{listing-id}`                       | `src/features/arenas/ui/ArenaListingsPanel.tsx`                |
| `arenas-listings-panel-{arena-id}`                        | `src/features/arenas/ui/ArenaListingsPanel.tsx`                |
| `arenas-listings-text-name-{listing-id}`                  | `src/features/arenas/ui/ArenaListingsPanel.tsx`                |
| `arenas-listings-text-phone-{listing-id}`                 | `src/features/arenas/ui/ArenaListingsPanel.tsx`                |
| `arenas-listings-text-schedule-{listing-id}`              | `src/features/arenas/ui/ArenaListingsPanel.tsx`                |
| `arenas-listings-text-title-{arena-id}`                   | `src/features/arenas/ui/ArenaListingsPanel.tsx`                |
| `arenas-map-badge-portal`                                 | `src/features/arenas/ui/ArenaMap.tsx`                          |
| `arenas-map-badge-slot`                                   | `src/features/arenas/ui/ArenaMap.tsx`                          |
| `arenas-map-btn-pin-{arena-id}`                           | `src/features/arenas/ui/ArenaMap.tsx`                          |
| `arenas-map-list-a11y-pins`                               | `src/features/arenas/ui/ArenaMap.tsx`                          |
| `arenas-map-map`                                          | `src/features/arenas/ui/ArenaMap.tsx`                          |
| `arenas-map-map-legend`                                   | `src/features/arenas/ui/ArenaMap.tsx`                          |
| `arenas-map-map-popup-{arena-id}`                         | `src/features/arenas/ui/ArenaMap.tsx`                          |
| `arenas-map-map-surface`                                  | `src/features/arenas/ui/ArenaMap.tsx`                          |
| `arenas-map-text-booking-{arena-id}`                      | `src/features/arenas/ui/ArenaMap.tsx`                          |
| `arenas-map-text-district-{arena-id}`                     | `src/features/arenas/ui/ArenaMap.tsx`                          |
| `arenas-map-text-hint`                                    | `src/features/arenas/ui/ArenaMap.tsx`                          |
| `arenas-map-text-name-{arena-id}`                         | `src/features/arenas/ui/ArenaMap.tsx`                          |
| `arenas-page`                                             | `src/pages/ArenasPage/ui/ArenasPage.tsx`                       |
| `arenas-page-btn-reset`                                   | `src/pages/ArenasPage/ui/ArenasPage.tsx`                       |
| `arenas-page-btn-to-list`                                 | `src/pages/ArenasPage/ui/ArenasPage.tsx`                       |
| `arenas-page-card-map`                                    | `src/pages/ArenasPage/ui/ArenasPage.tsx`                       |
| `arenas-page-empty`                                       | `src/pages/ArenasPage/ui/ArenasPage.tsx`                       |
| `arenas-page-error`                                       | `src/pages/ArenasPage/ui/ArenasPage.tsx`                       |
| `arenas-page-layout`                                      | `src/pages/ArenasPage/ui/ArenasPage.tsx`                       |
| `arenas-page-list`                                        | `src/pages/ArenasPage/ui/ArenasPage.tsx`                       |
| `arenas-page-loader`                                      | `src/pages/ArenasPage/ui/ArenasPage.tsx`                       |
| `arenas-page-progress`                                    | `src/pages/ArenasPage/ui/ArenasPage.tsx`                       |
| `arenas-page-text-map-results`                            | `src/pages/ArenasPage/ui/ArenasPage.tsx`                       |
| `arenas-page-text-map-title`                              | `src/pages/ArenasPage/ui/ArenasPage.tsx`                       |
| `arenas-partner-badge-listing-status-{listing-id}`        | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-badge-slot-status-{slot-id}`              | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-bookings-badge-status-{booking-id}`       | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-btn-chat-{selected-id}`          | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-btn-filter-{key}`                | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-btn-profile-{selected-id}`       | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-btn-status-{next}-{selected-id}` | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-empty`                           | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-link-profile-{selected-id}`      | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-list`                            | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-loader`                          | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-panel-{arena-id}`                | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-panel-detail-{selected-id}`      | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-panel-filters`                   | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-panel-requester-{selected-id}`   | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-row-{booking-id}`                | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-text-comment-{selected-id}`      | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-text-counts`                     | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-text-detail-role-{selected-id}`  | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-text-detail-title-{selected-id}` | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-text-meta-{booking-id}`          | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-text-name-{booking-id}`          | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-text-phone-{selected-id}`        | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-text-slot-{selected-id}`         | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-text-title`                      | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-bookings-text-when-{booking-id}`          | `src/features/arenas/ui/ArenaBookingsPanel.tsx`                |
| `arenas-partner-btn-archive-{listing-id}`                 | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-btn-back`                                 | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-btn-cancel-edit`                          | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-btn-create-listing`                       | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-btn-create-slot`                          | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-btn-edit-{listing-id}`                    | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-btn-filter-{key}`                         | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-btn-public-{arena-id}`                    | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-btn-publish-{listing-id}`                 | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-btn-publish-now`                          | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-btn-save-profile`                         | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-btn-slot-booked-{slot-id}`                | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-btn-slot-free-{slot-id}`                  | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-btn-template-friday`                      | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-btn-template-saturday`                    | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-btn-template-tomorrow`                    | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-btn-view-published`                       | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-empty`                                    | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-empty-listings`                           | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-empty-slots`                              | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-error`                                    | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-error-access-denied`                      | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-error-listing-form`                       | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-field-booking-url`                        | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-field-listing-end`                        | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-field-listing-note`                       | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-field-listing-phone`                      | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-field-listing-price`                      | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-field-listing-start`                      | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-field-listing-title`                      | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-field-phone`                              | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-field-price-range`                        | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-field-slot-end`                           | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-field-slot-price`                         | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-field-slot-start`                         | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-field-website`                            | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-link-back`                                | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-link-back-denied`                         | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-link-back-empty`                          | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-link-public-{arena-id}`                   | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-link-view-published`                      | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-list-listings`                            | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-list-slots`                               | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-loader`                                   | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-loader-listings`                          | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-nav-tabs`                                 | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-page-{arena-id}`                          | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-panel-create-listing`                     | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-panel-create-slot`                        | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-panel-listing-filters`                    | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-panel-listings`                           | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-panel-preview`                            | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-panel-profile`                            | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-panel-schedule`                           | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-panel-templates`                          | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-row-listing-{listing-id}`                 | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-row-slot-{slot-id}`                       | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-schedule-loader`                          | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-switch-visible`                           | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-tab-bookings`                             | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-tab-listings`                             | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-tab-profile`                              | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-tab-schedule`                             | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-text-address`                             | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-text-create-slot-title`                   | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-text-form-title`                          | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-text-listing-contact-{listing-id}`        | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-text-listing-name-{listing-id}`           | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-text-listing-schedule-{listing-id}`       | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-text-listing-success`                     | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-text-listings-title`                      | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-text-preview-schedule`                    | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-text-preview-title`                       | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-text-profile-saved`                       | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-text-profile-title`                       | `src/pages/ArenaPartnerDashboard/ui/ArenaPartnerDashboard.tsx` |
| `arenas-partner-text-schedule-hint`                       | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-text-schedule-stats`                      | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-text-schedule-title`                      | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-text-slot-error`                          | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-text-slot-price-{slot-id}`                | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-text-slot-schedule-{slot-id}`             | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-partner-text-slot-success`                        | `src/features/arenas/ui/ArenaSchedulePanel.tsx`                |
| `arenas-rink-badge-mode-{arena-id}`                       | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-rink-badge-portal-status-{arena-id}`              | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-rink-badge-profile-{arena-id}`                    | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-rink-badge-slot-lamp-{arena-id}`                  | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-rink-btn-open-{arena-id}`                         | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-rink-card-{arena-id}`                             | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-rink-panel-chips-{arena-id}`                      | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-rink-panel-status-{arena-id}`                     | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-rink-text-address-{arena-id}`                     | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-rink-text-amenities-{arena-id}`                   | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-rink-text-listings-{arena-id}`                    | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-rink-text-metro-{arena-id}`                       | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-rink-text-name-{arena-id}`                        | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-rink-text-price-{arena-id}`                       | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-rink-text-price-empty-{arena-id}`                 | `src/features/arenas/ui/RinkCard.tsx`                          |
| `arenas-slot-calendar-calendar-{arena-id}`                | `src/features/arenas/ui/SlotCalendar.tsx`                      |
| `arenas-slot-calendar-empty-{arena-id}`                   | `src/features/arenas/ui/SlotCalendar.tsx`                      |
| `arenas-slot-calendar-list-{day}`                         | `src/features/arenas/ui/SlotCalendar.tsx`                      |
| `arenas-slot-calendar-panel-{day}`                        | `src/features/arenas/ui/SlotCalendar.tsx`                      |
| `arenas-slot-calendar-panel-booking-{arena-id}`           | `src/features/arenas/ui/SlotCalendar.tsx`                      |
| `arenas-slot-calendar-slot-{slot-id}`                     | `src/features/arenas/ui/SlotCalendar.tsx`                      |
| `arenas-slot-calendar-text-day-{day}`                     | `src/features/arenas/ui/SlotCalendar.tsx`                      |
| `arenas-slot-calendar-text-price-{slot-id}`               | `src/features/arenas/ui/SlotCalendar.tsx`                      |
| `arenas-slot-calendar-text-selected-{selected-slot-id}`   | `src/features/arenas/ui/SlotCalendar.tsx`                      |
| `arenas-slot-calendar-text-status-{slot-id}`              | `src/features/arenas/ui/SlotCalendar.tsx`                      |
| `arenas-slot-calendar-text-time-{slot-id}`                | `src/features/arenas/ui/SlotCalendar.tsx`                      |
| `arenas-slots-badge-source-{slot-id}`                     | `src/features/arenas/ui/IceSlotsList.tsx`                      |
| `arenas-slots-card-{slot-id}`                             | `src/features/arenas/ui/IceSlotsList.tsx`                      |
| `arenas-slots-empty-{arena-id}`                           | `src/features/arenas/ui/IceSlotsList.tsx`                      |
| `arenas-slots-list-{arena-id}`                            | `src/features/arenas/ui/IceSlotsList.tsx`                      |
| `arenas-slots-text-status-{slot-id}`                      | `src/features/arenas/ui/IceSlotsList.tsx`                      |
| `arenas-slots-text-time-{slot-id}`                        | `src/features/arenas/ui/IceSlotsList.tsx`                      |

### auth

| Паттерн testId                                   | Файл                                             |
|--------------------------------------------------|--------------------------------------------------|
| `auth-{test-id-scope}-field-{test-id-qualifier}` | `src/features/auth/ui/AuthField.tsx`             |
| `auth-login-btn-apply-demo`                      | `src/features/auth/ui/AuthDemoCard.tsx`          |
| `auth-login-btn-back-credentials`                | `src/features/auth/ui/PersonaSelection.tsx`      |
| `auth-login-btn-submit`                          | `src/features/auth/ui/LoginForm.tsx`             |
| `auth-login-card-demo`                           | `src/features/auth/ui/AuthDemoCard.tsx`          |
| `auth-login-grid-personas`                       | `src/features/auth/ui/PersonaSelection.tsx`      |
| `auth-login-link-terms`                          | `src/features/auth/ui/LoginForm.tsx`             |
| `auth-login-panel-demo-credentials`              | `src/features/auth/ui/AuthDemoCard.tsx`          |
| `auth-login-panel-demo-header`                   | `src/features/auth/ui/AuthDemoCard.tsx`          |
| `auth-login-panel-fields`                        | `src/features/auth/ui/LoginForm.tsx`             |
| `auth-login-panel-footer`                        | `src/features/auth/ui/LoginForm.tsx`             |
| `auth-login-panel-form`                          | `src/features/auth/ui/LoginForm.tsx`             |
| `auth-login-panel-header`                        | `src/features/auth/ui/LoginForm.tsx`             |
| `auth-login-panel-personas`                      | `src/features/auth/ui/PersonaSelection.tsx`      |
| `auth-login-text-demo-badge`                     | `src/features/auth/ui/AuthDemoCard.tsx`          |
| `auth-login-text-demo-email`                     | `src/features/auth/ui/AuthDemoCard.tsx`          |
| `auth-login-text-demo-label`                     | `src/features/auth/ui/AuthDemoCard.tsx`          |
| `auth-login-text-demo-password`                  | `src/features/auth/ui/AuthDemoCard.tsx`          |
| `auth-login-text-error`                          | `src/features/auth/ui/LoginForm.tsx`             |
| `auth-login-text-hint`                           | `src/features/auth/ui/LoginForm.tsx`             |
| `auth-login-text-personas-error`                 | `src/features/auth/ui/PersonaSelection.tsx`      |
| `auth-login-text-personas-hint`                  | `src/features/auth/ui/PersonaSelection.tsx`      |
| `auth-login-text-personas-title`                 | `src/features/auth/ui/PersonaSelection.tsx`      |
| `auth-login-text-title`                          | `src/features/auth/ui/LoginForm.tsx`             |
| `auth-page-btn-continue`                         | `src/pages/auth/ui/AuthPage.tsx`                 |
| `auth-page-btn-edit-credentials`                 | `src/pages/auth/ui/AuthPage.tsx`                 |
| `auth-page-btn-show-personas`                    | `src/pages/auth/ui/AuthPage.tsx`                 |
| `auth-page-link-continue`                        | `src/pages/auth/ui/AuthPage.tsx`                 |
| `auth-page-loader`                               | `src/pages/auth/ui/MockLoginPage.tsx`            |
| `auth-page-panel-main`                           | `src/pages/auth/ui/AuthPage.tsx`                 |
| `auth-page-panel-switching`                      | `src/pages/auth/ui/AuthPage.tsx`                 |
| `auth-page-root`                                 | `src/pages/auth/ui/MockLoginPage.tsx`            |
| `auth-page-text-switching-hint`                  | `src/pages/auth/ui/AuthPage.tsx`                 |
| `auth-persona-badge-current`                     | `src/features/auth/ui/PersonaSelection.tsx`      |
| `auth-persona-btn-{persona-id}`                  | `src/features/auth/ui/PersonaSelection.tsx`      |
| `auth-register-btn-submit`                       | `src/features/auth/ui/RegisterForm.tsx`          |
| `auth-register-checkbox-terms`                   | `src/features/auth/ui/TermsAcceptanceField.tsx`  |
| `auth-register-link-terms`                       | `src/features/auth/ui/TermsAcceptanceField.tsx`  |
| `auth-register-panel-fields`                     | `src/features/auth/ui/RegisterForm.tsx`          |
| `auth-register-panel-form`                       | `src/features/auth/ui/RegisterForm.tsx`          |
| `auth-register-panel-header`                     | `src/features/auth/ui/RegisterForm.tsx`          |
| `auth-register-panel-terms`                      | `src/features/auth/ui/TermsAcceptanceField.tsx`  |
| `auth-register-text-error`                       | `src/features/auth/ui/RegisterForm.tsx`          |
| `auth-register-text-hint`                        | `src/features/auth/ui/RegisterForm.tsx`          |
| `auth-register-text-local-memory`                | `src/features/auth/ui/RegisterForm.tsx`          |
| `auth-register-text-title`                       | `src/features/auth/ui/RegisterForm.tsx`          |
| `auth-shell-list-hero-features`                  | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-list-item-hero-{index}`              | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-nav-mode-tabs`                       | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-page`                                | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-panel-content`                       | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-panel-frame`                         | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-panel-hero`                          | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-panel-main`                          | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-tab-login`                           | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-tab-register`                        | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-text-demo-banner`                    | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-text-hero-badge`                     | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-text-hero-tagline`                   | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-text-hero-title`                     | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-text-mobile-title`                   | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-text-notice-body`                    | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-shell-text-notice-title`                   | `src/features/auth/ui/AuthShell.tsx`             |
| `auth-terms-btn-collapse`                        | `src/pages/TermsOfUsePage/ui/TermsOfUsePage.tsx` |
| `auth-terms-page`                                | `src/pages/TermsOfUsePage/ui/TermsOfUsePage.tsx` |
| `auth-terms-panel-body`                          | `src/features/auth/ui/TermsOfUseDocument.tsx`    |
| `auth-terms-panel-card`                          | `src/pages/TermsOfUsePage/ui/TermsOfUsePage.tsx` |
| `auth-terms-panel-document`                      | `src/features/auth/ui/TermsOfUseDocument.tsx`    |
| `auth-terms-panel-header`                        | `src/features/auth/ui/TermsOfUseDocument.tsx`    |
| `auth-terms-panel-toolbar`                       | `src/pages/TermsOfUsePage/ui/TermsOfUsePage.tsx` |
| `auth-terms-section-{section-id}`                | `src/features/auth/ui/TermsOfUseDocument.tsx`    |
| `auth-terms-text-lead`                           | `src/features/auth/ui/TermsOfUseDocument.tsx`    |
| `auth-terms-text-paragraph-{section-id}-{index}` | `src/features/auth/ui/TermsOfUseDocument.tsx`    |
| `auth-terms-text-section-title-{section-id}`     | `src/features/auth/ui/TermsOfUseDocument.tsx`    |
| `auth-terms-text-title`                          | `src/features/auth/ui/TermsOfUseDocument.tsx`    |
| `auth-terms-text-version`                        | `src/features/auth/ui/TermsOfUseDocument.tsx`    |

### calendar

| Паттерн testId                                   | Файл                                                    |
|--------------------------------------------------|---------------------------------------------------------|
| `calendar-agenda-badge-type-{event-id}`          | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-btn-details-{event-id}`         | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-btn-ics-{event-id}`             | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-card-{event-id}`                | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-empty-day`                      | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-link-details-{event-id}`        | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-link-event-{event-id}`          | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-list-day`                       | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-list-upcoming`                  | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-panel`                          | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-panel-upcoming`                 | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-text-day-count`                 | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-text-day-title`                 | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-text-fill-{event-id}`           | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-text-meta-{event-id}`           | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-text-status-{event-id}`         | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-text-time-{event-id}`           | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-text-title-{event-id}`          | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-agenda-text-upcoming-title`            | `src/features/calendar/ui/CalendarAgenda.tsx`           |
| `calendar-chips-btn-{chip-id}`                   | `src/features/calendar/ui/CalendarQuickChips.tsx`       |
| `calendar-chips-btn-reset`                       | `src/features/calendar/ui/CalendarQuickChips.tsx`       |
| `calendar-chips-panel`                           | `src/features/calendar/ui/CalendarQuickChips.tsx`       |
| `calendar-chips-row`                             | `src/features/calendar/ui/CalendarQuickChips.tsx`       |
| `calendar-chips-text-active`                     | `src/features/calendar/ui/CalendarQuickChips.tsx`       |
| `calendar-filters-filter`                        | `src/features/calendar/ui/CalendarFilters.tsx`          |
| `calendar-filters-select-attendance`             | `src/features/calendar/ui/CalendarFilters.tsx`          |
| `calendar-filters-select-type`                   | `src/features/calendar/ui/CalendarFilters.tsx`          |
| `calendar-goalie-inbox-btn-accept-{request-id}`  | `src/features/calendar/ui/GoalieRequestsInbox.tsx`      |
| `calendar-goalie-inbox-btn-decline-{request-id}` | `src/features/calendar/ui/GoalieRequestsInbox.tsx`      |
| `calendar-goalie-inbox-card-{request-id}`        | `src/features/calendar/ui/GoalieRequestsInbox.tsx`      |
| `calendar-goalie-inbox-panel`                    | `src/features/calendar/ui/GoalieRequestsInbox.tsx`      |
| `calendar-goalie-inbox-text-event-{request-id}`  | `src/features/calendar/ui/GoalieRequestsInbox.tsx`      |
| `calendar-goalie-inbox-text-meta-{request-id}`   | `src/features/calendar/ui/GoalieRequestsInbox.tsx`      |
| `calendar-goalie-inbox-text-title`               | `src/features/calendar/ui/GoalieRequestsInbox.tsx`      |
| `calendar-month-btn-day-{date-key}`              | `src/features/calendar/ui/CalendarMonthGrid.tsx`        |
| `calendar-month-btn-next`                        | `src/features/calendar/ui/CalendarMonthGrid.tsx`        |
| `calendar-month-btn-prev`                        | `src/features/calendar/ui/CalendarMonthGrid.tsx`        |
| `calendar-month-grid`                            | `src/features/calendar/ui/CalendarMonthGrid.tsx`        |
| `calendar-month-panel`                           | `src/features/calendar/ui/CalendarMonthGrid.tsx`        |
| `calendar-month-row-weekdays`                    | `src/features/calendar/ui/CalendarMonthGrid.tsx`        |
| `calendar-month-text-count-{date-key}`           | `src/features/calendar/ui/CalendarMonthGrid.tsx`        |
| `calendar-month-text-title`                      | `src/features/calendar/ui/CalendarMonthGrid.tsx`        |
| `calendar-page`                                  | `src/pages/CalendarPage/ui/CalendarPage.tsx`            |
| `calendar-page-card-shell`                       | `src/pages/CalendarPage/ui/CalendarPage.tsx`            |
| `calendar-shell-btn-filters-toggle`              | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-btn-lens-{lens-id}`              | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-btn-view-{mode}`                 | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-empty`                           | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-empty-scope`                     | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-error`                           | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-loader`                          | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-page`                            | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-panel-filters`                   | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-panel-lenses`                    | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-panel-month-layout`              | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-panel-scope`                     | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-panel-view-toggle`               | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-select-scope`                    | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-select-scope-id`                 | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-text-lens-hint`                  | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-text-summary`                    | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-shell-text-title`                      | `src/features/calendar/ui/CalendarShell.tsx`            |
| `calendar-windows-btn-create`                    | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |
| `calendar-windows-btn-toggle-{window-id}`        | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |
| `calendar-windows-field-districts`               | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |
| `calendar-windows-field-ends`                    | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |
| `calendar-windows-field-note`                    | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |
| `calendar-windows-field-price-from`              | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |
| `calendar-windows-field-price-to`                | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |
| `calendar-windows-field-starts`                  | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |
| `calendar-windows-list`                          | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |
| `calendar-windows-panel`                         | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |
| `calendar-windows-panel-create`                  | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |
| `calendar-windows-row-{window-id}`               | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |
| `calendar-windows-text-hint`                     | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |
| `calendar-windows-text-meta-{window-id}`         | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |
| `calendar-windows-text-title`                    | `src/features/calendar/ui/AvailabilityWindowsPanel.tsx` |

### clubs

| Паттерн testId                                        | Файл                                                         |
|-------------------------------------------------------|--------------------------------------------------------------|
| `clubs-dashboard-badge-squads-{club-id}`              | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-badge-teams-{club-id}`               | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-btn-{value}-{club-id}`               | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-btn-create-private-{club-id}`        | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-btn-messenger-{club-id}`             | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-btn-organizer-{club-id}`             | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-btn-priority-private-{club-id}`      | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-btn-priority-profile-{club-id}`      | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-btn-priority-roster-{club-id}`       | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-btn-public-team-{club-id}`           | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-btn-staff-edit-{club-id}`            | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-btn-upcoming-all-{club-id}`          | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-card-club-{club-id}`                 | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-empty-staff-{club-id}`               | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-empty-upcoming-{club-id}`            | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-grid-stats-{club-id}`                | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-link-create-private-{club-id}`       | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-link-event-{event-id}`               | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-link-messenger-{club-id}`            | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-link-organizer-{club-id}`            | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-link-public-team-{club-id}`          | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-panel-{club-id}`                     | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-panel-columns-{club-id}`             | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-panel-priority-{club-id}`            | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-panel-staff-{club-id}`               | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-panel-upcoming-{club-id}`            | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-row-event-{event-id}`                | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-row-staff-{user-id}`                 | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-text-{value}-{club-id}`              | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-text-city-{club-id}`                 | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-text-description-{club-id}`          | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-text-name-{club-id}`                 | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-text-priority-title-{club-id}`       | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-text-staff-title-{club-id}`          | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-dashboard-text-upcoming-title-{club-id}`       | `src/features/clubs/ui/ClubDashboardSummary.tsx`             |
| `clubs-lineup-approval-btn-approve-{draft-id}`        | `src/features/clubs/ui/LineupCoachApprovalPanel.tsx`         |
| `clubs-lineup-approval-btn-publish-{draft-id}`        | `src/features/clubs/ui/LineupCoachApprovalPanel.tsx`         |
| `clubs-lineup-approval-btn-reject-{draft-id}`         | `src/features/clubs/ui/LineupCoachApprovalPanel.tsx`         |
| `clubs-lineup-approval-card-{draft-id}`               | `src/features/clubs/ui/LineupCoachApprovalPanel.tsx`         |
| `clubs-lineup-approval-empty-{club-id}`               | `src/features/clubs/ui/LineupCoachApprovalPanel.tsx`         |
| `clubs-lineup-approval-field-reject-{draft-id}`       | `src/features/clubs/ui/LineupCoachApprovalPanel.tsx`         |
| `clubs-lineup-approval-list-assignments-{draft-id}`   | `src/features/clubs/ui/LineupCoachApprovalPanel.tsx`         |
| `clubs-lineup-approval-loader-{club-id}`              | `src/features/clubs/ui/LineupCoachApprovalPanel.tsx`         |
| `clubs-lineup-approval-panel-{club-id}`               | `src/features/clubs/ui/LineupCoachApprovalPanel.tsx`         |
| `clubs-lineup-approval-row-approved-{draft-id}`       | `src/features/clubs/ui/LineupCoachApprovalPanel.tsx`         |
| `clubs-lineup-approval-row-player-{user-id}`          | `src/features/clubs/ui/LineupCoachApprovalPanel.tsx`         |
| `clubs-lineup-approval-text-draft-meta-{draft-id}`    | `src/features/clubs/ui/LineupCoachApprovalPanel.tsx`         |
| `clubs-lineup-approval-text-draft-title-{draft-id}`   | `src/features/clubs/ui/LineupCoachApprovalPanel.tsx`         |
| `clubs-lineup-approval-text-title-{club-id}`          | `src/features/clubs/ui/LineupCoachApprovalPanel.tsx`         |
| `clubs-partner-btn-back-{club-id}`                    | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-btn-hub`                               | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-btn-login`                             | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-card-roster-{team-id}`                 | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-card-roster-manage-{team-id}`          | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-empty-roster-{club-id}`                | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-error`                                 | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-link-back-{club-id}`                   | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-link-hub`                              | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-link-login`                            | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-loader`                                | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-nav-{club-id}`                         | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-page-{club-id}`                        | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-panel-calendar-{club-id}`              | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-panel-dashboard-{club-id}`             | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-panel-denied`                          | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-panel-not-found`                       | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-panel-private-{club-id}`               | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-panel-profile-{club-id}`               | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-panel-roster-{club-id}`                | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-tab-{tab-key}-{club-id}`               | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-text-denied`                           | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-text-roster-hint-{team-id}`            | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-text-roster-manage-{team-id}`          | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-partner-text-roster-team-{team-id}`            | `src/pages/ClubPartnerDashboard/ui/ClubPartnerDashboard.tsx` |
| `clubs-private-trainings-empty-{club-id}`             | `src/features/clubs/ui/ClubPrivateTrainingsPanel.tsx`        |
| `clubs-private-trainings-empty-teams-{club-id}`       | `src/features/clubs/ui/ClubPrivateTrainingsPanel.tsx`        |
| `clubs-private-trainings-error-club-{club-id}`        | `src/features/clubs/ui/ClubPrivateTrainingsPanel.tsx`        |
| `clubs-private-trainings-link-{event-id}`             | `src/features/clubs/ui/ClubPrivateTrainingsPanel.tsx`        |
| `clubs-private-trainings-list-{club-id}`              | `src/features/clubs/ui/ClubPrivateTrainingsPanel.tsx`        |
| `clubs-private-trainings-loader-{club-id}`            | `src/features/clubs/ui/ClubPrivateTrainingsPanel.tsx`        |
| `clubs-private-trainings-loader-club-{club-id}`       | `src/features/clubs/ui/ClubPrivateTrainingsPanel.tsx`        |
| `clubs-private-trainings-panel-{club-id}`             | `src/features/clubs/ui/ClubPrivateTrainingsPanel.tsx`        |
| `clubs-private-trainings-row-{event-id}`              | `src/features/clubs/ui/ClubPrivateTrainingsPanel.tsx`        |
| `clubs-private-trainings-text-list-title-{club-id}`   | `src/features/clubs/ui/ClubPrivateTrainingsPanel.tsx`        |
| `clubs-private-trainings-text-meta-{event-id}`        | `src/features/clubs/ui/ClubPrivateTrainingsPanel.tsx`        |
| `clubs-private-trainings-text-title-{event-id}`       | `src/features/clubs/ui/ClubPrivateTrainingsPanel.tsx`        |
| `clubs-profile-edit-btn-add-staff-{club-id}`          | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-btn-remove-staff-{user-id}`       | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-btn-save-{club-id}`               | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-field-description-{club-id}`      | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-field-email-{club-id}`            | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-field-name-{club-id}`             | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-field-phone-{club-id}`            | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-field-staff-email-{user-id}`      | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-field-staff-name-{user-id}`       | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-field-staff-phone-{user-id}`      | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-form-{club-id}`                   | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-panel-staff-{club-id}`            | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-row-staff-{user-id}`              | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-select-staff-role-{user-id}`      | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-text-description-label-{club-id}` | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-text-staff-role-label-{user-id}`  | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-text-staff-title-{club-id}`       | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-text-status-{club-id}`            | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-profile-edit-text-title-{club-id}`             | `src/features/clubs/ui/ClubProfileEditForm.tsx`              |
| `clubs-training-wizard-btn-back-details-{club-id}`    | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-btn-next-lineup-{club-id}`     | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-btn-publish-{club-id}`         | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-btn-save-draft-{club-id}`      | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-btn-step-details-{club-id}`    | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-btn-step-lineup-{club-id}`     | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-btn-step-review-{club-id}`     | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-btn-submit-coach-{club-id}`    | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-field-note-{club-id}`          | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-field-title-{club-id}`         | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-loader-roster-{club-id}`       | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-nav-steps-{club-id}`           | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-panel-{club-id}`               | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-panel-details-{club-id}`       | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-panel-lineup-{club-id}`        | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-panel-review-{club-id}`        | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-panel-templates-{club-id}`     | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-select-arena-{club-id}`        | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-select-team-{club-id}`         | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-select-template-{club-id}`     | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-text-draft-status-{club-id}`   | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-text-hint-{club-id}`           | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-text-review-hint-{club-id}`    | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-text-status-{club-id}`         | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |
| `clubs-training-wizard-text-title-{club-id}`          | `src/features/clubs/ui/TeamTrainingCreateWizard.tsx`         |

### events

| Паттерн testId                                                 | Файл                                                       |
|----------------------------------------------------------------|------------------------------------------------------------|
| `events-agreements-btn-arena-{selected-id}`                    | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-btn-arenas`                                 | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-btn-chat-{selected-id}`                     | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-btn-create-{selected-id}`                   | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-btn-filter-{key}`                           | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-empty`                                      | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-link-arena-{selected-id}`                   | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-link-arenas`                                | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-link-create-{selected-id}`                  | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-list`                                       | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-loader`                                     | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-panel`                                      | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-panel-detail-{selected-id}`                 | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-panel-filters`                              | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-row-{agreement-id}`                         | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-text-arena-{agreement-id}`                  | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-text-detail-comment-{selected-id}`          | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-text-detail-phone-{selected-id}`            | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-text-detail-pool-{selected-id}`             | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-text-detail-price-{selected-id}`            | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-text-detail-status-{selected-id}`           | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-text-detail-title-{selected-id}`            | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-text-detail-when-{selected-id}`             | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-text-hint`                                  | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-text-interval-{agreement-id}`               | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-text-stats`                                 | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-text-status-{agreement-id}`                 | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-agreements-text-title`                                 | `src/features/events/ui/OrganizerAgreementsPanel.tsx`      |
| `events-attendance-btn-{status}-{event-id}`                    | `src/features/events/ui/AttendanceControl.tsx`             |
| `events-attendance-list-{event-id}`                            | `src/features/events/ui/AttendanceControl.tsx`             |
| `events-attendance-loader-{event-id}`                          | `src/features/events/ui/AttendanceControl.tsx`             |
| `events-attendance-panel-{event-id}`                           | `src/features/events/ui/AttendanceControl.tsx`             |
| `events-attendance-text-label-{event-id}`                      | `src/features/events/ui/AttendanceControl.tsx`             |
| `events-card-badge-access-{event-id}`                          | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-badge-type-{event-id}`                            | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-card-{event-id}`                                  | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-card-{event-id}-compact`                          | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-link-feedback-{event-id}`                         | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-text-arena-{event-id}`                            | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-text-datetime-{event-id}`                         | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-text-feedback-{event-id}`                         | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-text-meta-{event-id}`                             | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-text-price-{event-id}`                            | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-text-seats-{event-id}`                            | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-text-status-{event-id}`                           | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-text-team-rsvp-hint-{event-id}`                   | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-text-time-{event-id}`                             | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-text-title-{event-id}`                            | `src/features/events/ui/EventCard.tsx`                     |
| `events-card-text-weekday-{event-id}`                          | `src/features/events/ui/EventCard.tsx`                     |
| `events-create-form-btn-agreements-cabinet`                    | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-btn-back`                                  | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-btn-back-details`                          | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-btn-cabinet`                               | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-btn-draft`                                 | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-btn-goalie-request`                        | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-btn-next`                                  | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-btn-pick-agreement-{agreement-id}`         | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-btn-place-agreement`                       | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-btn-place-manual`                          | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-btn-step-{item-id}`                        | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-btn-submit`                                | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-btn-upgrade`                               | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-error-copy`                                | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-error-gate`                                | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-error-place`                               | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-field-ends-at`                             | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-field-price`                               | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-field-slots`                               | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-field-starts-at`                           | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-field-title`                               | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-link-agreements-cabinet`                   | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-link-back-details`                         | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-link-cabinet`                              | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-link-upgrade`                              | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-loader-copy`                               | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-panel`                                     | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-panel-agreements`                          | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-panel-place-mode`                          | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-panel-steps`                               | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-panel-success`                             | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-select-access`                             | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-select-arena`                              | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-select-club`                               | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-select-format`                             | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-select-skill`                              | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-select-team`                               | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-select-type`                               | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-text-access-game`                          | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-text-agreement-selected`                   | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-text-agreements-empty`                     | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-text-ends-at-label`                        | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-text-goalie-pending`                       | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-text-goalie-sent`                          | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-text-money-hint`                           | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-text-money-private`                        | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-text-paywall`                              | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-text-private-badge`                        | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-text-roster-hint`                          | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-text-starts-at-label`                      | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-text-success`                              | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-form-text-title`                                | `src/features/events/ui/EventCreateForm.tsx`               |
| `events-create-page-btn-cabinet`                               | `src/pages/CreateEventPage/ui/CreateEventPage.tsx`         |
| `events-create-page-card-denied`                               | `src/pages/CreateEventPage/ui/CreateEventPage.tsx`         |
| `events-create-page-card-form`                                 | `src/pages/CreateEventPage/ui/CreateEventPage.tsx`         |
| `events-create-page-link-cabinet`                              | `src/pages/CreateEventPage/ui/CreateEventPage.tsx`         |
| `events-create-page-loader-session`                            | `src/pages/CreateEventPage/ui/CreateEventPage.tsx`         |
| `events-create-page-page`                                      | `src/pages/CreateEventPage/ui/CreateEventPage.tsx`         |
| `events-create-page-page-denied`                               | `src/pages/CreateEventPage/ui/CreateEventPage.tsx`         |
| `events-edit-page-btn-back`                                    | `src/pages/EditTrainingPage/ui/EditTrainingPage.tsx`       |
| `events-edit-page-card-denied`                                 | `src/pages/EditTrainingPage/ui/EditTrainingPage.tsx`       |
| `events-edit-page-card-form`                                   | `src/pages/EditTrainingPage/ui/EditTrainingPage.tsx`       |
| `events-edit-page-empty`                                       | `src/pages/EditTrainingPage/ui/EditTrainingPage.tsx`       |
| `events-edit-page-error`                                       | `src/pages/EditTrainingPage/ui/EditTrainingPage.tsx`       |
| `events-edit-page-error-access-denied`                         | `src/pages/EditTrainingPage/ui/EditTrainingPage.tsx`       |
| `events-edit-page-link-back`                                   | `src/pages/EditTrainingPage/ui/EditTrainingPage.tsx`       |
| `events-edit-page-loader`                                      | `src/pages/EditTrainingPage/ui/EditTrainingPage.tsx`       |
| `events-edit-page-loader-session`                              | `src/pages/EditTrainingPage/ui/EditTrainingPage.tsx`       |
| `events-edit-page-page-{event-id}`                             | `src/pages/EditTrainingPage/ui/EditTrainingPage.tsx`       |
| `events-game-page-btn-messenger-{event-id}`                    | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-btn-phone-{event-id}`                        | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-empty`                                       | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-error`                                       | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-link-arena-{event-id}`                       | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-link-team-{event-id}`                        | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-loader`                                      | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-page-{event-id}`                             | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-panel-contacts-{event-id}`                   | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-panel-meta-{event-id}`                       | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-panel-registration-{event-id}`               | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-panel-rsvp-{event-id}`                       | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-panel-slots-{event-id}`                      | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-text-arena-{event-id}`                       | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-text-contacts-title-{event-id}`              | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-text-fill-{event-id}`                        | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-text-level-{event-id}`                       | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-text-meta-title-{event-id}`                  | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-text-organizer-{event-id}`                   | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-text-owner-{event-id}`                       | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-text-price-{event-id}`                       | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-text-registration-status-{event-id}`         | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-text-registration-title-{event-id}`          | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-text-rsvp-title-{event-id}`                  | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-text-slot-{event-id}-{position}`             | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-text-slots-title-{event-id}`                 | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-game-page-text-team-{event-id}`                        | `src/pages/GameDetailsPage/ui/GameDetailsPage.tsx`         |
| `events-organizer-btn-copy-{event-id}`                         | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-btn-edit-{event-id}`                         | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-btn-filter-{item}`                           | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-btn-open-{event-id}`                         | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-card`                                        | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-empty`                                       | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-link-copy-{event-id}`                        | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-link-edit-{event-id}`                        | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-link-open-{event-id}`                        | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-list`                                        | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-page-btn-back`                               | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-btn-create`                             | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-btn-profile`                            | `src/features/events/ui/OrganizerProfilePanel.tsx`         |
| `events-organizer-page-btn-profile-create`                     | `src/features/events/ui/OrganizerProfilePanel.tsx`         |
| `events-organizer-page-btn-profile-public`                     | `src/features/events/ui/OrganizerProfilePanel.tsx`         |
| `events-organizer-page-btn-tab-agreements`                     | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-btn-tab-calendar`                       | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-btn-tab-profile`                        | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-btn-tab-registrations`                  | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-btn-tab-trainings`                      | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-card-denied`                            | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-error`                                  | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-link-back`                              | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-link-create`                            | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-link-profile`                           | `src/features/events/ui/OrganizerProfilePanel.tsx`         |
| `events-organizer-page-link-profile-create`                    | `src/features/events/ui/OrganizerProfilePanel.tsx`         |
| `events-organizer-page-link-profile-public`                    | `src/features/events/ui/OrganizerProfilePanel.tsx`         |
| `events-organizer-page-loader`                                 | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-loader-session`                         | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-page`                                   | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-page-denied`                            | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-panel-calendar`                         | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-panel-profile`                          | `src/features/events/ui/OrganizerProfilePanel.tsx`         |
| `events-organizer-page-panel-tabs`                             | `src/pages/OrganizerEventsPage/ui/OrganizerEventsPage.tsx` |
| `events-organizer-page-text-profile-hint`                      | `src/features/events/ui/OrganizerProfilePanel.tsx`         |
| `events-organizer-page-text-profile-name`                      | `src/features/events/ui/OrganizerProfilePanel.tsx`         |
| `events-organizer-page-text-profile-role`                      | `src/features/events/ui/OrganizerProfilePanel.tsx`         |
| `events-organizer-page-text-profile-stats`                     | `src/features/events/ui/OrganizerProfilePanel.tsx`         |
| `events-organizer-page-text-profile-subscription`              | `src/features/events/ui/OrganizerProfilePanel.tsx`         |
| `events-organizer-page-text-profile-title`                     | `src/features/events/ui/OrganizerProfilePanel.tsx`         |
| `events-organizer-panel-filters`                               | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-regs-btn-event-{row-id}`                     | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-regs-btn-filter-{item}`                      | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-regs-btn-player-{row-id}`                    | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-regs-empty`                                  | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-regs-link-event-{row-id}`                    | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-regs-link-player-{row-id}`                   | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-regs-list`                                   | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-regs-panel`                                  | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-regs-panel-filters`                          | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-regs-row-{row-id}`                           | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-regs-text-hint`                              | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-regs-text-meta-{row-id}`                     | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-regs-text-name-{row-id}`                     | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-regs-text-stats`                             | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-regs-text-title`                             | `src/features/events/ui/OrganizerRegistrationsPanel.tsx`   |
| `events-organizer-row-{event-id}`                              | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-text-fill-{event-id}`                        | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-text-hint`                                   | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-text-meta-{event-id}`                        | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-text-name-{event-id}`                        | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-text-stats`                                  | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-text-status-{event-id}`                      | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-organizer-text-title`                                  | `src/features/events/ui/OrganizerTrainingsPanel.tsx`       |
| `events-page`                                                  | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-btn-create`                                       | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-btn-nearest-game-toggle`                          | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-btn-organizer`                                    | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-btn-type-{tab-id}`                                | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-empty-trainings`                                  | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-empty-upcoming`                                   | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-error`                                            | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-field-date`                                       | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-field-price-max`                                  | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-field-price-min`                                  | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-link-create`                                      | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-link-organizer`                                   | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-list-details`                                     | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-loader`                                           | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-panel-league-rsvp`                                | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-panel-nearest-game`                               | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-panel-organizer-actions`                          | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-panel-type-tabs`                                  | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-select-access`                                    | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-select-arena`                                     | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-select-district`                                  | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-select-fill-state`                                | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-select-format`                                    | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-select-level`                                     | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-select-status`                                    | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-select-time`                                      | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-text-details-title`                               | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-text-geoblock`                                    | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-page-text-nearest-game-title`                          | `src/pages/EventsPage/ui/EventsPage.tsx`                   |
| `events-roster-list-{event-id}`                                | `src/features/events/ui/RosterNeedsWidget.tsx`             |
| `events-roster-loader-{event-id}`                              | `src/features/events/ui/RosterNeedsWidget.tsx`             |
| `events-roster-panel-{event-id}`                               | `src/features/events/ui/RosterNeedsWidget.tsx`             |
| `events-roster-panel-progress-{event-id}`                      | `src/features/events/ui/RosterNeedsWidget.tsx`             |
| `events-roster-slot-{position}-{event-id}`                     | `src/features/events/ui/RosterNeedsWidget.tsx`             |
| `events-roster-text-complete-{event-id}`                       | `src/features/events/ui/RosterNeedsWidget.tsx`             |
| `events-roster-text-deficit-{position}-{event-id}`             | `src/features/events/ui/RosterNeedsWidget.tsx`             |
| `events-roster-text-summary-{event-id}`                        | `src/features/events/ui/RosterNeedsWidget.tsx`             |
| `events-roster-text-title-{event-id}`                          | `src/features/events/ui/RosterNeedsWidget.tsx`             |
| `events-rsvp-item-{user-id}-{event-id}`                        | `src/features/events/ui/EventRsvpBoard.tsx`                |
| `events-rsvp-list-{event-id}`                                  | `src/features/events/ui/EventRsvpBoard.tsx`                |
| `events-rsvp-panel-{event-id}`                                 | `src/features/events/ui/EventRsvpBoard.tsx`                |
| `events-rsvp-text-name-{user-id}`                              | `src/features/events/ui/EventRsvpBoard.tsx`                |
| `events-rsvp-text-status-{user-id}`                            | `src/features/events/ui/EventRsvpBoard.tsx`                |
| `events-rsvp-text-title-{event-id}`                            | `src/features/events/ui/EventRsvpBoard.tsx`                |
| `events-training-page-btn-edit-{event-id}`                     | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-btn-messenger-{event-id}`                | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-btn-phone-{event-id}`                    | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-btn-prepay-{event-id}`                   | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-empty`                                   | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-error`                                   | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-error-access-denied`                     | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-link-arena-{event-id}`                   | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-loader`                                  | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-page-{event-id}`                         | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-panel-contacts-{event-id}`               | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-panel-meta-{event-id}`                   | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-panel-registration-{event-id}`           | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-panel-slots-{event-id}`                  | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-allowed-users-{event-id}`           | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-arena-{event-id}`                   | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-contacts-title-{event-id}`          | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-format-{event-id}`                  | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-level-{event-id}`                   | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-meta-title-{event-id}`              | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-organizer-{event-id}`               | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-owner-{event-id}`                   | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-price-{event-id}`                   | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-region-{event-id}`                  | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-registration-status-{event-id}`     | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-registration-title-{event-id}`      | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-seats-{event-id}`                   | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-slot-{event-id}-{position}`         | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-page-text-slots-title-{event-id}`             | `src/pages/TrainingDetailsPage/ui/TrainingDetailsPage.tsx` |
| `events-training-registration-btn-cancel-{event-id}`           | `src/features/events/ui/TrainingRegistrationControl.tsx`   |
| `events-training-registration-btn-confirm-cancel-{event-id}`   | `src/features/events/ui/TrainingRegistrationControl.tsx`   |
| `events-training-registration-btn-dismiss-cancel-{event-id}`   | `src/features/events/ui/TrainingRegistrationControl.tsx`   |
| `events-training-registration-btn-join-{event-id}`             | `src/features/events/ui/TrainingRegistrationControl.tsx`   |
| `events-training-registration-btn-waitlist-{event-id}`         | `src/features/events/ui/TrainingRegistrationControl.tsx`   |
| `events-training-registration-error-{event-id}`                | `src/features/events/ui/TrainingRegistrationControl.tsx`   |
| `events-training-registration-list-actions-{event-id}`         | `src/features/events/ui/TrainingRegistrationControl.tsx`   |
| `events-training-registration-panel-{event-id}`                | `src/features/events/ui/TrainingRegistrationControl.tsx`   |
| `events-training-registration-panel-confirm-cancel-{event-id}` | `src/features/events/ui/TrainingRegistrationControl.tsx`   |
| `events-training-registration-text-confirm-cancel-{event-id}`  | `src/features/events/ui/TrainingRegistrationControl.tsx`   |
| `events-training-registration-text-status-{event-id}`          | `src/features/events/ui/TrainingRegistrationControl.tsx`   |

### favorites

| Паттерн testId                             | Файл                                                    |
|--------------------------------------------|---------------------------------------------------------|
| `favorites-btn-settings`                   | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-btn-toggle-{slug}`              | `src/features/favorites/ui/FavoriteButton.tsx`          |
| `favorites-card-{action-id}`               | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-desc-{action-id}`               | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-empty`                          | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-entity-panel`                   | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-btn-all`           | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-btn-all-close`     | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-dialog-all`        | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-empty`             | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-error`             | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-footer-all`        | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-link-{item-id}`    | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-list`              | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-loader`            | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-panel-all-body`    | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-text-{item-id}`    | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-text-all-title`    | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-text-context`      | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-text-more`         | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-entity-panel-text-title`        | `src/features/favorites/ui/EntityFavoritesPanel.tsx`    |
| `favorites-error-{slug}`                   | `src/features/favorites/ui/FavoriteButton.tsx`          |
| `favorites-error-status-{slug}`            | `src/features/favorites/ui/FavoriteButton.tsx`          |
| `favorites-icon-{action-id}`               | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-label-{action-id}`              | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-link-{action-id}`               | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-panel`                          | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-profile-section-embedded`       | `src/features/favorites/ui/ProfileFavoritesSection.tsx` |
| `favorites-profile-section-empty`          | `src/features/favorites/ui/ProfileFavoritesSection.tsx` |
| `favorites-profile-section-error`          | `src/features/favorites/ui/ProfileFavoritesSection.tsx` |
| `favorites-profile-section-group-{type}`   | `src/features/favorites/ui/ProfileFavoritesSection.tsx` |
| `favorites-profile-section-link-{item-id}` | `src/features/favorites/ui/ProfileFavoritesSection.tsx` |
| `favorites-profile-section-loader`         | `src/features/favorites/ui/ProfileFavoritesSection.tsx` |
| `favorites-profile-section-page`           | `src/features/favorites/ui/ProfileFavoritesSection.tsx` |
| `favorites-profile-section-text-{value}`   | `src/features/favorites/ui/ProfileFavoritesSection.tsx` |
| `favorites-profile-section-text-title`     | `src/features/favorites/ui/ProfileFavoritesSection.tsx` |
| `favorites-settings-btn-cancel`            | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-settings-btn-save`              | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-settings-checkbox-{action-id}`  | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-settings-desc-{action-id}`      | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-settings-dialog`                | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-settings-footer`                | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-settings-header`                | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-settings-icon-{action-id}`      | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-settings-label-{action-id}`     | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-settings-row-{action-id}`       | `src/features/favorites/ui/FavoritesPanel.tsx`          |
| `favorites-text-title`                     | `src/features/favorites/ui/FavoritesPanel.tsx`          |

### feedback

| Паттерн testId                      | Файл                                                |
|-------------------------------------|-----------------------------------------------------|
| `feedback-form-btn-submit`          | `src/features/feedback/ui/PostGameFeedbackForm.tsx` |
| `feedback-form-empty`               | `src/features/feedback/ui/PostGameFeedbackForm.tsx` |
| `feedback-form-field-comment`       | `src/features/feedback/ui/PostGameFeedbackForm.tsx` |
| `feedback-form-field-comment-input` | `src/features/feedback/ui/PostGameFeedbackForm.tsx` |
| `feedback-form-form`                | `src/features/feedback/ui/PostGameFeedbackForm.tsx` |
| `feedback-form-select-attendance`   | `src/features/feedback/ui/PostGameFeedbackForm.tsx` |
| `feedback-form-select-behavior`     | `src/features/feedback/ui/PostGameFeedbackForm.tsx` |
| `feedback-form-select-event`        | `src/features/feedback/ui/PostGameFeedbackForm.tsx` |
| `feedback-form-select-player`       | `src/features/feedback/ui/PostGameFeedbackForm.tsx` |
| `feedback-form-select-skill`        | `src/features/feedback/ui/PostGameFeedbackForm.tsx` |
| `feedback-form-text-comment-label`  | `src/features/feedback/ui/PostGameFeedbackForm.tsx` |
| `feedback-form-text-error`          | `src/features/feedback/ui/PostGameFeedbackForm.tsx` |
| `feedback-form-text-success`        | `src/features/feedback/ui/PostGameFeedbackForm.tsx` |
| `feedback-form-text-title`          | `src/features/feedback/ui/PostGameFeedbackForm.tsx` |
| `feedback-page-card-form`           | `src/pages/FeedbackPage/ui/FeedbackPage.tsx`        |
| `feedback-page-card-karma-hint`     | `src/pages/FeedbackPage/ui/FeedbackPage.tsx`        |
| `feedback-page-page`                | `src/pages/FeedbackPage/ui/FeedbackPage.tsx`        |

### highlights

| Паттерн testId                                               | Файл                                                 |
|--------------------------------------------------------------|------------------------------------------------------|
| `highlights-annotation-layer-btn-add-{highlight-id}`         | `src/features/highlights/ui/AnnotationLayer.tsx`     |
| `highlights-annotation-layer-field-label-{highlight-id}`     | `src/features/highlights/ui/AnnotationLayer.tsx`     |
| `highlights-annotation-layer-form-{highlight-id}`            | `src/features/highlights/ui/AnnotationLayer.tsx`     |
| `highlights-annotation-layer-item-{annotation-id}`           | `src/features/highlights/ui/AnnotationLayer.tsx`     |
| `highlights-annotation-layer-panel-{highlight-id}`           | `src/features/highlights/ui/AnnotationLayer.tsx`     |
| `highlights-annotation-layer-panel-fields-{highlight-id}`    | `src/features/highlights/ui/AnnotationLayer.tsx`     |
| `highlights-annotation-layer-panel-svg-{highlight-id}`       | `src/features/highlights/ui/AnnotationLayer.tsx`     |
| `highlights-annotation-layer-select-type-{highlight-id}`     | `src/features/highlights/ui/AnnotationLayer.tsx`     |
| `highlights-annotation-layer-text-hint-{highlight-id}`       | `src/features/highlights/ui/AnnotationLayer.tsx`     |
| `highlights-annotation-layer-text-title-{highlight-id}`      | `src/features/highlights/ui/AnnotationLayer.tsx`     |
| `highlights-card-badge-mock-{highlight-id}`                  | `src/features/highlights/ui/HighlightCard.tsx`       |
| `highlights-card-item-{highlight-id}`                        | `src/features/highlights/ui/HighlightCard.tsx`       |
| `highlights-card-panel-head-{highlight-id}`                  | `src/features/highlights/ui/HighlightCard.tsx`       |
| `highlights-card-panel-meta-{highlight-id}`                  | `src/features/highlights/ui/HighlightCard.tsx`       |
| `highlights-card-text-author-{highlight-id}`                 | `src/features/highlights/ui/HighlightCard.tsx`       |
| `highlights-card-text-duration-{highlight-id}`               | `src/features/highlights/ui/HighlightCard.tsx`       |
| `highlights-card-text-event-{highlight-id}`                  | `src/features/highlights/ui/HighlightCard.tsx`       |
| `highlights-card-text-title-{highlight-id}`                  | `src/features/highlights/ui/HighlightCard.tsx`       |
| `highlights-comments-badge-tag-{comment-id}`                 | `src/features/highlights/ui/HighlightComments.tsx`   |
| `highlights-comments-btn-submit-{highlight-id}`              | `src/features/highlights/ui/HighlightComments.tsx`   |
| `highlights-comments-comment-{comment-id}`                   | `src/features/highlights/ui/HighlightComments.tsx`   |
| `highlights-comments-empty-{highlight-id}`                   | `src/features/highlights/ui/HighlightComments.tsx`   |
| `highlights-comments-field-text-{highlight-id}`              | `src/features/highlights/ui/HighlightComments.tsx`   |
| `highlights-comments-form-{highlight-id}`                    | `src/features/highlights/ui/HighlightComments.tsx`   |
| `highlights-comments-list-{highlight-id}`                    | `src/features/highlights/ui/HighlightComments.tsx`   |
| `highlights-comments-panel-{highlight-id}`                   | `src/features/highlights/ui/HighlightComments.tsx`   |
| `highlights-comments-panel-meta-{comment-id}`                | `src/features/highlights/ui/HighlightComments.tsx`   |
| `highlights-comments-select-tag-{highlight-id}`              | `src/features/highlights/ui/HighlightComments.tsx`   |
| `highlights-comments-text-author-{comment-id}`               | `src/features/highlights/ui/HighlightComments.tsx`   |
| `highlights-comments-text-body-{comment-id}`                 | `src/features/highlights/ui/HighlightComments.tsx`   |
| `highlights-comments-text-time-{comment-id}`                 | `src/features/highlights/ui/HighlightComments.tsx`   |
| `highlights-comments-text-title-{highlight-id}`              | `src/features/highlights/ui/HighlightComments.tsx`   |
| `highlights-mock-notice-badge`                               | `src/features/highlights/ui/MockUploadNotice.tsx`    |
| `highlights-mock-notice-panel`                               | `src/features/highlights/ui/MockUploadNotice.tsx`    |
| `highlights-mock-notice-text`                                | `src/features/highlights/ui/MockUploadNotice.tsx`    |
| `highlights-page-card-upload`                                | `src/pages/HighlightsPage/ui/HighlightsPage.tsx`     |
| `highlights-page-card-video-board-{active-id}`               | `src/pages/HighlightsPage/ui/HighlightsPage.tsx`     |
| `highlights-page-empty-board`                                | `src/pages/HighlightsPage/ui/HighlightsPage.tsx`     |
| `highlights-page-empty-highlights`                           | `src/pages/HighlightsPage/ui/HighlightsPage.tsx`     |
| `highlights-page-list-highlights`                            | `src/pages/HighlightsPage/ui/HighlightsPage.tsx`     |
| `highlights-page-loader-detail`                              | `src/pages/HighlightsPage/ui/HighlightsPage.tsx`     |
| `highlights-page-page`                                       | `src/pages/HighlightsPage/ui/HighlightsPage.tsx`     |
| `highlights-page-panel-board`                                | `src/pages/HighlightsPage/ui/HighlightsPage.tsx`     |
| `highlights-page-panel-catalog`                              | `src/pages/HighlightsPage/ui/HighlightsPage.tsx`     |
| `highlights-page-panel-layout`                               | `src/pages/HighlightsPage/ui/HighlightsPage.tsx`     |
| `highlights-upload-form-btn-submit`                          | `src/features/highlights/ui/HighlightUploadForm.tsx` |
| `highlights-upload-form-field-title`                         | `src/features/highlights/ui/HighlightUploadForm.tsx` |
| `highlights-upload-form-form`                                | `src/features/highlights/ui/HighlightUploadForm.tsx` |
| `highlights-upload-form-panel-fields`                        | `src/features/highlights/ui/HighlightUploadForm.tsx` |
| `highlights-upload-form-select-event`                        | `src/features/highlights/ui/HighlightUploadForm.tsx` |
| `highlights-upload-form-text-title`                          | `src/features/highlights/ui/HighlightUploadForm.tsx` |
| `highlights-video-board-field-scrubber-{highlight-id}`       | `src/features/highlights/ui/HighlightVideoBoard.tsx` |
| `highlights-video-board-field-scrubber-input-{highlight-id}` | `src/features/highlights/ui/HighlightVideoBoard.tsx` |
| `highlights-video-board-panel-aside-{highlight-id}`          | `src/features/highlights/ui/HighlightVideoBoard.tsx` |
| `highlights-video-board-panel-head-{highlight-id}`           | `src/features/highlights/ui/HighlightVideoBoard.tsx` |
| `highlights-video-board-panel-layout-{highlight-id}`         | `src/features/highlights/ui/HighlightVideoBoard.tsx` |
| `highlights-video-board-panel-main-{highlight-id}`           | `src/features/highlights/ui/HighlightVideoBoard.tsx` |
| `highlights-video-board-panel-preview-{highlight-id}`        | `src/features/highlights/ui/HighlightVideoBoard.tsx` |
| `highlights-video-board-panel-rink-{highlight-id}`           | `src/features/highlights/ui/HighlightVideoBoard.tsx` |
| `highlights-video-board-text-meta-{highlight-id}`            | `src/features/highlights/ui/HighlightVideoBoard.tsx` |
| `highlights-video-board-text-scrubber-label-{highlight-id}`  | `src/features/highlights/ui/HighlightVideoBoard.tsx` |
| `highlights-video-board-text-title-{highlight-id}`           | `src/features/highlights/ui/HighlightVideoBoard.tsx` |
| `highlights-video-board-video-{highlight-id}`                | `src/features/highlights/ui/HighlightVideoBoard.tsx` |

### iq

| Паттерн testId                                                 | Файл                                       |
|----------------------------------------------------------------|--------------------------------------------|
| `iq-attempt-flow-btn-exit-empty`                               | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-btn-exit-result`                              | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-btn-finish`                                   | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-btn-next`                                     | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-btn-option-{current-question-id}-{option-id}` | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-btn-prev`                                     | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-empty-{test-id}`                              | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-list-options-{current-question-id}`           | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-list-result-details`                          | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-panel-actions`                                | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-panel-board-{test-id}`                        | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-panel-head`                                   | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-panel-result-{test-id}`                       | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-row-result-{question-id}`                     | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-text-answered-count`                          | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-text-no-questions`                            | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-text-progress`                                | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-text-prompt-{current-question-id}`            | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-text-result-explanation-{question-id}`        | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-text-result-score`                            | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-text-result-streak`                           | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-text-result-title`                            | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-text-result-verdict-{question-id}`            | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-attempt-flow-text-test-title`                              | `src/features/iq/ui/IqAttemptFlow.tsx`     |
| `iq-leaderboard-card`                                          | `src/features/iq/ui/IqLeaderboard.tsx`     |
| `iq-leaderboard-cell-name-{user-id}`                           | `src/features/iq/ui/IqLeaderboard.tsx`     |
| `iq-leaderboard-cell-rank-{user-id}`                           | `src/features/iq/ui/IqLeaderboard.tsx`     |
| `iq-leaderboard-cell-score-{user-id}`                          | `src/features/iq/ui/IqLeaderboard.tsx`     |
| `iq-leaderboard-cell-streak-{user-id}`                         | `src/features/iq/ui/IqLeaderboard.tsx`     |
| `iq-leaderboard-row-{user-id}`                                 | `src/features/iq/ui/IqLeaderboard.tsx`     |
| `iq-leaderboard-table`                                         | `src/features/iq/ui/IqLeaderboard.tsx`     |
| `iq-leaderboard-text-title`                                    | `src/features/iq/ui/IqLeaderboard.tsx`     |
| `iq-page-empty-tests`                                          | `src/pages/IqTestsPage/ui/IqTestsPage.tsx` |
| `iq-page-error-tests`                                          | `src/pages/IqTestsPage/ui/IqTestsPage.tsx` |
| `iq-page-list-tests`                                           | `src/pages/IqTestsPage/ui/IqTestsPage.tsx` |
| `iq-page-loader-leaderboard`                                   | `src/pages/IqTestsPage/ui/IqTestsPage.tsx` |
| `iq-page-loader-questions`                                     | `src/pages/IqTestsPage/ui/IqTestsPage.tsx` |
| `iq-page-loader-tests`                                         | `src/pages/IqTestsPage/ui/IqTestsPage.tsx` |
| `iq-page-page`                                                 | `src/pages/IqTestsPage/ui/IqTestsPage.tsx` |
| `iq-page-panel-layout`                                         | `src/pages/IqTestsPage/ui/IqTestsPage.tsx` |
| `iq-page-panel-main`                                           | `src/pages/IqTestsPage/ui/IqTestsPage.tsx` |
| `iq-page-panel-sidebar`                                        | `src/pages/IqTestsPage/ui/IqTestsPage.tsx` |
| `iq-test-card-btn-start-{test-id}`                             | `src/features/iq/ui/IqTestCard.tsx`        |
| `iq-test-card-card-{test-id}`                                  | `src/features/iq/ui/IqTestCard.tsx`        |
| `iq-test-card-panel-meta-{test-id}`                            | `src/features/iq/ui/IqTestCard.tsx`        |
| `iq-test-card-text-category-{test-id}`                         | `src/features/iq/ui/IqTestCard.tsx`        |
| `iq-test-card-text-difficulty-{test-id}`                       | `src/features/iq/ui/IqTestCard.tsx`        |
| `iq-test-card-text-stats-{test-id}`                            | `src/features/iq/ui/IqTestCard.tsx`        |
| `iq-test-card-text-title-{test-id}`                            | `src/features/iq/ui/IqTestCard.tsx`        |

### leagues

| Паттерн testId                                                  | Файл                                                             |
|-----------------------------------------------------------------|------------------------------------------------------------------|
| `leagues-analytics-card-applications-pending-{league-id}`       | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-card-applications-total-{league-id}`         | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-card-conversion-rate-{league-id}`            | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-card-profile-views-{league-id}`              | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-list-{league-id}`                            | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-loader-{league-id}`                          | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-panel-{league-id}`                           | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-text-applications-pending-label-{league-id}` | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-text-applications-pending-value-{league-id}` | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-text-applications-total-label-{league-id}`   | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-text-applications-total-value-{league-id}`   | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-text-conversion-rate-label-{league-id}`      | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-text-conversion-rate-value-{league-id}`      | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-text-profile-views-label-{league-id}`        | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-text-profile-views-value-{league-id}`        | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-text-summary-{league-id}`                    | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-analytics-text-title-{league-id}`                      | `src/features/leagues/ui/LeagueAnalyticsPanel.tsx`               |
| `leagues-application-btn-login-{league-id}`                     | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-btn-submit-{league-id}`                    | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-field-email-{league-id}`                   | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-link-login-{league-id}`                    | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-panel-existing-{league-id}`                | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-panel-form-{league-id}`                    | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-panel-login-hint-{league-id}`              | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-select-division-{league-id}`               | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-select-team-{league-id}`                   | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-text-captain-only-{league-id}`             | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-text-closed-{league-id}`                   | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-text-existing-meta-{league-id}`            | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-text-existing-status-{league-id}`          | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-text-existing-title-{league-id}`           | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-text-form-subtitle-{league-id}`            | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-text-form-title-{league-id}`               | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-text-no-team-{league-id}`                  | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-application-text-status-{league-id}`                   | `src/features/leagues/ui/LeagueTeamApplicationForm.tsx`          |
| `leagues-applications-btn-approve-{app-id}`                     | `src/features/leagues/ui/LeagueApplicationsPanel.tsx`            |
| `leagues-applications-btn-reject-{app-id}`                      | `src/features/leagues/ui/LeagueApplicationsPanel.tsx`            |
| `leagues-applications-field-comment-{app-id}`                   | `src/features/leagues/ui/LeagueApplicationsPanel.tsx`            |
| `leagues-applications-item-{app-id}`                            | `src/features/leagues/ui/LeagueApplicationsPanel.tsx`            |
| `leagues-applications-list-{league-id}`                         | `src/features/leagues/ui/LeagueApplicationsPanel.tsx`            |
| `leagues-applications-panel-{league-id}`                        | `src/features/leagues/ui/LeagueApplicationsPanel.tsx`            |
| `leagues-applications-panel-review-{app-id}`                    | `src/features/leagues/ui/LeagueApplicationsPanel.tsx`            |
| `leagues-applications-select-decision-{app-id}`                 | `src/features/leagues/ui/LeagueApplicationsPanel.tsx`            |
| `leagues-applications-text-captain-{app-id}`                    | `src/features/leagues/ui/LeagueApplicationsPanel.tsx`            |
| `leagues-applications-text-division-{app-id}`                   | `src/features/leagues/ui/LeagueApplicationsPanel.tsx`            |
| `leagues-applications-text-review-comment-{app-id}`             | `src/features/leagues/ui/LeagueApplicationsPanel.tsx`            |
| `leagues-applications-text-season-{league-id}`                  | `src/features/leagues/ui/LeagueApplicationsPanel.tsx`            |
| `leagues-applications-text-team-name-{app-id}`                  | `src/features/leagues/ui/LeagueApplicationsPanel.tsx`            |
| `leagues-applications-text-title-{league-id}`                   | `src/features/leagues/ui/LeagueApplicationsPanel.tsx`            |
| `leagues-card-badge-integration-{league-id}`                    | `src/features/leagues/ui/LeagueCard.tsx`                         |
| `leagues-card-badge-level-{league-id}`                          | `src/features/leagues/ui/LeagueCard.tsx`                         |
| `leagues-card-badge-profile-{league-id}`                        | `src/features/leagues/ui/LeagueCard.tsx`                         |
| `leagues-card-badge-source-{league-id}`                         | `src/features/leagues/ui/LeagueCard.tsx`                         |
| `leagues-card-btn-open-{league-id}`                             | `src/features/leagues/ui/LeagueCard.tsx`                         |
| `leagues-card-btn-portal-{league-id}`                           | `src/features/leagues/ui/LeagueCard.tsx`                         |
| `leagues-card-card-{league-id}`                                 | `src/features/leagues/ui/LeagueCard.tsx`                         |
| `leagues-card-panel-chips-{league-id}`                          | `src/features/leagues/ui/LeagueCard.tsx`                         |
| `leagues-card-text-name-{league-id}`                            | `src/features/leagues/ui/LeagueCard.tsx`                         |
| `leagues-card-text-region-{league-id}`                          | `src/features/leagues/ui/LeagueCard.tsx`                         |
| `leagues-details-badge-source-{league-id}`                      | `src/pages/LeagueDetailsPage/ui/LeagueDetailsPage.tsx`           |
| `leagues-details-card-stats-{league-id}`                        | `src/pages/LeagueDetailsPage/ui/LeagueDetailsPage.tsx`           |
| `leagues-details-empty`                                         | `src/pages/LeagueDetailsPage/ui/LeagueDetailsPage.tsx`           |
| `leagues-details-error`                                         | `src/pages/LeagueDetailsPage/ui/LeagueDetailsPage.tsx`           |
| `leagues-details-loader`                                        | `src/pages/LeagueDetailsPage/ui/LeagueDetailsPage.tsx`           |
| `leagues-details-loader-schedule-{league-id}`                   | `src/pages/LeagueDetailsPage/ui/LeagueDetailsPage.tsx`           |
| `leagues-details-loader-standings-{league-id}`                  | `src/pages/LeagueDetailsPage/ui/LeagueDetailsPage.tsx`           |
| `leagues-details-page-{league-id}`                              | `src/pages/LeagueDetailsPage/ui/LeagueDetailsPage.tsx`           |
| `leagues-details-text-stats-subtitle-{league-id}`               | `src/pages/LeagueDetailsPage/ui/LeagueDetailsPage.tsx`           |
| `leagues-details-text-stats-title-{league-id}`                  | `src/pages/LeagueDetailsPage/ui/LeagueDetailsPage.tsx`           |
| `leagues-filters-select-level`                                  | `src/features/leagues/ui/LeagueFilters.tsx`                      |
| `leagues-filters-select-recruiting`                             | `src/features/leagues/ui/LeagueFilters.tsx`                      |
| `leagues-my-league-btn-open-{league-id}`                        | `src/features/leagues/ui/MyLeagueWidget.tsx`                     |
| `leagues-my-league-card-{league-id}`                            | `src/features/leagues/ui/MyLeagueWidget.tsx`                     |
| `leagues-my-league-link-open-{league-id}`                       | `src/features/leagues/ui/MyLeagueWidget.tsx`                     |
| `leagues-my-league-text-eyebrow-{league-id}`                    | `src/features/leagues/ui/MyLeagueWidget.tsx`                     |
| `leagues-my-league-text-name-{league-id}`                       | `src/features/leagues/ui/MyLeagueWidget.tsx`                     |
| `leagues-my-league-text-next-match-{league-id}`                 | `src/features/leagues/ui/MyLeagueWidget.tsx`                     |
| `leagues-my-league-text-next-match-empty-{league-id}`           | `src/features/leagues/ui/MyLeagueWidget.tsx`                     |
| `leagues-my-league-text-rank-{league-id}`                       | `src/features/leagues/ui/MyLeagueWidget.tsx`                     |
| `leagues-my-league-text-rank-empty-{league-id}`                 | `src/features/leagues/ui/MyLeagueWidget.tsx`                     |
| `leagues-page`                                                  | `src/pages/LeaguesPage/ui/LeaguesPage.tsx`                       |
| `leagues-page-btn-reset`                                        | `src/pages/LeaguesPage/ui/LeaguesPage.tsx`                       |
| `leagues-page-empty`                                            | `src/pages/LeaguesPage/ui/LeaguesPage.tsx`                       |
| `leagues-page-error`                                            | `src/pages/LeaguesPage/ui/LeaguesPage.tsx`                       |
| `leagues-page-list`                                             | `src/pages/LeaguesPage/ui/LeaguesPage.tsx`                       |
| `leagues-page-loader`                                           | `src/pages/LeaguesPage/ui/LeaguesPage.tsx`                       |
| `leagues-page-panel-partner-access`                             | `src/pages/LeaguesPage/ui/LeaguesPage.tsx`                       |
| `leagues-partner-badge-profile-{league-id}`                     | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-btn-back-{league-id}`                          | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-btn-back-empty`                                | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-btn-login`                                     | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-btn-save-{league-id}`                          | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-empty`                                         | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-error`                                         | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-field-description-{league-id}`                 | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-field-email-{league-id}`                       | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-field-phone-{league-id}`                       | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-field-rules-{league-id}`                       | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-link-back-{league-id}`                         | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-link-back-empty`                               | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-link-login`                                    | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-loader`                                        | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-nav-{league-id}`                               | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-page-{league-id}`                              | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-panel-analytics-{league-id}`                   | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-panel-applications-{league-id}`                | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-panel-denied`                                  | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-panel-posts-{league-id}`                       | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-panel-profile-{league-id}`                     | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-panel-schedule-{league-id}`                    | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-select-recruiting-{league-id}`                 | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-tab-analytics-{league-id}`                     | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-tab-applications-{league-id}`                  | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-tab-posts-{league-id}`                         | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-tab-profile-{league-id}`                       | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-tab-schedule-{league-id}`                      | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-text-denied`                                   | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-text-moderation-{league-id}`                   | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-text-profile-title-{league-id}`                | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-partner-text-status-{league-id}`                       | `src/pages/LeaguePartnerDashboard/ui/LeaguePartnerDashboard.tsx` |
| `leagues-portal-modal-{league-id}`                              | `src/features/leagues/ui/MockLeaguePortalModal.tsx`              |
| `leagues-portal-modal-btn-close-{league-id}`                    | `src/features/leagues/ui/MockLeaguePortalModal.tsx`              |
| `leagues-portal-modal-text-description-{league-id}`             | `src/features/leagues/ui/MockLeaguePortalModal.tsx`              |
| `leagues-portal-modal-text-integration-{league-id}`             | `src/features/leagues/ui/MockLeaguePortalModal.tsx`              |
| `leagues-portal-modal-text-level-{league-id}`                   | `src/features/leagues/ui/MockLeaguePortalModal.tsx`              |
| `leagues-portal-modal-text-region-{league-id}`                  | `src/features/leagues/ui/MockLeaguePortalModal.tsx`              |
| `leagues-posts-btn-publish-{league-id}`                         | `src/features/leagues/ui/LeaguePostsPanel.tsx`                   |
| `leagues-posts-checkbox-pinned-{league-id}`                     | `src/features/leagues/ui/LeaguePostsPanel.tsx`                   |
| `leagues-posts-field-body-{league-id}`                          | `src/features/leagues/ui/LeaguePostsPanel.tsx`                   |
| `leagues-posts-field-title-{league-id}`                         | `src/features/leagues/ui/LeaguePostsPanel.tsx`                   |
| `leagues-posts-item-{post-id}`                                  | `src/features/leagues/ui/LeaguePostsPanel.tsx`                   |
| `leagues-posts-list-{league-id}`                                | `src/features/leagues/ui/LeaguePostsPanel.tsx`                   |
| `leagues-posts-panel-{league-id}`                               | `src/features/leagues/ui/LeaguePostsPanel.tsx`                   |
| `leagues-posts-panel-form-{league-id}`                          | `src/features/leagues/ui/LeaguePostsPanel.tsx`                   |
| `leagues-posts-text-form-title-{league-id}`                     | `src/features/leagues/ui/LeaguePostsPanel.tsx`                   |
| `leagues-posts-text-post-body-{post-id}`                        | `src/features/leagues/ui/LeaguePostsPanel.tsx`                   |
| `leagues-posts-text-post-date-{post-id}`                        | `src/features/leagues/ui/LeaguePostsPanel.tsx`                   |
| `leagues-posts-text-post-title-{post-id}`                       | `src/features/leagues/ui/LeaguePostsPanel.tsx`                   |
| `leagues-posts-text-title-{league-id}`                          | `src/features/leagues/ui/LeaguePostsPanel.tsx`                   |
| `leagues-profile-badge-profile-{league-id}`                     | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-btn-cabinet-{league-id}`                       | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-btn-portal-{league-id}`                        | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-btn-website-{league-id}`                       | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-item-{post-id}`                                | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-link-cabinet-{league-id}`                      | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-link-website-{league-id}`                      | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-list-posts-{league-id}`                        | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-panel-{league-id}`                             | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-panel-actions-{league-id}`                     | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-panel-chips-{league-id}`                       | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-panel-info-{league-id}`                        | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-text-description-{league-id}`                  | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-text-level-{league-id}`                        | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-text-level-label-{league-id}`                  | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-text-name-{league-id}`                         | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-text-post-body-{post-id}`                      | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-text-post-title-{post-id}`                     | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-text-region-{league-id}`                       | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-text-region-label-{league-id}`                 | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-profile-text-title-{league-id}`                        | `src/features/leagues/ui/LeagueProfilePanel.tsx`                 |
| `leagues-schedule-empty`                                        | `src/features/leagues/ui/LeagueSchedule.tsx`                     |
| `leagues-schedule-list`                                         | `src/features/leagues/ui/LeagueSchedule.tsx`                     |
| `leagues-schedule-manager-btn-add-match-{league-id}`            | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-btn-import-{league-id}`               | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-btn-save-score-{item-id}`             | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-btn-win-{team-name}`                  | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-cell-team-{team-name}`                | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-field-arena-{league-id}`              | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-field-away-team-{league-id}`          | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-field-csv-{league-id}`                | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-field-home-team-{league-id}`          | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-field-starts-at-{league-id}`          | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-item-{item-id}`                       | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-list-schedule-{league-id}`            | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-list-standings-{league-id}`           | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-panel-{league-id}`                    | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-panel-add-match-{league-id}`          | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-panel-import-{league-id}`             | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-row-{team-name}`                      | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-text-add-match-title-{league-id}`     | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-text-import-hint-{league-id}`         | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-text-import-title-{league-id}`        | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-text-match-meta-{item-id}`            | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-text-match-title-{item-id}`           | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-text-standings-title-{league-id}`     | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-text-status-{league-id}`              | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-schedule-manager-text-title-{league-id}`               | `src/features/leagues/ui/LeagueScheduleManager.tsx`              |
| `leagues-standings-cell-form-{id}`                              | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-cell-games-{id}`                             | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-cell-losses-{id}`                            | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-cell-points-{id}`                            | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-cell-rank-{id}`                              | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-cell-team-{id}`                              | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-cell-wins-{id}`                              | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-column-form`                                 | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-column-games`                                | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-column-losses`                               | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-column-points`                               | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-column-rank`                                 | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-column-team`                                 | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-column-wins`                                 | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-empty`                                       | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-panel-header`                                | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-row-{id}`                                    | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-row-header`                                  | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-table`                                       | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-text-league`                                 | `src/features/leagues/ui/LeagueStandings.tsx`                    |
| `leagues-standings-text-title`                                  | `src/features/leagues/ui/LeagueStandings.tsx`                    |

### messenger

| Паттерн testId                                                   | Файл                                                           |
|------------------------------------------------------------------|----------------------------------------------------------------|
| `messenger-channel-settings-dialog-btn-close`                    | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-channel-settings-dialog-error-save`                   | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-chat-bubble-badge-status-{message-id}`                | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-btn-action-{message-id}-{action-id}`      | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-bubble-{message-id}`                      | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-card-actionable-{message-id}`             | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-error-action-{message-id}`                | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-panel-actionable-actions-{message-id}`    | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-panel-actionable-body-{message-id}`       | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-panel-actionable-header-{message-id}`     | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-panel-content-{message-id}`               | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-panel-meta-{message-id}`                  | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-text-actionable-description-{message-id}` | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-text-actionable-title-{message-id}`       | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-text-content-{message-id}`                | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-text-not-target-{message-id}`             | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-text-position-{message-id}`               | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-text-sender-{message-id}`                 | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-chat-bubble-text-time-{message-id}`                   | `src/features/messenger/ui/ChatBubble.tsx`                     |
| `messenger-new-channel-dialog-btn-cancel`                        | `src/features/messenger/ui/MessengerNewChannelDialog.tsx`      |
| `messenger-new-channel-dialog-card`                              | `src/features/messenger/ui/MessengerNewChannelDialog.tsx`      |
| `messenger-new-channel-dialog-error-create`                      | `src/features/messenger/ui/MessengerNewChannelDialog.tsx`      |
| `messenger-new-chat-dialog-btn-cancel`                           | `src/features/messenger/ui/MessengerNewChatDialog.tsx`         |
| `messenger-new-chat-dialog-card`                                 | `src/features/messenger/ui/MessengerNewChatDialog.tsx`         |
| `messenger-new-chat-dialog-error-create`                         | `src/features/messenger/ui/MessengerNewChatDialog.tsx`         |
| `messenger-new-topic-dialog-btn-cancel`                          | `src/features/messenger/ui/MessengerNewTopicDialog.tsx`        |
| `messenger-new-topic-dialog-card`                                | `src/features/messenger/ui/MessengerNewTopicDialog.tsx`        |
| `messenger-new-topic-dialog-error-create`                        | `src/features/messenger/ui/MessengerNewTopicDialog.tsx`        |
| `messenger-page-badge-chat-avatar-{chat-id}`                     | `src/features/messenger/ui/MessengerChatRow.tsx`               |
| `messenger-page-badge-chat-online-{chat-id}`                     | `src/features/messenger/ui/MessengerChatRow.tsx`               |
| `messenger-page-badge-chat-type-{chat-id}`                       | `src/features/messenger/ui/MessengerChatRow.tsx`               |
| `messenger-page-badge-chat-unread-{chat-id}`                     | `src/features/messenger/ui/MessengerChatRow.tsx`               |
| `messenger-page-badge-team-public-{chat-id}`                     | `src/features/messenger/ui/MessengerNewChatDialog.tsx`         |
| `messenger-page-badge-topic-locked-{topic-id}`                   | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-badge-topic-tag-{topic-id}`                      | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-badge-user-status-{user-id}`                     | `src/features/messenger/ui/MessengerNewChatDialog.tsx`         |
| `messenger-page-btn-{value}`                                     | `src/pages/MessengerPage/ui/MessengerPage.tsx`                 |
| `messenger-page-btn-attach`                                      | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-btn-back`                                        | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-btn-channel-settings-{chat-id}`                  | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-btn-create-entity`                               | `src/features/messenger/ui/MessengerNewChannelDialog.tsx`      |
| `messenger-page-btn-create-topic`                                | `src/features/messenger/ui/MessengerNewTopicDialog.tsx`        |
| `messenger-page-btn-new-channel`                                 | `src/pages/MessengerPage/ui/MessengerPage.tsx`                 |
| `messenger-page-btn-new-chat`                                    | `src/pages/MessengerPage/ui/MessengerPage.tsx`                 |
| `messenger-page-btn-new-topic-{chat-id}`                         | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-btn-open-chat-{chat-id}`                         | `src/features/messenger/ui/MessengerChatRow.tsx`               |
| `messenger-page-btn-pin-chat-{chat-id}`                          | `src/features/messenger/ui/MessengerChatRow.tsx`               |
| `messenger-page-btn-retry-messages`                              | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-btn-send`                                        | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-btn-toggle-pin-{chat-id}`                        | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-checkbox-{qualifier}`                            | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-checkbox-entity-kind`                            | `src/features/messenger/ui/MessengerNewChannelDialog.tsx`      |
| `messenger-page-checkbox-entity-restricted`                      | `src/features/messenger/ui/MessengerNewChannelDialog.tsx`      |
| `messenger-page-checkbox-topic-restricted`                       | `src/features/messenger/ui/MessengerNewTopicDialog.tsx`        |
| `messenger-page-empty-{test-id-qualifier}`                       | `src/features/messenger/ui/MessengerMemberPicker.tsx`          |
| `messenger-page-empty-channel-audit`                             | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-empty-chats`                                     | `src/features/messenger/ui/MessengerChatList.tsx`              |
| `messenger-page-empty-messages`                                  | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-empty-no-chat`                                   | `src/pages/MessengerPage/ui/MessengerPage.tsx`                 |
| `messenger-page-empty-user-search`                               | `src/features/messenger/ui/MessengerNewChatDialog.tsx`         |
| `messenger-page-error-messages`                                  | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-feed-messages`                                   | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-field-{qualifier}`                               | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-field-channel-tag`                               | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-field-chat-search`                               | `src/features/messenger/ui/MessengerChatList.tsx`              |
| `messenger-page-field-entity-kind`                               | `src/features/messenger/ui/MessengerNewChannelDialog.tsx`      |
| `messenger-page-field-entity-restricted`                         | `src/features/messenger/ui/MessengerNewChannelDialog.tsx`      |
| `messenger-page-field-entity-tag`                                | `src/features/messenger/ui/MessengerNewChannelDialog.tsx`      |
| `messenger-page-field-entity-title`                              | `src/features/messenger/ui/MessengerNewChannelDialog.tsx`      |
| `messenger-page-field-message-input`                             | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-field-search`                                    | `src/features/messenger/ui/MessengerNewChatDialog.tsx`         |
| `messenger-page-field-topic-restricted`                          | `src/features/messenger/ui/MessengerNewTopicDialog.tsx`        |
| `messenger-page-field-topic-tag`                                 | `src/features/messenger/ui/MessengerNewTopicDialog.tsx`        |
| `messenger-page-field-topic-title`                               | `src/features/messenger/ui/MessengerNewTopicDialog.tsx`        |
| `messenger-page-form-channel-settings`                           | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-item-{test-id-qualifier}-{user-id}`              | `src/features/messenger/ui/MessengerMemberPicker.tsx`          |
| `messenger-page-item-audit-{entry-id}`                           | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-item-chat-{chat-id}`                             | `src/features/messenger/ui/MessengerChatRow.tsx`               |
| `messenger-page-item-team-search-{chat-id}`                      | `src/features/messenger/ui/MessengerNewChatDialog.tsx`         |
| `messenger-page-item-user-search-{user-id}`                      | `src/features/messenger/ui/MessengerNewChatDialog.tsx`         |
| `messenger-page-list-{value}`                                    | `src/features/messenger/ui/MessengerMemberPicker.tsx`          |
| `messenger-page-list-channel-audit`                              | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-list-chats`                                      | `src/features/messenger/ui/MessengerChatList.tsx`              |
| `messenger-page-list-team-search`                                | `src/features/messenger/ui/MessengerNewChatDialog.tsx`         |
| `messenger-page-list-user-search`                                | `src/features/messenger/ui/MessengerNewChatDialog.tsx`         |
| `messenger-page-loader-channel-settings`                         | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-loader-messages`                                 | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-nav-actions`                                     | `src/pages/MessengerPage/ui/MessengerPage.tsx`                 |
| `messenger-page-nav-header-actions`                              | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-nav-sidebar`                                     | `src/features/messenger/ui/MessengerChatList.tsx`              |
| `messenger-page-nav-toolbar`                                     | `src/pages/MessengerPage/ui/MessengerPage.tsx`                 |
| `messenger-page-nav-topics`                                      | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-page`                                            | `src/pages/MessengerPage/ui/MessengerPage.tsx`                 |
| `messenger-page-panel-channel-settings`                          | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-panel-chat-info-{chat-id}`                       | `src/features/messenger/ui/MessengerChatRow.tsx`               |
| `messenger-page-panel-grid`                                      | `src/pages/MessengerPage/ui/MessengerPage.tsx`                 |
| `messenger-page-panel-header`                                    | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-panel-header-title`                              | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-panel-input`                                     | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-panel-main`                                      | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-panel-status`                                    | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-select-channel-manage-role`                      | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-select-channel-publish-role`                     | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-select-channel-slow-mode`                        | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-tab-list`                                        | `src/pages/MessengerPage/ui/MessengerPage.tsx`                 |
| `messenger-page-tab-topic-{topic-id}`                            | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-text-{value}`                                    | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-text-active-chat-title`                          | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-text-audit-action-{entry-id}`                    | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-text-audit-time-{entry-id}`                      | `src/features/messenger/ui/MessengerChannelSettingsDialog.tsx` |
| `messenger-page-text-chat-subtitle-{chat-id}`                    | `src/features/messenger/ui/MessengerChatRow.tsx`               |
| `messenger-page-text-chat-time-{chat-id}`                        | `src/features/messenger/ui/MessengerChatRow.tsx`               |
| `messenger-page-text-chat-title-{chat-id}`                       | `src/features/messenger/ui/MessengerChatRow.tsx`               |
| `messenger-page-text-entity-restricted-label`                    | `src/features/messenger/ui/MessengerNewChannelDialog.tsx`      |
| `messenger-page-text-online`                                     | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-text-status`                                     | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-text-team-name-{chat-id}`                        | `src/features/messenger/ui/MessengerNewChatDialog.tsx`         |
| `messenger-page-text-topic-restricted-label`                     | `src/features/messenger/ui/MessengerNewTopicDialog.tsx`        |
| `messenger-page-text-topic-title-{topic-id}`                     | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-text-typing`                                     | `src/features/messenger/ui/MessengerConversation.tsx`          |
| `messenger-page-text-user-name-{user-id}`                        | `src/features/messenger/ui/MessengerNewChatDialog.tsx`         |

### notifications

| Паттерн testId                                       | Файл                                                           |
|------------------------------------------------------|----------------------------------------------------------------|
| `notifications-center-badge-type-{notification-id}`  | `src/widgets/NotificationCenter/ui/NotificationCenter.tsx`     |
| `notifications-center-card-{notification-id}`        | `src/widgets/NotificationCenter/ui/NotificationCenter.tsx`     |
| `notifications-center-empty`                         | `src/widgets/NotificationCenter/ui/NotificationCenter.tsx`     |
| `notifications-center-list`                          | `src/widgets/NotificationCenter/ui/NotificationCenter.tsx`     |
| `notifications-center-text-body-{notification-id}`   | `src/widgets/NotificationCenter/ui/NotificationCenter.tsx`     |
| `notifications-center-text-time-{notification-id}`   | `src/widgets/NotificationCenter/ui/NotificationCenter.tsx`     |
| `notifications-center-text-title-{notification-id}`  | `src/widgets/NotificationCenter/ui/NotificationCenter.tsx`     |
| `notifications-mark-read-btn-read-{notification-id}` | `src/features/notifications/ui/MarkNotificationReadButton.tsx` |
| `notifications-page-page`                            | `src/pages/NotificationsPage/ui/NotificationsPage.tsx`         |

### partners

| Паттерн testId                                            | Файл                                                |
|-----------------------------------------------------------|-----------------------------------------------------|
| `partners-access-hint-btn-login-{kind}`                   | `src/features/partners/ui/PartnerAccessHint.tsx`    |
| `partners-access-hint-link-login-{kind}`                  | `src/features/partners/ui/PartnerAccessHint.tsx`    |
| `partners-access-hint-panel-{kind}`                       | `src/features/partners/ui/PartnerAccessHint.tsx`    |
| `partners-access-hint-text-hint-{kind}`                   | `src/features/partners/ui/PartnerAccessHint.tsx`    |
| `partners-access-hint-text-title-{kind}`                  | `src/features/partners/ui/PartnerAccessHint.tsx`    |
| `partners-cabinet-banner-btn-open-{kind}-{entity-id}`     | `src/features/partners/ui/PartnerCabinetBanner.tsx` |
| `partners-cabinet-banner-link-cabinet-{kind}-{entity-id}` | `src/features/partners/ui/PartnerCabinetBanner.tsx` |
| `partners-cabinet-banner-panel-{kind}-{entity-id}`        | `src/features/partners/ui/PartnerCabinetBanner.tsx` |
| `partners-cabinet-banner-text-hint-{kind}-{entity-id}`    | `src/features/partners/ui/PartnerCabinetBanner.tsx` |
| `partners-cabinet-banner-text-name-{kind}-{entity-id}`    | `src/features/partners/ui/PartnerCabinetBanner.tsx` |
| `partners-cabinet-banner-text-title-{kind}-{entity-id}`   | `src/features/partners/ui/PartnerCabinetBanner.tsx` |
| `partners-hub-btn-login`                                  | `src/pages/PartnerHubPage/ui/PartnerHubPage.tsx`    |
| `partners-hub-btn-open-cabinet-{kind}-{entity-id}`        | `src/pages/PartnerHubPage/ui/PartnerHubPage.tsx`    |
| `partners-hub-card-{kind}-{entity-id}`                    | `src/pages/PartnerHubPage/ui/PartnerHubPage.tsx`    |
| `partners-hub-error`                                      | `src/pages/PartnerHubPage/ui/PartnerHubPage.tsx`    |
| `partners-hub-item-feature-{kind}-{entity-id}-{feature}`  | `src/pages/PartnerHubPage/ui/PartnerHubPage.tsx`    |
| `partners-hub-link-cabinet-{kind}-{entity-id}`            | `src/pages/PartnerHubPage/ui/PartnerHubPage.tsx`    |
| `partners-hub-link-login`                                 | `src/pages/PartnerHubPage/ui/PartnerHubPage.tsx`    |
| `partners-hub-list`                                       | `src/pages/PartnerHubPage/ui/PartnerHubPage.tsx`    |
| `partners-hub-list-features-{kind}-{entity-id}`           | `src/pages/PartnerHubPage/ui/PartnerHubPage.tsx`    |
| `partners-hub-page`                                       | `src/pages/PartnerHubPage/ui/PartnerHubPage.tsx`    |
| `partners-hub-page-empty`                                 | `src/pages/PartnerHubPage/ui/PartnerHubPage.tsx`    |
| `partners-hub-text-cabinet-label-{kind}-{entity-id}`      | `src/pages/PartnerHubPage/ui/PartnerHubPage.tsx`    |
| `partners-hub-text-entity-name-{kind}-{entity-id}`        | `src/pages/PartnerHubPage/ui/PartnerHubPage.tsx`    |

### players

| Паттерн testId                                         | Файл                                                               |
|--------------------------------------------------------|--------------------------------------------------------------------|
| `players-player-card-badge-karma-{user-id}`            | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-badge-position-{user-id}`         | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-badge-sos-{user-id}`              | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-badge-verified-{user-id}`         | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-card-{user-id}`                   | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-cell-reliability-{user-id}`       | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-icon-avatar-{user-id}`            | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-img-avatar-{user-id}`             | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-img-team-logo-{user-id}`          | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-link-{user-id}`                   | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-panel-city-{user-id}`             | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-panel-cols-{user-id}`             | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-panel-meta-{user-id}`             | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-panel-portrait-{user-id}`         | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-panel-team-{user-id}`             | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-text-birth-{user-id}`             | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-text-city-{user-id}`              | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-text-city-label-{user-id}`        | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-text-height-{user-id}`            | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-text-index-{user-id}`             | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-text-name-{user-id}`              | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-text-number-{user-id}`            | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-text-reliability-label-{user-id}` | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-text-skill-{user-id}`             | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-text-team-{user-id}`              | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-text-team-label-{user-id}`        | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-card-text-weight-{user-id}`            | `src/widgets/PlayerCard/ui/PlayerCard.tsx`                         |
| `players-player-filters-checkbox-goalie-only`          | `src/features/players/ui/PlayerFilters.tsx`                        |
| `players-player-filters-checkbox-verified`             | `src/features/players/ui/PlayerFilters.tsx`                        |
| `players-player-filters-field-district`                | `src/features/players/ui/PlayerFilters.tsx`                        |
| `players-player-filters-select-city`                   | `src/features/players/ui/PlayerFilters.tsx`                        |
| `players-player-filters-select-position`               | `src/features/players/ui/PlayerFilters.tsx`                        |
| `players-player-filters-select-skill-level`            | `src/features/players/ui/PlayerFilters.tsx`                        |
| `players-player-filters-select-team`                   | `src/features/players/ui/PlayerFilters.tsx`                        |
| `players-player-teams-card-{player-id}`                | `src/features/players/ui/PlayerTeamsSection.tsx`                   |
| `players-player-teams-empty-{player-id}`               | `src/features/players/ui/PlayerTeamsSection.tsx`                   |
| `players-player-teams-error-{player-id}`               | `src/features/players/ui/PlayerTeamsSection.tsx`                   |
| `players-player-teams-link-{team-id}`                  | `src/features/players/ui/PlayerTeamsSection.tsx`                   |
| `players-player-teams-list-{player-id}`                | `src/features/players/ui/PlayerTeamsSection.tsx`                   |
| `players-player-teams-loader-{player-id}`              | `src/features/players/ui/PlayerTeamsSection.tsx`                   |
| `players-player-teams-row-{team-id}`                   | `src/features/players/ui/PlayerTeamsSection.tsx`                   |
| `players-player-teams-text-meta-{team-id}`             | `src/features/players/ui/PlayerTeamsSection.tsx`                   |
| `players-player-teams-text-name-{team-id}`             | `src/features/players/ui/PlayerTeamsSection.tsx`                   |
| `players-player-teams-text-title-{player-id}`          | `src/features/players/ui/PlayerTeamsSection.tsx`                   |
| `players-players-page-btn-reset`                       | `src/pages/PlayersPage/ui/PlayersPage.tsx`                         |
| `players-players-page-empty`                           | `src/pages/PlayersPage/ui/PlayersPage.tsx`                         |
| `players-players-page-error`                           | `src/pages/PlayersPage/ui/PlayersPage.tsx`                         |
| `players-players-page-item-{user-id}`                  | `src/pages/PlayersPage/ui/PlayersPage.tsx`                         |
| `players-players-page-list-cards`                      | `src/pages/PlayersPage/ui/PlayersPage.tsx`                         |
| `players-players-page-list-skeleton`                   | `src/pages/PlayersPage/ui/PlayersPage.tsx`                         |
| `players-players-page-loader`                          | `src/pages/PlayersPage/ui/PlayersPage.tsx`                         |
| `players-players-page-page`                            | `src/pages/PlayersPage/ui/PlayersPage.tsx`                         |
| `players-players-page-progress`                        | `src/pages/PlayersPage/ui/PlayersPage.tsx`                         |
| `players-public-info-card-{user-id}`                   | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-icon-team-fallback-{team-id}`     | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-img-team-logo-{team-id}`          | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-img-team-logo-{user-id}`          | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-item-{key}-{player-id}`           | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-item-achievement-{value}`         | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-item-history-{event-id}`          | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-link-team-{team-id}`              | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-list-achievements-{user-id}`      | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-list-contacts-{player-id}`        | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-list-history-{user-id}`           | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-list-teams-{user-id}`             | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-panel-achievements-{user-id}`     | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-panel-facts-{user-id}`            | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-panel-history-{user-id}`          | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-panel-team-{user-id}`             | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-panel-teams-{user-id}`            | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-{key}-{player-id}`           | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-bio-{user-id}`               | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-bio-empty-{user-id}`         | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-city-{user-id}`              | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-contacts-hidden-{user-id}`   | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-contacts-visible-{user-id}`  | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-history-date-{event-id}`     | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-history-event-{event-id}`    | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-history-title-{user-id}`     | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-role-{user-id}`              | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-skill-{user-id}`             | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-team-{user-id}`              | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-team-{value}`                | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-teams-empty-{user-id}`       | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-teams-loading-{user-id}`     | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-info-text-title-{user-id}`             | `src/features/players/ui/PlayerPublicInfoSection.tsx`              |
| `players-public-player-profile-card-calendar`          | `src/pages/PublicPlayerProfilePage/ui/PublicPlayerProfilePage.tsx` |
| `players-public-player-profile-card-hidden`            | `src/pages/PublicPlayerProfilePage/ui/PublicPlayerProfilePage.tsx` |
| `players-public-player-profile-card-history`           | `src/pages/PublicPlayerProfilePage/ui/PublicPlayerProfilePage.tsx` |
| `players-public-player-profile-card-not-found`         | `src/pages/PublicPlayerProfilePage/ui/PublicPlayerProfilePage.tsx` |
| `players-public-player-profile-empty-calendar`         | `src/pages/PublicPlayerProfilePage/ui/PublicPlayerProfilePage.tsx` |
| `players-public-player-profile-error`                  | `src/pages/PublicPlayerProfilePage/ui/PublicPlayerProfilePage.tsx` |
| `players-public-player-profile-loader`                 | `src/pages/PublicPlayerProfilePage/ui/PublicPlayerProfilePage.tsx` |
| `players-public-player-profile-page-{user-id}`         | `src/pages/PublicPlayerProfilePage/ui/PublicPlayerProfilePage.tsx` |
| `players-public-player-profile-panel-grid`             | `src/pages/PublicPlayerProfilePage/ui/PublicPlayerProfilePage.tsx` |
| `players-public-player-profile-section-calendar`       | `src/pages/PublicPlayerProfilePage/ui/PublicPlayerProfilePage.tsx` |
| `players-public-player-profile-text-history-title`     | `src/pages/PublicPlayerProfilePage/ui/PublicPlayerProfilePage.tsx` |

### profile

| Паттерн testId                                                         | Файл                                                      |
|------------------------------------------------------------------------|-----------------------------------------------------------|
| `profile-avatar-editor-btn-apply`                                      | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-btn-cancel`                                     | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-btn-remove`                                     | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-btn-upload`                                     | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-dialog`                                         | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-field-file`                                     | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-footer`                                         | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-icon-preview`                                   | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-img-preview`                                    | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-panel`                                          | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-panel-stage`                                    | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-panel-zoom`                                     | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-slider-zoom`                                    | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-text-crop-error`                                | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-text-dialog-title`                              | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-text-error`                                     | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-avatar-editor-text-hint`                                      | `src/features/profile/ui/ProfileAvatarEditor.tsx`         |
| `profile-coach-profile-panel-badge-version`                            | `src/features/profile/ui/CoachProfilePanel.tsx`           |
| `profile-coach-profile-panel-btn-messenger`                            | `src/features/profile/ui/CoachProfilePanel.tsx`           |
| `profile-coach-profile-panel-btn-teams`                                | `src/features/profile/ui/CoachProfilePanel.tsx`           |
| `profile-coach-profile-panel-card`                                     | `src/features/profile/ui/CoachProfilePanel.tsx`           |
| `profile-coach-profile-panel-link-{route-to-test-slug}`                | `src/features/profile/ui/CoachProfilePanel.tsx`           |
| `profile-coach-profile-panel-text-description`                         | `src/features/profile/ui/CoachProfilePanel.tsx`           |
| `profile-coach-profile-panel-text-title`                               | `src/features/profile/ui/CoachProfilePanel.tsx`           |
| `profile-hockey-profile-form-btn-retry`                                | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-hockey-profile-form-card-error`                               | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-hockey-profile-form-loader-profile`                           | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-hockey-profile-form-loader-session`                           | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-hockey-profile-form-text-error`                               | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-hockey-profile-form-text-error-detail`                        | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-participation-history-badge-status-{event-id}`                | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-btn-chat-{event-id}`                    | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-btn-invite-{event-id}`                  | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-btn-toggle-{event-id}`                  | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-empty`                                  | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-item-{event-id}`                        | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-list`                                   | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-panel-actions-{event-id}`               | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-panel-details-{event-id}`               | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-text-arena-{event-id}`                  | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-text-date-{event-id}`                   | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-text-event-{event-id}`                  | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-text-hidden`                            | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-text-note-{event-id}`                   | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-text-opponent-{event-id}`               | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-text-result-{event-id}`                 | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-text-role-{event-id}`                   | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-text-time-{event-id}`                   | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-participation-history-text-type-{event-id}`                   | `src/features/profile/ui/ParticipationHistorySection.tsx` |
| `profile-profile-about-section-btn-cancel`                             | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-btn-edit`                               | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-btn-public-view`                        | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-btn-save`                               | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-btn-verify`                             | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-card`                                   | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-card-calendar`                          | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-card-history`                           | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-cell-goalie-score`                      | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-field-bio`                              | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-field-bio-input`                        | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-field-birth-date`                       | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-field-city`                             | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-field-email`                            | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-field-full-name`                        | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-field-height`                           | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-field-max`                              | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-field-phone`                            | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-field-telegram`                         | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-field-weight`                           | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-footer`                                 | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-panel-goalie`                           | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-panel-goalie-score`                     | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-panel-grid`                             | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-panel-karma`                            | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-panel-owner-actions`                    | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-section-calendar`                       | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-select-index`                           | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-select-position`                        | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-select-skill-level`                     | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-select-stick-hand`                      | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-text-bio-label`                         | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-text-birth-date-label`                  | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-text-contacts-consent`                  | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-text-contacts-hint`                     | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-text-goalie-hint`                       | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-text-goalie-score-label`                | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-text-goalie-title`                      | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-text-history-title`                     | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-text-save-error`                        | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-about-section-text-title`                             | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-hub-page`                                             | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-hub-panel-{active-section}`                           | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-hub-panel-toolbar`                                    | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-hub-tabs-tab-about`                                   | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-hub-tabs-tab-favorites`                               | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-hub-tabs-tab-list`                                    | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-hub-tabs-tab-settings`                                | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-hub-tabs-tab-subscription`                            | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-btn-save`                             | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-card`                                 | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-checkbox-pdn-consent`                 | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-panel-{value}`                        | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-panel-consent`                        | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-panel-contacts`                       | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-panel-fields`                         | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-select-{value}`                       | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-select-profile-visibility`            | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-text-{value}`                         | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-text-consent-hint`                    | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-text-consent-label`                   | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-text-contacts-hint`                   | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-text-contacts-title`                  | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-text-fields-title`                    | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-text-hint`                            | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-text-save-error`                      | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-privacy-section-text-title`                           | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-role-badges-badge-{role}`                             | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-role-badges-list`                                     | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-settings-section-btn-save`                            | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-card`                                | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-panel-stack`                         | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-text-email-label`                    | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-text-event-reminders-label`          | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-text-goalkeeper-sos-label`           | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-text-in-app-label`                   | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-text-max-messenger-label`            | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-text-push-label`                     | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-text-save-error`                     | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-text-team-events-label`              | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-text-title`                          | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-toggle-email`                        | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-toggle-email-switch`                 | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-toggle-event-reminders`              | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-toggle-event-reminders-switch`       | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-toggle-goalkeeper-sos`               | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-toggle-goalkeeper-sos-switch`        | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-toggle-in-app`                       | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-toggle-in-app-switch`                | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-toggle-max-messenger`                | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-toggle-max-messenger-switch`         | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-toggle-push`                         | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-toggle-push-switch`                  | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-toggle-team-events`                  | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-settings-section-toggle-team-events-switch`           | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-subscription-section-btn-plan-{plan-id}`              | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-subscription-section-btn-save`                        | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-subscription-section-card`                            | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-subscription-section-list-plans`                      | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-subscription-section-text-plan-description-{plan-id}` | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-subscription-section-text-plan-name-{plan-id}`        | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-subscription-section-text-title`                      | `src/pages/ProfilePage/ui/HockeyProfileForm.tsx`          |
| `profile-profile-summary-badge-verification`                           | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-summary-btn-details`                                  | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-summary-btn-public-view`                              | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-summary-card`                                         | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-summary-icon-avatar`                                  | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-summary-link-public-view`                             | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-summary-panel-events-stat`                            | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-summary-panel-metrics`                                | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-summary-text-bio`                                     | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-summary-text-events-count`                            | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-summary-text-events-label`                            | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-summary-text-full-name`                               | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-summary-text-hockey-id`                               | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-summary-text-location`                                | `src/features/profile/ui/ProfileSummaryCard.tsx`          |
| `profile-profile-summary-text-role-line`                               | `src/features/profile/ui/ProfileSummaryCard.tsx`          |

### radar

| Паттерн testId                                                 | Файл                                                |
|----------------------------------------------------------------|-----------------------------------------------------|
| `radar-decline-reason-btn-{reason-id}`                         | `src/features/radar/ui/DeclineReasonField.tsx`      |
| `radar-decline-reason-btn-cancel`                              | `src/features/radar/ui/DeclineReasonField.tsx`      |
| `radar-decline-reason-btn-confirm`                             | `src/features/radar/ui/DeclineReasonField.tsx`      |
| `radar-decline-reason-field-custom`                            | `src/features/radar/ui/DeclineReasonField.tsx`      |
| `radar-decline-reason-list-options`                            | `src/features/radar/ui/DeclineReasonField.tsx`      |
| `radar-decline-reason-panel`                                   | `src/features/radar/ui/DeclineReasonField.tsx`      |
| `radar-decline-reason-text-hint`                               | `src/features/radar/ui/DeclineReasonField.tsx`      |
| `radar-league-rsvp-card-{event-id}`                            | `src/features/radar/ui/LeagueGameRsvp.tsx`          |
| `radar-league-rsvp-panel-cta-{event-id}`                       | `src/features/radar/ui/LeagueGameRsvp.tsx`          |
| `radar-league-rsvp-text-arena-{event-id}`                      | `src/features/radar/ui/LeagueGameRsvp.tsx`          |
| `radar-league-rsvp-text-datetime-{event-id}`                   | `src/features/radar/ui/LeagueGameRsvp.tsx`          |
| `radar-league-rsvp-text-league-{event-id}`                     | `src/features/radar/ui/LeagueGameRsvp.tsx`          |
| `radar-league-rsvp-text-matchup-{event-id}`                    | `src/features/radar/ui/LeagueGameRsvp.tsx`          |
| `radar-league-rsvp-text-title-{event-id}`                      | `src/features/radar/ui/LeagueGameRsvp.tsx`          |
| `radar-recommendation-card-badge-priority-{recommendation-id}` | `src/features/radar/ui/RadarRecommendationCard.tsx` |
| `radar-recommendation-card-badge-type-{recommendation-id}`     | `src/features/radar/ui/RadarRecommendationCard.tsx` |
| `radar-recommendation-card-btn-dismiss-{recommendation-id}`    | `src/features/radar/ui/RadarRecommendationCard.tsx` |
| `radar-recommendation-card-btn-navigate-{recommendation-id}`   | `src/features/radar/ui/RadarRecommendationCard.tsx` |
| `radar-recommendation-card-card-{recommendation-id}`           | `src/features/radar/ui/RadarRecommendationCard.tsx` |
| `radar-recommendation-card-panel-cta-{recommendation-id}`      | `src/features/radar/ui/RadarRecommendationCard.tsx` |
| `radar-recommendation-card-panel-head-{recommendation-id}`     | `src/features/radar/ui/RadarRecommendationCard.tsx` |
| `radar-recommendation-card-panel-meta-{recommendation-id}`     | `src/features/radar/ui/RadarRecommendationCard.tsx` |
| `radar-recommendation-card-text-district-{recommendation-id}`  | `src/features/radar/ui/RadarRecommendationCard.tsx` |
| `radar-recommendation-card-text-reason-{recommendation-id}`    | `src/features/radar/ui/RadarRecommendationCard.tsx` |
| `radar-recommendation-card-text-time-{recommendation-id}`      | `src/features/radar/ui/RadarRecommendationCard.tsx` |
| `radar-recommendation-card-text-title-{recommendation-id}`     | `src/features/radar/ui/RadarRecommendationCard.tsx` |
| `radar-team-rsvp-card-{event-id}`                              | `src/features/radar/ui/TeamRsvpList.tsx`            |
| `radar-team-rsvp-item-{user-id}-{event-id}`                    | `src/features/radar/ui/TeamRsvpList.tsx`            |
| `radar-team-rsvp-list-{position}-{event-id}`                   | `src/features/radar/ui/TeamRsvpList.tsx`            |
| `radar-team-rsvp-panel-{position}-{event-id}`                  | `src/features/radar/ui/TeamRsvpList.tsx`            |
| `radar-team-rsvp-response-btn-confirm-{event-id}`              | `src/features/radar/ui/TeamRsvpResponseControl.tsx` |
| `radar-team-rsvp-response-btn-decline-{event-id}`              | `src/features/radar/ui/TeamRsvpResponseControl.tsx` |
| `radar-team-rsvp-response-list-actions-{event-id}`             | `src/features/radar/ui/TeamRsvpResponseControl.tsx` |
| `radar-team-rsvp-response-loader-{event-id}`                   | `src/features/radar/ui/TeamRsvpResponseControl.tsx` |
| `radar-team-rsvp-response-panel-{event-id}`                    | `src/features/radar/ui/TeamRsvpResponseControl.tsx` |
| `radar-team-rsvp-response-text-hint-{event-id}`                | `src/features/radar/ui/TeamRsvpResponseControl.tsx` |
| `radar-team-rsvp-response-text-status-{event-id}`              | `src/features/radar/ui/TeamRsvpResponseControl.tsx` |
| `radar-team-rsvp-text-group-title-{position}`                  | `src/features/radar/ui/TeamRsvpList.tsx`            |
| `radar-team-rsvp-text-name-{user-id}`                          | `src/features/radar/ui/TeamRsvpList.tsx`            |
| `radar-team-rsvp-text-status-{user-id}`                        | `src/features/radar/ui/TeamRsvpList.tsx`            |
| `radar-team-rsvp-text-title-{event-id}`                        | `src/features/radar/ui/TeamRsvpList.tsx`            |

### shared

| Паттерн testId                  | Файл                            |
|---------------------------------|---------------------------------|
| `shared-puck-3d-panel`          | `src/shared/ui/Puck3D.tsx`      |
| `shared-puck-3d-panel-fallback` | `src/shared/ui/Puck3D.tsx`      |
| `shared-puck-3d-text-fallback`  | `src/shared/ui/Puck3D.tsx`      |
| `shared-scroll-parallax-panel`  | `src/shared/ui/ScrollStory.tsx` |
| `shared-scroll-reveal-panel`    | `src/shared/ui/ScrollStory.tsx` |

### shops

| Паттерн testId                                                  | Файл                                                         |
|-----------------------------------------------------------------|--------------------------------------------------------------|
| `shops-{shop-id}-analytics-card-checkout-intents`               | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-card-ctr`                            | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-card-product-clicks`                 | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-card-profile-views`                  | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-item-{lead-id}`                      | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-list-leads`                          | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-list-stats`                          | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-loader`                              | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-panel`                               | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-text-checkout-intents-label`         | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-text-checkout-intents-value`         | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-text-ctr-label`                      | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-text-ctr-value`                      | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-text-lead-meta-{lead-id}`            | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-text-lead-type-{lead-id}`            | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-text-leads-title`                    | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-text-product-clicks-label`           | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-text-product-clicks-value`           | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-text-profile-views-label`            | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-text-profile-views-value`            | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-text-title`                          | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-analytics-text-top-summary`                    | `src/features/shops/ui/ShopAnalyticsPanel.tsx`               |
| `shops-{shop-id}-dashboard-badge-profile`                       | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-btn-back`                            | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-btn-back-empty`                      | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-btn-login`                           | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-btn-save-profile`                    | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-empty`                               | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-error`                               | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-field-delivery`                      | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-field-description`                   | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-field-email`                         | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-field-phone`                         | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-field-pickup`                        | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-form-profile`                        | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-link-back`                           | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-link-back-empty`                     | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-link-login`                          | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-loader`                              | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-nav`                                 | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-page`                                | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-panel-analytics`                     | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-panel-denied`                        | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-panel-import`                        | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-panel-products`                      | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-panel-promos`                        | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-tab-analytics`                       | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-tab-import`                          | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-tab-products`                        | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-tab-profile`                         | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-tab-promos`                          | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-text-denied`                         | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-text-moderation-status`              | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-text-profile-title`                  | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-dashboard-text-status-message`                 | `src/pages/ShopPartnerDashboard/ui/ShopPartnerDashboard.tsx` |
| `shops-{shop-id}-import-btn-api`                                | `src/features/shops/ui/ShopCatalogImportPanel.tsx`           |
| `shops-{shop-id}-import-btn-csv`                                | `src/features/shops/ui/ShopCatalogImportPanel.tsx`           |
| `shops-{shop-id}-import-btn-feed`                               | `src/features/shops/ui/ShopCatalogImportPanel.tsx`           |
| `shops-{shop-id}-import-nav`                                    | `src/features/shops/ui/ShopCatalogImportPanel.tsx`           |
| `shops-{shop-id}-import-panel`                                  | `src/features/shops/ui/ShopCatalogImportPanel.tsx`           |
| `shops-{shop-id}-import-panel-status`                           | `src/features/shops/ui/ShopCatalogImportPanel.tsx`           |
| `shops-{shop-id}-import-text-error`                             | `src/features/shops/ui/ShopCatalogImportPanel.tsx`           |
| `shops-{shop-id}-import-text-result`                            | `src/features/shops/ui/ShopCatalogImportPanel.tsx`           |
| `shops-{shop-id}-import-text-source`                            | `src/features/shops/ui/ShopCatalogImportPanel.tsx`           |
| `shops-{shop-id}-import-text-status`                            | `src/features/shops/ui/ShopCatalogImportPanel.tsx`           |
| `shops-{shop-id}-import-text-title`                             | `src/features/shops/ui/ShopCatalogImportPanel.tsx`           |
| `shops-{shop-id}-products-btn-add`                              | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-btn-toggle-availability-{product-id}` | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-cell-image-{product-id}`              | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-checkbox-position-{position}`         | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-field-category`                       | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-field-external-url`                   | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-field-image-url`                      | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-field-price`                          | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-field-title`                          | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-form`                                 | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-item-{product-id}`                    | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-list`                                 | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-panel`                                | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-select-availability`                  | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-select-level`                         | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-text-form-title`                      | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-text-hint`                            | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-text-meta-{product-id}`               | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-text-positions-label`                 | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-text-status-message`                  | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-text-title`                           | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-products-text-title-{product-id}`              | `src/features/shops/ui/ShopProductManager.tsx`               |
| `shops-{shop-id}-promos-btn-create`                             | `src/features/shops/ui/ShopPromoManager.tsx`                 |
| `shops-{shop-id}-promos-field-subtitle`                         | `src/features/shops/ui/ShopPromoManager.tsx`                 |
| `shops-{shop-id}-promos-field-title`                            | `src/features/shops/ui/ShopPromoManager.tsx`                 |
| `shops-{shop-id}-promos-form`                                   | `src/features/shops/ui/ShopPromoManager.tsx`                 |
| `shops-{shop-id}-promos-item-{promo-id}`                        | `src/features/shops/ui/ShopPromoManager.tsx`                 |
| `shops-{shop-id}-promos-list`                                   | `src/features/shops/ui/ShopPromoManager.tsx`                 |
| `shops-{shop-id}-promos-panel`                                  | `src/features/shops/ui/ShopPromoManager.tsx`                 |
| `shops-{shop-id}-promos-text-meta-{promo-id}`                   | `src/features/shops/ui/ShopPromoManager.tsx`                 |
| `shops-{shop-id}-promos-text-title`                             | `src/features/shops/ui/ShopPromoManager.tsx`                 |
| `shops-{shop-id}-promos-text-title-{promo-id}`                  | `src/features/shops/ui/ShopPromoManager.tsx`                 |
| `shops-checkout-modal-btn-cancel-{offer-id}`                    | `src/features/shops/ui/MockShopCheckoutModal.tsx`            |
| `shops-checkout-modal-btn-checkout-{offer-id}`                  | `src/features/shops/ui/MockShopCheckoutModal.tsx`            |
| `shops-checkout-modal-btn-confirm-{offer-id}`                   | `src/features/shops/ui/MockShopCheckoutModal.tsx`            |
| `shops-checkout-modal-panel-confirm-{offer-id}`                 | `src/features/shops/ui/MockShopCheckoutModal.tsx`            |
| `shops-checkout-modal-panel-result-{offer-id}`                  | `src/features/shops/ui/MockShopCheckoutModal.tsx`            |
| `shops-checkout-modal-text-hint-{offer-id}`                     | `src/features/shops/ui/MockShopCheckoutModal.tsx`            |
| `shops-checkout-modal-text-price-{offer-id}`                    | `src/features/shops/ui/MockShopCheckoutModal.tsx`            |
| `shops-checkout-modal-text-result-hint-{offer-id}`              | `src/features/shops/ui/MockShopCheckoutModal.tsx`            |
| `shops-checkout-modal-text-result-offer-{offer-id}`             | `src/features/shops/ui/MockShopCheckoutModal.tsx`            |
| `shops-checkout-modal-text-result-title-{offer-id}`             | `src/features/shops/ui/MockShopCheckoutModal.tsx`            |
| `shops-checkout-modal-text-title-{offer-id}`                    | `src/features/shops/ui/MockShopCheckoutModal.tsx`            |
| `shops-marketplace-card-badge-sale-{offer-id}`                  | `src/features/shops/ui/MarketplaceProductCard.tsx`           |
| `shops-marketplace-card-badge-stock-{offer-id}`                 | `src/features/shops/ui/MarketplaceProductCard.tsx`           |
| `shops-marketplace-card-badge-tier-{offer-id}`                  | `src/features/shops/ui/MarketplaceProductCard.tsx`           |
| `shops-marketplace-card-card-{offer-id}`                        | `src/features/shops/ui/MarketplaceProductCard.tsx`           |
| `shops-marketplace-card-cell-image-{offer-id}`                  | `src/features/shops/ui/MarketplaceProductCard.tsx`           |
| `shops-marketplace-card-cell-placeholder-{offer-id}`            | `src/features/shops/ui/MarketplaceProductCard.tsx`           |
| `shops-marketplace-card-text-meta-{offer-id}`                   | `src/features/shops/ui/MarketplaceProductCard.tsx`           |
| `shops-marketplace-card-text-price-{offer-id}`                  | `src/features/shops/ui/MarketplaceProductCard.tsx`           |
| `shops-marketplace-card-text-price-old-{offer-id}`              | `src/features/shops/ui/MarketplaceProductCard.tsx`           |
| `shops-marketplace-card-text-title-{offer-id}`                  | `src/features/shops/ui/MarketplaceProductCard.tsx`           |
| `shops-marketplace-empty`                                       | `src/pages/MarketplacePage/ui/MarketplacePage.tsx`           |
| `shops-marketplace-error`                                       | `src/pages/MarketplacePage/ui/MarketplacePage.tsx`           |
| `shops-marketplace-list`                                        | `src/pages/MarketplacePage/ui/MarketplacePage.tsx`           |
| `shops-marketplace-loader`                                      | `src/pages/MarketplacePage/ui/MarketplacePage.tsx`           |
| `shops-marketplace-page`                                        | `src/pages/MarketplacePage/ui/MarketplacePage.tsx`           |
| `shops-marketplace-select-position`                             | `src/pages/MarketplacePage/ui/MarketplacePage.tsx`           |
| `shops-marketplace-select-sort`                                 | `src/pages/MarketplacePage/ui/MarketplacePage.tsx`           |
| `shops-marketplace-strip-badge-tier-{shop-id}`                  | `src/features/shops/ui/MarketplaceShopStrip.tsx`             |
| `shops-marketplace-strip-btn-all`                               | `src/features/shops/ui/MarketplaceShopStrip.tsx`             |
| `shops-marketplace-strip-card-{shop-id}`                        | `src/features/shops/ui/MarketplaceShopStrip.tsx`             |
| `shops-marketplace-strip-list`                                  | `src/features/shops/ui/MarketplaceShopStrip.tsx`             |
| `shops-marketplace-strip-panel`                                 | `src/features/shops/ui/MarketplaceShopStrip.tsx`             |
| `shops-marketplace-strip-text-meta-{shop-id}`                   | `src/features/shops/ui/MarketplaceShopStrip.tsx`             |
| `shops-marketplace-strip-text-name-{shop-id}`                   | `src/features/shops/ui/MarketplaceShopStrip.tsx`             |
| `shops-marketplace-strip-text-promo-{shop-id}`                  | `src/features/shops/ui/MarketplaceShopStrip.tsx`             |
| `shops-marketplace-strip-text-subtitle`                         | `src/features/shops/ui/MarketplaceShopStrip.tsx`             |
| `shops-marketplace-strip-text-title`                            | `src/features/shops/ui/MarketplaceShopStrip.tsx`             |
| `shops-marketplace-text-empty-hint`                             | `src/pages/MarketplacePage/ui/MarketplacePage.tsx`           |
| `shops-marketplace-text-empty-title`                            | `src/pages/MarketplacePage/ui/MarketplacePage.tsx`           |
| `shops-marketplace-toggle-in-stock`                             | `src/pages/MarketplacePage/ui/MarketplacePage.tsx`           |
| `shops-portal-modal-btn-close-{shop-id}`                        | `src/features/shops/ui/MockShopPortalModal.tsx`              |
| `shops-portal-modal-panel-{shop-id}`                            | `src/features/shops/ui/MockShopPortalModal.tsx`              |
| `shops-portal-modal-text-categories-{shop-id}`                  | `src/features/shops/ui/MockShopPortalModal.tsx`              |
| `shops-portal-modal-text-city-{shop-id}`                        | `src/features/shops/ui/MockShopPortalModal.tsx`              |
| `shops-portal-modal-text-hint-{shop-id}`                        | `src/features/shops/ui/MockShopPortalModal.tsx`              |
| `shops-portal-modal-text-status-{shop-id}`                      | `src/features/shops/ui/MockShopPortalModal.tsx`              |
| `shops-product-link-btn-buy-{offer-id}`                         | `src/features/shops/ui/ExternalProductLink.tsx`              |
| `shops-product-offers-badge-availability-{offer-id}`            | `src/features/shops/ui/ProductOffersList.tsx`                |
| `shops-product-offers-card-{offer-id}`                          | `src/features/shops/ui/ProductOffersList.tsx`                |
| `shops-product-offers-empty`                                    | `src/features/shops/ui/ProductOffersList.tsx`                |
| `shops-product-offers-list`                                     | `src/features/shops/ui/ProductOffersList.tsx`                |
| `shops-product-offers-text-category-{offer-id}`                 | `src/features/shops/ui/ProductOffersList.tsx`                |
| `shops-product-offers-text-price-{offer-id}`                    | `src/features/shops/ui/ProductOffersList.tsx`                |
| `shops-product-offers-text-title-{offer-id}`                    | `src/features/shops/ui/ProductOffersList.tsx`                |
| `shops-profile-badge-category-{shop-id}-{cat}`                  | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-badge-profile-{shop-id}`                         | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-badge-promo-discount-{shop-id}-{promo-id}`       | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-btn-cabinet-{shop-id}`                           | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-btn-catalog-{shop-id}`                           | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-btn-website-{shop-id}`                           | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-card-promo-{shop-id}-{promo-id}`                 | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-link-cabinet-{shop-id}`                          | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-link-website-{shop-id}`                          | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-list-categories-{shop-id}`                       | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-list-promos-{shop-id}`                           | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-panel-{shop-id}`                                 | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-text-categories-label-{shop-id}`                 | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-text-city-{shop-id}`                             | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-text-city-label-{shop-id}`                       | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-text-description-{shop-id}`                      | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-text-name-{shop-id}`                             | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-text-promo-subtitle-{shop-id}-{promo-id}`        | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-text-promo-title-{shop-id}-{promo-id}`           | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-text-status-{shop-id}`                           | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-text-status-label-{shop-id}`                     | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-profile-text-title-{shop-id}`                            | `src/features/shops/ui/ShopProfilePanel.tsx`                 |
| `shops-shop-card-badge-profile-{shop-id}`                       | `src/features/shops/ui/ShopCard.tsx`                         |
| `shops-shop-card-badge-source-{shop-id}`                        | `src/features/shops/ui/ShopCard.tsx`                         |
| `shops-shop-card-badge-status-{shop-id}`                        | `src/features/shops/ui/ShopCard.tsx`                         |
| `shops-shop-card-btn-portal-{shop-id}`                          | `src/features/shops/ui/ShopCard.tsx`                         |
| `shops-shop-card-card-{shop-id}`                                | `src/features/shops/ui/ShopCard.tsx`                         |
| `shops-shop-card-text-categories-{shop-id}`                     | `src/features/shops/ui/ShopCard.tsx`                         |
| `shops-shop-card-text-city-{shop-id}`                           | `src/features/shops/ui/ShopCard.tsx`                         |
| `shops-shop-card-text-name-{shop-id}`                           | `src/features/shops/ui/ShopCard.tsx`                         |

### sos

| Паттерн testId                                    | Файл                                        |
|---------------------------------------------------|---------------------------------------------|
| `sos-feed-btn-create-sos`                         | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-feed-btn-respond-{request-id}`               | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-feed-btn-responses-{request-id}`             | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-feed-btn-retry`                              | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-feed-checkbox-goalie-only`                   | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-feed-empty`                                  | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-feed-error`                                  | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-feed-feed`                                   | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-feed-field-response-message-{request-id}`    | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-feed-link-create-sos`                        | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-feed-loader`                                 | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-feed-panel-actions-{request-id}`             | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-feed-table`                                  | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-feed-text-comment-{request-id}`              | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-feed-text-response-label-{request-id}`       | `src/features/sos/ui/SosFeed.tsx`           |
| `sos-page-card-feed`                              | `src/pages/SosPage/ui/SosPage.tsx`          |
| `sos-page-card-form`                              | `src/pages/SosPage/ui/SosPage.tsx`          |
| `sos-page-feed`                                   | `src/pages/SosPage/ui/SosPage.tsx`          |
| `sos-page-page`                                   | `src/pages/SosPage/ui/SosPage.tsx`          |
| `sos-page-panel-grid`                             | `src/pages/SosPage/ui/SosPage.tsx`          |
| `sos-page-text-feed-title`                        | `src/pages/SosPage/ui/SosPage.tsx`          |
| `sos-request-form-btn-submit`                     | `src/features/sos/ui/SosRequestForm.tsx`    |
| `sos-request-form-checkbox-goalkeeper-sos`        | `src/features/sos/ui/SosRequestForm.tsx`    |
| `sos-request-form-field-comment`                  | `src/features/sos/ui/SosRequestForm.tsx`    |
| `sos-request-form-field-comment-input`            | `src/features/sos/ui/SosRequestForm.tsx`    |
| `sos-request-form-field-district`                 | `src/features/sos/ui/SosRequestForm.tsx`    |
| `sos-request-form-field-price`                    | `src/features/sos/ui/SosRequestForm.tsx`    |
| `sos-request-form-form`                           | `src/features/sos/ui/SosRequestForm.tsx`    |
| `sos-request-form-select-event`                   | `src/features/sos/ui/SosRequestForm.tsx`    |
| `sos-request-form-select-position`                | `src/features/sos/ui/SosRequestForm.tsx`    |
| `sos-request-form-select-skill`                   | `src/features/sos/ui/SosRequestForm.tsx`    |
| `sos-request-form-text-comment-label`             | `src/features/sos/ui/SosRequestForm.tsx`    |
| `sos-request-form-text-title`                     | `src/features/sos/ui/SosRequestForm.tsx`    |
| `sos-response-review-btn-accept-{response-id}`    | `src/features/sos/ui/SosResponseReview.tsx` |
| `sos-response-review-btn-decline-{response-id}`   | `src/features/sos/ui/SosResponseReview.tsx` |
| `sos-response-review-btn-retry-{request-id}`      | `src/features/sos/ui/SosResponseReview.tsx` |
| `sos-response-review-card-{response-id}`          | `src/features/sos/ui/SosResponseReview.tsx` |
| `sos-response-review-empty-{request-id}`          | `src/features/sos/ui/SosResponseReview.tsx` |
| `sos-response-review-error-{request-id}`          | `src/features/sos/ui/SosResponseReview.tsx` |
| `sos-response-review-list-{request-id}`           | `src/features/sos/ui/SosResponseReview.tsx` |
| `sos-response-review-loader-{request-id}`         | `src/features/sos/ui/SosResponseReview.tsx` |
| `sos-response-review-panel-actions-{response-id}` | `src/features/sos/ui/SosResponseReview.tsx` |
| `sos-response-review-text-message-{response-id}`  | `src/features/sos/ui/SosResponseReview.tsx` |
| `sos-response-review-text-name-{response-id}`     | `src/features/sos/ui/SosResponseReview.tsx` |
| `sos-response-review-text-status-{response-id}`   | `src/features/sos/ui/SosResponseReview.tsx` |

### teams

| Паттерн testId                                                      | Файл                                               |
|---------------------------------------------------------------------|----------------------------------------------------|
| `teams-{test-id-prefix}-card-{user-id}`                             | `src/features/teams/ui/LineupRinkPreview.tsx`      |
| `teams-{test-id-prefix}-cell-{slot-id}`                             | `src/features/teams/ui/LineupRinkPreview.tsx`      |
| `teams-{test-id-prefix}-list-bench`                                 | `src/features/teams/ui/LineupRinkPreview.tsx`      |
| `teams-{test-id-prefix}-map`                                        | `src/features/teams/ui/LineupRinkPreview.tsx`      |
| `teams-{test-id-prefix}-panel`                                      | `src/features/teams/ui/LineupRinkPreview.tsx`      |
| `teams-{test-id-prefix}-panel-rink`                                 | `src/features/teams/ui/LineupRinkPreview.tsx`      |
| `teams-{test-id-prefix}-row-bench-{user-id}`                        | `src/features/teams/ui/LineupRinkPreview.tsx`      |
| `teams-{test-id-prefix}-row-unplaced-{user-id}`                     | `src/features/teams/ui/LineupRinkPreview.tsx`      |
| `teams-add-team-member-badge-invite-status-{invite-id}`             | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-btn-chat-{user-id}`                          | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-btn-invite-{user-id}`                        | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-btn-invite-email-{team-id}`                  | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-empty-search-{team-id}`                      | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-field-invite-email-{team-id}`                | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-field-search-{team-id}`                      | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-form-{team-id}`                              | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-item-invite-{invite-id}`                     | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-list-email-invites-{team-id}`                | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-list-player-invites-{team-id}`               | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-list-search-{team-id}`                       | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-loader-search-{team-id}`                     | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-row-invite-{invite-id}`                      | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-row-player-{user-id}`                        | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-text-email-invites-title-{team-id}`          | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-text-hint-{team-id}`                         | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-text-invite-hint-{team-id}`                  | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-text-invite-name-{invite-id}`                | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-text-invites-title-{team-id}`                | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-text-meta-{user-id}`                         | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-text-name-{user-id}`                         | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-add-team-member-text-status-{team-id}`                       | `src/features/teams/ui/AddTeamMember.tsx`          |
| `teams-card-badge-league-{team-id}`                                 | `src/features/teams/ui/TeamCard.tsx`               |
| `teams-card-badge-members-{team-id}`                                | `src/features/teams/ui/TeamCard.tsx`               |
| `teams-card-badge-skill-{team-id}`                                  | `src/features/teams/ui/TeamCard.tsx`               |
| `teams-card-card-{team-id}`                                         | `src/features/teams/ui/TeamCard.tsx`               |
| `teams-card-icon-crest-{team-id}`                                   | `src/features/teams/ui/TeamCard.tsx`               |
| `teams-card-img-logo-{team-id}`                                     | `src/features/teams/ui/TeamCard.tsx`               |
| `teams-card-panel-meta-{team-id}`                                   | `src/features/teams/ui/TeamCard.tsx`               |
| `teams-card-text-city-{team-id}`                                    | `src/features/teams/ui/TeamCard.tsx`               |
| `teams-card-text-description-{team-id}`                             | `src/features/teams/ui/TeamCard.tsx`               |
| `teams-card-text-name-{team-id}`                                    | `src/features/teams/ui/TeamCard.tsx`               |
| `teams-club-profile-panel-badge-phase-{team-id}`                    | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-badge-squad-team-{squad-id}`              | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-badge-staff-role-{user-id}`               | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-badge-team-id-{active-squad-id}`          | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-card-{team-id}`                           | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-item-squad-{squad-id}`                    | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-item-staff-{user-id}`                     | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-link-arena-{team-id}`                     | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-link-league-{team-id}`                    | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-list-squads-{team-id}`                    | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-list-staff-{team-id}`                     | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-panel-active-squad-{active-squad-id}`     | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-panel-club-info-{team-id}`                | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-panel-links-{team-id}`                    | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-panel-squads-{team-id}`                   | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-panel-staff-{team-id}`                    | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-tab-{squad-id}`                           | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-tab-list-{team-id}`                       | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-active-squad-meta-{active-squad-id}` | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-active-squad-name-{active-squad-id}` | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-arena-label-{team-id}`               | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-club-city-{team-id}`                 | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-club-description-{team-id}`          | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-club-name-{team-id}`                 | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-description-{team-id}`               | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-league-label-{team-id}`              | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-no-links-{team-id}`                  | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-no-team-id-{active-squad-id}`        | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-squad-meta-{squad-id}`               | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-squad-name-{squad-id}`               | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-squads-title-{team-id}`              | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-staff-name-{user-id}`                | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-staff-title-{team-id}`               | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-staff-user-{user-id}`                | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-club-profile-panel-text-title-{team-id}`                     | `src/features/teams/ui/ClubProfilePanel.tsx`       |
| `teams-contact-staff-btn-cancel`                                    | `src/features/teams/ui/ContactStaffModal.tsx`      |
| `teams-contact-staff-btn-submit`                                    | `src/features/teams/ui/ContactStaffModal.tsx`      |
| `teams-contact-staff-error`                                         | `src/features/teams/ui/ContactStaffModal.tsx`      |
| `teams-contact-staff-field-email`                                   | `src/features/teams/ui/ContactStaffModal.tsx`      |
| `teams-contact-staff-field-message`                                 | `src/features/teams/ui/ContactStaffModal.tsx`      |
| `teams-contact-staff-field-name`                                    | `src/features/teams/ui/ContactStaffModal.tsx`      |
| `teams-contact-staff-footer`                                        | `src/features/teams/ui/ContactStaffModal.tsx`      |
| `teams-contact-staff-header`                                        | `src/features/teams/ui/ContactStaffModal.tsx`      |
| `teams-contact-staff-modal`                                         | `src/features/teams/ui/ContactStaffModal.tsx`      |
| `teams-contact-staff-panel-form`                                    | `src/features/teams/ui/ContactStaffModal.tsx`      |
| `teams-contact-staff-text-message-label`                            | `src/features/teams/ui/ContactStaffModal.tsx`      |
| `teams-contact-staff-text-success`                                  | `src/features/teams/ui/ContactStaffModal.tsx`      |
| `teams-contact-staff-text-target`                                   | `src/features/teams/ui/ContactStaffModal.tsx`      |
| `teams-create-page-card-denied`                                     | `src/pages/CreateTeamPage/ui/CreateTeamPage.tsx`   |
| `teams-create-page-card-wizard`                                     | `src/pages/CreateTeamPage/ui/CreateTeamPage.tsx`   |
| `teams-create-page-page`                                            | `src/pages/CreateTeamPage/ui/CreateTeamPage.tsx`   |
| `teams-create-page-page-denied`                                     | `src/pages/CreateTeamPage/ui/CreateTeamPage.tsx`   |
| `teams-create-wizard-badge-step-{item-id}`                          | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-btn-back-chat`                                 | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-btn-back-look`                                 | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-btn-back-people`                               | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-btn-back-place`                                | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-btn-next-basics`                               | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-btn-next-look`                                 | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-btn-next-people`                               | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-btn-next-place`                                | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-btn-open-messenger`                            | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-btn-open-profile`                              | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-btn-submit`                                    | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-btn-to-catalog`                                | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-checkbox-coach-{user-id}`                      | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-checkbox-create-chat`                          | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-checkbox-player-{user-id}`                     | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-checkbox-public-chat`                          | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-error`                                         | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-field-city`                                    | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-field-description`                             | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-field-logo-file`                               | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-field-logo-url`                                | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-field-name`                                    | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-field-short-description`                       | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-form`                                          | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-img-logo-preview`                              | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-link-messenger`                                | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-link-profile`                                  | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-list-coaches`                                  | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-list-players`                                  | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-nav-steps`                                     | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-panel-basics`                                  | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-panel-chat`                                    | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-panel-done`                                    | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-panel-look`                                    | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-panel-people`                                  | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-panel-place`                                   | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-panel-summary`                                 | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-select-arena`                                  | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-select-league`                                 | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-select-skill`                                  | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-text-basics-hint`                              | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-text-chat-hint`                                | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-text-coaches-title`                            | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-text-description-label`                        | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-text-logo-file-label`                          | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-text-logo-hint`                                | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-text-look-hint`                                | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-text-people-hint`                              | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-text-place-hint`                               | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-text-players-title`                            | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-create-wizard-text-success`                                  | `src/features/teams/ui/TeamCreateWizard.tsx`       |
| `teams-fifa-card-badge-position-{user-id}`                          | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-btn-close-{user-id}`                               | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-btn-profile-{user-id}`                             | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-card-{user-id}`                                    | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-cell-{id}-{user-id}`                               | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-empty-{user-id}`                                   | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-footer-{user-id}`                                  | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-grid-stats-{user-id}`                              | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-img-photo-{user-id}`                               | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-link-profile-{user-id}`                            | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-loader-{user-id}`                                  | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-modal-{user-id}`                                   | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-text-dialog-title-{user-id}`                       | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-text-first-name-{user-id}`                         | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-text-last-name-{user-id}`                          | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-text-meta-{user-id}`                               | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-text-number-{user-id}`                             | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-fifa-card-text-ovr-{user-id}`                                | `src/features/teams/ui/FifaPlayerCardModal.tsx`    |
| `teams-lineup-studio-btn-apply-{item-id}`                           | `src/features/teams/ui/TeamLineupStudio.tsx`       |
| `teams-lineup-studio-btn-delete-{item-id}`                          | `src/features/teams/ui/TeamLineupStudio.tsx`       |
| `teams-lineup-studio-btn-save-template-{team-id}`                   | `src/features/teams/ui/TeamLineupStudio.tsx`       |
| `teams-lineup-studio-card-{team-id}`                                | `src/features/teams/ui/TeamLineupStudio.tsx`       |
| `teams-lineup-studio-field-template-name-{team-id}`                 | `src/features/teams/ui/TeamLineupStudio.tsx`       |
| `teams-lineup-studio-list-templates-{team-id}`                      | `src/features/teams/ui/TeamLineupStudio.tsx`       |
| `teams-lineup-studio-loader-{team-id}`                              | `src/features/teams/ui/TeamLineupStudio.tsx`       |
| `teams-lineup-studio-panel-templates-{team-id}`                     | `src/features/teams/ui/TeamLineupStudio.tsx`       |
| `teams-lineup-studio-row-template-{item-id}`                        | `src/features/teams/ui/TeamLineupStudio.tsx`       |
| `teams-lineup-studio-select-load-template-{team-id}`                | `src/features/teams/ui/TeamLineupStudio.tsx`       |
| `teams-lineup-studio-text-hint-{team-id}`                           | `src/features/teams/ui/TeamLineupStudio.tsx`       |
| `teams-lineup-studio-text-status-{team-id}`                         | `src/features/teams/ui/TeamLineupStudio.tsx`       |
| `teams-lineup-studio-text-title-{team-id}`                          | `src/features/teams/ui/TeamLineupStudio.tsx`       |
| `teams-profile-accordion-calendar-{team-id}`                        | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-accordion-info-{team-id}`                            | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-accordion-roster-{team-id}`                          | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-accordion-staff-{team-id}`                           | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-badge-league-{team-id}`                              | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-badge-roster-{team-id}`                              | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-badge-skill-{team-id}`                               | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-btn-club-cabinet-{team-id}`                          | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-btn-contact-staff-{team-id}`                         | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-card-not-found`                                      | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-card-sections-{team-id}`                             | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-empty-roster-{team-id}`                              | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-empty-staff-{team-id}`                               | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-error`                                               | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-icon-crest-{team-id}`                                | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-img-logo-{team-id}`                                  | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-link-club-cabinet-{team-id}`                         | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-link-player-{user-id}`                               | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-list-roster-{team-id}`                               | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-list-staff-{team-id}`                                | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-loader`                                              | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-page-{team-id}`                                      | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-page-not-found`                                      | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-panel-actions-{team-id}`                             | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-panel-hero-{team-id}`                                | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-panel-info-{team-id}`                                | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-panel-meta-{team-id}`                                | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-panel-sections-{team-id}`                            | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-row-roster-{user-id}`                                | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-row-staff-{user-id}`                                 | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-text-city-{team-id}`                                 | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-text-contact-hint-{team-id}`                         | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-text-description-{team-id}`                          | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-text-info-city-{team-id}`                            | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-text-info-club-{team-id}`                            | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-text-info-description-{team-id}`                     | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-text-info-level-{team-id}`                           | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-text-info-short-{team-id}`                           | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-text-player-meta-{user-id}`                          | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-text-player-name-{user-id}`                          | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-text-staff-name-{user-id}`                           | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-text-staff-role-{user-id}`                           | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-profile-text-title-{team-id}`                                | `src/pages/TeamProfilePage/ui/TeamProfilePage.tsx` |
| `teams-team-chats-panel-btn-create-channel-{team-id}`               | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-btn-create-chat-{team-id}`                  | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-btn-open-chat-{chat-id}`                    | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-btn-squad-filter-{team-id}`                 | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-empty-chats-{team-id}`                      | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-field-channel-tag-{team-id}`                | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-field-channel-title-{team-id}`              | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-field-chat-title-{team-id}`                 | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-link-chat-{chat-id}`                        | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-list-chats-{team-id}`                       | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-panel-{team-id}`                            | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-panel-create-{team-id}`                     | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-row-chat-{chat-id}`                         | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-text-chat-meta-{chat-id}`                   | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-text-chat-title-{chat-id}`                  | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-text-create-channel-title-{team-id}`        | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-text-create-chat-title-{team-id}`           | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-text-status-{team-id}`                      | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-chats-panel-text-title-{team-id}`                       | `src/features/teams/ui/TeamChatsPanel.tsx`         |
| `teams-team-control-center-badge-channels-{team-id}`                | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-badge-chats-{team-id}`                   | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-badge-roster-{team-id}`                  | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-btn-create-channel-{team-id}`            | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-btn-create-chat-{team-id}`               | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-btn-create-staff-channel-{team-id}`      | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-btn-open-chat-{chat-id}`                 | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-btn-squad-filter-{team-id}`              | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-empty-chats-{team-id}`                   | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-field-channel-tag-{team-id}`             | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-field-channel-title-{team-id}`           | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-field-chat-title-{team-id}`              | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-link-chat-{chat-id}`                     | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-panel-{team-id}`                         | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-panel-chats-list-{team-id}`              | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-panel-comms-{team-id}`                   | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-panel-create-channel-{team-id}`          | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-panel-create-chat-{team-id}`             | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-panel-permissions-{team-id}`             | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-row-chat-{chat-id}`                      | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-text-active-squad-{team-id}`             | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-text-chat-meta-{chat-id}`                | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-text-chat-title-{chat-id}`               | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-text-chats-title-{team-id}`              | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-text-create-channel-title-{team-id}`     | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-text-create-chat-title-{team-id}`        | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-text-permissions-hint-{team-id}`         | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-text-role-{team-id}`                     | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-text-status-{team-id}`                   | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-control-center-text-title-{team-id}`                    | `src/features/teams/ui/TeamControlCenter.tsx`      |
| `teams-team-crest-card-{crest-id}`                                  | `src/features/teams/ui/TeamCrest.tsx`              |
| `teams-team-crest-icon-{crest-id}`                                  | `src/features/teams/ui/TeamCrest.tsx`              |
| `teams-team-crest-img-logo-{crest-id}`                              | `src/features/teams/ui/TeamCrest.tsx`              |
| `teams-team-crest-text-meta-{crest-id}`                             | `src/features/teams/ui/TeamCrest.tsx`              |
| `teams-team-crest-text-name-{crest-id}`                             | `src/features/teams/ui/TeamCrest.tsx`              |
| `teams-team-filters-field-city`                                     | `src/features/teams/ui/TeamFilters.tsx`            |
| `teams-team-filters-select-league`                                  | `src/features/teams/ui/TeamFilters.tsx`            |
| `teams-team-filters-select-player`                                  | `src/features/teams/ui/TeamFilters.tsx`            |
| `teams-team-filters-select-skill`                                   | `src/features/teams/ui/TeamFilters.tsx`            |
| `teams-team-page-card-chats-{team-id}`                              | `src/pages/TeamPage/ui/TeamPage.tsx`               |
| `teams-team-page-card-roles-{team-id}`                              | `src/pages/TeamPage/ui/TeamPage.tsx`               |
| `teams-team-page-card-roster-{team-id}`                             | `src/pages/TeamPage/ui/TeamPage.tsx`               |
| `teams-team-page-content-{active-tab}-{team-id}`                    | `src/pages/TeamPage/ui/TeamPage.tsx`               |
| `teams-team-page-panel-{team-id}`                                   | `src/pages/TeamPage/ui/TeamPage.tsx`               |
| `teams-team-page-tab-{tab-id}-{team-id}`                            | `src/pages/TeamPage/ui/TeamPage.tsx`               |
| `teams-team-page-tablist-{team-id}`                                 | `src/pages/TeamPage/ui/TeamPage.tsx`               |
| `teams-team-roles-panel-loader-{team-id}`                           | `src/features/teams/ui/TeamRolesPanel.tsx`         |
| `teams-team-roles-panel-panel-{team-id}`                            | `src/features/teams/ui/TeamRolesPanel.tsx`         |
| `teams-team-roles-panel-row-{user-id}`                              | `src/features/teams/ui/TeamRolesPanel.tsx`         |
| `teams-team-roles-panel-select-role-{user-id}`                      | `src/features/teams/ui/TeamRolesPanel.tsx`         |
| `teams-team-roles-panel-text-hint-{team-id}`                        | `src/features/teams/ui/TeamRolesPanel.tsx`         |
| `teams-team-roles-panel-text-name-{user-id}`                        | `src/features/teams/ui/TeamRolesPanel.tsx`         |
| `teams-team-roles-panel-text-position-{user-id}`                    | `src/features/teams/ui/TeamRolesPanel.tsx`         |
| `teams-team-roles-panel-text-role-{user-id}`                        | `src/features/teams/ui/TeamRolesPanel.tsx`         |
| `teams-team-roles-panel-text-title-{team-id}`                       | `src/features/teams/ui/TeamRolesPanel.tsx`         |
| `teams-team-roster-badge-position-{position}-{team-id}`             | `src/features/teams/ui/TeamRoster.tsx`             |
| `teams-team-roster-column-{position}-{team-id}`                     | `src/features/teams/ui/TeamRoster.tsx`             |
| `teams-team-roster-empty-{position}-{team-id}`                      | `src/features/teams/ui/TeamRoster.tsx`             |
| `teams-team-roster-link-player-{user-id}`                           | `src/features/teams/ui/TeamRoster.tsx`             |
| `teams-team-roster-loader-{team-id}`                                | `src/features/teams/ui/TeamRoster.tsx`             |
| `teams-team-roster-panel-{team-id}`                                 | `src/features/teams/ui/TeamRoster.tsx`             |
| `teams-team-roster-panel-badge-position-{position}-{team-id}`       | `src/features/teams/ui/TeamRosterPanel.tsx`        |
| `teams-team-roster-panel-empty-{position}-{team-id}`                | `src/features/teams/ui/TeamRosterPanel.tsx`        |
| `teams-team-roster-panel-loader-{team-id}`                          | `src/features/teams/ui/TeamRosterPanel.tsx`        |
| `teams-team-roster-panel-panel-{team-id}`                           | `src/features/teams/ui/TeamRosterPanel.tsx`        |
| `teams-team-roster-panel-row-{user-id}`                             | `src/features/teams/ui/TeamRosterPanel.tsx`        |
| `teams-team-roster-panel-section-{position}-{team-id}`              | `src/features/teams/ui/TeamRosterPanel.tsx`        |
| `teams-team-roster-panel-select-status-{user-id}`                   | `src/features/teams/ui/TeamRosterPanel.tsx`        |
| `teams-team-roster-panel-text-count-{team-id}`                      | `src/features/teams/ui/TeamRosterPanel.tsx`        |
| `teams-team-roster-panel-text-name-{user-id}`                       | `src/features/teams/ui/TeamRosterPanel.tsx`        |
| `teams-team-roster-panel-text-role-{user-id}`                       | `src/features/teams/ui/TeamRosterPanel.tsx`        |
| `teams-team-roster-panel-text-status-{user-id}`                     | `src/features/teams/ui/TeamRosterPanel.tsx`        |
| `teams-team-roster-panel-text-title-{team-id}`                      | `src/features/teams/ui/TeamRosterPanel.tsx`        |
| `teams-team-roster-row-{user-id}`                                   | `src/features/teams/ui/TeamRoster.tsx`             |
| `teams-team-roster-select-role-{user-id}`                           | `src/features/teams/ui/TeamRoster.tsx`             |
| `teams-team-roster-select-status-{user-id}`                         | `src/features/teams/ui/TeamRoster.tsx`             |
| `teams-team-roster-text-empty-slot-{position}-{team-id}`            | `src/features/teams/ui/TeamRoster.tsx`             |
| `teams-team-roster-text-name-{user-id}`                             | `src/features/teams/ui/TeamRoster.tsx`             |
| `teams-team-roster-text-role-hint-{team-id}`                        | `src/features/teams/ui/TeamRoster.tsx`             |
| `teams-team-roster-text-role-status-{user-id}`                      | `src/features/teams/ui/TeamRoster.tsx`             |
| `teams-teams-page-btn-create`                                       | `src/pages/TeamsPage/ui/TeamsPage.tsx`             |
| `teams-teams-page-btn-reset-empty`                                  | `src/pages/TeamsPage/ui/TeamsPage.tsx`             |
| `teams-teams-page-empty`                                            | `src/pages/TeamsPage/ui/TeamsPage.tsx`             |
| `teams-teams-page-error`                                            | `src/pages/TeamsPage/ui/TeamsPage.tsx`             |
| `teams-teams-page-item-{team-id}`                                   | `src/pages/TeamsPage/ui/TeamsPage.tsx`             |
| `teams-teams-page-link-create`                                      | `src/pages/TeamsPage/ui/TeamsPage.tsx`             |
| `teams-teams-page-loader`                                           | `src/pages/TeamsPage/ui/TeamsPage.tsx`             |
| `teams-teams-page-page`                                             | `src/pages/TeamsPage/ui/TeamsPage.tsx`             |
| `teams-teams-page-panel-feed`                                       | `src/pages/TeamsPage/ui/TeamsPage.tsx`             |
| `teams-training-lineup-board-btn-detail-bench-{member}`             | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-btn-detail-red-{member}`               | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-btn-detail-white-{member}`             | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-btn-save-{team-id}`                    | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-btn-save-preset-{team-id}`             | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-btn-template-{template-id}-{team-id}`  | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-card-{team-id}`                        | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-card-empty-{team-id}`                  | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-cell-rink-slot-{slot-id}`              | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-empty-rink-slot-{slot-id}`             | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-field-preset-name-{team-id}`           | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-item-player-card-{member}`             | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-list-backlog-{team-id}`                | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-list-bench-{team-id}`                  | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-loader-{team-id}`                      | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-map-{team-id}`                         | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-panel-player-actions-{member}`         | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-panel-presets-{team-id}`               | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-panel-rink-{team-id}`                  | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-panel-templates-{team-id}`             | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-panel-utility-{team-id}`               | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-row-backlog-{user-id}`                 | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-row-bench-{user-id}`                   | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-select-load-preset-{team-id}`          | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-text-backlog-title-{team-id}`          | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-text-bench-title-{team-id}`            | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-text-event-{team-id}`                  | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-text-no-events-{team-id}`              | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-text-player-name-{member}`             | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-text-squad-{team-id}`                  | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-text-templates-label-{team-id}`        | `src/features/teams/ui/TrainingLineupBoard.tsx`    |
| `teams-training-lineup-board-text-title-{team-id}`                  | `src/features/teams/ui/TrainingLineupBoard.tsx`    |

### {test-id-prefix}

| Паттерн testId                                                 | Файл                                                        |
|----------------------------------------------------------------|-------------------------------------------------------------|
| `{test-id-prefix}-{test-id-section}-btn-back`                  | `src/shared/ui/PageBackLink.tsx`                            |
| `{test-id-prefix}-{test-id-section}-btn-chip-{chip-id}`        | `src/shared/ui/CatalogFilterBar.tsx`                        |
| `{test-id-prefix}-{test-id-section}-btn-filters-toggle`        | `src/shared/ui/CatalogFilterBar.tsx`                        |
| `{test-id-prefix}-{test-id-section}-btn-reset-filters`         | `src/shared/ui/CatalogFilterBar.tsx`                        |
| `{test-id-prefix}-{test-id-section}-card-search`               | `src/shared/ui/CatalogFilterBar.tsx`                        |
| `{test-id-prefix}-{test-id-section}-field-search`              | `src/shared/ui/CatalogFilterBar.tsx`                        |
| `{test-id-prefix}-{test-id-section}-grid-filters`              | `src/shared/ui/CatalogFilterBar.tsx`                        |
| `{test-id-prefix}-{test-id-section}-header`                    | `src/shared/ui/PageHeader.tsx`                              |
| `{test-id-prefix}-{test-id-section}-nav-back`                  | `src/shared/ui/PageBackLink.tsx`                            |
| `{test-id-prefix}-{test-id-section}-panel-chips`               | `src/shared/ui/CatalogFilterBar.tsx`                        |
| `{test-id-prefix}-{test-id-section}-panel-filters`             | `src/shared/ui/CatalogFilterBar.tsx`                        |
| `{test-id-prefix}-{test-id-section}-panel-toolbar`             | `src/shared/ui/CatalogFilterBar.tsx`                        |
| `{test-id-prefix}-{test-id-section}-row-chips`                 | `src/shared/ui/CatalogFilterBar.tsx`                        |
| `{test-id-prefix}-{test-id-section}-row-meta`                  | `src/shared/ui/CatalogFilterBar.tsx`                        |
| `{test-id-prefix}-{test-id-section}-text-active-filters`       | `src/shared/ui/CatalogFilterBar.tsx`                        |
| `{test-id-prefix}-{test-id-section}-text-results`              | `src/shared/ui/CatalogFilterBar.tsx`                        |
| `{test-id-prefix}-{test-id-section}-text-subtitle`             | `src/shared/ui/PageHeader.tsx`                              |
| `{test-id-prefix}-{test-id-section}-text-title`                | `src/shared/ui/PageHeader.tsx`                              |
| `{test-id-prefix}-calendar-empty`                              | `src/features/teams/ui/TeamCalendarSection.tsx`             |
| `{test-id-prefix}-calendar-link-{event-id}`                    | `src/features/teams/ui/TeamCalendarSection.tsx`             |
| `{test-id-prefix}-calendar-list`                               | `src/features/teams/ui/TeamCalendarSection.tsx`             |
| `{test-id-prefix}-calendar-panel`                              | `src/features/teams/ui/TeamCalendarSection.tsx`             |
| `{test-id-prefix}-calendar-row-{event-id}`                     | `src/features/teams/ui/TeamCalendarSection.tsx`             |
| `{test-id-prefix}-calendar-text-meta-{event-id}`               | `src/features/teams/ui/TeamCalendarSection.tsx`             |
| `{test-id-prefix}-calendar-text-title-{event-id}`              | `src/features/teams/ui/TeamCalendarSection.tsx`             |
| `{test-id-prefix}-empty-net-icon`                              | `src/shared/ui/EmptyNetState.tsx`                           |
| `{test-id-prefix}-empty-net-panel`                             | `src/shared/ui/EmptyNetState.tsx`                           |
| `{test-id-prefix}-empty-net-text-copy`                         | `src/shared/ui/EmptyNetState.tsx`                           |
| `{test-id-prefix}-empty-net-text-title`                        | `src/shared/ui/EmptyNetState.tsx`                           |
| `{test-id-prefix}-entity-profile-badge-badge-{kind}`           | `src/shared/ui/EntityProfileBadge.tsx`                      |
| `{test-id-prefix}-ice-skeleton-loader-{i}`                     | `src/shared/ui/IceSkeleton.tsx`                             |
| `{test-id-prefix}-karma-hint-text`                             | `src/features/karma/ui/KarmaHint.tsx`                       |
| `{test-id-prefix}-karma-score-badge`                           | `src/features/karma/ui/KarmaScore.tsx`                      |
| `{test-id-prefix}-karma-score-text-value`                      | `src/features/karma/ui/KarmaScore.tsx`                      |
| `{test-id-prefix}-match-center-feed-badge-{type}-{row-id}`     | `src/shared/ui/MatchCenterFeed.tsx`                         |
| `{test-id-prefix}-match-center-feed-cell-actions-{row-id}`     | `src/shared/ui/MatchCenterFeed.tsx`                         |
| `{test-id-prefix}-match-center-feed-cell-time-{row-id}`        | `src/shared/ui/MatchCenterFeed.tsx`                         |
| `{test-id-prefix}-match-center-feed-header`                    | `src/shared/ui/MatchCenterFeed.tsx`                         |
| `{test-id-prefix}-match-center-feed-panel`                     | `src/shared/ui/MatchCenterFeed.tsx`                         |
| `{test-id-prefix}-match-center-feed-row-{row-id}`              | `src/shared/ui/MatchCenterFeed.tsx`                         |
| `{test-id-prefix}-match-center-feed-text-subtitle-{row-id}`    | `src/shared/ui/MatchCenterFeed.tsx`                         |
| `{test-id-prefix}-match-center-feed-text-title-{row-id}`       | `src/shared/ui/MatchCenterFeed.tsx`                         |
| `{test-id-prefix}-mock-external-flow-dialog-btn-close`         | `src/shared/ui/MockExternalFlowDialog.tsx`                  |
| `{test-id-prefix}-mock-external-flow-dialog-footer`            | `src/shared/ui/MockExternalFlowDialog.tsx`                  |
| `{test-id-prefix}-mock-external-flow-dialog-header`            | `src/shared/ui/MockExternalFlowDialog.tsx`                  |
| `{test-id-prefix}-mock-external-flow-dialog-modal`             | `src/shared/ui/MockExternalFlowDialog.tsx`                  |
| `{test-id-prefix}-mock-external-flow-dialog-panel-content`     | `src/shared/ui/MockExternalFlowDialog.tsx`                  |
| `{test-id-prefix}-mock-external-flow-dialog-text-description`  | `src/shared/ui/MockExternalFlowDialog.tsx`                  |
| `{test-id-prefix}-mock-external-flow-dialog-text-external-url` | `src/shared/ui/MockExternalFlowDialog.tsx`                  |
| `{test-id-prefix}-mock-external-flow-dialog-text-partner-name` | `src/shared/ui/MockExternalFlowDialog.tsx`                  |
| `{test-id-prefix}-page-btn-retry`                              | `src/shared/ui/QueryState.tsx`                              |
| `{test-id-prefix}-page-empty`                                  | `src/shared/ui/QueryState.tsx`                              |
| `{test-id-prefix}-page-error`                                  | `src/shared/ui/QueryState.tsx`                              |
| `{test-id-prefix}-page-loader`                                 | `src/shared/ui/QueryState.tsx`                              |
| `{test-id-prefix}-player-card-btn-favorite-{player-id}`        | `src/features/player-favorites/ui/PlayerFavoriteButton.tsx` |
| `{test-id-prefix}-player-card-text-favorite-error-{player-id}` | `src/features/player-favorites/ui/PlayerFavoriteButton.tsx` |
| `{test-id-prefix}-position-label-badge-{position}`             | `src/shared/ui/PositionLabel.tsx`                           |
| `{test-id-prefix}-query-error-btn-retry`                       | `src/shared/ui/QueryErrorState.tsx`                         |
| `{test-id-prefix}-query-error-error`                           | `src/shared/ui/QueryErrorState.tsx`                         |
| `{test-id-prefix}-rink-loader-loader`                          | `src/shared/ui/HockeyRinkLoader.tsx`                        |
| `{test-id-prefix}-rink-loader-panel-rink`                      | `src/shared/ui/HockeyRinkLoader.tsx`                        |
| `{test-id-prefix}-rink-loader-shape-puck`                      | `src/shared/ui/HockeyRinkLoader.tsx`                        |
| `{test-id-prefix}-rink-loader-shape-trail`                     | `src/shared/ui/HockeyRinkLoader.tsx`                        |
| `{test-id-prefix}-schedule-preview-btn-open`                   | `src/features/calendar/ui/CalendarScopePreview.tsx`         |
| `{test-id-prefix}-schedule-preview-empty`                      | `src/features/calendar/ui/CalendarScopePreview.tsx`         |
| `{test-id-prefix}-schedule-preview-empty-private`              | `src/features/calendar/ui/CalendarScopePreview.tsx`         |
| `{test-id-prefix}-schedule-preview-link-open`                  | `src/features/calendar/ui/CalendarScopePreview.tsx`         |
| `{test-id-prefix}-schedule-preview-list`                       | `src/features/calendar/ui/CalendarScopePreview.tsx`         |
| `{test-id-prefix}-schedule-preview-loader`                     | `src/features/calendar/ui/CalendarScopePreview.tsx`         |
| `{test-id-prefix}-schedule-preview-panel`                      | `src/features/calendar/ui/CalendarScopePreview.tsx`         |
| `{test-id-prefix}-schedule-preview-row-{event-id}`             | `src/features/calendar/ui/CalendarScopePreview.tsx`         |
| `{test-id-prefix}-schedule-preview-text-event-{event-id}`      | `src/features/calendar/ui/CalendarScopePreview.tsx`         |
| `{test-id-prefix}-schedule-preview-text-title`                 | `src/features/calendar/ui/CalendarScopePreview.tsx`         |
| `{test-id-prefix}-scoreboard-loader-loader`                    | `src/shared/ui/ScoreboardLoader.tsx`                        |
| `{test-id-prefix}-scoreboard-loader-text-ticker`               | `src/shared/ui/ScoreboardLoader.tsx`                        |
| `{test-id-prefix}-source-meta-badge-badge`                     | `src/shared/ui/SourceMetaBadge.tsx`                         |
| `{test-id-prefix}-verified-badge-badge-{entity-id}`            | `src/features/players/ui/VerifiedBadge.tsx`                 |

### {test-id-scope}

| Паттерн testId                                                       | Файл                              |
|----------------------------------------------------------------------|-----------------------------------|
| `{test-id-scope}-{test-id-component}-field-date-{test-id-qualifier}` | `src/shared/ui/DateTimeField.tsx` |
| `{test-id-scope}-{test-id-component}-field-time-{test-id-qualifier}` | `src/shared/ui/DateTimeField.tsx` |
| `{test-id-scope}-{test-id-component}-panel-{test-id-qualifier}`      | `src/shared/ui/DateTimeField.tsx` |
| `{test-id-scope}-{test-id-component}-text-label-{test-id-qualifier}` | `src/shared/ui/DateTimeField.tsx` |

---

*Сгенерировано · 2415 уникальных паттернов · 197 файлов*
