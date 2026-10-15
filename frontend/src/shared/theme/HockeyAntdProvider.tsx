/**
 * Ant Design-тема под экраны Figma (hockey, file eTRV7SeZP6M9bJHvfupv2b).
 * Тёмная: фон #080e1b / карточки #131b2d / контролы #151e32.
 * Светлая: фон и карточки #f8fafc / рамки #e2e8f0. Акцент общий — #ffb703.
 */

import {ConfigProvider, theme as antdTheme} from 'antd'
import ruRU from 'antd/locale/ru_RU'
import type {ReactNode} from 'react'

import {useHockeyTheme} from '@/shared/theme/HockeyThemeProvider'

export interface HockeyAntdProviderProps {
  children: ReactNode
}

const GOLD = '#ffb703'
const INK = '#0f172a'

const DARK = {
  bg: '#080e1b',
  card: '#131b2d',
  raised: '#151e32',
  line: '#1e293b',
  text: '#f5f7fb',
  muted: '#94a3b8',
}

const LIGHT = {
  bg: '#f8fafc',
  card: '#f8fafc',
  raised: '#f8fafc',
  line: '#e2e8f0',
  text: INK,
  muted: '#64748b',
}

export function HockeyAntdProvider({children}: HockeyAntdProviderProps) {
  const {themeId} = useHockeyTheme()
  const isDark = themeId === 'ice'
  const palette = isDark ? DARK : LIGHT

  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: GOLD,
          colorInfo: GOLD,
          colorLink: GOLD,
          colorBgBase: palette.bg,
          colorBgContainer: palette.card,
          colorBgElevated: palette.card,
          colorBorder: palette.line,
          colorBorderSecondary: palette.line,
          colorText: palette.text,
          colorTextSecondary: palette.muted,
          colorTextLightSolid: INK,
          borderRadius: 15,
          borderRadiusLG: 30,
          fontFamily: 'var(--hockey-font-sans)',
          controlHeight: 44,
        },
        components: {
          Button: {
            primaryColor: INK,
            fontWeight: 600,
            primaryShadow: 'none',
            defaultShadow: 'none',
            borderRadius: 9,
            defaultBg: palette.card,
            defaultBorderColor: palette.line,
            defaultColor: palette.muted,
          },
          Card: {
            colorBgContainer: palette.card,
          },
          Input: {
            activeBorderColor: GOLD,
            hoverBorderColor: GOLD,
            colorBgContainer: palette.raised,
          },
          Select: {
            colorBgContainer: palette.raised,
          },
          Segmented: {
            itemSelectedBg: GOLD,
            itemSelectedColor: INK,
            trackBg: palette.raised,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}
