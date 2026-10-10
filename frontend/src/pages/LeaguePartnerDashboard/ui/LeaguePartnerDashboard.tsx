/**
 * SPEC-FR-24.5.3
 */

import {Select, Text, TextArea, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'
import {Link, useParams} from 'react-router'

import type {League} from '@/entities/league'
import {fetchLeagues, updateLeaguePartnerProfile} from '@/entities/league'
import {useSessionAccess} from '@/features/access'
import {
  LeagueAnalyticsPanel,
  LeagueApplicationsPanel,
  LeaguePostsPanel,
  LeagueScheduleManager,
} from '@/features/leagues'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {PageHeader} from '@/shared/ui/PageHeader'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {SectionHeading} from '@/shared/ui/SectionHeading'

const RECRUITING_OPTIONS = [
  {value: 'open', content: 'Набор открыт'},
  {value: 'waitlist', content: 'Лист ожидания'},
  {value: 'closed', content: 'Набор закрыт'},
]

type PartnerTab = 'profile' | 'applications' | 'schedule' | 'posts' | 'analytics'

const PARTNER_TABS: {id: PartnerTab; label: string}[] = [
  {id: 'profile', label: 'О лиге'},
  {id: 'applications', label: 'Заявки'},
  {id: 'schedule', label: 'Расписание'},
  {id: 'posts', label: 'Публикации'},
  {id: 'analytics', label: 'Аналитика'},
]

/** @spec SPEC-FR-24.5.3 - Кабинет партнёра лиги */
export function LeaguePartnerDashboard() {
  const {leagueId = ''} = useParams()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<PartnerTab>('applications')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const {session} = useSessionAccess()
  const {
    data: leagues = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => fetchLeagues(),
  })
  const league = leagues.find((item) => item.id === leagueId)
  const [draft, setDraft] = useState<Partial<League>>({})

  const canManage =
    session?.user.roles.includes('admin') ||
    session?.user.partnerMemberships?.some((m) => m.kind === 'league' && m.entityId === leagueId)

  const saveMutation = useMutation({
    mutationFn: (patch: Partial<League>) => updateLeaguePartnerProfile(leagueId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['leagues']})
      setStatusMessage('Профиль лиги обновлён и отправлен на модерацию.')
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось сохранить профиль')
    },
  })

  if (isLoading) {
    return (
      <div data-testid={testId('leagues', 'partner', 'loader')}>
        <ScoreboardLoader label="Загрузка кабинета лиги" />
      </div>
    )
  }

  if (isError) {
    return (
      <QueryErrorState
        title="Не удалось загрузить кабинет лиги"
        onRetry={() => refetch()}
        testIdPrefix="leagues"
        data-testid={testId('leagues', 'partner', 'error')}
      />
    )
  }

  if (!league) {
    return (
      <div
        className="hockey-stack hockey-stack--gap-12"
        data-testid={testId('leagues', 'partner', 'empty')}
      >
        <EmptyNetState title="Лига не найдена" copy="Возможно, ссылка устарела или лига скрыта." />
        <Link to="/leagues" data-testid={testId('leagues', 'partner', 'link', 'back-empty')}>
          <HockeyButton
            view="flat"
            size="m"
            data-testid={testId('leagues', 'partner', 'btn', 'back-empty')}
          >
            К каталогу лиг
          </HockeyButton>
        </Link>
      </div>
    )
  }

  const form = {...league, ...draft}

  if (!canManage) {
    return (
      <div data-testid={testId('leagues', 'partner', 'panel', 'denied')}>
        <IceCard padding="m">
          <Text data-testid={testId('leagues', 'partner', 'text', 'denied')}>
            Кабинет доступен только представителю лиги. Выберите роль при входе.
          </Text>
          <Link
            to="/"
            className="hockey-mt-12"
            data-testid={testId('leagues', 'partner', 'link', 'login')}
          >
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId('leagues', 'partner', 'btn', 'login')}
            >
              Перейти к входу
            </HockeyButton>
          </Link>
        </IceCard>
      </div>
    )
  }

  return (
    <div
      className="partner-dashboard partner-cabinet partner-cabinet--league"
      data-testid={testId('leagues', 'partner', 'page', leagueId)}
    >
      <PageHeader
        title="Кабинет лиги"
        subtitle={league.name}
        testIdPrefix="leagues"
        testIdSection="partner"
        actions={
          <div data-testid={testId('leagues', 'partner', 'badge', 'profile', leagueId)}>
            <EntityProfileBadge kind="league" />
          </div>
        }
      />

      <div
        className="hockey-segmented partner-cabinet__tabs"
        role="tablist"
        data-testid={testId('leagues', 'partner', 'nav', leagueId)}
      >
        {PARTNER_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`hockey-segmented__item${tab === item.id ? ' is-active' : ''}`}
            onClick={() => setTab(item.id)}
            data-testid={testId('leagues', 'partner', 'tab', item.id, leagueId)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <section
          className="partner-cabinet__block"
          data-testid={testId('leagues', 'partner', 'panel', 'profile', leagueId)}
        >
          <SectionHeading
            title="Публичный профиль"
            data-testid={testId('leagues', 'partner', 'text', 'profile-title', leagueId)}
          />
          <IceCard padding="m" className="partner-cabinet__card">
            <div className="partner-cabinet__form">
              <div className="partner-cabinet__field">
                <span className="partner-cabinet__label">Описание</span>
                <TextArea
                  rows={3}
                  value={form.description ?? ''}
                  onUpdate={(value) => setDraft((prev) => ({...prev, description: value}))}
                  data-testid={testId('leagues', 'partner', 'field', 'description', leagueId)}
                />
              </div>
              <div className="partner-cabinet__field">
                <span className="partner-cabinet__label">Краткие правила</span>
                <TextArea
                  rows={3}
                  value={form.rulesSummary ?? ''}
                  onUpdate={(value) => setDraft((prev) => ({...prev, rulesSummary: value}))}
                  data-testid={testId('leagues', 'partner', 'field', 'rules', leagueId)}
                />
              </div>
              <div className="partner-cabinet__form-row">
                <TextInput
                  label="Email"
                  value={form.contactEmail ?? ''}
                  onUpdate={(value) => setDraft((prev) => ({...prev, contactEmail: value}))}
                  data-testid={testId('leagues', 'partner', 'field', 'email', leagueId)}
                />
                <TextInput
                  label="Телефон"
                  value={form.contactPhone ?? ''}
                  onUpdate={(value) => setDraft((prev) => ({...prev, contactPhone: value}))}
                  data-testid={testId('leagues', 'partner', 'field', 'phone', leagueId)}
                />
              </div>
              <Select
                label="Статус набора команд"
                width="max"
                value={[form.recruitingStatus ?? 'open']}
                options={RECRUITING_OPTIONS}
                onUpdate={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    recruitingStatus: value[0] as League['recruitingStatus'],
                  }))
                }
                data-testid={testId('leagues', 'partner', 'select', 'recruiting', leagueId)}
              />
              <Text
                className="partner-cabinet__note"
                data-testid={testId('leagues', 'partner', 'text', 'moderation', leagueId)}
              >
                Статус модерации: {form.moderationStatus ?? 'draft'}
              </Text>
              <HockeyButton
                view="action"
                size="l"
                width="max"
                loading={saveMutation.isPending}
                onClick={() => saveMutation.mutate(draft)}
                data-testid={testId('leagues', 'partner', 'btn', 'save', leagueId)}
              >
                Сохранить изменения
              </HockeyButton>
              {statusMessage && (
                <Text
                  className="partner-cabinet__note"
                  data-testid={testId('leagues', 'partner', 'text', 'status', leagueId)}
                >
                  {statusMessage}
                </Text>
              )}
            </div>
          </IceCard>
        </section>
      )}

      {tab === 'applications' && (
        <div
          className="partner-cabinet__panel partner-cabinet__panel--cards"
          data-testid={testId('leagues', 'partner', 'panel', 'applications', leagueId)}
        >
          <LeagueApplicationsPanel leagueId={leagueId} />
        </div>
      )}

      {tab === 'schedule' && (
        <div
          className="partner-cabinet__panel"
          data-testid={testId('leagues', 'partner', 'panel', 'schedule', leagueId)}
        >
          <LeagueScheduleManager leagueId={leagueId} />
        </div>
      )}

      {tab === 'posts' && (
        <div
          className="partner-cabinet__panel"
          data-testid={testId('leagues', 'partner', 'panel', 'posts', leagueId)}
        >
          <LeaguePostsPanel leagueId={leagueId} />
        </div>
      )}

      {tab === 'analytics' && (
        <div
          className="partner-cabinet__panel"
          data-testid={testId('leagues', 'partner', 'panel', 'analytics', leagueId)}
        >
          <LeagueAnalyticsPanel leagueId={leagueId} />
        </div>
      )}

      <Link
        to="/leagues"
        className="partner-cabinet__back"
        data-testid={testId('leagues', 'partner', 'link', 'back', leagueId)}
      >
        <HockeyButton
          view="outlined"
          size="s"
          data-testid={testId('leagues', 'partner', 'btn', 'back', leagueId)}
        >
          ← К списку лиг
        </HockeyButton>
      </Link>
    </div>
  )
}
