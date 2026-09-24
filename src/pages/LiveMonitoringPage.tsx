import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ConnectionStatus } from '../components/live-monitoring/ConnectionStatus'
import { CountryDetailsPanel } from '../components/live-monitoring/CountryDetailsPanel'
import { GlobalFilters } from '../components/live-monitoring/GlobalFilters'
import { GlobalSummary } from '../components/live-monitoring/GlobalSummary'
import { LiveMonitoringMap } from '../components/live-monitoring/LiveMonitoringMap'
import { MonitoringBreadcrumbs } from '../components/live-monitoring/MonitoringBreadcrumbs'
import { SensorDetailsPanel } from '../components/live-monitoring/SensorDetailsPanel'
import { SiteSummaryCard } from '../components/live-monitoring/SiteSummaryCard'
import type { CountryStats, LiveSensor, LiveStatus, MonitoringScope, SiteStats } from '../components/live-monitoring/types'
import { getCountries, getDashboardSummary, getSensorHistory, type ApiReading, type DashboardSummary } from '../services/api'

function getLiveStatus(sensor: DashboardSummary['sensors'][number], alerts: DashboardSummary['alerts'], reading: ApiReading | undefined): LiveStatus {
  if (sensor.status !== 'ONLINE' || !sensor.lastSeenAt || Date.now() - new Date(sensor.lastSeenAt).getTime() > 30000 || !reading) return 'offline'
  const sensorAlerts = alerts.filter((alert) => alert.sensorId === sensor.id && alert.status !== 'RESOLVED')
  if (sensorAlerts.some((alert) => alert.severity === 'CRITICAL')) return 'critical'
  if (sensorAlerts.some((alert) => alert.severity === 'WARNING')) return 'warning'
  return 'normal'
}

