# Hockey Social — Frontend MVP (Phase 1 Mock UI)

## Стек

- React + TypeScript + Vite
- Gravity UI
- React Router
- TanStack Query
- Mock Service Worker (MSW)

## Требования

- **Node.js 22+** (см. `.nvmrc` в корне репозитория)
- **npm** (используем `package-lock.json` - lockfile коммитится в репозиторий)

## Первичная настройка

```bash
# из корня репозитория
nvm use          # или: nvm install

cd frontend
npm ci           # строго по lockfile; также установит husky pre-commit hooks
```

Создайте `frontend/.env.local` для локальной разработки **без бэкенда**:

```env
VITE_API_MODE=mock
VITE_BACKEND_URL=/api/v1
```

## Запуск

```bash
npm run dev      # http://localhost:5173
npm test         # unit/integration тесты (Vitest)
```

Откройте `http://localhost:5173/login` для mock-onboarding.

## Workflow разработчика

```
feature/HOCFRONT-XX → PR в develop → CI (quality) → merge → деплой на dev
                                              merge в preprod → деплой на qa
```

1. `git checkout -b feature/HOCFRONT-XX`
2. Разработка (`npm run dev`)
3. Перед коммитом/push - проверки (см. ниже)
4. `git commit` — husky автоматически запускает eslint + prettier на staged-файлах
5. `git push` → открыть PR в `develop`
6. Дождаться зелёного CI (job `quality`)

На PR **деплой не запускается**. Деплой - только при push в `develop` (dev) или `preprod` (qa).

## Проверки перед push (обязательно)

CI на PR запускает те же гейты. Чтобы не ловить падения в GitHub Actions, локально:

```bash
npm run format:check   # Prettier - проверка без записи
npm run lint           # ESLint
npm run typecheck      # TypeScript (app + tests + vite config)
npm test
npm run build
```

Быстрое исправление форматирования и линта:

```bash
npm run format         # Prettier - записать исправления
npm run lint:fix       # ESLint - автофикс
```

Или одной командой перед push:

```bash
npm run format && npm run lint:fix && npm run typecheck && npm test && npm run build
```

### Зависимости

- После изменения `package.json`: `npm install` → **закоммитить** обновлённый `package-lock.json`
- В CI всегда `npm ci` — если lockfile не синхронизирован, пайплайн упадёт
- `frontend/.npmrc` запрещает `legacy-peer-deps` — несовместимые peer deps должны решаться явно, а не игнорироваться

### Ограничения зависимостей (peer compatibility)

Некоторые пакеты **нельзя обновлять по отдельности** — у них жёсткие `peerDependencies`:

| Пакет                              | Сейчас | Ограничение                                               |
| ---------------------------------- | ------ | --------------------------------------------------------- |
| `eslint` + `@eslint/js`            | v9     | `eslint-plugin-jsx-a11y@6` поддерживает только eslint ≤ 9 |
| `lint-staged`                      | v15    | major обновлять вручную — влияет на husky pre-commit      |
| `eslint-plugin-simple-import-sort` | v12    | v13+ меняет порядок импортов (большой diff)               |

**Dependabot** (`.github/dependabot.yml`):

- major для этих пакетов **игнорируется**
- остальные dev-deps — отдельная группа
- ESLint-стек — отдельная группа (только minor/patch)

**Как обновить несовместимый стек вручную** (пример: переход на ESLint 10):

1. Проверить, что все eslint-плагины поддерживают новую major (`npm info <pkg> peerDependencies`)
2. Обновить пакеты **одним коммитом**: `eslint`, `@eslint/js`, плагины
3. `npm install` → `npm run lint && npm test && npm run build`
4. Убрать соответствующий `ignore` из `dependabot.yml`

**Проверка совместимости локально:**

```bash
npm ci          # упадёт на peer conflict — это ожидаемое поведение
npm ls eslint   # кто тянет eslint и какая версия
```

## Настройка IDE (IntelliJ IDEA / Cursor)

Чтобы не было расхождений с CI:

1. **Formatter:** Prettier (`esbenp.prettier-vscode`), не встроенный форматтер IDEA
2. **Format on save:** включить
3. **Node:** версия 22 (`.nvmrc`)
4. Если `@/` в тестах подсвечивается красным: `TypeScript: Restart TS Server`

Конфиг Prettier: `frontend/.prettierrc.json`

## Pre-commit (husky)

