# План: доделать продукт

Источник путей — MSW и клиенты фронта. Спека: [20261030-product-services-spec.md](20261030-product-services-spec.md). Документы 12 и 13 не добавляют ручек, которых нет во фронте.

## Проблема

Игровой контур уже в `origin/dev`. Экраны фронта шире: мессенджер, лента, добор, отзыв, админка, кабинет магазина, Hockey IQ и highlights. Эти экраны ходят в MSW. Radar не делаем: роут редиректит на `/events`. Оплата остаётся заглушкой конфигурации.

Наблюдаемый результат: фронт с `VITE_API_MODE=backend` проходит сценарии из раздела «Приёмка» спеки. Карта и эквайринг не появляются.

## Границы

Входит каждый путь из `frontend/src/entities/**/api` и парного MSW, кроме radar.

Не входит: Ice Radar, Госуслуги, Kafka, эквайринг, `unread-count`, `POST /messenger/chats/{id}/read`, `POST /admin/sources/{id}/sync`, возврат mail и Keycloak, отдельный integration-service, повторное слияние уже влитых PR. WebSocket мессенджера входит: `GET /v1/messenger/ws`.

Решения, которые дальше не развилки:

- Чаты пишутся в Postgres messenger.
- Отзыв и карма живут в profile. Отказ — 403, как в MSW.
- Импорт каталога магазина принимает `{source: feed|api|csv}` и отвечает `ShopCatalogImportJob`.
- IQ и highlights живут в одном новом `hockey-content-service`. Фронт не различает процессы, два репозитория здесь только замедляют поставку.
- Recruitment и admin — отдельные репозитории: у них своя очередь и свои таблицы.
- Закрытие карточек GitHub не блокирует код.

## База

Код пишется от `origin/dev`, не от локальных feature-веток.

| Репозиторий | Ревизия |
|---|---|
| hockey-shared-contracts | `ba57f77` |
| hockey-api-gateway | `6ff73a2` |
| hockey-auth-service | `d54b9a2` |
| hockey-profile-service | `b7f654e` |
| hockey-team-service | `9d11b34` |
| hockey-training-service | `841fed7` |
| hockey-arena-service | `77675f7` |
| hockey-league-service | `f8cf947` |
| hockey-favorites-service | `899518f` |
| hockey-shop-service | `ac7f29b` |
| hockey-billing-service | `345171d` |
| hockey-notification-service | `0ec1f9e` |
| hockey-messenger-service | `33f5fb0` |
| hockey-infra | `a66a9ee` |

Грязные файлы `.github/`, `.DS_Store`, `scripts/ghcr-whoami.py`, `ci-templates/` в эти ветки не коммитятся.

## Задачи

Порядок обязателен: каждая задача оставляет gateway способным вызвать новый путь. Коммит и push — только по отдельной просьбе.

### Task 1: Ветки от origin/dev

Новых продуктовых файлов нет. В каждом репозитории из таблицы: `git fetch origin` и ветка от `origin/dev`.

- [ ] HEAD совпадает с ревизией таблицы
- [ ] Проверка: `git rev-parse --short HEAD` и пустой `git status --porcelain` по продуктовым файлам

### Task 2: Прогон уже готового контура

Сервисы: auth, profile, team, training, arena, league, favorites, billing. Файлы трогать только если запрос из спеки возвращает неверный статус.

Путь берётся из клиентов, не из FUNC. Обязательные сверки, которых нет в текущем gateway как отдельных путей:

- auth: `POST /auth/login`, `POST /login`, `POST /register`, `GET /session`, `POST /session/persona`, `POST /onboarding`, `POST /logout`
- favorites: `/favorites`, `/players/favorites`, `/profile/favorites` с телом `{actions}`
- team: email-инвайт `GET/POST /teams/{id}/invites` и `POST .../staff-contact`. Ручку принятия инвайта фронт не вызывает
- billing: фронт зовёт только `POST /subscription-intents`

Публичная тренировка при `BILLING_MOCK_ACTIVATION_ENABLED=true` создаётся. При `false` или остановленном billing — отказ.

