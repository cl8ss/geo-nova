import 'leaflet/dist/leaflet.css'
import { LocateFixed } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents, ZoomControl } from 'react-leaflet'
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet'
import type { CountryStats, LiveSensor, SiteStats } from './types'

const WORLD_CENTER: LatLngExpression = [20, 0]
const WORLD_ZOOM = 2

function statusColor(status: LiveSensor['liveStatus']) { return status === 'critical' ? '#d65d62' : status === 'warning' ? '#d69c38' : status === 'offline' ? '#789095' : '#39a878' }
function statusLabel(status: LiveSensor['liveStatus']) { return status === 'critical' ? 'Critical' : status === 'warning' ? 'Warning' : status === 'offline' ? 'Offline' : 'Normal' }
function sensorPosition(sensor: LiveSensor, index: number): LatLngExpression { const ring = (index % 3) - 1; return [sensor.site.latitude + ring * 0.0012, sensor.site.longitude + (Math.floor(index / 3) - 1) * 0.0014] }
function coordinate(value: { latitude: number; longitude: number }): LatLngExpression { return [value.latitude, value.longitude] }

function MapZoomObserver({ onZoom }: { onZoom: (zoom: number) => void }) {
  const map = useMapEvents({ zoomend: () => onZoom(map.getZoom()) })
  useEffect(() => { onZoom(map.getZoom()) }, [map, onZoom])
  return null
}

function MapController({ countries, sites, sensors, selectedCountryId, selectedSiteId, selectedSensorId, resetToken }: { countries: CountryStats[]; sites: SiteStats[]; sensors: LiveSensor[]; selectedCountryId: string | null; selectedSiteId: string | null; selectedSensorId: string | null; resetToken: number }) {
  const map = useMap()
  const selectedSensor = sensors.find((sensor) => sensor.id === selectedSensorId)
  const selectedSite = sites.find((site) => site.id === selectedSiteId)
  const selectedCountry = countries.find((country) => country.id === selectedCountryId)
  const current = useRef({ selectedSensor, selectedSite, selectedCountry, sensors })
  useEffect(() => { current.current = { selectedSensor, selectedSite, selectedCountry, sensors } }, [selectedCountry, selectedSensor, selectedSite, sensors])
  useEffect(() => {
    if (resetToken) map.flyTo(WORLD_CENTER, WORLD_ZOOM, { duration: .45 })
  }, [map, resetToken])
  useEffect(() => {
    const { selectedSensor: sensor, selectedSite: site, selectedCountry: country, sensors: currentSensors } = current.current
    if (selectedSensorId && sensor) map.flyTo(sensorPosition(sensor, 0), 12, { duration: .45 })
    else if (selectedSiteId && site) {
      const siteSensors = currentSensors.filter((item) => item.site.id === selectedSiteId)
      const points = siteSensors.map((item, index) => sensorPosition(item, index))
      map.fitBounds((points.length ? points : [coordinate(site)]) as LatLngBoundsExpression, { padding: [60, 60], maxZoom: 12, animate: true })
    } else if (selectedCountryId && country) map.flyTo(coordinate(country), 5, { duration: .45 })
  }, [map, selectedCountryId, selectedSensorId, selectedSiteId])
  return null
}

function FitBoundsButton({ countries, sites, sensors, zoom, selectedCountryId, selectedSiteId, onReset }: { countries: CountryStats[]; sites: SiteStats[]; sensors: LiveSensor[]; zoom: number; selectedCountryId: string | null; selectedSiteId: string | null; onReset: () => void }) {
  const map = useMap()
  const fit = () => {
    if (zoom <= 4) { map.flyTo(WORLD_CENTER, WORLD_ZOOM, { duration: .45 }); return }
    if (zoom < 8 && selectedCountryId) { const country = countries.find((item) => item.id === selectedCountryId); if (country) map.flyTo(coordinate(country), 5, { duration: .45 }); return }
    const visibleSensors = selectedSiteId ? sensors.filter((sensor) => sensor.site.id === selectedSiteId) : sensors
    const points = visibleSensors.map((sensor, index) => sensorPosition(sensor, index))
    const visibleSites = selectedCountryId ? sites.filter((site) => site.country?.id === selectedCountryId) : sites
    const fallback = visibleSites.map(coordinate)
    if (points.length || fallback.length) map.fitBounds((points.length ? points : fallback) as LatLngBoundsExpression, { padding: [60, 60], maxZoom: 14, animate: true })
    else onReset()
  }
  return <button className="map-fit-button" onClick={fit} aria-label="Fit visible monitoring markers"><LocateFixed size={15} /> Fit view</button>
}

function CountryMarker({ country, onSelect }: { country: CountryStats; onSelect: () => void }) {
  return <CircleMarker center={coordinate(country)} radius={country.sensorCount ? 13 : 9} pathOptions={{ color: '#50d5dc', fillColor: '#129caf', fillOpacity: .8, weight: 2 }} aria-label={`${country.name}, demo monitoring marker`}><Popup><div className="map-popup"><strong>{country.name}</strong><span>Demo monitoring location</span><b>{country.siteCount} sites · {country.sensorCount} sensors</b><span>{country.activeAlerts} active alerts</span><button onClick={onSelect}>View country</button></div></Popup></CircleMarker>
}

