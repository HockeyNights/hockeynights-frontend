/**
 * SPEC-FR-3.2.2, SPEC-FR-21.1.5
 */

import {hasTrainingOrganizerRole} from '@/features/access/lib/organizerAccess'
import {isPlayerOnlySession} from '@/features/access/lib/sessionAccess'
import type {UserRole} from '@/shared/types/common'
import type {TeamRole} from '@/shared/types/team'

const TEAM_ROLE_RANK: Record<TeamRole, number> = {
  owner: 5,
  captain: 4,
  team_admin: 3,
  coach: 2,
  player: 1,
}

export interface TeamPermissions {
  canCreateTeam: boolean
  canManageRoster: boolean
  canManageRoles: boolean
  canCreateChannel: boolean
  canCreateChat: boolean
  canEditLineup: boolean
  isReadOnly: boolean
}

function teamRank(role: TeamRole): number {
  return TEAM_ROLE_RANK[role] ?? 1
}

/**
 * Звенья (пятёрки) события настраивает только тренер: роль «Тренер» в сессии
 * и место в составе команды не ниже штаба. Капитан и админы только смотрят.
 */
export function canManageEventLines(
  sessionRoles: UserRole[],
  teamRole: TeamRole | undefined,
): boolean {
  if (!teamRole) return false
  return sessionRoles.includes('coach') && teamRank(teamRole) >= TEAM_ROLE_RANK.coach
}

/**
 * Права в команде = роль в сессии ∩ роль в составе.
 * Игрок без captain/coach в сессии всегда только просматривает.
 */
export function resolveTeamPermissions(
  sessionRoles: UserRole[],
  teamRole: TeamRole = 'player',
): TeamPermissions {
  if (isPlayerOnlySession(sessionRoles)) {
    return {
      canCreateTeam: false,
      canManageRoster: false,
      canManageRoles: false,
      canCreateChannel: false,
      canCreateChat: false,
      canEditLineup: false,
      isReadOnly: true,
    }
  }

  const isAdmin = sessionRoles.includes('admin')
  const isClubAdmin = sessionRoles.includes('club_admin')
  const isCaptain = sessionRoles.includes('captain')
  const isCoach = sessionRoles.includes('coach')
  const isOrganizer = hasTrainingOrganizerRole(sessionRoles)
  const rank = teamRank(teamRole)

  const canManageRoster = isAdmin || isClubAdmin || (isCaptain && rank >= TEAM_ROLE_RANK.team_admin)
  const canManageRoles = canManageRoster
  const canCreateChannel =
    isAdmin || isClubAdmin || ((isCaptain || isOrganizer) && rank >= TEAM_ROLE_RANK.captain)
  const canCreateChat =
    isAdmin || isClubAdmin || ((isCoach || isCaptain) && rank >= TEAM_ROLE_RANK.coach)
  const canEditLineup = canCreateChat
  const canCreateTeam = isAdmin || isClubAdmin || isCaptain || isOrganizer

  return {
    canCreateTeam,
    canManageRoster,
    canManageRoles,
    canCreateChannel,
    canCreateChat,
    canEditLineup,
    isReadOnly: !canManageRoster && !canCreateChannel && !canCreateChat && !canEditLineup,
  }
}