- [x] Недостающий `/profile/favorites` добавлен (`GET/PATCH`, таблица `profile_shortcuts`, proxy gateway)
- [x] Таблица запрос / статус / тело записана в «Отклонения»
- [x] Проверка: `go test` затронутого пакета на compose-прогоне контура

### Task 3: Лента уведомлений

Файлы: `backend/hockey-notification-service/internal/usecase/notification/`, новый store рядом с template, proto `notification/v1/notification.proto`, gateway upstream, миграция `platform`/`public` в notification.

Сделать `CreateNotification`, `List`, `MarkRead`. `UnreadCount` не делать: фронт его не вызывает. Идемпотентность по `event_id`. Чужой id на чтении — 404. `SendEmail` не менять на пустой успех.

- [x] Повтор того же `event_id` не плодит строку (partial unique + `GetInAppByEvent` в repo)
- [x] Пользователь не видит чужую ленту (`List`/`MarkRead` по `user_id`)
- [x] Проверка: запрос списка через gateway на compose (локально: `go test ./...` в notification и gateway)
- [x] gRPC `CreateNotification` для других сервисов (`notification.proto`, `grpcapi/server_test.go`)

### Task 4: Мессенджер HTTP

Файлы: `backend/hockey-messenger-service/migrations/`, `internal/usecase/chat`, `internal/usecase/message`, `internal/http/router.go`, gateway proxy по образцу favorites.

Маршруты — список в спеке, включая `POST /messenger/chats/{chatId}/messages` с телом `{content, topicId?}`. Direct на ту же пару возвращает старый чат. Сообщение без членства — 403. Действие не адресата — 403, повтор — 409. `POST .../read` не добавлять.

Фронт уже шлёт сообщение через `sendChatMessage` в MSW. Бэкенд повторяет этот контракт. Кнопку и `data-testid` заново не ставить.

- [x] `POST .../messages` — 201, контракт `{content, topicId?}` (ручная проверка на compose)
- [x] Повтор direct — `direct_conversation_pairs`
- [x] `go test ./internal/usecase/chat/...`, `go build ./cmd/hockey-messenger-service`
- [x] `GET` после `POST` на compose

### Task 5: Назначение на тренировку

Файлы: training usecase публикации черновика, messenger usecase appointment, notification in-app internal.

Фронт создаёт карточку только через уже лежащее сообщение и `POST /messenger/messages/{messageId}/actions`. Публикация черновика кладёт это сообщение каждому игроку раскладки и пишет in-app запись. Сбой messenger или notification откатывает публикацию. Повтор по `(draft_id, user_id)` не создаёт второе сообщение.

- [x] Идемпотентность messenger: unique `(draft_id, target_user_id)` + SELECT перед INSERT
- [x] Отказ messenger → `RevertPublish`, статус `approved` (`training_draft_publish_test.go`)
- [x] Internal HTTP: `POST /v1/internal/training-appointments`, `POST /v1/internal/in-app-notifications` (service token)
- [x] RSVP/training sync при accept action (`POST /v1/internal/events/{id}/rsvp`, `rsvp_test.go`)
- [x] Повторный Publish после успеха (`TestTrainingDraftService_SecondPublishDoesNotDispatch`)

### Task 6: Кабинет магазина и намерение покупки

Файлы: `backend/hockey-shop-service/internal/usecase/`, миграции leads и import lock, proto shop, gateway.

Ручки: catalog-state, catalog-import, leads, analytics, `POST /checkout-intents`. Импорт принимает `{source}` и возвращает job. Замок на магазин, 409 при занятом замке. Checkout хранит лид и внешний URL, без полей карты.

- [x] Чужой партнёр получает 403 (`partner_catalog_test.go`)
- [x] Второй импорт до конца первого получает 409 (lock + running job)
- [x] Проверка: `go test ./internal/usecase/`

### Task 7: Добор и вратари

Новый репозиторий `hockey-recruitment-service` по каркасу сервиса с Postgres, chi и goose. Не вливать таблицы в training.

Файлы сервиса: `cmd/`, `internal/usecase/request`, `internal/usecase/availability`, `internal/http`, миграции. Плюс gateway и `hockey-infra` compose, порт не из уже занятых (`25056` notification, `25060` shop).

Принятие отклика вызывает training до коммита. Отказ training откатывает `filled`. `POST /goalie-requests` возвращает `{created: N}`.

