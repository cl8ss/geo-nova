import { useEffect, useState } from 'react'
import type { Theme } from '../types/environment'

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('geo-nova-theme') as Theme | null
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('geo-nova-theme', theme)
  }, [theme])

  return { theme, toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark') }
}