export function LiveMonitoringPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [countries, setCountries] = useState<CountryStats[]>([])
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null)
  const [countryFilter, setCountryFilter] = useState('all')
  const [siteFilter, setSiteFilter] = useState('all')
  const [status, setStatus] = useState<'all' | LiveStatus>('all')
  const [severity, setSeverity] = useState<'all' | 'INFO' | 'WARNING' | 'CRITICAL'>('all')
  const [search, setSearch] = useState('')
  const [history, setHistory] = useState<ApiReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [resetToken, setResetToken] = useState(0)
  const [scope, setScope] = useState<MonitoringScope>('global')

  const loadSummary = useCallback(async (initial = false) => {
    if (initial) setLoading(true)
    try {
      const [next, countryRows] = await Promise.all([getDashboardSummary(), getCountries()])
      setSummary(next)
      setCountries(countryRows.map((country) => ({ ...country, siteCount: country.sites.length })))
      setError(null)
      setUpdatedAt(new Date())
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to connect to the monitoring API')
    } finally {
      if (initial) setLoading(false)
    }
  }, [])

  useEffect(() => { void loadSummary(true); const timer = window.setInterval(() => void loadSummary(), 10000); return () => window.clearInterval(timer) }, [loadSummary])

  const liveSensors = useMemo<LiveSensor[]>(() => {
    if (!summary) return []
    const readings = new Map(summary.latestReadings.map((reading) => [reading.sensorId, reading]))
    return summary.sensors.filter((sensor) => Number.isFinite(sensor.site.latitude) && Number.isFinite(sensor.site.longitude)).map((sensor) => ({ ...sensor, reading: readings.get(sensor.id), alerts: summary.alerts.filter((alert) => alert.sensorId === sensor.id), liveStatus: getLiveStatus(sensor, summary.alerts, readings.get(sensor.id)) }))
  }, [summary])

  const siteStats = useMemo<SiteStats[]>(() => {
    if (!summary) return []
    return summary.sites.filter((site) => Number.isFinite(site.latitude) && Number.isFinite(site.longitude)).map((site) => {
      const sensors = liveSensors.filter((sensor) => sensor.site.id === site.id)
      const readings = sensors.map((sensor) => sensor.reading).filter((reading): reading is ApiReading => Boolean(reading))
      const latest = readings.reduce<ApiReading | undefined>((current, reading) => !current || reading.timestamp > current.timestamp ? reading : current, undefined)
      return { ...site, sensorCount: sensors.length, onlineCount: sensors.filter((sensor) => sensor.liveStatus !== 'offline').length, warningCount: sensors.filter((sensor) => sensor.liveStatus === 'warning').length, criticalCount: sensors.filter((sensor) => sensor.liveStatus === 'critical').length, offlineCount: sensors.filter((sensor) => sensor.liveStatus === 'offline').length, latestAqi: readings.length ? Math.round(readings.reduce((total, reading) => total + reading.aqi, 0) / readings.length) : undefined, latestTemperature: readings.length ? readings.reduce((total, reading) => total + reading.temperature, 0) / readings.length : undefined, activeAlerts: sensors.reduce((total, sensor) => total + sensor.alerts.length, 0), lastSync: latest?.timestamp ?? null }
    })
  }, [liveSensors, summary])

  const selectedCountry = countries.find((country) => country.id === selectedCountryId) ?? null
  const selectedSite = siteStats.find((site) => site.id === selectedSiteId) ?? null
  const selectedSensor = liveSensors.find((sensor) => sensor.id === selectedSensorId) ?? null
  const normalizedSearch = search.trim().toLowerCase()
  const matchesSearch = (value: string) => !normalizedSearch || value.toLowerCase().includes(normalizedSearch)
  const matchesSensor = (sensor: LiveSensor) => (status === 'all' || sensor.liveStatus === status) && (severity === 'all' || sensor.alerts.some((alert) => alert.severity === severity)) && matchesSearch(`${sensor.name} ${sensor.id} ${sensor.location} ${sensor.site.name} ${sensor.site.country?.name ?? ''}`)
  const filteredSensors = liveSensors.filter((sensor) => (countryFilter === 'all' || sensor.site.country?.id === countryFilter) && (siteFilter === 'all' || sensor.site.id === siteFilter) && matchesSensor(sensor))
  const filteredSites = siteStats.filter((site) => (countryFilter === 'all' || site.country?.id === countryFilter) && (siteFilter === 'all' || site.id === siteFilter) && (matchesSearch(`${site.name} ${site.country?.name ?? ''}`) || liveSensors.some((sensor) => sensor.site.id === site.id && matchesSensor(sensor))))
  const filteredCountries = countries.filter((country) => (countryFilter === 'all' || country.id === countryFilter) && (matchesSearch(`${country.name} ${country.iso2} ${country.iso3}`) || filteredSites.some((site) => site.country?.id === country.id)))

  useEffect(() => {
    if (selectedSensorId && !liveSensors.some((sensor) => sensor.id === selectedSensorId)) setSelectedSensorId(null)
    if (selectedSiteId && !siteStats.some((site) => site.id === selectedSiteId)) setSelectedSiteId(null)
    if (selectedCountryId && !countries.some((country) => country.id === selectedCountryId)) setSelectedCountryId(null)
  }, [countries, liveSensors, selectedCountryId, selectedSensorId, selectedSiteId, siteStats])

  useEffect(() => {
    const sensorId = selectedSensor?.id
    const fallbackReading = selectedSensor?.reading
    if (!sensorId) { setHistory([]); return }
    let current = true
    void getSensorHistory(sensorId).then((nextHistory) => { if (current) setHistory(nextHistory) }).catch(() => { if (current) setHistory(fallbackReading ? [fallbackReading] : []) })
    return () => { current = false }
  }, [selectedSensor?.id, selectedSensor?.reading])

  const selectCountry = (id: string) => { setSelectedCountryId(id); setSelectedSiteId(null); setSelectedSensorId(null); setCountryFilter(id); setSiteFilter('all'); setScope('country') }
  const selectSite = (id: string) => { const site = siteStats.find((item) => item.id === id); setSelectedSiteId(id); setSelectedSensorId(null); setSelectedCountryId(site?.country?.id ?? null); setCountryFilter(site?.country?.id ?? 'all'); setSiteFilter(id); setScope('site') }
  const selectSensor = (id: string) => { const sensor = liveSensors.find((item) => item.id === id); setSelectedSensorId(id); setSelectedSiteId(sensor?.site.id ?? null); setSelectedCountryId(sensor?.site.country?.id ?? null); setCountryFilter(sensor?.site.country?.id ?? 'all'); setSiteFilter(sensor?.site.id ?? 'all'); setScope('sensor') }
  const resetGlobal = () => { setSelectedCountryId(null); setSelectedSiteId(null); setSelectedSensorId(null); setCountryFilter('all'); setSiteFilter('all'); setStatus('all'); setSeverity('all'); setSearch(''); setScope('global'); setResetToken((token) => token + 1) }
  const onCountryFilter = (value: string) => { setCountryFilter(value); setSiteFilter('all'); setSelectedSiteId(null); setSelectedSensorId(null); setSelectedCountryId(value === 'all' ? null : value); setScope(value === 'all' ? 'global' : 'country') }
  const onSiteFilter = (value: string) => { const site = siteStats.find((item) => item.id === value); setSiteFilter(value); setSelectedSiteId(value === 'all' ? null : value); setSelectedSensorId(null); setSelectedCountryId(site?.country?.id ?? selectedCountryId); setCountryFilter(site?.country?.id ?? countryFilter); setScope(value === 'all' ? (countryFilter === 'all' ? 'global' : 'country') : 'site') }

  if (loading && !summary) return <div className="live-monitoring-page"><div className="live-page-state"><span className="loading-pulse" /> Loading simulated global monitoring network…</div></div>
  return <div className="live-monitoring-page"><div className="live-monitoring-content"><div className="live-page-heading"><div><span className="eyebrow">Global monitoring · simulated demo data</span><h1>See the planet clearly<span className="heading-period">.</span></h1><p>Explore fictional environmental monitoring locations from world view to individual sensor.</p></div><div className="live-heading-actions"><ConnectionStatus loading={loading} error={error} updatedAt={updatedAt} /><button className="date-button" onClick={() => void loadSummary()}><RefreshCw size={13} /> Refresh</button></div></div><MonitoringBreadcrumbs country={selectedCountry?.name} site={selectedSite?.name} sensor={selectedSensor?.name} onGlobal={resetGlobal} onCountry={() => selectedCountry && selectCountry(selectedCountry.id)} onSite={() => selectedSite && selectSite(selectedSite.id)} /><div className="live-disclosure"><span>●</span> All countries, locations, sensor readings, alerts, and thresholds are simulated for software demonstration. No real-world monitoring coverage is claimed.</div>{summary && <><GlobalSummary countries={countries} siteCount={siteStats.length} sensorCount={liveSensors.length} alertCount={summary.alerts.length} /><GlobalFilters countries={countries} sites={siteStats.filter((site) => countryFilter === 'all' || site.country?.id === countryFilter)} selectedCountry={countryFilter} selectedSite={siteFilter} status={status} severity={severity} search={search} onCountryChange={onCountryFilter} onSiteChange={onSiteFilter} onStatusChange={setStatus} onSeverityChange={setSeverity} onSearchChange={setSearch} onReset={resetGlobal} /><div className="live-workspace global-live-workspace"><div className="live-map-column"><LiveMonitoringMap countries={filteredCountries} sites={filteredSites} sensors={filteredSensors} selectedCountryId={selectedCountryId} selectedSiteId={selectedSiteId} selectedSensorId={selectedSensorId} onSelectCountry={selectCountry} onSelectSite={selectSite} onSelectSensor={selectSensor} onReset={resetGlobal} resetToken={resetToken} />{scope === 'country' && <CountryDetailsPanel country={selectedCountry} onClose={() => { setSelectedCountryId(null); setCountryFilter('all'); setScope('global') }} onViewSites={() => setScope('country')} onZoom={() => selectedCountry && selectCountry(selectedCountry.id)} onReset={resetGlobal} />}{scope === 'site' && <SiteSummaryCard site={selectedSite} />}</div><SensorDetailsPanel sensor={selectedSensor} history={history} onClose={() => { setSelectedSensorId(null); setScope(selectedSite ? 'site' : selectedCountry ? 'country' : 'global') }} /></div></>}</div></div>
}
