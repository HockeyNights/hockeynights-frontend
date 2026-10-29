/**
 * SPEC-FR-2.2.1, SPEC-FR-2.2.2, SPEC-FR-2.2.4
 * SPEC-FR-17.1.1, SPEC-FR-18.1.1, SPEC-FR-18.1.3, SPEC-FR-18.1.4, SPEC-FR-19.1.1
 */

import {CircleInfo, CreditCard, ShieldCheck} from '@gravity-ui/icons'
import {
  Checkbox,
  Dialog,
  Icon,
  Progress,
  Select,
  Switch,
  Text,
  TextArea,
  TextInput,
} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useId, useState} from 'react'
import {Link, Navigate, useNavigate, useSearchParams} from 'react-router'

import {logoutAllSessions} from '@/entities/auth'
import type {PlayerPosition, SkillLevel, UserRole} from '@/entities/common'
import type {
  HockeyProfile,
  PrivacyAudience,
  ProfileContacts,
  ProfileFieldPrivacy,
  ProfileSettings,
  SubscriptionState,
} from '@/entities/profile'
import {
  CONTACT_FIELD_PRIVACY_KEYS,
  fetchMyProfile,
  fetchProfileSettings,
  FIELD_PRIVACY_LABELS,
  FIELD_PRIVACY_OPTIONS,
  normalizePrivacySettings,
  PROFILE_FIELD_PRIVACY_KEYS,
  startVerificationRequest,
  toPlayerListItem,
  updateMyProfile,
  updateNotificationPreferences,
  updatePrivacySettings,
  updateSubscription,
} from '@/entities/profile'
import {getPrimaryPartnerPath, shouldUsePartnerWorkspace, useSessionAccess} from '@/features/access'
import {CalendarShell} from '@/features/calendar'
import {ProfileFavoritesSection} from '@/features/favorites'
import {KarmaHint} from '@/features/karma'
import {PlayerPublicInfoSection} from '@/features/players'
import {
  CoachProfilePanel,
  ParticipationHistorySection,
  ProfileAvatarEditor,
} from '@/features/profile'
import {parseApiErrorMessage} from '@/shared/api/parseApiError'
import {usesBackendAuth} from '@/shared/config/apiMode'
import {
  clampPlayerIndex,
  PLAYER_INDEX_LEVELS,
  playerIndexFromSkillLevel,
  skillLevelFromPlayerIndex,
} from '@/shared/lib/profileIdentity'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {PositionLabel} from '@/shared/ui/PositionLabel'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {PlayerCard} from '@/widgets/PlayerCard'

const SKILL_OPTIONS = [
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'novice_theorist', content: 'Начинающий теоретик'},
  {value: 'theorist', content: 'Теоретик'},
  {value: 'confident_theorist', content: 'Уверенный теоретик'},
  {value: 'practitioner', content: 'Практик'},
  {value: 'master', content: 'Мастер'},
]

const PLAYER_INDEX_OPTIONS = PLAYER_INDEX_LEVELS.map((item) => ({
  value: String(item.index),
  content: `${item.index} — ${item.label}`,
}))

const STICK_HAND_CHOICES: Array<{value: NonNullable<HockeyProfile['stickHand']>; content: string}> =
  [
    {value: 'unknown', content: 'Не указан'},
    {value: 'left', content: 'Левый'},
    {value: 'right', content: 'Правый'},
  ]

const POSITION_CHOICES: Array<{value: PlayerPosition; content: string}> = [
  {value: 'forward', content: 'Нападение'},
  {value: 'defense', content: 'Защита'},
  {value: 'goalie', content: 'Вратарь'},
]

const VISIBILITY_OPTIONS = [
  {value: 'public', content: 'Публичный'},
  {value: 'teams_only', content: 'Только командам'},
  {value: 'verified_only', content: 'Только подтвержденным'},
  {value: 'private', content: 'Скрытый'},
]

const SUBSCRIPTION_PLAN_OPTIONS = [
  {
    id: 'free' as const,
    name: 'Free',
    description: 'Базовый профиль и доступ к командным чатам.',
    monthPrice: 0,
    seasonDiscount: 0,
  },
  {
    id: 'player_plus' as const,
    name: 'Player Plus',
    description: 'Приоритетные уведомления и расширенная статистика игрока.',
    monthPrice: 990,
    seasonDiscount: 100,
  },
  {
    id: 'team_pro' as const,
    name: 'Team Pro',
    description: 'Инструменты для капитана, тренера и админов команды.',
    monthPrice: 1490,
    seasonDiscount: 100,
  },
]

function formatPlanMonthPrice(monthPrice: number): string {
  return `${monthPrice.toLocaleString('ru-RU')} ₽ / мес`
}

type SubscriptionView = 'plans' | 'checkout' | 'success'
type PaymentMethodId = 'mir' | 'sbp' | 'new_card'

const PAYMENT_METHODS: Array<{id: PaymentMethodId; label: string}> = [
  {id: 'mir', label: 'MIR •• 4812'},
  {id: 'sbp', label: 'СБП (Система быстрых платежей)'},
  {id: 'new_card', label: 'Добавить новую карту'},
]

type ProfileHubSection = 'about' | 'favorites' | 'settings' | 'subscription'

const PROFILE_HUB_SECTIONS: ProfileHubSection[] = ['about', 'favorites', 'settings', 'subscription']

function isProfileHubSection(value: string | null): value is ProfileHubSection {
  return Boolean(value && PROFILE_HUB_SECTIONS.includes(value as ProfileHubSection))
}

function resolveProfileHubSection(value: string | null): ProfileHubSection {
  if (value === 'privacy') return 'settings'
  return isProfileHubSection(value) ? value : 'about'
}

const PROFILE_HUB_TAB_LABELS: Record<ProfileHubSection, string> = {
  about: 'О себе',
  favorites: 'Избранное',
  settings: 'Настройки',
  subscription: 'Подписка',
}

function ProfileHubTabs({
  section,
  onSelect,
}: {
  section: ProfileHubSection
  onSelect: (value: ProfileHubSection) => void
}) {
  return (
    <div
      className="profile-hub__tabs"
      data-testid={testId('profile', 'profile-hub-tabs', 'tab', 'list')}
    >
      {PROFILE_HUB_SECTIONS.map((value) => (
        <button
          key={value}
          type="button"
          className={`hockey-segmented__item${section === value ? ' is-active' : ''}`}
          aria-pressed={section === value}
          onClick={() => onSelect(value)}
          data-testid={testId('profile', 'profile-hub-tabs', 'tab', value)}
        >
          {PROFILE_HUB_TAB_LABELS[value]}
        </button>
      ))}
    </div>
  )
}

