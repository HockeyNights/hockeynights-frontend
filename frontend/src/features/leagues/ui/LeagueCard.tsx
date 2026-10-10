/**
 * SPEC-FR-7.1.1, SPEC-FR-7.1.2, SPEC-FR-7.1.3, SPEC-FR-7.2.2
 * SPEC-UI-1.3, SPEC-UI-2.7
 * HOCFRONT-34A — кликабельная карточка (hitbox + интерактивы поверх, без nested role=button)
 */

import {Text} from '@gravity-ui/uikit'
import {useState} from 'react'

import type {League} from '@/entities/league'
import {SKILL_LEVEL_LABELS} from '@/features/events'
import {FavoriteButton} from '@/features/favorites'
import {MockLeaguePortalModal} from '@/features/leagues/ui/MockLeaguePortalModal'
import {testId} from '@/shared/testing/testId'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {IceCard} from '@/shared/ui/IceCard'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'

/** @spec SPEC-FR-7.1.2 - Props карточки лиги */
export interface LeagueCardProps {
  /** @spec SPEC-FR-7.1.2 */
  league: League
  /** HOCFRONT-34A — открыть отдельную страницу лиги (клик по всей карточке) */
  onOpenDetails?: (leagueId: string) => void
  /** @spec SPEC-UI-2.7 */
  selected?: boolean
}

/**
 * @spec SPEC-FR-7.1.2 - Карточка лиги
 * @spec SPEC-FR-7.1.3 - Mock-портал сайта лиги
 */
export function LeagueCard({league, onOpenDetails, selected = false}: LeagueCardProps) {
  const [portalOpen, setPortalOpen] = useState(false)

  const handleSelect = onOpenDetails ? () => onOpenDetails(league.id) : undefined
  const levelLabel = league.level ? (SKILL_LEVEL_LABELS[league.level] ?? league.level) : undefined

  return (
    <>
      <IceCard
        padding="m"
        className={[
          'league-card',
          selected ? 'ice-card--selected' : '',
          handleSelect ? 'league-card--clickable' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={handleSelect}
        data-testid={testId('leagues', 'card', 'card', league.id)}
      >
        {handleSelect && (
          <button
            type="button"
            className="league-card__hitbox"
            onClick={(e) => {
              e.stopPropagation()
              handleSelect()
            }}
            aria-label={`Открыть лигу ${league.name}`}
            aria-pressed={selected}
            data-testid={testId('leagues', 'card', 'btn', 'open', league.id)}
          />
        )}
        <div className="league-card__content">
          <div className="league-card__head">
            <Text
              variant="header-2"
              className="league-card__name"
              data-testid={testId('leagues', 'card', 'text', 'name', league.id)}
            >
              {league.name}
            </Text>
            <div
              className="league-meta-chips"
              data-testid={testId('leagues', 'card', 'panel', 'chips', league.id)}
            >
              <div data-testid={testId('leagues', 'card', 'badge', 'profile', league.id)}>
                <EntityProfileBadge kind="league" className="league-meta-chip--profile" />
              </div>
              <FavoriteButton
                type="league"
                entityId={league.id}
                title={league.name}
                className="league-meta-chip league-meta-chip--favorite"
              />
            </div>
          </div>
          <div className="league-card__facts">
            <Text
              color="secondary"
              className="league-card__region"
              data-testid={testId('leagues', 'card', 'text', 'region', league.id)}
            >
              {league.region}
            </Text>
            {levelLabel && (
              <span
                className="league-card__level"
                data-testid={testId('leagues', 'card', 'badge', 'level', league.id)}
              >
                {levelLabel}
              </span>
            )}
            <span
              className="league-card__integration"
              data-testid={testId('leagues', 'card', 'badge', 'integration', league.id)}
            >
              Интеграция: {league.integrationStatus}
            </span>
            <div
              className="league-card__source"
              data-testid={testId('leagues', 'card', 'badge', 'source', league.id)}
            >
              <SourceMetaBadge sourceMeta={league.sourceMeta} />
            </div>
          </div>
          {league.websiteUrl && (
            <button
              type="button"
              className="league-card__site-link"
              onClick={(e) => {
                e.stopPropagation()
                setPortalOpen(true)
              }}
              data-testid={testId('leagues', 'card', 'btn', 'portal', league.id)}
            >
              Сайт лиги (mock)
            </button>
          )}
        </div>
      </IceCard>
      <MockLeaguePortalModal
        open={portalOpen}
        onClose={() => setPortalOpen(false)}
        league={league}
      />
    </>
  )
}
