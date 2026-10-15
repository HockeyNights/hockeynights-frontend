/**
 * SPEC-FR-24.5.1
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'

import type {League} from '@/entities/league'
import {fetchLeaguePosts} from '@/entities/league'
import {SKILL_LEVEL_LABELS} from '@/features/events'
import {FavoriteButton} from '@/features/favorites'
import {testId} from '@/shared/testing/testId'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {IceCard} from '@/shared/ui/IceCard'

export interface LeagueProfilePanelProps {
  league: League
}

/**
 * @spec SPEC-FR-24.5.1 - Профиль хоккейной лиги (шапка страницы лиги)
 */
export function LeagueProfilePanel({league}: LeagueProfilePanelProps) {
  const {data: posts = []} = useQuery({
    queryKey: ['league-posts', league.id],
    queryFn: () => fetchLeaguePosts(league.id),
  })

  const pinnedPosts = posts.filter((post) => post.pinned)

  return (
    <div data-testid={testId('leagues', 'profile', 'panel', league.id)}>
      <IceCard padding="l" className="league-profile">
        <div className="league-profile__header">
          <Text
            as="h1"
            variant="header-1"
            className="league-profile__title"
            data-testid={testId('leagues', 'profile', 'text', 'title', league.id)}
          >
            {league.name}
          </Text>
          <div
            className="league-meta-chips"
            data-testid={testId('leagues', 'profile', 'panel', 'chips', league.id)}
          >
            <div data-testid={testId('leagues', 'profile', 'badge', 'profile', league.id)}>
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

        <dl
          className="league-profile__info"
          data-testid={testId('leagues', 'profile', 'panel', 'info', league.id)}
        >
          <div className="league-profile__fact">
            <dt data-testid={testId('leagues', 'profile', 'text', 'region-label', league.id)}>
              Регион
            </dt>
            <dd data-testid={testId('leagues', 'profile', 'text', 'region', league.id)}>
              {league.region}
            </dd>
          </div>
          <div className="league-profile__fact">
            <dt data-testid={testId('leagues', 'profile', 'text', 'level-label', league.id)}>
              Уровень
            </dt>
            <dd data-testid={testId('leagues', 'profile', 'text', 'level', league.id)}>
              {league.level ? (SKILL_LEVEL_LABELS[league.level] ?? league.level) : 'Не указан'}
            </dd>
          </div>
        </dl>

        {league.description && (
          <Text
            color="secondary"
            className="league-profile__description"
            data-testid={testId('leagues', 'profile', 'text', 'description', league.id)}
          >
            {league.description}
          </Text>
        )}

        {pinnedPosts.length > 0 && (
          <div
            className="league-profile__posts"
            data-testid={testId('leagues', 'profile', 'list', 'posts', league.id)}
          >
            {pinnedPosts.map((post) => (
              <div
                key={post.id}
                className="league-profile__post"
                data-testid={testId('leagues', 'profile', 'item', post.id)}
              >
                <span
                  className="league-profile__post-title"
                  data-testid={testId('leagues', 'profile', 'text', 'post-title', post.id)}
                >
                  {post.title}
                </span>
                <Text
                  color="secondary"
                  className="league-profile__post-body"
                  data-testid={testId('leagues', 'profile', 'text', 'post-body', post.id)}
                >
                  {post.body}
                </Text>
              </div>
            ))}
          </div>
        )}
      </IceCard>
    </div>
  )
}
