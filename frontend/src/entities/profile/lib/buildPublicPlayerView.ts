/**
 * Сборка PublicPlayerView из HockeyProfile + privacy (без mock-слоя).
 */

import {
  canViewProfileByVisibility,
  normalizePrivacySettings,
  redactPlayerForViewer,
  resolveVisibleContacts,
  resolveVisibleFields,
  toHiddenPlayerStub,
} from '@/entities/profile/lib/profilePrivacy'
import {toPlayerListItem} from '@/entities/profile/lib/toPlayerListItem'
import type {
  HockeyProfile,
  ParticipationRecord,
  PlayerListItem,
  PrivacySettings,
  PrivacyViewerRelation,
  PublicPlayerView,
} from '@/entities/profile/model'

function hiddenView(player: PlayerListItem): PublicPlayerView {
  return {
    player: toHiddenPlayerStub(player),
    visibility: 'hidden',
    contactsVisible: false,
    participationHistoryVisible: false,
    calendarVisible: false,
  }
}

export function buildPublicPlayerViewFromProfile(
  profile: HockeyProfile,
  privacyInput: Partial<PrivacySettings> & Pick<PrivacySettings, 'profileVisibility'>,
  viewer: PrivacyViewerRelation = 'public',
  viewerVerified = false,
): PublicPlayerView {
  const player = toPlayerListItem(profile)
  const privacy = normalizePrivacySettings(privacyInput)
  const participationHistory = profile.participationHistory

  if (!canViewProfileByVisibility(privacy.profileVisibility, viewer, viewerVerified)) {
    return hiddenView(player)
  }

  /** «Как видят другие» — всегда как внешний зритель, даже для владельца */
  const fieldViewer = viewer === 'self' ? 'public' : viewer
  const visibleFields = resolveVisibleFields(privacy.fields, fieldViewer)
  const visibleContacts = resolveVisibleContacts(
    player.contacts,
    privacy.fields,
    fieldViewer,
    privacy.personalDataProcessingConsent,
  )
  const visibility =
    viewer === 'self' || privacy.profileVisibility === 'public' ? 'full' : 'limited'

  return {
    player: redactPlayerForViewer(player, visibleFields),
    visibility,
    contactsVisible: Boolean(visibleContacts),
    visibleContacts,
    visibleFields,
    participationHistoryVisible: visibleFields.participationHistory,
    participationHistory: visibleFields.participationHistory
      ? (participationHistory as ParticipationRecord[] | undefined)
      : undefined,
    calendarVisible: visibleFields.calendar,
  }
}
