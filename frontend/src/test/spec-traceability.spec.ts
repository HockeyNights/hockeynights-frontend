/**
 * SPEC-FR-1.1.1, SPEC-FR-12.1.2
 * TASK-QA-01, TASK-QA-02
 */

import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

import {describe, expect, it} from 'vitest'

const ROOT = resolve(__dirname, '..')

/** @spec SPEC-FR-1.1.1 - Ключевые файлы с SPEC-ссылками */
const TRACEABLE_FILES = [
  'pages/auth/ui/AuthPage.tsx',
  'features/auth/ui/LoginForm.tsx',
  'features/auth/lib/localAuthMemory.ts',
  'features/auth/ui/AuthShell.tsx',
  'features/auth/ui/AuthDemoCard.tsx',
  'features/auth/ui/EmailVerificationForm.tsx',
  'features/auth/ui/TermsOfUseDocument.tsx',
  'pages/TermsOfUsePage/ui/TermsOfUsePage.tsx',
  'features/auth/ui/TermsAcceptanceField.tsx',
  'features/auth/ui/RegisterForm.tsx',
  'pages/auth/ui/MockLoginPage.tsx',
  'pages/ProfilePage/ui/HockeyProfileForm.tsx',
  'features/profile/ui/ProfileSummaryCard.tsx',
  'features/players/ui/PlayerFilters.tsx',
  'pages/TeamsPage/ui/TeamsPage.tsx',
  'features/events/ui/EventCard.tsx',
  'pages/EventsPage/ui/EventsPage.tsx',
  'pages/SosPage/ui/SosPage.tsx',
  'pages/ArenasPage/ui/ArenasPage.tsx',
  'features/arenas/ui/ArenaMap.tsx',
  'features/arenas/ui/ExternalBookingButton.tsx',
  'shared/ui/MockExternalFlowDialog.tsx',
  'pages/LeaguesPage/ui/LeaguesPage.tsx',
  'features/feedback/ui/PostGameFeedbackForm.tsx',
  'pages/NotificationsPage/ui/NotificationsPage.tsx',
  'pages/ShopsPage/ui/ShopsPage.tsx',
  'pages/IqTestsPage/ui/IqTestsPage.tsx',
  'pages/HighlightsPage/ui/HighlightsPage.tsx',
  'pages/AdminDashboard/ui/AdminDashboard.tsx',
  'mocks/handlers/index.ts',
  'shared/api/client.ts',
]

const UI_TRACEABLE_FILES = [
  'shared/ui/HockeyButton.tsx',
  'shared/ui/IceCard.tsx',
  'shared/ui/ScoreboardLoader.tsx',
  'widgets/AppShell/ui/AppShell.tsx',
  'widgets/HeaderProfile/ui/HeaderProfile.tsx',
  'features/leagues/ui/LeagueStandings.tsx',
  'features/leagues/ui/LeagueSchedule.tsx',
  'features/iq/ui/IqAttemptFlow.tsx',
  'features/radar/ui/RadarRecommendationCard.tsx',
  'features/arenas/ui/SlotCalendar.tsx',
  'features/highlights/ui/HighlightVideoBoard.tsx',
  'features/highlights/ui/MockUploadNotice.tsx',
]

describe('SPEC traceability smoke', () => {
  /** @spec SPEC-FR-1.1.1 */
  it.each(TRACEABLE_FILES)('%s contains SPEC-FR references', (relativePath) => {
    const content = readFileSync(resolve(ROOT, relativePath), 'utf8')
    expect(content).toMatch(/SPEC-FR-\d/)
  })

  /** @spec SPEC-NFR-4 */
  it.each(UI_TRACEABLE_FILES)('%s contains SPEC-UI references', (relativePath) => {
    const content = readFileSync(resolve(ROOT, relativePath), 'utf8')
    expect(content).toMatch(/SPEC-UI-\d/)
  })
})
