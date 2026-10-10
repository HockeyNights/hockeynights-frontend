/**
 * HOCFRONT-25 — мастер: детали → визуальная раскладка → черновик / создание только тренером
 */

import {Select, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useEffect, useId, useMemo, useState} from 'react'

import {
  createTrainingLineupDraft,
  publishTrainingDraft,
  submitTrainingDraftForApproval,
} from '@/entities/club'
import type {PlayerPosition} from '@/entities/common'
import {fetchTeam, fetchTeamRoster, type TrainingDraftAssignment} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {
  draftAssignmentsFromTemplate,
  LineupRinkPreview,
  loadTeamLineupTemplates,
} from '@/features/teams'
import {
  addMinutesToLocalDateTime,
  defaultLocalDateTimePlusDays,
  localDateTimeToIso,
} from '@/shared/lib/datetimeLocal'
import {testId} from '@/shared/testing/testId'
import {DateTimeField} from '@/shared/ui/DateTimeField'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {SectionHeading} from '@/shared/ui/SectionHeading'

const ARENA_OPTIONS = [
  {value: 'arena-001', content: 'Ледовый дворец на Ходынке'},
  {value: 'arena-002', content: 'Каток «Лужники»'},
]

type WizardStep = 'details' | 'lineup' | 'review'

export interface TeamTrainingCreateWizardProps {
  clubId: string
  teamIds: string[]
}

function buildDefaultAssignments(
  roster: Array<{userId: string; displayName: string; position: PlayerPosition | 'any'}>,
): TrainingDraftAssignment[] {
  return roster.map((member, index) => ({
    userId: member.userId,
    displayName: member.displayName,
    position: (member.position === 'any' ? 'forward' : member.position) as PlayerPosition,
    side: index < 3 ? 'red' : index < 6 ? 'white' : 'bench',
    line: ((index % 3) + 1) as number,
  }))
}

function mergeAssignmentsWithRoster(
  prev: TrainingDraftAssignment[],
  roster: Array<{userId: string; displayName: string; position: PlayerPosition | 'any'}>,
): TrainingDraftAssignment[] {
  if (roster.length === 0) return []
  if (prev.length === 0) return buildDefaultAssignments(roster)
  const byUser = new Map(prev.map((item) => [item.userId, item]))
  return roster.map((member) => {
    const existing = byUser.get(member.userId)
    if (existing) return {...existing, displayName: member.displayName}
    return {
      userId: member.userId,
      displayName: member.displayName,
      position: (member.position === 'any' ? 'forward' : member.position) as PlayerPosition,
      side: 'bench' as const,
      line: 1,
    }
  })
}

function isLocalBeforeOrEqual(left: string, right: string): boolean {
  const leftIso = localDateTimeToIso(left)
  const rightIso = localDateTimeToIso(right)
  if (!leftIso || !rightIso) return true
  return new Date(leftIso).getTime() <= new Date(rightIso).getTime()
}

