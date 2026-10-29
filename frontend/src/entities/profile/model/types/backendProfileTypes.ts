/**
 * Контракты публичного API ProfileService (OpenAPI HockeyNights).
 */

/** protobuf enum PlayerPosition */
export const ApiPlayerPosition = {
  UNSPECIFIED: 0,
  FORWARD: 1,
  DEFENSE: 2,
  GOALIE: 3,
} as const

export type ApiPlayerPositionValue = (typeof ApiPlayerPosition)[keyof typeof ApiPlayerPosition]

/** protobuf enum StickGrip */
export const ApiStickGrip = {
  UNSPECIFIED: 0,
  LEFT: 1,
  RIGHT: 2,
} as const

export type ApiStickGripValue = (typeof ApiStickGrip)[keyof typeof ApiStickGrip]

export interface ApiProfile {
  userId: string
  firstName?: string
  lastName?: string
  middleName?: string
  birthDate?: string
  city?: string
  heightCm?: number
  weightKg?: number
  position?: ApiPlayerPositionValue
  grip?: ApiStickGripValue
  level?: string
  skillIndex?: number
  avatarUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface ApiCreateProfileRequest {
  firstName?: string
  lastName?: string
  middleName?: string
  birthDate?: string
  city?: string
  heightCm?: number
  weightKg?: number
  position?: ApiPlayerPositionValue
  grip?: ApiStickGripValue
  level?: string
  skillIndex?: number
}

export type ApiUpdateProfileRequest = ApiCreateProfileRequest

export interface ApiRequestAvatarUploadResponse {
  uploadUrl: string
  key: string
  expiresAt: string
}

export interface ApiSetAvatarRequest {
  key: string
}
