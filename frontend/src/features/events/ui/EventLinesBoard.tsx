/**
 * HOCFRONT-46 — вкладка «Звенья» на странице игры или тренировки команды.
 * Участник команды смотрит звенья и открывает профиль игрока,
 * тренер добавляет звенья, расставляет игроков и выбирает цвет маек.
 */

import {Pencil, Person, Plus, TrashBin} from '@gravity-ui/icons'
import {Icon, Select, Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {type CSSProperties, useMemo, useState} from 'react'
import {Link} from 'react-router'

import type {
  EventLine,
  EventLines,
  EventLineSlotKey,
  UpdateEventLinesPayload,
} from '@/entities/event'
import {
  EVENT_GOALIE_SLOT_KEYS,
  EVENT_GOALIE_SLOT_LABELS,
  EVENT_LINE_JERSEY_PRESETS,
  EVENT_LINE_SLOT_LABELS,
  EVENT_LINE_SLOT_ROLE,
  EVENT_LINES_MAX,
  fetchEventLines,
  updateEventLines,
} from '@/entities/event'
import {fetchPlayers} from '@/entities/profile'
import type {RosterMember} from '@/entities/team'
import {
  assignGoalie,
  assignSlot,
  collectAssignedUserIds,
  createEmptyLine,
  EVENT_LINE_ROLE_LABELS,
  type EventLinePlayer,
  type EventLineRole,
  goalieSelectPlaceholder,
  jerseyColorLabel,
  pickSlotCandidates,
  playerInitials,
  removeLine,
  upsertLine,
} from '@/features/events/lib/eventLinesModel'
import {isLinesRosterMember} from '@/features/events/lib/useEventLinesAccess'
import {EventLineRink} from '@/features/events/ui/EventLineRink'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {HockeyFormDialog} from '@/shared/ui/HockeyFormDialog'
import {IceCard} from '@/shared/ui/IceCard'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

export interface EventLinesBoardProps {
  eventId: string
  currentUserId: string
  roster: RosterMember[]
  canEdit: boolean
}

interface LineEditState {
  draft: EventLine
  isNew: boolean
  selectedSlot?: EventLineSlotKey
  role: EventLineRole
  pendingUserId: string
  confirmDelete: boolean
}

interface PlayerSheet {
  player: EventLinePlayer
  meta: string
  color: string
}

const ROLE_OPTIONS = (['forward', 'defense'] as const).map((role) => ({
  value: role,
  content: EVENT_LINE_ROLE_LABELS[role],
}))

export function EventLinesBoard({eventId, currentUserId, roster, canEdit}: EventLinesBoardProps) {
  const queryClient = useQueryClient()
  const queryKey = ['event-lines', eventId]
  const {data, isLoading, error, refetch} = useQuery({
    queryKey,
    queryFn: () => fetchEventLines(eventId),
  })
  const {data: playersList = []} = useQuery({
    queryKey: ['players'],
    queryFn: () => fetchPlayers(),
  })

  const [edit, setEdit] = useState<LineEditState | null>(null)
  const [goaliesDraft, setGoaliesDraft] = useState<EventLines['goalies'] | null>(null)
  const [sheet, setSheet] = useState<PlayerSheet | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: UpdateEventLinesPayload) => updateEventLines(eventId, payload),
    onSuccess: (saved) => {
      queryClient.setQueryData(queryKey, saved)
      setEdit(null)
      setGoaliesDraft(null)
    },
  })

  const players = useMemo(() => {
    const avatars = new Map(playersList.map((item) => [item.userId, item.avatarUrl]))
    const map = new Map<string, EventLinePlayer>()
    roster.forEach((member) => {
      map.set(member.userId, {
        userId: member.userId,
        displayName: member.displayName,
        position: member.position,
        avatarUrl: avatars.get(member.userId),
        eligible: isLinesRosterMember(member),
      })
    })
    return map
  }, [playersList, roster])

  if (isLoading) {
    return <ScoreboardLoader label="Загрузка звеньев..." />
  }

  if (error || !data) {
    return (
      <QueryErrorState
        title="Не удалось загрузить звенья"
        onRetry={() => void refetch()}
        testIdPrefix="events"
        data-testid={testId('events', 'lines', 'error', eventId)}
      />
    )
  }

  const lines = data.lines
  const goalies = goaliesDraft ?? data.goalies
  const linesForAssigned = edit ? upsertLine(lines, edit.draft) : lines
  const assigned = collectAssignedUserIds(goalies, linesForAssigned)
  const playerList = [...players.values()].filter((player) => player.eligible !== false)
  const myLine = lines.find((line) => Object.values(line.slots).includes(currentUserId))
  const filledCount = collectAssignedUserIds(data.goalies, lines).size
  const busy = mutation.isPending
  const anyEditing = Boolean(edit || goaliesDraft)

  const save = (payload: UpdateEventLinesPayload) => mutation.mutate(payload)

  const openPlayer = (userId: string, meta: string, color: string) => {
    const player = players.get(userId)
    if (player) setSheet({player, meta, color})
  }

  const startEdit = (line: EventLine, isNew = false) => {
    mutation.reset()
    setGoaliesDraft(null)
    setEdit({draft: line, isNew, role: 'forward', pendingUserId: '', confirmDelete: false})
  }

  const selectSlot = (slot: EventLineSlotKey) => {
    if (!edit) return
    const occupantId = edit.draft.slots[slot]
    const occupant = occupantId ? players.get(occupantId) : undefined
    setEdit({
      ...edit,
      selectedSlot: slot,
      role: EVENT_LINE_SLOT_ROLE[slot],
      pendingUserId: occupant && occupant.eligible !== false && occupantId ? occupantId : '',
    })
  }

  const renderLineCard = (line: EventLine, state: LineEditState | null) => {
    const isEditing = Boolean(state)
    const shown = state?.draft ?? line
    const filled = Object.values(shown.slots).filter(Boolean).length
    const isMine = !isEditing && myLine?.id === line.id
    const selectedSlot = state?.selectedSlot
    const slotCandidates =
      state && selectedSlot
        ? pickSlotCandidates(playerList, state.role, assigned, state.draft.slots[selectedSlot])
        : []

    return (
      <IceCard
        key={line.id}
        padding="m"
        className={`event-lines-card${isEditing || isMine ? ' event-lines-card--accent' : ''}`}
        data-testid={testId('events', 'lines', 'card', 'line', shown.number)}
      >
        <div className="event-lines-card__head">
          <span className="event-lines-card__num">{shown.number}</span>
          <Text as="h3" variant="subheader-2" className="event-lines-card__title">
            Звено {shown.number}
          </Text>
          {isMine ? <span className="hockey-badge hockey-badge--gold">Ваше звено</span> : null}
          {isEditing ? (
            <span className="hockey-badge hockey-badge--gold">Редактирование</span>
          ) : null}
          <span className="event-lines-card__jersey">
            <span
              className="event-lines-swatch event-lines-swatch--small"
              style={{'--event-line-color': shown.jerseyColor} as CSSProperties}
              aria-hidden
            />
            {jerseyColorLabel(shown.jerseyColor)}
            <span className="event-lines-card__count">· {filled} из 5</span>
          </span>
          {canEdit && !anyEditing ? (
            <HockeyButton
              view="outlined"
              size="m"
              className="event-lines-card__edit"
              onClick={() => startEdit(line)}
              data-testid={testId('events', 'lines', 'btn', 'edit', shown.number)}
            >
              <Icon data={Pencil} size={14} />
              Изменить
            </HockeyButton>
          ) : null}
        </div>

        {state ? (
          <fieldset className="event-lines-colors">
            <legend className="event-lines-label">Цвет маек</legend>
            <div className="event-lines-colors__list">
              {EVENT_LINE_JERSEY_PRESETS.map((preset) => {
                const active = preset.color.toLowerCase() === state.draft.jerseyColor.toLowerCase()
                return (
                  <button
                    key={preset.color}
                    type="button"
                    className={`event-lines-swatch${active ? ' event-lines-swatch--active' : ''}`}
                    style={{'--event-line-color': preset.color} as CSSProperties}
                    aria-label={preset.label}
                    aria-pressed={active}
                    title={preset.label}
                    onClick={() =>
                      setEdit({...state, draft: {...state.draft, jerseyColor: preset.color}})
                    }
                    data-testid={testId('events', 'lines', 'btn', 'color', preset.color)}
                  />
                )
              })}
              <label
                className={`event-lines-swatch event-lines-swatch--custom${
                  jerseyColorLabel(state.draft.jerseyColor) === 'Свой цвет'
                    ? ' event-lines-swatch--active'
                    : ''
                }`}
                title="Свой цвет"
              >
                <Icon data={Plus} size={16} />
                <input
                  type="color"
                  className="event-lines-swatch__input"
                  aria-label="Свой цвет маек"
                  value={state.draft.jerseyColor}
                  onChange={(changeEvent) =>
                    setEdit({
                      ...state,
                      draft: {...state.draft, jerseyColor: changeEvent.target.value},
                    })
                  }
                  data-testid={testId('events', 'lines', 'field', 'color-custom')}
                />
              </label>
            </div>
          </fieldset>
        ) : null}

        <EventLineRink
          line={shown}
          players={players}
          currentUserId={currentUserId}
          editing={isEditing}
          selectedSlot={state?.selectedSlot}
          onSlotClick={(slot) => {
            if (state) {
              selectSlot(slot)
              return
            }
            const userId = shown.slots[slot]
            if (userId) {
              openPlayer(
                userId,
                `${EVENT_LINE_SLOT_LABELS[slot]} · Звено ${shown.number}`,
                shown.jerseyColor,
              )
            }
          }}
        />

        {state && selectedSlot ? (
          <div
            className="event-lines-editor"
            data-testid={testId('events', 'lines', 'panel', 'slot-editor')}
          >
            <Text variant="subheader-1">Позиция: {EVENT_LINE_SLOT_LABELS[selectedSlot]}</Text>
            <Select
              label="Амплуа"
              width="max"
              size="l"
              value={[state.role]}
              options={ROLE_OPTIONS}
              onUpdate={(value) =>
                setEdit({...state, role: value[0] as EventLineRole, pendingUserId: ''})
              }
              data-testid={testId('events', 'lines', 'select', 'role')}
            />
            <Select
              label="Игрок"
              width="max"
              size="l"
              placeholder={slotCandidates.length ? 'Выберите игрока' : 'Нет свободных игроков'}
              disabled={!slotCandidates.length}
              value={state.pendingUserId ? [state.pendingUserId] : []}
              options={slotCandidates.map((player) => ({
                value: player.userId,
                content: player.displayName,
              }))}
              onUpdate={(value) => setEdit({...state, pendingUserId: String(value[0] ?? '')})}
              data-testid={testId('events', 'lines', 'select', 'player')}
            />
            <Text variant="body-1" color="secondary">
              В списке — игроки команды с этим амплуа, которых ещё нет в других звеньях.
            </Text>
            <div className="event-lines-actions">
              <HockeyButton
                size="l"
                disabled={!state.pendingUserId}
                onClick={() =>
                  setEdit({
                    ...state,
                    draft: assignSlot(state.draft, selectedSlot, state.pendingUserId),
                  })
                }
                data-testid={testId('events', 'lines', 'btn', 'assign')}
              >
                Поставить
              </HockeyButton>
              <HockeyButton
                size="l"
                view="outlined"
                disabled={!state.draft.slots[selectedSlot]}
                onClick={() =>
                  setEdit({
                    ...state,
                    pendingUserId: '',
                    draft: assignSlot(state.draft, selectedSlot, undefined),
                  })
                }
                data-testid={testId('events', 'lines', 'btn', 'unassign')}
              >
                Освободить
              </HockeyButton>
            </div>
          </div>
        ) : null}

        {state && !selectedSlot ? (
          <Text variant="body-1" color="secondary">
            Нажмите на позицию на площадке, чтобы поставить игрока.
          </Text>
        ) : null}

        {state ? (
          <div className="event-lines-footer">
            {mutation.isError ? (
              <Text
                variant="body-1"
                className="event-lines-error"
                data-testid={testId('events', 'lines', 'error', 'save')}
              >
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : 'Не удалось сохранить звено'}
              </Text>
            ) : null}
            <HockeyButton
              size="l"
              width="max"
              loading={busy}
              onClick={() => save({goalies: data.goalies, lines: upsertLine(lines, state.draft)})}
              data-testid={testId('events', 'lines', 'btn', 'save')}
            >
              Зафиксировать звено
            </HockeyButton>
            <div className="event-lines-actions">
              <HockeyButton
                size="l"
                view="outlined"
                disabled={busy}
                onClick={() => setEdit(null)}
                data-testid={testId('events', 'lines', 'btn', 'cancel')}
              >
                Отмена
              </HockeyButton>
              {state.isNew ? null : state.confirmDelete ? (
                <HockeyButton
                  size="l"
                  view="outlined-danger"
                  loading={busy}
                  onClick={() => save({goalies: data.goalies, lines: removeLine(lines, line.id)})}
                  data-testid={testId('events', 'lines', 'btn', 'delete-confirm')}
                >
                  Точно удалить
                </HockeyButton>
              ) : (
                <HockeyButton
                  size="l"
                  view="outlined-danger"
                  disabled={busy}
                  onClick={() => setEdit({...state, confirmDelete: true})}
                  data-testid={testId('events', 'lines', 'btn', 'delete')}
                >
                  <Icon data={TrashBin} size={14} />
                  Удалить звено
                </HockeyButton>
              )}
            </div>
          </div>
        ) : null}
      </IceCard>
    )
  }

  const renderGoalies = () => {
    const editingGoalies = goaliesDraft !== null
    return (
      <IceCard
        padding="m"
        className={`event-lines-goalies${editingGoalies ? ' event-lines-card--accent' : ''}`}
        data-testid={testId('events', 'lines', 'card', 'goalies')}
      >
        <div className="event-lines-card__head">
          <Text as="h3" variant="subheader-2" className="event-lines-card__title">
            Вратари
          </Text>
          <span className="hockey-badge">ВР</span>
          {canEdit && !anyEditing ? (
            <HockeyButton
              view="outlined"
              size="m"
              className="event-lines-card__edit"
              onClick={() => {
                mutation.reset()
                setGoaliesDraft({...data.goalies})
              }}
              data-testid={testId('events', 'lines', 'btn', 'edit-goalies')}
            >
              <Icon data={Pencil} size={14} />
              Изменить
            </HockeyButton>
          ) : null}
        </div>

        <div className="event-lines-goalies__list">
          {EVENT_GOALIE_SLOT_KEYS.map((slot) => {
            const userId = goalies[slot]
            const stored = userId ? players.get(userId) : undefined
            const player = stored && stored.eligible !== false ? stored : undefined

            if (editingGoalies) {
              const candidates = pickSlotCandidates(playerList, 'goalie', assigned, userId)
              const options = candidates.map((item) => ({
                value: item.userId,
                content: item.displayName,
              }))
              if (userId && !candidates.some((item) => item.userId === userId)) {
                options.unshift({value: userId, content: 'Не в составе'})
              }
              return (
                <Select
                  key={slot}
                  label={EVENT_GOALIE_SLOT_LABELS[slot]}
                  width="max"
                  size="l"
                  hasClear
                  placeholder={goalieSelectPlaceholder(playerList, candidates)}
                  disabled={!candidates.length && !userId}
                  value={userId ? [userId] : []}
                  options={options}
                  onUpdate={(value) =>
                    setGoaliesDraft(
                      assignGoalie(goalies, slot, value[0] ? String(value[0]) : undefined),
                    )
                  }
                  data-testid={testId('events', 'lines', 'select', 'goalie', slot)}
                />
              )
            }

            const content = (
              <>
                <span
                  className={`event-lines-goalie__avatar${player ? '' : ' event-lines-goalie__avatar--empty'}`}
                >
                  {player?.avatarUrl ? (
                    <img src={player.avatarUrl} alt="" loading="lazy" />
                  ) : player ? (
                    playerInitials(player.displayName)
                  ) : (
                    <Icon data={Person} size={16} />
                  )}
                </span>
                <span className="event-lines-goalie__text">
                  <span className="event-lines-goalie__name">
                    {player
                      ? player.userId === currentUserId
                        ? 'Вы'
                        : player.displayName
                      : userId
                        ? 'Не в составе'
                        : 'Не назначен'}
                  </span>
                  <span className="event-lines-goalie__role">{EVENT_GOALIE_SLOT_LABELS[slot]}</span>
                </span>
              </>
            )

            return player ? (
              <button
                key={slot}
                type="button"
                className="event-lines-goalie"
                onClick={() =>
                  openPlayer(
                    player.userId,
                    `Вратарь · ${EVENT_GOALIE_SLOT_LABELS[slot]}`,
                    'var(--hockey-ui-blue)',
                  )
                }
                data-testid={testId('events', 'lines', 'btn', 'goalie', slot)}
              >
                {content}
              </button>
            ) : (
              <div
                key={slot}
                className="event-lines-goalie"
                data-testid={testId('events', 'lines', 'btn', 'goalie', slot)}
              >
                {content}
              </div>
            )
          })}
        </div>

        {editingGoalies ? (
          <div className="event-lines-footer">
            {mutation.isError ? (
              <Text variant="body-1" className="event-lines-error">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : 'Не удалось сохранить вратарей'}
              </Text>
            ) : null}
            <div className="event-lines-actions">
              <HockeyButton
                size="l"
                loading={busy}
                onClick={() => save({goalies, lines})}
                data-testid={testId('events', 'lines', 'btn', 'save-goalies')}
              >
                Сохранить
              </HockeyButton>
              <HockeyButton
                size="l"
                view="outlined"
                disabled={busy}
                onClick={() => setGoaliesDraft(null)}
                data-testid={testId('events', 'lines', 'btn', 'cancel-goalies')}
              >
                Отмена
              </HockeyButton>
            </div>
          </div>
        ) : null}
      </IceCard>
    )
  }

  const newDraft = edit?.isNew ? edit : null

  return (
    <div className="event-lines" data-testid={testId('events', 'lines', 'panel', 'board', eventId)}>
      <div className="event-lines__summary">
        <Text variant="body-1" color="secondary">
          {lines.length
            ? `Звеньев: ${lines.length} из ${EVENT_LINES_MAX} · игроков на местах: ${filledCount}`
            : 'Звенья ещё не собраны'}
        </Text>
      </div>

      {renderGoalies()}

      {lines.length === 0 && !newDraft ? (
        <IceCard
          padding="l"
          className="event-lines-empty"
          data-testid={testId('events', 'lines', 'empty')}
        >
          <Text variant="body-2">
            {canEdit
              ? 'Добавьте первое звено и расставьте игроков по позициям.'
              : 'Тренер ещё не составил звенья на это событие.'}
          </Text>
        </IceCard>
      ) : null}

      <div className="event-lines__grid">
        {lines.map((line) => renderLineCard(line, edit && edit.draft.id === line.id ? edit : null))}
        {newDraft ? renderLineCard(newDraft.draft, newDraft) : null}
      </div>

      {canEdit && !anyEditing ? (
        <button
          type="button"
          className="event-lines-add"
          disabled={lines.length >= EVENT_LINES_MAX}
          onClick={() => startEdit(createEmptyLine(lines), true)}
          data-testid={testId('events', 'lines', 'btn', 'add')}
        >
          <Icon data={Plus} size={16} />
          {lines.length >= EVENT_LINES_MAX
            ? `Максимум ${EVENT_LINES_MAX} звеньев`
            : 'Добавить звено'}
        </button>
      ) : null}

      <HockeyFormDialog
        open={sheet !== null}
        onClose={() => setSheet(null)}
        caption={sheet?.player.displayName ?? ''}
        maxWidth="s"
        data-testid={testId('events', 'lines', 'panel', 'player-dialog')}
        footer={
          sheet ? (
            <>
              <HockeyButton
                view="outlined"
                size="l"
                onClick={() => setSheet(null)}
                data-testid={testId('events', 'lines', 'btn', 'player-close')}
              >
                Закрыть
              </HockeyButton>
              <HockeyButton
                size="l"
                component={Link}
                to={`/players/${sheet.player.userId}`}
                data-testid={testId('events', 'lines', 'link', 'player-profile')}
              >
                Перейти в профиль
              </HockeyButton>
            </>
          ) : null
        }
      >
        {sheet ? (
          <div className="event-lines-player">
            <span
              className="event-lines-player__avatar"
              style={{'--event-line-color': sheet.color} as CSSProperties}
            >
              {sheet.player.avatarUrl ? (
                <img src={sheet.player.avatarUrl} alt="" />
              ) : (
                playerInitials(sheet.player.displayName)
              )}
            </span>
            <Text variant="body-2" color="secondary">
              {sheet.meta}
            </Text>
          </div>
        ) : null}
      </HockeyFormDialog>
    </div>
  )
}
