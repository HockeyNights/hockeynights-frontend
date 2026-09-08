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
  formatEventPriceRub,
  getUserClubIds,
  getUserTeamIds,
  POSITION_LABELS,
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
import {PageHeader} from '@/shared/ui/PageHeader'
import {PageHub} from '@/shared/ui/PageHub'
import {PageStatePanel} from '@/shared/ui/PageStatePanel'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

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

  const start = new Date(event.startsAt)
  const end = new Date(event.endsAt)
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

  const scheduleSubtitle = `${start.toLocaleDateString('ru-RU')} · ${start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})} – ${end.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}`

  return (
    <PageHub data-testid={testId('events', 'training-page', 'page', event.id)}>
      <PageBackLink
        to={routes.events}
        label="К списку тренировок"
        testIdPrefix="events"
        testIdSection="training-page"
      />

      <PageHeader
        title={event.title}
        subtitle={`${accessLabel} · ${scheduleSubtitle}`}
        testIdPrefix="events"
        testIdSection="training-page"
        actions={
          canEdit ? (
            <HockeyButton
              view="outlined"
              size="m"
              component={Link}
              to={`/events/trainings/${event.id}/edit`}
              data-testid={testId('events', 'training-page', 'btn', 'edit', event.id)}
            >
              Редактировать
            </HockeyButton>
          ) : undefined
        }
      />

      <div className="page-hub__panel">
        <IceCard padding="m">
          <div
            className="hockey-stack hockey-stack--gap-10"
            data-testid={testId('events', 'training-page', 'panel', 'meta', event.id)}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('events', 'training-page', 'text', 'meta-title', event.id)}
            >
              Детали тренировки
            </Text>
            <Text data-testid={testId('events', 'training-page', 'text', 'arena', event.id)}>
              Арена:{' '}
              <Link
                to={`/arenas/${event.arenaId}`}
                data-testid={testId('events', 'training-page', 'link', 'arena', event.id)}
              >
                {event.arenaName ?? event.arenaId}
              </Link>
            </Text>
            <Text data-testid={testId('events', 'training-page', 'text', 'price', event.id)}>
              Стоимость: {formatEventPriceRub(event.pricePerPlayer)}
            </Text>
            <Text data-testid={testId('events', 'training-page', 'text', 'seats', event.id)}>
              Свободные места: {seats.open} из {seats.total}
            </Text>
            <Text
              data-testid={testId(
                'events',
                'training-page',
                'text',
                'registration-status',
                event.id,
              )}
            >
              Статус набора:{' '}
              {event.registrationStatus === 'full' ? 'Состав укомплектован' : 'Открыт для записи'}
            </Text>
            <Text
              color="secondary"
              data-testid={testId('events', 'training-page', 'text', 'region', event.id)}
            >
              Регион: {LAUNCH_REGION}
              {event.district ? ` · ${event.district}` : ''}
            </Text>
            {event.trainingFormat && (
              <Text
                color="secondary"
                data-testid={testId('events', 'training-page', 'text', 'format', event.id)}
              >
                Формат: {TRAINING_FORMAT_LABELS[event.trainingFormat]}
              </Text>
            )}
            <Text
              color="secondary"
              data-testid={testId('events', 'training-page', 'text', 'level', event.id)}
            >
              Рекомендованный уровень: {SKILL_LEVEL_LABELS[event.requiredSkillLevel]}
            </Text>
            <Text
              color="secondary"
              data-testid={testId('events', 'training-page', 'text', 'organizer', event.id)}
            >
              Организатор: {organizerName}
            </Text>
            {allowedUsers?.length ? (
              <Text
                color="secondary"
                data-testid={testId('events', 'training-page', 'text', 'allowed-users', event.id)}
              >
                Доступ ограничен списком: {allowedUsers.join(', ')}
              </Text>
            ) : null}
          </div>
        </IceCard>

        <IceCard padding="m">
          <div
            className="hockey-stack hockey-stack--gap-8"
            data-testid={testId('events', 'training-page', 'panel', 'slots', event.id)}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('events', 'training-page', 'text', 'slots-title', event.id)}
            >
              Слоты и укомплектованность
            </Text>
            {event.requiredSlots.map((slot) => (
              <Text
                key={slot.position}
                data-testid={testId(
                  'events',
                  'training-page',
                  'text',
                  'slot',
                  event.id,
                  slot.position,
                )}
              >
                {POSITION_LABELS[slot.position]}: {slot.filledCount}/{slot.count}
              </Text>
            ))}
          </div>
        </IceCard>

        <IceCard padding="m">
          <div
            className="hockey-stack hockey-stack--gap-10"
            data-testid={testId('events', 'training-page', 'panel', 'contacts', event.id)}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('events', 'training-page', 'text', 'contacts-title', event.id)}
            >
              Контакты организатора
            </Text>
            <Text data-testid={testId('events', 'training-page', 'text', 'owner', event.id)}>
              {organizerName}
            </Text>
            <div className="page-hub__actions">
              <HockeyButton
                view="outlined"
                size="m"
                component={Link}
                to={`/messenger?userId=${event.organizerUserId}`}
                data-testid={testId('events', 'training-page', 'btn', 'messenger', event.id)}
              >
                Связаться в мессенджере
              </HockeyButton>
              {contactPhone ? (
                <HockeyButton
                  view="outlined"
                  size="m"
                  href={`tel:${contactPhone.replace(/[^\d+]/g, '')}`}
                  data-testid={testId('events', 'training-page', 'btn', 'phone', event.id)}
                >
                  {contactPhone}
                </HockeyButton>
              ) : null}
              <HockeyButton
                view="action"
                size="m"
                disabled
                data-testid={testId('events', 'training-page', 'btn', 'prepay', event.id)}
              >
                Внести предоплату (скоро)
              </HockeyButton>
            </div>
          </div>
        </IceCard>

        <IceCard padding="m">
          <div
            className="hockey-stack hockey-stack--gap-8"
            data-testid={testId('events', 'training-page', 'panel', 'registration', event.id)}
          >
            <Text
              variant="subheader-2"
              data-testid={testId(
                'events',
                'training-page',
                'text',
                'registration-title',
                event.id,
              )}
            >
              Запись на тренировку
            </Text>
            <TrainingRegistrationControl
              eventId={event.id}
              currentStatus={currentStatus}
              registrationStatus={event.registrationStatus}
              currentUserId={userId}
            />
          </div>
        </IceCard>
      </div>
    </PageHub>
  )
}
