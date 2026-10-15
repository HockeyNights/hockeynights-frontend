/**
 * SPEC-FR-2.1.1, SPEC-FR-25.1.1
 * Форма регистрации (mock Phase 1 + localAuthMemory).
 */

import {useMutation} from '@tanstack/react-query'
import {Alert, Button, Typography} from 'antd'
import {type FormEvent, useState} from 'react'

import {registerAccount} from '@/entities/auth'
import {
  type RegisterFormValues,
  validateRegisterForm,
} from '@/features/auth/lib/registrationValidation'
import {AuthField} from '@/features/auth/ui/AuthField'
import {TermsAcceptanceField} from '@/features/auth/ui/TermsAcceptanceField'
import {testId} from '@/shared/testing/testId'

export interface RegisterFormProps {
  onSuccess: (email: string) => void
}

const INITIAL_VALUES: RegisterFormValues = {
  displayName: '',
  email: '',
  password: '',
  passwordConfirm: '',
  acceptTerms: false,
}

export function RegisterForm({onSuccess}: RegisterFormProps) {
  const [values, setValues] = useState<RegisterFormValues>(INITIAL_VALUES)
  const [error, setError] = useState<string | null>(null)

  const registerMutation = useMutation({
    mutationFn: registerAccount,
    onSuccess: () => {
      setError(null)
      onSuccess(values.email.trim())
    },
    onError: (err: Error) => {
      setError(err.message || 'Не удалось зарегистрироваться')
    },
  })

  function updateField<K extends keyof RegisterFormValues>(key: K, value: RegisterFormValues[K]) {
    setValues((prev) => ({...prev, [key]: value}))
  }

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault()
    const validationError = validateRegisterForm(values)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    registerMutation.mutate({
      displayName: values.displayName.trim(),
      email: values.email.trim(),
      password: values.password,
    })
  }

  return (
    <form
      className="auth-form"
      aria-label="Регистрация"
      onSubmit={handleSubmit}
      data-testid={testId('auth', 'register', 'panel', 'form')}
    >
      <header
        className="auth-form__header"
        data-testid={testId('auth', 'register', 'panel', 'header')}
      >
        <Typography.Title
          level={3}
          className="auth-form__title"
          data-testid={testId('auth', 'register', 'text', 'title')}
        >
          Создать аккаунт
        </Typography.Title>
        <Typography.Paragraph
          className="auth-form__subtitle"
          data-testid={testId('auth', 'register', 'text', 'hint')}
        >
          Укажите имя, почту и пароль. Профиль сохранится на этом устройстве.
        </Typography.Paragraph>
      </header>

      <Alert
        type="info"
        showIcon
        message={
          <span data-testid={testId('auth', 'register', 'text', 'local-memory')}>
            Пока аккаунт остаётся только на этом компьютере и не уходит в облако.
          </span>
        }
      />

      <div
        className="auth-form__fields"
        data-testid={testId('auth', 'register', 'panel', 'fields')}
      >
        <AuthField
          label="Имя"
          fieldId="auth-register-display-name"
          autoComplete="name"
          placeholder="Алексей Смирнов"
          value={values.displayName}
          onUpdate={(value) => updateField('displayName', value)}
          testIdScope="register"
          testIdQualifier="display-name"
        />
        <AuthField
          label="Email"
          fieldId="auth-register-email"
          type="email"
          autoComplete="email"
          placeholder="ivanov@mail.ru"
          value={values.email}
          onUpdate={(value) => updateField('email', value)}
          testIdScope="register"
          testIdQualifier="email"
        />
        <AuthField
          label="Пароль"
          fieldId="auth-register-password"
          type="password"
          autoComplete="new-password"
          placeholder="Не менее 6 символов"
          value={values.password}
          onUpdate={(value) => updateField('password', value)}
          testIdScope="register"
          testIdQualifier="password"
        />
        <AuthField
          label="Подтверждение пароля"
          fieldId="auth-register-password-confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Повторите пароль"
          value={values.passwordConfirm}
          onUpdate={(value) => updateField('passwordConfirm', value)}
          testIdScope="register"
          testIdQualifier="password-confirm"
        />

        <TermsAcceptanceField
          checked={values.acceptTerms}
          onUpdate={(checked) => updateField('acceptTerms', checked)}
        />
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          data-testid={testId('auth', 'register', 'text', 'error')}
        />
      )}

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        block
        loading={registerMutation.isPending}
        disabled={registerMutation.isPending}
        data-testid={testId('auth', 'register', 'btn', 'submit')}
      >
        Зарегистрироваться
      </Button>
    </form>
  )
}