function ProfileAboutSection({
  profile,
  settings,
  userRoles,
  onSaveProfile,
  onStartVerification,
  onCloseEdit,
  isSaving,
  isVerifying,
  saveError,
  detailsOpen,
  detailsPanelId,
}: {
  profile: HockeyProfile
  settings: ProfileSettings
  userRoles: UserRole[]
  onSaveProfile: (next: Partial<HockeyProfile>) => Promise<void>
  onStartVerification: () => void
  onCloseEdit: () => void
  isSaving: boolean
  isVerifying: boolean
  saveError?: unknown
  detailsOpen: boolean
  detailsPanelId: string
}) {
  const birthDateId = useId()
  const fieldId = useId()
  const [form, setForm] = useState<Partial<HockeyProfile>>(profile)
  const [editSessionOpen, setEditSessionOpen] = useState(detailsOpen)
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false)

  if (detailsOpen !== editSessionOpen) {
    setEditSessionOpen(detailsOpen)
    if (detailsOpen) {
      setForm(profile)
    }
  }

  /** Пока диалог открыт — карточки показывают черновик */
  const previewProfile: HockeyProfile = detailsOpen ? {...profile, ...form} : profile
  const player = toPlayerListItem(previewProfile)

  /** @spec SPEC-FR-2.2.2 - Обновление поля профиля */
  function updateField<K extends keyof HockeyProfile>(key: K, value: HockeyProfile[K]) {
    setForm((prev) => ({...prev, [key]: value}))
  }

  function handleClose() {
    if (isSaving || avatarEditorOpen) return
    setForm(profile)
    onCloseEdit()
  }

  const isGoalieProfile = userRoles.includes('goalie') || profile.position === 'goalie'
  const showHistorySection =
    userRoles.includes('player') ||
    userRoles.includes('goalie') ||
    userRoles.includes('captain') ||
    userRoles.includes('coach')
  const privacy = normalizePrivacySettings(settings.privacy)
  const canEditContacts = privacy.personalDataProcessingConsent
  const ownerContacts = previewProfile.contacts

  function updateContact(key: keyof ProfileContacts, value: string) {
    setForm((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        [key]: value.trim() === '' ? undefined : value,
      },
    }))
  }

  /** @spec SPEC-FR-2.2.1 - Сохранение профиля */
  async function handleSave() {
    const next: Partial<HockeyProfile> = {...form}
    if (next.playerIndex != null && !Number.isNaN(Number(next.playerIndex))) {
      next.playerIndex = clampPlayerIndex(Number(next.playerIndex))
      next.skillLevel = skillLevelFromPlayerIndex(next.playerIndex)
    } else if (next.skillLevel) {
      next.playerIndex = playerIndexFromSkillLevel(next.skillLevel)
      next.skillLevel = skillLevelFromPlayerIndex(next.playerIndex)
    }
    if (next.heightCm != null && !Number.isNaN(Number(next.heightCm))) {
      next.heightCm = Math.round(Number(next.heightCm))
    }
    if (next.weightKg != null && !Number.isNaN(Number(next.weightKg))) {
      next.weightKg = Math.round(Number(next.weightKg))
    }
    if (typeof next.fullName === 'string') {
      next.fullName = next.fullName.trim()
    }
    if (typeof next.city === 'string') {
      next.city = next.city.trim()
    }
    if (typeof next.bio === 'string') {
      next.bio = next.bio.trim()
    }
    /** Пустая строка — сброс аватарки (JSON не передаёт undefined) */
    next.avatarUrl = form.avatarUrl?.trim() ? form.avatarUrl.trim() : ''
    if (canEditContacts && next.contacts) {
      const contacts: ProfileContacts = {}
      if (next.contacts.phone?.trim()) contacts.phone = next.contacts.phone.trim()
      if (next.contacts.email?.trim()) contacts.email = next.contacts.email.trim()
      if (next.contacts.telegram?.trim()) contacts.telegram = next.contacts.telegram.trim()
      if (next.contacts.maxMessenger?.trim()) {
        contacts.maxMessenger = next.contacts.maxMessenger.trim()
      }
      next.contacts = Object.keys(contacts).length > 0 ? contacts : undefined
    } else if (!canEditContacts) {
      next.contacts = profile.contacts
    }
    try {
      await onSaveProfile(next)
    } catch {
      /* ошибка показывается через saveError */
    }
  }

  return (
    <div className="player-profile-layout">
      <div
        className="player-profile-layout__col"
        data-testid={testId('profile', 'profile-about-section', 'panel', 'grid')}
      >
        <PlayerCard player={player} linkable={false} showFavorite={false} variant="profile" />
        <PlayerPublicInfoSection
          player={player}
          contactsVisible={Boolean(ownerContacts)}
          visibleContacts={ownerContacts}
          participationHistoryVisible
          hideHistory
          moreTo={`/players/${profile.userId}`}
        />
      </div>

      <Dialog
        open={detailsOpen}
        onClose={handleClose}
        maxWidth="l"
        fullWidth
        className="profile-hub__edit-dialog profile-edit-dialog"
        modalClassName="profile-hub__edit-dialog-modal"
        contentOverflow="auto"
        data-testid={testId('profile', 'profile-about-section', 'card')}
      >
        <Dialog.Header
          caption="Редактирование профиля"
          data-testid={testId('profile', 'profile-about-section', 'text', 'title')}
        />
        <Dialog.Body>
          <div id={detailsPanelId} className="profile-edit">
            <div className="profile-edit__col">
              <section className="profile-edit__card">
                <p className="profile-edit__title">Фото профиля</p>
                <ProfileAvatarEditor
                  avatarUrl={form.avatarUrl}
                  displayName={form.fullName || profile.fullName}
                  onChange={(next) => updateField('avatarUrl', next || undefined)}
                  onEditorOpenChange={setAvatarEditorOpen}
                />

                {userRoles.includes('coach') && <CoachProfilePanel />}

                {isGoalieProfile && (
                  <div
                    className="profile-hub__goalie-panel"
                    data-testid={testId('profile', 'profile-about-section', 'panel', 'goalie')}
                  >
                    <Text
                      variant="subheader-3"
                      data-testid={testId(
                        'profile',
                        'profile-about-section',
                        'text',
                        'goalie-title',
                      )}
                    >
                      Профиль вратаря
                    </Text>
                    <Text
                      color="secondary"
                      data-testid={testId(
                        'profile',
                        'profile-about-section',
                        'text',
                        'goalie-hint',
                      )}
                    >
                      Приоритетные SOS-запросы и отдельная метрика надёжности выходов.
                    </Text>
                    {profile.goalieReliabilityScore != null && (
                      <div
                        className="profile-hub__goalie-score"
                        data-testid={testId(
                          'profile',
                          'profile-about-section',
                          'panel',
                          'goalie-score',
                        )}
                      >
                        <Text
                          color="secondary"
                          data-testid={testId(
                            'profile',
                            'profile-about-section',
                            'text',
                            'goalie-score-label',
                          )}
                        >
                          Надёжность выходов
                        </Text>
                        <Progress
                          value={profile.goalieReliabilityScore}
                          text={`${profile.goalieReliabilityScore}%`}
                          data-testid={testId(
                            'profile',
                            'profile-about-section',
                            'cell',
                            'goalie-score',
                          )}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div
                  className="profile-edit__karma"
                  data-testid={testId('profile', 'profile-about-section', 'panel', 'karma')}
                >
                  <Icon data={ShieldCheck} size={16} className="profile-edit__karma-icon" />
                  <KarmaHint testIdPrefix="profile" />
                </div>
              </section>

              <section className="profile-edit__card">
                <p className="profile-edit__title">Игровые данные</p>
                <div className="profile-edit__field">
                  <span className="profile-edit__label">Хват клюшки</span>
                  <div
                    className="profile-edit__choice profile-edit__choice--2"
                    role="group"
                    aria-label="Хват клюшки"
                    data-testid={testId('profile', 'profile-about-section', 'select', 'stick-hand')}
                  >
                    {STICK_HAND_CHOICES.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`profile-edit__choice-item${
                          form.stickHand === option.value ? ' is-active' : ''
                        }`}
                        aria-pressed={form.stickHand === option.value}
                        onClick={() => updateField('stickHand', option.value)}
                        data-testid={testId(
                          'profile',
                          'profile-about-section',
                          'btn',
                          'stick-hand',
                          option.value,
                        )}
                      >
                        {option.content}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="profile-edit__field">
                  <span className="profile-edit__label">Основное амплуа</span>
                  <div
                    className="profile-edit__choice profile-edit__choice--3"
                    role="group"
                    aria-label="Основное амплуа"
                    data-testid={testId('profile', 'profile-about-section', 'select', 'position')}
                  >
                    {POSITION_CHOICES.map((option) => {
                      const active = (form.position ?? 'forward') === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`profile-edit__choice-item profile-edit__choice-item--tile${
                            active ? ' is-active' : ''
                          }`}
                          aria-pressed={active}
                          onClick={() => updateField('position', option.value)}
                          data-testid={testId(
                            'profile',
                            'profile-about-section',
                            'btn',
                            'position',
                            option.value,
                          )}
                        >
                          <PositionLabel position={option.value} testIdPrefix="profile" />
                          {option.content}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="profile-edit__grid">
                  <div className="profile-edit__field">
                    <span className="profile-edit__label">Уровень подготовки</span>
                    <Select
                      size="l"
                      width="max"
                      value={[
                        form.skillLevel &&
                        SKILL_OPTIONS.some((option) => option.value === form.skillLevel)
                          ? form.skillLevel
                          : skillLevelFromPlayerIndex(form.playerIndex ?? 4),
                      ]}
                      onUpdate={(v) => {
                        const skillLevel = v[0] as SkillLevel
                        setForm((prev) => ({
                          ...prev,
                          skillLevel,
                          playerIndex: playerIndexFromSkillLevel(skillLevel),
                        }))
                      }}
                      options={SKILL_OPTIONS}
                      data-testid={testId(
                        'profile',
                        'profile-about-section',
                        'select',
                        'skill-level',
                      )}
                    />
                  </div>
                  <div className="profile-edit__field">
                    <span className="profile-edit__label">Индекс</span>
                    <Select
                      size="l"
                      width="max"
                      value={
                        form.playerIndex != null
                          ? [String(clampPlayerIndex(form.playerIndex))]
                          : [String(playerIndexFromSkillLevel(form.skillLevel ?? 'amateur'))]
                      }
                      onUpdate={(v) => {
                        if (!v[0]) {
                          updateField('playerIndex', undefined)
                          return
                        }
                        const playerIndex = clampPlayerIndex(Number(v[0]))
                        setForm((prev) => ({
                          ...prev,
                          playerIndex,
                          skillLevel: skillLevelFromPlayerIndex(playerIndex),
                        }))
                      }}
                      options={PLAYER_INDEX_OPTIONS}
                      data-testid={testId('profile', 'profile-about-section', 'select', 'index')}
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="profile-edit__col">
              <section className="profile-edit__card">
                <p className="profile-edit__title">Личные данные</p>
                <div className="profile-edit__field">
                  <label className="profile-edit__label" htmlFor={`${fieldId}-name`}>
                    ФИО
                  </label>
                  <TextInput
                    id={`${fieldId}-name`}
                    size="l"
                    value={form.fullName ?? ''}
                    onUpdate={(v) => updateField('fullName', v)}
                    data-testid={testId('profile', 'profile-about-section', 'field', 'full-name')}
                  />
                </div>
                <div className="profile-edit__field">
                  <label
                    className="profile-edit__label"
                    htmlFor={birthDateId}
                    data-testid={testId(
                      'profile',
                      'profile-about-section',
                      'text',
                      'birth-date-label',
                    )}
                  >
                    Дата рождения
                  </label>
                  <input
                    id={birthDateId}
                    type="date"
                    className="profile-edit__native-input"
                    value={form.birthDate ?? ''}
                    onChange={(event) => updateField('birthDate', event.target.value || undefined)}
                    data-testid={testId('profile', 'profile-about-section', 'field', 'birth-date')}
                  />
                </div>
                <div className="profile-edit__field">
                  <label className="profile-edit__label" htmlFor={`${fieldId}-city`}>
                    Город проживания
                  </label>
                  <TextInput
                    id={`${fieldId}-city`}
                    size="l"
                    value={form.city ?? ''}
                    onUpdate={(v) => updateField('city', v)}
                    data-testid={testId('profile', 'profile-about-section', 'field', 'city')}
                  />
                </div>
                <div className="profile-edit__grid">
                  <div className="profile-edit__field">
                    <label className="profile-edit__label" htmlFor={`${fieldId}-height`}>
                      Рост (см)
                    </label>
                    <TextInput
                      id={`${fieldId}-height`}
                      size="l"
                      type="number"
                      value={form.heightCm != null ? String(form.heightCm) : ''}
                      onUpdate={(v) => {
                        if (v === '' || Number.isNaN(Number(v))) {
                          updateField('heightCm', undefined)
                          return
                        }
                        updateField('heightCm', Math.round(Number(v)))
                      }}
                      data-testid={testId('profile', 'profile-about-section', 'field', 'height')}
                    />
                  </div>
                  <div className="profile-edit__field">
                    <label className="profile-edit__label" htmlFor={`${fieldId}-weight`}>
                      Вес (кг)
                    </label>
                    <TextInput
                      id={`${fieldId}-weight`}
                      size="l"
                      type="number"
                      value={form.weightKg != null ? String(form.weightKg) : ''}
                      onUpdate={(v) => {
                        if (v === '' || Number.isNaN(Number(v))) {
                          updateField('weightKg', undefined)
                          return
                        }
                        updateField('weightKg', Math.round(Number(v)))
                      }}
                      data-testid={testId('profile', 'profile-about-section', 'field', 'weight')}
                    />
                  </div>
                </div>
              </section>

              <section className="profile-edit__card">
                <p className="profile-edit__title">Публичная информация</p>
                <div
                  className="profile-edit__field"
                  data-testid={testId('profile', 'profile-about-section', 'field', 'bio')}
                >
                  <label
                    className="profile-edit__label"
                    htmlFor={`${fieldId}-bio`}
                    data-testid={testId('profile', 'profile-about-section', 'text', 'bio-label')}
                  >
                    О себе (кратко)
                  </label>
                  <TextArea
                    id={`${fieldId}-bio`}
                    size="l"
                    value={form.bio ?? ''}
                    onUpdate={(v) => updateField('bio', v)}
                    minRows={3}
                    data-testid={testId('profile', 'profile-about-section', 'field', 'bio-input')}
                  />
                </div>

                <div className="profile-edit__contacts">
                  <p className="profile-edit__contacts-title">Личные контакты</p>
                  {canEditContacts ? (
                    <div className="profile-edit__grid">
                      <TextInput
                        label="Телефон"
                        type="tel"
                        size="l"
                        value={form.contacts?.phone ?? ''}
                        onUpdate={(v) => updateContact('phone', v)}
                        data-testid={testId('profile', 'profile-about-section', 'field', 'phone')}
                      />
                      <TextInput
                        label="Email"
                        type="email"
                        size="l"
                        value={form.contacts?.email ?? ''}
                        onUpdate={(v) => updateContact('email', v)}
                        data-testid={testId('profile', 'profile-about-section', 'field', 'email')}
                      />
                      <TextInput
                        label="Telegram"
                        size="l"
                        value={form.contacts?.telegram ?? ''}
                        onUpdate={(v) => updateContact('telegram', v)}
                        data-testid={testId(
                          'profile',
                          'profile-about-section',
                          'field',
                          'telegram',
                        )}
                      />
                      <TextInput
                        label="MAX"
                        size="l"
                        value={form.contacts?.maxMessenger ?? ''}
                        onUpdate={(v) => updateContact('maxMessenger', v)}
                        data-testid={testId('profile', 'profile-about-section', 'field', 'max')}
                      />
                    </div>
                  ) : (
                    <Text
                      color="secondary"
                      data-testid={testId(
                        'profile',
                        'profile-about-section',
                        'text',
                        'contacts-consent',
                      )}
                    >
                      Чтобы хранить и показывать контакты, дайте согласие на обработку персональных
                      данных в «Настройки» (ст. 9 152-ФЗ).
                    </Text>
                  )}
                  <Text
                    color="secondary"
                    className="profile-edit__hint"
                    data-testid={testId(
                      'profile',
                      'profile-about-section',
                      'text',
                      'contacts-hint',
                    )}
                  >
                    <Icon data={CircleInfo} size={14} className="profile-edit__hint-icon" />
                    Видимость каждого контакта настраивается отдельно в «Настройки».
                  </Text>
                </div>
              </section>
            </div>
          </div>
        </Dialog.Body>
        <Dialog.Footer data-testid={testId('profile', 'profile-about-section', 'footer')}>
          {saveError != null && (
            <Text
              color="danger"
              data-testid={testId('profile', 'profile-about-section', 'text', 'save-error')}
            >
              {parseApiErrorMessage(saveError, 'Не удалось сохранить профиль')}
            </Text>
          )}
          <HockeyButton
            view="outlined"
            loading={isVerifying}
            disabled={isSaving}
            onClick={onStartVerification}
            data-testid={testId('profile', 'profile-about-section', 'btn', 'verify')}
          >
            Подтвердить профиль
          </HockeyButton>
          <HockeyButton
            view="outlined"
            disabled={isSaving}
            onClick={handleClose}
            data-testid={testId('profile', 'profile-about-section', 'btn', 'cancel')}
          >
            Отмена
          </HockeyButton>
          <HockeyButton
            view="action"
            loading={isSaving}
            onClick={() => {
              void handleSave()
            }}
            data-testid={testId('profile', 'profile-about-section', 'btn', 'save')}
          >
            Сохранить
          </HockeyButton>
        </Dialog.Footer>
      </Dialog>

      <div className="player-profile-layout__col">
        <section
          id="calendar"
          className="player-profile-layout__full"
          data-testid={testId('profile', 'profile-about-section', 'section', 'calendar')}
        >
          <IceCard
            padding="m"
            data-testid={testId('profile', 'profile-about-section', 'card', 'calendar')}
          >
            <CalendarShell
              title="Мой календарь"
              compact
              titleVariant="header-1"
              forcedScope={{scope: 'player', scopeId: profile.userId}}
              showActions={false}
            />
          </IceCard>
        </section>

        {showHistorySection && (
          <IceCard
            padding="m"
            data-testid={testId('profile', 'profile-about-section', 'card', 'history')}
          >
            <div className="hockey-stack hockey-stack--gap-12">
              <Text
                variant="subheader-2"
                data-testid={testId('profile', 'profile-about-section', 'text', 'history-title')}
              >
                История участия
              </Text>
              <ParticipationHistorySection records={profile.participationHistory} showHistory />
            </div>
          </IceCard>
        )}
      </div>
    </div>
  )
}

function ProfileSettingsSection({
  settings,
  onSave,
  isSaving,
  saveError,
}: {
  settings: ProfileSettings
  onSave: (next: ProfileSettings['notificationPreferences']) => void
  isSaving: boolean
  saveError?: unknown
}) {
  const [form, setForm] = useState(settings.notificationPreferences)

  function updateSwitch(key: keyof ProfileSettings['notificationPreferences'], checked: boolean) {
    setForm((prev) => ({...prev, [key]: checked}))
  }

  return (
    <IceCard
      padding="m"
      className="profile-settings__card"
      data-testid={testId('profile', 'profile-settings-section', 'card')}
    >
      <div className="hockey-stack hockey-stack--gap-16">
        <Text
          variant="header-1"
          data-testid={testId('profile', 'profile-settings-section', 'text', 'title')}
        >
          Настройки уведомлений
        </Text>
        <Text
          color="secondary"
          className="profile-settings__lead"
          data-testid={testId('profile', 'profile-settings-section', 'text', 'hint')}
        >
          Управляйте каналами и типами оповещений об играх, тренировках и событиях вашей команды.
        </Text>
        <div className="profile-settings__rows">
          <label
            className="profile-hub__switch-row"
            data-testid={testId('profile', 'profile-settings-section', 'toggle', 'in-app')}
          >
            <span
              data-testid={testId('profile', 'profile-settings-section', 'text', 'in-app-label')}
            >
              In-app уведомления
            </span>
            <Switch
              checked={form.inApp}
              onUpdate={(v) => updateSwitch('inApp', v)}
              data-testid={testId('profile', 'profile-settings-section', 'toggle', 'in-app-switch')}
            />
          </label>
          <label
            className="profile-hub__switch-row"
            data-testid={testId('profile', 'profile-settings-section', 'toggle', 'email')}
          >
            <span
              data-testid={testId('profile', 'profile-settings-section', 'text', 'email-label')}
            >
              Email уведомления
            </span>
            <Switch
              checked={form.email}
              onUpdate={(v) => updateSwitch('email', v)}
              data-testid={testId('profile', 'profile-settings-section', 'toggle', 'email-switch')}
            />
          </label>
          <label
            className="profile-hub__switch-row"
            data-testid={testId('profile', 'profile-settings-section', 'toggle', 'push')}
          >
            <span data-testid={testId('profile', 'profile-settings-section', 'text', 'push-label')}>
              Push уведомления
            </span>
            <Switch
              checked={form.push}
              onUpdate={(v) => updateSwitch('push', v)}
              data-testid={testId('profile', 'profile-settings-section', 'toggle', 'push-switch')}
            />
          </label>
          <label
            className="profile-hub__switch-row"
            data-testid={testId('profile', 'profile-settings-section', 'toggle', 'max-messenger')}
          >
            <span
              data-testid={testId(
                'profile',
                'profile-settings-section',
                'text',
                'max-messenger-label',
              )}
            >
              Push в MAX
            </span>
            <Switch
              checked={form.maxMessenger}
              onUpdate={(v) => updateSwitch('maxMessenger', v)}
              data-testid={testId(
                'profile',
                'profile-settings-section',
                'toggle',
                'max-messenger-switch',
              )}
            />
          </label>
          <label
            className="profile-hub__switch-row"
            data-testid={testId('profile', 'profile-settings-section', 'toggle', 'team-events')}
          >
            <span
              data-testid={testId(
                'profile',
                'profile-settings-section',
                'text',
                'team-events-label',
              )}
            >
              События команды
            </span>
            <Switch
              checked={form.teamEvents}
              onUpdate={(v) => updateSwitch('teamEvents', v)}
              data-testid={testId(
                'profile',
                'profile-settings-section',
                'toggle',
                'team-events-switch',
              )}
            />
          </label>
          <label
            className="profile-hub__switch-row"
            data-testid={testId('profile', 'profile-settings-section', 'toggle', 'goalkeeper-sos')}
          >
            <span
              data-testid={testId(
                'profile',
                'profile-settings-section',
                'text',
                'goalkeeper-sos-label',
              )}
            >
              Goalkeeper SOS
            </span>
            <Switch
              checked={form.goalkeeperSos}
              onUpdate={(v) => updateSwitch('goalkeeperSos', v)}
              data-testid={testId(
                'profile',
                'profile-settings-section',
                'toggle',
                'goalkeeper-sos-switch',
              )}
            />
          </label>
          <label
            className="profile-hub__switch-row"
            data-testid={testId('profile', 'profile-settings-section', 'toggle', 'event-reminders')}
          >
            <span
              data-testid={testId(
                'profile',
                'profile-settings-section',
                'text',
                'event-reminders-label',
              )}
            >
              Напоминания о событиях
            </span>
            <Switch
              checked={form.eventReminders}
              onUpdate={(v) => updateSwitch('eventReminders', v)}
              data-testid={testId(
                'profile',
                'profile-settings-section',
                'toggle',
                'event-reminders-switch',
              )}
            />
          </label>
        </div>

        {saveError != null && (
          <Text
            color="danger"
            data-testid={testId('profile', 'profile-settings-section', 'text', 'save-error')}
          >
            {parseApiErrorMessage(saveError, 'Не удалось сохранить настройки')}
          </Text>
        )}
        <HockeyButton
          view="action"
          size="l"
          width="max"
          className="profile-hub__save-btn"
          loading={isSaving}
          onClick={() => onSave(form)}
          data-testid={testId('profile', 'profile-settings-section', 'btn', 'save')}
        >
          Сохранить
        </HockeyButton>
      </div>
    </IceCard>
  )
}

function ProfilePrivacySection({
  settings,
  onSave,
  isSaving,
  saveError,
}: {
  settings: ProfileSettings
  onSave: (next: ProfileSettings['privacy']) => void
  isSaving: boolean
  saveError?: unknown
}) {
  const [form, setForm] = useState(() => normalizePrivacySettings(settings.privacy))
  const [privacySource, setPrivacySource] = useState(settings.privacy)

  if (settings.privacy !== privacySource) {
    setPrivacySource(settings.privacy)
    setForm(normalizePrivacySettings(settings.privacy))
  }

  function updateFieldAudience(key: keyof ProfileFieldPrivacy, value: PrivacyAudience) {
    setForm((prev) =>
      normalizePrivacySettings({
        ...prev,
        fields: {...prev.fields, [key]: value},
      }),
    )
  }

  function handleConsent(checked: boolean) {
    setForm((prev) =>
      normalizePrivacySettings({
        ...prev,
        personalDataProcessingConsent: checked,
        personalDataConsentAt: checked
          ? (prev.personalDataConsentAt ?? new Date().toISOString())
          : undefined,
        fields: checked
          ? prev.fields
          : {
              ...prev.fields,
              phone: 'private',
              email: 'private',
              telegram: 'private',
              maxMessenger: 'private',
            },
      }),
    )
  }

  return (
    <>
      <IceCard
        padding="m"
        className="profile-settings__card"
        data-testid={testId('profile', 'profile-privacy-section', 'card')}
      >
        <div className="hockey-stack hockey-stack--gap-16">
          <Text
            variant="header-1"
            data-testid={testId('profile', 'profile-privacy-section', 'text', 'title')}
          >
            Приватность
          </Text>
          <Text
            color="secondary"
            data-testid={testId('profile', 'profile-privacy-section', 'text', 'hint')}
          >
            Управляй видимостью профиля и отдельных полей. Контакты — персональные данные: хранение
            и показ возможны только с согласия (152-ФЗ).
          </Text>

          <div className="profile-hub__privacy-field profile-hub__privacy-field--boxed">
            <span className="profile-hub__privacy-field-label">Видимость профиля</span>
            <Select
              view="clear"
              className="profile-hub__privacy-select profile-hub__privacy-select--accent"
              aria-label="Видимость профиля"
              value={[form.profileVisibility]}
              options={VISIBILITY_OPTIONS}
              onUpdate={(v) =>
                setForm((prev) => ({
                  ...prev,
                  profileVisibility: v[0] as ProfileSettings['privacy']['profileVisibility'],
                }))
              }
              data-testid={testId(
                'profile',
                'profile-privacy-section',
                'select',
                'profile-visibility',
              )}
            />
          </div>

          <div
            className="profile-hub__consent"
            data-testid={testId('profile', 'profile-privacy-section', 'panel', 'consent')}
          >
            <Checkbox
              checked={form.personalDataProcessingConsent}
              onUpdate={handleConsent}
              content={
                <span
                  data-testid={testId(
                    'profile',
                    'profile-privacy-section',
                    'text',
                    'consent-label',
                  )}
                >
                  Согласие на обработку персональных данных для хранения и выборочного отображения
                  контактов (ст. 9 Федерального закона № 152-ФЗ «О персональных данных»)
                </span>
              }
              data-testid={testId('profile', 'profile-privacy-section', 'checkbox', 'pdn-consent')}
            />
            <Text
              color="secondary"
              data-testid={testId('profile', 'profile-privacy-section', 'text', 'consent-hint')}
            >
              Без согласия контакты недоступны для редактирования и скрыты от других пользователей.
              Вы можете отозвать согласие в любой момент — контакты снова станут только вашими.
            </Text>
          </div>

          <div
            className="profile-hub__privacy-group"
            data-testid={testId('profile', 'profile-privacy-section', 'panel', 'fields')}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('profile', 'profile-privacy-section', 'text', 'fields-title')}
            >
              Поля профиля
            </Text>
            <div className="profile-hub__privacy-fields">
              {PROFILE_FIELD_PRIVACY_KEYS.map((key) => (
                <div
                  key={key}
                  className="profile-hub__privacy-field"
                  data-testid={testId(
                    'profile',
                    'profile-privacy-section',
                    'panel',
                    `field-${key}`,
                  )}
                >
                  <span
                    className="profile-hub__privacy-field-label"
                    data-testid={testId(
                      'profile',
                      'profile-privacy-section',
                      'text',
                      `field-${key}-label`,
                    )}
                  >
                    {FIELD_PRIVACY_LABELS[key]}
                  </span>
                  <Select
                    view="clear"
                    className="profile-hub__privacy-select"
                    value={[form.fields[key]]}
                    options={FIELD_PRIVACY_OPTIONS}
                    onUpdate={(v) => updateFieldAudience(key, v[0] as PrivacyAudience)}
                    data-testid={testId(
                      'profile',
                      'profile-privacy-section',
                      'select',
                      `field-${key}`,
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {saveError != null && (
            <Text
              color="danger"
              data-testid={testId('profile', 'profile-privacy-section', 'text', 'save-error')}
            >
              {parseApiErrorMessage(saveError, 'Не удалось сохранить приватность')}
            </Text>
          )}
          <HockeyButton
            view="action"
            size="l"
            width="max"
            className="profile-hub__save-btn"
            loading={isSaving}
            onClick={() => onSave(normalizePrivacySettings(form))}
            data-testid={testId('profile', 'profile-privacy-section', 'btn', 'save')}
          >
            Сохранить
          </HockeyButton>
        </div>
      </IceCard>

      <IceCard
        padding="m"
        className="profile-settings__card"
        data-testid={testId('profile', 'profile-privacy-section', 'card', 'contacts')}
      >
        <div className="hockey-stack hockey-stack--gap-16">
          <div
            className="profile-hub__privacy-group"
            data-testid={testId('profile', 'profile-privacy-section', 'panel', 'contacts')}
          >
            <Text
              variant="header-1"
              data-testid={testId('profile', 'profile-privacy-section', 'text', 'contacts-title')}
            >
              Личные контакты
            </Text>
            <Text
              color="secondary"
              data-testid={testId('profile', 'profile-privacy-section', 'text', 'contacts-hint')}
            >
              Значения контактов задаются в редактировании профиля. Здесь — кому их показывать.
            </Text>
            <div className="profile-hub__privacy-fields">
              {CONTACT_FIELD_PRIVACY_KEYS.map((key) => (
                <div
                  key={key}
                  className="profile-hub__privacy-field"
                  data-testid={testId(
                    'profile',
                    'profile-privacy-section',
                    'panel',
                    `contact-${key}`,
                  )}
                >
                  <span
                    className="profile-hub__privacy-field-label"
                    data-testid={testId(
                      'profile',
                      'profile-privacy-section',
                      'text',
                      `contact-${key}-label`,
                    )}
                  >
                    {FIELD_PRIVACY_LABELS[key]}
                  </span>
                  <Select
                    view="clear"
                    className="profile-hub__privacy-select"
                    value={[form.fields[key]]}
                    options={FIELD_PRIVACY_OPTIONS}
                    disabled={!form.personalDataProcessingConsent}
                    onUpdate={(v) => updateFieldAudience(key, v[0] as PrivacyAudience)}
                    data-testid={testId(
                      'profile',
                      'profile-privacy-section',
                      'select',
                      `contact-${key}`,
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <HockeyButton
            view="action"
            size="l"
            width="max"
            className="profile-hub__save-btn"
            loading={isSaving}
            onClick={() => onSave(normalizePrivacySettings(form))}
            data-testid={testId('profile', 'profile-privacy-section', 'btn', 'save-contacts')}
          >
            Сохранить
          </HockeyButton>
        </div>
      </IceCard>
    </>
  )
}

function ProfileSubscriptionSection({
  settings,
  onSelectPlan,
  onGoToProfile,
  isSaving,
}: {
  settings: ProfileSettings
  onSelectPlan: (subscription: Partial<SubscriptionState>) => void | Promise<unknown>
  onGoToProfile: () => void
  isSaving: boolean
}) {
  const {planId: activePlan} = settings.subscription
  const [draftPlan, setDraftPlan] = useState(activePlan)
  const [view, setView] = useState<SubscriptionView>('plans')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('mir')
  const [paidPlanId, setPaidPlanId] = useState<SubscriptionState['planId'] | null>(null)
  const [planSource, setPlanSource] = useState(activePlan)

  if (activePlan !== planSource) {
    setPlanSource(activePlan)
    if (view === 'plans') setDraftPlan(activePlan)
  }

  const selectedPlan =
    SUBSCRIPTION_PLAN_OPTIONS.find((plan) => plan.id === draftPlan) ?? SUBSCRIPTION_PLAN_OPTIONS[0]
  const totalDue = Math.max(0, selectedPlan.monthPrice - selectedPlan.seasonDiscount)

  async function handleSavePlans() {
    if (draftPlan === 'free') {
      await onSelectPlan({planId: 'free', status: 'mock'})
      return
    }
    setView('checkout')
  }

  async function handlePay() {
    await onSelectPlan({planId: draftPlan, status: 'mock'})
    setPaidPlanId(draftPlan)
    setView('success')
  }

  if (view === 'success') {
    const paid =
      SUBSCRIPTION_PLAN_OPTIONS.find((plan) => plan.id === (paidPlanId ?? draftPlan)) ??
      selectedPlan
    return (
      <IceCard
        padding="m"
        className="profile-subscription profile-subscription--success"
        data-testid={testId('profile', 'profile-subscription-section', 'card', 'success')}
      >
        <div className="profile-subscription__success">
          <span className="profile-subscription__success-icon" aria-hidden>
            <Icon data={ShieldCheck} size={48} />
          </span>
          <Text
            variant="header-1"
            data-testid={testId('profile', 'profile-subscription-section', 'text', 'success-title')}
          >
            Оплата прошла успешно!
          </Text>
          <Text
            color="secondary"
            data-testid={testId('profile', 'profile-subscription-section', 'text', 'success-copy')}
          >
            Тариф {paid.name.toUpperCase()} активирован и готов к использованию.
          </Text>
          <HockeyButton
            view="action"
            size="l"
            width="max"
            className="profile-hub__save-btn"
            onClick={onGoToProfile}
            data-testid={testId(
              'profile',
              'profile-subscription-section',
              'btn',
              'success-profile',
            )}
          >
            Перейти к профилю
          </HockeyButton>
          <HockeyButton
            view="outlined"
            size="l"
            width="max"
            onClick={() => setView('plans')}
            data-testid={testId(
              'profile',
              'profile-subscription-section',
              'btn',
              'success-receipt',
            )}
          >
            Электронный чек
          </HockeyButton>
        </div>
      </IceCard>
    )
  }

  if (view === 'checkout') {
    return (
      <IceCard
        padding="m"
        className="profile-subscription profile-subscription--checkout"
        data-testid={testId('profile', 'profile-subscription-section', 'card', 'checkout')}
      >
        <div className="hockey-stack hockey-stack--gap-12">
          <Text
            variant="header-1"
            data-testid={testId(
              'profile',
              'profile-subscription-section',
              'text',
              'checkout-title',
            )}
          >
            Оформление оплаты
          </Text>
          <p className="profile-subscription__label">Выбранный тариф</p>
          <div
            className="profile-hub__plan is-active"
            data-testid={testId(
              'profile',
              'profile-subscription-section',
              'panel',
              'checkout-plan',
            )}
          >
            <span className="profile-hub__plan-head">
              <Text
                variant="subheader-3"
                className="profile-hub__plan-name"
                data-testid={testId(
                  'profile',
                  'profile-subscription-section',
                  'text',
                  'checkout-plan-name',
                )}
              >
                {selectedPlan.name}
              </Text>
              <span
                className="profile-hub__plan-price"
                data-testid={testId(
                  'profile',
                  'profile-subscription-section',
                  'text',
                  'checkout-plan-price',
                )}
              >
                {formatPlanMonthPrice(selectedPlan.monthPrice)}
              </span>
            </span>
            <Text color="secondary" className="profile-hub__plan-description">
              {selectedPlan.description}
            </Text>
          </div>

          <p className="profile-subscription__label">Способы оплаты</p>
          <div
            className="profile-subscription__methods"
            data-testid={testId('profile', 'profile-subscription-section', 'list', 'methods')}
          >
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                className={`profile-subscription__method${
                  paymentMethod === method.id ? ' is-active' : ''
                }`}
                aria-pressed={paymentMethod === method.id}
                onClick={() => setPaymentMethod(method.id)}
                data-testid={testId(
                  'profile',
                  'profile-subscription-section',
                  'btn',
                  'method',
                  method.id,
                )}
              >
                <Icon data={CreditCard} size={18} className="profile-subscription__billing-icon" />
                <span>{method.label}</span>
              </button>
            ))}
          </div>

          <div
            className="profile-subscription__totals"
            data-testid={testId('profile', 'profile-subscription-section', 'panel', 'totals')}
          >
            <div className="profile-subscription__total-row">
              <span>Стоимость за 1 месяц</span>
              <span>{selectedPlan.monthPrice.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="profile-subscription__total-row profile-subscription__total-row--discount">
              <span>Скидка сезона</span>
              <span>−{selectedPlan.seasonDiscount.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="profile-subscription__total-row profile-subscription__total-row--sum">
              <span>Итого к списанию</span>
              <span>{totalDue.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          <HockeyButton
            view="action"
            size="l"
            width="max"
            className="profile-hub__save-btn"
            loading={isSaving}
            onClick={() => {
              void handlePay()
            }}
            data-testid={testId('profile', 'profile-subscription-section', 'btn', 'pay')}
          >
            Оплатить
          </HockeyButton>
          <HockeyButton
            view="outlined"
            size="l"
            width="max"
            disabled={isSaving}
            onClick={() => setView('plans')}
            data-testid={testId('profile', 'profile-subscription-section', 'btn', 'checkout-back')}
          >
            Назад к тарифам
          </HockeyButton>
        </div>
      </IceCard>
    )
  }

  return (
    <IceCard
      padding="m"
      className="profile-subscription"
      data-testid={testId('profile', 'profile-subscription-section', 'card')}
    >
      <div className="hockey-stack hockey-stack--gap-12">
        <Text
          variant="header-1"
          data-testid={testId('profile', 'profile-subscription-section', 'text', 'title')}
        >
          Модель подписки
        </Text>
        <p className="profile-subscription__label">Тарифные планы</p>
        <div
          className="profile-hub__plans"
          data-testid={testId('profile', 'profile-subscription-section', 'list', 'plans')}
        >
          {SUBSCRIPTION_PLAN_OPTIONS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className={`profile-hub__plan ${draftPlan === plan.id ? 'is-active' : ''}`}
              aria-pressed={draftPlan === plan.id}
              onClick={() => setDraftPlan(plan.id)}
              data-testid={testId(
                'profile',
                'profile-subscription-section',
                'btn',
                'plan',
                plan.id,
              )}
            >
              <span className="profile-hub__plan-head">
                <span className="profile-hub__plan-head-main">
                  <Text
                    variant="subheader-3"
                    className="profile-hub__plan-name"
                    data-testid={testId(
                      'profile',
                      'profile-subscription-section',
                      'text',
                      'plan-name',
                      plan.id,
                    )}
                  >
                    {plan.name}
                  </Text>
                  {activePlan === plan.id && (
                    <span
                      className="hockey-badge hockey-badge--gold"
                      data-testid={testId(
                        'profile',
                        'profile-subscription-section',
                        'badge',
                        'current',
                        plan.id,
                      )}
                    >
                      Текущий
                    </span>
                  )}
                </span>
                <span
                  className="profile-hub__plan-price"
                  data-testid={testId(
                    'profile',
                    'profile-subscription-section',
                    'text',
                    'plan-price',
                    plan.id,
                  )}
                >
                  {formatPlanMonthPrice(plan.monthPrice)}
                </span>
              </span>
              <Text
                color="secondary"
                className="profile-hub__plan-description"
                data-testid={testId(
                  'profile',
                  'profile-subscription-section',
                  'text',
                  'plan-description',
                  plan.id,
                )}
              >
                {plan.description}
              </Text>
            </button>
          ))}
        </div>
        <div
          className="profile-subscription__billing"
          data-testid={testId('profile', 'profile-subscription-section', 'panel', 'billing')}
        >
          <Icon data={CreditCard} size={16} className="profile-subscription__billing-icon" />
          <Text color="secondary" className="profile-subscription__billing-copy">
            Списание 19 числа каждого месяца
          </Text>
          <Text
            className="profile-subscription__billing-card"
            data-testid={testId('profile', 'profile-subscription-section', 'text', 'card-mask')}
          >
            MIR •• 4812
          </Text>
        </div>
        <HockeyButton
          view="action"
          size="l"
          width="max"
          className="profile-hub__save-btn"
          loading={isSaving}
          onClick={() => {
            void handleSavePlans()
          }}
          data-testid={testId('profile', 'profile-subscription-section', 'btn', 'save')}
        >
          Сохранить
        </HockeyButton>
      </div>
    </IceCard>
  )
}

function ProfileSecuritySection() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logoutAllMutation = useMutation({
    mutationFn: logoutAllSessions,
    onSuccess: () => {
      void queryClient.clear()
      navigate('/', {replace: true})
    },
  })

  if (!usesBackendAuth()) return null

  return (
    <IceCard
      padding="m"
      className="profile-settings__card"
      data-testid={testId('profile', 'profile-security-section', 'card')}
    >
      <div className="hockey-stack hockey-stack--gap-16">
        <Text
          variant="header-1"
          data-testid={testId('profile', 'profile-security-section', 'text', 'title')}
        >
          Безопасность
        </Text>
        <Text
          color="secondary"
          data-testid={testId('profile', 'profile-security-section', 'text', 'hint')}
        >
          Завершите все активные сессии на других устройствах. Текущий вход тоже будет сброшен.
        </Text>
        {logoutAllMutation.isError && (
          <Text
            color="danger"
            data-testid={testId('profile', 'profile-security-section', 'text', 'error')}
          >
            {parseApiErrorMessage(logoutAllMutation.error, 'Не удалось выйти из всех сессий')}
          </Text>
        )}
        <HockeyButton
          view="outlined"
          size="l"
          width="max"
          loading={logoutAllMutation.isPending}
          onClick={() => logoutAllMutation.mutate()}
          data-testid={testId('profile', 'profile-security-section', 'btn', 'logout-all')}
        >
          Выйти на всех устройствах
        </HockeyButton>
      </div>
    </IceCard>
  )
}

function HockeyProfileHub({
  profile,
  settings,
}: {
  profile: HockeyProfile
  settings: ProfileSettings
}) {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const detailsPanelId = useId()
  const sectionParam = searchParams.get('section')
  const activeSection = resolveProfileHubSection(sectionParam)

  const selectSection = (value: ProfileHubSection) => {
    setSearchParams(value === 'about' ? {} : {section: value}, {replace: true})
    if (value !== 'about') setDetailsOpen(false)
  }

  const {session} = useSessionAccess()
  const userRoles = session?.user.roles ?? []

  const saveProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated)
      void queryClient.invalidateQueries({queryKey: ['profile']})
      void queryClient.invalidateQueries({queryKey: ['players']})
      void queryClient.invalidateQueries({queryKey: ['player-public']})
    },
  })

  const verifyMutation = useMutation({
    mutationFn: startVerificationRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['profile']})
    },
  })

  const saveNotificationPrefsMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['profile-settings']})
    },
  })

  const savePrivacyMutation = useMutation({
    mutationFn: updatePrivacySettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['profile-settings']})
      void queryClient.invalidateQueries({queryKey: ['player-public']})
      void queryClient.invalidateQueries({queryKey: ['players']})
    },
  })

  const saveSubscriptionMutation = useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['profile-settings']})
    },
  })

  if (sectionParam === 'privacy') {
    return <Navigate to="?section=settings" replace />
  }

  const sectionContent =
    activeSection === 'about' ? (
      <ProfileAboutSection
        profile={profile}
        settings={settings}
        userRoles={userRoles}
        onSaveProfile={async (next) => {
          await saveProfileMutation.mutateAsync(next)
          setDetailsOpen(false)
        }}
        onStartVerification={() => verifyMutation.mutate()}
        onCloseEdit={() => setDetailsOpen(false)}
        isSaving={saveProfileMutation.isPending}
        isVerifying={verifyMutation.isPending}
        saveError={saveProfileMutation.error}
        detailsOpen={detailsOpen}
        detailsPanelId={detailsPanelId}
      />
    ) : activeSection === 'favorites' ? (
      <ProfileFavoritesSection />
    ) : activeSection === 'settings' ? (
      <div
        className="profile-settings"
        data-testid={testId('profile', 'profile-settings-section', 'panel', 'stack')}
      >
        <ProfileSettingsSection
          settings={settings}
          onSave={(next) => saveNotificationPrefsMutation.mutate(next)}
          isSaving={saveNotificationPrefsMutation.isPending}
          saveError={saveNotificationPrefsMutation.error}
        />
        <ProfilePrivacySection
          settings={settings}
          onSave={(next) => savePrivacyMutation.mutate(next)}
          isSaving={savePrivacyMutation.isPending}
          saveError={savePrivacyMutation.error}
        />
        <ProfileSecuritySection />
      </div>
    ) : (
      <ProfileSubscriptionSection
        settings={settings}
        onSelectPlan={(next) => saveSubscriptionMutation.mutateAsync(next)}
        onGoToProfile={() => selectSection('about')}
        isSaving={saveSubscriptionMutation.isPending}
      />
    )

  return (
    <div className="profile-hub" data-testid={testId('profile', 'profile-hub', 'page')}>
      <div
        className="profile-hub__toolbar hockey-segmented"
        data-testid={testId('profile', 'profile-hub', 'panel', 'toolbar')}
      >
        <ProfileHubTabs section={activeSection} onSelect={selectSection} />
        <div
          className="profile-hub__actions"
          data-testid={testId('profile', 'profile-about-section', 'panel', 'owner-actions')}
        >
          <button
            type="button"
            className={`hockey-segmented__item profile-hub__action${detailsOpen ? ' is-active' : ''}`}
            aria-expanded={detailsOpen}
            aria-controls={detailsPanelId}
            onClick={() => {
              if (activeSection !== 'about') selectSection('about')
              setDetailsOpen(true)
            }}
            data-testid={testId('profile', 'profile-about-section', 'btn', 'edit')}
          >
            Редактировать
          </button>
          <Link
            to={`/players/${encodeURIComponent(profile.userId)}`}
            className="hockey-segmented__item profile-hub__action"
            data-testid={testId('profile', 'profile-about-section', 'btn', 'public-view')}
          >
            Публичный вид
          </Link>
        </div>
      </div>
      <div
        className={`profile-hub__panel profile-hub__panel--${activeSection}`}
        data-testid={testId('profile', 'profile-hub', 'panel', activeSection)}
      >
        {sectionContent}
      </div>
    </div>
  )
}

