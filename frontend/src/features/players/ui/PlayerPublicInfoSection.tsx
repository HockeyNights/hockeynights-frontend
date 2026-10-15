import {Shield} from '@gravity-ui/icons'
import {Icon, Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link} from 'react-router'

import type {
  PlayerListItem,
  ProfileContacts,
  ProfileFieldPrivacy,
  PublicPlayerView,
} from '@/entities/profile'
import type {Team} from '@/entities/team'
import {fetchTeams} from '@/entities/team'
import {POSITION_LABELS} from '@/features/events'
import {getPlayerLevelLabel} from '@/shared/lib/profileIdentity'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'

export interface PlayerPublicInfoSectionProps {
  player: PlayerListItem
  contactsVisible: boolean
  participationHistoryVisible: boolean
  participationHistory?: PublicPlayerView['participationHistory']
  /** Owner hub: историю рисует expandable-блок снаружи */
  hideHistory?: boolean
  /** Какие поля можно показать (если не задано — все, как у владельца) */
  visibleFields?: Partial<Record<keyof ProfileFieldPrivacy, boolean>>
  /** Контакты, разрешённые зрителю */
  visibleContacts?: ProfileContacts
  /** Ссылка «Подробнее» в шапке карточки */
  moreTo?: string
}

const ACHIEVEMENT_TONES = ['gold', 'blue', 'green'] as const

function isVisible(
  visibleFields: Partial<Record<keyof ProfileFieldPrivacy, boolean>> | undefined,
  key: keyof ProfileFieldPrivacy,
): boolean {
  return visibleFields?.[key] !== false
}

function ContactsList({contacts, playerId}: {contacts: ProfileContacts; playerId: string}) {
  const rows: Array<{label: string; value: string; key: string; showLabel?: boolean}> = []
  if (contacts.phone) rows.push({label: 'Телефон', value: contacts.phone, key: 'phone'})
  if (contacts.email) rows.push({label: 'Email', value: contacts.email, key: 'email'})
  if (contacts.telegram) rows.push({label: 'Telegram', value: contacts.telegram, key: 'telegram'})
  if (contacts.maxMessenger) {
    rows.push({label: 'MAX', value: contacts.maxMessenger, key: 'max', showLabel: true})
  }

  return (
    <ul
      className="hockey-public-info__contacts"
      data-testid={testId('players', 'public-info', 'list', 'contacts', playerId)}
    >
      {rows.map((row) => (
        <li
          key={row.key}
          className={`hockey-public-info__contact hockey-public-info__contact--${row.key}`}
          data-testid={testId('players', 'public-info', 'item', row.key, playerId)}
        >
          <span className={row.showLabel ? 'hockey-public-info__contact-label' : 'hockey-sr-only'}>
            {row.label}:{' '}
          </span>
          <span data-testid={testId('players', 'public-info', 'text', row.key, playerId)}>
            {row.value}
          </span>
        </li>
      ))}
    </ul>
  )
}

function TeamRow({
  team,
  jerseyNumber,
  playerId,
}: {
  team: Pick<Team, 'id' | 'name' | 'logoUrl'>
  jerseyNumber: string
  playerId: string
}) {
  return (
    <Link
      to={`/teams/${team.id}`}
      className="hockey-public-info__team hockey-public-info__team-link"
      data-testid={testId('players', 'public-info', 'link', 'team', team.id)}
      aria-label={`Команда ${team.name}`}
    >
      {team.logoUrl ? (
        <img
          src={team.logoUrl}
          alt=""
          className="hockey-public-info__team-logo"
          data-testid={testId('players', 'public-info', 'img', 'team-logo', team.id)}
        />
      ) : (
        <span
          className="hockey-public-info__team-fallback"
          aria-hidden
          data-testid={testId('players', 'public-info', 'icon', 'team-fallback', team.id)}
        >
          <Icon data={Shield} size={18} />
        </span>
      )}
      <span
        className="hockey-public-info__team-name"
        data-testid={testId('players', 'public-info', 'text', 'team', `${playerId}-${team.id}`)}
      >
        {team.name} (игровой номер: {jerseyNumber})
      </span>
    </Link>
  )
}

/**
 * @spec HOCFRONT-22 — публичная информация: команды, амплуа, био, ачивки, история
 * Район и метро намеренно не показываются.
 */
