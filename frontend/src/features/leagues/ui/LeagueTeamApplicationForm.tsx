/**
 * SPEC-FR-24.5.4
 */

import {Select, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {type ReactNode, useMemo, useState} from 'react'
import {Link} from 'react-router'

import type {League} from '@/entities/league'
import {
  fetchLeagueDivisions,
  fetchLeagueSeasons,
  fetchTeamLeagueApplication,
  submitLeagueApplication,
} from '@/entities/league'
import {fetchTeams} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {LeagueApplicationShell} from '@/features/leagues/ui/LeagueApplicationShell'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const STATUS_LABELS: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Одобрена',
  rejected: 'Отклонена',
  waitlist: 'Лист ожидания',
}

export interface LeagueTeamApplicationFormProps {
  league: League
  /** Кнопки портала/сайта лиги — рендерятся внизу карточки заявки. */
  actions?: ReactNode
}

/** @spec SPEC-FR-24.5.4 - Подача заявки капитаном команды */
export function LeagueTeamApplicationForm({league, actions}: LeagueTeamApplicationFormProps) {
  const queryClient = useQueryClient()
  const [contactEmail, setContactEmail] = useState('captain@example.com')
  const [divisionId, setDivisionId] = useState<string | undefined>()
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const {session} = useSessionAccess()
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: () => fetchTeams()})
  const {data: seasons = []} = useQuery({
    queryKey: ['league-seasons', league.id],
    queryFn: () => fetchLeagueSeasons(league.id),
  })

  const activeSeason = seasons.find((s) => s.status === 'active') ?? seasons[0]

  const {data: divisions = []} = useQuery({
    queryKey: ['league-divisions', league.id, activeSeason?.id],
    queryFn: () => fetchLeagueDivisions(league.id, activeSeason?.id),
    enabled: Boolean(activeSeason),
  })

  const captainTeams = useMemo(() => {
    const userId = session?.user.id
    if (!userId) return []
    return teams.filter((team) => team.captainUserId === userId || team.ownerUserId === userId)
  }, [session?.user.id, teams])

  const [teamId, setTeamId] = useState<string | undefined>(captainTeams[0]?.id)
  const selectedTeam = captainTeams.find((team) => team.id === teamId) ?? captainTeams[0]

  const {data: existingApps = []} = useQuery({
    queryKey: ['team-league-application', league.id, selectedTeam?.id],
    queryFn: () => fetchTeamLeagueApplication(league.id, selectedTeam!.id),
    enabled: Boolean(selectedTeam?.id),
  })

  const existing = existingApps[0]
  const isCaptain =
    session?.user.roles.includes('captain') ||
    session?.user.roles.includes('organizer') ||
    session?.user.roles.includes('training_organizer') ||
    captainTeams.length > 0

  const submitMutation = useMutation({
    mutationFn: () =>
      submitLeagueApplication(league.id, {
        seasonId: activeSeason!.id,
        divisionId,
        teamId: selectedTeam!.id,
        teamName: selectedTeam!.name,
        captainName: session!.user.displayName,
        contactEmail,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['team-league-application', league.id, selectedTeam?.id],
      })
      setStatusMessage('Заявка отправлена. Лига рассмотрит её в кабинете партнёра.')
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось отправить заявку')
    },
  })

  const shellTitle = selectedTeam ? `Заявка команды ${selectedTeam.name}` : 'Заявка в лигу'

  if (league.recruitingStatus === 'closed') {
    return (
      <LeagueApplicationShell title="Заявка в лигу" actions={actions}>
        <Text
          color="secondary"
          data-testid={testId('leagues', 'application', 'text', 'closed', league.id)}
        >
          Набор команд в эту лигу закрыт.
        </Text>
      </LeagueApplicationShell>
    )
  }

  if (!isCaptain) {
    return (
      <LeagueApplicationShell
        title="Заявка в лигу"
        actions={actions}
        data-testid={testId('leagues', 'application', 'panel', 'login-hint', league.id)}
      >
        <Text
          color="secondary"
          data-testid={testId('leagues', 'application', 'text', 'captain-only', league.id)}
        >
          Подать заявку может капитан или владелец команды.
        </Text>
        <Link
          to="/"
          className="league-application__login"
          data-testid={testId('leagues', 'application', 'link', 'login', league.id)}
        >
          <HockeyButton
            view="outlined"
            size="l"
            width="max"
            data-testid={testId('leagues', 'application', 'btn', 'login', league.id)}
          >
            Войти как капитан
          </HockeyButton>
        </Link>
      </LeagueApplicationShell>
    )
  }

  if (!selectedTeam || !activeSeason) {
    return (
      <LeagueApplicationShell title={shellTitle} actions={actions}>
        <Text
          color="secondary"
          data-testid={testId('leagues', 'application', 'text', 'no-team', league.id)}
        >
          Создайте команду, чтобы подать заявку в лигу.
        </Text>
      </LeagueApplicationShell>
    )
  }

  if (existing && existing.status !== 'rejected') {
    return (
      <LeagueApplicationShell
        title={shellTitle}
        titleTestId={testId('leagues', 'application', 'text', 'existing-title', league.id)}
        actions={actions}
        data-testid={testId('leagues', 'application', 'panel', 'existing', league.id)}
      >
        <Text
          className="league-application__status"
          data-testid={testId('leagues', 'application', 'text', 'existing-status', league.id)}
        >
          Статус: {STATUS_LABELS[existing.status] ?? existing.status}
          {existing.reviewComment ? ` · ${existing.reviewComment}` : ''}
        </Text>
        <Text
          color="secondary"
          className="league-application__meta"
          data-testid={testId('leagues', 'application', 'text', 'existing-meta', league.id)}
        >
          Сезон {activeSeason.name} · подана {new Date(existing.createdAt).toLocaleString('ru-RU')}
        </Text>
      </LeagueApplicationShell>
    )
  }

  const divisionOptions = divisions.map((d) => ({value: d.id, content: d.name}))

  return (
    <LeagueApplicationShell
      title="Подать заявку в лигу"
      titleTestId={testId('leagues', 'application', 'text', 'form-title', league.id)}
      actions={actions}
      data-testid={testId('leagues', 'application', 'panel', 'form', league.id)}
    >
      <Text
        color="secondary"
        className="league-application__meta"
        data-testid={testId('leagues', 'application', 'text', 'form-subtitle', league.id)}
      >
        Команда: {selectedTeam.name} · сезон: {activeSeason.name}
      </Text>

      {captainTeams.length > 1 && (
        <Select
          label="Команда"
          size="l"
          value={[selectedTeam.id]}
          options={captainTeams.map((team) => ({value: team.id, content: team.name}))}
          onUpdate={(value) => setTeamId(value[0])}
          data-testid={testId('leagues', 'application', 'select', 'team', league.id)}
        />
      )}

      {divisionOptions.length > 0 && (
        <Select
          label="Дивизион"
          size="l"
          value={divisionId ? [divisionId] : []}
          options={divisionOptions}
          onUpdate={(value) => setDivisionId(value[0])}
          data-testid={testId('leagues', 'application', 'select', 'division', league.id)}
        />
      )}

      <TextInput
        label="Email для связи"
        size="l"
        value={contactEmail}
        onUpdate={setContactEmail}
        data-testid={testId('leagues', 'application', 'field', 'email', league.id)}
      />

      <HockeyButton
        view="action"
        size="l"
        width="max"
        disabled={!contactEmail.trim()}
        loading={submitMutation.isPending}
        onClick={() => submitMutation.mutate()}
        data-testid={testId('leagues', 'application', 'btn', 'submit', league.id)}
      >
        Отправить заявку
      </HockeyButton>

      {statusMessage && (
        <Text
          color="secondary"
          className="league-application__meta"
          data-testid={testId('leagues', 'application', 'text', 'status', league.id)}
        >
          {statusMessage}
        </Text>
      )}
    </LeagueApplicationShell>
  )
}
