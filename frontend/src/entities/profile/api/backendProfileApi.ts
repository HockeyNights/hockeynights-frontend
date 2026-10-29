/**
 * ProfileService — реальные REST-эндпоинты Public API.
 */

import {mapApiProfileToHockey, mapHockeyToApiProfile} from '@/entities/profile/lib/profileMappers'
import type {
  ApiProfile,
  ApiRequestAvatarUploadResponse,
} from '@/entities/profile/model/types/backendProfileTypes'
import type {HockeyProfile} from '@/entities/profile/model/types/profileTypes'
import {bypassMsw} from '@/shared/api/bypassMsw'
import {ApiError, authApiRequest, isNotFoundError} from '@/shared/api/client'
import {parseApiErrorMessage} from '@/shared/api/parseApiError'

function wrap<T>(promise: Promise<T>, fallback: string): Promise<T> {
  return promise.catch((error) => {
    throw new Error(parseApiErrorMessage(error, fallback), {cause: error})
  })
}

export async function backendFetchMyProfile(): Promise<HockeyProfile> {
  try {
    const profile = await authApiRequest<ApiProfile>('/profile')
    return mapApiProfileToHockey(profile)
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error('PROFILE_NOT_FOUND', {cause: error})
    }
    throw new Error(parseApiErrorMessage(error, 'Не удалось загрузить профиль'), {cause: error})
  }
}

export async function backendCreateProfile(
  payload: Partial<HockeyProfile>,
): Promise<HockeyProfile> {
  const body = mapHockeyToApiProfile(payload)
  const profile = await wrap(
    authApiRequest<ApiProfile>('/profile', {method: 'POST', body}),
    'Не удалось создать профиль',
  )
  return mapApiProfileToHockey(profile)
}

export async function backendUpdateProfile(
  payload: Partial<HockeyProfile>,
): Promise<HockeyProfile> {
  const body = mapHockeyToApiProfile(payload)
  const profile = await wrap(
    authApiRequest<ApiProfile>('/profile', {method: 'PUT', body}),
    'Не удалось обновить профиль',
  )
  return mapApiProfileToHockey(profile)
}

export async function backendRequestAvatarUpload(): Promise<ApiRequestAvatarUploadResponse> {
  return wrap(
    authApiRequest<ApiRequestAvatarUploadResponse>('/profile/avatar:upload', {
      method: 'POST',
      body: {},
    }),
    'Не удалось получить ссылку для загрузки аватара',
  )
}

export async function backendSetAvatar(key: string): Promise<HockeyProfile> {
  const profile = await wrap(
    authApiRequest<ApiProfile>('/profile/avatar', {method: 'PUT', body: {key}}),
    'Не удалось сохранить аватар',
  )
  return mapApiProfileToHockey(profile)
}

export async function backendDeleteAvatar(): Promise<HockeyProfile> {
  const profile = await wrap(
    authApiRequest<ApiProfile>('/profile/avatar', {method: 'DELETE'}),
    'Не удалось удалить аватар',
  )
  return mapApiProfileToHockey(profile)
}

/** data URL → Blob для PUT на presigned URL */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

/**
 * Полный цикл: presigned upload → PUT файла → confirm key.
 */
export async function backendUploadAvatarFromDataUrl(dataUrl: string): Promise<HockeyProfile> {
  const {uploadUrl, key} = await backendRequestAvatarUpload()
  const blob = await dataUrlToBlob(dataUrl)
  const putResponse = await fetch(bypassMsw(uploadUrl), {
    method: 'PUT',
    headers: {
      'Content-Type': blob.type || 'image/jpeg',
    },
    body: blob,
  })
  if (!putResponse.ok) {
    throw new ApiError('PUT', '/profile/avatar:upload', putResponse.status, 'upload failed')
  }
  return backendSetAvatar(key)
}
