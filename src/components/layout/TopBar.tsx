import { Globe, Menu, Moon, Settings, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import type { Theme } from '../../types/environment'
import { LanguageSwitcher } from '../language/LanguageSwitcher'

interface TopBarProps {
  theme?: Theme
  onThemeToggle?: () => void
  onMenu?: () => void
}

export function TopBar({ theme: propTheme, onThemeToggle: propToggleTheme, onMenu }: TopBarProps) {
  const { t } = useTranslation()
  const hookTheme = useTheme()

  const currentTheme = propTheme ?? hookTheme.theme
  const handleToggleTheme = propToggleTheme ?? hookTheme.toggleTheme

  return (
    <header className="topbar flex items-center justify-between gap-3 px-3 sm:px-5 py-3">
      {onMenu && (
        <button
          type="button"
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors"
          aria-label={t('common.Toggle navigation')}
          onClick={onMenu}
        >
          <Menu size={16} />
        </button>
      )}

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Globe size={15} className="shrink-0 text-[var(--muted)]" />
        <span className="text-xs text-[var(--muted)] truncate">
          {t('landing.Geo Nova')} · {t('common.liveDemo')}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <button
          type="button"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors"
          onClick={handleToggleTheme}
          aria-label={t('common.Theme')}
          title={t('common.Theme')}
        >
          {currentTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <Link
          to="/"
          className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors"
          aria-label={t('nav.Settings')}
        >
          <Settings size={16} />
        </Link>
      </div>
    </header>
  )
}
