import { ArrowRight, Leaf, LockKeyhole, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FeatureSection } from '../components/landing/FeatureSection'
import { Hero } from '../components/landing/Hero'
import { LandingNav } from '../components/landing/LandingNav'
import { WorkflowSection } from '../components/landing/WorkflowSection'

export function LandingPage() {
  const { t } = useTranslation()

  return <div className="landing-page"><LandingNav /><main><Hero /><FeatureSection /><WorkflowSection /><section className="landing-cta page-width" id="education"><div className="cta-orbit" /><div><span className="eyebrow">{t('landing.A shared responsibility')}</span><h2>{t('landing.Make the invisible')}<br /><em>{t('landing.visible.')}</em></h2></div><div className="cta-copy"><p>{t('landing.Geo Nova is a foundation for a more informed, more resilient industrial world.')}</p><Link className="button-primary" to="/dashboard">{t('landing.Enter the workspace')} <ArrowRight size={16} /></Link></div></section></main><footer className="landing-footer page-width"><div><Link to="/" className="logo-link"><span className="logo-type">geo<span>nova</span></span></Link><p>{t('landing.Environmental intelligence for a safer tomorrow.')}</p></div><div className="footer-meta"><span><Leaf size={14} /> {t('landing.Designed for impact')}</span><span><Users size={14} /> {t('landing.Built for everyone')}</span><span><LockKeyhole size={14} /> {t('landing.Data, made clear')}</span></div><small>© 2026 Geo Nova · Phase 1 preview</small></footer></div>
}