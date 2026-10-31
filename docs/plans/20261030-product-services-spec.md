# Спека сервисов на 30.10.2026

Источник контракта — текущий фронт, не документы 12 и 13.

- Клиент: `frontend/src/entities/**/api/*.ts`
- MSW: `frontend/src/mocks/handlers/*.ts`
- Префикс мока `/mock-api/v1` на бэкенде становится `/api/v1`

Документы 12 и 13 описывают старый реестр FUNC. Если путь или статус там расходится с MSW, верен фронт. Ниже перечислены только ручки, которые фронт реально вызывает. Radar в роутере редиректит на `/events`, его MSW в поставку не входит.

База снята с `origin/dev` 30.10.2026. Локальные checkout на feature-ветках этой спекой не считаются.

Пути фронта: `/mock-api/v1/...` становится `/api/v1/...`. Наружу ходит только gateway.

## Общие правила

- Чужие таблицы не читаются. Сосед вызывается по gRPC. Отказ соседа — отказ операции.
- Ошибка наружу: `{ "error": { "code", "message", "request_id" } }`.
- Списки каталогов отдают массив, как ждёт текущий фронт. `limit` и `cursor` опциональны.
- Повтор создания, RSVP, сообщения и отклика принимает `Idempotency-Key`.
- Время в JSON — ISO-8601 с таймзоной.
- JWT проверяет gateway и сервис, у которого есть `JWT_PUBLIC_KEY`. Заголовок `X-User-Id` снаружи не заменяет токен.
- Письма идут auth outbox → notification `SendEmail` → SMTP. `hockey-mail-service` не возвращается.
- Оплата не принимает карту и не ходит в эквайринг. Публикация открытой тренировки зависит от `BILLING_MOCK_ACTIVATION_ENABLED`.

Вне этой поставки: Ice Radar (роут редиректит на `/events`), Госуслуги, Kafka, боевой эквайринг, WebSocket. Фронт сокет не открывает. Hockey IQ и highlights входят: у них есть страницы и MSW.

## Сводка

| Сервис | `origin/dev` | Сейчас | Доделать |
|---|---|---|---|
| contracts | `ba57f77` | proto ядра, арен, лиг, магазина, избранного | proto мессенджера не нужен: HTTP как у favorites |
| gateway | `6ff73a2` | auth, profile, billing, team, training, arena, league, shop, favorites | messenger, notifications, recruitment, admin |
| auth | `d54b9a2` | регистрация, коды, логин, refresh, logout, GetMe | сверить `/onboarding` и `/session/persona` с фронтом |
| profile | `b7f654e` | профиль, игроки, privacy, верификация-stub, аватар | карма и отзыв, если feedback остаётся здесь |
| team | `9d11b34` | команды, состав, роли, инвайты, клубы, доступ | не переписывать |
| training | `841fed7` | события, календарь, RSVP, черновики, лёд, billing | не переписывать |
| arena | `77675f7` | каталог, слоты, объявления, бронь, договорённости | не переписывать |
| league | `f8cf947` | каталог, таблица, расписание, CSV, заявки, посты | не переписывать |
| favorites | `899518f` | `/favorites` и `/players/favorites` в proto | сверить ещё `GET/PATCH /profile/favorites` |
| shop | `ac7f29b` | лента, магазины, товары, промо | кабинет: catalog-state, import, leads, analytics, checkout-intent |
| billing | `345171d` | планы, подписка, entitlements, mock-флаг | без эквайринга |
| notification | `0ec1f9e` | шаблоны и SMTP `SendEmail` | `GET /notifications`, `PATCH /notifications/{id}/read` |
| messenger | `33f5fb0` | `/healthz`, `/readyz`, Postgres в compose | ручки из `messenger.ts`, включая `POST .../messages` |
| recruitment | репозитория нет | фронт на MSW | новый сервис: SOS, отклики, окна, вратари |
| feedback | репозитория нет | фронт на MSW | отзыв и карма в profile |
| admin | репозитория нет | фронт на MSW | новый тонкий сервис поверх gRPC владельцев |
| integration | репозитория нет | CSV лиги уже в league | импорт остаётся у владельца данных |
| iq | репозитория нет | страница `/iq` и MSW | каталог тестов, попытка, лидерборд |
| highlights | репозитория нет | страница `/highlights` и MSW | список, карточка, создание, разметка, комментарий |
| mail | выведен | — | не поднимать |
| infra | `a66a9ee` | compose без Keycloak и mail, mock billing включён | порты новых сервисов |

