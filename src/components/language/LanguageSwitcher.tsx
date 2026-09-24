import { ChevronDown, Globe } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: 'en', name: t('common.English'), nativeName: 'English' },
    { code: 'ar', name: t('common.Arabic'), nativeName: 'العربية' }
  ]

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0]

  const changeLanguage = (code: string) => {
    void i18n.changeLanguage(code)
    localStorage.setItem('geo-nova-lang', code)
    setOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-flex" ref={containerRef}>
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--panel)] text-[var(--text)] text-xs font-medium hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors"
        aria-label={t('common.language')}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Globe size={14} className="text-[var(--muted)]" />
        <span className="hidden sm:inline">{currentLang.nativeName}</span>
        <ChevronDown size={12} className={`text-[var(--muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          className="absolute top-full mt-1 min-w-[140px] rounded-lg border border-[var(--border)] bg-[var(--panel)] shadow-lg z-50 overflow-hidden"
          style={{ insetInlineEnd: 0 }}
          role="listbox"
          aria-label={t('common.language')}
        >
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                className={`w-full px-3 py-2 text-start text-xs sm:text-sm font-medium transition-colors ${
                  lang.code === i18n.language
                    ? 'bg-[var(--cyan)] text-slate-900 font-semibold'
                    : 'text-[var(--text)] hover:bg-[var(--bg)]'
                }`}
                role="option"
                aria-selected={lang.code === i18n.language}
                onClick={() => changeLanguage(lang.code)}
              >
                {lang.nativeName} ({lang.name})
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
