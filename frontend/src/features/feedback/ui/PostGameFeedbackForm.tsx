/**
 * SPEC-FR-8.1.1, SPEC-FR-8.1.2
 */

import {Select, type SelectOption, Text, TextArea} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {CreateFeedbackPayload} from '@/entities/feedback'
import {submitFeedback} from '@/entities/feedback'
import {fetchPlayers, type PlayersFilterParams} from '@/entities/profile'
import {useSessionAccess} from '@/features/access'
import {POSITION_LABELS} from '@/features/events'
import {useFeedbackEligibleEvents} from '@/features/feedback/lib/useFeedbackEligibility'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

type Tone = 'green' | 'gold' | 'red' | 'blue' | 'muted'

interface ChoiceOption<T extends string> {
  value: T
  label: string
  caption?: string
  tone: Tone
}

const ATTENDANCE_OPTIONS: ChoiceOption<CreateFeedbackPayload['attendanceRating']>[] = [
  {value: 'confirmed', label: 'Вовремя', caption: 'к началу игры', tone: 'green'},
  {value: 'late', label: 'Опоздал', caption: 'после начала', tone: 'gold'},
  {value: 'no_show', label: 'Не явился', caption: 'без предупреждения', tone: 'red'},
]

const SKILL_OPTIONS: ChoiceOption<CreateFeedbackPayload['skillMatchRating']>[] = [
  {value: 'too_low', label: 'Ниже уровня', tone: 'muted'},
  {value: 'matched', label: 'Совпал', tone: 'gold'},
  {value: 'too_high', label: 'Выше уровня', tone: 'muted'},
]

const BEHAVIOR_OPTIONS: ChoiceOption<CreateFeedbackPayload['behaviorRating']>[] = [
  {value: 'neutral', label: 'Нейтральное', tone: 'blue'},
  {value: 'negative', label: 'Грубое', tone: 'red'},
  {value: 'positive', label: 'Позитивное', tone: 'green'},
]

interface OptionMeta {
  meta?: string
}

export interface PostGameFeedbackFormProps {
  /** Фильтры списка игроков из боковой панели страницы */
  playerFilters?: PlayersFilterParams
}

function hasActiveFilters(filters: PlayersFilterParams): boolean {
  return Object.values(filters).some(Boolean)
}

