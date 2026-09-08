import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import {Link, useParams} from 'react-router'

import {fetchEventById} from '@/entities/event'
import {fetchPlayers} from '@/entities/profile'
import {useSessionAccess} from '@/features/access'
import {
  ACCESS_LABELS,
  EVENT_TYPE_LABELS,
  EventRsvpBoard,
  formatEventPriceRub,
  POSITION_LABELS,
  resolveTrainingUserName,
  SKILL_LEVEL_LABELS,
  TrainingRegistrationControl,
} from '@/features/events'
import {TeamRsvpResponseControl} from '@/features/radar'
import {isNotFoundError} from '@/shared/api/client'
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

export function GameDetailsPage() {
  const {eventId = ''} = useParams()
  const {userId} = useSessionAccess()
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
  const {data: players = []} = useQuery({
    queryKey: ['players'],
    queryFn: () => fetchPlayers(),
  })

  const playerNames = useMemo(
    () => Object.fromEntries(players.map((player) => [player.userId, player.displayName])),
    [players],
  )

  if (isLoading) {
    return (
      <PageHub data-testid={testId('events', 'game-page', 'loader')}>
        <ScoreboardLoader label="Загрузка игры..." />
      </PageHub>
    )
  }

  if (error && !isNotFoundError(error)) {
    return (
      <PageHub>
        <QueryErrorState
          title="Не удалось загрузить игру"
          onRetry={() => void refetch()}
          testIdPrefix="events"
          data-testid={testId('events', 'game-page', 'error')}
        />
      </PageHub>
    )
  }

  if (!event || event.type !== 'game') {
    return (
      <PageHub>
        <PageBackLink
          to={routes.events}
          label="К списку игр"
          testIdPrefix="events"
          testIdSection="game-page"
        />
        <PageStatePanel
          title="Игра не найдена"
          copy="Вернитесь к списку и выберите актуальную игру."
          testIdPrefix="events"
          data-testid={testId('events', 'game-page', 'empty')}
        />
      </PageHub>
    )
  }

  const start = new Date(event.startsAt)
  const end = new Date(event.endsAt)
  const accessLabel = event.accessScope ? ACCESS_LABELS[event.accessScope] : 'Тип доступа не задан'
  const organizerName = resolveTrainingUserName(event.organizerUserId, event, playerNames)
  const contactPhone = event.organizerPhone ?? '+7 (900) 000-00-00'
  const currentStatus = event.participation.find((item) => item.userId === userId)?.status
  const requiredTotal = event.requiredSlots.reduce((acc, slot) => acc + slot.count, 0)
  const filledTotal = event.requiredSlots.reduce((acc, slot) => acc + slot.filledCount, 0)
  const fillPercent = requiredTotal > 0 ? Math.round((filledTotal / requiredTotal) * 100) : 0
  const priceLabel = formatEventPriceRub(event.pricePerPlayer)
  const scheduleSubtitle = `${start.toLocaleDateString('ru-RU')} · ${start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})} – ${end.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}`

  return (
    <PageHub data-testid={testId('events', 'game-page', 'page', event.id)}>
      <PageBackLink
        to={routes.events}
        label="К списку игр"
        testIdPrefix="events"
        testIdSection="game-page"
      />

      <PageHeader
        title={event.title}
        subtitle={`${EVENT_TYPE_LABELS[event.type]} · ${accessLabel} · ${scheduleSubtitle}`}
        testIdPrefix="events"
        testIdSection="game-page"
      />

      <div className="page-hub__panel">
        <IceCard padding="m">
          <div
            className="hockey-stack hockey-stack--gap-10"
            data-testid={testId('events', 'game-page', 'panel', 'meta', event.id)}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('events', 'game-page', 'text', 'meta-title', event.id)}
            >
              Детали игры
            </Text>
            <Text data-testid={testId('events', 'game-page', 'text', 'arena', event.id)}>
              Арена:{' '}
              <Link
                to={`/arenas/${event.arenaId}`}
                data-testid={testId('events', 'game-page', 'link', 'arena', event.id)}
              >
                {event.arenaName ?? event.arenaId}
              </Link>
              {event.district ? ` · ${event.district}` : ''}
            </Text>
            <Text data-testid={testId('events', 'game-page', 'text', 'price', event.id)}>
              Цена: {priceLabel}
            </Text>
            <Text data-testid={testId('events', 'game-page', 'text', 'fill', event.id)}>
              Заполненность: {filledTotal}/{requiredTotal} ({fillPercent}%)
            </Text>
            <Text
              data-testid={testId('events', 'game-page', 'text', 'registration-status', event.id)}
            >
              Статус набора:{' '}
              {event.registrationStatus === 'full' ? 'Состав укомплектован' : 'Открыт для записи'}
            </Text>
            <Text
              color="secondary"
              data-testid={testId('events', 'game-page', 'text', 'level', event.id)}
            >
              Рекомендованный уровень: {SKILL_LEVEL_LABELS[event.requiredSkillLevel]}
            </Text>
            {event.teamId && (
              <Text
                color="secondary"
                data-testid={testId('events', 'game-page', 'text', 'team', event.id)}
              >
                Команда:{' '}
                <Link
                  to={`/teams/${event.teamId}`}
                  data-testid={testId('events', 'game-page', 'link', 'team', event.id)}
                >
                  открыть профиль
                </Link>
              </Text>
            )}
            <Text
              color="secondary"
              data-testid={testId('events', 'game-page', 'text', 'organizer', event.id)}
            >
              Организатор: {organizerName}
            </Text>
          </div>
        </IceCard>

        <IceCard padding="m">
          <div
            className="hockey-stack hockey-stack--gap-8"
            data-testid={testId('events', 'game-page', 'panel', 'slots', event.id)}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('events', 'game-page', 'text', 'slots-title', event.id)}
            >
              Слоты и укомплектованность
            </Text>
            {event.requiredSlots.map((slot) => (
              <Text
                key={slot.position}
                data-testid={testId('events', 'game-page', 'text', 'slot', event.id, slot.position)}
              >
                {POSITION_LABELS[slot.position]}: {slot.filledCount}/{slot.count}
              </Text>
            ))}
          </div>
        </IceCard>

        {event.hasTeamRsvp && (
          <IceCard padding="m">
            <div
              className="hockey-stack hockey-stack--gap-8"
              data-testid={testId('events', 'game-page', 'panel', 'rsvp', event.id)}
            >
              <Text
                variant="subheader-2"
                data-testid={testId('events', 'game-page', 'text', 'rsvp-title', event.id)}
              >
                RSVP команды
              </Text>
              <EventRsvpBoard eventId={event.id} />
            </div>
          </IceCard>
        )}

        <IceCard padding="m">
          <div
            className="hockey-stack hockey-stack--gap-10"
            data-testid={testId('events', 'game-page', 'panel', 'contacts', event.id)}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('events', 'game-page', 'text', 'contacts-title', event.id)}
            >
              Контакты организатора
            </Text>
            <Text data-testid={testId('events', 'game-page', 'text', 'owner', event.id)}>
              {organizerName}
            </Text>
            <div className="page-hub__actions">
              <HockeyButton
                view="outlined"
                size="m"
                component={Link}
                to={`/messenger?userId=${event.organizerUserId}`}
                data-testid={testId('events', 'game-page', 'btn', 'messenger', event.id)}
              >
                Связаться в мессенджере
              </HockeyButton>
              <HockeyButton
                view="outlined"
                size="m"
                href={`tel:${contactPhone.replace(/[^\d+]/g, '')}`}
                data-testid={testId('events', 'game-page', 'btn', 'phone', event.id)}
              >
                {contactPhone}
              </HockeyButton>
            </div>
          </div>
        </IceCard>

        <IceCard padding="m">
          <div
            className="hockey-stack hockey-stack--gap-8"
            data-testid={testId('events', 'game-page', 'panel', 'registration', event.id)}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('events', 'game-page', 'text', 'registration-title', event.id)}
            >
              {event.hasTeamRsvp ? 'Ваш ответ команде' : 'Запись на игру'}
            </Text>
            {event.hasTeamRsvp ? (
              <TeamRsvpResponseControl eventId={event.id} currentUserId={userId} />
            ) : (
              <TrainingRegistrationControl
                eventId={event.id}
                eventType="game"
                currentStatus={currentStatus}
                registrationStatus={event.registrationStatus}
                currentUserId={userId}
              />
            )}
          </div>
        </IceCard>
      </div>
    </PageHub>
  )
}
