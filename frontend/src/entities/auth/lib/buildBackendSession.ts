/**
 * Собирает Session UI из Account + Profile backend API.
 */

import type {ApiAccount} from '@/entities/auth/model/types/backendAuthTypes'
import type {HockeyProfile} from '@/entities/profile'
import type {Session} from '@/entities/user'

export function buildBackendSession(params: {
  account: ApiAccount
  profile: HockeyProfile | null
}): Session {
  const {account, profile} = params
  const displayName = profile?.fullName?.trim() || account.email.split('@')[0] || account.email

  return {
    user: {
      id: account.id,
      displayName,
      roles: profile?.position === 'goalie' ? ['player', 'goalie'] : ['player'],
      avatarUrl: profile?.avatarUrl,
      city: profile?.city ?? '',
      createdAt: account.createdAt,
    },
    isOnboarded: Boolean(profile),
    needsProfile: !profile,
    homePath: '/events',
    allowedPathPrefixes: undefined,
  }
}

export function emptyUnauthenticatedSession(): Session {
  return {
    user: {
      id: '',
      displayName: '',
      roles: ['player'],
      city: '',
      createdAt: '',
    },
    isOnboarded: false,
    needsProfile: false,
  }
}
