import { ArrowUpRight, Gauge } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ApiReading } from '../../services/api'
import { StatusBadge } from '../ui/StatusBadge'

function gasStatus(value: number, warning: number, critical: number) { return value >= critical ? { label: 'Elevated', tone: 'red' } : value >= warning ? { label: 'Watch', tone: 'amber' } : { label: 'Normal', tone: 'green' } }
export function GasReadings({ reading }: { reading?: ApiReading }) {
  const values = reading ? [{ name: 'Carbon monoxide', value: reading.co, unit: 'ppm', ...gasStatus(reading.co, 35, 70) }, { name: 'Hydrogen sulfide', value: reading.h2s, unit: 'ppm', ...gasStatus(reading.h2s, 8, 18) }, { name: 'Volatile compounds', value: reading.voc, unit: 'ppb', ...gasStatus(reading.voc, 400, 800) }, { name: 'PM10', value: reading.pm10, unit: 'µg/m³', ...gasStatus(reading.pm10, 80, 150) }] : []
  return <section className="panel gas-panel"><div className="panel-heading"><div><span className="eyebrow">Atmospheric snapshot</span><h2>Gas readings</h2></div><Link className="icon-link" to="/dashboard/analytics" aria-label="Open gas analytics"><ArrowUpRight size={16} /></Link></div><div className="gas-list">{values.map((gas) => <div className="gas-row" key={gas.name}><div className="gas-name"><span className={`gas-icon ${gas.tone}`}><Gauge size={14} /></span><span>{gas.name}</span></div><div className="gas-value"><strong>{gas.value.toFixed(1)}</strong> <small>{gas.unit}</small></div><StatusBadge severity={gas.tone === 'red' ? 'critical' : gas.tone === 'amber' ? 'warning' : 'info'}>{gas.label}</StatusBadge></div>)}</div>{!values.length && <div className="empty-state">No recent simulated gas readings are available.</div>}</section>
}
