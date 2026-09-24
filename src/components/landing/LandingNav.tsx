import { ArrowRight, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from '../ui/Logo'
import { LanguageSwitcher } from '../language/LanguageSwitcher'

export function LandingNav() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <nav className="landing-nav page-width">
      <Link to="/" className="logo-link"><Logo /></Link>
      <div className={`landing-links ${open ? 'open' : ''}`}>
        <a href="#platform" onClick={() => setOpen(false)}>{t('landing.Platform')}</a>
        <a href="#approach" onClick={() => setOpen(false)}>{t('landing.Our approach')}</a>
        <a href="#education" onClick={() => setOpen(false)}>{t('landing.Education')}</a>
        <Link to="/dashboard" onClick={() => setOpen(false)}>{t('nav.Overview')} <ArrowRight size={14} /></Link>
      </div>
      <div className="landing-nav-actions">
        <LanguageSwitcher />
        <Link className="nav-login" to="/dashboard">{t('nav.Open workspace')}</Link>
        <button className="mobile-nav-toggle" onClick={() => setOpen(!open)} aria-label={t('common.Toggle navigation')}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </nav>
  )
}