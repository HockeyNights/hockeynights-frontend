/**
 * SPEC-FR-2.1.1
 * Подтверждение почты 6-значным кодом (mock).
 */

import {Button, Input, Typography} from 'antd'
import {type FormEvent, useState} from 'react'

import {testId} from '@/shared/testing/testId'

export type EmailVerificationPurpose = 'register' | 'reset'

export interface EmailVerificationFormProps {
  email: string
  purpose?: EmailVerificationPurpose
  onSuccess: () => void
}

const CODE_LENGTH = 6

export function EmailVerificationForm({
  email,
  purpose = 'register',
  onSuccess,
}: EmailVerificationFormProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault()
    if (code.trim().length !== CODE_LENGTH) {
      setError('Введите 6-значный код')
      return
    }
    setError(null)
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      onSuccess()
    }, 180)
  }

  function handleResend() {
    setResent(true)
    setError(null)
    setCode('')
  }

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
          Код подтверждения
        </Typography.Title>
        <Typography.Paragraph
          className="auth-form__subtitle"
          data-testid={testId('auth', 'verify', 'text', 'hint')}
        >
          Мы отправили 6-значный код на почту{' '}
          <strong data-testid={testId('auth', 'verify', 'text', 'email')}>{email}</strong>
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
        <div
          className="auth-alert auth-alert--error"
          data-testid={testId('auth', 'verify', 'text', 'error')}
        >
          {error}
        </div>
      )}

      {resent && (
        <div
          className="auth-alert auth-alert--info"
          data-testid={testId('auth', 'verify', 'text', 'resent')}
        >
          Новый код отправлен на почту.
        </div>
      )}

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        block
        loading={submitting}
        disabled={submitting}
        data-testid={testId('auth', 'verify', 'btn', 'submit')}
      >
        Подтвердить код
      </Button>

      <div className="auth-otp__resend" data-testid={testId('auth', 'verify', 'panel', 'resend')}>
        <Typography.Text type="secondary">Не пришел код?</Typography.Text>
        <Button
          type="link"
          onClick={handleResend}
          data-testid={testId('auth', 'verify', 'btn', 'resend')}
        >
          Отправить повторно
        </Button>
      </div>
    </form>
  )
}
