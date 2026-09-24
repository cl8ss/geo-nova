import { ChevronRight, Globe2 } from 'lucide-react'

export function MonitoringBreadcrumbs({ country, site, sensor, onGlobal, onCountry, onSite }: { country?: string; site?: string; sensor?: string; onGlobal: () => void; onCountry: () => void; onSite: () => void }) {
  return <nav className="monitoring-breadcrumbs" aria-label="Monitoring hierarchy"><button onClick={onGlobal}><Globe2 size={13} /> Global</button>{country && <><ChevronRight size={13} /><button onClick={onCountry}>{country}</button></>}{site && <><ChevronRight size={13} /><button onClick={onSite}>{site}</button></>}{sensor && <><ChevronRight size={13} /><span>{sensor}</span></>}</nav>
}
