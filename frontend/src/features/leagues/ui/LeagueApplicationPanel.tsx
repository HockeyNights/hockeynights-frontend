/**
 * SPEC-FR-24.5.4, SPEC-FR-7.1.3 — блок «Заявка команды» на странице лиги:
 * статус/форма заявки + переходы на портал и сайт лиги.
 */

import {useState} from 'react'
import {Link} from 'react-router'

import type {League} from '@/entities/league'
import {useSessionAccess} from '@/features/access'
import {LeagueApplicationShell} from '@/features/leagues/ui/LeagueApplicationShell'
import {LeagueTeamApplicationForm} from '@/features/leagues/ui/LeagueTeamApplicationForm'
import {MockLeaguePortalModal} from '@/features/leagues/ui/MockLeaguePortalModal'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface LeagueApplicationPanelProps {
  league: League
}

export function LeagueApplicationPanel({league}: LeagueApplicationPanelProps) {
  const [portalOpen, setPortalOpen] = useState(false)
  const {session} = useSessionAccess()
  const canManagePartner =
    session?.user.roles.includes('admin') ||
    session?.user.partnerMemberships?.some((m) => m.kind === 'league' && m.entityId === league.id)
  const showApplication =
    (league.recruitingStatus === 'open' || league.recruitingStatus === 'waitlist') &&
    !canManagePartner

  const actions = (
    <div
      className="league-application__actions"
      data-testid={testId('leagues', 'profile', 'panel', 'actions', league.id)}
    >
      {canManagePartner && (
        <Link
          to={`/partner/leagues/${league.id}`}
          data-testid={testId('leagues', 'profile', 'link', 'cabinet', league.id)}
        >
          <HockeyButton
            view="action"
            size="l"
            width="max"
            data-testid={testId('leagues', 'profile', 'btn', 'cabinet', league.id)}
          >
            Кабинет лиги
          </HockeyButton>
        </Link>
      )}
      <HockeyButton
        view={canManagePartner ? 'outlined' : 'action'}
        size="l"
        width="max"
        onClick={() => setPortalOpen(true)}
        data-testid={testId('leagues', 'profile', 'btn', 'portal', league.id)}
      >
        Открыть портал
      </HockeyButton>
      {league.websiteUrl && (
        <a
          href={league.websiteUrl}
          target="_blank"
          rel="noreferrer"
          data-testid={testId('leagues', 'profile', 'link', 'website', league.id)}
        >
          <HockeyButton
            view="outlined"
            size="l"
            width="max"
            data-testid={testId('leagues', 'profile', 'btn', 'website', league.id)}
          >
            Сайт лиги
          </HockeyButton>
        </a>
      )}
    </div>
  )

  return (
    <>
      {showApplication ? (
        <LeagueTeamApplicationForm league={league} actions={actions} />
      ) : (
        <LeagueApplicationShell
          title="Портал лиги"
          actions={actions}
          data-testid={testId('leagues', 'application', 'panel', 'portal', league.id)}
        />
      )}
      <MockLeaguePortalModal
        open={portalOpen}
        onClose={() => setPortalOpen(false)}
        league={league}
      />
    </>
  )
}
