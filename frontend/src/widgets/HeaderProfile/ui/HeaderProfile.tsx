/**
 * SPEC-FR-18.1.1, SPEC-UI-5.1
 * HOCFRONT-30 — профиль в правом углу top bar: аватар с Lottie-кольцом + меню сессии.
 */

import {Eye, Person} from '@gravity-ui/icons'
import {DropdownMenu, type DropdownMenuItem, Icon} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import type {LottieRefCurrentProps} from 'lottie-react'
import {useLottie} from 'lottie-react'
import {useEffect, useMemo, useRef, useState} from 'react'
import {useNavigate} from 'react-router'

import {fetchMyProfile, fetchProfileSettings} from '@/entities/profile'
import {getPrimaryPartnerPath, shouldUsePartnerWorkspace, useSessionAccess} from '@/features/access'
import {POSITION_LABELS} from '@/features/events'
import profileRingAnimation from '@/shared/assets/lottie/profile-ring.json'
import {routes} from '@/shared/const/appRoutes'
import {getPlayerLevelLabel, getProfileInitials} from '@/shared/lib/profileIdentity'
import {usePrefersReducedMotion} from '@/shared/lib/usePrefersReducedMotion'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface HeaderProfileProps {
  /** Пункты сессии из AppShell (сменить роль, фокус-режим, выход) */
  sessionMenuItems?: (DropdownMenuItem | DropdownMenuItem[])[]
}

/**
 * @spec SPEC-FR-18.1.1 - Быстрый доступ к личному кабинету
 * @spec SPEC-UI-5.1 - Header-блок профиля в правом углу
 */
export function HeaderProfile({sessionMenuItems = []}: HeaderProfileProps) {
  const navigate = useNavigate()
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const introPlayedRef = useRef(false)
  const hoveredRef = useRef(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)

  const {session} = useSessionAccess()
  const partnerWorkspace = shouldUsePartnerWorkspace(session)

  const {data: profile} = useQuery({
    queryKey: ['profile'],
    queryFn: fetchMyProfile,
    enabled: Boolean(session) && !partnerWorkspace,
  })
  /** Держим settings тёплыми: иначе при уходе с /profile на событие query сбрасывается и ломает возврат. */
  useQuery({
    queryKey: ['profile-settings'],
    queryFn: fetchProfileSettings,
    enabled: Boolean(session) && !partnerWorkspace,
  })

  const {View, animationItem} = useLottie(
    {
      animationData: profileRingAnimation,
      loop: true,
      autoplay: false,
      lottieRef,
    },
    {width: 44, height: 44},
  )

  /** Один приветственный цикл после загрузки; дальше — hover/фокус или открытое меню. */
  useEffect(() => {
    if (!animationItem) return
    if (prefersReducedMotion) {
      animationItem.goToAndStop(0, true)
      return
    }
    if (menuOpen) {
      animationItem.goToAndPlay(0, true)
      return
    }
    if (introPlayedRef.current) {
      animationItem.goToAndStop(0, true)
      return
    }
    introPlayedRef.current = true
    animationItem.goToAndPlay(0, true)
    const introMs = (animationItem.getDuration(false) || 3) * 1000
    const timer = window.setTimeout(() => {
      if (hoveredRef.current) return
      animationItem.goToAndStop(0, true)
    }, introMs)
    return () => window.clearTimeout(timer)
  }, [animationItem, menuOpen, prefersReducedMotion])

  const fullName = session?.user.displayName?.trim() || profile?.fullName?.trim() || ''
  const profileHref = partnerWorkspace && session ? getPrimaryPartnerPath(session) : routes.profile
  const meta = partnerWorkspace
    ? 'Кабинет партнёра'
    : profile
      ? `${POSITION_LABELS[profile.position]} · ${getPlayerLevelLabel(profile)}`
      : (session?.user.city ?? '')

  /** Предпочитаем id из Hockey ID — он совпадает с /players/:userId */
  const publicUserId = profile?.userId || session?.user.id
  const menuItems = useMemo(() => {
    const openProfile = () => {
      setMenuOpen(false)
      navigate(profileHref)
    }
    const openPublicView = () => {
      if (!publicUserId) return
      setMenuOpen(false)
      navigate(`${routes.players}/${encodeURIComponent(publicUserId)}`)
    }

    const profileGroup: DropdownMenuItem[] = [
      {
        text: partnerWorkspace ? 'Кабинет партнёра' : 'Мой профиль',
        iconStart: <Icon data={Person} size={16} />,
        action: openProfile,
        qa: testId('app', 'header-profile', 'btn', 'open'),
      },
    ]
    if (!partnerWorkspace && publicUserId) {
      profileGroup.push({
        text: 'Как видят другие',
        iconStart: <Icon data={Eye} size={16} />,
        action: openPublicView,
        qa: testId('app', 'header-profile', 'btn', 'public-view'),
      })
    }
    return [profileGroup, ...sessionMenuItems]
  }, [navigate, partnerWorkspace, profileHref, publicUserId, sessionMenuItems])

  if (!session) return null

  const playRing = () => {
    hoveredRef.current = true
    if (prefersReducedMotion || !animationItem) return
    animationItem.goToAndPlay(0, true)
  }

  const stopRing = () => {
    hoveredRef.current = false
    if (menuOpen || !animationItem) return
    animationItem.goToAndStop(0, true)
  }

  return (
    <div className="app-shell__profile" data-testid={testId('app', 'header-profile', 'panel')}>
      <span className="app-shell__profile-text">
        <span
          className="app-shell__profile-name"
          data-testid={testId('app', 'header-profile', 'text', 'name')}
        >
          {fullName}
        </span>
        {meta && (
          <span
            className="app-shell__profile-meta"
            data-testid={testId('app', 'header-profile', 'text', 'meta')}
          >
            {meta}
          </span>
        )}
      </span>
      <DropdownMenu
        size="s"
        open={menuOpen}
        onOpenToggle={() => setMenuOpen((prev) => !prev)}
        popupProps={{placement: 'bottom-end'}}
        renderSwitcher={(props) => (
          <HockeyButton
            {...props}
            className="app-shell__profile-switcher"
            view="flat"
            size="l"
            aria-label={fullName ? `Профиль: ${fullName}` : 'Профиль'}
            title={fullName || 'Профиль'}
            onMouseEnter={playRing}
            onMouseLeave={stopRing}
            onFocus={playRing}
            onBlur={stopRing}
            data-testid={testId('app', 'header-profile', 'btn', 'menu')}
          >
            <span className="app-shell__profile-avatar">
              <span className="app-shell__profile-ring" aria-hidden>
                {View}
              </span>
              {profile?.avatarUrl ? (
                <img
                  className="app-shell__profile-photo"
                  src={profile.avatarUrl}
                  alt=""
                  data-testid={testId('app', 'header-profile', 'img', 'avatar')}
                />
              ) : (
                <span
                  className="app-shell__profile-initials"
                  data-testid={testId('app', 'header-profile', 'icon', 'avatar')}
                >
                  {getProfileInitials(fullName)}
                </span>
              )}
            </span>
          </HockeyButton>
        )}
        items={menuItems}
      />
    </div>
  )
}
