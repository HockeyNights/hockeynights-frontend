/**
 * HOCFRONT-28C — unit tests for catalog URL filters / chips
 */

import {describe, expect, it} from 'vitest'

import {
  countActiveCatalogFilters,
  DEFAULT_CATALOG_FILTERS,
  isCatalogChipActive,
  matchesDayPreset,
  parseCatalogFilters,
  serializeCatalogFilters,
  toggleCatalogChip,
} from './catalogFilters'

describe('catalogFilters', () => {
  it('parses and serializes round-trip', () => {
    const params = new URLSearchParams(
      'tab=training&time=evening&maxPrice=1500&status=open&needsGoalie=1&day=weekend',
    )
    const state = parseCatalogFilters(params)
    expect(state.tab).toBe('training')
    expect(state.time).toBe('evening')
    expect(state.maxPrice).toBe('1500')
    expect(state.status).toBe('open')
    expect(state.needsGoalie).toBe(true)
    expect(state.dayPreset).toBe('weekend')

    const again = parseCatalogFilters(serializeCatalogFilters(state))
    expect(again).toEqual(state)
  })

  it('toggles chips and clears conflicting day presets', () => {
    let state = DEFAULT_CATALOG_FILTERS
    state = toggleCatalogChip('today', state)
    expect(isCatalogChipActive('today', state)).toBe(true)
    state = toggleCatalogChip('weekend', state)
    expect(isCatalogChipActive('today', state)).toBe(false)
    expect(isCatalogChipActive('weekend', state)).toBe(true)
    state = toggleCatalogChip('evening', state)
    expect(state.time).toBe('evening')
    state = toggleCatalogChip('evening', state)
    expect(state.time).toBe('all')
  })

  it('counts active filters and matches weekend days', () => {
    const state = {
      ...DEFAULT_CATALOG_FILTERS,
      dayPreset: 'weekend' as const,
      maxPrice: '1500',
      needsGoalie: true,
    }
    expect(countActiveCatalogFilters(state)).toBe(3)
    expect(countActiveCatalogFilters({...state, q: 'вечерняя'})).toBe(3)
    expect(matchesDayPreset('2026-08-15T16:00:00+03:00', 'weekend')).toBe(true)
    expect(matchesDayPreset('2026-08-20T20:00:00+03:00', 'weekend')).toBe(false)
  })
})
