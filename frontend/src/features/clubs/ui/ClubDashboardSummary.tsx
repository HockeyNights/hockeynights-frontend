/**
 * HOCFRONT-25 / TASK-04-07 — дашборд кабинета клуба для админа
 */

import {ArrowRight, MapPin, Person} from '@gravity-ui/icons'
import {Icon} from '@gravity-ui/uikit'
import {Link} from 'react-router'

import type {Club} from '@/entities/club'
import type {GameEvent} from '@/entities/event'
import {ACCESS_LABELS, EVENT_TYPE_LABELS, formatEventPriceRub} from '@/features/events'
import {STAFF_ROLE_LABELS} from '@/features/teams'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {SectionHeading} from '@/shared/ui/SectionHeading'

export type ClubPartnerTab = 'dashboard' | 'profile' | 'roster' | 'calendar' | 'private'

export interface ClubDashboardSummaryProps {
  club: Club
  rosterCount: number
  staffCount: number
  calendarCount: number
  privateTrainingCount: number
  upcomingEvents: GameEvent[]
  onNavigateTab: (tab: ClubPartnerTab) => void
}

function pluralRu(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export interface ClubDashboardHeroProps {
  club: Club
}

/** Карточка клуба внутри hero: логотип, название, город, счётчики и быстрые действия */
export function ClubDashboardHero({club}: ClubDashboardHeroProps) {
  const publicTeamId = club.teamIds[0]

  return (
    <section
      className="club-hq__club"
      data-testid={testId('clubs', 'dashboard', 'card', 'club', club.id)}
    >
      <div className="club-hq__club-main">
        <div className="club-hq__club-identity">
          <div className="club-hq__crest" aria-hidden>
            <Icon data={Person} size={32} />
          </div>
          <div className="club-hq__club-copy">
            <h2
              className="club-hq__club-name"
              data-testid={testId('clubs', 'dashboard', 'text', 'name', club.id)}
            >
              {club.name}
            </h2>
            <p
              className="club-hq__club-meta"
              data-testid={testId('clubs', 'dashboard', 'text', 'city', club.id)}
            >
              {club.city}
            </p>
            {club.contactEmail ? (
              <p
                className="club-hq__club-meta"
                data-testid={testId('clubs', 'dashboard', 'text', 'email', club.id)}
              >
                {club.contactEmail}
              </p>
            ) : null}
          </div>
        </div>
        <div className="club-hq__club-chips">
          <span
            className="club-hq__chip"
            data-testid={testId('clubs', 'dashboard', 'badge', 'teams', club.id)}
          >
            Команд: {club.teamIds.length}
          </span>
          <span
            className="club-hq__chip"
            data-testid={testId('clubs', 'dashboard', 'badge', 'squads', club.id)}
          >
            Составов: {club.squads.length}
          </span>
        </div>
      </div>
      <div className="club-hq__club-actions">
        <Link
          to={routes.eventsOrganizer}
          data-testid={testId('clubs', 'dashboard', 'link', 'organizer', club.id)}
        >
          <HockeyButton
            view="action"
            size="l"
            width="max"
            data-testid={testId('clubs', 'dashboard', 'btn', 'organizer', club.id)}
          >
            Кабинет организатора
          </HockeyButton>
        </Link>
        <Link
          to={`${routes.eventsCreate}?access=private_club`}
          data-testid={testId('clubs', 'dashboard', 'link', 'create-private', club.id)}
        >
          <HockeyButton
            view="outlined"
            size="l"
            width="max"
            data-testid={testId('clubs', 'dashboard', 'btn', 'create-private', club.id)}
          >
            Открытая форма (только клуб)
          </HockeyButton>
        </Link>
        {publicTeamId ? (
          <Link
            to={`/teams/${publicTeamId}`}
            data-testid={testId('clubs', 'dashboard', 'link', 'public-team', club.id)}
          >
            <HockeyButton
              view="outlined"
              size="l"
              width="max"
              data-testid={testId('clubs', 'dashboard', 'btn', 'public-team', club.id)}
            >
              Публичная страница
            </HockeyButton>
          </Link>
        ) : null}
      </div>
    </section>
  )
}

interface PriorityCardProps {
  clubId: string
  id: string
  title: string
  description: string
  footLabel: string
  footValue: string
  onClick: () => void
}

function PriorityCard({
  clubId,
  id,
  title,
  description,
  footLabel,
  footValue,
  onClick,
}: PriorityCardProps) {
  return (
    <button
      type="button"
      className="club-hq__priority-card"
      onClick={onClick}
      data-testid={testId('clubs', 'dashboard', 'btn', `priority-${id}`, clubId)}
    >
      <span className="club-hq__priority-title">{title}</span>
      <span className="club-hq__priority-desc">{description}</span>
      <span className="club-hq__priority-foot">
        <span>{footLabel}</span>
        <strong data-testid={testId('clubs', 'dashboard', 'text', `priority-${id}-value`, clubId)}>
          {footValue}
        </strong>
      </span>
    </button>
  )
}

interface StatTileProps {
  clubId: string
  id: string
  label: string
  value: string
  hint: string
  onClick: () => void
}

function StatTile({clubId, id, label, value, hint, onClick}: StatTileProps) {
  return (
    <button
      type="button"
      className="club-hq__stat"
      onClick={onClick}
      data-testid={testId('clubs', 'dashboard', 'btn', `stat-${id}`, clubId)}
    >
      <span
        className="club-hq__stat-label"
        data-testid={testId('clubs', 'dashboard', 'text', `${id}-label`, clubId)}
      >
        {label}
      </span>
      <span
        className="club-hq__stat-value"
        data-testid={testId('clubs', 'dashboard', 'text', `${id}-count`, clubId)}
      >
        {value}
      </span>
      <span
        className="club-hq__stat-hint"
        data-testid={testId('clubs', 'dashboard', 'text', `${id}-hint`, clubId)}
      >
        {hint}
        <Icon data={ArrowRight} size={12} />
      </span>
    </button>
  )
}

function UpcomingEventCard({event}: {event: GameEvent}) {
  const start = new Date(event.startsAt)
  const time = start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})
  const date = start.toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})
  const access = event.accessScope ? ACCESS_LABELS[event.accessScope] : null
  const place = [event.arenaName, event.district, formatEventPriceRub(event.pricePerPlayer)]
    .filter(Boolean)
    .join(' · ')
  const title =
    event.type === 'training' ? (
      <Link
        to={`/events/trainings/${event.id}`}
        data-testid={testId('clubs', 'dashboard', 'link', 'event', event.id)}
      >
        {event.title}
      </Link>
    ) : (
      event.title
    )

  return (
    <li
      className="club-hq__event"
      data-testid={testId('clubs', 'dashboard', 'row', 'event', event.id)}
    >
      <div className="club-hq__event-top">
        <span className="club-hq__event-time">
          {time}
          <span className="club-hq__event-date">{date}</span>
        </span>
        <span className="club-hq__event-badges">
          {access ? (
            <span className="hockey-badge hockey-badge--gold">
              {event.accessScope === 'private_club' ? 'Приватная' : access}
            </span>
          ) : null}
          <span className="hockey-badge">{EVENT_TYPE_LABELS[event.type] ?? event.type}</span>
        </span>
      </div>
      <div className="club-hq__event-title">{title}</div>
      {place ? (
        <div className="club-hq__event-place">
          <Icon data={MapPin} size={12} />
          {place}
        </div>
      ) : null}
    </li>
  )
}