export function PlayerPublicInfoSection({
  player,
  contactsVisible,
  participationHistoryVisible,
  participationHistory,
  hideHistory = false,
  visibleFields,
  visibleContacts,
  moreTo,
}: PlayerPublicInfoSectionProps) {
  const history = participationHistory ?? []
  const showHistory = !hideHistory && participationHistoryVisible && history.length > 0
  const jerseyNumber = String(player.userId.replace(/\D/g, '').slice(-2) || '00').padStart(2, '0')
  const showTeams = isVisible(visibleFields, 'teams')
  const contacts =
    visibleContacts ??
    (contactsVisible && isVisible(visibleFields, 'phone') ? player.contacts : undefined)
  const hasContacts = Boolean(
    contacts && (contacts.phone || contacts.email || contacts.telegram || contacts.maxMessenger),
  )

  const {data: teams = [], isLoading: isTeamsLoading} = useQuery({
    queryKey: ['teams', 'by-player', player.userId],
    queryFn: () => fetchTeams({playerId: player.userId}),
    enabled: Boolean(player.userId) && showTeams,
  })

  const fallbackTeams: Array<Pick<Team, 'id' | 'name' | 'logoUrl'>> =
    teams.length === 0 && player.teamName
      ? [
          {
            id: player.teamIds?.[0] ?? `fallback-${player.userId}`,
            name: player.teamName,
            logoUrl: player.teamLogoUrl,
          },
        ]
      : []

  const displayTeams = teams.length > 0 ? teams : fallbackTeams
  const teamsLabel = displayTeams.length > 1 ? 'Команды' : 'Команда'
  const showPosition = isVisible(visibleFields, 'position')
  const positionText = showPosition
    ? (POSITION_LABELS[player.position] ?? player.position).trim()
    : ''
  const skillText = isVisible(visibleFields, 'skillLevel') ? getPlayerLevelLabel(player).trim() : ''
  const showSkillText = Boolean(skillText && skillText !== '—')
  const showCity = isVisible(visibleFields, 'city') && player.city.trim() !== ''
  const bioText = player.bio?.trim() ?? ''
  const showBioText = isVisible(visibleFields, 'bio') && bioText !== ''
  const roleLabel = [positionText && 'Амплуа', showSkillText && 'Уровень']
    .filter(Boolean)
    .join(' / ')
  const cityLabel = [showCity && 'Город', showBioText && 'О себе'].filter(Boolean).join(' / ')

  return (
    <IceCard
      padding="m"
      className="hockey-public-info"
      data-testid={testId('players', 'public-info', 'card', player.userId)}
    >
      <div className="hockey-stack hockey-stack--gap-16">
        <div className="hockey-section-head">
          <Text
            variant="subheader-2"
            className="hockey-public-info__title"
            data-testid={testId('players', 'public-info', 'text', 'title', player.userId)}
          >
            Публичная информация
          </Text>
          {moreTo ? (
            <Link
              to={moreTo}
              className="hockey-section-link hockey-public-info__more"
              data-testid={testId('players', 'public-info', 'link', 'more', player.userId)}
            >
              Подробнее
            </Link>
          ) : null}
        </div>

        <dl
          className="hockey-public-info__facts"
          data-testid={testId('players', 'public-info', 'panel', 'facts', player.userId)}
        >
          {showTeams && (
            <div data-testid={testId('players', 'public-info', 'panel', 'teams', player.userId)}>
              <dt>{teamsLabel}</dt>
              <dd>
                {isTeamsLoading && displayTeams.length === 0 ? (
                  <Text
                    color="secondary"
                    data-testid={testId(
                      'players',
                      'public-info',
                      'text',
                      'teams-loading',
                      player.userId,
                    )}
                  >
                    Загрузка команд…
                  </Text>
                ) : displayTeams.length > 0 ? (
                  <ul
                    className="hockey-public-info__teams"
                    data-testid={testId('players', 'public-info', 'list', 'teams', player.userId)}
                  >
                    {displayTeams.map((team) => (
                      <li key={team.id}>
                        {team.id.startsWith('fallback-') ? (
                          <div
                            className="hockey-public-info__team"
                            data-testid={testId(
                              'players',
                              'public-info',
                              'panel',
                              'team',
                              player.userId,
                            )}
                          >
                            {team.logoUrl ? (
                              <img
                                src={team.logoUrl}
                                alt=""
                                className="hockey-public-info__team-logo"
                                data-testid={testId(
                                  'players',
                                  'public-info',
                                  'img',
                                  'team-logo',
                                  player.userId,
                                )}
                              />
                            ) : (
                              <span className="hockey-public-info__team-fallback" aria-hidden>
                                <Icon data={Shield} size={18} />
                              </span>
                            )}
                            <span
                              className="hockey-public-info__team-name"
                              data-testid={testId(
                                'players',
                                'public-info',
                                'text',
                                'team',
                                player.userId,
                              )}
                            >
                              {team.name} (игровой номер: {jerseyNumber})
                            </span>
                          </div>
                        ) : (
                          <TeamRow
                            team={team}
                            jerseyNumber={jerseyNumber}
                            playerId={player.userId}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Text
                    color="secondary"
                    data-testid={testId(
                      'players',
                      'public-info',
                      'text',
                      'teams-empty',
                      player.userId,
                    )}
                  >
                    Не состоит в команде
                  </Text>
                )}
              </dd>
            </div>
          )}

          {roleLabel && (
            <div>
              <dt>{roleLabel}</dt>
              <dd>
                {positionText && (
                  <span
                    data-testid={testId('players', 'public-info', 'text', 'role', player.userId)}
                  >
                    {positionText}
                  </span>
                )}
                {positionText && showSkillText ? ' · ' : null}
                {showSkillText && (
                  <span
                    data-testid={testId('players', 'public-info', 'text', 'skill', player.userId)}
                  >
                    {skillText}
                  </span>
                )}
              </dd>
            </div>
          )}

          {cityLabel && (
            <div>
              <dt>{cityLabel}</dt>
              <dd>
                {showCity && (
                  <span
                    data-testid={testId('players', 'public-info', 'text', 'city', player.userId)}
                  >
                    {player.city}
                  </span>
                )}
                {showCity && showBioText ? ' · ' : null}
                {showBioText ? (
                  <span
                    data-testid={testId('players', 'public-info', 'text', 'bio', player.userId)}
                  >
                    {bioText}
                  </span>
                ) : null}
              </dd>
            </div>
          )}

          <div className="hockey-public-info__contacts-row">
            <dt>Контакты:</dt>
            <dd>
              {hasContacts && contacts ? (
                <ContactsList contacts={contacts} playerId={player.userId} />
              ) : contactsVisible ? (
                <Text
                  color="secondary"
                  data-testid={testId(
                    'players',
                    'public-info',
                    'text',
                    'contacts-visible',
                    player.userId,
                  )}
                >
                  Доступны по согласию игрока.
                </Text>
              ) : (
                <Text
                  color="secondary"
                  data-testid={testId(
                    'players',
                    'public-info',
                    'text',
                    'contacts-hidden',
                    player.userId,
                  )}
                >
                  Скрыты настройками приватности.
                </Text>
              )}
            </dd>
          </div>
        </dl>

        {isVisible(visibleFields, 'achievements') &&
          player.achievements &&
          player.achievements.length > 0 && (
            <div
              className="hockey-public-info__achievements-block"
              data-testid={testId('players', 'public-info', 'panel', 'achievements', player.userId)}
            >
              <p className="hockey-public-info__achievements-title">Микро-ачивки</p>
              <ul
                className="hockey-public-info__achievements"
                data-testid={testId(
                  'players',
                  'public-info',
                  'list',
                  'achievements',
                  player.userId,
                )}
              >
                {player.achievements.map((ach, index) => (
                  <li
                    key={ach}
                    className={`hockey-public-info__achievement hockey-public-info__achievement--${
                      ACHIEVEMENT_TONES[index % ACHIEVEMENT_TONES.length]
                    }`}
                    data-testid={testId(
                      'players',
                      'public-info',
                      'item',
                      'achievement',
                      `${player.userId}-${ach}`,
                    )}
                  >
                    {ach}
                  </li>
                ))}
              </ul>
            </div>
          )}

        {showHistory && (
          <div
            className="hockey-stack hockey-stack--gap-8"
            data-testid={testId('players', 'public-info', 'panel', 'history', player.userId)}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('players', 'public-info', 'text', 'history-title', player.userId)}
            >
              История участия
            </Text>
            <ul
              className="profile-hub__history"
              data-testid={testId('players', 'public-info', 'list', 'history', player.userId)}
            >
              {history.map((record) => (
                <li
                  key={record.eventId}
                  className="profile-hub__history-item"
                  data-testid={testId('players', 'public-info', 'item', 'history', record.eventId)}
                >
                  <div>
                    <Text
                      variant="subheader-2"
                      data-testid={testId(
                        'players',
                        'public-info',
                        'text',
                        'history-event',
                        record.eventId,
                      )}
                    >
                      {record.eventTitle}
                    </Text>
                    <Text
                      color="secondary"
                      data-testid={testId(
                        'players',
                        'public-info',
                        'text',
                        'history-date',
                        record.eventId,
                      )}
                    >
                      {new Date(record.eventDate).toLocaleDateString('ru-RU')}
                      {record.teamName ? ` · ${record.teamName}` : ''}
                    </Text>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </IceCard>
  )
}
