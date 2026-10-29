/**
 * SPEC-FR-2.3.1, SPEC-FR-2.3.2, SPEC-FR-8.2.1
 * SPEC-FR-24.1.3
 */

import type {
  ParticipationRecord,
  PlayerListItem,
  PrivacySettings,
  PrivacyViewerRelation,
  PublicPlayerView,
} from '@/entities/profile'
import {
  buildPublicPlayerViewFromProfile,
  canViewProfileByVisibility,
  normalizePrivacySettings,
  redactPlayerForViewer,
  resolvePrivacyViewer,
  resolveVisibleFields,
} from '@/entities/profile'

/** @spec SPEC-FR-24.1.3 - Mock приватность публичных профилей */
export const mockPlayerPrivacy: Record<
  string,
  Partial<PrivacySettings> & Pick<PrivacySettings, 'profileVisibility'>
> = {
  'user-002': {
    profileVisibility: 'public',
    showContacts: false,
    showParticipationHistory: true,
    calendarVisibility: 'public',
    personalDataProcessingConsent: false,
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
      calendar: 'public',
      phone: 'private',
      email: 'private',
      telegram: 'private',
      maxMessenger: 'private',
    },
  },
  'user-003': {
    profileVisibility: 'teams_only',
    showContacts: false,
    showParticipationHistory: false,
    calendarVisibility: 'private',
    personalDataProcessingConsent: false,
  },
  'user-008': {
    profileVisibility: 'private',
    showContacts: false,
    showParticipationHistory: false,
    calendarVisibility: 'private',
    personalDataProcessingConsent: false,
  },
  'user-004': {
    profileVisibility: 'public',
    showContacts: true,
    showParticipationHistory: true,
    calendarVisibility: 'teams_only',
    personalDataProcessingConsent: true,
    personalDataConsentAt: '2026-06-01T12:00:00+03:00',
    fields: {
      birthDate: 'public',
      city: 'public',
      heightWeight: 'teams_only',
      position: 'public',
      skillLevel: 'public',
      teams: 'public',
      bio: 'public',
      achievements: 'public',
      participationHistory: 'public',
      calendar: 'teams_only',
      phone: 'public',
      email: 'public',
      telegram: 'teams_only',
      maxMessenger: 'private',
    },
  },
}

const mockParticipationByUser: Record<string, ParticipationRecord[]> = {
  'user-002': [
    {
      eventId: 'event-003',
      eventTitle: 'Прошедшая игра — Вымпел',
      eventDate: '2026-06-01T19:00:00+03:00',
      teamName: 'Медведи САО',
      role: 'goalie',
      confirmed: true,
      eventType: 'game',
      arenaName: 'Ледовый дворец на Ходынке',
      opponent: 'Вымпел',
      result: '2:1',
      durationMinutes: 90,
      note: '22 сейва, 1 пропущенный.',
      chatId: 'chat-2',
    },
  ],
  'user-004': [
    {
      eventId: 'event-001',
      eventTitle: 'Товарищеская игра — Медведи САО',
      eventDate: '2026-06-07T20:00:00+03:00',
      teamName: 'Медведи САО',
      role: 'player',
      confirmed: true,
      eventType: 'game',
      arenaName: 'Ледовый дворец на Ходынке',
      opponent: 'Вымпел',
      result: '3:2',
      durationMinutes: 90,
      chatId: 'chat-2',
    },
  ],
}

function privacyForUser(
  userId: string,
): Partial<PrivacySettings> & Pick<PrivacySettings, 'profileVisibility'> {
  return (
    mockPlayerPrivacy[userId] ?? {
      profileVisibility: 'public',
      showContacts: false,
      showParticipationHistory: false,
      calendarVisibility: 'public',
      personalDataProcessingConsent: false,
    }
  )
}

function buildViewFromPlayer(
  player: PlayerListItem,
  privacyInput: Partial<PrivacySettings> & Pick<PrivacySettings, 'profileVisibility'>,
  participationHistory?: ParticipationRecord[],
  viewer: PrivacyViewerRelation = 'public',
  viewerVerified = false,
): PublicPlayerView {
  return buildPublicPlayerViewFromProfile(
    {...player, participationHistory},
    privacyInput,
    viewer,
    viewerVerified,
  )
}

/** @spec SPEC-FR-24.1.3 - Публичный вид текущего пользователя (Hockey ID /profile/me) */
export {buildPublicPlayerViewFromProfile}

