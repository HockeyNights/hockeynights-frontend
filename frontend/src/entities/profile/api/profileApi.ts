/**
 * SPEC-FR-2.2.1, SPEC-FR-2.2.2, SPEC-FR-2.2.4
 */

import {
  backendCreateProfile,
  backendDeleteAvatar,
  backendFetchMyProfile,
  backendUpdateProfile,
  backendUploadAvatarFromDataUrl,
} from '@/entities/profile/api/backendProfileApi'
import type {
  HockeyProfile,
  NotificationPreferences,
  PrivacySettings,
  ProfileSettings,
  SubscriptionState,
  VerificationStatus,
} from '@/entities/profile/model'
import {apiRequest} from '@/shared/api/client'
import {usesBackendAuth} from '@/shared/config/apiMode'

const BACKEND_DEFAULT_SETTINGS: ProfileSettings = {
  notificationPreferences: {
    inApp: true,
    email: true,
    push: false,
    maxMessenger: false,
    teamEvents: true,
    goalkeeperSos: true,
    eventReminders: true,
  },
  privacy: {
    profileVisibility: 'public',
    showContacts: false,
    showParticipationHistory: true,
    calendarVisibility: 'teams_only',
    fields: {
      birthDate: 'public',
      city: 'public',
      heightWeight: 'public',
      position: 'public',
      skillLevel: 'public',
      teams: 'public',
      bio: 'public',
      achievements: 'public',
      participationHistory: 'public',
      calendar: 'teams_only',
      phone: 'private',
      email: 'private',
      telegram: 'private',
      maxMessenger: 'private',
    },
    personalDataProcessingConsent: false,
  },
  subscription: {
    planId: 'free',
    status: 'mock',
    entitlements: [],
  },
}

/**
 * @spec SPEC-FR-2.2.1 - Получить Hockey ID
 */
export function fetchMyProfile(): Promise<HockeyProfile> {
  if (usesBackendAuth()) {
    return backendFetchMyProfile()
  }
  return apiRequest<HockeyProfile>('/profile/me')
}

/**
 * @spec SPEC-FR-2.2.1 - Обновить Hockey ID
 */
export async function updateMyProfile(profile: Partial<HockeyProfile>): Promise<HockeyProfile> {
  if (usesBackendAuth()) {
    const nextAvatar = profile.avatarUrl
    let updated = await backendUpdateProfile(profile)

    if (nextAvatar === '' || nextAvatar === undefined) {
      if (Object.prototype.hasOwnProperty.call(profile, 'avatarUrl') && !nextAvatar) {
        updated = await backendDeleteAvatar()
      }
    } else if (nextAvatar.startsWith('data:')) {
      updated = await backendUploadAvatarFromDataUrl(nextAvatar)
    }

    return updated
  }
  return apiRequest<HockeyProfile>('/profile/me', {method: 'PUT', body: profile})
}

/** Создание профиля после подтверждения почты (backend). */
export function createMyProfile(profile: Partial<HockeyProfile>): Promise<HockeyProfile> {
  if (usesBackendAuth()) {
    return backendCreateProfile(profile)
  }
  return updateMyProfile(profile)
}

/** @spec SPEC-FR-18.1.1 - Получить настройки личного кабинета */
export function fetchProfileSettings(): Promise<ProfileSettings> {
  if (usesBackendAuth()) {
    return Promise.resolve(BACKEND_DEFAULT_SETTINGS)
  }
  return apiRequest<ProfileSettings>('/profile/settings')
}

/** @spec SPEC-FR-18.1.3 - Обновить каналы уведомлений */
export function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>,
): Promise<ProfileSettings> {
  if (usesBackendAuth()) {
    return Promise.resolve({
      ...BACKEND_DEFAULT_SETTINGS,
      notificationPreferences: {
        ...BACKEND_DEFAULT_SETTINGS.notificationPreferences,
        ...preferences,
      },
    })
  }
  return apiRequest<ProfileSettings>('/profile/notification-preferences', {
    method: 'PATCH',
    body: preferences,
  })
}

/** @spec SPEC-FR-18.1.4 - Обновить приватность профиля */
export function updatePrivacySettings(
  settings: Partial<PrivacySettings>,
): Promise<ProfileSettings> {
  if (usesBackendAuth()) {
    return Promise.resolve({
      ...BACKEND_DEFAULT_SETTINGS,
      privacy: {
        ...BACKEND_DEFAULT_SETTINGS.privacy,
        ...settings,
        fields: {
          ...BACKEND_DEFAULT_SETTINGS.privacy.fields,
          ...(settings.fields ?? {}),
        },
      },
    })
  }
  return apiRequest<ProfileSettings>('/profile/privacy', {method: 'PATCH', body: settings})
}

/** @spec SPEC-FR-19.1.3 - Mock-переключение тарифа подписки */
export function updateSubscription(
  subscription: Partial<SubscriptionState>,
): Promise<ProfileSettings> {
  if (usesBackendAuth()) {
    return Promise.resolve({
      ...BACKEND_DEFAULT_SETTINGS,
      subscription: {...BACKEND_DEFAULT_SETTINGS.subscription, ...subscription},
    })
  }
  return apiRequest<ProfileSettings>('/subscription-intents', {method: 'POST', body: subscription})
}

/** @spec SPEC-FR-17.1.1 - Запустить проверку пользователя */
export function startVerificationRequest(): Promise<{
  requestId: string
  status: VerificationStatus
}> {
  if (usesBackendAuth()) {
    return Promise.resolve({requestId: 'backend-unavailable', status: 'unverified'})
  }
  return apiRequest<{requestId: string; status: VerificationStatus}>('/verification-requests', {
    method: 'POST',
  })
}

/** @spec SPEC-FR-17.1.1 - Обновить статус проверки пользователя */
export function updateVerificationRequest(
  requestId: string,
  status: VerificationStatus,
): Promise<{requestId: string; status: VerificationStatus}> {
  if (usesBackendAuth()) {
    return Promise.resolve({requestId, status})
  }
  return apiRequest<{requestId: string; status: VerificationStatus}>(
    `/verification-requests/${requestId}`,
    {method: 'PATCH', body: {status}},
  )
}
