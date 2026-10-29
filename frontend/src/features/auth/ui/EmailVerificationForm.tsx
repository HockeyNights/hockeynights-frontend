/**
 * SPEC-FR-2.1.1
 * Подтверждение почты / второго шага входа 6-значным кодом.
 */

import {useMutation} from '@tanstack/react-query'
import {Alert, Button, Input, Typography} from 'antd'
import {type FormEvent, useState} from 'react'

import {
  backendResendCode,
  backendVerifyEmail,
  backendVerifyLoginCode,
  CodePurpose,
} from '@/entities/auth'
import {usesBackendAuth} from '@/shared/config/apiMode'
import {testId} from '@/shared/testing/testId'

export type EmailVerificationPurpose = 'register' | 'login' | 'reset'

export interface EmailVerificationFormProps {
  email: string
  purpose?: EmailVerificationPurpose
  maskedEmail?: string
  onSuccess: () => void
  /** Для reset в mock-режиме — сразу дальше; в backend ждём отдельную форму пароля */
  onCodeAccepted?: (code: string) => void
}

const CODE_LENGTH = 6

function purposeToApi(purpose: EmailVerificationPurpose) {
  switch (purpose) {
    case 'login':
      return CodePurpose.LOGIN
    case 'reset':
      return CodePurpose.PASSWORD_RESET
    default:
      return CodePurpose.EMAIL_VERIFICATION
  }
}

export function EmailVerificationForm({
  email,
  purpose = 'register',
  maskedEmail,
  onSuccess,
  onCodeAccepted,
}: EmailVerificationFormProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)
  const backend = usesBackendAuth()

  const verifyMutation = useMutation({
    mutationFn: async (otp: string) => {
      if (!backend) {
        await new Promise((resolve) => window.setTimeout(resolve, 180))
        return
      }
      if (purpose === 'reset') {
        onCodeAccepted?.(otp)
        return
      }
      if (purpose === 'login') {
        await backendVerifyLoginCode({email, code: otp})
        return
      }
      await backendVerifyEmail({email, code: otp})
    },
    onSuccess: () => {
      setError(null)
      if (backend && purpose === 'reset') return
      onSuccess()
    },
    onError: (err: Error) => {
      setError(err.message || 'Неверный код')
    },
  })

  const resendMutation = useMutation({
    mutationFn: async () => {
      if (!backend) {
        await new Promise((resolve) => window.setTimeout(resolve, 120))
        return
      }
      await backendResendCode(email, purposeToApi(purpose))
    },
    onSuccess: () => {
      setResent(true)
      setError(null)
      setCode('')
    },
    onError: (err: Error) => {
      setError(err.message || 'Не удалось отправить код')
    },
  })

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault()
    if (code.trim().length !== CODE_LENGTH) {
      setError('Введите 6-значный код')
      return
    }
    setError(null)
    verifyMutation.mutate(code.trim())
  }

  const title =
    purpose === 'login'
      ? 'Подтверждение входа'
      : purpose === 'reset'
        ? 'Код для сброса пароля'
        : 'Код подтверждения'

  const hintEmail = maskedEmail || email

  return (
    <form
      className="auth-form"
      aria-label="Подтверждение почты"
      onSubmit={handleSubmit}
      data-purpose={purpose}
      data-testid={testId('auth', 'verify', 'panel', 'form')}
    >
      <header
        className="auth-form__header"
        data-testid={testId('auth', 'verify', 'panel', 'header')}
      >
        <Typography.Title
          level={3}
          className="auth-form__title"
          data-testid={testId('auth', 'verify', 'text', 'title')}
        >
          {title}
        </Typography.Title>
        <Typography.Paragraph
          className="auth-form__subtitle"
          data-testid={testId('auth', 'verify', 'text', 'hint')}
        >
          Мы отправили 6-значный код на почту{' '}
          <strong data-testid={testId('auth', 'verify', 'text', 'email')}>{hintEmail}</strong>
        </Typography.Paragraph>
      </header>

      <div className="auth-otp" data-testid={testId('auth', 'verify', 'panel', 'otp')}>
        <Input.OTP
          length={CODE_LENGTH}
          size="large"
          value={code}
          onChange={setCode}
          type="tel"
          autoComplete="one-time-code"
          aria-label="Код подтверждения"
          data-testid={testId('auth', 'verify', 'field', 'code')}
        />
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          data-testid={testId('auth', 'verify', 'text', 'error')}
        />
      )}

      {resent && (
        <Alert
          type="info"
          showIcon
          message="Новый код отправлен на почту."
          data-testid={testId('auth', 'verify', 'text', 'resent')}
        />
      )}

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        block
        loading={verifyMutation.isPending}
        disabled={verifyMutation.isPending}
        data-testid={testId('auth', 'verify', 'btn', 'submit')}
      >
        Подтвердить код
      </Button>

      <div className="auth-otp__resend" data-testid={testId('auth', 'verify', 'panel', 'resend')}>
        <Typography.Text type="secondary">Не пришел код?</Typography.Text>
        <Button
          type="link"
          loading={resendMutation.isPending}
          onClick={() => resendMutation.mutate()}
          data-testid={testId('auth', 'verify', 'btn', 'resend')}
        >
          Отправить повторно
        </Button>
      </div>
    </form>
  )
}
