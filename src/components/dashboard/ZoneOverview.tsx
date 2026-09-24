import { ArrowRight, RadioTower } from 'lucide-react'
import { Link } from 'react-router-dom'

type Sensor = { name: string; site: { name: string }; status: string }
export function ZoneOverview({ sensors }: { sensors: Sensor[] }) {
  const zones = [...new Map(sensors.map((sensor) => [sensor.site.name, sensors.filter((item) => item.site.name === sensor.site.name)])).entries()]
  return <section className="panel zone-panel"><div className="panel-heading"><div><span className="eyebrow">Coverage</span><h2>Region overview</h2></div><span className="panel-count">{sensors.filter((sensor) => sensor.status === 'ONLINE').length} online</span></div><div className="zone-list">{zones.map(([name, zoneSensors]) => { const watch = zoneSensors.some((sensor) => sensor.status !== 'ONLINE'); return <div className="zone-row" key={name}><div className="zone-leading"><span className={`zone-dot ${watch ? 'amber' : 'green'}`} /><div><strong>{name}</strong><span>{zoneSensors.length} sensors reporting</span></div></div><div className="zone-status"><span className={`zone-status-text ${watch ? 'amber' : 'green'}`}>{watch ? 'Watch' : 'Stable'}</span><ArrowRight size={15} /></div></div> })}</div><div className="coverage-visual"><div className="coverage-grid"><RadioTower size={18} /><span>Sensor coverage visualization</span><small>Fictional demo coordinates</small></div><Link className="coverage-link" to="/dashboard/live-monitoring">Open live monitoring <ArrowRight size={13} /></Link></div></section>
}
