/**
 * HOCFRONT-43 — CatalogFilterBar: дебаунс, trim черновика, строка состояния, aria.
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {useState} from 'react'
import {describe, expect, it, vi} from 'vitest'

import {CatalogFilterBar} from '@/shared/ui/CatalogFilterBar'
import {renderWithProviders} from '@/test/render'

function SearchHarness() {
  const [searchValue, setSearchValue] = useState('')
  return (
    <>
      <div data-testid="catalog-committed-search">{searchValue}</div>
      <CatalogFilterBar
        testIdPrefix="catalog"
        testIdSection="bar"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Поиск"
        searchLabel="Поиск каталога"
        advancedDefaultOpen={false}
        advanced={<div>Расширенные</div>}
      />
    </>
  )
}

describe('CatalogFilterBar', () => {
  it('отдаёт наверх обрезанный запрос и не стирает пробел в черновике', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SearchHarness />)

    const input = screen.getByLabelText('Поиск каталога')
    await user.type(input, 'bauer ')

    await waitFor(
      () => {
        expect(screen.getByTestId('catalog-committed-search')).toHaveTextContent('bauer')
      },
      {timeout: 1000},
    )
    expect(input).toHaveValue('bauer ')
  })

  it('держит aria-controls на существующей панели, пока фильтры свёрнуты', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CatalogFilterBar
        testIdPrefix="catalog"
        testIdSection="bar"
        searchValue=""
        onSearchChange={() => undefined}
        searchPlaceholder="Поиск"
        searchLabel="Поиск каталога"
        advancedDefaultOpen={false}
        advanced={<div>Расширенные</div>}
      />,
    )

    const toggle = screen.getByTestId('catalog-bar-btn-filters-toggle')
    const panel = screen.getByTestId('catalog-bar-grid-filters')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', panel.id)
    expect(panel).not.toBeVisible()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(panel).toBeVisible()
  })

  it('в первой загрузке пишет «Обновляем результаты…», а не «Найдено: 0»', () => {
    renderWithProviders(
      <CatalogFilterBar
        testIdPrefix="catalog"
        testIdSection="bar"
        searchValue=""
        onSearchChange={() => undefined}
        searchPlaceholder="Поиск"
        searchLabel="Поиск каталога"
        resultsCount={0}
        resultsPending
      />,
    )

    expect(screen.getByTestId('catalog-bar-text-results')).toHaveTextContent(
      'Обновляем результаты…',
    )
  })

  it('после загрузки показывает счётчик результатов', () => {
    renderWithProviders(
      <CatalogFilterBar
        testIdPrefix="catalog"
        testIdSection="bar"
        searchValue=""
        onSearchChange={() => undefined}
        searchPlaceholder="Поиск"
        searchLabel="Поиск каталога"
        resultsCount={12}
        resultsPending={false}
      />,
    )

    expect(screen.getByTestId('catalog-bar-text-results')).toHaveTextContent('Найдено: 12')
  })

  it('дебаунсит onSearchChange', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    renderWithProviders(
      <CatalogFilterBar
        testIdPrefix="catalog"
        testIdSection="bar"
        searchValue=""
        onSearchChange={onSearchChange}
        searchPlaceholder="Поиск"
        searchLabel="Поиск каталога"
        searchDebounceMs={250}
      />,
    )

    await user.type(screen.getByLabelText('Поиск каталога'), 'арт')
    expect(onSearchChange).not.toHaveBeenCalled()
    await waitFor(() => expect(onSearchChange).toHaveBeenCalledWith('арт'), {timeout: 1000})
    expect(onSearchChange).toHaveBeenCalledTimes(1)
  })
})