/**
 * Что важно админу клуба на главном экране:
 * 1) быстрые действия (создать тренировку, состав, публичный профиль)
 * 2) сводка кликабельными плитками
 * 3) ближайшие события и штаб под рукой
 */
export function ClubDashboardSummary({
  club,
  rosterCount,
  staffCount,
  calendarCount,
  privateTrainingCount,
  upcomingEvents,
  onNavigateTab,
}: ClubDashboardSummaryProps) {
  return (
    <div
      className="club-hq__dashboard"
      data-testid={testId('clubs', 'dashboard', 'panel', club.id)}
    >
      <section
        className="club-hq__section"
        data-testid={testId('clubs', 'dashboard', 'panel', 'priority', club.id)}
      >
        <SectionHeading
          title="Сейчас важно"
          data-testid={testId('clubs', 'dashboard', 'text', 'priority-title', club.id)}
        />
        <div className="club-hq__priority-grid">
          <PriorityCard
            clubId={club.id}
            id="private"
            title="Создать приватную тренировку"
            description="Раскладка → одобрение тренера → назначения в мессенджер"
            footLabel="Приватных тренировок:"
            footValue={`сейчас ${privateTrainingCount}`}
            onClick={() => onNavigateTab('private')}
          />
          <PriorityCard
            clubId={club.id}
            id="roster"
            title="Управлять составом"
            description="NHL-табло: интерактивная перестановка карточек, звенья"
            footLabel="В составе:"
            footValue={`${rosterCount} ${pluralRu(rosterCount, 'игрок', 'игрока', 'игроков')}`}
            onClick={() => onNavigateTab('roster')}
          />
          <PriorityCard
            clubId={club.id}
            id="profile"
            title="Публичный профиль и штаб"
            description="Название, логотип, контакты, соцсети и роли штаба"
            footLabel="В штабе клуба:"
            footValue={`${staffCount} ${pluralRu(staffCount, 'специалист', 'специалиста', 'специалистов')}`}
            onClick={() => onNavigateTab('profile')}
          />
        </div>
      </section>

      <section
        className="club-hq__stats"
        data-testid={testId('clubs', 'dashboard', 'grid', 'stats', club.id)}
      >
        <StatTile
          clubId={club.id}
          id="roster"
          label="Состав"
          value={String(rosterCount)}
          hint="Открыть управление"
          onClick={() => onNavigateTab('roster')}
        />
        <StatTile
          clubId={club.id}
          id="staff"
          label="Штаб"
          value={String(staffCount)}
          hint="Редактировать в профиле"
          onClick={() => onNavigateTab('profile')}
        />
        <StatTile
          clubId={club.id}
          id="calendar"
          label="Календарь"
          value={String(calendarCount)}
          hint="Все события клуба"
          onClick={() => onNavigateTab('calendar')}
        />
        <StatTile
          clubId={club.id}
          id="private"
          label="Приватные"
          value={String(privateTrainingCount)}
          hint="Создать / список"
          onClick={() => onNavigateTab('private')}
        />
      </section>

      <div
        className="club-hq__columns"
        data-testid={testId('clubs', 'dashboard', 'panel', 'columns', club.id)}
      >
        <section
          className="club-hq__section"
          data-testid={testId('clubs', 'dashboard', 'panel', 'upcoming', club.id)}
        >
          <SectionHeading
            title="Ближайшие события"
            extra={
              <button
                type="button"
                className="hockey-section-link club-hq__section-link"
                onClick={() => onNavigateTab('calendar')}
                data-testid={testId('clubs', 'dashboard', 'btn', 'upcoming-all', club.id)}
              >
                Весь календарь
              </button>
            }
            data-testid={testId('clubs', 'dashboard', 'text', 'upcoming-title', club.id)}
          />
          {upcomingEvents.length === 0 ? (
            <p
              className="club-hq__empty"
              data-testid={testId('clubs', 'dashboard', 'empty', 'upcoming', club.id)}
            >
              Пока пусто — создайте приватную тренировку или дождитесь игр.
            </p>
          ) : (
            <ul className="club-hq__event-list">
              {upcomingEvents.map((event) => (
                <UpcomingEventCard key={event.id} event={event} />
              ))}
            </ul>
          )}
        </section>

        <section
          className="club-hq__section"
          data-testid={testId('clubs', 'dashboard', 'panel', 'staff', club.id)}
        >
          <SectionHeading
            title="Штаб"
            extra={
              <button
                type="button"
                className="hockey-section-link club-hq__section-link"
                onClick={() => onNavigateTab('profile')}
                data-testid={testId('clubs', 'dashboard', 'btn', 'staff-edit', club.id)}
              >
                Править
              </button>
            }
            data-testid={testId('clubs', 'dashboard', 'text', 'staff-title', club.id)}
          />
          <div className="club-hq__staff-card">
            {club.staff.length === 0 ? (
              <p
                className="club-hq__empty"
                data-testid={testId('clubs', 'dashboard', 'empty', 'staff', club.id)}
              >
                Добавьте тренеров и контакты в профиле клуба.
              </p>
            ) : (
              <ul className="club-hq__staff-list">
                {club.staff.map((member) => (
                  <li
                    key={member.userId}
                    className="club-hq__staff-row"
                    data-testid={testId('clubs', 'dashboard', 'row', 'staff', member.userId)}
                  >
                    <span className="club-hq__avatar" aria-hidden>
                      {member.displayName.trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="club-hq__staff-name">{member.displayName}</span>
                    <span
                      className={`club-hq__staff-role${member.role === 'head_coach' ? ' is-lead' : ''}`}
                    >
                      {STAFF_ROLE_LABELS[member.role]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to={routes.messenger}
              className="club-hq__staff-chat"
              data-testid={testId('clubs', 'dashboard', 'link', 'messenger', club.id)}
            >
              <HockeyButton
                view="outlined"
                size="l"
                width="max"
                data-testid={testId('clubs', 'dashboard', 'btn', 'messenger', club.id)}
              >
                Открыть чат штаба
              </HockeyButton>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
