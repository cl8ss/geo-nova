import { Activity, BarChart3, BookOpen, BrainCircuit, ChevronDown, CircleHelp, LayoutDashboard, Radio, Settings, ShieldAlert, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from '../ui/Logo'

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()

  const mainLinks = [
    { to: '/dashboard', label: t('nav.Overview'), icon: LayoutDashboard },
    { to: '/dashboard/live-monitoring', label: t('nav.Live monitoring'), icon: Radio },
    { to: '/dashboard/alerts', label: t('nav.Alerts center'), icon: ShieldAlert, badge: '2' },
    { to: '/dashboard/analytics', label: t('nav.Analytics'), icon: BarChart3 },
    { to: '/dashboard/intelligence', label: t('nav.Environmental intelligence'), icon: BrainCircuit },
    { to: '/dashboard/reports', label: t('nav.Reports'), icon: Activity },
  ]

  return <>
    {open && <button className="sidebar-overlay" onClick={onClose} aria-label={t('common.close')} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><Logo /><button className="sidebar-close icon-button" onClick={onClose} aria-label={t('common.close')}><X size={18} /></button></div>
      <div className="workspace-switcher"><div className="workspace-icon">NR</div><div><strong>North region</strong><span>Industrial network</span></div><ChevronDown size={15} /></div>
      <nav className="sidebar-nav">
        <span className="nav-label">{t('nav.Workspace')}</span>
        {mainLinks.map(({ to, label, icon: Icon, badge }) => <NavLink key={label} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}><Icon size={17} /><span>{label}</span>{badge && <b>{badge}</b>}</NavLink>)}
        <span className="nav-label nav-label-spaced">{t('nav.Resources')}</span>
        <NavLink to="/dashboard/safety" className="nav-link" onClick={onClose}><BookOpen size={17} /><span>{t('nav.Safety library')}</span></NavLink>
        <NavLink to="/" className="nav-link" onClick={onClose}><CircleHelp size={17} /><span>{t('nav.Support center')}</span></NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="data-status"><span className="status-icon"><Activity size={15} /></span><div><strong>{t('common.dataStreamHealthy')}</strong><span>{t('common.lastSync')}</span></div></div>
        <NavLink to="/" className="nav-link" onClick={onClose}><Settings size={17} /><span>{t('nav.Settings')}</span></NavLink>
        <div className="profile-row"><div className="avatar">AM</div><div><strong>Alex Morgan</strong><span>{t('common.operationsLead')}</span></div><ChevronDown size={15} /></div>
      </div>
    </aside>
  </>
}