## Чего фронт не вызывает

Эти пути были в документах 12 и 13. В MSW и клиентах их нет, бэкенд их не добавляет:

- WebSocket `/ws/v1`
- `GET /notifications/unread-count`
- `POST /messenger/chats/{id}/read`
- `POST /admin/sources/{id}/sync`
- принятие, отзыв и повтор инвайта (`AcceptInvite` на бэкенде уже есть, экрана под него нет)
- `PATCH /me/ice-agreements/{id}`
- Radar `/radar/recommendations` (страница редиректит на `/events`)

## Уже закрыто, сверить с путями фронта

Сервисы не пишутся заново. Прогон идёт по ручкам клиента.

**Auth** (`sessionApi.ts`, `session.ts`). Фронт зовёт `POST /auth/login`, `POST /login`, `POST /register`, `GET /session`, `POST /session/persona`, `POST /onboarding`, `POST /logout`. Коды и refresh живут в сервисе, отдельных MSW-ручек под них нет.

**Profile** (`profileApi.ts`, `playersApi.ts`). `GET/PUT /profile/me`, `GET /profile/settings`, `PATCH /profile/notification-preferences`, `PATCH /profile/privacy`, `POST /subscription-intents`, `POST /verification-requests`, `PATCH /verification-requests/{id}`, `GET /players`, `GET /players/{userId}`.

**Team** (`teamsApi.ts`). `GET/POST /teams`, `GET /teams/{id}`, состав, `PATCH` статуса, `PATCH` роли, `POST` участника, `GET/POST /teams/{id}/invites` только по email, `training-events`, `calendar`, `PUT` раскладки, `club-profile`, `POST staff-contact`.

**Training и клубы** (`eventsApi.ts`, `clubsApi.ts`). `GET/POST /events`, `PATCH /events/{id}`, `GET /calendar`, RSVP `GET/POST`, attendance, roster-status. Клуб: `GET/PATCH /clubs/{id}`, календарь, private-trainings, черновики submit/approve/reject/publish.

**Arena** (`arenasApi.ts`, `externalFlowsApi.ts`). Каталог, слоты, объявления. Заявки: `POST /ice-booking-requests`, список по арене, `PATCH` заявки, `GET /me/ice-agreements`.

**League** (`leaguesApi.ts`). Каталог, профиль, таблица, расписание, `POST /schedule-import`, сезоны, дивизионы, заявки, посты, аналитика.

**Favorites.** Три разных контракта, не один:

| Путь | Тело |
|---|---|
| `GET /favorites` | `{items}` |
| `POST /favorites` | `type`, `entityId`, `title`, ответ 201 |
| `DELETE /favorites/{id}` | 204 |
| `GET/PATCH /players/favorites` | `{playerIds}` |
| `GET/PATCH /profile/favorites` | `{actions}` |

**Billing.** Фронт ходит только в `POST /subscription-intents` и ждёт настройки профиля. Флаг `BILLING_MOCK_ACTIVATION_ENABLED` остаётся для публикации `public_open`. Карты нет.

## Shop — дыра кабинета

Уже есть `GET /marketplace`, `GET /shops`, `GET /product-offers`, профиль, товары, промо.

Нет, а фронт уже вызывает:

| Метод и путь | Правило |
|---|---|
| `GET /shops/{shopId}/catalog-state` | партнёр магазина |
| `POST /shops/{shopId}/catalog-import` | тело `{source: feed\|api\|csv}`, ответ `ShopCatalogImportJob` |
| `GET /shops/{shopId}/leads` | партнёр |
| `GET /shops/{shopId}/analytics` | партнёр, производные считаются в ответе |
| `POST /checkout-intents` | пишет лид и возвращает внешнюю ссылку магазина, без оплаты |

Чужой магазин на записи даёт 403. Повторный импорт того же магазина, пока первый не закончен, даёт 409.

## Notification — дыра ленты

Уже есть шаблоны и `SendEmail` в SMTP. Пустой успех без отправки не отдаётся: нет `SMTP_HOST` — ошибка доставки, не «отправлено».