/** @spec SPEC-FR-24.1.3 - Собрать публичное представление игрока */
export function buildPublicPlayerView(
  userId: string,
  viewer: PrivacyViewerRelation = 'public',
  viewerVerified = false,
): PublicPlayerView | null {
  const player = mockPlayers.find((p) => p.userId === userId)
  if (!player) return null

  return buildViewFromPlayer(
    player,
    privacyForUser(userId),
    mockParticipationByUser[userId],
    viewer,
    viewerVerified,
  )
}

export interface PlayerViewerContext {
  userId?: string
  teamIds?: string[]
  verified: boolean
}

/** Каталог: только профили, которые зритель имеет право видеть, с редакцией полей. */
export function listPlayersForViewer(context: PlayerViewerContext): PlayerListItem[] {
  return mockPlayers.flatMap((player) => {
    const privacy = normalizePrivacySettings(privacyForUser(player.userId))
    const viewer = resolvePrivacyViewer(
      player.userId,
      context.userId,
      player.teamIds,
      context.teamIds,
    )
    if (!canViewProfileByVisibility(privacy.profileVisibility, viewer, context.verified)) {
      return []
    }
    const fieldViewer = viewer === 'self' ? 'public' : viewer
    return [redactPlayerForViewer(player, resolveVisibleFields(privacy.fields, fieldViewer))]
  })
}

