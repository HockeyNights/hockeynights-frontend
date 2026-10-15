import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import {Link, useParams} from 'react-router'

import {fetchEventById} from '@/entities/event'
import {fetchPlayers} from '@/entities/profile'
import {fetchTeams} from '@/entities/team'
import {canManageClubEntity, useSessionAccess} from '@/features/access'
import {
  ACCESS_LABELS,
  canViewTraining,
  countOpenSlots,
  EventFactRow,
  EventOrganizerCard,
  EventSlotsCard,
  EventStatTile,
  EventStatusPill,
  formatEventLongDate,
  formatEventPriceRub,
  formatEventTimeRange,
  getUserClubIds,
  getUserTeamIds,
  resolveTrainingUserName,
  SKILL_LEVEL_LABELS,
  TRAINING_FORMAT_LABELS,
  TrainingRegistrationControl,
} from '@/features/events'
import {isNotFoundError} from '@/shared/api/client'
import {LAUNCH_REGION} from '@/shared/config/geo'
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

export function TrainingDetailsPage() {
  const {eventId = ''} = useParams()
  const {userId, roles, session, canOrganizeEvents} = useSessionAccess()
  const {
    data: event,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEventById(eventId),
    enabled: Boolean(eventId),
  })
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: () => fetchTeams()})
  const {data: players = []} = useQuery({
    queryKey: ['players'],
    queryFn: () => fetchPlayers(),
  })

  const userTeamIds = useMemo(() => getUserTeamIds(teams, userId), [teams, userId])
  const userClubIds = useMemo(() => getUserClubIds(teams, userId), [teams, userId])
  const playerNames = useMemo(
    () => Object.fromEntries(players.map((player) => [player.userId, player.displayName])),
    [players],
  )

  if (isLoading) {
    return (
      <PageHub data-testid={testId('events', 'training-page', 'loader')}>
        <ScoreboardLoader label="Загрузка тренировки..." />
      </PageHub>
    )
  }

  if (error && !isNotFoundError(error)) {
    return (
      <PageHub>
        <QueryErrorState
          title="Не удалось загрузить тренировку"
          onRetry={() => void refetch()}
          testIdPrefix="events"
          data-testid={testId('events', 'training-page', 'error')}
        />
      </PageHub>
    )
  }

  if (!event || event.type !== 'training') {
    return (
      <PageHub>
        <PageBackLink
          to={routes.events}
          label="К списку тренировок"
          testIdPrefix="events"
          testIdSection="training-page"
        />
        <PageStatePanel
          title="Тренировка не найдена"
          copy="Вернитесь к списку и выберите актуальную тренировку."
          testIdPrefix="events"
          data-testid={testId('events', 'training-page', 'empty')}
        />
      </PageHub>
    )
  }

  const canManageClub = canManageClubEntity(session, event.clubId)
  const partnerClubIds = (session?.user.partnerMemberships ?? [])
    .filter((membership) => membership.kind === 'club')
    .map((membership) => membership.entityId)

  if (
    !canViewTraining(event, userId, userTeamIds, {
      isAdmin: roles.includes('admin'),
      canManageClub,
      userClubIds: [...new Set([...userClubIds, ...partnerClubIds])],
    })
  ) {
    return (
      <PageHub data-testid={testId('events', 'training-page', 'error', 'access-denied')}>
        <PageBackLink
          to={routes.events}
          label="К списку тренировок"
          testIdPrefix="events"
          testIdSection="training-page"
        />
        <PageStatePanel
          title="Нет доступа к тренировке"
          copy="Эта тренировка доступна только участникам клуба или приглашённым игрокам."
          testIdPrefix="events"
        />
      </PageHub>
    )
  }

  const accessLabel = event.accessScope ? ACCESS_LABELS[event.accessScope] : 'Тип доступа не задан'
  const organizerName = resolveTrainingUserName(event.organizerUserId, event, playerNames)
  const contactPhone = event.organizerPhone
  const currentStatus = event.participation.find((item) => item.userId === userId)?.status
  const seats = countOpenSlots(event)
  const allowedUsers = event.allowedUserIds?.map((allowedUserId) =>
    resolveTrainingUserName(allowedUserId, event, playerNames),
  )
  const canEdit =
    canOrganizeEvents &&
    (event.organizerUserId === userId || roles.includes('admin') || roles.includes('club_admin'))
  const isFull = event.registrationStatus === 'full'

  return (
    <PageHub
      className="event-details"
      data-testid={testId('events', 'training-page', 'page', event.id)}
    >
      <PageBackLink
        to={routes.events}
        label="К списку тренировок"
        testIdPrefix="events"
        testIdSection="training-page"
      />

      <div className="event-details__grid">
        <div className="event-details__main">
          <IceCard padding="l" className="event-details__hero">
            <div
              className="event-details__hero-head"
              data-testid={testId('events', 'training-page', 'header')}
            >
              <div className="event-details__hero-copy">
                <div
                  className="event-details__badges"
                  data-testid={testId('events', 'training-page', 'text', 'subtitle')}
                >
                  {event.lifecycleStatus === 'draft' && (
                    <span className="hockey-badge hockey-badge--gold">Черновик</span>
                  )}
                  {event.lifecycleStatus === 'cancelled' && (
                    <span className="hockey-badge hockey-badge--red">Отменена</span>
                  )}
                  <span className="hockey-badge">Тренировка</span>
                  <span className="hockey-badge hockey-badge--muted">{accessLabel}</span>
                </div>
                <Text
                  variant="header-1"
                  as="h1"
                  className="event-details__title"
                  data-testid={testId('events', 'training-page', 'text', 'title')}
                >
                  {event.title}
                </Text>
              </div>
              {canEdit ? (
                <HockeyButton
                  view="outlined"
                  size="l"
                  component={Link}
                  to={`/events/trainings/${event.id}/edit`}
                  data-testid={testId('events', 'training-page', 'btn', 'edit', event.id)}
                >
                  Редактировать
                </HockeyButton>
              ) : null}
            </div>

            <div
              className="event-details__body"
              data-testid={testId('events', 'training-page', 'panel', 'meta', event.id)}
            >
              <h2
                className="event-details__sr-only"
                data-testid={testId('events', 'training-page', 'text', 'meta-title', event.id)}
              >
                Детали тренировки
              </h2>
              <div className="event-details__tiles">
                <EventStatTile
                  label="Время и дата"
                  value={formatEventTimeRange(event.startsAt, event.endsAt)}
                  hint={formatEventLongDate(event.startsAt)}
                  data-testid={testId('events', 'training-page', 'card', 'schedule', event.id)}
                />
                <EventStatTile
                  label="Стоимость участия"
                  tone="teal"
                  value={formatEventPriceRub(event.pricePerPlayer)}
                  hint={event.pricePerPlayer ? 'С игрока за тренировку' : 'Членский клубный сбор'}
                  data-testid={testId('events', 'training-page', 'text', 'price', event.id)}
                />
              </div>

              <div className="event-details__facts">
                <EventFactRow
                  label="Арена и локация"
                  hint={
                    <span
                      data-testid={testId('events', 'training-page', 'text', 'region', event.id)}
                    >
                      {LAUNCH_REGION}
                      {event.district ? ` · ${event.district}` : ''}
                    </span>
                  }
                  data-testid={testId('events', 'training-page', 'text', 'arena', event.id)}
                >
                  <Link
                    to={`/arenas/${event.arenaId}`}
                    data-testid={testId('events', 'training-page', 'link', 'arena', event.id)}
                  >
                    {event.arenaName ?? event.arenaId}
                  </Link>
                </EventFactRow>
                <EventFactRow
                  label="Рекомендованный уровень"
                  data-testid={testId('events', 'training-page', 'text', 'level', event.id)}
                >
                  {SKILL_LEVEL_LABELS[event.requiredSkillLevel]}
                </EventFactRow>
                {event.trainingFormat && (
                  <EventFactRow
                    label="Формат"
                    data-testid={testId('events', 'training-page', 'text', 'format', event.id)}
                  >
                    {TRAINING_FORMAT_LABELS[event.trainingFormat]}
                  </EventFactRow>
                )}
                <EventFactRow
                  label="Статус набора"
                  data-testid={testId(
                    'events',
                    'training-page',
                    'text',
                    'registration-status',
                    event.id,
                  )}
                >
                  <EventStatusPill tone={isFull ? 'red' : 'green'}>
                    {isFull ? 'Состав укомплектован' : 'Открыт для записи'}
                  </EventStatusPill>
                </EventFactRow>
                <EventFactRow
                  label="Свободные места"
                  data-testid={testId('events', 'training-page', 'text', 'seats', event.id)}
                >
                  <span className="event-details__tone--accent">
                    {seats.open} из {seats.total} мест свободно
                  </span>
                </EventFactRow>
                <EventFactRow
                  label="Организатор"
                  data-testid={testId('events', 'training-page', 'text', 'organizer', event.id)}
                >
                  {organizerName}
                </EventFactRow>
                {allowedUsers?.length ? (
                  <EventFactRow
                    label="Доступ ограничен списком"
                    data-testid={testId(
                      'events',
                      'training-page',
                      'text',
                      'allowed-users',
                      event.id,
                    )}
                  >
                    {allowedUsers.join(', ')}
                  </EventFactRow>
                ) : null}
              </div>
            </div>
          </IceCard>

          <section className="events-screen__section">
            <SectionHeading
              title={
                <span
                  data-testid={testId('events', 'training-page', 'text', 'slots-title', event.id)}
                >
                  Слоты и укомплектованность
                </span>
              }
            />
            <EventSlotsCard
              event={event}
              section="training-page"
              currentUserId={userId}
              resolveName={(id) => resolveTrainingUserName(id, event, playerNames)}
            />
          </section>
        </div>

        <aside className="event-details__aside">
          <section className="events-screen__section">
            <SectionHeading
              title={
                <span
                  data-testid={testId(
                    'events',
                    'training-page',
                    'text',
                    'contacts-title',
                    event.id,
                  )}
                >
                  Контакты организатора
                </span>
              }
            />
            <EventOrganizerCard
              eventId={event.id}
              section="training-page"
              organizerName={organizerName}
              organizerUserId={event.organizerUserId}
              roleLabel="Главный координатор сборов"
              phone={contactPhone}
              showPrepay
            />
          </section>

          <section className="events-screen__section">
            <SectionHeading
              title={
                <span
                  data-testid={testId(
                    'events',
                    'training-page',
                    'text',
                    'registration-title',
                    event.id,
                  )}
                >
                  Запись на тренировку
                </span>
              }
            />
            <IceCard padding="m">
              <div
                data-testid={testId('events', 'training-page', 'panel', 'registration', event.id)}
              >
                <TrainingRegistrationControl
                  eventId={event.id}
                  currentStatus={currentStatus}
                  registrationStatus={event.registrationStatus}
                  currentUserId={userId}
                  layout="panel"
                />
              </div>
            </IceCard>
          </section>
        </aside>
      </div>
    </PageHub>
  )
}
