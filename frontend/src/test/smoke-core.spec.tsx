/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-2.2.1, SPEC-FR-2.2.4
 * SPEC-FR-2.3.1, SPEC-FR-2.3.2, SPEC-FR-3.1.1, SPEC-FR-3.2.1, SPEC-FR-3.3.1
 * SPEC-FR-4.1.1, SPEC-FR-4.2.1, SPEC-FR-4.3.1, SPEC-FR-5.1.1, SPEC-FR-5.2.1
 * SPEC-FR-5.2.2, SPEC-FR-6.1.1, SPEC-FR-6.2.1, SPEC-FR-6.3.1
 * TASK-QA-01
 */

import {screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it} from 'vitest'

import type {PartnerModerationItem} from '@/entities/admin'
import type {Arena} from '@/entities/arena'
import type {Club} from '@/entities/club'
import type {GameEvent} from '@/entities/event'
import type {League} from '@/entities/league'
import type {LeagueScheduleImportResult} from '@/entities/league'
import type {LeagueScheduleItem} from '@/entities/league'
import type {LeagueTeamApplication} from '@/entities/league'
import type {HockeyProfile} from '@/entities/profile'
import type {PlayerListItem} from '@/entities/profile'
import type {PublicPlayerView} from '@/entities/profile'
import type {RecruitmentRequest} from '@/entities/recruitment'
import type {Shop} from '@/entities/shop'
import type {ProductOffer} from '@/entities/shop'
import type {ShopCatalogImportJob} from '@/entities/shop'
import type {Team} from '@/entities/team'
import type {TeamInvite} from '@/entities/team'
import type {RosterMember} from '@/entities/team'
import type {TrainingLineupAssignment} from '@/entities/team'
import type {Session} from '@/entities/user'
import {resetMockSession} from '@/mocks/data/session'
import {ArenasPage} from '@/pages/ArenasPage'
import {MockLoginPage} from '@/pages/auth'
import {CalendarPage} from '@/pages/CalendarPage'
import {EventsPage} from '@/pages/EventsPage'
import {PlayersPage} from '@/pages/PlayersPage'
import {HockeyProfileForm} from '@/pages/ProfilePage'
import {SosPage} from '@/pages/SosPage'
import {TeamsPage} from '@/pages/TeamsPage'
import {ARENAS_PAGE_TITLE} from '@/shared/config/navigationLabels'
import {mockApiGet, mockApiPatch, mockApiPost, mockApiPut} from '@/test/api'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

async function mockSelectPersona(personaId: string): Promise<Session> {
  return mockApiPost<Session>('/session/persona', {personaId})
}