/**
 * @spec SPEC-FR-2.2.1 - Форма создания и редактирования Hockey ID
 * @spec SPEC-FR-2.2.4 - Отображение заполненности профиля
 * @spec SPEC-FR-18.1.1 - Профиль как личный кабинет
 */
export function HockeyProfileForm() {
  const queryClient = useQueryClient()
  const {session, isLoading: isSessionLoading} = useSessionAccess()
  const partnerWorkspace = shouldUsePartnerWorkspace(session)

  const {
    data: profile,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchMyProfile,
    enabled: Boolean(session) && !partnerWorkspace,
  })
  const {
    data: settings,
    isLoading: isSettingsLoading,
    isFetching: isSettingsFetching,
    isError: isSettingsError,
    error: settingsError,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ['profile-settings'],
    queryFn: fetchProfileSettings,
    enabled: Boolean(session) && !partnerWorkspace,
  })

  if (isSessionLoading) {
    return (
      <ScoreboardLoader
        label="Загрузка"
        testIdPrefix="profile"
        data-testid={testId('profile', 'hockey-profile-form', 'loader', 'session')}
      />
    )
  }

  if (session && partnerWorkspace) {
    return <Navigate to={getPrimaryPartnerPath(session)} replace />
  }

  const profileBlocked = isProfileError && !profile && !isProfileFetching
  const settingsBlocked = isSettingsError && !settings && !isSettingsFetching

  if (profileBlocked || settingsBlocked) {
    const detail =
      (profileError instanceof Error && profileError.message) ||
      (settingsError instanceof Error && settingsError.message) ||
      null
    return (
      <IceCard padding="m" data-testid={testId('profile', 'hockey-profile-form', 'card', 'error')}>
        <div className="hockey-stack hockey-stack--gap-12">
          <Text data-testid={testId('profile', 'hockey-profile-form', 'text', 'error')}>
            Не удалось загрузить профиль. Обновите страницу или попробуйте позже.
          </Text>
          {detail && (
            <Text
              color="secondary"
              data-testid={testId('profile', 'hockey-profile-form', 'text', 'error-detail')}
            >
              {detail}
            </Text>
          )}
          <HockeyButton
            view="action"
            size="s"
            onClick={() => {
              void queryClient.resetQueries({queryKey: ['profile']})
              void queryClient.resetQueries({queryKey: ['profile-settings']})
              void refetchProfile()
              void refetchSettings()
            }}
            data-testid={testId('profile', 'hockey-profile-form', 'btn', 'retry')}
          >
            Повторить
          </HockeyButton>
        </div>
      </IceCard>
    )
  }

  if (
    isProfileLoading ||
    isSettingsLoading ||
    (!profile && isProfileFetching) ||
    (!settings && isSettingsFetching) ||
    !profile ||
    !settings
  ) {
    return (
      <ScoreboardLoader
        label="Загрузка профиля"
        testIdPrefix="profile"
        data-testid={testId('profile', 'hockey-profile-form', 'loader', 'profile')}
      />
    )
  }

  return <HockeyProfileHub key={profile.userId} profile={profile} settings={settings} />
}
