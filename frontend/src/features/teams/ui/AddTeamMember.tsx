/**
 * SPEC-FR-3.1.2, SPEC-FR-21.1.1, SPEC-FR-21.1.2
 * HOCFRONT-25 — поиск игроков сайта + статусы приглашений + чат
 */

import {Label, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {useNavigate} from 'react-router'

import {createDirectChat} from '@/entities/messenger'
import {fetchPlayers} from '@/entities/profile'
import type {TeamInvite, TeamInviteStatus} from '@/entities/team'
import {
  addTeamMember,
  fetchTeamInvites,
  fetchTeamRoster,
  inviteTeamMemberByEmail,
} from '@/entities/team'
import {POSITION_LABELS, SKILL_LEVEL_LABELS} from '@/features/events'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

import {TeamPositionBadge} from './TeamPositionBadge'

const INVITE_STATUS_LABELS: Record<TeamInviteStatus, string> = {
  sent: 'Отправлено приглашение',
  received: 'Получено',
  accepted: 'Принято',
  declined: 'Отказано',
  expired: 'Истекло',
}

const INVITE_STATUS_THEME: Record<
  TeamInviteStatus,
  'info' | 'warning' | 'success' | 'danger' | 'unknown'
> = {
  sent: 'info',
  received: 'warning',
  accepted: 'success',
  declined: 'danger',
  expired: 'unknown',
}

/** @spec SPEC-FR-3.1.2 - Props добавления игрока */
export interface AddTeamMemberProps {
  /** @spec SPEC-FR-3.1.2 */
  teamId: string
}

/**
 * @spec SPEC-FR-3.1.2 - Поиск и приглашение зарегистрированных игроков
 */
export function AddTeamMember({teamId}: AddTeamMemberProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [chatPendingUserId, setChatPendingUserId] = useState<string | null>(null)

  const {data: players = [], isFetching: playersLoading} = useQuery({
    queryKey: ['players', {q: searchQuery.trim()}],
    queryFn: () => fetchPlayers({q: searchQuery.trim() || undefined}),
  })
  const {data: roster = []} = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchTeamRoster(teamId),
  })
  const {data: invites = []} = useQuery({
    queryKey: ['team-invites', teamId],
    queryFn: () => fetchTeamInvites(teamId),
  })

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => addTeamMember(teamId, userId),
    onSuccess: (member) => {
      void queryClient.invalidateQueries({queryKey: ['roster', teamId]})
      void queryClient.invalidateQueries({queryKey: ['team-invites', teamId]})
      setStatusMessage(`Приглашение отправлено: ${member.displayName}`)
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось отправить приглашение')
    },
  })

  const inviteMutation = useMutation({
    mutationFn: (email: string) => inviteTeamMemberByEmail(teamId, email),
    onSuccess: (invite) => {
      void queryClient.invalidateQueries({queryKey: ['team-invites', teamId]})
      setInviteEmail('')
      setStatusMessage(`Приглашение отправлено на ${invite.email}`)
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось отправить приглашение')
    },
  })

  const chatMutation = useMutation({
    mutationFn: (userId: string) => createDirectChat(userId),
    onMutate: (userId) => {
      setChatPendingUserId(userId)
    },
    onSuccess: (chat) => {
      setChatPendingUserId(null)
      void navigate(`/messenger?chatId=${encodeURIComponent(chat.id)}`)
    },
    onError: (error) => {
      setChatPendingUserId(null)
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось открыть чат')
    },
  })

  const blockedUserIds = useMemo(() => {
    const ids = new Set<string>()
    for (const member of roster) {
      if (
        member.rosterStatus === 'active' ||
        member.rosterStatus === 'bench' ||
        member.rosterStatus === 'invited'
      ) {
        ids.add(member.userId)
      }
    }
    return ids
  }, [roster])

  const searchablePlayers = useMemo(
    () => players.filter((player) => !blockedUserIds.has(player.userId)),
    [players, blockedUserIds],
  )

  const registeredInvites = useMemo(
    () =>
      invites
        .filter((invite): invite is TeamInvite & {userId: string} => Boolean(invite.userId))
        .sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt)),
    [invites],
  )

  const emailInvites = useMemo(
    () => invites.filter((invite) => invite.email && !invite.userId).slice(0, 3),
    [invites],
  )

  return (
    <div
      className="hockey-stack hockey-stack--gap-12"
      data-testid={testId('teams', 'add-team-member', 'form', teamId)}
    >
      <Text
        color="secondary"
        data-testid={testId('teams', 'add-team-member', 'text', 'hint', teamId)}
      >
        Найдите игрока среди всех зарегистрированных на сайте и отправьте приглашение в состав.
      </Text>

      <TextInput
        label="Поиск игроков"
        value={searchQuery}
        placeholder="Имя, город, район…"
        onUpdate={setSearchQuery}
        data-testid={testId('teams', 'add-team-member', 'field', 'search', teamId)}
      />

      <div
        className="add-team-member__results"
        data-testid={testId('teams', 'add-team-member', 'list', 'search', teamId)}
      >
        {playersLoading && (
          <Text
            color="secondary"
            data-testid={testId('teams', 'add-team-member', 'loader', 'search', teamId)}
          >
            Ищем игроков…
          </Text>
        )}
        {!playersLoading && searchablePlayers.length === 0 && (
          <Text
            color="secondary"
            data-testid={testId('teams', 'add-team-member', 'empty', 'search', teamId)}
          >
            {searchQuery.trim()
              ? 'Никого не нашли по запросу'
              : 'Все найденные игроки уже в составе или приглашены'}
          </Text>
        )}
        {searchablePlayers.slice(0, 8).map((player) => (
          <div
            key={player.userId}
            className="hockey-list-row team-invite-row"
            data-testid={testId('teams', 'add-team-member', 'row', 'player', player.userId)}
          >
            <TeamPositionBadge position={player.position} />
            <div className="team-invite-row__body">
              <Text
                className="team-invite-row__name"
                data-testid={testId('teams', 'add-team-member', 'text', 'name', player.userId)}
              >
                {player.displayName}
              </Text>
              <Text
                color="secondary"
                className="team-invite-row__meta"
                data-testid={testId('teams', 'add-team-member', 'text', 'meta', player.userId)}
              >
                {POSITION_LABELS[player.position] ?? player.position} ·{' '}
                {SKILL_LEVEL_LABELS[player.skillLevel] ?? player.skillLevel}
                {player.city ? ` · ${player.city}` : ''}
              </Text>
            </div>
            <HockeyButton
              size="l"
              view="action"
              className="team-invite-row__btn"
              loading={addMemberMutation.isPending && addMemberMutation.variables === player.userId}
              onClick={() => addMemberMutation.mutate(player.userId)}
              data-testid={testId('teams', 'add-team-member', 'btn', 'invite', player.userId)}
            >
              Отправить приглашение
            </HockeyButton>
          </div>
        ))}
      </div>

      {registeredInvites.length > 0 && (
        <div
          className="hockey-stack hockey-stack--gap-8"
          data-testid={testId('teams', 'add-team-member', 'list', 'player-invites', teamId)}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('teams', 'add-team-member', 'text', 'invites-title', teamId)}
          >
            Приглашения игрокам
          </Text>
          {registeredInvites.map((invite) => (
            <div
              key={invite.id}
              className="hockey-row hockey-row--between hockey-row--gap-8"
              data-testid={testId('teams', 'add-team-member', 'row', 'invite', invite.id)}
            >
              <div className="hockey-stack hockey-stack--gap-4">
                <Text
                  data-testid={testId('teams', 'add-team-member', 'text', 'invite-name', invite.id)}
                >
                  {invite.displayName ?? invite.userId}
                </Text>
                <Label
                  theme={INVITE_STATUS_THEME[invite.status]}
                  data-testid={testId(
                    'teams',
                    'add-team-member',
                    'badge',
                    'invite-status',
                    invite.id,
                  )}
                >
                  {INVITE_STATUS_LABELS[invite.status]}
                </Label>
              </div>
              <HockeyButton
                size="s"
                view="outlined"
                loading={chatPendingUserId === invite.userId}
                onClick={() => chatMutation.mutate(invite.userId)}
                data-testid={testId('teams', 'add-team-member', 'btn', 'chat', invite.userId)}
              >
                В чат
              </HockeyButton>
            </div>
          ))}
        </div>
      )}

      <Text
        color="secondary"
        data-testid={testId('teams', 'add-team-member', 'text', 'invite-hint', teamId)}
      >
        Если игрок не зарегистрирован, отправьте ему приглашение на email.
      </Text>
      <div className="hockey-row hockey-row--gap-8 hockey-row--end">
        <TextInput
          label="Email приглашения"
          value={inviteEmail}
          placeholder="player@example.com"
          onUpdate={setInviteEmail}
          data-testid={testId('teams', 'add-team-member', 'field', 'invite-email', teamId)}
        />
        <HockeyButton
          view="outlined"
          loading={inviteMutation.isPending}
          disabled={!inviteEmail.trim()}
          onClick={() => inviteMutation.mutate(inviteEmail)}
          data-testid={testId('teams', 'add-team-member', 'btn', 'invite-email', teamId)}
        >
          Отправить приглашение
        </HockeyButton>
      </div>
      {emailInvites.length > 0 && (
        <div
          className="hockey-stack hockey-stack--gap-6"
          data-testid={testId('teams', 'add-team-member', 'list', 'email-invites', teamId)}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('teams', 'add-team-member', 'text', 'email-invites-title', teamId)}
          >
            Email-приглашения
          </Text>
          {emailInvites.map((invite) => (
            <Text
              key={invite.id}
              color="secondary"
              data-testid={testId('teams', 'add-team-member', 'item', 'invite', invite.id)}
            >
              {invite.email} · {INVITE_STATUS_LABELS[invite.status]} ·{' '}
              {new Date(invite.createdAt).toLocaleDateString('ru-RU')}
            </Text>
          ))}
        </div>
      )}
      {statusMessage && (
        <Text
          color="secondary"
          data-testid={testId('teams', 'add-team-member', 'text', 'status', teamId)}
        >
          {statusMessage}
        </Text>
      )}
    </div>
  )
}
