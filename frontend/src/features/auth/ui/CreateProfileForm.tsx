/**
 * Создание Hockey ID после подтверждения почты (POST /v1/profile).
 */

import {useMutation} from '@tanstack/react-query'
import {Alert, Button, Select, Typography} from 'antd'
import {type FormEvent, useState} from 'react'

import type {PlayerPosition} from '@/entities/common'
import {createMyProfile, type HockeyProfile} from '@/entities/profile'
import {AuthField} from '@/features/auth/ui/AuthField'
import {playerIndexFromSkillLevel} from '@/shared/lib/profileIdentity'
import {testId} from '@/shared/testing/testId'

export interface CreateProfileFormProps {
  seedName?: string
  onSuccess: (profile: HockeyProfile) => void
}

interface FormState {
  fullName: string
  city: string
  birthDate: string
  position: PlayerPosition
  stickHand: NonNullable<HockeyProfile['stickHand']>
  heightCm: string
  weightKg: string
}

const POSITION_OPTIONS: Array<{value: PlayerPosition; label: string}> = [
  {value: 'forward', label: 'Нападение'},
  {value: 'defense', label: 'Защита'},
  {value: 'goalie', label: 'Вратарь'},
]

const GRIP_OPTIONS: Array<{value: NonNullable<HockeyProfile['stickHand']>; label: string}> = [
  {value: 'left', label: 'Левый хват'},
  {value: 'right', label: 'Правый хват'},
  {value: 'unknown', label: 'Не указан'},
]

export function CreateProfileForm({seedName = '', onSuccess}: CreateProfileFormProps) {
  const [values, setValues] = useState<FormState>({
    fullName: seedName,
    city: '',
    birthDate: '',
    position: 'forward',
    stickHand: 'unknown',
    heightCm: '',
    weightKg: '',
  })
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: createMyProfile,
    onSuccess: (profile) => {
      setError(null)
      onSuccess(profile)
    },
    onError: (err: Error) => {
      setError(err.message || 'Не удалось создать профиль')
    },
  })

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({...prev, [key]: value}))
  }

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault()
    if (values.fullName.trim().length < 2) {
      setError('Укажите имя и фамилию')
      return
    }
    if (!values.city.trim()) {
      setError('Укажите город')
      return
    }
    setError(null)
    createMutation.mutate({
      fullName: values.fullName.trim(),
      city: values.city.trim(),
      birthDate: values.birthDate || undefined,
      position: values.position,
      stickHand: values.stickHand,
      heightCm: values.heightCm ? Number(values.heightCm) : undefined,
      weightKg: values.weightKg ? Number(values.weightKg) : undefined,
      skillLevel: 'amateur',
      playerIndex: playerIndexFromSkillLevel('amateur'),
    })
  }

  return (
    <form
      className="auth-form"
      aria-label="Создание профиля"
      onSubmit={handleSubmit}
      data-testid={testId('auth', 'create-profile', 'panel', 'form')}
    >
      <header
        className="auth-form__header"
        data-testid={testId('auth', 'create-profile', 'panel', 'header')}
      >
        <Typography.Title
          level={3}
          className="auth-form__title"
          data-testid={testId('auth', 'create-profile', 'text', 'title')}
        >
          Hockey ID
        </Typography.Title>
        <Typography.Paragraph
          className="auth-form__subtitle"
          data-testid={testId('auth', 'create-profile', 'text', 'hint')}
        >
          Расскажите о себе — это ваш игровой профиль на площадке.
        </Typography.Paragraph>
      </header>

      <div
        className="auth-form__fields"
        data-testid={testId('auth', 'create-profile', 'panel', 'fields')}
      >
        <AuthField
          label="ФИО"
          fieldId="auth-create-full-name"
          autoComplete="name"
          placeholder="Иванов Алексей"
          value={values.fullName}
          onUpdate={(value) => updateField('fullName', value)}
          testIdScope="create-profile"
          testIdQualifier="full-name"
        />
        <AuthField
          label="Город"
          fieldId="auth-create-city"
          autoComplete="address-level2"
          placeholder="Москва"
          value={values.city}
          onUpdate={(value) => updateField('city', value)}
          testIdScope="create-profile"
          testIdQualifier="city"
        />
        <AuthField
          label="Дата рождения"
          fieldId="auth-create-birth-date"
          type="text"
          autoComplete="bday"
          placeholder="YYYY-MM-DD"
          value={values.birthDate}
          onUpdate={(value) => updateField('birthDate', value)}
          testIdScope="create-profile"
          testIdQualifier="birth-date"
        />

        <div className="auth-form-field">
          <div className="auth-form-field__label-row">
            <label className="auth-form-field__label" htmlFor="auth-create-position">
              Амплуа
            </label>
          </div>
          <Select
            id="auth-create-position"
            size="large"
            value={values.position}
            options={POSITION_OPTIONS}
            onChange={(value) => updateField('position', value)}
            style={{width: '100%'}}
            data-testid={testId('auth', 'create-profile', 'select', 'position')}
          />
        </div>

        <div className="auth-form-field">
          <div className="auth-form-field__label-row">
            <label className="auth-form-field__label" htmlFor="auth-create-grip">
              Хват
            </label>
          </div>
          <Select
            id="auth-create-grip"
            size="large"
            value={values.stickHand}
            options={GRIP_OPTIONS}
            onChange={(value) => updateField('stickHand', value)}
            style={{width: '100%'}}
            data-testid={testId('auth', 'create-profile', 'select', 'grip')}
          />
        </div>

        <AuthField
          label="Рост, см"
          fieldId="auth-create-height"
          type="text"
          placeholder="180"
          value={values.heightCm}
          onUpdate={(value) => updateField('heightCm', value.replace(/\D/g, ''))}
          testIdScope="create-profile"
          testIdQualifier="height"
        />
        <AuthField
          label="Вес, кг"
          fieldId="auth-create-weight"
          type="text"
          placeholder="80"
          value={values.weightKg}
          onUpdate={(value) => updateField('weightKg', value.replace(/\D/g, ''))}
          testIdScope="create-profile"
          testIdQualifier="weight"
        />
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          data-testid={testId('auth', 'create-profile', 'text', 'error')}
        />
      )}

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        block
        loading={createMutation.isPending}
        disabled={createMutation.isPending}
        data-testid={testId('auth', 'create-profile', 'btn', 'submit')}
      >
        Создать профиль
      </Button>
    </form>
  )
}
