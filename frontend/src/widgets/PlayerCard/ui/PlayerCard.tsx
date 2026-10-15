/**
 * SPEC-FR-2.3.1, SPEC-FR-8.2.1, SPEC-FR-8.2.2
 * SPEC-UI-2.1, SPEC-UI-1.3, SPEC-UI-1.4
 * SPEC-FR-17.1.1, SPEC-FR-17.1.2, SPEC-FR-24.2.1, SPEC-FR-24.2.3
 * HOCFRONT-19 — FavoriteButton на карточке игрока
 * HOCFRONT-23 — verified badge
 */

import {Text} from '@gravity-ui/uikit'
import type {ReactNode} from 'react'
import {Link} from 'react-router'

import type {PlayerListItem, ProfileFieldPrivacy} from '@/entities/profile'
import {POSITION_LABELS} from '@/features/events'
import {FavoriteButton} from '@/features/favorites'
import {KarmaScore} from '@/features/karma'
import {VerifiedBadge} from '@/features/players'
import {
  clampPlayerIndex,
  formatBirthMeta,
  getPlayerLevelLabel,
  getProfileInitials,
} from '@/shared/lib/profileIdentity'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {PositionLabel} from '@/shared/ui/PositionLabel'

const STICK_HAND_LABELS: Record<NonNullable<PlayerListItem['stickHand']>, string> = {
  left: 'Левый',
  right: 'Правый',
  unknown: '—',
}

/** @spec SPEC-FR-2.3.1 - Props карточки игрока */
export interface PlayerCardProps {
  /** @spec SPEC-FR-2.3.1 */
  player: PlayerListItem
  /** Отключить переход на публичный профиль (на странице профиля) */
  linkable?: boolean
  /** Скрыть избранное (свой профиль) */
  showFavorite?: boolean
  /**
   * catalog — компактная карточка списка
   * profile — паспортная карточка профиля (аватар слева + колонки)
   */
  variant?: 'catalog' | 'profile'
  /** Приватность полей (если не задано — показывать всё) */
  visibleFields?: Partial<Record<keyof ProfileFieldPrivacy, boolean>>
}

function CardNav({
  linkable,
  to,
  userId,
  children,
}: {
  linkable: boolean
  to: string
  userId: string
  children: ReactNode
}) {
  if (!linkable) return <>{children}</>
  return (
    <Link
      to={to}
      className="hockey-player-card-link"
      data-testid={testId('players', 'player-card', 'link', userId)}
    >
      {children}
    </Link>
  )
}

function PlayerAvatar({player}: {player: PlayerListItem}) {
  const initials = getProfileInitials(player.displayName || player.fullName)

  if (player.avatarUrl) {
    return (
      <img
        className="hockey-player-card__avatar-img"
        src={player.avatarUrl}
        alt=""
        data-testid={testId('players', 'player-card', 'img', 'avatar', player.userId)}
      />
    )
  }

  return (
    <span
      className="hockey-player-card__avatar-initials"
      aria-hidden
      data-testid={testId('players', 'player-card', 'icon', 'avatar', player.userId)}
    >
      {initials}
    </span>
  )
}

function ReliabilityMeter({
  player,
  label,
  value,
}: {
  player: PlayerListItem
  label: string
  value: number
}) {
  return (
    <div className="hockey-player-card__stats">
      <div className="hockey-player-card__stats-head">
        <Text
          className="hockey-player-card__stats-label"
          data-testid={testId('players', 'player-card', 'text', 'reliability-label', player.userId)}
        >
          {label}
        </Text>
        <KarmaScore
          score={player.karmaScore}
          testIdPrefix="players"
          data-testid={testId('players', 'player-card', 'badge', 'karma', player.userId)}
        />
      </div>
      <div
        className="hockey-player-card__reliability"
        aria-hidden
        data-testid={testId('players', 'player-card', 'cell', 'reliability', player.userId)}
      >
        <div
          className="hockey-player-card__reliability-fill hockey-fill"
          style={{['--hockey-fill-width' as string]: `${value}%`}}
        />
      </div>
    </div>
  )
}

/**
 * @spec SPEC-UI-2.1 - Hockey card с номером, амплуа, karma, надёжностью
 * @spec SPEC-FR-2.3.1 - Карточка игрока
 * @spec HOCFRONT-23 - Verified badge на карточке
 */
