/**
 * SPEC-UI-2 — единая панель поиска и фильтров каталогов.
 *
 * Один компонент на /events, /teams, /leagues, /arenas, /marketplace, /players:
 * поиск с дебаунсом, быстрые chips, строка состояния и раскрывающиеся фильтры.
 */

import {ChevronDown, Magnifier} from '@gravity-ui/icons'
import {Icon, Text, TextInput} from '@gravity-ui/uikit'
import {type ReactNode, useEffect, useId, useRef, useState} from 'react'

import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

/** Дебаунс поиска — один для всех каталогов, чтобы фильтрация не «дёргалась». */
const SEARCH_DEBOUNCE_MS = 250

/** Совпадает с mobile-брейкпоинтом мессенджера: на desktop фильтры открыты. */
const DESKTOP_FILTERS_QUERY = '(min-width: 769px)'

function isDesktopViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DESKTOP_FILTERS_QUERY).matches
}

/** Быстрый фильтр-таблетка над расширенными фильтрами. */
export interface CatalogFilterChip {
  id: string
  label: string
  active: boolean
}

export interface CatalogFilterBarProps {
  /** Первый сегмент data-testid, напр. `events` */
  testIdPrefix: string
  /** Второй сегмент data-testid, по умолчанию `page` */
  testIdSection?: string

  /** Текущее значение поиска (может приходить из URL). */
  searchValue: string
  /** Вызывается с дебаунсом `searchDebounceMs`, уже с trim. */
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  /** Доступное имя поля поиска — читается скринридером и используется в тестах. */
  searchLabel: string
  searchDebounceMs?: number

  chips?: readonly CatalogFilterChip[]
  onChipToggle?: (chipId: string) => void
  chipsLabel?: string

  /** Контролы расширенных фильтров: `CatalogFilterField`, Select, TextInput, Checkbox. */
  advanced?: ReactNode
  advancedTitle?: string
  /** По умолчанию открыто на desktop, свёрнуто на mobile (HOCFRONT-20). */
  advancedDefaultOpen?: boolean

  /** Вкладки/переключатели вида над поиском. */
  toolbar?: ReactNode

  /** Число найденных элементов — показывается в строке состояния. */
  resultsCount?: number
  /** Идёт загрузка/обновление результатов. */
  resultsPending?: boolean

  /** Количество активных фильтров: включает кнопку сброса. */
  activeCount?: number
  onReset?: () => void

  /** Панель прилипает к верху при скролле (лента маркета). */
  sticky?: boolean
  className?: string
}

/**
 * Обёртка для контрола расширенных фильтров: подпись + контрол одной высоты.
 * Нужна там, где Gravity-контрол не умеет `label` (нативный input, чекбоксы).
 */