function formatEventMoment(startsAt: string): string {
  return new Date(startsAt).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function renderEntityOption(option: SelectOption<OptionMeta>) {
  const title = String(option.content ?? option.value)
  return (
    <span className="hockey-feedback-entity">
      <span className="hockey-feedback-entity__avatar" aria-hidden>
        {title.charAt(0).toUpperCase()}
      </span>
      <span className="hockey-feedback-entity__copy">
        <span className="hockey-feedback-entity__title">{title}</span>
        {option.data?.meta && (
          <span className="hockey-feedback-entity__meta">{option.data.meta}</span>
        )}
      </span>
    </span>
  )
}

function ChoiceGroup<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string
  label: string
  options: ChoiceOption<T>[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="hockey-feedback-field" data-testid={testId('feedback', 'form', 'field', name)}>
      <span className="hockey-feedback-field__label">{label}</span>
      <div className="hockey-feedback-choices" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              className={`hockey-feedback-choice hockey-feedback-choice--${option.tone}${active ? ' is-active' : ''}`}
              onClick={() => onChange(option.value)}
              data-testid={testId('feedback', 'form', 'btn', name, option.value)}
            >
              <span className="hockey-feedback-choice__label">{option.label}</span>
              {option.caption && (
                <span className="hockey-feedback-choice__caption">{option.caption}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * @spec SPEC-FR-8.1.1 - Форма post-game feedback
 * @spec SPEC-FR-8.1.2 - Только для участников события
 */
export function PostGameFeedbackForm({playerFilters = {}}: PostGameFeedbackFormProps) {
  const queryClient = useQueryClient()
  const {userId} = useSessionAccess()
  const {data: events = []} = useFeedbackEligibleEvents()
  const filtersActive = hasActiveFilters(playerFilters)
  const {data: players = []} = useQuery({
    queryKey: filtersActive ? ['players', playerFilters] : ['players'],
    queryFn: () => fetchPlayers(playerFilters),
  })

  const [eventId, setEventId] = useState('')
  const [toUserId, setToUserId] = useState('')
  const [attendanceRating, setAttendanceRating] =
    useState<CreateFeedbackPayload['attendanceRating']>('confirmed')
  const [skillMatchRating, setSkillMatchRating] =
    useState<CreateFeedbackPayload['skillMatchRating']>('matched')
  const [behaviorRating, setBehaviorRating] =
    useState<CreateFeedbackPayload['behaviorRating']>('positive')
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      setError(null)
      setComment('')
      void queryClient.invalidateQueries({queryKey: ['players']})
      void queryClient.invalidateQueries({queryKey: ['profile']})
    },
    onError: (err: Error) => setError(err.message),
  })

  const selectedEvent = events.find((e) => e.id === eventId)
  const playersById = new Map(players.map((player) => [player.userId, player]))
  const playerMeta = (id: string) => {
    const player = playersById.get(id)
    if (!player) return undefined
    return [POSITION_LABELS[player.position], player.district ?? player.city]
      .filter(Boolean)
      .join(' · ')
  }

  const eventOptions: SelectOption<OptionMeta>[] = events.map((event) => ({
    value: event.id,
    content: event.title,
    data: {
      meta: [formatEventMoment(event.startsAt), event.arenaName].filter(Boolean).join(' · '),
    },
  }))

  const participantOptions: SelectOption<OptionMeta>[] = selectedEvent
    ? selectedEvent.participation
        .filter((p) => p.userId !== userId)
        .filter((p) => !filtersActive || playersById.has(p.userId))
        .map((p) => ({value: p.userId, content: p.displayName, data: {meta: playerMeta(p.userId)}}))
    : players.map((p) => ({
        value: p.userId,
        content: p.displayName,
        data: {meta: playerMeta(p.userId)},
      }))

  function handleSubmit() {
    if (!eventId || !toUserId) {
      setError('Выберите событие и игрока')
      return
    }
    mutation.mutate({
      eventId,
      toUserId,
      attendanceRating,
      skillMatchRating,
      behaviorRating,
      comment: comment || undefined,
    })
  }

  if (events.length === 0) {
    return (
      <EmptyNetState
        title="Нет событий для feedback"
        copy="Feedback доступен только после участия в событии со статусом «иду»."
        testIdPrefix="feedback"
        data-testid={testId('feedback', 'form', 'empty')}
      />
    )
  }

  return (
    <IceCard
      padding="l"
      className="hockey-feedback-form"
      data-testid={testId('feedback', 'form', 'form')}
    >
      <div className="hockey-feedback-form__head">
        <span className="hockey-feedback-form__dot" aria-hidden />
        <Text
          className="hockey-feedback-form__title"
          data-testid={testId('feedback', 'form', 'text', 'title')}
        >
          Post-game evaluation
        </Text>
      </div>

      <div className="hockey-feedback-form__fields">
        <div className="hockey-feedback-field">
          <div className="hockey-feedback-field__label-row">
            <span className="hockey-feedback-field__label">Событие матча</span>
            {selectedEvent && (
              <span
                className="hockey-feedback-field__hint"
                data-testid={testId('feedback', 'form', 'text', 'event-date')}
              >
                {formatEventMoment(selectedEvent.startsAt)}
              </span>
            )}
          </div>
          <Select
            placeholder="Выберите событие"
            value={eventId ? [eventId] : []}
            onUpdate={(v) => {
              setEventId(v[0] ?? '')
              setToUserId('')
            }}
            options={eventOptions}
            renderOption={renderEntityOption}
            renderSelectedOption={renderEntityOption}
            width="max"
            size="xl"
            className="hockey-feedback-entity-select"
            data-testid={testId('feedback', 'form', 'select', 'event')}
          />
        </div>

        <div className="hockey-feedback-field">
          <span className="hockey-feedback-field__label">Игрок для оценки</span>
          <Select
            placeholder={participantOptions.length ? 'Выберите игрока' : 'Нет игроков по фильтрам'}
            value={toUserId ? [toUserId] : []}
            onUpdate={(v) => setToUserId(v[0] ?? '')}
            options={participantOptions}
            renderOption={renderEntityOption}
            renderSelectedOption={renderEntityOption}
            width="max"
            size="xl"
            className="hockey-feedback-entity-select"
            data-testid={testId('feedback', 'form', 'select', 'player')}
          />
        </div>

        <ChoiceGroup
          name="attendance"
          label="Явка на игру"
          options={ATTENDANCE_OPTIONS}
          value={attendanceRating}
          onChange={setAttendanceRating}
        />
        <ChoiceGroup
          name="skill"
          label="Соответствие уровню игры"
          options={SKILL_OPTIONS}
          value={skillMatchRating}
          onChange={setSkillMatchRating}
        />
        <ChoiceGroup
          name="behavior"
          label="Поведение и атмосфера"
          options={BEHAVIOR_OPTIONS}
          value={behaviorRating}
          onChange={setBehaviorRating}
        />

        <div
          className="hockey-feedback-field"
          data-testid={testId('feedback', 'form', 'field', 'comment')}
        >
          <span
            className="hockey-feedback-field__label"
            data-testid={testId('feedback', 'form', 'text', 'comment-label')}
          >
            Комментарий к оценке (опционально)
          </span>
          <TextArea
            value={comment}
            onUpdate={setComment}
            minRows={2}
            size="xl"
            placeholder="Что стоит знать другим игрокам"
            data-testid={testId('feedback', 'form', 'field', 'comment-input')}
          />
        </div>
      </div>

      {error && (
        <Text color="danger" data-testid={testId('feedback', 'form', 'text', 'error')}>
          {error}
        </Text>
      )}
      {mutation.isSuccess && (
        <Text color="positive" data-testid={testId('feedback', 'form', 'text', 'success')}>
          Feedback отправлен
        </Text>
      )}

      <HockeyButton
        size="xl"
        width="max"
        className="hockey-feedback-form__submit"
        loading={mutation.isPending}
        onClick={handleSubmit}
        data-testid={testId('feedback', 'form', 'btn', 'submit')}
      >
        Отправить Feedback
      </HockeyButton>
    </IceCard>
  )
}
