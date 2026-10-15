/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-25.1.1, SPEC-FR-25.1.2
 * Страница входа, регистрации, подтверждения почты и выбора демо-роли.
 */

import {useQuery} from '@tanstack/react-query'
import {Button, Typography} from 'antd'
import {useState} from 'react'
import {Link, useLocation, useNavigate} from 'react-router'

import {fetchSession} from '@/entities/auth'
import {describeSessionPersona} from '@/features/access'
import {
  AuthShell,
  EmailVerificationForm,
  LoginForm,
  PersonaSelection,
  RegisterForm,
} from '@/features/auth'
import {testId} from '@/shared/testing/testId'

type AuthStep = 'credentials' | 'verify' | 'personas'

export interface AuthPageProps {
  /** Уже вошли — можно переключить роль */
  isSwitching?: boolean
}

export function AuthPage({isSwitching = false}: AuthPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const isRegisterRoute = location.pathname === '/register'
  const [step, setStep] = useState<AuthStep>(isSwitching ? 'personas' : 'credentials')
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifyPurpose, setVerifyPurpose] = useState<'register' | 'reset'>('register')

  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})

  function handleLoginSuccess() {
    setStep('personas')
  }

  function handleRegisterSuccess(email: string) {
    setVerifyEmail(email)
    setVerifyPurpose('register')
    setStep('verify')
  }

  function handleForgotPassword(email: string) {
    setVerifyEmail(email)
    setVerifyPurpose('reset')
    setStep('verify')
  }

  function handleVerifySuccess() {
    if (verifyPurpose === 'reset') {
      setStep('credentials')
      navigate('/', {replace: true})
      return
    }
    setStep('personas')
  }

  function goToCredentialsStep() {
    setStep('credentials')
    navigate(isRegisterRoute ? '/register' : '/', {replace: true})
  }

  function goToPersonasStep() {
    setStep('personas')
    navigate(isRegisterRoute ? '/register' : '/', {replace: true})
  }

  const shellMode =
    step === 'personas'
      ? 'personas'
      : step === 'verify'
        ? 'verify'
        : isRegisterRoute
          ? 'register'
          : 'login'

  return (
    <AuthShell
      mode={shellMode}
      showModeTabs={step === 'credentials' && !isSwitching}
      wide={step === 'personas'}
    >
      <div data-testid={testId('auth', 'page', 'panel', 'main')}>
        {isSwitching && session?.isOnboarded && (
          <div
            className="auth-switch-banner"
            data-testid={testId('auth', 'page', 'panel', 'switching')}
          >
            <Typography.Paragraph
              type="secondary"
              data-testid={testId('auth', 'page', 'text', 'switching-hint')}
            >
              Сейчас вы вошли как <strong>{session.user.displayName}</strong> (
              {describeSessionPersona(session)}). Выберите другую роль ниже.
            </Typography.Paragraph>
            <div className="auth-switch-banner__actions">
              <Link to="/profile" data-testid={testId('auth', 'page', 'link', 'continue')}>
                <Button data-testid={testId('auth', 'page', 'btn', 'continue')}>
                  Продолжить в приложении
                </Button>
              </Link>
              {step === 'personas' && (
                <Button
                  type="text"
                  onClick={goToCredentialsStep}
                  data-testid={testId('auth', 'page', 'btn', 'edit-credentials')}
                >
                  Сменить учётные данные
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 'credentials' ? (
          isRegisterRoute ? (
            <RegisterForm onSuccess={handleRegisterSuccess} />
          ) : (
            <LoginForm onSuccess={handleLoginSuccess} onForgotPassword={handleForgotPassword} />
          )
        ) : step === 'verify' ? (
          <EmailVerificationForm
            email={verifyEmail}
            purpose={verifyPurpose}
            onSuccess={handleVerifySuccess}
          />
        ) : (
          <PersonaSelection isSwitching={isSwitching} onBackToCredentials={goToCredentialsStep} />
        )}

        {step === 'credentials' && isSwitching && (
          <Button
            size="large"
            block
            onClick={goToPersonasStep}
            data-testid={testId('auth', 'page', 'btn', 'show-personas')}
          >
            Перейти к выбору роли
          </Button>
        )}
      </div>
    </AuthShell>
  )
}
