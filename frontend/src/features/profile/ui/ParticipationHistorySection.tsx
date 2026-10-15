/**
 * Раскрываемая история участия — общая для «О себе» и публичной страницы игрока.
 */

import {Text} from '@gravity-ui/uikit'
import {useId, useState} from 'react'
import {Link} from 'react-router'

import type {ParticipationRecord} from '@/entities/profile'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const PARTICIPATION_ROLE_LABELS: Record<ParticipationRecord['role'], string> = {
  player: 'Игрок',
  goalie: 'Вратарь',
  coach: 'Тренер',
}

const PARTICIPATION_TYPE_LABELS: Record<NonNullable<ParticipationRecord['eventType']>, string> = {
  game: 'Игра',
  training: 'Тренировка',
  open_ice: 'Открытый лёд',
}

function ParticipationHistoryItem({record}: {record: ParticipationRecord}) {
  const [open, setOpen] = useState(false)
  const detailsId = useId()
  const timeLabel = new Date(record.eventDate).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
  /** Как после создания тренировки: детальная карточка события = «приглашение». */
  const inviteHref =
    record.eventType === 'training'
      ? `/events/trainings/${record.eventId}`
      : `/events/games/${record.eventId}`
  const inviteLabel = 'К приглашению'
  const chatHref = record.chatId ? `/messenger?chatId=${encodeURIComponent(record.chatId)}` : null

  return (
    <li
      className={`profile-hub__history-item${open ? ' is-open' : ''}`}
      data-testid={testId('profile', 'participation-history', 'item', record.eventId)}
    >
      <button
        type="button"
        className="profile-hub__history-toggle"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((prev) => !prev)}
        data-testid={testId('profile', 'participation-history', 'btn', 'toggle', record.eventId)}
      >
        <span className="profile-hub__history-main">
          <Text
            variant="body-2"
            className="profile-hub__history-title"
            data-testid={testId(
              'profile',
              'participation-history',
              'text',
              'event',
              record.eventId,
            )}
          >
            {record.eventTitle}
          </Text>
          <Text
            color="secondary"
            className="profile-hub__history-date"
            data-testid={testId('profile', 'participation-history', 'text', 'date', record.eventId)}
          >
            {new Date(record.eventDate).toLocaleDateString('ru-RU')}
            {record.teamName ? ` · ${record.teamName}` : ''}
          </Text>
        </span>
        <span className="profile-hub__history-meta">
          <span
            className={`profile-hub__history-status ${
              record.confirmed ? 'is-confirmed' : 'is-pending'
            }`}
            data-testid={testId(
              'profile',
              'participation-history',
              'badge',
              'status',
              record.eventId,
            )}
          >
            {record.confirmed ? 'Подтверждено' : 'Ожидает'}
          </span>
          <span className="profile-hub__history-chevron" aria-hidden>
            {open ? '▴' : '▾'}
          </span>
        </span>
      </button>

      {open && (
        <div
          id={detailsId}
          className="profile-hub__history-details"
          data-testid={testId(
            'profile',
            'participation-history',
            'panel',
            'details',
            record.eventId,
          )}
        >
          <dl className="profile-hub__history-facts">
            <div>
              <dt>Роль</dt>
              <dd
                data-testid={testId(
                  'profile',
                  'participation-history',
                  'text',
                  'role',
                  record.eventId,
                )}
              >
                {PARTICIPATION_ROLE_LABELS[record.role]}
              </dd>
            </div>
            {record.eventType && (
              <div>
                <dt>Тип</dt>
                <dd
                  data-testid={testId(
                    'profile',
                    'participation-history',
                    'text',
                    'type',
                    record.eventId,
                  )}
                >
                  {PARTICIPATION_TYPE_LABELS[record.eventType]}
                </dd>
              </div>
            )}
            <div>
              <dt>Время</dt>
              <dd
                data-testid={testId(
                  'profile',
                  'participation-history',
                  'text',
                  'time',
                  record.eventId,
                )}
              >
                {timeLabel}
                {record.durationMinutes ? ` · ${record.durationMinutes} мин` : ''}
              </dd>
            </div>
            {record.arenaName && (
              <div>
                <dt>Арена</dt>
                <dd
                  data-testid={testId(
                    'profile',
                    'participation-history',
                    'text',
                    'arena',
                    record.eventId,
                  )}
                >
                  {record.arenaName}
                </dd>
              </div>
            )}
            {record.opponent && (
              <div>
                <dt>Соперник</dt>
                <dd
                  data-testid={testId(
                    'profile',
                    'participation-history',
                    'text',
                    'opponent',
                    record.eventId,
                  )}
                >
                  {record.opponent}
                </dd>
              </div>
            )}
            {record.result && (
              <div>
                <dt>Итог</dt>
                <dd
                  data-testid={testId(
                    'profile',
                    'participation-history',
                    'text',
                    'result',
                    record.eventId,
                  )}
                >
                  {record.result}
                </dd>
              </div>
            )}
          </dl>
          {record.note && (
            <Text
              color="secondary"
              data-testid={testId(
                'profile',
                'participation-history',
                'text',
                'note',
                record.eventId,
              )}
            >
              {record.note}
            </Text>
          )}
          <div
            className="profile-hub__history-actions"
            data-testid={testId(
              'profile',
              'participation-history',
              'panel',
              'actions',
              record.eventId,
            )}
          >
            <HockeyButton
              view="outlined"
              component={Link}
              to={inviteHref}
              data-testid={testId(
                'profile',
                'participation-history',
                'btn',
                'invite',
                record.eventId,
              )}
            >
              {inviteLabel}
            </HockeyButton>
            {chatHref && (
              <HockeyButton
                view="action"
                component={Link}
                to={chatHref}
                data-testid={testId(
                  'profile',
                  'participation-history',
                  'btn',
                  'chat',
                  record.eventId,
                )}
              >
                Чат приглашения
              </HockeyButton>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

export interface ParticipationHistorySectionProps {
  records?: ParticipationRecord[]
  showHistory: boolean
}

export function ParticipationHistorySection({
  records = [],
  showHistory,
}: ParticipationHistorySectionProps) {
  if (!showHistory) {
    return (
      <Text
        color="secondary"
        data-testid={testId('profile', 'participation-history', 'text', 'hidden')}
      >
        История участия скрыта настройками приватности.
      </Text>
    )
  }
  if (records.length === 0) {
    return (
      <Text color="secondary" data-testid={testId('profile', 'participation-history', 'empty')}>
        Пока нет записей в истории участия.
      </Text>
    )
  }

  return (
    <ul
      className="profile-hub__history"
      data-testid={testId('profile', 'participation-history', 'list')}
    >
      {records.map((record) => (
        <ParticipationHistoryItem key={record.eventId} record={record} />
      ))}
    </ul>
  )
}
