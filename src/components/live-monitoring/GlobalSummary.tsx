import { AlertTriangle, Globe2, Radio, Radar } from 'lucide-react'
import type { CountryStats } from './types'

export function GlobalSummary({ countries, siteCount, sensorCount, alertCount }: { countries: CountryStats[]; siteCount: number; sensorCount: number; alertCount: number }) {
  return <section className="global-summary"><div><span className="eyebrow">Simulated global network</span><h2>Environmental coverage at a glance</h2><p>Demo countries and fictional monitoring locations for platform demonstration.</p></div><div className="global-summary-stats"><div><Globe2 size={15} /><strong>{countries.length}</strong><span>Demo countries</span></div><div><Radar size={15} /><strong>{siteCount}</strong><span>Demo sites</span></div><div><Radio size={15} /><strong>{sensorCount}</strong><span>Sensors</span></div><div className={alertCount ? 'has-alerts' : ''}><AlertTriangle size={15} /><strong>{alertCount}</strong><span>Active alerts</span></div></div></section>
}