describe('TASK-QA-01 mock API smoke', () => {
  beforeEach(() => {
    clearTestStorage()
    resetMockSession()
  })

  /** @spec SPEC-FR-2.1.3 */
  it('POST /logout resets mock session', async () => {
    await mockSelectPersona('player')
    const loggedOut = await mockApiPost<Session>('/logout', {})
    expect(loggedOut.isOnboarded).toBe(false)
    const session = await mockApiGet<Session>('/session')
    expect(session.isOnboarded).toBe(false)
  })

  /** @spec SPEC-FR-2.1.3 */
  it('GET /session returns mock session', async () => {
    const session = await mockApiGet<Session>('/session')
    expect(session.user.id).toBe('user-001')
    expect(session.user.displayName).toBeTruthy()
  })

  /** @spec SPEC-FR-2.2.1 */
  it('GET /profile/me returns Hockey ID', async () => {
    const profile = await mockApiGet<HockeyProfile>('/profile/me')
    expect(profile.userId).toBe('user-001')
    expect(profile.profileCompleteness).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-2.3.1 */
  it('GET /players returns player list', async () => {
    const players = await mockApiGet<PlayerListItem[]>('/players')
    expect(players.length).toBeGreaterThan(0)
    expect(players[0].karmaScore).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-24.1.3 */
  it('GET /players/{userId} returns public Hockey ID view', async () => {
    const view = await mockApiGet<PublicPlayerView>('/players/user-002')
    expect(view.player.userId).toBe('user-002')
    expect(view.visibility).toBe('full')
  })

  /** @spec SPEC-FR-24.1.3 — текущий пользователь доступен для «Как видят другие» */
  it('GET /players/{userId} returns public view for current mock profile', async () => {
    const view = await mockApiGet<PublicPlayerView>('/players/user-001')
    expect(view.player.fullName).toBe('Петров Иван Сергеевич')
    expect(view.visibility).toBe('full')
    expect(view.participationHistoryVisible).toBe(true)
  })

  /** @spec SPEC-FR-3.1.1 */
  it('GET /teams returns teams', async () => {
    const teams = await mockApiGet<Team[]>('/teams')
    expect(teams.length).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-21.1.5 */
  it('PATCH /teams/{teamId}/roles/{userId} updates team role', async () => {
    const teams = await mockApiGet<Team[]>('/teams')
    const updated = await mockApiPatch<RosterMember>(`/teams/${teams[0].id}/roles/user-003`, {
      teamRole: 'coach',
    })
    expect(updated.teamRole).toBe('coach')
  })

  /** @spec SPEC-FR-21.1.5 */
  it('PATCH /teams/{teamId}/roles/{userId} prevents removing last owner', async () => {
    const teams = await mockApiGet<Team[]>('/teams')
    const response = await fetch(`/mock-api/v1/teams/${teams[0].id}/roles/user-001`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({teamRole: 'player'}),
    })
    expect(response.status).toBe(400)
  })

  /** @spec SPEC-FR-21.1.2 */
  it('POST /teams/{teamId}/invites sends email invite', async () => {
    const teams = await mockApiGet<Team[]>('/teams')
    const invite = await mockApiPost<TeamInvite>(`/teams/${teams[0].id}/invites`, {
      email: 'candidate@example.com',
    })
    expect(invite.email).toBe('candidate@example.com')
    expect(invite.status).toBe('sent')
  })

  /** @spec SPEC-FR-21.1.2 */
  it('GET /teams/{teamId}/invites returns invite history', async () => {
    const teams = await mockApiGet<Team[]>('/teams')
    await mockApiPost<TeamInvite>(`/teams/${teams[0].id}/invites`, {
      email: 'history-check@example.com',
    })
    const invites = await mockApiGet<TeamInvite[]>(`/teams/${teams[0].id}/invites`)
    expect(invites.length).toBeGreaterThan(0)
    expect(invites[0].email).toContain('@')
  })

  /** @spec SPEC-FR-24.3.2 */
  it('GET/PUT training lineup updates assignments', async () => {
    const teams = await mockApiGet<Team[]>('/teams')
    const events = await mockApiGet<GameEvent[]>(`/teams/${teams[0].id}/training-events`)
    expect(events.length).toBeGreaterThan(0)

    const before = await mockApiGet<TrainingLineupAssignment[]>(
      `/teams/${teams[0].id}/training-lineup/${events[0].id}`,
    )
    expect(before.length).toBeGreaterThan(0)

    const updated = await mockApiPut<TrainingLineupAssignment[]>(
      `/teams/${teams[0].id}/training-lineup/${events[0].id}`,
      before.map((item, index) => ({
        ...item,
        side: index % 2 === 0 ? 'red' : 'white',
      })),
    )
    expect(updated.some((a) => a.side === 'red')).toBe(true)
  })

  /** @spec SPEC-FR-24.4.3 */
  it('GET /teams/{teamId}/club-profile returns squads and staff', async () => {
    const teams = await mockApiGet<Team[]>('/teams')
    const club = await mockApiGet<Club>(`/teams/${teams[0].id}/club-profile`)
    expect(club.squads.length).toBeGreaterThan(0)
    expect(club.staff.length).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-24.5.3 */
  it('PATCH /leagues/{leagueId}/profile updates league partner profile', async () => {
    await mockSelectPersona('league-partner')
    const updated = await mockApiPatch<League>('/leagues/league-001/profile', {
      description: 'Обновлённое описание лиги',
      recruitingStatus: 'open',
    })
    expect(updated.description).toBe('Обновлённое описание лиги')
    expect(updated.moderationStatus).toBe('pending_review')
  })

  /** @spec SPEC-FR-24.7.3, SPEC-FR-24.7.4 */
  it('PATCH shop profile and POST product with partner membership', async () => {
    await mockSelectPersona('shop-partner')
    const shop = await mockApiPatch<Shop>('/shops/shop-001/profile', {
      deliveryInfo: 'Доставка за 24 часа',
    })
    expect(shop.deliveryInfo).toBe('Доставка за 24 часа')

    const product = await mockApiPost<ProductOffer>('/shops/shop-001/products', {
      title: 'Шлем CCM',
      category: 'защита',
      price: 15900,
      availability: 'in_stock',
      externalUrl: 'https://prohockey.example.ru/ccm-helmet',
    })
    expect(product.title).toBe('Шлем CCM')
    expect(product.moderationStatus).toBe('pending_review')
  })

  /** @spec SPEC-FR-24.7.5 */
  it('POST /shops/{shopId}/catalog-import imports products from feed', async () => {
    await mockSelectPersona('shop-partner')
    const job = await mockApiPost<ShopCatalogImportJob>('/shops/shop-001/catalog-import', {
      source: 'feed',
    })
    expect(job.importedCount).toBeGreaterThan(0)
    expect(job.status).toBe('synced')
  })

  /** @spec SPEC-FR-24.5.4 */
  it('GET/PATCH league applications with partner membership', async () => {
    await mockSelectPersona('league-partner')
    const apps = await mockApiGet<LeagueTeamApplication[]>('/leagues/league-001/applications')
    expect(apps.length).toBeGreaterThan(0)
    const pending = apps.find((a) => a.status === 'pending')
    expect(pending).toBeTruthy()
    if (pending) {
      const updated = await mockApiPatch<LeagueTeamApplication>(
        `/leagues/league-001/applications/${pending.id}`,
        {status: 'approved', reviewComment: 'Допущены'},
      )
      expect(updated.status).toBe('approved')
    }
  })

  /** @spec SPEC-FR-24.5.4 */
  it('POST league application as team captain', async () => {
    await mockSelectPersona('league-partner')
    const apps = await mockApiGet<LeagueTeamApplication[]>('/leagues/league-001/applications')
    for (const app of apps.filter((a) => a.teamId === 'team-001' && a.status !== 'rejected')) {
      await mockApiPatch(`/leagues/league-001/applications/${app.id}`, {status: 'rejected'})
    }

    await mockSelectPersona('captain')
    const application = await mockApiPost<LeagueTeamApplication>(
      '/leagues/league-001/applications',
      {
        seasonId: 'season-001',
        divisionId: 'div-001',
        teamId: 'team-001',
        teamName: 'Медведи САО',
        captainName: 'Петров Иван Сергеевич',
        contactEmail: 'captain@example.com',
      },
    )
    expect(application.status).toBe('pending')
    expect(application.teamId).toBe('team-001')
  })

  /** @spec SPEC-FR-24.5.5 */
  it('POST/PATCH league schedule with partner membership', async () => {
    await mockSelectPersona('league-partner')
    const item = await mockApiPost<LeagueScheduleItem>('/leagues/league-001/schedule', {
      homeTeam: 'ХК Тест',
      awayTeam: 'ХК Демо',
      startsAt: '2026-07-01T20:00:00+03:00',
      arenaName: 'Тестовая арена',
      status: 'scheduled',
    })
    expect(item.homeTeam).toBe('ХК Тест')

    const scored = await mockApiPatch<LeagueScheduleItem>(
      `/leagues/league-001/schedule/${item.id}`,
      {homeScore: 5, awayScore: 1, status: 'completed'},
    )
    expect(scored.status).toBe('completed')
    expect(scored.homeScore).toBe(5)
  })

  /** @spec SPEC-FR-24.5.5 */
  it('POST league schedule CSV import with partner membership', async () => {
    await mockSelectPersona('league-partner')
    const result = await mockApiPost<LeagueScheduleImportResult>(
      '/leagues/league-001/schedule-import',
      {},
    )
    expect(result.importedCount).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-24.7.9 */
  it('GET/PATCH admin partner moderation queue', async () => {
    await mockSelectPersona('admin')
    const queue = await mockApiGet<PartnerModerationItem[]>('/admin/partner-moderation')
    expect(queue.some((item) => item.kind === 'shop_product')).toBe(true)

    const product = queue.find((item) => item.kind === 'shop_product')
    expect(product).toBeTruthy()
    if (product) {
      const updated = await mockApiPatch<PartnerModerationItem>(
        `/admin/partner-moderation/${product.id}`,
        {
          status: 'published',
        },
      )
      expect(updated.moderationStatus).toBe('published')
    }
  })

  /** @spec SPEC-FR-4.1.1 */
  it('GET /events returns events with participation', async () => {
    const events = await mockApiGet<GameEvent[]>('/events')
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].participation.length).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-4.2.1 */
  it('GET /calendar returns user calendar', async () => {
    const calendar = await mockApiGet<GameEvent[]>('/calendar')
    expect(Array.isArray(calendar)).toBe(true)
  })

  /** @spec SPEC-FR-4.3.1 */
  it('GET /events/{id}/roster-status returns deficit', async () => {
    const events = await mockApiGet<GameEvent[]>('/events')
    const status = await mockApiGet<{deficits: unknown[]}>(`/events/${events[0].id}/roster-status`)
    expect(status.deficits).toBeDefined()
  })

  /** @spec SPEC-FR-5.2.1 */
  it('GET /recruitment-requests returns SOS feed', async () => {
    const requests = await mockApiGet<RecruitmentRequest[]>('/recruitment-requests')
    expect(requests.length).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-6.1.1 */
  it('GET /arenas returns Moscow rinks', async () => {
    const arenas = await mockApiGet<Arena[]>('/arenas')
    expect(arenas.length).toBeGreaterThan(0)
    expect(arenas[0].sourceMeta.syncStatus).toBeTruthy()
  })

  /** @spec SPEC-FR-6.3.1 */
  it('GET /arenas/{id}/slots returns ice slots', async () => {
    const arenas = await mockApiGet<Arena[]>('/arenas')
    const slots = await mockApiGet<unknown[]>(`/arenas/${arenas[0].id}/slots`)
    expect(slots.length).toBeGreaterThan(0)
  })
})

describe('TASK-QA-01 UI smoke', () => {
  beforeEach(() => {
    resetMockSession()
    clearTestStorage()
  })

  /** @spec SPEC-FR-2.1.1 */
  it('MockLoginPage renders demo login', async () => {
    renderWithProviders(<MockLoginPage />)
    await waitFor(() => {
      expect(screen.getByTestId('auth-shell-page')).toBeInTheDocument()
    })
    expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument()
    expect(screen.getByText('Быстрый доступ')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveValue('demo@hockey.local')
  })

  /** @spec SPEC-FR-2.2.4 */
  it('HockeyProfileForm loads profile summary', async () => {
    renderWithProviders(<HockeyProfileForm />)
    await waitFor(() => {
      expect(screen.getByTestId('profile-profile-hub-page')).toBeInTheDocument()
      expect(screen.getByTestId('profile-profile-about-section-panel-grid')).toBeInTheDocument()
      expect(screen.getByTestId('profile-profile-about-section-btn-edit')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-2.3.2 */
  it('PlayersPage loads filters and cards', async () => {
    renderWithProviders(<PlayersPage />)
    await waitFor(() => {
      expect(screen.getByText('Игроки')).toBeInTheDocument()
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-3.2.1 */
  it('TeamsPage loads team list', async () => {
    renderWithProviders(<TeamsPage />)
    await waitFor(() => {
      expect(screen.getByText('Команды')).toBeInTheDocument()
      expect(screen.getAllByText('Медведи САО').length).toBeGreaterThan(0)
      expect(screen.getByTestId('teams-card-card-team-001')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-3.3.1 */
  it('EventsPage loads event cards', async () => {
    renderWithProviders(<EventsPage />)
    await waitFor(() => {
      expect(screen.getByText('Игры и тренировки')).toBeInTheDocument()
      expect(screen.getAllByText(/Публичная тренировка/i).length).toBeGreaterThan(0)
    })
  })

  /** @spec SPEC-FR-4.2.2 */
  it('CalendarPage loads calendar', async () => {
    renderWithProviders(<CalendarPage />)
    await waitFor(() => {
      expect(screen.getByText('Календарь')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-5.1.1 */
  it('SosPage loads SOS feed', async () => {
    renderWithProviders(<SosPage />)
    await waitFor(() => {
      expect(screen.getAllByText(/Goalkeeper SOS/i).length).toBeGreaterThan(0)
    })
  })

  /** @spec SPEC-FR-6.2.1 */
  it('ArenasPage loads rink cards', async () => {
    renderWithProviders(<ArenasPage />)
    await waitFor(() => {
      expect(screen.getByText(ARENAS_PAGE_TITLE)).toBeInTheDocument()
      expect(screen.getAllByText(/Ходынке/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText('Профиль арены').length).toBeGreaterThan(0)
    })
  })
})