export function TeamTrainingCreateWizard({clubId, teamIds}: TeamTrainingCreateWizardProps) {
  const queryClient = useQueryClient()
  const fieldId = useId()
  const {roles} = useSessionAccess()
  const isCoach = roles.includes('coach') || roles.includes('admin')

  const defaultTeamId = teamIds[0] ?? ''
  const [step, setStep] = useState<WizardStep>('details')
  const [teamId, setTeamId] = useState(defaultTeamId)
  const [title, setTitle] = useState('')
  const [startsAt, setStartsAt] = useState(() => defaultLocalDateTimePlusDays(1))
  const [endsAt, setEndsAt] = useState(() =>
    addMinutesToLocalDateTime(defaultLocalDateTimePlusDays(1), 90),
  )
  const [arenaId, setArenaId] = useState('arena-001')
  const [note, setNote] = useState('')
  const [assignments, setAssignments] = useState<TrainingDraftAssignment[]>([])
  const [draftId, setDraftId] = useState<string | null>(null)
  const [draftStatus, setDraftStatus] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [syncedRosterKey, setSyncedRosterKey] = useState('')

  const templates = teamId ? loadTeamLineupTemplates(teamId) : []

  const {data: team} = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => fetchTeam(teamId),
    enabled: Boolean(teamId),
  })

  const {data: roster = [], isLoading: rosterLoading} = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchTeamRoster(teamId),
    enabled: Boolean(teamId) && step !== 'details',
  })

  const activeRoster = useMemo(
    () => roster.filter((member) => member.rosterStatus !== 'removed'),
    [roster],
  )
  const rosterKey = `${teamId}:${activeRoster.map((member) => member.userId).join('|')}`

  useEffect(() => {
    if (step !== 'lineup' || rosterLoading) return
    if (rosterKey === syncedRosterKey) return
    // Sync roster → assignments when entering lineup / roster changes (external data).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional roster hydrate
    setSyncedRosterKey(rosterKey)
    setAssignments((prev) => mergeAssignmentsWithRoster(prev, activeRoster))
  }, [step, rosterLoading, rosterKey, syncedRosterKey, activeRoster])

  const createMutation = useMutation({
    mutationFn: () =>
      createTrainingLineupDraft(clubId, {
        teamId,
        title: title.trim(),
        startsAt: localDateTimeToIso(startsAt),
        endsAt: localDateTimeToIso(endsAt),
        arenaId,
        note: note.trim() || undefined,
        assignments,
      }),
    onSuccess: (draft) => {
      setDraftId(draft.id)
      setDraftStatus(draft.status)
      void queryClient.invalidateQueries({queryKey: ['club-training-drafts', clubId]})
      setStatusMessage(
        isCoach
          ? 'Черновик сохранён. Можно создать тренировку и разослать назначения.'
          : 'Черновик сохранён. Создание тренировки доступно только тренеру — отправьте на одобрение.',
      )
      setStep('review')
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось сохранить черновик')
    },
  })

  const submitMutation = useMutation({
    mutationFn: (id: string) => submitTrainingDraftForApproval(clubId, id),
    onSuccess: (draft) => {
      setDraftStatus(draft.status)
      void queryClient.invalidateQueries({queryKey: ['club-training-drafts', clubId]})
      setStatusMessage('Отправлено тренеру. После одобрения тренер создаст тренировку.')
    },
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => publishTrainingDraft(clubId, id),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({queryKey: ['club-training-drafts', clubId]})
      void queryClient.invalidateQueries({queryKey: ['club-private-trainings', clubId]})
      void queryClient.invalidateQueries({queryKey: ['club-calendar', clubId]})
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
      setStatusMessage(
        `Тренировка создана. Назначения ушли ${result.messageIds.length} игрокам в мессенджер.`,
      )
      setStep('details')
      setTitle('')
      const nextStart = defaultLocalDateTimePlusDays(1)
      setStartsAt(nextStart)
      setEndsAt(addMinutesToLocalDateTime(nextStart, 90))
      setNote('')
      setAssignments([])
      setSyncedRosterKey('')
      setDraftId(null)
      setDraftStatus(null)
    },
    onError: (error) => {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'Создать тренировку может только тренер после одобрения раскладки',
      )
    },
  })

  function updatePlayer(
    userId: string,
    patch: Partial<Pick<TrainingDraftAssignment, 'side' | 'position' | 'line'>>,
  ) {
    setAssignments((prev) =>
      prev.map((item) => {
        if (item.userId !== userId) {
          if (
            patch.side &&
            patch.side !== 'bench' &&
            patch.position &&
            patch.line &&
            item.side === patch.side &&
            item.position === patch.position &&
            (item.line ?? 1) === patch.line
          ) {
            return {...item, side: 'bench'}
          }
          return item
        }
        return {...item, ...patch}
      }),
    )
  }

  function applyTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId)
    if (!template) return
    const names = new Map(activeRoster.map((m) => [m.userId, m.displayName]))
    const fromTpl = draftAssignmentsFromTemplate(template, names)
    const byUser = new Map(fromTpl.map((item) => [item.userId, item]))
    setAssignments(
      activeRoster.map((member) => {
        const hit = byUser.get(member.userId)
        if (hit) return hit
        return {
          userId: member.userId,
          displayName: member.displayName,
          position: (member.position === 'any' ? 'forward' : member.position) as PlayerPosition,
          side: 'bench',
          line: 1,
        }
      }),
    )
    setStatusMessage(`Подставлен шаблон «${template.name}»`)
  }

  function handleStartsAtChange(value: string) {
    setStartsAt(value)
    setEndsAt((prev) => {
      if (!value || !localDateTimeToIso(value)) return prev
      if (!prev || isLocalBeforeOrEqual(prev, value)) {
        return addMinutesToLocalDateTime(value, 90)
      }
      return prev
    })
  }

  const canGoLineup = Boolean(
    title.trim() &&
    startsAt &&
    endsAt &&
    teamId &&
    arenaId &&
    localDateTimeToIso(startsAt) &&
    localDateTimeToIso(endsAt) &&
    !isLocalBeforeOrEqual(endsAt, startsAt),
  )
  const canSaveLineup = assignments.length > 0
  const canPublish = Boolean(isCoach && draftId && draftStatus === 'approved')

  const steps: Array<{key: WizardStep; label: string; disabled: boolean; testKey: string}> = [
    {key: 'details', label: 'Детали', disabled: false, testKey: 'step-details'},
    {key: 'lineup', label: 'Раскладка', disabled: !canGoLineup, testKey: 'step-lineup'},
    {key: 'review', label: 'Черновик / Создать', disabled: !draftId, testKey: 'step-review'},
  ]

  return (
    <section
      className="club-hq__section team-training-wizard"
      data-testid={testId('clubs', 'training-wizard', 'panel', clubId)}
    >
      <SectionHeading
        title="Новая тренировка команды"
        data-testid={testId('clubs', 'training-wizard', 'text', 'title', clubId)}
      />
      <div className="club-hq__card club-hq__wizard">
        <div className="club-hq__wizard-head">
          <p
            className="club-hq__wizard-hint"
            data-testid={testId('clubs', 'training-wizard', 'text', 'hint', clubId)}
          >
            Раскладку можно сохранить как черновик. Создать саму тренировку и разослать назначения —
            только тренер.
          </p>
          {draftId ? (
            <span
              className="club-hq__draft-chip"
              data-testid={testId('clubs', 'training-wizard', 'badge', 'draft', clubId)}
            >
              Черновик #{draftId}
            </span>
          ) : null}
        </div>

        <div className="club-hq__wizard-steps">
          <div
            className="hockey-segmented"
            role="tablist"
            aria-label="Шаги мастера"
            data-testid={testId('clubs', 'training-wizard', 'nav', 'steps', clubId)}
          >
            {steps.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={step === item.key}
                disabled={item.disabled}
                className={`hockey-segmented__item${step === item.key ? ' is-active' : ''}`}
                onClick={() => setStep(item.key)}
                data-testid={testId('clubs', 'training-wizard', 'btn', item.testKey, clubId)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {step === 'details' && (
          <div
            className="club-hq__wizard-body"
            data-testid={testId('clubs', 'training-wizard', 'panel', 'details', clubId)}
          >
            <div className="club-hq__field">
              <label className="club-hq__label" htmlFor={`${fieldId}-team`}>
                Команда
              </label>
              <Select
                id={`${fieldId}-team`}
                size="l"
                width="max"
                value={[teamId]}
                options={teamIds.map((id) => ({
                  value: id,
                  content: id === team?.id ? team.name : id,
                }))}
                onUpdate={(value) => {
                  setTeamId(value[0] ?? defaultTeamId)
                  setAssignments([])
                  setSyncedRosterKey('')
                }}
                data-testid={testId('clubs', 'training-wizard', 'select', 'team', clubId)}
              />
            </div>
            <div className="club-hq__field">
              <label className="club-hq__label" htmlFor={`${fieldId}-title`}>
                Название тренировки
              </label>
              <TextInput
                id={`${fieldId}-title`}
                size="l"
                value={title}
                onUpdate={setTitle}
                data-testid={testId('clubs', 'training-wizard', 'field', 'title', clubId)}
              />
            </div>
            <div className="club-hq__wizard-time">
              <DateTimeField
                label="Начало"
                value={startsAt}
                onChange={handleStartsAtChange}
                testIdQualifier="starts-at"
              />
              <DateTimeField
                label="Конец"
                value={endsAt}
                onChange={setEndsAt}
                testIdQualifier="ends-at"
              />
            </div>
            <div className="club-hq__field">
              <label className="club-hq__label" htmlFor={`${fieldId}-arena`}>
                Арена и локация
              </label>
              <Select
                id={`${fieldId}-arena`}
                size="l"
                width="max"
                value={[arenaId]}
                options={ARENA_OPTIONS}
                onUpdate={(value) => setArenaId(value[0] ?? 'arena-001')}
                data-testid={testId('clubs', 'training-wizard', 'select', 'arena', clubId)}
              />
            </div>
            <div className="club-hq__field">
              <label className="club-hq__label" htmlFor={`${fieldId}-note`}>
                Комментарий для тренера
              </label>
              <TextInput
                id={`${fieldId}-note`}
                size="l"
                value={note}
                onUpdate={setNote}
                data-testid={testId('clubs', 'training-wizard', 'field', 'note', clubId)}
              />
            </div>
            <HockeyButton
              view="action"
              size="l"
              width="max"
              disabled={!canGoLineup}
              onClick={() => setStep('lineup')}
              data-testid={testId('clubs', 'training-wizard', 'btn', 'next-lineup', clubId)}
            >
              Дальше: расстановка на льду
            </HockeyButton>
          </div>
        )}

        {step === 'lineup' && (
          <div
            className="club-hq__wizard-body"
            data-testid={testId('clubs', 'training-wizard', 'panel', 'lineup', clubId)}
          >
            {rosterLoading && (
              <ScoreboardLoader
                label="Загрузка состава"
                data-testid={testId('clubs', 'training-wizard', 'loader', 'roster', clubId)}
              />
            )}

            {templates.length > 0 && (
              <div
                className="hockey-stack hockey-stack--gap-8"
                data-testid={testId('clubs', 'training-wizard', 'panel', 'templates', clubId)}
              >
                <Text color="secondary">Шаблоны из вкладки «Состав»</Text>
                <Select
                  size="m"
                  value={[]}
                  placeholder="Подставить шаблон постановки"
                  options={templates.map((item) => ({
                    value: item.id,
                    content: item.name,
                  }))}
                  onUpdate={(value) => {
                    if (value[0]) applyTemplate(String(value[0]))
                  }}
                  data-testid={testId('clubs', 'training-wizard', 'select', 'template', clubId)}
                />
              </div>
            )}

            {!rosterLoading && assignments.length > 0 && (
              <LineupRinkPreview
                assignments={assignments}
                canEdit
                testIdPrefix="training-wizard-rink"
                onDropToBench={(userId) => updatePlayer(userId, {side: 'bench'})}
                onDropToSlot={(userId, slot) =>
                  updatePlayer(userId, {
                    side: slot.side,
                    position: slot.position,
                    line: slot.line,
                  })
                }
              />
            )}

            <div className="hockey-row hockey-row--gap-8">
              <HockeyButton
                size="s"
                view="outlined"
                onClick={() => setStep('details')}
                data-testid={testId('clubs', 'training-wizard', 'btn', 'back-details', clubId)}
              >
                Назад
              </HockeyButton>
              <HockeyButton
                size="s"
                loading={createMutation.isPending}
                disabled={!canSaveLineup}
                onClick={() => createMutation.mutate()}
                data-testid={testId('clubs', 'training-wizard', 'btn', 'save-draft', clubId)}
              >
                Сохранить черновик
              </HockeyButton>
            </div>
          </div>
        )}

        {step === 'review' && draftId && (
          <div
            className="club-hq__wizard-body"
            data-testid={testId('clubs', 'training-wizard', 'panel', 'review', clubId)}
          >
            <Text data-testid={testId('clubs', 'training-wizard', 'text', 'review-hint', clubId)}>
              {isCoach
                ? 'Вы тренер — можно создать тренировку и разослать назначения игрокам.'
                : 'Черновик сохранён. Отправьте тренеру: только он создаёт тренировку и шлёт appointment в мессенджер.'}
            </Text>
            {draftStatus && (
              <Text
                color="secondary"
                data-testid={testId('clubs', 'training-wizard', 'text', 'draft-status', clubId)}
              >
                Статус черновика: {draftStatus}
              </Text>
            )}

            {assignments.length > 0 && (
              <LineupRinkPreview
                assignments={assignments}
                canEdit={false}
                testIdPrefix="wizard-review"
              />
            )}

            <div className="hockey-row hockey-row--gap-8">
              {!isCoach && (
                <HockeyButton
                  size="s"
                  loading={submitMutation.isPending}
                  onClick={() => submitMutation.mutate(draftId)}
                  data-testid={testId('clubs', 'training-wizard', 'btn', 'submit-coach', clubId)}
                >
                  Отправить тренеру
                </HockeyButton>
              )}
              {isCoach && (
                <HockeyButton
                  size="s"
                  view="action"
                  loading={publishMutation.isPending}
                  disabled={!canPublish}
                  onClick={() => publishMutation.mutate(draftId)}
                  data-testid={testId('clubs', 'training-wizard', 'btn', 'publish', clubId)}
                >
                  Создать тренировку и разослать
                </HockeyButton>
              )}
            </div>
          </div>
        )}

        {statusMessage && (
          <p
            className="club-hq__status"
            data-testid={testId('clubs', 'training-wizard', 'text', 'status', clubId)}
          >
            {statusMessage}
          </p>
        )}
      </div>
    </section>
  )
}
