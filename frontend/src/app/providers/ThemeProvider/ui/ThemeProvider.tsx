import type {ReactNode} from 'react'

import {HockeyAntdProvider} from '@/shared/theme/HockeyAntdProvider'
import {HockeyThemeProvider} from '@/shared/theme/HockeyThemeProvider'
import {SmoothScrollProvider} from '@/shared/theme/SmoothScrollProvider'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({children}: ThemeProviderProps) {
  return (
    <HockeyThemeProvider>
      <HockeyAntdProvider>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </HockeyAntdProvider>
    </HockeyThemeProvider>
  )
}
