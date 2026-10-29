/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-1.3.1, SPEC-FR-1.3.6
 * HOCFRONT-5 — страница mock-входа и регистрации.
 */

import {useQuery} from '@tanstack/react-query'
import {Navigate} from 'react-router'

import {fetchSession} from '@/entities/auth'
import {AuthPage} from '@/pages/auth'
import {usesBackendAuth} from '@/shared/config/apiMode'
import {testId} from '@/shared/testing/testId'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

/**
 * @spec SPEC-FR-2.1.1 - Mock-вход без реальной авторизации
 * @spec SPEC-FR-2.1.2 - Выбор ролей через карточки персон
 */
export function MockLoginPage() {
  const backend = usesBackendAuth()
  const {data: session, isPending} = useQuery({queryKey: ['session'], queryFn: fetchSession})

  if (isPending) {
    return (
      <div data-testid={testId('auth', 'page', 'root')}>
        <ScoreboardLoader
          label="Загрузка"
          testIdPrefix="auth"
          data-testid={testId('auth', 'page', 'loader')}
        />
      </div>
    )
  }

  if (backend && session?.isOnboarded) {
    return <Navigate to={session.homePath || '/events'} replace />
  }

  return (
    <div data-testid={testId('auth', 'page', 'root')}>
      <AuthPage isSwitching={!backend && Boolean(session?.isOnboarded)} />
    </div>
  )
}