- [x] Автор запроса не откликается сам себе (`request/service_test.go`)
- [x] Второй accepted не переводит уже filled запрос
- [x] Проверка: `go test ./internal/usecase/request/`

### Task 8: Отзыв и карма в profile

Файлы: `backend/hockey-profile-service/internal/usecase/profile/`, миграция feedback, proto profile, gateway.

`POST /feedback` проверяет участие через training. Повтор и отказ условий — 403, как MSW. Дельта по таблице спеки, итог режется в 0…100. `GET /players/{userId}/karma` отдаёт число.

- [x] Самому себе отзыв не пишется (`feedback_test.go`)
- [x] Два отзыва подряд не суммируют дельту дважды (unique + HasFeedback)
- [x] Проверка: `go test ./internal/usecase/profile/`

### Task 9: Админка

Новый `hockey-admin-service` с журналом видимости и очередью модерации. Запись арены, лиги и магазина — gRPC владельца. Для shop добавить RPC создания, его сейчас нет в proto.

`PATCH /admin/partner-moderation/{id}` принимает `{status}`. Комментарий фронт не шлёт, 400 за пустой комментарий не ставить. Роль не `admin` — 403. `GET /admin/sources` читает статус у league и shop. Ручки sync нет.

- [x] Скрытие пишет `changed_by_user_id` (`visibility_change_log` + `service_test.go`)
- [x] Падение arena на создании не оставляет строку audit (`CreateArena_Failure_NoAuditSideEffect`)
- [x] Проверка: `go test ./internal/usecase/admin/`

### Task 10: Hockey IQ и highlights

Новый `hockey-content-service`, HTTP, Postgres. Gateway проксирует `/iq-tests`, `/iq-attempts`, `/iq-leaderboard`, `/highlights` как favorites.

Контракт — таблица в спеке. `POST /highlights` сохраняет ссылку из тела. Транскодинг и бакет не поднимать. Попытка теста считает результат на сервере и пишет строку лидерборда.

- [x] Чужой `testId` на вопросах отдаёт пустой массив, не 500 (`iq/service_test.go`)
- [x] Повторная попытка не затирает чужой результат (leaderboard upsert по `user_id`)
- [x] Проверка: `go test ./internal/usecase/iq/...`

### Task 11: Сборка infra

Файлы: `backend/hockey-infra/docker-compose.yml`, `.env.example`, deploy env с плейсхолдерами `change-me-*`.

Добавить recruitment, admin и content. Messenger остаётся на своём Postgres. Mock billing не выключать. Mail и Keycloak не возвращать.

- [x] `docker compose config` проходит (локально)
- [x] Порты: recruitment `28093`, admin `28094`, content `28095`; gRPC notification `25056` / shop `25060` не тронуты

## Приёмка

Сценарии 1–11 из спеки. Команда на каждый изменённый модуль: `go test` его пакета.

Локальный compose поднят. `POST /auth/verify-email` создаёт профиль. SMTP пустой: `SendEmail` отвечает gRPC Internal, письмо не помечается отправленным.

## Прогресс

- [x] Фронт: `POST /messenger/chats/{chatId}/messages` в MSW и на странице
- [ ] Task 1 — рабочие деревья уже содержат HOCBACK-66, сброс на ревизии таблицы не делаем
- [x] Task 2 — алиасы сессии на gateway: `POST /login` и `POST /register` дают `{ok:true}`, `GET /session`, `POST /session/persona`, `POST /onboarding`, `POST /logout` отдают `Session`. `POST /subscription-intents` с `planId=player_plus` даёт 200 `mock_activated`
- [x] Task 3 — `GET /notifications` через gateway отвечает 200 и массив
- [x] Task 4 — `POST /messenger/chats/{id}/messages` → 201, следующий `GET` содержит `content`
- [x] Task 5 — compose: publish 200, повторный publish 409, accept назначения 200, повтор 409. Игрок есть в RSVP со статусом `confirmed`
- [x] Task 6 — `POST /shops/{id}/catalog-import` с `{source:csv}` даёт 200, job `partial`. `POST /checkout-intents` даёт 200, `externalUrl`, `mock_redirect`, без полей карты
- [x] Task 7 — отклик вратаря на SOS принят: 200. Вратарь есть в составе события
- [x] Task 8 — `POST /feedback` даёт 200, карма 50 → 56. Повтор даёт 403
- [x] Task 9 — `POST /admin/arenas` даёт 200. `GET /arenas` возвращает эту арену
- [x] Task 10 — `POST /iq-attempts` на `iq-test-001` даёт score 30 из 30. Списки по-прежнему 200
- [x] Task 11 — local compose поднят; deploy compose: recruitment, admin, content, `docker compose config` deploy проходит