Фронт вызывает:

| Метод и путь | Правило |
|---|---|
| `GET /notifications` | только записи текущего пользователя |
| `PATCH /notifications/{id}/read` | чужая запись — 404, ответ — объект уведомления |

Счётчика непрочитанных фронт не запрашивает. Бейдж считает элементы ленты сам.

In-app запись создаётся всегда. Email уходит только если в профиле включён канал и задан SMTP. Повтор того же `event_id` не создаёт вторую запись.

События, которые пишут ленту: инвайт, изменение состава, публикация тренировки, отклик SOS, заявка на лёд, заявка в лигу. Доставка — запись outbox в транзакции источника и воркер notification. Пока воркера нет, источник может вызвать gRPC `CreateNotification` в той же операции и откатить свою транзакцию, если notification отказал. Тихий пропуск запрещён.

## Messenger

Сервис на `33f5fb0` отвечает только health. В compose есть Postgres `hockey_messenger_service` и Mongo. Код читает `DATABASE_URL` Postgres и не открывает Mongo.

Решение: чаты живут в Postgres этого сервиса. Mongo в compose не используется продуктом. Это расхождение с разделом 16 документа 13, где указана Mongo. Отдельный движок ради спеки здесь медленнее и не нужен: миграции goose уже смотрят на Postgres.

Фронт ходит так (`frontend/src/entities/messenger/api/messengerApi.ts`):

| Метод и путь | Правило |
|---|---|
| `GET /messenger/chats` | чаты текущего пользователя, фильтр `teamId` |
| `GET /messenger/chats/discover?query` | публичные каналы |
| `POST /messenger/chats/{chatId}/open` | вступление в публичный канал, иначе 404 |
| `GET /messenger/users?query` | поиск через profile `BatchGetProfileSummaries`, не своя таблица пользователей |
| `POST /messenger/chats` | direct по `targetUserId` или канал по `type` и `title` |
| `PATCH /messenger/chats/{chatId}/pin` | только участник |
| `GET/POST .../topics` | пустой title — 400 |
| `GET .../messages?topicId` | только участник, иначе 403 |
| `POST .../messages` | тело `{content, topicId?}`, пустой текст — 400, не участник — 403, нет чата — 404, успех — 201 |
| `GET/PATCH .../settings` | настройки есть у канала, иначе 404 |
| `POST /messenger/messages/{messageId}/actions` | клиент `resolveMessageAction`, только адресат, повтор — 409 |
| `POST /messenger/actions/{actionId}` | есть в MSW, клиент его не зовёт; бэкенд отвечает тем же действием |

Кто читает и пишет:

| Тип | Читает | Пишет |
|---|---|---|
| `direct` | участники | участники |
| `team` | состав через team `CheckTeamAccess` | состав |
| `channel` public | любой вошедший | роль не ниже `publishMinRole` |
| `channel` team_members | состав команды | та же роль |
| `system` | адресат | только сервис |

Нет доступа — 403. Чужой чат не отличим от отсутствующего там, где это выдаёт существование: для настроек и сообщений достаточно 403/404 по правилу выше. Повтор direct на ту же пару возвращает уже созданный чат.

Отправка на странице идёт через `sendChatMessage`. После успеха сообщение лежит в MSW и читается повторным `GET`. Назначение на тренировку фронт не создаёт отдельной ручкой: он только жмёт `POST /messenger/messages/{id}/actions`. Карточку в ленту кладёт публикация черновика. Повтор по `(draft_id, user_id)` не создаёт вторую.

## Recruitment

Репозитория нет. Фронт уже вызывает оба набора.

Добор:

| Метод и путь | Правило |
|---|---|
| `GET/POST /recruitment-requests` | фильтр `goalieOnly=true`, автор видит свои |
| `GET/POST /recruitment-requests/{id}/responses` | отклик пишет не автор запроса |
| `PATCH /recruitment-responses/{id}` | принимает только автор запроса |

При `accepted` запрос становится `filled`, остальные отклики — `rejected`, вратарь пишется на событие через training. Отказ training откатывает принятие.

Окна и вратари:

