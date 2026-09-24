import { CloudSun, Gauge, RefreshCw, Thermometer, Wind } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EnvironmentChart } from '../components/charts/EnvironmentChart'
import { AlertsPanel } from '../components/dashboard/AlertsPanel'
import { GasReadings } from '../components/dashboard/GasReadings'
import { MetricCard } from '../components/dashboard/MetricCard'
import { ZoneOverview } from '../components/dashboard/ZoneOverview'
import { acknowledgeAlert, getDashboardSummary, type DashboardSummary } from '../services/api'
import type { Metric } from '../types/environment'

const metricIcons = [<Gauge key="aqi" size={18} />, <Wind key="sensors" size={18} />, <Thermometer key="temperature" size={18} />, <CloudSun key="alerts" size={18} />]

function buildMetrics(summary: DashboardSummary, { t }: { t: (key: string) => string }): Metric[] {
  return [
    { label: t('metrics.Air quality index'), value: String(summary.metrics.aqi), unit: 'AQI', change: t('dashboard.Live demo average'), trend: 'steady', tone: summary.metrics.aqi > 80 ? 'amber' : 'green' },
    { label: t('metrics.Active sensors'), value: String(summary.metrics.activeSensors).padStart(2, '0'), unit: `/ ${summary.metrics.totalSensors}`, change: t('dashboard.Reporting now'), trend: 'steady', tone: 'cyan' },
    { label: t('metrics.Temperature'), value: summary.metrics.temperature.toFixed(1), unit: '°C', change: `${summary.metrics.humidity}% ${t('metrics.Humidity')}`, trend: 'steady', tone: 'amber' },
    { label: t('metrics.Open alerts'), value: String(summary.metrics.openAlerts).padStart(2, '0'), change: t('dashboard.Demo threshold events'), trend: summary.metrics.openAlerts ? 'up' : 'steady', tone: summary.metrics.openAlerts ? 'red' : 'green' },
  ]
}

export function DashboardPage() {
  const { t } = useTranslation()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const loadSummary = useCallback(async (showRefreshing = true) => { if (showRefreshing) setRefreshing(true); try { setSummary(await getDashboardSummary()); setError(null) } catch (reason) { setError(reason instanceof Error ? reason.message : t('common.Could not load monitoring data')) } finally { if (showRefreshing) setRefreshing(false) } }, [t])
  // The initial API sync intentionally starts when the dashboard mounts.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { void loadSummary(false); const timer = window.setInterval(() => void loadSummary(false), 15000); return () => window.clearInterval(timer) }, [loadSummary])

  if (error && !summary) return <div className="dashboard-page"><div className="dashboard-content"><div className="api-state error-state"><span>{t('common.API unavailable')}</span><h1>{t('common.Error loading data')}</h1><p>{error}. {t('common.Could not load monitoring data')}. <code>npm run start:api</code></p><button className="button-primary compact" onClick={() => void loadSummary()}><RefreshCw size={14} /> {t('common.Retry')}</button></div></div></div>
  if (!summary) return <div className="dashboard-page"><div className="dashboard-content"><div className="api-state"><span className="loading-pulse" /> {t('common.Connecting to the simulated sensor network…')}</div></div></div>

  const latestReading = summary.latestReadings[0]
  const chartData = summary.history.map((point) => ({ ...point, time: new Date(point.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }))
  return <div className="dashboard-page"><div className="dashboard-content"><div className="dashboard-heading"><div><span className="eyebrow">{t('dashboard.Live demo stream')} · {new Date().toLocaleString()}</span><h1>{t('dashboard.Good afternoon, Alex')}<span className="heading-period">.</span></h1><p>{t('dashboard.Here\'s the environmental pulse across your simulated industrial network.')}</p></div><div className="dashboard-actions"><button className="date-button" onClick={() => void loadSummary()}><RefreshCw size={13} className={refreshing ? 'spin' : ''} /> {t('dashboard.Refresh data')}</button><Link className="button-primary compact" to="/dashboard/reports">{t('dashboard.Open reports')} <span>→</span></Link></div></div><div className="simulation-banner"><span className="simulation-spark"><span /></span><div><strong>{t('dashboard.Simulated demo data')}</strong><p>{t('dashboard.Readings are generated locally by Geo Nova\'s demo sensor service. They are not connected to physical sensors or official safety limits.')}</p></div><span className="banner-api-status">{t('dashboard.API connected')}</span></div><div className="metrics-grid">{buildMetrics(summary, { t }).map((metric, index) => <MetricCard key={metric.label} metric={metric} icon={metricIcons[index]} />)}</div><div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-heading"><div><span className="eyebrow">{t('dashboard.Last 24 hours')} · {t('dashboard.simulated')}</span><h2>{t('dashboard.Air quality overview')}</h2></div><div className="chart-legend"><span><i className="legend-dot cyan" /> AQI</span><span><i className="legend-dot green" /> PM2.5</span></div></div><div className="chart-summary"><strong>{summary.metrics.aqi} <small>AQI</small></strong><span className="positive-change">{t('dashboard.Live')} <small>{t('dashboard.from local API')}</small></span></div><EnvironmentChart data={chartData} /></section><AlertsPanel alerts={summary.alerts} onAcknowledge={async (id) => { setActionError(null); try { await acknowledgeAlert(id); await loadSummary() } catch (reason) { setActionError(reason instanceof Error ? reason.message : t('common.Could not load monitoring data')) } }} />{actionError && <div className="phase-inline-error">{t('common.Acknowledgement failed')}: {actionError}</div>}</div><div className="dashboard-grid lower-grid"><GasReadings reading={latestReading} /><ZoneOverview sensors={summary.sensors} /></div><div className="dashboard-disclaimer"><span>●</span> {summary.dataType}. {t('dashboard.Demo thresholds are not official safety limits.')}</div></div></div>
}