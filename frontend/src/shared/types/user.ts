/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-2.1.3, SPEC-FR-1.3.1 - SPEC-FR-1.3.5
 */

import type {UserRole} from '@/shared/types/common'

/** @spec SPEC-FR-1.3.7, SPEC-FR-1.3.9 - Привязка к партнёрской сущности */
export interface PartnerMembership {
  kind: 'league' | 'shop' | 'club' | 'arena'
  entityId: string
  entityName: string
  isPrimary?: boolean
}

/** @spec SPEC-FR-2.1.1 - Пользователь mock-сессии */
export interface User {
  /** @spec SPEC-FR-2.1.1 */
  id: string
  /** @spec SPEC-FR-2.1.1 */
  displayName: string
  /** @spec SPEC-FR-2.1.2 */
  roles: UserRole[]
  /** @spec SPEC-FR-2.3.1 */
  avatarUrl?: string
  /** @spec SPEC-FR-1.2.4 */
  city: string
  /** @spec SPEC-FR-12.1.2 */
  createdAt: string
  /** @spec SPEC-FR-1.3.7, SPEC-FR-1.3.9 */
  partnerMemberships?: PartnerMembership[]
}

/** @spec SPEC-FR-2.1.1 - Текущая сессия */
export interface Session {
  /** @spec SPEC-FR-2.1.1 */
  user: User
  /** @spec SPEC-FR-2.1.3 */
  isOnboarded: boolean
  /** @spec SPEC-FR-25.1.2 - Выбранная демо-роль */
  personaId?: string
  /** @spec SPEC-FR-25.1.2 - Домашний экран после выбора роли */
  homePath?: string
  /** @spec SPEC-FR-25.1.2 - Разрешённые маршруты текущей роли */
  allowedPathPrefixes?: string[]
  /**
   * Backend: аккаунт есть, Hockey ID ещё не создан (POST /v1/profile).
   * Auth-флоу показывает форму создания профиля.
   */
  needsProfile?: boolean
}

/** @spec SPEC-FR-2.1.2 - Payload onboarding */
export interface OnboardingPayload {
  /** @spec SPEC-FR-2.1.2 */
  displayName: string
  /** @spec SPEC-FR-2.1.2 */
  roles: UserRole[]
  /** @spec SPEC-FR-1.3.7, SPEC-FR-1.3.9 */
  partnerMemberships?: PartnerMembership[]
}