function SiteMarker({ site, onSelect }: { site: SiteStats; onSelect: () => void }) {
  return <CircleMarker center={coordinate(site)} radius={11} pathOptions={{ color: site.criticalCount ? '#d65d62' : site.warningCount ? '#d69c38' : '#39a878', fillColor: site.criticalCount ? '#d65d62' : site.warningCount ? '#d69c38' : '#39a878', fillOpacity: .9, weight: 2 }} aria-label={`${site.name}, demo industrial site`}><Popup><div className="map-popup"><strong>{site.name}</strong><span>{site.country?.name ?? 'Demo country'}</span><b>{site.sensorCount} sensors · {site.activeAlerts} alerts</b><button onClick={onSelect}>View site</button></div></Popup></CircleMarker>
}

function SensorMarker({ sensor, index, selected, onSelect }: { sensor: LiveSensor; index: number; selected: boolean; onSelect: () => void }) {
  const color = statusColor(sensor.liveStatus)
  return <CircleMarker center={sensorPosition(sensor, index)} radius={selected ? 13 : 10} pathOptions={{ color: selected ? '#eafdfb' : color, fillColor: color, fillOpacity: .95, weight: selected ? 4 : 2 }} eventHandlers={{ click: onSelect }} aria-label={`${sensor.name}, ${statusLabel(sensor.liveStatus)}`}><Popup><div className="map-popup"><span className={`popup-status ${sensor.liveStatus}`} /><strong>{sensor.name}</strong><span>{sensor.site.name}</span><b>{statusLabel(sensor.liveStatus)}</b><button onClick={onSelect}>View details</button></div></Popup></CircleMarker>
}

export function LiveMonitoringMap({ countries, sites, sensors, selectedCountryId, selectedSiteId, selectedSensorId, onSelectCountry, onSelectSite, onSelectSensor, onReset, resetToken }: { countries: CountryStats[]; sites: SiteStats[]; sensors: LiveSensor[]; selectedCountryId: string | null; selectedSiteId: string | null; selectedSensorId: string | null; onSelectCountry: (id: string) => void; onSelectSite: (id: string) => void; onSelectSensor: (id: string) => void; onReset: () => void; resetToken: number }) {
  const [zoom, setZoom] = useState(WORLD_ZOOM)
  const countryScope = selectedCountryId ? countries.filter((country) => country.id === selectedCountryId) : countries
  const siteScope = selectedCountryId ? sites.filter((site) => site.country?.id === selectedCountryId) : sites
  const sensorScope = selectedSiteId ? sensors.filter((sensor) => sensor.site.id === selectedSiteId) : selectedCountryId ? sensors.filter((sensor) => sensor.site.country?.id === selectedCountryId) : sensors
  const visibleLevel = zoom <= 4 ? 'country' : zoom < 8 ? 'site' : 'sensor'
  return <div className="live-map-shell"><MapContainer className="live-map" center={WORLD_CENTER} zoom={WORLD_ZOOM} minZoom={2} maxZoom={18} scrollWheelZoom zoomControl={false}><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><ZoomControl position="bottomright" /><MapZoomObserver onZoom={setZoom} /><MapController countries={countries} sites={sites} sensors={sensors} selectedCountryId={selectedCountryId} selectedSiteId={selectedSiteId} selectedSensorId={selectedSensorId} resetToken={resetToken} /><FitBoundsButton countries={countries} sites={sites} sensors={sensors} zoom={zoom} selectedCountryId={selectedCountryId} selectedSiteId={selectedSiteId} onReset={onReset} />{visibleLevel === 'country' && countryScope.map((country) => <CountryMarker key={country.id} country={country} onSelect={() => onSelectCountry(country.id)} />)}{visibleLevel === 'site' && siteScope.map((site) => <SiteMarker key={site.id} site={site} onSelect={() => onSelectSite(site.id)} />)}{visibleLevel === 'sensor' && sensorScope.map((sensor, index) => <SensorMarker key={sensor.id} sensor={sensor} index={index} selected={sensor.id === selectedSensorId} onSelect={() => onSelectSensor(sensor.id)} />)}</MapContainer><div className="map-overlay-label"><span className="map-pin-dot" /> Global demo network <small>Fictional locations</small></div><div className="map-level-label">{visibleLevel === 'country' ? 'World view · demo countries' : visibleLevel === 'site' ? 'Country view · demo sites' : 'Site view · simulated sensors'}</div><div className="map-legend" aria-label="Monitoring status legend"><span><i className="legend-status normal" />Normal</span><span><i className="legend-status warning" />Warning</span><span><i className="legend-status critical" />Critical</span><span><i className="legend-status offline" />Offline</span><span><i className="legend-status demo" />Demo location</span></div></div>
}
