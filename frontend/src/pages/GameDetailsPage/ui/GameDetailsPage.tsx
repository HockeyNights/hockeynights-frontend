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
  EventFactRow,
  EventOrganizerCard,
  EventRsvpBoard,
  EventSlotsCard,
  EventStatTile,
  EventStatusPill,
  formatEventLongDate,
  formatEventPriceRub,
  formatEventTimeRange,
  resolveTrainingUserName,
  SKILL_LEVEL_LABELS,
  TrainingRegistrationControl,
} from '@/features/events'
import {TeamRsvpResponseControl} from '@/features/radar'
import {isNotFoundError} from '@/shared/api/client'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {PageBackLink} from '@/shared/ui/PageBackLink'
import {PageHub} from '@/shared/ui/PageHub'
import {PageStatePanel} from '@/shared/ui/PageStatePanel'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {SectionHeading} from '@/shared/ui/SectionHeading'

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

  const accessLabel = event.accessScope ? ACCESS_LABELS[event.accessScope] : 'Тип доступа не задан'
  const organizerName = resolveTrainingUserName(event.organizerUserId, event, playerNames)
  const contactPhone = event.organizerPhone ?? '+7 (900) 000-00-00'
  const currentStatus = event.participation.find((item) => item.userId === userId)?.status
  const requiredTotal = event.requiredSlots.reduce((acc, slot) => acc + slot.count, 0)
  const filledTotal = event.requiredSlots.reduce((acc, slot) => acc + slot.filledCount, 0)
  const fillPercent = requiredTotal > 0 ? Math.round((filledTotal / requiredTotal) * 100) : 0
  const isFull = event.registrationStatus === 'full'

  return (
    <PageHub
      className="event-details"
      data-testid={testId('events', 'game-page', 'page', event.id)}
    >
      <PageBackLink
        to={routes.events}
        label="К списку игр"
        testIdPrefix="events"
        testIdSection="game-page"
      />

      <div className="event-details__grid">
        <div className="event-details__main">
          <IceCard padding="l" className="event-details__hero">
            <div
              className="event-details__hero-head"
              data-testid={testId('events', 'game-page', 'header')}
            >
              <div className="event-details__hero-copy">
                <div
                  className="event-details__badges"
                  data-testid={testId('events', 'game-page', 'text', 'subtitle')}
                >
                  {event.lifecycleStatus === 'draft' && (
                    <span className="hockey-badge hockey-badge--gold">Черновик</span>
                  )}
                  {event.lifecycleStatus === 'cancelled' && (
                    <span className="hockey-badge hockey-badge--red">Отменена</span>
                  )}
                  <span className="hockey-badge hockey-badge--red">
                    {EVENT_TYPE_LABELS[event.type]}
                  </span>
                  <span className="hockey-badge hockey-badge--muted">{accessLabel}</span>
                </div>
                <Text
                  variant="header-1"
                  as="h1"
                  className="event-details__title"
                  data-testid={testId('events', 'game-page', 'text', 'title')}
                >
                  {event.title}
                </Text>
              </div>
            </div>

            <div
              className="event-details__body"
              data-testid={testId('events', 'game-page', 'panel', 'meta', event.id)}
            >
              <h2
                className="event-details__sr-only"
                data-testid={testId('events', 'game-page', 'text', 'meta-title', event.id)}
              >
                Детали игры
              </h2>
              <div className="event-details__tiles">
                <EventStatTile
                  label="Время и дата"
                  value={formatEventTimeRange(event.startsAt, event.endsAt)}
                  hint={formatEventLongDate(event.startsAt)}
                  data-testid={testId('events', 'game-page', 'card', 'schedule', event.id)}
                />
                <EventStatTile
                  label="Стоимость участия"
                  tone="teal"
                  value={formatEventPriceRub(event.pricePerPlayer)}
                  hint={event.pricePerPlayer ? 'С игрока за игру' : 'Членский клубный сбор'}
                  data-testid={testId('events', 'game-page', 'text', 'price', event.id)}
                />
              </div>

              <div className="event-details__facts">
                <EventFactRow
                  label="Арена и локация"
                  hint={event.district}
                  data-testid={testId('events', 'game-page', 'text', 'arena', event.id)}
                >
                  <Link
                    to={`/arenas/${event.arenaId}`}
                    data-testid={testId('events', 'game-page', 'link', 'arena', event.id)}
                  >
                    {event.arenaName ?? event.arenaId}
                  </Link>
                </EventFactRow>
                <EventFactRow
                  label="Рекомендованный уровень"
                  data-testid={testId('events', 'game-page', 'text', 'level', event.id)}
                >
                  {SKILL_LEVEL_LABELS[event.requiredSkillLevel]}
                </EventFactRow>
                <EventFactRow
                  label="Статус набора"
                  data-testid={testId(
                    'events',
                    'game-page',
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
                  label="Заполненность"
                  data-testid={testId('events', 'game-page', 'text', 'fill', event.id)}
                >
                  <span className="event-details__tone--accent">
                    {filledTotal}/{requiredTotal} ({fillPercent}%)
                  </span>
                </EventFactRow>
                {event.teamId && (
                  <EventFactRow
                    label="Команда"
                    data-testid={testId('events', 'game-page', 'text', 'team', event.id)}
                  >
                    <Link
                      to={`/teams/${event.teamId}`}
                      data-testid={testId('events', 'game-page', 'link', 'team', event.id)}
                    >
                      открыть профиль
                    </Link>
                  </EventFactRow>
                )}
                <EventFactRow
                  label="Организатор"
                  data-testid={testId('events', 'game-page', 'text', 'organizer', event.id)}
                >
                  {organizerName}
                </EventFactRow>
              </div>
            </div>
          </IceCard>

          <section className="events-screen__section">
            <SectionHeading
              title={
                <span data-testid={testId('events', 'game-page', 'text', 'slots-title', event.id)}>
                  Слоты и укомплектованность
                </span>
              }
            />
            <EventSlotsCard
              event={event}
              section="game-page"
              currentUserId={userId}
              resolveName={(id) => resolveTrainingUserName(id, event, playerNames)}
            />
          </section>

          {event.hasTeamRsvp && (
            <section
              className="events-screen__section"
              data-testid={testId('events', 'game-page', 'panel', 'rsvp', event.id)}
            >
              <SectionHeading
                title={
                  <span data-testid={testId('events', 'game-page', 'text', 'rsvp-title', event.id)}>
                    RSVP команды
                  </span>
                }
              />
              <IceCard padding="l">
                <EventRsvpBoard eventId={event.id} hideTitle />
              </IceCard>
            </section>
          )}
        </div>

        <aside className="event-details__aside">
          <section className="events-screen__section">
            <SectionHeading
              title={
                <span
                  data-testid={testId('events', 'game-page', 'text', 'contacts-title', event.id)}
                >
                  Контакты организатора
                </span>
              }
            />
            <EventOrganizerCard
              eventId={event.id}
              section="game-page"
              organizerName={organizerName}
              organizerUserId={event.organizerUserId}
              phone={contactPhone}
            />
          </section>

          <section className="events-screen__section">
            <SectionHeading
              title={
                <span
                  data-testid={testId(
                    'events',
                    'game-page',
                    'text',
                    'registration-title',
                    event.id,
                  )}
                >
                  {event.hasTeamRsvp ? 'Ваш ответ команде' : 'Запись на игру'}
                </span>
              }
            />
            <IceCard padding="m">
              <div data-testid={testId('events', 'game-page', 'panel', 'registration', event.id)}>
                {event.hasTeamRsvp ? (
                  <TeamRsvpResponseControl eventId={event.id} currentUserId={userId} />
                ) : (
                  <TrainingRegistrationControl
                    eventId={event.id}
                    eventType="game"
                    currentStatus={currentStatus}
                    registrationStatus={event.registrationStatus}
                    currentUserId={userId}
                    layout="panel"
                  />
                )}
              </div>
            </IceCard>
          </section>
        </aside>
      </div>
    </PageHub>
  )
}