При `git commit` на staged-файлах автоматически:

- `*.{ts,tsx}` → `eslint --fix` + `prettier --write`
- `*.{json,css,scss,md}` → `prettier --write`

Hook срабатывает только на **добавленные в коммит** файлы. Если закоммитить без `git add` или обойти hook — CI всё равно проверит весь проект через `format:check`.

Переустановка hooks (если не сработали после `git clone`):

```bash
cd frontend && npm ci
```

## Реализованные SPEC

### Этап 1

- `SPEC-FR-1.2.1` — layout и навигация
- `SPEC-FR-1.2.2` — React + Gravity UI
- `SPEC-FR-1.2.3`, `SPEC-FR-12.1.1` — единый API client
- `SPEC-FR-2.1.1` - `SPEC-FR-2.1.3` — mock auth/onboarding
- `SPEC-FR-2.2.1` - `SPEC-FR-2.2.4` — Hockey ID
- `SPEC-FR-2.3.1`, `SPEC-FR-2.3.2` — игроки и фильтры
- `SPEC-FR-17.1.2` — галочка verified на карточке/странице игрока + фильтр verified-only
- `SPEC-FR-6.1.1` - `SPEC-FR-6.3.2` — катки, RinkCard, слоты

### Этап 2

- `SPEC-FR-3.1.1` - `SPEC-FR-3.2.2` — команды и roster
- `SPEC-FR-3.3.1`, `SPEC-FR-3.3.2` — посещаемость
- `SPEC-FR-4.1.1` - `SPEC-FR-4.3.2` — события, календарь, дефицит состава
- `SPEC-FR-5.1.1` - `SPEC-FR-5.2.3` — Goalkeeper SOS и отклики

### Этап 3

- `SPEC-FR-7.1.1` - `SPEC-FR-7.2.2` — лиги, таблицы, расписание
- `SPEC-FR-8.1.1` - `SPEC-FR-8.2.2` — post-game feedback и karma
- `SPEC-FR-9.1.1` - `SPEC-FR-9.2.2` — магазины и товарные предложения
- `SPEC-FR-10.1.1`, `SPEC-FR-10.1.2` — in-app уведомления
- `SPEC-FR-11.1.1` - `SPEC-FR-11.2.2` — admin prototype и статусы источников

### Mock external flows (исправление мёртвых CTA)

- `SPEC-FR-6.4.1`, `SPEC-FR-6.4.2` — запись на лёд через mock-мастер
- `SPEC-FR-7.1.3` — mock-портал лиги
- `SPEC-FR-9.1.3`, `SPEC-FR-9.2.3` — mock-сайт магазина и checkout

### QA (этап 1.9)

- `TASK-QA-01` — smoke-тесты mock API и UI (auth, profile, players, teams, events, SOS, arenas)
- `TASK-QA-02` — smoke-тесты лиг, feedback, notifications, shops, admin
- `spec-traceability.spec.ts` — проверка SPEC-FR ссылок в ключевых файлах

## Маршруты

- `/login` — onboarding
- `/profile` — Hockey ID (личный кабинет)
- `/players` — игроки
- `/players/:userId` — публичная страница игрока (календарь, команда, избранное)
- `/teams` — команды и состав
- `/events` — игры и тренировки
- `/calendar` — календарь
- `/sos` — Goalkeeper SOS
- `/arenas` — катки
- `/leagues` — любительские лиги
- `/feedback` — post-game feedback
- `/notifications` — уведомления
- `/shops` — магазины экипировки
- `/admin` — админка справочников

## Переключение на backend (Public API)

```env
VITE_API_MODE=backend
VITE_BACKEND_URL=/api/v1
```

В режиме `backend` на реальный API уходят только **Auth** и **Profile**.
Обязательно `VITE_BACKEND_URL=/api/v1` (same-origin): Vite проксирует `/api` →
`https://api.hockeynights.appard.tech`. Прямой абсолютный URL API в браузере
ломает CORS (`OPTIONS` → 501) и даёт в MSW `FetchEvent.respondWith / Load failed`.
Остальные домены (команды, события, …) пока обслуживает MSW.

Поддержано: регистрация, вход (+ код), verify-email, refresh, logout / logout-all,
сброс пароля, создание/обновление профиля, загрузка/удаление аватара.

На dev/qa стендах те же переменные задаются при сборке Docker-образа (GitHub Environment variables).
