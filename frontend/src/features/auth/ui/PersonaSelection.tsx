/**
 * SPEC-FR-2.1.2, SPEC-FR-25.1.2
 * Выбор демо-роли после входа или регистрации.
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Alert, Button, Typography} from 'antd'
import {type CSSProperties, useMemo, useState} from 'react'
import {useNavigate} from 'react-router'

import type {AuthLoginResponse, AvailablePersona} from '@/entities/auth'
import {fetchSession, selectPersona} from '@/entities/auth'
import type {HockeyProfile} from '@/entities/profile'
import {getPersonaHomePath} from '@/features/access'
import {PERSONA_PRESETS, type PersonaPreset} from '@/features/auth/lib/personaPresets'
import {testId} from '@/shared/testing/testId'

export interface PersonaSelectionProps {
  isSwitching?: boolean
  onBackToCredentials?: () => void
}

const PERSONA_ACCENT: Record<string, string> = {
  player: '#ffc72c',
  goalie: '#3b9eff',
  captain: '#34d399',
  coach: '#a78bfa',
  organizer: '#f43f5e',
  'club-admin': '#e879f9',
  'league-partner': '#fb923c',
  'shop-partner': '#22d3ee',
  'arena-partner': '#4ade80',
  admin: '#c084fc',
}

const PERSONA_CTA: Record<string, string> = {
  player: 'Войти как игрок',
  goalie: 'Войти как вратарь',
  captain: 'Войти как капитан',
  coach: 'Войти как тренер',
  organizer: 'Войти как организатор',
  'club-admin': 'Войти как админ клуба',
  'league-partner': 'Войти как представитель лиги',
  'shop-partner': 'Войти как представитель магазина',
  'arena-partner': 'Войти как представитель арены',
  admin: 'Войти как администратор',
}

function toPersonaPreset(persona: AvailablePersona): PersonaPreset | undefined {
  return PERSONA_PRESETS.find((preset) => preset.id === persona.id)
}

export function PersonaSelection({
  isSwitching = false,
  onBackToCredentials,
}: PersonaSelectionProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [pendingPersonaId, setPendingPersonaId] = useState<string | null>(null)
  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})

  const personas = useMemo(() => {
    if (isSwitching) {
      return PERSONA_PRESETS
    }
    const cached = queryClient.getQueryData<AuthLoginResponse>(['auth-login'])?.availablePersonas
    return cached?.length ? cached : PERSONA_PRESETS
  }, [isSwitching, queryClient])

  const personaMutation = useMutation({
    mutationFn: (preset: PersonaPreset) => selectPersona({personaId: preset.id}),
    onSuccess: (nextSession) => {
      setError(null)
      setPendingPersonaId(null)
      queryClient.setQueryData(['session'], nextSession)
      queryClient.setQueryData(['profile'], (prev: HockeyProfile | undefined) =>
        prev
          ? {
              ...prev,
              fullName: nextSession.user.displayName,
              userId: nextSession.user.id,
            }
          : prev,
      )
      void queryClient.invalidateQueries({queryKey: ['profile']})
      void queryClient.invalidateQueries({queryKey: ['profile-settings']})
      const homePath = nextSession.homePath ?? getPersonaHomePath(nextSession)
      navigate(homePath, {replace: true})
    },
    onError: (err: Error) => {
      setPendingPersonaId(null)
      setError(err.message || 'Не удалось сохранить выбранную роль')
    },
  })

  function selectPersonaCard(persona: AvailablePersona) {
    const preset = toPersonaPreset(persona)
    if (!preset) {
      setError(`Неизвестная роль: ${persona.title}`)
      return
    }
    setError(null)
    setPendingPersonaId(persona.id)
    personaMutation.mutate(preset)
  }

  return (
    <section
      className="auth-form auth-form--personas"
      aria-label="Выбор роли"
      data-testid={testId('auth', 'login', 'panel', 'personas')}
    >
      <header className="auth-personas__header">
        <Typography.Title
          level={2}
          className="auth-personas__title"
          data-testid={testId('auth', 'login', 'text', 'personas-title')}
        >
          Выберите демо-роль
        </Typography.Title>
        <Typography.Paragraph
          className="auth-personas__hint"
          data-testid={testId('auth', 'login', 'text', 'personas-hint')}
        >
          Каждая карточка открывает свой режим интерфейса. Выбор сохранится в локальном профиле.
        </Typography.Paragraph>
      </header>

      <div className="persona-card-grid" data-testid={testId('auth', 'login', 'grid', 'personas')}>
        {personas.map((persona) => {
          const isCurrent = session?.personaId === persona.id
          const isPending = pendingPersonaId === persona.id
          const accent = PERSONA_ACCENT[persona.id] ?? '#ffc72c'
          const cta = PERSONA_CTA[persona.id] ?? `Войти как ${persona.title.toLowerCase()}`
          return (
            <button
              key={persona.id}
              type="button"
              className={[
                'persona-card',
                isCurrent ? 'persona-card--current' : '',
                isPending ? 'persona-card--pending' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{'--persona-accent': accent} as CSSProperties}
              aria-label={`${persona.title}. ${persona.description}. ${persona.destination}`}
              aria-busy={isPending}
              disabled={personaMutation.isPending}
              onClick={() => selectPersonaCard(persona)}
              data-testid={testId('auth', 'persona', 'btn', persona.id)}
            >
              {isCurrent && (
                <span
                  className="persona-card__badge"
                  data-testid={testId('auth', 'persona', 'badge', 'current')}
                >
                  текущий
                </span>
              )}
              <span className="persona-card__title">{persona.title}</span>
              <span className="persona-card__description">{persona.description}</span>
              <span className="persona-card__destination">{isPending ? 'Переключаем…' : cta}</span>
            </button>
          )
        })}
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          data-testid={testId('auth', 'login', 'text', 'personas-error')}
        />
      )}

      {onBackToCredentials && (
        <Button
          size="large"
          block
          onClick={onBackToCredentials}
          data-testid={testId('auth', 'login', 'btn', 'back-credentials')}
        >
          Назад
        </Button>
      )}
    </section>
  )
}