| Метод и путь | Правило |
|---|---|
| `GET/POST /availability-windows` | только свои окна |
| `PATCH /availability-windows/{id}` | чужое окно — 404 |
| `GET/POST /goalie-requests` | `POST` по событию возвращает `{created: N}` |
| `PATCH /goalie-requests/{id}` | ответ вратаря |

Подбор: позиция goalie, окно пересекается с событием, район или радиус, уровень ±1. Сортировка по надёжности вратаря.

Сервис новый, Postgres, свой модуль. В training и team эти таблицы не кладутся.

## Feedback и карма

Отдельного репозитория нет. Карма — поле профиля. Отзыв хранится в profile, чтобы не заводить сервис ради двух ручек.

| Метод и путь | Правило |
|---|---|
| `POST /feedback` | событие прошло, оба были участниками, не сам себе, один отзыв на пару |
| `GET /players/{userId}/karma` | публичное число 0…100 |

Дельта одного отзыва: явка `confirmed/late/no_show` = +3/0/−5, навык `matched` = +1, поведение `positive/neutral/negative` = +2/0/−3. MSW на отказ отвечает 403, не 409. Бэкенд повторяет 403. Владелец данных — profile, отдельный feedback-service фронт не ждёт.

## Admin

Репозитория нет. Админ не пишет в чужие таблицы.

| Метод и путь | Куда идёт |
|---|---|
| `POST /admin/arenas` | arena `UpsertCatalog` |
| `POST /admin/leagues` | league `UpsertCatalog` |
| `POST /admin/shops` | shop, RPC создания ещё нет |
| `PATCH /admin/entities/{id}/visibility` | тело `{entityType, visible}`, 404 если сущности нет |
| `GET /admin/partner-moderation` | роль `admin`, иначе 403 |
| `PATCH /admin/partner-moderation/{id}` | тело `{status}`, id вида `kind:entityId`, чужой статус — 404 |
| `GET /admin/sources` | массив статусов, без ручки запуска синка |

Роль `admin` проверяется по JWT. Остальные получают 403.

Журнал скрытия хранится в admin: кто, когда, какая сущность. Это не лог процесса.

## Integration

Отдельный сервис не заводится. CSV расписания уже в league. Импорт каталога магазина делается в shop и отвечает в том же запросе. Параллельный импорт одного магазина — 409.

## Hockey IQ и highlights

Страницы `/iq` и `/highlights` живые. Контракт:

| Метод и путь | Ответ |
|---|---|
| `GET /iq-tests` | массив тестов |
| `GET /iq-tests/{testId}/questions` | вопросы этого теста |
| `POST /iq-attempts` | результат попытки |
| `GET /iq-leaderboard` | массив строк |
| `GET /highlights` | массив |
| `GET /highlights/{id}` | карточка с разметкой и комментариями |
| `POST /highlights` | созданный момент, без транскодинга |
| `POST /highlights/{id}/annotations` | разметка |
| `POST /highlights/{id}/comments` | комментарий |

Видео хранится как ссылка из тела запроса. Отдельный object storage в эту поставку не входит.

## Gateway и infra

Новые HTTP-сервисы (messenger, notification лента, recruitment, admin) проксируются так же, как favorites: один upstream, префикс `/api/v1`. gRPC остаётся у сервисов, которые уже на grpc-gateway.

Секреты остаются в `/opt/hockeynights/.env`. В git только `change-me-*`.

## Приёмка продукта

1. Регистрация создаёт профиль, письмо с кодом не притворяется отправленным без SMTP.
2. Игрок видит аренды, лиги, тренировки и магазин без лишней роли.
3. Капитан шлёт email-инвайт `POST /teams/{id}/invites` и видит его в `GET` того же пути.
4. Организатор публикует тренировку при mock-биллинге и получает отказ при выключенном флаге или молчащем billing.
5. Игрок пишет сообщение, обновляет страницу и видит его снова.
6. Адресат принимает назначение на тренировку один раз.
7. Вратарь откликается на SOS, капитан принимает отклик, игрок появляется в составе события.
8. Отзыв меняет карму в диапазоне 0…100 и не пишется второй раз.
9. Админ создаёт арену через arena, а не прямой записью в её БД.
10. Checkout магазина возвращает внешнюю ссылку и не принимает карту.
11. `GET /iq-tests` и `GET /highlights` отдают массивы, попытка теста возвращает результат.
