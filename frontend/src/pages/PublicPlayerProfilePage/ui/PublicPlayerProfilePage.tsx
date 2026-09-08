/**
 * SPEC-FR-24.1.2, SPEC-FR-24.1.3, SPEC-FR-2.3.3, SPEC-FR-17.1.2
 * HOCFRONT-22 — публичная страница игрока `/players/:userId`
 * HOCFRONT-23 — verified badge на странице игрока
 *
 * Композиция как у `/profile` → «О себе»:
 * паспорт + публичная инфа → календарь → история участия.
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useLocation, useNavigate, useParams} from 'react-router'

import {fetchPublicPlayer} from '@/entities/profile'
import {CalendarShell} from '@/features/calendar'
import {PlayerPublicInfoSection} from '@/features/players'
import {ParticipationHistorySection} from '@/features/profile'
import {isNotFoundError} from '@/shared/api/client'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {IceCard} from '@/shared/ui/IceCard'
import {PageBackLink} from '@/shared/ui/PageBackLink'
import {PageHub} from '@/shared/ui/PageHub'
import {PageStatePanel} from '@/shared/ui/PageStatePanel'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {PlayerCard} from '@/widgets/PlayerCard'

/**
 * @spec SPEC-FR-24.1.3 - Публичный просмотр Hockey ID с учётом приватности
 * @spec HOCFRONT-22 - Та же компоновка, что «О себе» в профиле
 * @spec HOCFRONT-23 - Verified badge на странице игрока
 */
export function PublicPlayerProfilePage() {
  const {userId = ''} = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const {data, isLoading, error, refetch} = useQuery({
    queryKey: ['player-public', userId],
    queryFn: () => fetchPublicPlayer(userId),
    enabled: Boolean(userId),
  })

  function handleBack() {
    if (location.key === 'default') {
      navigate(routes.players, {replace: true})
      return
    }
    navigate(-1)
  }

  if (isLoading) {
    return (
      <ScoreboardLoader
        label="Загрузка профиля"
        testIdPrefix="players"
        data-testid={testId('players', 'public-player-profile', 'loader')}
      />
    )
  }
  // Сбой загрузки — это не «профиль скрыт»: даём повторить, а не уводим в каталог
  if (error && !isNotFoundError(error)) {
    return (
      <QueryErrorState
        title="Не удалось загрузить профиль игрока"
        onRetry={() => refetch()}
        testIdPrefix="players"
        data-testid={testId('players', 'public-player-profile', 'error')}
      />
    )
  }

  if (error || !data) {
    return (
      <PageHub data-testid={testId('players', 'public-player-profile', 'card', 'not-found')}>
        <PageBackLink
          to={routes.players}
          label="К каталогу"
          testIdPrefix="players"
          testIdSection="public-player-profile"
        />
        <PageStatePanel
          title="Игрок не найден"
          copy="Игрок не найден или профиль скрыт."
          testIdPrefix="players"
        />
      </PageHub>
    )
  }

  if (data.visibility === 'hidden') {
    return (
      <PageHub data-testid={testId('players', 'public-player-profile', 'card', 'hidden')}>
        <PageBackLink
          to={routes.players}
          label="К каталогу"
          testIdPrefix="players"
          testIdSection="public-player-profile"
        />
        <PageStatePanel
          title="Профиль скрыт"
          copy="Игрок ограничил видимость Hockey ID."
          testIdPrefix="players"
        />
      </PageHub>
    )
  }

  const {player} = data

  return (
    <PageHub
      className="player-profile-layout public-player-profile"
      data-testid={testId('players', 'public-player-profile', 'page', player.userId)}
    >
      <PageBackLink
        label="Вернуться"
        onClick={handleBack}
        testIdPrefix="players"
        testIdSection="public-player-profile"
      />

      <div
        className="player-profile-layout__grid"
        data-testid={testId('players', 'public-player-profile', 'panel', 'grid')}
      >
        <PlayerCard
          player={player}
          linkable={false}
          variant="profile"
          visibleFields={data.visibleFields}
        />
        <PlayerPublicInfoSection
          player={player}
          contactsVisible={data.contactsVisible}
          visibleContacts={data.visibleContacts}
          visibleFields={data.visibleFields}
          participationHistoryVisible={data.participationHistoryVisible}
          hideHistory
        />
      </div>

      <section
        id="calendar"
        className="player-profile-layout__full"
        data-testid={testId('players', 'public-player-profile', 'section', 'calendar')}
      >
        <IceCard
          padding="m"
          data-testid={testId('players', 'public-player-profile', 'card', 'calendar')}
        >
          {data.calendarVisible ? (
            <CalendarShell
              title="Календарь игрока"
              compact
              titleVariant="header-1"
              forcedScope={{scope: 'player', scopeId: userId}}
              showActions={false}
            />
          ) : (
            <div data-testid={testId('players', 'public-player-profile', 'empty', 'calendar')}>
              <EmptyNetState
                title="Календарь недоступен"
                copy="Игрок скрыл календарь в настройках приватности."
              />
            </div>
          )}
        </IceCard>
      </section>

      <IceCard
        padding="m"
        data-testid={testId('players', 'public-player-profile', 'card', 'history')}
      >
        <div className="hockey-stack hockey-stack--gap-16">
          <Text
            variant="header-1"
            data-testid={testId('players', 'public-player-profile', 'text', 'history-title')}
          >
            История участия
          </Text>
          <ParticipationHistorySection
            records={data.participationHistory}
            showHistory={data.participationHistoryVisible}
          />
        </div>
      </IceCard>
    </PageHub>
  )
}
