/**
 * HOCFRONT-25 / TASK-04-03 — публичный профиль команды
 */

import {Person} from '@gravity-ui/icons'
import {Icon, Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {type ReactNode, useState} from 'react'
import {Link, useLocation, useNavigate, useParams} from 'react-router'

import {
  fetchTeam,
  fetchTeamCalendarEvents,
  fetchTeamClubProfile,
  fetchTeamRoster,
} from '@/entities/team'
import {canManageClubEntity, useSessionAccess} from '@/features/access'
import {SKILL_LEVEL_LABELS} from '@/features/events'
import {FavoriteButton} from '@/features/favorites'
import {
  ContactStaffModal,
  groupByPosition,
  STAFF_ROLE_LABELS,
  TeamCalendarSection,
  TeamPositionBadge,
} from '@/features/teams'
import {isNotFoundError} from '@/shared/api/client'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {PageBackLink} from '@/shared/ui/PageBackLink'
import {PageHub} from '@/shared/ui/PageHub'
import {PageStatePanel} from '@/shared/ui/PageStatePanel'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {SectionHeading} from '@/shared/ui/SectionHeading'

/** Роли, которые в макете подсвечены зелёным. */
const LEAD_TEAM_ROLES = new Set(['owner', 'captain'])

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

function CollapseToggle({
  open,
  onToggle,
  'data-testid': dataTestId,
}: {
  open: boolean
  onToggle: () => void
  'data-testid'?: string
}) {
  return (
    <button
      type="button"
      className="hockey-section-link team-profile__toggle"
      aria-expanded={open}
      onClick={onToggle}
      data-testid={dataTestId}
    >
      {open ? 'Скрыть' : 'Показать'}
    </button>
  )
}

function InfoLine({
  label,
  children,
  'data-testid': dataTestId,
}: {
  label: string
  children: ReactNode
  'data-testid'?: string
}) {
  return (
    <p className="team-profile__info-line" data-testid={dataTestId}>
      <span className="team-profile__info-label">{label}:</span> <strong>{children}</strong>
    </p>
  )
}

/** HOCFRONT-25 — публичная страница команды */
export function TeamProfilePage() {
  const {teamId = ''} = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [contactOpen, setContactOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(true)
  const [infoOpen, setInfoOpen] = useState(true)

  const {session} = useSessionAccess()
  const {
    data: team,
    isLoading: teamLoading,
    error: teamError,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => fetchTeam(teamId),
    enabled: Boolean(teamId),
  })
  const {data: roster = []} = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchTeamRoster(teamId),
    enabled: Boolean(teamId),
  })
  const {data: club} = useQuery({
    queryKey: ['club-profile', teamId],
    queryFn: () => fetchTeamClubProfile(teamId),
    enabled: Boolean(teamId),
  })
  const {data: calendar = []} = useQuery({
    queryKey: ['team-calendar', teamId],
    queryFn: () => fetchTeamCalendarEvents(teamId),
    enabled: Boolean(teamId),
  })

  function handleBack() {
    if (location.key === 'default') {
      navigate(routes.teams, {replace: true})
      return
    }
    navigate(-1)
  }

  if (teamLoading) {
    return (
      <PageHub data-testid={testId('teams', 'profile', 'loader')}>
        <ScoreboardLoader label="Загрузка профиля команды" />
      </PageHub>
    )
  }

  // Сбой загрузки ≠ «команда не найдена»: предлагаем повторить
  if (teamError && !isNotFoundError(teamError)) {
    return (
      <PageHub>
        <QueryErrorState
          title="Не удалось загрузить профиль команды"
          onRetry={() => void refetchTeam()}
          testIdPrefix="teams"
          data-testid={testId('teams', 'profile', 'error')}
        />
      </PageHub>
    )
  }

  if (!team) {
    return (
      <PageHub data-testid={testId('teams', 'profile', 'page', 'not-found')}>
        <PageBackLink
          label="Вернуться"
          onClick={handleBack}
          testIdPrefix="teams"
          testIdSection="profile"
        />
        <PageStatePanel
          title="Команда не найдена"
          copy="Вернитесь к каталогу и выберите команду из списка."
          testIdPrefix="teams"
          data-testid={testId('teams', 'profile', 'card', 'not-found')}
        />
      </PageHub>
    )
  }

  const clubId = club?.id ?? team.clubId
  const canManageClub = canManageClubEntity(session, clubId)

  const activeRoster = roster.filter((member) => member.rosterStatus !== 'removed')
  const rosterGroups = groupByPosition(activeRoster)
  const staff = club?.staff ?? []
  const description = team.description || team.shortDescription
  const skillLabel = SKILL_LEVEL_LABELS[team.skillLevel] ?? team.skillLevel

  return (
    <PageHub className="team-profile" data-testid={testId('teams', 'profile', 'page', team.id)}>
      <PageBackLink
        label="Вернуться"
        onClick={handleBack}
        testIdPrefix="teams"
        testIdSection="profile"
      />

      <section
        className="team-profile__hero"
        data-testid={testId('teams', 'profile', 'panel', 'hero', team.id)}
      >
        <div className="team-profile__identity">
          <div className="team-profile__hero-top">
            <span
              className="team-avatar-tile team-profile__avatar"
              aria-hidden
              data-testid={
                team.logoUrl ? undefined : testId('teams', 'profile', 'icon', 'crest', team.id)
              }
            >
              {team.logoUrl ? (
                <img
                  src={team.logoUrl}
                  alt=""
                  className="team-avatar-tile__img"
                  data-testid={testId('teams', 'profile', 'img', 'logo', team.id)}
                />
              ) : (
                <Icon data={Person} size={32} />
              )}
            </span>

            <div className="team-profile__hero-copy">
              <Text
                as="h1"
                className="team-profile__title"
                data-testid={testId('teams', 'profile', 'text', 'title', team.id)}
              >
                {team.name}
              </Text>
              <Text
                color="secondary"
                className="team-profile__subline"
                data-testid={testId('teams', 'profile', 'text', 'city', team.id)}
              >
                {team.city}
                {club ? ` · ${club.name}` : ''}
              </Text>
              {team.shortDescription && (
                <Text
                  color="secondary"
                  className="team-profile__subline"
                  data-testid={testId('teams', 'profile', 'text', 'short', team.id)}
                >
                  {team.shortDescription}
                </Text>
              )}
            </div>

            <FavoriteButton
              type="team"
              entityId={team.id}
              title={team.name}
              size="m"
              className="team-favorite team-favorite--s"
            />
          </div>

          <div
            className="team-profile__meta"
            data-testid={testId('teams', 'profile', 'panel', 'meta', team.id)}
          >
            <span
              className="team-profile__pill"
              data-testid={testId('teams', 'profile', 'badge', 'skill', team.id)}
            >
              {skillLabel}
            </span>
            <span
              className="team-profile__pill"
              data-testid={testId('teams', 'profile', 'badge', 'roster', team.id)}
            >
              В составе: {activeRoster.length}
            </span>
            {team.leagueId && (
              <span
                className="team-profile__pill"
                data-testid={testId('teams', 'profile', 'badge', 'league', team.id)}
              >
                В лиге
              </span>
            )}
          </div>
        </div>

        <div
          className="team-profile__contact"
          data-testid={testId('teams', 'profile', 'panel', 'actions', team.id)}
        >
          {description && (
            <Text
              color="secondary"
              className="team-profile__lead"
              data-testid={testId('teams', 'profile', 'text', 'description', team.id)}
            >
              {description}
            </Text>
          )}
          <HockeyButton
            view="action"
            size="l"
            width="max"
            onClick={() => setContactOpen(true)}
            data-testid={testId('teams', 'profile', 'btn', 'contact-staff', team.id)}
          >
            Связаться со штабом
          </HockeyButton>
          {canManageClub && clubId && (
            <HockeyButton
              view="outlined"
              size="l"
              width="max"
              component={Link}
              to={`/partner/clubs/${clubId}`}
              data-testid={testId('teams', 'profile', 'btn', 'club-cabinet', team.id)}
            >
              Кабинет клуба
            </HockeyButton>
          )}
          <Text
            color="secondary"
            className="team-profile__hint"
            data-testid={testId('teams', 'profile', 'text', 'contact-hint', team.id)}
          >
            Откроет форму заявки в штаб — без перехода в мессенджер.
          </Text>
        </div>
      </section>

      <ContactStaffModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        teamId={team.id}
        teamName={team.name}
        clubName={club?.name}
      />

      <div
        className="team-profile__sections"
        data-testid={testId('teams', 'profile', 'panel', 'sections', team.id)}
      >
        <div className="team-profile__column">
          <section
            className="team-profile__section"
            data-testid={testId('teams', 'profile', 'accordion', 'roster', team.id)}
          >
            <SectionHeading title="Состав" />
            <IceCard
              padding="m"
              className="team-profile__card"
              data-testid={testId('teams', 'profile', 'card', 'sections', team.id)}
            >
              <div
                className="team-profile__list"
                data-testid={testId('teams', 'profile', 'list', 'roster', team.id)}
              >
                {activeRoster.length === 0 && (
                  <Text
                    color="secondary"
                    data-testid={testId('teams', 'profile', 'empty', 'roster', team.id)}
                  >
                    Состав пока пуст
                  </Text>
                )}
                {rosterGroups.map((group) => (
                  <div
                    key={group.position}
                    className="team-profile__group"
                    data-testid={testId('teams', 'profile', 'group', group.position, team.id)}
                  >
                    <p className="team-group-label">{group.label}</p>
                    <ul className="team-profile__rows">
                      {group.members.map((member) => (
                        <li
                          key={member.userId}
                          className="hockey-list-row team-person-row"
                          data-testid={testId('teams', 'profile', 'row', 'roster', member.userId)}
                        >
                          <span className="team-person-row__avatar" aria-hidden>
                            {initialOf(member.displayName)}
                          </span>
                          <span className="team-person-row__body">
                            <Link
                              to={`/players/${member.userId}`}
                              className="team-person-row__name"
                              data-testid={testId(
                                'teams',
                                'profile',
                                'link',
                                'player',
                                member.userId,
                              )}
                            >
                              <span
                                data-testid={testId(
                                  'teams',
                                  'profile',
                                  'text',
                                  'player-name',
                                  member.userId,
                                )}
                              >
                                {member.displayName}
                              </span>
                            </Link>
                            <TeamPositionBadge position={member.position} />
                          </span>
                          <span
                            className={`team-person-row__role${
                              member.teamRole && LEAD_TEAM_ROLES.has(member.teamRole)
                                ? ' is-lead'
                                : ''
                            }`}
                            data-testid={testId(
                              'teams',
                              'profile',
                              'text',
                              'player-meta',
                              member.userId,
                            )}
                          >
                            {member.teamRole ?? 'player'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </IceCard>
          </section>

          <section
            className="team-profile__section"
            data-testid={testId('teams', 'profile', 'accordion', 'staff', team.id)}
          >
            <SectionHeading title="Штаб" />
            <IceCard padding="m" className="team-profile__card">
              <ul
                className="team-profile__rows"
                data-testid={testId('teams', 'profile', 'list', 'staff', team.id)}
              >
                {staff.length === 0 && (
                  <Text
                    as="p"
                    color="secondary"
                    data-testid={testId('teams', 'profile', 'empty', 'staff', team.id)}
                  >
                    Штаб не указан — можно оставить заявку через форму выше.
                  </Text>
                )}
                {staff.map((member) => (
                  <li
                    key={member.userId}
                    className="hockey-list-row team-person-row"
                    data-testid={testId('teams', 'profile', 'row', 'staff', member.userId)}
                  >
                    <span className="team-person-row__avatar" aria-hidden>
                      {initialOf(member.displayName)}
                    </span>
                    <span className="team-person-row__body">
                      <span
                        className="team-person-row__name"
                        data-testid={testId(
                          'teams',
                          'profile',
                          'text',
                          'staff-name',
                          member.userId,
                        )}
                      >
                        {member.displayName}
                      </span>
                    </span>
                    <span
                      className={`team-person-row__role${
                        member.role === 'head_coach' ? ' is-lead' : ''
                      }`}
                      data-testid={testId('teams', 'profile', 'text', 'staff-role', member.userId)}
                    >
                      {STAFF_ROLE_LABELS[member.role]}
                    </span>
                  </li>
                ))}
              </ul>
            </IceCard>
          </section>
        </div>

        <div className="team-profile__column">
          <section
            className="team-profile__section"
            data-testid={testId('teams', 'profile', 'accordion', 'calendar', team.id)}
          >
            <SectionHeading
              title="Календарь"
              extra={
                <CollapseToggle
                  open={calendarOpen}
                  onToggle={() => setCalendarOpen((prev) => !prev)}
                  data-testid={testId('teams', 'profile', 'btn', 'toggle-calendar', team.id)}
                />
              }
            />
            {calendarOpen && (
              <IceCard padding="m" className="team-profile__card team-profile__calendar">
                <TeamCalendarSection
                  events={calendar}
                  emptyText="В календаре команды пока нет событий"
                  scope="team"
                  scopeId={team.id}
                />
              </IceCard>
            )}
          </section>

          <section
            className="team-profile__section"
            data-testid={testId('teams', 'profile', 'accordion', 'info', team.id)}
          >
            <SectionHeading
              title="Информация о команде"
              extra={
                <CollapseToggle
                  open={infoOpen}
                  onToggle={() => setInfoOpen((prev) => !prev)}
                  data-testid={testId('teams', 'profile', 'btn', 'toggle-info', team.id)}
                />
              }
            />
            {infoOpen && (
              <IceCard
                padding="m"
                className="team-profile__card team-profile__info"
                data-testid={testId('teams', 'profile', 'panel', 'info', team.id)}
              >
                <InfoLine
                  label="Город"
                  data-testid={testId('teams', 'profile', 'text', 'info-city', team.id)}
                >
                  {team.city}
                </InfoLine>
                <InfoLine
                  label="Уровень"
                  data-testid={testId('teams', 'profile', 'text', 'info-level', team.id)}
                >
                  {skillLabel}
                </InfoLine>
                {team.shortDescription && (
                  <p
                    className="team-profile__info-muted"
                    data-testid={testId('teams', 'profile', 'text', 'info-short', team.id)}
                  >
                    {team.shortDescription}
                  </p>
                )}
                {team.description && (
                  <p
                    className="team-profile__info-text"
                    data-testid={testId('teams', 'profile', 'text', 'info-description', team.id)}
                  >
                    {team.description}
                  </p>
                )}
                {club && (
                  <InfoLine
                    label="Клуб"
                    data-testid={testId('teams', 'profile', 'text', 'info-club', team.id)}
                  >
                    {club.name}
                  </InfoLine>
                )}
              </IceCard>
            )}
          </section>
        </div>
      </div>
    </PageHub>
  )
}
