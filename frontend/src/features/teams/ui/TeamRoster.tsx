/**
 * SPEC-FR-3.2.1, SPEC-FR-3.2.2
 * SPEC-UI-2.3
 */

import {Select, Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Link} from 'react-router'

import type {RosterMember, TeamRole} from '@/entities/team'
import {fetchTeamRoster, updateRosterMemberStatus, updateTeamMemberRole} from '@/entities/team'
import type {TeamPermissions} from '@/features/access'
import {testId} from '@/shared/testing/testId'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

import {POSITION_GROUP_LABELS} from '../lib/positionGroups'
import {TeamPositionBadge} from './TeamPositionBadge'

const STATUS_OPTIONS = [
  {value: 'active', content: 'Активен'},
  {value: 'bench', content: 'Запасной'},
  {value: 'invited', content: 'Приглашён'},
  {value: 'declined', content: 'Отказано'},
  {value: 'removed', content: 'Удалён'},
]

const ROLE_OPTIONS = [
  {value: 'owner', content: 'Владелец'},
  {value: 'captain', content: 'Капитан'},
  {value: 'coach', content: 'Тренер'},
  {value: 'team_admin', content: 'Админ команды'},
  {value: 'player', content: 'Игрок'},
]

const POSITION_ORDER = ['goalie', 'defense', 'forward', 'any'] as const

/** @spec SPEC-FR-3.2.1 - Props состава */
export interface TeamRosterProps {
  /** @spec SPEC-FR-3.2.1 */
  teamId: string
  userId: string
  teamPermissions: (teamRole?: TeamRole) => TeamPermissions
}

/**
 * @spec SPEC-UI-2.3 - Состав по позициям (крючки-слоты)
 * @spec SPEC-FR-3.2.1 - Отображение состава
 */
export function TeamRoster({teamId, userId, teamPermissions}: TeamRosterProps) {
  const queryClient = useQueryClient()
  const {data: roster = [], isLoading} = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchTeamRoster(teamId),
  })

  const mutation = useMutation({
    mutationFn: ({
      memberUserId,
      rosterStatus,
    }: {
      memberUserId: string
      rosterStatus: RosterMember['rosterStatus']
    }) => updateRosterMemberStatus(teamId, memberUserId, rosterStatus),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['roster', teamId]})
    },
  })

  const roleMutation = useMutation({
    mutationFn: ({
      memberUserId,
      teamRole,
    }: {
      memberUserId: string
      teamRole: NonNullable<RosterMember['teamRole']>
    }) => updateTeamMemberRole(teamId, memberUserId, teamRole),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['roster', teamId]})
    },
  })

  if (isLoading) {
    return (
      <ScoreboardLoader
        label="Загрузка состава"
        testIdPrefix="teams"
        data-testid={testId('teams', 'team-roster', 'loader', teamId)}
      />
    )
  }

  const myTeamRole = (roster.find((m) => m.userId === userId)?.teamRole ?? 'player') as TeamRole
  const permissions = teamPermissions(myTeamRole)
  const {canManageRoster, canManageRoles, isReadOnly} = permissions
  const ownerCount = roster.filter(
    (m) => m.teamRole === 'owner' && m.rosterStatus !== 'removed',
  ).length
  const isOwner = myTeamRole === 'owner'

  const byPosition = POSITION_ORDER.map((pos) => ({
    position: pos,
    members: roster.filter((m) => m.position === pos && m.rosterStatus !== 'removed'),
  }))

  return (
    <div
      className="team-roster hockey-stack hockey-stack--gap-12"
      data-testid={testId('teams', 'team-roster', 'panel', teamId)}
    >
      <Text
        color="secondary"
        data-testid={testId('teams', 'team-roster', 'text', 'role-hint', teamId)}
      >
        Твоя роль в команде: {myTeamRole}.{' '}
        {isReadOnly
          ? 'Состав доступен только для просмотра — управление открыто капитану и штабу.'
          : canManageRoles
            ? 'Доступно управление ролями и статусами.'
            : 'Частичный доступ к управлению командой.'}
      </Text>
      {byPosition.map(({position, members}) => (
        <div
          key={position}
          data-testid={testId('teams', 'team-roster', 'column', position, teamId)}
        >
          <p
            className="team-group-label"
            data-testid={testId('teams', 'team-roster', 'badge', 'position', position, teamId)}
          >
            {POSITION_GROUP_LABELS[position]}
          </p>
          <div className="team-roster__rows">
            {members.length === 0 ? (
              <div
                className="hockey-list-row team-roster-row team-roster-row--empty"
                data-testid={testId('teams', 'team-roster', 'empty', position, teamId)}
              >
                <TeamPositionBadge position={position} />
                <Text
                  color="secondary"
                  data-testid={testId(
                    'teams',
                    'team-roster',
                    'text',
                    'empty-slot',
                    position,
                    teamId,
                  )}
                >
                  Слот пуст — нужен игрок
                </Text>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.userId}
                  className="hockey-list-row team-roster-row"
                  data-testid={testId('teams', 'team-roster', 'row', member.userId)}
                >
                  <TeamPositionBadge position={member.position} />
                  <div className="team-roster-row__body">
                    <Link
                      to={`/players/${member.userId}`}
                      className="team-roster-row__name"
                      data-testid={testId('teams', 'team-roster', 'link', 'player', member.userId)}
                    >
                      <span
                        data-testid={testId('teams', 'team-roster', 'text', 'name', member.userId)}
                      >
                        {member.displayName}
                      </span>
                    </Link>
                    <Text
                      color="secondary"
                      className="team-roster-row__meta"
                      data-testid={testId(
                        'teams',
                        'team-roster',
                        'text',
                        'role-status',
                        member.userId,
                      )}
                    >
                      Роль: {member.teamRole ?? 'player'} ·{' '}
                      {STATUS_OPTIONS.find((o) => o.value === member.rosterStatus)?.content ??
                        member.rosterStatus}
                    </Text>
                  </div>
                  {canManageRoles && (
                    <Select
                      value={[member.teamRole ?? 'player']}
                      onUpdate={(v) => {
                        if (!v[0]) return
                        roleMutation.mutate({
                          memberUserId: member.userId,
                          teamRole: v[0] as NonNullable<RosterMember['teamRole']>,
                        })
                      }}
                      options={ROLE_OPTIONS}
                      size="l"
                      width={170}
                      className="team-roster-row__select"
                      disabled={
                        (!isOwner && member.teamRole === 'owner') ||
                        (isOwner &&
                          member.userId === userId &&
                          member.teamRole === 'owner' &&
                          ownerCount <= 1)
                      }
                      data-testid={testId('teams', 'team-roster', 'select', 'role', member.userId)}
                    />
                  )}
                  {canManageRoster && (
                    <Select
                      value={[member.rosterStatus]}
                      onUpdate={(v) =>
                        mutation.mutate({
                          memberUserId: member.userId,
                          rosterStatus: v[0] as RosterMember['rosterStatus'],
                        })
                      }
                      options={STATUS_OPTIONS}
                      size="l"
                      width={160}
                      className="team-roster-row__select"
                      data-testid={testId(
                        'teams',
                        'team-roster',
                        'select',
                        'status',
                        member.userId,
                      )}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
