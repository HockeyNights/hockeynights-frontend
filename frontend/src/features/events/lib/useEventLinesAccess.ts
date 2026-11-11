/**
 * HOCFRONT-46 — кто видит и кто настраивает звенья события.
 * Видят участники состава команды (активные и запасные), настраивает только тренер.
 */

import {useQuery} from '@tanstack/react-query'

import {fetchTeamRoster, type RosterMember} from '@/entities/team'
import {canManageEventLines} from '@/features/access/lib/teamAccess'
import {useSessionAccess} from '@/features/access/lib/useSessionAccess'

export function isLinesRosterMember(member: RosterMember): boolean {
  return member.rosterStatus === 'active' || member.rosterStatus === 'bench'
}

export function useEventLinesAccess(teamId: string | undefined) {
  const {userId, roles} = useSessionAccess()
  const {data: roster = [], isLoading} = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchTeamRoster(teamId ?? ''),
    enabled: Boolean(teamId),
  })

  const member = roster.find((item) => item.userId === userId && isLinesRosterMember(item))
  const canView = Boolean(teamId && userId && member)

  return {
    roster,
    isLoading: Boolean(teamId) && isLoading,
    canView,
    canEdit: canView && canManageEventLines(roles, member?.teamRole),
  }
}
