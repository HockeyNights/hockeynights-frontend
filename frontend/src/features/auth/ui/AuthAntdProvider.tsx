/**
 * SPEC-FR-2.1.1
 * Ant Design тема для экранов входа, подтверждения почты и выбора роли.
 */

import {ConfigProvider, theme as antdTheme} from 'antd'
import ruRU from 'antd/locale/ru_RU'
import type {ReactNode} from 'react'

import {useHockeyTheme} from '@/shared/theme/HockeyThemeProvider'

export interface AuthAntdProviderProps {
  children: ReactNode
}

const GOLD = '#ffb703'

export function AuthAntdProvider({children}: AuthAntdProviderProps) {
  const {themeId} = useHockeyTheme()
  const isDark = themeId === 'ice'

  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: GOLD,
          colorInfo: GOLD,
          colorLink: GOLD,
          colorBgBase: isDark ? '#0a0f1c' : '#f4f0e8',
          colorBgContainer: isDark ? '#131b2d' : '#ffffff',
          colorBorder: isDark ? '#1e293b' : '#d9d4cc',
          colorText: isDark ? '#f3f3f3' : '#1a1714',
          borderRadius: 8,
          fontFamily: 'var(--hockey-font-sans)',
          controlHeight: 48,
          controlHeightLG: 48,
        },
        components: {
          Button: {
            fontWeight: 500,
            primaryShadow: 'none',
            defaultShadow: 'none',
            borderRadius: 15,
          },
          Segmented: {
            itemSelectedBg: GOLD,
            trackBg: isDark ? '#121a2a' : '#e8e2d8',
            trackPadding: 4,
          },
          Input: {
            activeBorderColor: GOLD,
            hoverBorderColor: GOLD,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}
