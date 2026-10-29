/**
 * SPEC-FR-2.3.1, SPEC-FR-2.3.2
 */

import type {PlayerPosition, SkillLevel} from '@/entities/common'
import {backendFetchMyProfile} from '@/entities/profile/api/backendProfileApi'
import {fetchProfileSettings} from '@/entities/profile/api/profileApi'
import {buildPublicPlayerViewFromProfile} from '@/entities/profile/lib/buildPublicPlayerView'
import type {PlayerListItem, PublicPlayerView} from '@/entities/profile/model'
import {ApiError, apiRequest, isNotFoundError} from '@/shared/api/client'
import {hasAuthTokens} from '@/shared/api/tokenStorage'
import {usesBackendAuth} from '@/shared/config/apiMode'

/** @spec SPEC-FR-2.3.2, HOCFRONT-20 - Параметры фильтра игроков */
export interface PlayersFilterParams {
  /** @spec HOCFRONT-20 - Поиск по имени / городу / району */
  q?: string
  /** @spec SPEC-FR-2.3.2 */
  position?: PlayerPosition
  /** @spec SPEC-FR-2.3.2 - Уровень мастерства */
  skillLevel?: SkillLevel
  /** @spec SPEC-FR-2.3.2 */
  district?: string
  /** @spec SPEC-FR-2.3.2 */
  goalieOnly?: boolean
  /** @spec HOCFRONT-20 - Галочка подтверждения профиля */
  verified?: boolean
  /** @spec HOCFRONT-20 - Команда, в которой играет */
  teamId?: string
  /** @spec HOCFRONT-20 - Город */
  city?: string
}

/**
 * @spec SPEC-FR-2.3.1 - Список игроков
 * @spec SPEC-FR-2.3.2, HOCFRONT-20 - Фильтрация по имени, верификации, команде, городу
 */
export function fetchPlayers(filters: PlayersFilterParams = {}): Promise<PlayerListItem[]> {
  const params = new URLSearchParams()
  if (filters.q?.trim()) params.set('q', filters.q.trim())
  if (filters.position) params.set('position', filters.position)
  if (filters.skillLevel) params.set('skillLevel', filters.skillLevel)
  if (filters.district) params.set('district', filters.district)
  if (filters.goalieOnly) params.set('goalieOnly', 'true')
  if (filters.verified) params.set('verified', 'true')
  if (filters.teamId) params.set('teamId', filters.teamId)
  if (filters.city) params.set('city', filters.city)

  const query = params.toString()
  return apiRequest<PlayerListItem[]>(`/players${query ? `?${query}` : ''}`)
}

/**
 * «Как видят другие» для текущего аккаунта: Public API ещё без GET /players/:id,
 * собираем вид из своего /profile + privacy.
 */
async function fetchOwnBackendPublicView(userId: string): Promise<PublicPlayerView | null> {
  if (!hasAuthTokens()) return null
  try {
    const profile = await backendFetchMyProfile()
    if (profile.userId !== userId) return null
    const settings = await fetchProfileSettings()
    return buildPublicPlayerViewFromProfile(profile, settings.privacy, 'public', false)
  } catch (error) {
    if (error instanceof Error && error.message === 'PROFILE_NOT_FOUND') return null
    if (isNotFoundError(error)) return null
    throw error
  }
}

/** @spec SPEC-FR-24.1.3 - Публичный профиль игрока */
export async function fetchPublicPlayer(userId: string): Promise<PublicPlayerView> {
  if (usesBackendAuth()) {
    const ownView = await fetchOwnBackendPublicView(userId)
    if (ownView) return ownView

    try {
      return await apiRequest<PublicPlayerView>(`/players/${userId}`)
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new ApiError('GET', `/players/${userId}`, 404, 'Player not found')
      }
      throw error
    }
  }

  return apiRequest<PublicPlayerView>(`/players/${userId}`)
}