export function CatalogFilterField({
  label,
  htmlFor,
  children,
  'data-testid': dataTestId,
}: {
  label: string
  htmlFor?: string
  children: ReactNode
  'data-testid'?: string
}) {
  return (
    <div className="catalog-filters__field" data-testid={dataTestId}>
      <label className="catalog-filters__field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  )
}

/**
 * @spec SPEC-UI-2 - Одинаковая шапка каталога на всех страницах со списками
 */
export function CatalogFilterBar({
  testIdPrefix,
  testIdSection = 'page',
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  searchDebounceMs = SEARCH_DEBOUNCE_MS,
  chips,
  onChipToggle,
  chipsLabel = 'Быстрый фильтр',
  advanced,
  advancedTitle = 'Фильтры',
  advancedDefaultOpen,
  toolbar,
  resultsCount,
  resultsPending = false,
  activeCount = 0,
  onReset,
  sticky = false,
  className,
}: CatalogFilterBarProps) {
  const advancedId = useId()
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(
    () => advancedDefaultOpen ?? isDesktopViewport(),
  )

  const [searchDraft, setSearchDraft] = useState(searchValue)
  const [syncedSearch, setSyncedSearch] = useState(searchValue)

  // Внешний сброс/восстановление из URL перебивает черновик без лишнего рендера.
  // Значение, отличающееся только тримом, черновик не трогает — иначе пробел под курсором стирается.
  if (searchValue !== syncedSearch) {
    setSyncedSearch(searchValue)
    if (searchDraft.trim() !== searchValue.trim()) {
      setSearchDraft(searchValue)
    }
  }

  const latest = useRef({searchValue, onSearchChange})
  useEffect(() => {
    latest.current = {searchValue, onSearchChange}
  })

  useEffect(() => {
    if (searchDraft.trim() === latest.current.searchValue.trim()) return
    const timer = window.setTimeout(() => {
      latest.current.onSearchChange(searchDraft.trim())
    }, searchDebounceMs)
    return () => window.clearTimeout(timer)
  }, [searchDraft, searchDebounceMs])

  const showReset = activeCount > 0 && Boolean(onReset)
  const classes = [
    'catalog-filters',
    sticky ? 'catalog-filters--sticky' : '',
    activeCount > 0 ? 'catalog-filters--active' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={classes}
      role="search"
      aria-label={`${advancedTitle} и поиск`}
      data-testid={testId(testIdPrefix, testIdSection, 'panel', 'filters')}
    >
      {toolbar ? (
        <div
          className="catalog-filters__toolbar"
          data-testid={testId(testIdPrefix, testIdSection, 'panel', 'toolbar')}
        >
          {toolbar}
        </div>
      ) : null}

      <div
        className="catalog-filters__search"
        data-testid={testId(testIdPrefix, testIdSection, 'card', 'search')}
      >
        <TextInput
          type="search"
          size="l"
          placeholder={searchPlaceholder}
          value={searchDraft}
          onUpdate={setSearchDraft}
          hasClear
          controlProps={{'aria-label': searchLabel}}
          startContent={
            <span className="catalog-filters__search-icon" aria-hidden>
              <Icon data={Magnifier} size={16} />
            </span>
          }
          data-testid={testId(testIdPrefix, testIdSection, 'field', 'search')}
        />
      </div>

      {chips && chips.length > 0 ? (
        <div
          className="catalog-filters__chips"
          data-testid={testId(testIdPrefix, testIdSection, 'panel', 'chips')}
        >
          <span className="catalog-filters__chips-label">{chipsLabel}</span>
          <div
            className="catalog-filters__chips-row"
            data-testid={testId(testIdPrefix, testIdSection, 'row', 'chips')}
          >
            {chips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={`catalog-filters__chip${chip.active ? ' is-active' : ''}`}
                aria-pressed={chip.active}
                onClick={() => onChipToggle?.(chip.id)}
                data-testid={testId(testIdPrefix, testIdSection, 'btn', 'chip', chip.id)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className="catalog-filters__meta"
        data-testid={testId(testIdPrefix, testIdSection, 'row', 'meta')}
      >
        <div className="catalog-filters__meta-info">
          {resultsPending || resultsCount !== undefined ? (
            <Text
              color="secondary"
              className="catalog-filters__meta-text"
              aria-live="polite"
              data-testid={testId(testIdPrefix, testIdSection, 'text', 'results')}
            >
              {resultsPending ? 'Обновляем результаты…' : `Найдено: ${resultsCount}`}
            </Text>
          ) : null}
          {activeCount > 0 ? (
            <Text
              color="secondary"
              className="catalog-filters__meta-text"
              data-testid={testId(testIdPrefix, testIdSection, 'text', 'active-filters')}
            >
              Фильтров: {activeCount}
            </Text>
          ) : null}
        </div>

        <div className="catalog-filters__meta-actions">
          {showReset ? (
            <HockeyButton
              view="flat"
              size="s"
              onClick={onReset}
              data-testid={testId(testIdPrefix, testIdSection, 'btn', 'reset-filters')}
            >
              Сбросить
            </HockeyButton>
          ) : null}
          {advanced ? (
            <HockeyButton
              view="outlined"
              size="s"
              aria-expanded={isAdvancedOpen}
              aria-controls={advancedId}
              onClick={() => setIsAdvancedOpen((prev) => !prev)}
              data-testid={testId(testIdPrefix, testIdSection, 'btn', 'filters-toggle')}
            >
              {advancedTitle}
              <span
                className={`catalog-filters__toggle-icon${isAdvancedOpen ? ' is-open' : ''}`}
                aria-hidden
              >
                <Icon data={ChevronDown} size={14} />
              </span>
            </HockeyButton>
          ) : null}
        </div>
      </div>

      {advanced ? (
        <div
          id={advancedId}
          className="catalog-filters__advanced"
          hidden={!isAdvancedOpen}
          data-testid={testId(testIdPrefix, testIdSection, 'grid', 'filters')}
        >
          {advanced}
        </div>
      ) : null}
    </section>
  )
}
