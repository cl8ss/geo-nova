import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { Metric } from '../../types/environment'

const icons = { cyan: 'metric-icon cyan', green: 'metric-icon green', amber: 'metric-icon amber', red: 'metric-icon red' }
export function MetricCard({ metric, icon }: { metric: Metric; icon: ReactNode }) {
  const Trend = metric.trend === 'up' ? ArrowUpRight : metric.trend === 'down' ? ArrowDownRight : Minus
  return <article className="metric-card"><div className="metric-card-top"><span className={icons[metric.tone]}>{icon}</span><span className={`trend ${metric.trend}`}><Trend size={13} />{metric.change}</span></div><div className="metric-value">{metric.value}<small>{metric.unit}</small></div><p>{metric.label}</p></article>
}