Task 3 (inbox): миграция, usecase, JWT HTTP на `:8086`, прокси в gateway, env infra. Task 4 (messenger): миграция `000003`, usecase/chat, все MSW-маршруты под `/v1/messenger`, gateway proxy, profile HTTP для `/users`. Упрощено: membership без team gRPC. Compose не гоняли. MSW smoke-core для отправки сообщений — ранее.

## Отклонения

Фронт до этого плана писал исходящее сообщение только в кеш React Query. MSW такой ручки не имел. Добавлены `sendChatMessage`, handler и сохранение в `mockMessages`.

Первый прогон 2026-10-31 давал 401 на HTTP-сервисах: `JWT_PRIVATE_KEY` и `JWT_PUBLIC_KEY` в локальном `.env` не были парой. В `.env` записана новая пара Ed25519. Сервисы пересозданы без пересборки образов. Ключи в чат и в этот файл не копировались.

Повторный прогон, gateway `http://127.0.0.1:28080/v1`, после регистрации и `verify-email`. `GET /auth/me` — 200.

| Запрос | Статус | Тело |
|---|---|---|
| GET /notifications | 200 | `[]` |
| GET /messenger/chats | 200 | `[]` |
| POST /messenger/chats `type=channel` | 200 | чат с `id` |
| POST /messenger/chats/{id}/messages | 201 | `content` принят |
| GET /messenger/chats/{id}/messages | 200 | системное сообщение и `smoke-message` |
| POST /auth/login | 401 | `invalid email or password`. Вход идёт через `verify-email`, не через пароль |
| POST /login | 200 | `{ok:true}` для пароля зарегистрированного пользователя. Чужой email — 401 |
| POST /register | 200 | `{ok:true}` |
| GET /session | 200 | `Session` из `GET /auth/me` |
| POST /session/persona | 200 | `personaId=player`, имя и роль из набора персон |
| POST /onboarding | 200 | `displayName=Smoke`, `isOnboarded=true` |
| POST /logout | 200 | `Session` с `isOnboarded=false`. Токен auth при этом инвалидируется |
| GET /profile/favorites | 200 | `{"actions":[]}` |
| PATCH /profile/favorites | 200 | `actions` из объектов `{id,label,path}` |
| GET /favorites, GET /players/favorites | 200 | пустые списки |
| GET /teams | 200 | `{"items":[],"total":"0"}` |
| POST /subscription-intents `planId=player_plus` | 200 | `status=mock_activated` |
| GET /iq-tests, GET /highlights, GET /iq-leaderboard | 200 | тесты и таблица есть, highlights пустые |
| GET /arenas | 200 | `{"items":[]}`. gRPC `:50057` слушает каталог из `origin/dev` |
| GET /leagues | 200 | `{"items":[]}` |
| GET /events | 200 | `{"items":[],"total":"0"}` |
| GET /shops | 200 | `{"shops":[]}` |
| GET /marketplace | 200 | пустые `spotlightShops`, `listings`, `categories` |
| GET /admin/sources | 200 | `[]` |
| GET /recruitment-requests, GET /goalie-requests | 200 | `[]` |

Персона и onboarding лежат в памяти процесса gateway. Рестарт gateway их сбрасывает. `POST /logout` чистит запись и вызывает `POST /auth/logout`.

Каталог арен поднят из gRPC `origin/dev` вместе с миграциями `public.arenas`, слотов, объявлений и заявок. Admin HTTP на `public.arenas` сохранён.

`CreateNotification` есть в gRPC notification. Training по-прежнему пишет ленту через `POST /v1/internal/in-app-notifications`. `SendEmail` на пустом SMTP отвечает gRPC Internal, письмо не помечается отправленным.

