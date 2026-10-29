/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-25.1.1, SPEC-FR-25.1.2
 * Страница входа, регистрации, подтверждения почты и выбора демо-роли.
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Alert, Button, Typography} from 'antd'
import {useState} from 'react'
import {Link, useLocation, useNavigate} from 'react-router'

import {backendRequestPasswordReset, fetchSession} from '@/entities/auth'
import {describeSessionPersona} from '@/features/access'
import {
  AuthShell,
  CreateProfileForm,
  EmailVerificationForm,
  LoginForm,
  PasswordResetForm,
  PersonaSelection,
  RegisterForm,
} from '@/features/auth'
import {usesBackendAuth} from '@/shared/config/apiMode'
import {testId} from '@/shared/testing/testId'

type AuthStep = 'credentials' | 'verify' | 'reset-password' | 'create-profile' | 'personas'

export interface AuthPageProps {
  /** Уже вошли — можно переключить роль */
  isSwitching?: boolean
}

export function AuthPage({isSwitching = false}: AuthPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const backend = usesBackendAuth()
  const isRegisterRoute = location.pathname === '/register'

  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})

  const initialStep: AuthStep =
    backend && session?.needsProfile ? 'create-profile' : isSwitching ? 'personas' : 'credentials'

  const [storedStep, setStep] = useState<AuthStep>(initialStep)
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifyMaskedEmail, setVerifyMaskedEmail] = useState<string | undefined>()
  const [verifyPurpose, setVerifyPurpose] = useState<'register' | 'login' | 'reset'>('register')
  const [resetCode, setResetCode] = useState('')
  const [seedDisplayName, setSeedDisplayName] = useState('')
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const step: AuthStep =
    backend && session?.needsProfile && storedStep === 'credentials' ? 'create-profile' : storedStep

  const resetRequestMutation = useMutation({
    mutationFn: backendRequestPasswordReset,
    onSuccess: (response) => {
      setVerifyMaskedEmail(response.code.maskedEmail)
      setVerifyPurpose('reset')
      setStep('verify')
      setInfoMessage(null)
    },
    onError: (err: Error) => {
      setInfoMessage(err.message || 'Не удалось отправить код')
    },
  })

  function enterApp(homePath = '/events') {
    void queryClient.invalidateQueries({queryKey: ['session']})
    void queryClient.invalidateQueries({queryKey: ['profile']})
    navigate(homePath, {replace: true})
  }

  function handleLoginSuccess(result?: {needsProfile?: boolean}) {
    if (backend) {
      if (result?.needsProfile) {
        setStep('create-profile')
        return
      }
      enterApp('/events')
      return
    }
    setStep('personas')
  }

  function handleRegisterSuccess(email: string, meta?: {displayName?: string}) {
    setVerifyEmail(email)
    setVerifyMaskedEmail(undefined)
    setVerifyPurpose('register')
    setSeedDisplayName(meta?.displayName ?? '')
    setStep('verify')
  }

  function handleForgotPassword(email: string) {
    setVerifyEmail(email)
    if (backend) {
      resetRequestMutation.mutate(email)
      return
    }
    setVerifyPurpose('reset')
    setStep('verify')
  }

  function handleLoginCodeRequired(email: string, meta?: {maskedEmail?: string}) {
    setVerifyEmail(email)
    setVerifyMaskedEmail(meta?.maskedEmail)
    setVerifyPurpose('login')
    setStep('verify')
  }

  function handleVerifySuccess() {
    if (verifyPurpose === 'reset') {
      if (backend) return
      setStep('credentials')
      navigate('/', {replace: true})
      return
    }
    if (backend) {
      void fetchSession().then((next) => {
        queryClient.setQueryData(['session'], next)
        if (next.needsProfile) {
          setStep('create-profile')
          return
        }
        enterApp(next.homePath || '/events')
      })
      return
    }
    setStep('personas')
  }

  function handleResetCodeAccepted(code: string) {
    setResetCode(code)
    setStep('reset-password')
  }

  function handlePasswordResetSuccess() {
    setInfoMessage('Пароль обновлён — войдите с новым паролем')
    setStep('credentials')
    setResetCode('')
    navigate('/', {replace: true})
  }

  function handleProfileCreated() {
    enterApp('/events')
  }

  function goToCredentialsStep() {
    setStep('credentials')
    setInfoMessage(null)
    navigate(isRegisterRoute ? '/register' : '/', {replace: true})
  }

  function goToPersonasStep() {
    setStep('personas')
    navigate(isRegisterRoute ? '/register' : '/', {replace: true})
  }

  const shellMode =
    step === 'personas'
      ? 'personas'
      : step === 'verify' || step === 'reset-password'
        ? 'verify'
        : step === 'create-profile'
          ? 'create-profile'
          : isRegisterRoute
            ? 'register'
            : 'login'

  const showPersonaFlow = !backend && step === 'personas'

  return (
    <AuthShell
      mode={shellMode}
      showModeTabs={step === 'credentials' && !isSwitching}
      wide={showPersonaFlow}
    >
      <div data-testid={testId('auth', 'page', 'panel', 'main')}>
        {isSwitching && session?.isOnboarded && showPersonaFlow && (
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

        {infoMessage && (
          <Alert
            type="info"
            showIcon
            message={infoMessage}
            style={{marginBottom: 16}}
            data-testid={testId('auth', 'page', 'text', 'info')}
          />
        )}

        {step === 'credentials' ? (
          isRegisterRoute ? (
            <RegisterForm onSuccess={handleRegisterSuccess} />
          ) : (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onForgotPassword={handleForgotPassword}
              onCodeRequired={handleLoginCodeRequired}
            />
          )
        ) : step === 'verify' ? (
          <EmailVerificationForm
            email={verifyEmail}
            maskedEmail={verifyMaskedEmail}
            purpose={verifyPurpose}
            onSuccess={handleVerifySuccess}
            onCodeAccepted={handleResetCodeAccepted}
          />
        ) : step === 'reset-password' ? (
          <PasswordResetForm
            email={verifyEmail}
            code={resetCode}
            onSuccess={handlePasswordResetSuccess}
            onBack={() => setStep('verify')}
          />
        ) : step === 'create-profile' ? (
          <CreateProfileForm seedName={seedDisplayName} onSuccess={handleProfileCreated} />
        ) : (
          <PersonaSelection isSwitching={isSwitching} onBackToCredentials={goToCredentialsStep} />
        )}

        {step === 'credentials' && isSwitching && !backend && (
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
