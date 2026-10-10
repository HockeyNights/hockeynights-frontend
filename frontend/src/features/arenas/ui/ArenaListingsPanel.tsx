/**
 * HOCFRONT-32B — публичные объявления льда на странице арены
 */

import {useQuery} from '@tanstack/react-query'

import {fetchArenaListings} from '@/entities/arena'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {SectionHeading} from '@/shared/ui/SectionHeading'

export interface ArenaListingsPanelProps {
  arenaId: string
}

export function ArenaListingsPanel({arenaId}: ArenaListingsPanelProps) {
  const {data: listings = []} = useQuery({
    queryKey: ['arena-listings', arenaId, 'public'],
    queryFn: () => fetchArenaListings(arenaId, {publicOnly: true}),
  })

  if (listings.length === 0) return null

  return (
    <section
      className="arena-detail__section arena-listings"
      data-testid={testId('arenas', 'listings', 'panel', arenaId)}
    >
      <SectionHeading
        title="Объявления льда"
        as="h3"
        data-testid={testId('arenas', 'listings', 'text', 'title', arenaId)}
      />
      {listings.map((listing) => {
        const start = new Date(listing.startsAt)
        const end = new Date(listing.endsAt)
        return (
          <IceCard
            key={listing.id}
            padding="m"
            className="arena-listings__card"
            data-testid={testId('arenas', 'listings', 'card', listing.id)}
          >
            <div
              className="arena-listings__name"
              data-testid={testId('arenas', 'listings', 'text', 'name', listing.id)}
            >
              {listing.title}
            </div>
            <div
              className="arena-listings__meta"
              data-testid={testId('arenas', 'listings', 'text', 'schedule', listing.id)}
            >
              {start.toLocaleString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' – '}
              {end.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
              {listing.priceRub != null ? ` · ${listing.priceRub.toLocaleString('ru-RU')} ₽` : ''}
            </div>
            {listing.contactPhone && (
              <div
                className="arena-listings__phone"
                data-testid={testId('arenas', 'listings', 'text', 'phone', listing.id)}
              >
                <a href={`tel:${listing.contactPhone.replace(/[^\d+]/g, '')}`}>
                  {listing.contactPhone}
                </a>
                {listing.contactNote ? ` · ${listing.contactNote}` : ''}
              </div>
            )}
          </IceCard>
        )
      })}
    </section>
  )
}
