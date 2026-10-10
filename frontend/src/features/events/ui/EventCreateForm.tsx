/**
 * SPEC-FR-4.1.1, SPEC-FR-4.1.2
 * HOCFRONT-28G / ORG-4 — пошаговое создание: draft, paywall, private_club, goalie, ICE
 * HOCFRONT-28 — edit mode + organizerSubscription
 */

import {Select, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {Link, useSearchParams} from 'react-router'

import {fetchArenas} from '@/entities/arena'
import {sendGoalieRequestsForEvent} from '@/entities/calendar'
import type {EventType, SkillLevel} from '@/entities/common'
import {
  createEvent,
  type CreateEventPayload,
  fetchEventById,
  type GameEvent,
  updateEvent,
} from '@/entities/event'
import {fetchMyIceAgreements} from '@/entities/external-flow'
import {fetchProfileSettings} from '@/entities/profile'
import {fetchTeams} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {
  formatAgreementInterval,
  isAgreementReadyForTraining,
} from '@/features/events/lib/iceAgreements'
import {hasOrganizerPublishAccess} from '@/features/events/lib/organizerSubscription'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const TYPE_OPTIONS = [
  {value: 'training', content: 'Тренировка'},
  {value: 'game', content: 'Игра'},
  {value: 'open_ice', content: 'Открытый лёд'},
]

const SKILL_OPTIONS = [
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
  {value: 'league', content: 'Лига'},
]

const ACCESS_OPTIONS = [
  {value: 'public_open', content: 'Открытая для всех'},
  {value: 'private_club', content: 'Только для клуба'},
  {value: 'limited', content: 'По приглашению'},
]

const FORMAT_OPTIONS = [
  {value: 'training', content: 'Тренировка'},
  {value: 'two_way', content: 'Двухсторонка'},
  {value: 'training_two_way', content: 'Тренировка + двухсторонка'},
]

type WizardStep = 'basics' | 'place' | 'format' | 'roster' | 'money' | 'access' | 'publish'

const STEPS: {id: WizardStep; label: string}[] = [
  {id: 'basics', label: 'Основное'},
  {id: 'place', label: 'Место'},
  {id: 'format', label: 'Формат'},
  {id: 'roster', label: 'Состав'},
  {id: 'money', label: 'Деньги'},
  {id: 'access', label: 'Доступ'},
  {id: 'publish', label: 'Публикация'},
]

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function defaultStart(): string {
  const d = new Date(Date.now() + 86400000)
  d.setMinutes(0, 0, 0)
  d.setHours(20)
  return toLocalInputValue(d)
}

function initialAccessFromSearch(raw: string | null): NonNullable<GameEvent['accessScope']> {
  if (raw === 'private_club' || raw === 'limited' || raw === 'public_open') return raw
  return 'public_open'
}

function defaultEnd(startLocal: string): string {
  const d = new Date(startLocal)
  if (Number.isNaN(d.getTime())) return ''
  return toLocalInputValue(new Date(d.getTime() + 90 * 60 * 1000))
}

function isoToLocal(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return toLocalInputValue(d)
}

function slotsFromEvent(event: GameEvent): string {
  const total = event.requiredSlots.reduce((acc, slot) => acc + slot.count, 0)
  return String(total || 12)
}

export interface EventCreateFormProps {
  mode?: 'create' | 'edit'
  initialEvent?: GameEvent
  onSuccess?: (event: GameEvent) => void
}

function resolveAccessScope(
  event: GameEvent | undefined,
  accessParam: string | null,
): NonNullable<GameEvent['accessScope']> {
  if (event?.accessScope === 'club_only') return 'private_club'
  if (
    event?.accessScope === 'public_open' ||
    event?.accessScope === 'private_club' ||
    event?.accessScope === 'limited'
  ) {
    return event.accessScope
  }
  return initialAccessFromSearch(accessParam)
}

/**
 * @spec SPEC-FR-4.1.1 - Форма создания/редактирования игры/тренировки
 * @spec TASK-05-07 / 05-09 / 05-10 / HOCFRONT-28G / ICE
 */
export function EventCreateForm(props: EventCreateFormProps) {
  const [searchParams] = useSearchParams()
  const isEdit = props.mode === 'edit' && Boolean(props.initialEvent)
  const copyFromId = !isEdit ? searchParams.get('copyFrom') : null
  const {
    data: copySource,
    isFetched,
    isError,
  } = useQuery({
    queryKey: ['event', copyFromId],
    queryFn: () => fetchEventById(copyFromId!),
    enabled: Boolean(copyFromId),
  })

  if (copyFromId && !isFetched) {
    return (
      <div data-testid={testId('events', 'create-form', 'loader', 'copy')}>
        <ScoreboardLoader label="Загрузка копии…" />
      </div>
    )
  }

  if (copyFromId && (isError || !copySource)) {
    return (
      <Text color="danger" data-testid={testId('events', 'create-form', 'error', 'copy')}>
        Не удалось загрузить событие для копирования.
      </Text>
    )
  }

  return (
    <EventCreateFormFields
      key={copyFromId ? `copy-${copyFromId}` : (props.initialEvent?.id ?? 'create')}
      {...props}
      copySource={copySource}
    />
  )
}

interface EventCreateFormFieldsProps extends EventCreateFormProps {
  copySource?: GameEvent
}

function EventCreateFormFields({
  mode = 'create',
  initialEvent,
  copySource,
  onSuccess,
}: EventCreateFormFieldsProps) {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const {session} = useSessionAccess()
  const isEdit = mode === 'edit' && Boolean(initialEvent)
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: () => fetchTeams()})
  const {data: arenas = []} = useQuery({queryKey: ['arenas'], queryFn: () => fetchArenas()})
  const {data: agreements = []} = useQuery({
    queryKey: ['my-ice-agreements'],
    queryFn: fetchMyIceAgreements,
  })
  const {data: settings} = useQuery({
    queryKey: ['profile-settings'],
    queryFn: fetchProfileSettings,
  })

  const readyAgreements = useMemo(
    () => agreements.filter(isAgreementReadyForTraining),
    [agreements],
  )

  const seed = initialEvent ?? copySource
  const isCopy = Boolean(copySource) && !isEdit
  const initialAgreementId = isCopy
    ? null
    : (searchParams.get('agreementId') ?? initialEvent?.iceAgreementId ?? null)
  const initialBookingId = isCopy
    ? null
    : (searchParams.get('bookingId') ?? initialEvent?.iceBookingId ?? null)
  const initialArenaId = isCopy
    ? (copySource?.arenaId ?? null)
    : (searchParams.get('arenaId') ?? initialEvent?.arenaId ?? null)
  const initialStarts = isCopy ? null : searchParams.get('startsAt')
  const initialEnds = isCopy ? null : searchParams.get('endsAt')

  const [step, setStep] = useState<WizardStep>(() =>
    !isEdit && !isCopy && (initialAgreementId || initialArenaId) ? 'place' : 'basics',
  )
  const [type, setType] = useState<EventType>(seed?.type ?? 'training')
  const [title, setTitle] = useState(() =>
    isCopy && copySource ? `${copySource.title} (копия)` : (initialEvent?.title ?? ''),
  )
  const [placeMode, setPlaceMode] = useState<'agreement' | 'manual'>(() =>
    isCopy ? 'manual' : initialAgreementId || initialBookingId ? 'agreement' : 'manual',
  )
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(initialAgreementId)
  const [iceBookingId, setIceBookingId] = useState<string | null>(initialBookingId)
  const [iceAgreementId, setIceAgreementId] = useState<string | null>(initialAgreementId)
  const [startsLocal, setStartsLocal] = useState(() => {
    if (isCopy) return defaultStart()
    if (initialEvent) return toLocalInputValue(new Date(initialEvent.startsAt))
    if (initialStarts) return isoToLocal(initialStarts)
    return defaultStart()
  })
  const [endsLocal, setEndsLocal] = useState(() => {
    if (isCopy) return defaultEnd(defaultStart())
    if (initialEvent) return toLocalInputValue(new Date(initialEvent.endsAt))
    if (initialEnds) return isoToLocal(initialEnds)
    return defaultEnd(initialStarts ? isoToLocal(initialStarts) : defaultStart())
  })
  const [arenaIdOverride, setArenaIdOverride] = useState<string | null>(initialArenaId)
  const resolvedArenaId = arenaIdOverride ?? arenas[0]?.id ?? ''
  const [teamId, setTeamId] = useState<string | undefined>(seed?.teamId ?? teams[0]?.id)
  const [clubId, setClubId] = useState<string | undefined>(seed?.clubId)
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(seed?.requiredSkillLevel ?? 'amateur')
  const [pricePerPlayer, setPricePerPlayer] = useState(String(seed?.pricePerPlayer ?? 1500))
  const [slotsTotal, setSlotsTotal] = useState(() => (seed ? slotsFromEvent(seed) : '12'))
  const [accessScope, setAccessScope] = useState<NonNullable<GameEvent['accessScope']>>(() =>
    resolveAccessScope(seed, searchParams.get('access')),
  )
  const [trainingFormat, setTrainingFormat] = useState<NonNullable<GameEvent['trainingFormat']>>(
    seed?.trainingFormat ?? 'training',
  )
  const [goalieRequestSent, setGoalieRequestSent] = useState(false)
  const [pendingGoalieNotify, setPendingGoalieNotify] = useState(false)
  const [createdEventId, setCreatedEventId] = useState<string | null>(initialEvent?.id ?? null)
  const [createdAccessScope, setCreatedAccessScope] = useState<GameEvent['accessScope']>(
    initialEvent?.accessScope,
  )
  const [createdLifecycle, setCreatedLifecycle] = useState<GameEvent['lifecycleStatus']>(
    initialEvent?.lifecycleStatus,
  )
  const [gateError, setGateError] = useState<string | null>(null)
  const [goalieNotifyCount, setGoalieNotifyCount] = useState<number | null>(null)
  const [placeError, setPlaceError] = useState<string | null>(null)

  const hasPaidSubscription = useMemo(
    () => hasOrganizerPublishAccess(settings?.subscription.planId),
    [settings?.subscription.planId],
  )

  const clubOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const membership of session?.user.partnerMemberships ?? []) {
      if (membership.kind === 'club') {
        map.set(membership.entityId, membership.entityName)
      }
    }
    for (const team of teams) {
      if (team.clubId && !map.has(team.clubId)) {
        map.set(team.clubId, `Клуб команды «${team.name}»`)
      }
    }
    if (!map.has('club-001')) {
      map.set('club-001', 'ХК Медведи')
    }
    return [...map.entries()].map(([value, content]) => ({value, content}))
  }, [session?.user.partnerMemberships, teams])

  const resolvedClubId = clubId ?? clubOptions[0]?.value

  const stepIndex = STEPS.findIndex((item) => item.id === step)

  const goalieMutation = useMutation({
    mutationFn: sendGoalieRequestsForEvent,
    onSuccess: (result) => {
      setGoalieRequestSent(true)
      setGoalieNotifyCount(result.created)
      void queryClient.invalidateQueries({queryKey: ['goalie-requests']})
      void queryClient.invalidateQueries({queryKey: ['notifications']})
    },
  })

  const mutation = useMutation({
    mutationFn: async (payload: CreateEventPayload) => {
      if (isEdit && initialEvent) {
        return updateEvent(initialEvent.id, payload)
      }
      return createEvent(payload)
    },
    onSuccess: (event) => {
      void queryClient.invalidateQueries({queryKey: ['events']})
      void queryClient.invalidateQueries({queryKey: ['event', event.id]})
      void queryClient.invalidateQueries({queryKey: ['calendar']})
      void queryClient.invalidateQueries({queryKey: ['calendar-shell']})
      void queryClient.invalidateQueries({queryKey: ['my-ice-agreements']})
      setGateError(null)
      setCreatedEventId(event.id)
      setCreatedAccessScope(event.accessScope)
      setCreatedLifecycle(event.lifecycleStatus)
      if (!isEdit) setTitle('')
      setStep('publish')
      const shouldNotifyGoalies =
        pendingGoalieNotify &&
        event.type === 'training' &&
        (isEdit || event.lifecycleStatus !== 'draft')
      setPendingGoalieNotify(false)
      if (shouldNotifyGoalies) {
        goalieMutation.mutate(event.id)
      } else if (!isEdit) {
        setGoalieRequestSent(false)
        setGoalieNotifyCount(null)
      }
      onSuccess?.(event)
    },
  })

  function buildPayload(
    lifecycleStatus: NonNullable<GameEvent['lifecycleStatus']>,
  ): CreateEventPayload | null {
    if (type === 'training' && accessScope === 'private_club' && !resolvedClubId) {
      setGateError('Выберите клуб-организатор для тренировки «Только для клуба».')
      return null
    }

    const startsAt = new Date(startsLocal)
    const endsAt = new Date(endsLocal)
    const total = Math.max(1, Number(slotsTotal) || 12)
    const goalieCount = Math.min(2, Math.max(1, Math.floor(total / 8)))
    const defenseCount = Math.floor((total - goalieCount) / 2)
    const forwardCount = total - goalieCount - defenseCount
    const isPrivate = accessScope === 'private_club' && type === 'training'

    return {
      type,
      title: title.trim(),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      arenaId: resolvedArenaId,
      teamId,
      requiredSkillLevel: skillLevel,
      requiredSlots: [
        {position: 'goalie' as const, count: goalieCount, filledCount: 0},
        {position: 'defense' as const, count: defenseCount, filledCount: 0},
        {position: 'forward' as const, count: forwardCount, filledCount: 0},
      ],
      pricePerPlayer: isPrivate ? 0 : Number(pricePerPlayer) || undefined,
      accessScope: type === 'training' ? accessScope : ('public' as const),
      clubId: isPrivate ? resolvedClubId : undefined,
      trainingFormat: type === 'training' ? trainingFormat : undefined,
      lifecycleStatus,
      iceBookingId: iceBookingId ?? undefined,
      iceAgreementId: iceAgreementId ?? undefined,
    }
  }

  function canProceedFrom(current: WizardStep): boolean {
    if (current === 'basics') return Boolean(title.trim())
    if (current === 'place') {
      const startOk = !Number.isNaN(new Date(startsLocal).getTime())
      const endOk = !Number.isNaN(new Date(endsLocal).getTime())
      const intervalOk = startOk && endOk && new Date(endsLocal) > new Date(startsLocal)
      if (placeMode === 'agreement') {
        return Boolean(selectedAgreementId && resolvedArenaId && intervalOk)
      }
      return Boolean(resolvedArenaId && intervalOk)
    }
    return true
  }

  function applyAgreement(agreementId: string) {
    const agreement = readyAgreements.find((item) => item.id === agreementId)
    if (!agreement) return
    setSelectedAgreementId(agreement.id)
    setIceAgreementId(agreement.id)
    setIceBookingId(agreement.bookingId)
    setArenaIdOverride(agreement.arenaId)
    setStartsLocal(isoToLocal(agreement.startsAt))
    setEndsLocal(isoToLocal(agreement.endsAt))
    setPlaceError(null)
    setPlaceMode('agreement')
  }

  function goNext() {
    if (!canProceedFrom(step)) return
    const next = STEPS[stepIndex + 1]
    if (next) setStep(next.id)
  }

  function goBack() {
    const prev = STEPS[stepIndex - 1]
    if (prev) setStep(prev.id)
  }

  function handlePublish() {
    if (!title.trim()) {
      setStep('basics')
      return
    }
    if (!canProceedFrom('place')) {
      setPlaceError(
        placeMode === 'agreement'
          ? 'Выберите подтверждённую договорённость с интервалом льда.'
          : 'Укажите арену и корректный интервал времени.',
      )
      setStep('place')
      return
    }

    if (type === 'training' && accessScope === 'public_open' && !hasPaidSubscription) {
      setGateError(
        'Публичная тренировка доступна только с активной подпиской. Оформите Player Plus / Team Pro или выберите «Только для клуба».',
      )
      setStep('publish')
      return
    }

    setGateError(null)
    const payload = buildPayload('published')
    if (!payload) {
      setStep('access')
      return
    }
    mutation.mutate(payload)
  }

  function handleSaveDraft() {
    if (!title.trim()) {
      setStep('basics')
      return
    }
    if (!canProceedFrom('place')) {
      setPlaceError('Сначала выберите место и интервал.')
      setStep('place')
      return
    }
    setGateError(null)
    const payload = buildPayload('draft')
    if (!payload) {
      setStep('access')
      return
    }
    mutation.mutate(payload)
  }

  const arenaOptions = arenas.map((a) => ({value: a.id, content: a.name}))
  const teamOptions = teams.map((t) => ({value: t.id, content: t.name}))
  const isPrivateClub = type === 'training' && accessScope === 'private_club'
  const showPaywallHint =
    type === 'training' && accessScope === 'public_open' && !hasPaidSubscription

  const stepProgress = Math.round(((stepIndex + 1) / STEPS.length) * 100)

  return (
    <div
      className="hockey-stack hockey-stack--gap-12 event-create-form"
      data-testid={testId('events', 'create-form', 'panel')}
    >
      <div className="event-create-form__step-head">
        <Text variant="subheader-2" data-testid={testId('events', 'create-form', 'text', 'title')}>
          {isEdit
            ? 'Редактировать тренировку'
            : `Создание: шаг ${stepIndex + 1} из ${STEPS.length} — ${STEPS[stepIndex]?.label}`}
        </Text>
        {!isEdit ? (
          <span
            className="event-create-form__progress"
            data-testid={testId('events', 'create-form', 'text', 'progress')}
          >
            {stepProgress}%
          </span>
        ) : null}
      </div>

      <div
        className="hockey-row hockey-row--gap-8 hockey-row--wrap event-create-form__steps"
        data-testid={testId('events', 'create-form', 'panel', 'steps')}
      >
        {STEPS.map((item, index) => (
          <HockeyButton
            key={item.id}
            view={step === item.id ? 'action' : 'outlined'}
            size="s"
            className="event-create-form__step"
            onClick={() => {
              if (index <= stepIndex || canProceedFrom(step)) setStep(item.id)
            }}
            data-testid={testId('events', 'create-form', 'btn', 'step', item.id)}
          >
            {item.label}
          </HockeyButton>
        ))}
      </div>

      {step === 'basics' ? (
        <>
          <TextInput
            label="Название"
            value={title}
            onUpdate={(value) => {
              setTitle(value)
              if (createdEventId && !isEdit) setCreatedEventId(null)
            }}
            data-testid={testId('events', 'create-form', 'field', 'title')}
          />
          <Select
            label="Тип"
            value={[type]}
            onUpdate={(v) => {
              const next = v[0] as EventType
              setType(next)
              if (next !== 'training') setPendingGoalieNotify(false)
              if (createdEventId && !isEdit) setCreatedEventId(null)
            }}
            options={TYPE_OPTIONS}
            disabled={isEdit}
            data-testid={testId('events', 'create-form', 'select', 'type')}
          />
        </>
      ) : null}

      {step === 'place' ? (
        <>
          <div
            className="hockey-row hockey-row--gap-8 hockey-row--wrap"
            data-testid={testId('events', 'create-form', 'panel', 'place-mode')}
          >
            <HockeyButton
              view={placeMode === 'agreement' ? 'action' : 'outlined'}
              size="s"
              onClick={() => setPlaceMode('agreement')}
              data-testid={testId('events', 'create-form', 'btn', 'place-agreement')}
            >
              Из договорённостей
            </HockeyButton>
            <HockeyButton
              view={placeMode === 'manual' ? 'action' : 'outlined'}
              size="s"
              onClick={() => {
                setPlaceMode('manual')
                setSelectedAgreementId(null)
                setIceAgreementId(null)
                setIceBookingId(null)
              }}
              data-testid={testId('events', 'create-form', 'btn', 'place-manual')}
            >
              Вручную
            </HockeyButton>
          </div>

          {placeMode === 'agreement' ? (
            <div
              className="hockey-stack hockey-stack--gap-8"
              data-testid={testId('events', 'create-form', 'panel', 'agreements')}
            >
              {readyAgreements.length === 0 ? (
                <Text
                  color="secondary"
                  data-testid={testId('events', 'create-form', 'text', 'agreements-empty')}
                >
                  Нет подтверждённых слотов. Запросите лёд у арены — после бронирования он появится
                  здесь. Пока можно выбрать арену вручную.
                </Text>
              ) : (
                readyAgreements.map((agreement) => (
                  <HockeyButton
                    key={agreement.id}
                    view={selectedAgreementId === agreement.id ? 'action' : 'outlined'}
                    size="m"
                    onClick={() => applyAgreement(agreement.id)}
                    data-testid={testId(
                      'events',
                      'create-form',
                      'btn',
                      'pick-agreement',
                      agreement.id,
                    )}
                  >
                    {agreement.arenaName} ·{' '}
                    {formatAgreementInterval(agreement.startsAt, agreement.endsAt)}
                  </HockeyButton>
                ))
              )}
              <Link
                to={routes.eventsOrganizer}
                data-testid={testId('events', 'create-form', 'link', 'agreements-cabinet')}
              >
                <HockeyButton
                  view="flat"
                  size="s"
                  data-testid={testId('events', 'create-form', 'btn', 'agreements-cabinet')}
                >
                  Кабинет: договорённости
                </HockeyButton>
              </Link>
            </div>
          ) : (
            <>
              <Select
                label="Арена"
                value={resolvedArenaId ? [resolvedArenaId] : []}
                onUpdate={(v) => setArenaIdOverride(v[0])}
                options={arenaOptions}
                data-testid={testId('events', 'create-form', 'select', 'arena')}
              />
              <div className="hockey-stack hockey-stack--gap-4">
                <Text
                  variant="body-2"
                  data-testid={testId('events', 'create-form', 'text', 'starts-at-label')}
                >
                  Начало
                </Text>
                <input
                  type="datetime-local"
                  className="g-text-input__control"
                  value={startsLocal}
                  onChange={(event) => {
                    const value = event.target.value
                    setStartsLocal(value)
                    setEndsLocal(defaultEnd(value))
                  }}
                  data-testid={testId('events', 'create-form', 'field', 'starts-at')}
                />
              </div>
              <div className="hockey-stack hockey-stack--gap-4">
                <Text
                  variant="body-2"
                  data-testid={testId('events', 'create-form', 'text', 'ends-at-label')}
                >
                  Конец
                </Text>
                <input
                  type="datetime-local"
                  className="g-text-input__control"
                  value={endsLocal}
                  onChange={(event) => setEndsLocal(event.target.value)}
                  data-testid={testId('events', 'create-form', 'field', 'ends-at')}
                />
              </div>
            </>
          )}

          {placeMode === 'agreement' && selectedAgreementId ? (
            <Text
              color="secondary"
              data-testid={testId('events', 'create-form', 'text', 'agreement-selected')}
            >
              Интервал зафиксирован договорённостью: {startsLocal.replace('T', ' ')} –{' '}
              {endsLocal.slice(11, 16)}
            </Text>
          ) : null}

          {teamOptions.length > 0 ? (
            <Select
              label="Команда"
              value={teamId ? [teamId] : []}
              onUpdate={(v) => {
                const nextTeamId = v[0] || undefined
                setTeamId(nextTeamId)
                const teamClubId = teams.find((team) => team.id === nextTeamId)?.clubId
                if (teamClubId) setClubId(teamClubId)
              }}
              options={teamOptions}
              data-testid={testId('events', 'create-form', 'select', 'team')}
            />
          ) : null}

          {placeError ? (
            <Text color="danger" data-testid={testId('events', 'create-form', 'error', 'place')}>
              {placeError}
            </Text>
          ) : null}
        </>
      ) : null}

      {step === 'format' ? (
        <>
          <Select
            label="Уровень"
            value={[skillLevel]}
            onUpdate={(v) => setSkillLevel(v[0] as SkillLevel)}
            options={SKILL_OPTIONS}
            data-testid={testId('events', 'create-form', 'select', 'skill')}
          />
          {type === 'training' ? (
            <Select
              label="Формат"
              value={[trainingFormat]}
              onUpdate={(v) => setTrainingFormat(v[0] as NonNullable<GameEvent['trainingFormat']>)}
              options={FORMAT_OPTIONS}
              data-testid={testId('events', 'create-form', 'select', 'format')}
            />
          ) : null}
        </>
      ) : null}

      {step === 'roster' ? (
        <>
          <TextInput
            label="Количество мест"
            value={slotsTotal}
            onUpdate={setSlotsTotal}
            data-testid={testId('events', 'create-form', 'field', 'slots')}
          />
          <Text
            color="secondary"
            data-testid={testId('events', 'create-form', 'text', 'roster-hint')}
          >
            Места распределяются по вратарям, защите и нападению автоматически. Запрос вратарям — на
            шаге публикации.
          </Text>
        </>
      ) : null}

      {step === 'money' ? (
        <>
          <TextInput
            label="Цена за игрока (₽)"
            value={isPrivateClub ? '0' : pricePerPlayer}
            onUpdate={setPricePerPlayer}
            disabled={isPrivateClub}
            data-testid={testId('events', 'create-form', 'field', 'price')}
          />
          {isPrivateClub ? (
            <Text
              color="secondary"
              data-testid={testId('events', 'create-form', 'text', 'money-private')}
            >
              Для клубной тренировки цена для участников — 0 ₽.
            </Text>
          ) : (
            <Text
              color="secondary"
              data-testid={testId('events', 'create-form', 'text', 'money-hint')}
            >
              Укажите стоимость участия. Доступ (открытая / клуб / по приглашению) — на следующем
              шаге.
            </Text>
          )}
        </>
      ) : null}

      {step === 'access' ? (
        <>
          {type === 'training' ? (
            <Select
              label="Кто увидит тренировку"
              value={[accessScope]}
              onUpdate={(v) => {
                setAccessScope(v[0] as NonNullable<GameEvent['accessScope']>)
                setGateError(null)
              }}
              options={ACCESS_OPTIONS}
              data-testid={testId('events', 'create-form', 'select', 'access')}
            />
          ) : (
            <Text
              color="secondary"
              data-testid={testId('events', 'create-form', 'text', 'access-game')}
            >
              Игры публикуются в общем каталоге.
            </Text>
          )}
          {isPrivateClub ? (
            <>
              <Select
                label="Клуб-организатор"
                value={resolvedClubId ? [resolvedClubId] : []}
                onUpdate={(v) => setClubId(v[0])}
                options={clubOptions}
                data-testid={testId('events', 'create-form', 'select', 'club')}
              />
              <Text
                color="positive"
                data-testid={testId('events', 'create-form', 'text', 'private-badge')}
              >
                Бейдж: Только для клуба — в общем поиске не показывается, для членов клуба
                бесплатно.
              </Text>
            </>
          ) : null}
        </>
      ) : null}

      {step === 'publish' ? (
        <>
          {showPaywallHint ? (
            <Text color="warning" data-testid={testId('events', 'create-form', 'text', 'paywall')}>
              Чтобы опубликовать открытую тренировку для всех, нужна активная подписка. Можно
              сохранить черновик или сделать тренировку только для клуба.
            </Text>
          ) : null}

          {gateError ? (
            <Text color="danger" data-testid={testId('events', 'create-form', 'error', 'gate')}>
              {gateError}
            </Text>
          ) : null}

          {type === 'training' ? (
            <div className="hockey-stack hockey-stack--gap-8">
              <HockeyButton
                view={pendingGoalieNotify ? 'action' : 'outlined'}
                size="s"
                loading={goalieMutation.isPending}
                onClick={() => {
                  if (createdEventId && (isEdit || title.trim())) {
                    goalieMutation.mutate(createdEventId)
                    return
                  }
                  if (isEdit) return
                  setCreatedEventId(null)
                  setPendingGoalieNotify((prev) => !prev)
                }}
                data-testid={testId('events', 'create-form', 'btn', 'goalie-request')}
              >
                {pendingGoalieNotify ? 'Запрос вратарям: включён' : 'Опционально: запрос вратарям'}
              </HockeyButton>
              {pendingGoalieNotify && !goalieRequestSent ? (
                <Text
                  color="secondary"
                  data-testid={testId('events', 'create-form', 'text', 'goalie-pending')}
                >
                  После публикации уйдёт запрос вратарям по окнам возможностей.
                </Text>
              ) : null}
              {goalieRequestSent ? (
                <Text
                  color="positive"
                  data-testid={testId('events', 'create-form', 'text', 'goalie-sent')}
                >
                  Запрос вратарям отправлен
                  {goalieNotifyCount != null ? `: ${goalieNotifyCount}` : ''} (демо).
                </Text>
              ) : null}
            </div>
          ) : null}

          {createdEventId ? (
            <div
              className="hockey-stack hockey-stack--gap-8"
              data-testid={testId('events', 'create-form', 'panel', 'success')}
            >
              <Text
                color="positive"
                data-testid={testId('events', 'create-form', 'text', 'success')}
              >
                {isEdit
                  ? 'Изменения сохранены.'
                  : createdLifecycle === 'draft'
                    ? 'Черновик сохранён в кабинете организатора.'
                    : 'Событие опубликовано.'}
                {createdAccessScope === 'private_club' ? ' Бейдж: Только для клуба.' : ''}
              </Text>
              <Link
                to={routes.eventsOrganizer}
                data-testid={testId('events', 'create-form', 'link', 'cabinet')}
              >
                <HockeyButton
                  view="outlined"
                  size="s"
                  data-testid={testId('events', 'create-form', 'btn', 'cabinet')}
                >
                  В кабинет организатора
                </HockeyButton>
              </Link>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
        {stepIndex > 0 ? (
          <HockeyButton
            view="flat"
            size="m"
            onClick={goBack}
            data-testid={testId('events', 'create-form', 'btn', 'back')}
          >
            Назад
          </HockeyButton>
        ) : null}
        {step !== 'publish' ? (
          <HockeyButton
            view="action"
            size="m"
            onClick={goNext}
            disabled={!canProceedFrom(step)}
            data-testid={testId('events', 'create-form', 'btn', 'next')}
          >
            Далее
          </HockeyButton>
        ) : (
          <>
            <HockeyButton
              view="action"
              size="m"
              loading={mutation.isPending}
              onClick={handlePublish}
              data-testid={testId('events', 'create-form', 'btn', 'submit')}
            >
              {isEdit ? 'Сохранить' : 'Опубликовать'}
            </HockeyButton>
            {!isEdit ? (
              <HockeyButton
                view="outlined"
                size="m"
                loading={mutation.isPending}
                onClick={handleSaveDraft}
                data-testid={testId('events', 'create-form', 'btn', 'draft')}
              >
                Сохранить черновик
              </HockeyButton>
            ) : null}
            {isEdit && initialEvent ? (
              <Link
                to={`/events/trainings/${initialEvent.id}`}
                data-testid={testId('events', 'create-form', 'link', 'back-details')}
              >
                <HockeyButton
                  view="flat"
                  size="m"
                  data-testid={testId('events', 'create-form', 'btn', 'back-details')}
                >
                  К карточке
                </HockeyButton>
              </Link>
            ) : null}
            {!isEdit ? (
              <Link
                to={routes.profile}
                data-testid={testId('events', 'create-form', 'link', 'upgrade')}
              >
                <HockeyButton
                  view="flat"
                  size="m"
                  data-testid={testId('events', 'create-form', 'btn', 'upgrade')}
                >
                  Тарифы в профиле
                </HockeyButton>
              </Link>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