/** @spec SPEC-FR-2.3.1 - Mock список игроков */
export const mockPlayers: PlayerListItem[] = [
  {
    userId: 'user-002',
    displayName: 'Смирнов Алексей Дмитриевич',
    fullName: 'Смирнов Алексей Дмитриевич',
    city: 'Москва',
    district: 'СЗАО',
    metro: 'Сокол',
    position: 'goalie',
    skillLevel: 'practitioner',
    stickHand: 'unknown',
    playerIndex: 8,
    birthDate: '1990-03-12',
    heightCm: 188,
    weightKg: 90,
    availability: ['weekday_evening'],
    profileCompleteness: 90,
    karmaScore: 88,
    goalieReliabilityScore: 92,
    achievements: ['Надёжный вратарь', 'SOS-выручка сезона'],
    avatarUrl: 'https://placehold.co/400x560/0d253f/ffffff?text=%D0%A1%D0%90',
    verificationStatus: 'verified',
    teamName: 'Медведи САО',
    teamLogoUrl: 'https://placehold.co/64x64/0d253f/ffffff?text=СЮ',
    teamIds: ['team-002'],
  },
  {
    userId: 'user-003',
    displayName: 'Козлов Дмитрий Александрович',
    fullName: 'Козлов Дмитрий Александрович',
    city: 'Москва',
    district: 'ЮАО',
    metro: 'Коломенская',
    position: 'defense',
    skillLevel: 'novice_theorist',
    stickHand: 'right',
    playerIndex: 5,
    birthDate: '1988-07-04',
    heightCm: 182,
    weightKg: 86,
    availability: ['sunday_morning'],
    profileCompleteness: 65,
    karmaScore: 71,
    avatarUrl: 'https://placehold.co/400x560/1a2f4a/ffffff?text=%D0%9A%D0%94',
    verificationStatus: 'verified',
    teamName: 'Медведи САО',
    teamLogoUrl: 'https://placehold.co/64x64/1a2f4a/ffffff?text=МС',
    teamIds: ['team-001', 'team-002'],
  },
  {
    userId: 'user-004',
    displayName: 'Волков Сергей Николаевич',
    fullName: 'Волков Сергей Николаевич',
    city: 'Москва',
    district: 'САО',
    metro: 'ЦСКА',
    position: 'forward',
    skillLevel: 'amateur',
    stickHand: 'left',
    playerIndex: 4,
    birthDate: '1995-01-22',
    heightCm: 178,
    weightKg: 80,
    availability: ['weekday_evening', 'sunday_morning'],
    profileCompleteness: 55,
    karmaScore: 62,
    avatarUrl: 'https://placehold.co/400x560/122a45/ffffff?text=%D0%92%D0%A1',
    verificationStatus: 'unverified',
    teamName: 'Медведи САО',
    teamLogoUrl: 'https://placehold.co/64x64/1a2f4a/ffffff?text=МС',
    teamIds: ['team-001', 'team-003'],
    contacts: {
      phone: '+7 (916) 000-00-04',
      email: 'volkov@example.ru',
      telegram: '@volkov_hockey',
      maxMessenger: 'volkov.max',
    },
  },
  {
    userId: 'user-005',
    displayName: 'Орлов Михаил Викторович',
    fullName: 'Орлов Михаил Викторович',
    city: 'Москва',
    district: 'САО',
    metro: 'Динамо',
    position: 'defense',
    skillLevel: 'confident_theorist',
    stickHand: 'left',
    playerIndex: 7,
    birthDate: '1987-09-30',
    heightCm: 184,
    weightKg: 88,
    availability: ['weekday_evening'],
    profileCompleteness: 80,
    karmaScore: 79,
    avatarUrl: 'https://placehold.co/400x560/163a5c/ffffff?text=%D0%9E%D0%9C',
    verificationStatus: 'pending',
    teamName: 'Медведи САО',
    teamLogoUrl: 'https://placehold.co/64x64/1a2f4a/ffffff?text=МС',
    teamIds: ['team-001'],
  },
  {
    userId: 'user-001',
    displayName: 'Петров Иван Сергеевич',
    fullName: 'Петров Иван Сергеевич',
    city: 'Москва',
    district: 'САО',
    metro: 'Динамо',
    position: 'forward',
    skillLevel: 'theorist',
    stickHand: 'right',
    playerIndex: 6,
    birthDate: '1981-11-19',
    heightCm: 185,
    weightKg: 92,
    availability: ['weekday_evening'],
    profileCompleteness: 85,
    karmaScore: 84,
    achievements: ['10 игр подряд без пропусков', '3 SOS-выручки', '5 отзывов без no-show'],
    avatarUrl: 'https://placehold.co/400x560/1c3d5a/ffffff?text=%D0%9F%D0%98',
    verificationStatus: 'verified',
    teamName: 'Медведи САО',
    teamLogoUrl: 'https://placehold.co/64x64/1a2f4a/ffffff?text=МС',
    teamIds: ['team-001'],
    contacts: {
      phone: '+7 (999) 123-45-67',
      email: 'ivan.petrov@example.ru',
      telegram: '@petrov_hockey',
      maxMessenger: 'petrov.max',
    },
  },
  {
    userId: 'user-006',
    displayName: 'Белов Артём Игоревич',
    fullName: 'Белов Артём Игоревич',
    city: 'Москва',
    district: 'ВАО',
    metro: 'Измайлово',
    position: 'forward',
    skillLevel: 'novice_theorist',
    stickHand: 'left',
    playerIndex: 5,
    birthDate: '1992-05-18',
    heightCm: 180,
    weightKg: 84,
    availability: ['weekday_evening', 'sunday_morning'],
    profileCompleteness: 70,
    karmaScore: 68,
    avatarUrl: 'https://placehold.co/400x560/1a334d/ffffff?text=%D0%91%D0%90',
    verificationStatus: 'verified',
    teamName: 'Медведи САО',
    teamLogoUrl: 'https://placehold.co/64x64/122a45/ffffff?text=Б',
    teamIds: ['team-002'],
  },
  {
    userId: 'user-007',
    displayName: 'Новиков Павел Андреевич',
    fullName: 'Новиков Павел Андреевич',
    city: 'Москва',
    district: 'ЮЗАО',
    metro: 'Юго-Западная',
    position: 'goalie',
    skillLevel: 'beginner',
    stickHand: 'unknown',
    playerIndex: 3,
    birthDate: '1998-12-01',
    heightCm: 176,
    weightKg: 78,
    availability: ['sunday_morning'],
    profileCompleteness: 48,
    karmaScore: 55,
    goalieReliabilityScore: 61,
    avatarUrl: 'https://placehold.co/400x560/0f2a40/ffffff?text=%D0%9D%D0%9F',
    verificationStatus: 'unverified',
  },
  {
    userId: 'user-008',
    displayName: 'Соколов Кирилл Павлович',
    fullName: 'Соколов Кирилл Павлович',
    city: 'Казань',
    district: 'Центр',
    metro: undefined,
    position: 'defense',
    skillLevel: 'master',
    stickHand: 'right',
    playerIndex: 9,
    birthDate: '1985-02-14',
    heightCm: 190,
    weightKg: 95,
    availability: ['weekday_evening'],
    profileCompleteness: 76,
    karmaScore: 73,
    avatarUrl: 'https://placehold.co/400x560/163248/ffffff?text=%D0%A1%D0%9A',
    verificationStatus: 'verified',
  },
  {
    userId: 'user-009',
    displayName: 'Лебедев Артур Олегович',
    fullName: 'Лебедев Артур Олегович',
    city: 'Санкт-Петербург',
    district: 'Приморский',
    metro: 'Пионерская',
    position: 'forward',
    skillLevel: 'theorist',
    stickHand: 'right',
    playerIndex: 6,
    birthDate: '1993-08-08',
    heightCm: 181,
    weightKg: 83,
    availability: ['weekday_evening'],
    profileCompleteness: 72,
    karmaScore: 80,
    avatarUrl: 'https://placehold.co/400x560/1a3a52/ffffff?text=%D0%9B%D0%90',
    verificationStatus: 'verified',
  },
]
