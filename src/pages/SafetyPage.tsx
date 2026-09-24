import { useState } from 'react'
import { ToxicGasInfo } from '../components/safety/ToxicGasInfo'
import { EmergencyContacts } from '../components/safety/EmergencyContacts'
import { LocationPicker } from '../components/safety/LocationPicker'
import { EmergencyPanel } from '../components/safety/EmergencyPanel'
import { useTranslation } from 'react-i18next'

export function SafetyPage() {
  const { t } = useTranslation()
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | undefined>()
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false)

  const handleLocationFound = (coords: { latitude: number; longitude: number }) => {
    setLocation(coords)
    // Show emergency panel when location is found
    setShowEmergencyPanel(true)
  }

  // Determine country based on location (simplified for Gulf region)
  const getCountryFromCoords = (lat: number, lng: number): string | undefined => {
    // Oman: ~15-27°N, 52-60°E
    if (lat >= 15 && lat <= 27 && lng >= 52 && lng <= 60) return 'Oman'
    // Saudi Arabia: ~16-32°N, 34-56°E
    if (lat >= 16 && lat <= 32 && lng >= 34 && lng <= 56) return 'Saudi Arabia'
    // UAE: ~22-26°N, 51-57°E
    if (lat >= 22 && lat <= 26 && lng >= 51 && lng <= 57) return 'United Arab Emirates'
    // Qatar: ~24-27°N, 50-52°E
    if (lat >= 24 && lat <= 27 && lng >= 50 && lng <= 52) return 'Qatar'
    // Kuwait: ~28-30°N, 46-49°E
    if (lat >= 28 && lat <= 30 && lng >= 46 && lng <= 49) return 'Kuwait'
    // Bahrain: ~25-27°N, 50-51°E
    if (lat >= 25 && lat <= 27 && lng >= 50 && lng <= 51) return 'Bahrain'
    return undefined
  }

  const country = location ? getCountryFromCoords(location.latitude, location.longitude) : undefined

  return (
    <div style={{ padding: '28px 32px 80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <span style={{
            display: 'block',
            color: 'var(--muted)',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '8px'
          }}>
            {t('nav.Safety library')}
          </span>
          <h1 style={{
            margin: 0,
            color: 'var(--ink)',
            fontSize: '28px',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.5px'
          }}>
            {t('safety.safetyLibrary')}
          </h1>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '12px', maxWidth: '600px' }}>
            {t('safety.industrialHazards')}
          </p>
        </header>

        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))' }}>
          <LocationPicker onLocationFound={handleLocationFound} />
          <EmergencyContacts />
        </div>

        <div style={{ marginTop: '20px' }}>
          <ToxicGasInfo />
        </div>
      </div>

      {showEmergencyPanel && (
        <EmergencyPanel
          gasType={undefined}
          location={location}
          country={country}
          onClose={() => setShowEmergencyPanel(false)}
        />
      )}
    </div>
  )
}