Повторный Publish на compose отвечает 409 `invalid status transition`.

Приёмка 2026-10-31, скрипт `backend/hockey-infra/scripts/smoke-acceptance.sh`, gateway `http://127.0.0.1:28080/v1`.

| Сценарий | Статус | Тело |
|---|---|---|
| POST /register `{displayName}` и POST /auth/verify-email | 200 | `{"ok":true}`, затем GET /profile 200, `userId=01a19282-0485-741d-be9d-91ab25914efb`, имя «Иван Петров» |
| POST /teams/{id}/invites `{email}` и GET того же пути | 200 | тот же email в `invites` |
| POST /events `public_open` с `player_plus` | 200 | событие |
| POST /events без подписки | 403 | `paid_access_required` |
| POST /events при остановленном billing | 503 | `billing access unavailable`. Billing после проверки снова healthy |
| POST .../training-drafts/{id}/publish | 200 | `status=published`, `messageIds` |
| повторный publish | 409 | `invalid status transition` |
| POST /messenger/messages/{id}/actions `{action:accept}` | 200, повтор 409 | `confirmed`, затем `action already resolved`. Игрок в RSVP |
| PATCH /recruitment-responses/{id} `{status:accepted}` | 200 | вратарь в `training-lineup` |
| POST /feedback и повтор | 200, затем 403 | карма 50 → 56, второе тело `feedback already submitted` |
| POST /admin/arenas | 200 | id есть в GET /arenas |
| POST /checkout-intents `{offerId}` | 200 | `externalUrl`, `mock_redirect` |
| POST /iq-attempts | 200 | `score=30`, `maxScore=30` |

`POST /teams` без `clubId` создаёт клуб и пишет владельца в `club_admins`. Проверка `accept-org+1793459883@example.invalid`: команда `73c60035-81ec-4e59-b5b8-3a78e100725a`, клуб `e03ff20b-436f-402f-b288-ce9b10e9ef4b`. Черновик на этом клубе дал 200, publish 200. Если `clubId` передан, новый клуб не создаётся.

`POST /admin/shops` ставит владельцем пользователя из JWT. Импорт каталога этого магазина дал 200 без правки `owner_user_id`. Магазин `2de96a28-054b-4065-a398-619ec8dca666`, checkout 200.

Auth без `TEAM_SERVICE_TOKEN` отвечал 401 на `BatchUserExists`. Токен добавлен в local и deploy compose. Публикация больше не требует роль `coach` или `admin` в JWT: auth такие роли не выдаёт. Доступ остаётся на клубе и команде.

Лента не принимала тип `training_published`. Миграция `20261031180000` добавила его в check. Состав добора писал сторону `home`, а check состава знает только `red`, `white`, `bench`, `backlog`. Сторона теперь `red`.

`POST /feedback` и `GET /players/{id}/karma` идут на HTTP профиля через `PROFILE_HTTP_TARGET`.

Профиль создаёт gateway после успешного `POST /auth/verify-email`. `POST /register` принимает `displayName`, в auth уходит только email и пароль. Имя режется на имя и фамилию. Без имени профиль получает «Игрок Новый». Повтор при уже существующем профиле (409) не ломает ответ verify.

Проверка `named-1793459356@example.invalid`: register 200 `{"ok":true}`, verify 200, GET /profile 200, в `public.profiles` имя «Иван Петров». Без `displayName` у `profile-1793459109@example.invalid` имя «Игрок Новый», PUT /profile сменил его на «Иван Петров». В outbox оба письма: attempts 1 из 5, `failed_at` пустой, `last_error` — gRPC Internal. Письмо не помечено отправленным.

## Самопроверка

План сверен с `frontend/src/entities/**/api` и `frontend/src/mocks/handlers`. Ручки из документов 12 и 13, которых нет во фронте, из задач убраны: WebSocket, unread-count, read чата, sync источника, обязательный комментарий модерации, экран принятия инвайта.

IQ и highlights возвращены, потому что страницы и MSW есть. Radar оставлен снаружи: `AppRouter` редиректит его на `/events`. Независимый ревьюер план не смотрел. На этом прогоне скрипт приёмки прошёл без вставок в `clubs` и `shops`.
