/**
 * Поле auth-формы: подпись сверху + antd Input.
 */

import {Input} from 'antd'
import type {ReactNode} from 'react'

import {testId} from '@/shared/testing/testId'

export interface AuthFieldProps {
  label: string
  fieldId: string
  value: string
  onUpdate: (value: string) => void
  type?: 'text' | 'email' | 'password'
  autoComplete?: string
  placeholder?: string
  labelExtra?: ReactNode
  testIdQualifier: string
  testIdScope?: 'login' | 'register'
}

export function AuthField({
  label,
  fieldId,
  value,
  onUpdate,
  type = 'text',
  autoComplete,
  placeholder,
  labelExtra,
  testIdQualifier,
  testIdScope = 'login',
}: AuthFieldProps) {
  const inputTestId = testId('auth', testIdScope, 'field', testIdQualifier)
  const resolvedPlaceholder =
    placeholder ?? (type === 'email' ? 'ivanov@mail.ru' : type === 'password' ? 'Ваш пароль' : '')

  return (
    <div className="auth-form-field">
      <div className="auth-form-field__label-row">
        <label className="auth-form-field__label" htmlFor={fieldId}>
          {label}
        </label>
        {labelExtra}
      </div>
      {type === 'password' ? (
        <Input.Password
          id={fieldId}
          size="large"
          value={value}
          onChange={(event) => onUpdate(event.target.value)}
          autoComplete={autoComplete}
          placeholder={resolvedPlaceholder}
          data-testid={inputTestId}
        />
      ) : (
        <Input
          id={fieldId}
          size="large"
          type={type}
          value={value}
          onChange={(event) => onUpdate(event.target.value)}
          autoComplete={autoComplete}
          placeholder={resolvedPlaceholder}
          data-testid={inputTestId}
        />
      )}
    </div>
  )
}
