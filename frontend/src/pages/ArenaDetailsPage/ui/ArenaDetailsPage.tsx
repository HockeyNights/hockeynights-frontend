/**
 * HOCFRONT-32 — полноценная страница арены
 * SPEC-FR-6.2.1, SPEC-FR-6.3.1
 */

import {useQuery} from '@tanstack/react-query'
import {useParams} from 'react-router'

import {arenaHasFreeSlots, fetchArena, fetchArenaSlots} from '@/entities/arena'
import {ArenaDetailPanel} from '@/features/arenas'
import {isNotFoundError} from '@/shared/api/client'
import {ARENAS_LABEL} from '@/shared/config/navigationLabels'
import {routes} from '@/shared/const/appRoutes'
import {useDocumentTitle} from '@/shared/hooks/useDocumentTitle'
import {testId} from '@/shared/testing/testId'
import {PageBackLink} from '@/shared/ui/PageBackLink'
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'
import {PageStatePanel} from '@/shared/ui/PageStatePanel'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

export function ArenaDetailsPage() {
  const {arenaId = ''} = useParams()
  const {
    data: arena,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['arena', arenaId],
    queryFn: () => fetchArena(arenaId),
    enabled: Boolean(arenaId),
  })
  const {data: slots = []} = useQuery({
    queryKey: ['arena-slots', arenaId],
    queryFn: () => fetchArenaSlots(arenaId),
    enabled: Boolean(arenaId),
  })

  useDocumentTitle(arena ? `${arena.name} · ${ARENAS_LABEL}` : ARENAS_LABEL)

  if (isLoading) {
    return (
      <PageHub data-testid={testId('arenas', 'details', 'loader')}>
        <ScoreboardLoader label="Загрузка арены..." />
      </PageHub>
    )
  }

  if (error && !isNotFoundError(error)) {
    return (
      <PageHub>
        <QueryErrorState
          title="Не удалось загрузить арену"
          onRetry={() => void refetch()}
          testIdPrefix="arenas"
          data-testid={testId('arenas', 'details', 'error')}
        />
      </PageHub>
    )
  }

  if (!arena) {
    return (
      <PageHub>
        <PageBackLink
          to={routes.arenas}
          label="К каталогу арен"
          testIdPrefix="arenas"
          testIdSection="details"
        />
        <PageStatePanel
          title="Арена не найдена"
          copy="Вернитесь к каталогу и выберите площадку из списка или с карты."
          testIdPrefix="arenas"
          data-testid={testId('arenas', 'details', 'empty')}
        />
      </PageHub>
    )
  }

  const subtitleParts = [arena.city, arena.district].filter(Boolean)

  return (
    <PageHub data-testid={testId('arenas', 'details', 'page', arena.id)}>
      <PageBackLink
        to={routes.arenas}
        label="К каталогу арен"
        testIdPrefix="arenas"
        testIdSection="details"
      />

      <PageHeader
        title={arena.name}
        subtitle={subtitleParts.length > 0 ? subtitleParts.join(' · ') : undefined}
        testIdPrefix="arenas"
        testIdSection="details"
      />

      <div className="page-hub__panel">
        <ArenaDetailPanel
          arena={arena}
          slots={slots}
          hasFreeSlot={
            arena.bookingMode === 'slot_calendar' ? arenaHasFreeSlots(arena.id, slots) : undefined
          }
        />
      </div>
    </PageHub>
  )
}
