/**
 * HOCFRONT-25 / TASK-04-02 — карточка команды в ленте
 */

import {Person} from '@gravity-ui/icons'
import {Icon, Text} from '@gravity-ui/uikit'
import {useNavigate} from 'react-router'

import type {SkillLevel} from '@/entities/common'
import type {Team} from '@/entities/team'
import {SKILL_LEVEL_LABELS} from '@/features/events'
import {FavoriteButton} from '@/features/favorites'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'

import {formatPlayersCount} from '../lib/formatPlayersCount'

/** В макете карточки — прилагательные («Любительский»), не короткие ярлыки фильтров. */
const FEED_SKILL_LABELS: Partial<Record<SkillLevel, string>> = {
  beginner: 'Дебютант',
  amateur: 'Любительский',
  advanced: 'Продвинутый',
  league: 'Лига',
}

export interface TeamCardProps {
  team: Team
}

/** Горизонтальная карточка для ленты команд */
export function TeamCard({team}: TeamCardProps) {
  const navigate = useNavigate()
  const membersCount = team.memberIds.length
  const skillLabel =
    FEED_SKILL_LABELS[team.skillLevel] ?? SKILL_LEVEL_LABELS[team.skillLevel] ?? team.skillLevel

  const openProfile = () => navigate(`/teams/${team.id}`)

  return (
    <IceCard
      padding="m"
      className="team-card team-card--feed team-card--clickable"
      role="button"
      tabIndex={0}
      onClick={openProfile}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openProfile()
        }
      }}
      data-testid={testId('teams', 'card', 'card', team.id)}
    >
      <div className="team-card__feed-row">
        <span
          className="team-avatar-tile team-card__avatar"
          aria-hidden
          data-testid={team.logoUrl ? undefined : testId('teams', 'card', 'icon', 'crest', team.id)}
        >
          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt=""
              className="team-avatar-tile__img"
              data-testid={testId('teams', 'card', 'img', 'logo', team.id)}
            />
          ) : (
            <Icon data={Person} size={32} />
          )}
        </span>

        <div className="team-card__feed-main">
          <Text
            className="team-card__name"
            data-testid={testId('teams', 'card', 'text', 'name', team.id)}
          >
            {team.name}
          </Text>
          <Text
            color="secondary"
            className="team-card__subtitle"
            data-testid={testId('teams', 'card', 'text', 'city', team.id)}
          >
            {team.city} · {skillLabel}
          </Text>

          <div
            className="team-card__feed-meta"
            data-testid={testId('teams', 'card', 'panel', 'meta', team.id)}
          >
            {team.shortDescription && (
              <span
                className="team-chip team-chip--wrap"
                data-testid={testId('teams', 'card', 'text', 'description', team.id)}
              >
                {team.shortDescription}
              </span>
            )}
            <span
              className="team-chip"
              data-testid={testId('teams', 'card', 'badge', 'members', team.id)}
            >
              {formatPlayersCount(membersCount)}
            </span>
            {team.leagueId && (
              <span
                className="team-chip"
                data-testid={testId('teams', 'card', 'badge', 'league', team.id)}
              >
                В лиге
              </span>
            )}
          </div>
        </div>

        <FavoriteButton
          type="team"
          entityId={team.id}
          title={team.name}
          size="m"
          className="team-favorite"
        />
      </div>
    </IceCard>
  )
}
