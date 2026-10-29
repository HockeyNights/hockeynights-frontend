/**
 * SPEC-FR-2.1.1, SPEC-FR-25.1.1
 * Форма входа (email + пароль).
 */

import {useMutation, useQueryClient} from '@tanstack/react-query'
import {Alert, Button, Typography} from 'antd'
import {type FormEvent, useState} from 'react'

import {authLogin, loginWithBackend, loginWithCredentials} from '@/entities/auth'
import type {Session} from '@/entities/user'
import {DEMO_EMAIL, DEMO_PASSWORD, isDemoCredentials} from '@/features/auth/lib/demoCredentials'
import {AuthDemoCard} from '@/features/auth/ui/AuthDemoCard'
import {AuthField} from '@/features/auth/ui/AuthField'
import {usesBackendAuth} from '@/shared/config/apiMode'
import {testId} from '@/shared/testing/testId'

export interface LoginFormProps {
  onSuccess: (result?: {needsProfile?: boolean}) => void
  onForgotPassword?: (email: string) => void
  onCodeRequired?: (email: string, meta?: {maskedEmail?: string}) => void
}

export function LoginForm({onSuccess, onForgotPassword, onCodeRequired}: LoginFormProps) {
  const queryClient = useQueryClient()
  const backend = usesBackendAuth()
  const [email, setEmail] = useState(backend ? '' : DEMO_EMAIL)
  const [password, setPassword] = useState(backend ? '' : DEMO_PASSWORD)
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useMutation({
    mutationFn: async (payload: {email: string; password: string}) => {
      if (backend) {
        return {kind: 'backend' as const, data: await loginWithBackend(payload)}
      }
      if (isDemoCredentials(payload.email, payload.password)) {
        return {kind: 'demo' as const, data: await authLogin(payload)}
      }
      await loginWithCredentials(payload)
      return {kind: 'local' as const}
    },
    onSuccess: (result) => {
      setError(null)
      if (result.kind === 'demo') {
        queryClient.setQueryData(['auth-login'], result.data)
        onSuccess()
        return
      }
      if (result.kind === 'backend') {
        if (result.data.kind === 'code_required') {
          onCodeRequired?.(result.data.email, {maskedEmail: result.data.maskedEmail})
          return
        }
        queryClient.setQueryData(['session'], result.data.session as Session)
        queryClient.removeQueries({queryKey: ['auth-login']})
        onSuccess({needsProfile: result.data.session.needsProfile})
        return
      }
      queryClient.removeQueries({queryKey: ['auth-login']})
      onSuccess()
    },
    onError: (err: Error) => {
      setError(err.message || 'Не удалось войти')
    },
  })

  function applyDemoCredentials() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setError(null)
  }

  function handleForgotPassword() {
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Введите email для восстановления пароля')
      return
    }
    setError(null)
    onForgotPassword?.(trimmed)
  }

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault()
    setError(null)
    loginMutation.mutate({email: email.trim(), password})
  }

  return (
    <form
      className="auth-form auth-form--login"
      aria-label="Вход"
      onSubmit={handleSubmit}
      data-testid={testId('auth', 'login', 'panel', 'form')}
    >
      <header
        className="auth-form__header"
        data-testid={testId('auth', 'login', 'panel', 'header')}
      >
        <Typography.Title
          level={3}
          className="auth-form__title"
          data-testid={testId('auth', 'login', 'text', 'title')}
        >
          Вход в аккаунт
        </Typography.Title>
        <Typography.Paragraph
          className="auth-form__subtitle"
          data-testid={testId('auth', 'login', 'text', 'hint')}
        >
          {backend
            ? 'Войдите по почте и паролю. При необходимости подтвердите код из письма.'
            : 'Войдите по почте или нажмите «Быстрый доступ», чтобы открыть демо.'}
        </Typography.Paragraph>
      </header>

      {!backend && <AuthDemoCard onApply={applyDemoCredentials} />}

      <div className="auth-form__fields" data-testid={testId('auth', 'login', 'panel', 'fields')}>
        <AuthField
          label="Email"
          fieldId="auth-login-email"
          type="email"
          autoComplete="email"
          placeholder="ivanov@mail.ru"
          value={email}
          onUpdate={setEmail}
          testIdScope="login"
          testIdQualifier="email"
        />
        <AuthField
          label="Пароль"
          fieldId="auth-login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Ваш пароль"
          value={password}
          onUpdate={setPassword}
          testIdScope="login"
          testIdQualifier="password"
          labelExtra={
            <Button
              type="link"
              className="auth-form-field__forgot"
              onClick={handleForgotPassword}
              data-testid={testId('auth', 'login', 'btn', 'forgot')}
            >
              Забыли пароль?
            </Button>
          }
        />
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          data-testid={testId('auth', 'login', 'text', 'error')}
        />
      )}

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        block
        loading={loginMutation.isPending}
        disabled={loginMutation.isPending}
        data-testid={testId('auth', 'login', 'btn', 'submit')}
      >
        Войти в систему
      </Button>
    </form>
  )
}
