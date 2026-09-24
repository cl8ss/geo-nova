import { ArrowUpRight, CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ApiAlert } from '../../services/api'
import { StatusBadge } from '../ui/StatusBadge'

const icons = { CRITICAL: TriangleAlert, WARNING: TriangleAlert, INFO: Info }
const displaySeverity = (severity: ApiAlert['severity']) => severity.toLowerCase() as 'critical' | 'warning' | 'info'
const relativeTime = (value: string) => {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000))
  return minutes < 60 ? `${minutes} min ago` : `${Math.round(minutes / 60)} hr ago`
}

export function AlertsPanel({ alerts, onAcknowledge }: { alerts: ApiAlert[]; onAcknowledge: (id: string) => void }) {
  return <section className="panel alerts-panel"><div className="panel-heading"><div><span className="eyebrow">Needs attention</span><h2>Recent alerts</h2></div><Link className="text-button" to="/dashboard/alerts">View all <ArrowUpRight size={14} /></Link></div><div className="alert-list">{alerts.length ? alerts.map((alert) => { const Icon = icons[alert.severity]; const severity = displaySeverity(alert.severity); return <div className="alert-row" key={alert.id}><div className={`alert-icon ${severity}`}><Icon size={16} /></div><div className="alert-copy"><strong>{alert.title}</strong><span>{alert.sensor?.name ?? 'Demo sensor'} · {alert.sensor?.location ?? alert.site?.name ?? 'Industrial region'}</span></div><div className="alert-meta"><StatusBadge severity={severity}>{severity}</StatusBadge><small>{relativeTime(alert.createdAt)}</small>{alert.status === 'ACTIVE' && <button className="alert-ack" onClick={() => onAcknowledge(alert.id)}>Acknowledge</button>}</div></div> }) : <div className="empty-state">No active alerts. Demo sensors are within configured ranges.</div>}</div><div className="panel-footer"><CheckCircle2 size={15} /> Demo thresholds are not official safety limits.</div></section>
}
