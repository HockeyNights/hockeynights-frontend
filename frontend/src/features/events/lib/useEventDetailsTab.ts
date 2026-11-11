/**
 * HOCFRONT-46 — активная вкладка «Состав | Звенья» хранится в адресе (?tab=lines).
 * По умолчанию открыт «Состав».
 */

import {useSearchParams} from 'react-router'

export type EventDetailsTab = 'roster' | 'lines'

export function useEventDetailsTab(): [EventDetailsTab, (tab: EventDetailsTab) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: EventDetailsTab = searchParams.get('tab') === 'lines' ? 'lines' : 'roster'

  const setTab = (next: EventDetailsTab) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (next === 'roster') {
          params.delete('tab')
        } else {
          params.set('tab', next)
        }
        return params
      },
      {replace: true},
    )
  }

  return [tab, setTab]
}
