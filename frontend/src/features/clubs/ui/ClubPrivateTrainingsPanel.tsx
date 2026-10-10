/**
 * HOCFRONT-25 / TASK-04-11 — приватные тренировки: раскладка → тренер → мессенджер
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link} from 'react-router'

import {fetchClub, fetchClubPrivateTrainings} from '@/entities/club'
import {testId} from '@/shared/testing/testId'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {SectionHeading} from '@/shared/ui/SectionHeading'

import {LineupCoachApprovalPanel} from './LineupCoachApprovalPanel'
import {TeamTrainingCreateWizard} from './TeamTrainingCreateWizard'

export interface ClubPrivateTrainingsPanelProps {
  clubId: string
}

/** HOCFRONT-25 — список и мастер создания private_club тренировок */
export function ClubPrivateTrainingsPanel({clubId}: ClubPrivateTrainingsPanelProps) {
  const {
    data: club,
    isLoading: clubLoading,
    isError: clubError,
  } = useQuery({
    queryKey: ['club', clubId],
    queryFn: () => fetchClub(clubId),
  })
  const {data: trainings = [], isLoading} = useQuery({
    queryKey: ['club-private-trainings', clubId],
    queryFn: () => fetchClubPrivateTrainings(clubId),
  })

  if (clubLoading) {
    return (
      <ScoreboardLoader
        label="Загрузка клуба"
        data-testid={testId('clubs', 'private-trainings', 'loader', 'club', clubId)}
      />
    )
  }

  if (clubError || !club) {
    return (
      <Text
        color="danger"
        data-testid={testId('clubs', 'private-trainings', 'error', 'club', clubId)}
      >
        Не удалось загрузить клуб для приватных тренировок.
      </Text>
    )
  }

  const teamIds = club.teamIds ?? []

  return (
    <div
      className="club-hq__private"
      data-testid={testId('clubs', 'private-trainings', 'panel', clubId)}
    >
      {teamIds.length > 0 ? (
        <TeamTrainingCreateWizard clubId={clubId} teamIds={teamIds} />
      ) : (
        <p
          className="club-hq__empty"
          data-testid={testId('clubs', 'private-trainings', 'empty', 'teams', clubId)}
        >
          Привяжите команду к клубу, чтобы создать тренировку с раскладкой.
        </p>
      )}

      <LineupCoachApprovalPanel clubId={clubId} />

      <section
        className="club-hq__section"
        data-testid={testId('clubs', 'private-trainings', 'list', clubId)}
      >
        <SectionHeading
          title="Опубликованные приватные тренировки"
          data-testid={testId('clubs', 'private-trainings', 'text', 'list-title', clubId)}
        />
        <div className="club-hq__card club-hq__published">
          {isLoading && (
            <ScoreboardLoader
              label="Загрузка тренировок"
              data-testid={testId('clubs', 'private-trainings', 'loader', clubId)}
            />
          )}
          {!isLoading && trainings.length === 0 && (
            <p
              className="club-hq__empty"
              data-testid={testId('clubs', 'private-trainings', 'empty', clubId)}
            >
              Приватных тренировок пока нет
            </p>
          )}
          {trainings.map((event) => (
            <div
              key={event.id}
              className="hockey-list-row club-hq__published-row"
              data-testid={testId('clubs', 'private-trainings', 'row', event.id)}
            >
              <Link
                to={`/events/trainings/${event.id}`}
                className="club-hq__published-title"
                data-testid={testId('clubs', 'private-trainings', 'link', event.id)}
              >
                <span data-testid={testId('clubs', 'private-trainings', 'text', 'title', event.id)}>
                  {event.title}
                </span>
              </Link>
              <span
                className="club-hq__published-meta"
                data-testid={testId('clubs', 'private-trainings', 'text', 'meta', event.id)}
              >
                {new Date(event.startsAt).toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
