/**
 * HOCFRONT-25 — тренер одобряет раскладку, если её создал админ клуба
 */

import {Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import {
  approveTrainingDraft,
  fetchTrainingLineupDrafts,
  publishTrainingDraft,
  rejectTrainingDraft,
} from '@/entities/club'
import type {LineupApprovalStatus} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {SectionHeading} from '@/shared/ui/SectionHeading'

const STATUS_LABELS: Record<LineupApprovalStatus, string> = {
  draft: 'Черновик',
  pending_coach: 'Ждёт тренера',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  published: 'Опубликовано',
}

export interface LineupCoachApprovalPanelProps {
  clubId: string
}

export function LineupCoachApprovalPanel({clubId}: LineupCoachApprovalPanelProps) {
  const queryClient = useQueryClient()
  const {roles} = useSessionAccess()
  const canApprove =
    roles.includes('coach') || roles.includes('admin') || roles.includes('club_admin')
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})

  const {data: drafts = [], isLoading} = useQuery({
    queryKey: ['club-training-drafts', clubId],
    queryFn: () => fetchTrainingLineupDrafts(clubId),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: ['club-training-drafts', clubId]})
    void queryClient.invalidateQueries({queryKey: ['club-private-trainings', clubId]})
    void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
  }

  const approveMutation = useMutation({
    mutationFn: (draftId: string) => approveTrainingDraft(clubId, draftId),
    onSuccess: invalidate,
  })
  const rejectMutation = useMutation({
    mutationFn: ({draftId, reason}: {draftId: string; reason: string}) =>
      rejectTrainingDraft(clubId, draftId, reason),
    onSuccess: invalidate,
  })
  const publishMutation = useMutation({
    mutationFn: (draftId: string) => publishTrainingDraft(clubId, draftId),
    onSuccess: invalidate,
  })

  if (!canApprove) return null

  const pending = drafts.filter((draft) => draft.status === 'pending_coach')
  const approved = drafts.filter((draft) => draft.status === 'approved')

  return (
    <section
      className="club-hq__section lineup-approval-panel"
      data-testid={testId('clubs', 'lineup-approval', 'panel', clubId)}
    >
      <SectionHeading
        title="Одобрение раскладок"
        data-testid={testId('clubs', 'lineup-approval', 'text', 'title', clubId)}
      />
      <div className="club-hq__card club-hq__approval">
        {isLoading && (
          <ScoreboardLoader
            label="Загрузка черновиков"
            data-testid={testId('clubs', 'lineup-approval', 'loader', clubId)}
          />
        )}
        {!isLoading && pending.length === 0 && approved.length === 0 && (
          <Text color="secondary" data-testid={testId('clubs', 'lineup-approval', 'empty', clubId)}>
            Нет раскладок на согласование
          </Text>
        )}

        {pending.map((draft) => (
          <div
            key={draft.id}
            className="hockey-stack hockey-stack--gap-8"
            data-testid={testId('clubs', 'lineup-approval', 'card', draft.id)}
          >
            <Text data-testid={testId('clubs', 'lineup-approval', 'text', 'draft-title', draft.id)}>
              {draft.title} · {STATUS_LABELS[draft.status]}
            </Text>
            <Text
              color="secondary"
              data-testid={testId('clubs', 'lineup-approval', 'text', 'draft-meta', draft.id)}
            >
              {new Date(draft.startsAt).toLocaleString('ru-RU')} · игроков:{' '}
              {draft.assignments.length}
              {draft.note ? ` · ${draft.note}` : ''}
            </Text>
            <ul data-testid={testId('clubs', 'lineup-approval', 'list', 'assignments', draft.id)}>
              {draft.assignments.map((item) => (
                <li
                  key={item.userId}
                  data-testid={testId('clubs', 'lineup-approval', 'row', 'player', item.userId)}
                >
                  {item.displayName} — {item.position} / {item.side}
                </li>
              ))}
            </ul>
            {(roles.includes('coach') || roles.includes('admin')) && (
              <div className="hockey-stack hockey-stack--gap-8">
                <HockeyButton
                  size="s"
                  loading={approveMutation.isPending}
                  onClick={() => approveMutation.mutate(draft.id)}
                  data-testid={testId('clubs', 'lineup-approval', 'btn', 'approve', draft.id)}
                >
                  Одобрить раскладку
                </HockeyButton>
                <TextInput
                  placeholder="Причина отклонения"
                  value={rejectReasons[draft.id] ?? ''}
                  onUpdate={(value) => setRejectReasons((prev) => ({...prev, [draft.id]: value}))}
                  data-testid={testId('clubs', 'lineup-approval', 'field', 'reject', draft.id)}
                />
                <HockeyButton
                  size="s"
                  view="outlined"
                  loading={rejectMutation.isPending}
                  onClick={() =>
                    rejectMutation.mutate({
                      draftId: draft.id,
                      reason: rejectReasons[draft.id]?.trim() || 'Нужна правка состава',
                    })
                  }
                  data-testid={testId('clubs', 'lineup-approval', 'btn', 'reject', draft.id)}
                >
                  Отклонить
                </HockeyButton>
              </div>
            )}
          </div>
        ))}

        {approved.map((draft) => (
          <div
            key={draft.id}
            className="hockey-row hockey-row--between"
            data-testid={testId('clubs', 'lineup-approval', 'row', 'approved', draft.id)}
          >
            <Text>
              {draft.title} · одобрено
              {roles.includes('coach') || roles.includes('admin')
                ? ' — можно создать тренировку'
                : ' — ждёт создания тренером'}
            </Text>
            {(roles.includes('coach') || roles.includes('admin')) && (
              <HockeyButton
                size="s"
                loading={publishMutation.isPending}
                onClick={() => publishMutation.mutate(draft.id)}
                data-testid={testId('clubs', 'lineup-approval', 'btn', 'publish', draft.id)}
              >
                Создать тренировку
              </HockeyButton>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