export function PlayerCard({
  player,
  linkable = true,
  showFavorite = true,
  variant = 'catalog',
  visibleFields,
}: PlayerCardProps) {
  const jerseyNumber = String(player.userId.replace(/\D/g, '').slice(-2) || '00').padStart(2, '0')
  const isProfile = variant === 'profile'
  const showField = (key: keyof ProfileFieldPrivacy) => visibleFields?.[key] !== false
  const isGoalie = showField('position') && player.position === 'goalie'
  const reliability =
    isGoalie && player.goalieReliabilityScore != null
      ? player.goalieReliabilityScore
      : Math.min(100, player.karmaScore)
  const reliabilityLabel =
    isGoalie && player.goalieReliabilityScore != null ? 'Надёжность выходов' : 'Надёжность'
  const stickHand = player.stickHand ?? 'unknown'
  const positionLabel = POSITION_LABELS[player.position] ?? player.position
  const skillLabel = getPlayerLevelLabel(player)

  const isVerified = player.verificationStatus === 'verified'
  const profilePath = `/players/${player.userId}`

  if (isProfile) {
    const birthMeta = showField('birthDate') ? formatBirthMeta(player.birthDate) : null
    return (
      <IceCard
        padding="m"
        className="hockey-player-card-shell--profile"
        data-testid={testId('players', 'player-card', 'card', player.userId)}
      >
        <div className="hockey-player-card hockey-player-card--profile">
          <div className="hockey-player-card__head">
            <div
              className="hockey-player-card__portrait"
              data-testid={testId('players', 'player-card', 'panel', 'portrait', player.userId)}
            >
              <PlayerAvatar player={player} />
            </div>

            <div className="hockey-player-card__passport">
              <div className="hockey-player-card__passport-top">
                <div className="hockey-player-card__badges">
                  {showField('position') && (
                    <PositionLabel
                      position={player.position}
                      testIdPrefix="players"
                      data-testid={testId(
                        'players',
                        'player-card',
                        'badge',
                        'position',
                        player.userId,
                      )}
                    />
                  )}
                  {isGoalie && (
                    <span
                      className="hockey-player-card__goalie-badge"
                      data-testid={testId('players', 'player-card', 'badge', 'sos', player.userId)}
                    >
                      SOS
                    </span>
                  )}
                  <VerifiedBadge
                    verified={isVerified}
                    entityId={player.userId}
                    className="hockey-player-card__verified"
                    data-testid={testId(
                      'players',
                      'player-card',
                      'badge',
                      'verified',
                      player.userId,
                    )}
                  />
                </div>
                {showFavorite && (
                  <div className="hockey-player-card__top-right">
                    <FavoriteButton
                      type="player"
                      entityId={player.userId}
                      title={player.displayName}
                    />
                  </div>
                )}
              </div>

              <Text
                variant="header-2"
                className="hockey-player-card__passport-name"
                data-testid={testId('players', 'player-card', 'text', 'name', player.userId)}
              >
                {player.displayName}
              </Text>

              {birthMeta ? (
                <Text
                  className="hockey-player-card__passport-birth"
                  data-testid={testId('players', 'player-card', 'text', 'birth', player.userId)}
                >
                  {birthMeta}
                </Text>
              ) : (
                <Text
                  color="secondary"
                  className="hockey-player-card__passport-subtitle"
                  data-testid={testId('players', 'player-card', 'text', 'skill', player.userId)}
                >
                  {showField('position') ? positionLabel : 'Игрок'}
                  {showField('skillLevel') ? ` · ${skillLabel}` : ''}
                </Text>
              )}
            </div>
          </div>

          <div
            className="hockey-player-card__passport-cols"
            data-testid={testId('players', 'player-card', 'panel', 'cols', player.userId)}
          >
            <div className="hockey-player-card__passport-col hockey-player-card__passport-col--personal">
              <p className="hockey-player-card__passport-col-title">Личные данные</p>
              <dl className="hockey-player-card__passport-facts">
                {showField('city') && player.city.trim() !== '' && (
                  <div>
                    <dt>Город:</dt>
                    <dd
                      data-testid={testId('players', 'player-card', 'text', 'city', player.userId)}
                    >
                      {player.city}
                    </dd>
                  </div>
                )}
                {showField('heightWeight') && player.heightCm != null && (
                  <div>
                    <dt>Рост:</dt>
                    <dd
                      data-testid={testId(
                        'players',
                        'player-card',
                        'text',
                        'height',
                        player.userId,
                      )}
                    >
                      {player.heightCm} см
                    </dd>
                  </div>
                )}
                {showField('heightWeight') && player.weightKg != null && (
                  <div>
                    <dt>Вес:</dt>
                    <dd
                      data-testid={testId(
                        'players',
                        'player-card',
                        'text',
                        'weight',
                        player.userId,
                      )}
                    >
                      {player.weightKg} кг
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="hockey-player-card__passport-col hockey-player-card__passport-col--game">
              <p className="hockey-player-card__passport-col-title">Игровые данные</p>
              <dl className="hockey-player-card__passport-facts">
                {showField('position') && (
                  <div>
                    <dt>Хват:</dt>
                    <dd>{STICK_HAND_LABELS[stickHand]}</dd>
                  </div>
                )}
                {showField('position') && (
                  <div>
                    <dt>Позиция:</dt>
                    <dd>{positionLabel}</dd>
                  </div>
                )}
                {showField('skillLevel') && (
                  <div>
                    <dt>Уровень:</dt>
                    <dd
                      data-testid={testId('players', 'player-card', 'text', 'skill', player.userId)}
                    >
                      {skillLabel}
                    </dd>
                  </div>
                )}
                {showField('skillLevel') && player.playerIndex != null && (
                  <div>
                    <dt>Индекс:</dt>
                    <dd
                      className="hockey-player-card__accent-value"
                      data-testid={testId('players', 'player-card', 'text', 'index', player.userId)}
                    >
                      {clampPlayerIndex(player.playerIndex)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <ReliabilityMeter player={player} label={reliabilityLabel} value={reliability} />
        </div>
      </IceCard>
    )
  }

  const details = (
    <div className="hockey-player-card__body">
      <div
        className="hockey-player-card__meta"
        data-testid={testId('players', 'player-card', 'panel', 'meta', player.userId)}
      >
        {showField('skillLevel') && skillLabel !== '—' && (
          <Text
            color="secondary"
            data-testid={testId('players', 'player-card', 'text', 'skill', player.userId)}
          >
            {skillLabel}
          </Text>
        )}
      </div>

      <div className="hockey-player-card__fields">
        {showField('teams') && player.teamName && (
          <div
            className="hockey-player-card__field"
            data-testid={testId('players', 'player-card', 'panel', 'team', player.userId)}
          >
            <Text
              className="hockey-player-card__field-label"
              data-testid={testId('players', 'player-card', 'text', 'team-label', player.userId)}
            >
              Команда
            </Text>
            <div className="hockey-player-card__team-value">
              {player.teamLogoUrl ? (
                <img
                  src={player.teamLogoUrl}
                  alt=""
                  className="hockey-player-card__team-logo"
                  data-testid={testId('players', 'player-card', 'img', 'team-logo', player.userId)}
                />
              ) : null}
              <Text data-testid={testId('players', 'player-card', 'text', 'team', player.userId)}>
                {player.teamName}
              </Text>
            </div>
          </div>
        )}

        {showField('city') && player.city.trim() ? (
          <div
            className="hockey-player-card__field"
            data-testid={testId('players', 'player-card', 'panel', 'city', player.userId)}
          >
            <Text
              className="hockey-player-card__field-label"
              data-testid={testId('players', 'player-card', 'text', 'city-label', player.userId)}
            >
              Город
            </Text>
            <Text data-testid={testId('players', 'player-card', 'text', 'city', player.userId)}>
              {player.city}
            </Text>
          </div>
        ) : null}
      </div>

      <ReliabilityMeter player={player} label={reliabilityLabel} value={reliability} />
    </div>
  )

  return (
    <IceCard
      padding="m"
      className="hockey-player-card-shell--catalog"
      data-testid={testId('players', 'player-card', 'card', player.userId)}
    >
      <span
        className="hockey-player-card__number"
        aria-hidden
        data-testid={testId('players', 'player-card', 'text', 'number', player.userId)}
      >
        {jerseyNumber}
      </span>
      <div className="hockey-player-card">
        <div className="hockey-player-card__top">
          <CardNav linkable={linkable} to={profilePath} userId={player.userId}>
            <div className="hockey-player-card__top-left">
              <div className="hockey-player-card__badges">
                {showField('position') && player.position !== 'any' && (
                  <PositionLabel
                    position={player.position}
                    testIdPrefix="players"
                    data-testid={testId(
                      'players',
                      'player-card',
                      'badge',
                      'position',
                      player.userId,
                    )}
                  />
                )}
                {isGoalie && (
                  <span
                    className="hockey-player-card__goalie-badge"
                    data-testid={testId('players', 'player-card', 'badge', 'sos', player.userId)}
                  >
                    SOS
                  </span>
                )}
              </div>
              <div className="hockey-player-card__name-row">
                <Text
                  variant="header-2"
                  className="hockey-entity-title--compact hockey-player-card__name"
                  data-testid={testId('players', 'player-card', 'text', 'name', player.userId)}
                >
                  {player.displayName}
                </Text>
                <VerifiedBadge
                  verified={isVerified}
                  entityId={player.userId}
                  className="hockey-player-card__verified"
                  data-testid={testId('players', 'player-card', 'badge', 'verified', player.userId)}
                />
              </div>
            </div>
          </CardNav>
          {showFavorite && (
            <div className="hockey-player-card__top-right">
              <FavoriteButton type="player" entityId={player.userId} title={player.displayName} />
            </div>
          )}
        </div>

        {linkable ? (
          <Link to={profilePath} className="hockey-player-card-link hockey-player-card__body-link">
            {details}
          </Link>
        ) : (
          details
        )}
      </div>
    </IceCard>
  )
}
