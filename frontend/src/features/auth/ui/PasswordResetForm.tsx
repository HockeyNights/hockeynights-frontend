/**
 * Установка нового пароля по коду из письма (POST /v1/auth/password/reset).
 */

import {useMutation} from '@tanstack/react-query'
import {Alert, Button, Typography} from 'antd'
import {type FormEvent, useState} from 'react'

import {backendResetPassword} from '@/entities/auth'
import {AuthField} from '@/features/auth/ui/AuthField'
import {testId} from '@/shared/testing/testId'

export interface PasswordResetFormProps {
  email: string
  code: string
  onSuccess: () => void
  onBack?: () => void
}

export function PasswordResetForm({email, code, onSuccess, onBack}: PasswordResetFormProps) {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const resetMutation = useMutation({
    mutationFn: () =>
      backendResetPassword({
        email,
        code,
        newPassword: password,
      }),
    onSuccess: () => {
      setError(null)
      onSuccess()
    },
    onError: (err: Error) => {
      setError(err.message || 'Не удалось сменить пароль')
    },
  })

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault()
    if (password.length < 8) {
      setError('Пароль должен быть не короче 8 символов')
      return
    }
    if (password !== passwordConfirm) {
      setError('Пароли не совпадают')
      return
    }
    setError(null)
    resetMutation.mutate()
  }

  return (
    <form
      className="auth-form"
      aria-label="Новый пароль"
      onSubmit={handleSubmit}
      data-testid={testId('auth', 'reset', 'panel', 'form')}
    >
      <header
        className="auth-form__header"
        data-testid={testId('auth', 'reset', 'panel', 'header')}
      >
        <Typography.Title
          level={3}
          className="auth-form__title"
          data-testid={testId('auth', 'reset', 'text', 'title')}
        >
          Новый пароль
        </Typography.Title>
        <Typography.Paragraph
          className="auth-form__subtitle"
          data-testid={testId('auth', 'reset', 'text', 'hint')}
        >
          Придумайте пароль для аккаунта{' '}
          <strong data-testid={testId('auth', 'reset', 'text', 'email')}>{email}</strong>
        </Typography.Paragraph>
      </header>

      <div className="auth-form__fields" data-testid={testId('auth', 'reset', 'panel', 'fields')}>
        <AuthField
          label="Новый пароль"
          fieldId="auth-reset-password"
          type="password"
          autoComplete="new-password"
          placeholder="Не менее 8 символов"
          value={password}
          onUpdate={setPassword}
          testIdScope="reset"
          testIdQualifier="password"
        />
        <AuthField
          label="Подтверждение пароля"
          fieldId="auth-reset-password-confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Повторите пароль"
          value={passwordConfirm}
          onUpdate={setPasswordConfirm}
          testIdScope="reset"
          testIdQualifier="password-confirm"
        />
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          data-testid={testId('auth', 'reset', 'text', 'error')}
        />
      )}

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        block
        loading={resetMutation.isPending}
        disabled={resetMutation.isPending}
        data-testid={testId('auth', 'reset', 'btn', 'submit')}
      >
        Сохранить пароль
      </Button>

      {onBack && (
        <Button
          type="link"
          block
          onClick={onBack}
          data-testid={testId('auth', 'reset', 'btn', 'back')}
        >
          Назад
        </Button>
      )}
    </form>
  )
}
