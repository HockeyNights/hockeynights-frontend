/**
 * Маппинг профиля OpenAPI ↔ HockeyProfile UI.
 */

import type {PlayerPosition, SkillLevel} from '@/entities/common'
import type {
  ApiCreateProfileRequest,
  ApiPlayerPositionValue,
  ApiProfile,
  ApiStickGripValue,
  ApiUpdateProfileRequest,
} from '@/entities/profile/model/types/backendProfileTypes'
import {ApiPlayerPosition, ApiStickGrip} from '@/entities/profile/model/types/backendProfileTypes'
import type {HockeyProfile} from '@/entities/profile/model/types/profileTypes'
import {
  clampPlayerIndex,
  playerIndexFromSkillLevel,
  skillLevelFromPlayerIndex,
} from '@/shared/lib/profileIdentity'

function joinName(parts: Array<string | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
}

function splitFullName(fullName: string): {
  firstName: string
  lastName: string
  middleName?: string
} {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return {firstName: '', lastName: ''}
  if (tokens.length === 1) return {firstName: tokens[0], lastName: ''}
  if (tokens.length === 2) return {firstName: tokens[0], lastName: tokens[1]}
  return {
    lastName: tokens[0],
    firstName: tokens[1],
    middleName: tokens.slice(2).join(' '),
  }
}

export function mapApiPositionToUi(value?: ApiPlayerPositionValue): PlayerPosition {
  switch (value) {
    case ApiPlayerPosition.DEFENSE:
      return 'defense'
    case ApiPlayerPosition.GOALIE:
      return 'goalie'
    case ApiPlayerPosition.FORWARD:
      return 'forward'
    default:
      return 'forward'
  }
}

export function mapUiPositionToApi(value?: PlayerPosition): ApiPlayerPositionValue {
  switch (value) {
    case 'defense':
      return ApiPlayerPosition.DEFENSE
    case 'goalie':
      return ApiPlayerPosition.GOALIE
    case 'forward':
      return ApiPlayerPosition.FORWARD
    default:
      return ApiPlayerPosition.UNSPECIFIED
  }
}

export function mapApiGripToUi(value?: ApiStickGripValue): HockeyProfile['stickHand'] {
  switch (value) {
    case ApiStickGrip.LEFT:
      return 'left'
    case ApiStickGrip.RIGHT:
      return 'right'
    default:
      return 'unknown'
  }
}

export function mapUiGripToApi(value?: HockeyProfile['stickHand']): ApiStickGripValue {
  switch (value) {
    case 'left':
      return ApiStickGrip.LEFT
    case 'right':
      return ApiStickGrip.RIGHT
    default:
      return ApiStickGrip.UNSPECIFIED
  }
}

function mapLevelToSkill(level?: string, skillIndex?: number): SkillLevel {
  if (skillIndex != null && Number.isFinite(skillIndex)) {
    return skillLevelFromPlayerIndex(clampPlayerIndex(skillIndex))
  }
  const normalized = (level ?? '').trim().toLowerCase()
  const known: SkillLevel[] = [
    'beginner',
    'amateur',
    'novice_theorist',
    'theorist',
    'confident_theorist',
    'practitioner',
    'master',
    'advanced',
    'league',
    'unknown',
  ]
  if ((known as string[]).includes(normalized)) {
    return normalized as SkillLevel
  }
  return 'amateur'
}

export function mapApiProfileToHockey(profile: ApiProfile): HockeyProfile {
  const fullName = joinName([profile.lastName, profile.firstName, profile.middleName])
  const playerIndex =
    profile.skillIndex != null
      ? clampPlayerIndex(profile.skillIndex)
      : playerIndexFromSkillLevel(mapLevelToSkill(profile.level))
  const skillLevel = mapLevelToSkill(profile.level, playerIndex)

  return {
    userId: profile.userId,
    fullName: fullName || 'Игрок',
    avatarUrl: profile.avatarUrl || undefined,
    city: profile.city?.trim() || '',
    position: mapApiPositionToUi(profile.position),
    skillLevel,
    stickHand: mapApiGripToUi(profile.grip),
    birthDate: profile.birthDate || undefined,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    playerIndex,
    availability: [],
    profileCompleteness: estimateCompleteness(profile),
    karmaScore: 0,
  }
}

function estimateCompleteness(profile: ApiProfile): number {
  const checks = [
    Boolean(profile.firstName?.trim()),
    Boolean(profile.lastName?.trim()),
    Boolean(profile.city?.trim()),
    Boolean(profile.birthDate),
    Boolean(profile.position && profile.position !== ApiPlayerPosition.UNSPECIFIED),
    Boolean(profile.grip && profile.grip !== ApiStickGrip.UNSPECIFIED),
    Boolean(profile.heightCm),
    Boolean(profile.weightKg),
    Boolean(profile.level || profile.skillIndex),
    Boolean(profile.avatarUrl),
  ]
  const filled = checks.filter(Boolean).length
  return Math.round((filled / checks.length) * 100)
}

export function mapHockeyToApiProfile(
  profile: Partial<HockeyProfile>,
): ApiCreateProfileRequest & ApiUpdateProfileRequest {
  const name = splitFullName(profile.fullName ?? '')
  const playerIndex =
    profile.playerIndex != null
      ? clampPlayerIndex(profile.playerIndex)
      : profile.skillLevel
        ? playerIndexFromSkillLevel(profile.skillLevel)
        : undefined

  return {
    firstName: name.firstName || undefined,
    lastName: name.lastName || undefined,
    middleName: name.middleName,
    birthDate: profile.birthDate || undefined,
    city: profile.city?.trim() || undefined,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    position: mapUiPositionToApi(profile.position),
    grip: mapUiGripToApi(profile.stickHand),
    level: profile.skillLevel,
    skillIndex: playerIndex,
  }
}

export function emptyHockeyProfile(userId: string, seedName = ''): HockeyProfile {
  return {
    userId,
    fullName: seedName,
    city: '',
    position: 'forward',
    skillLevel: 'amateur',
    stickHand: 'unknown',
    playerIndex: 4,
    availability: [],
    profileCompleteness: 0,
    karmaScore: 0,
  }
}
