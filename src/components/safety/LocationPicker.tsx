import { MapPin, Loader, AlertCircle, Navigation } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface LocationPickerProps {
  onLocationFound: (coords: { latitude: number; longitude: number }) => void
}

export function LocationPicker({ onLocationFound }: LocationPickerProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualLocation, setManualLocation] = useState('')

  const requestLocation = () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError(t('safety.geolocationNotSupported'))
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false)
        onLocationFound({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (err) => {
        setLoading(false)
        let errorMsg = t('safety.locationError')

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = t('safety.locationDenied')
            break
          case err.POSITION_UNAVAILABLE:
            errorMsg = t('safety.locationUnavailable')
            break
          case err.TIMEOUT:
            errorMsg = t('safety.locationTimeout')
            break
        }

        setError(errorMsg)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleManualSearch = () => {
    if (manualLocation.trim()) {
      // In a real implementation, this would geocode the address
      // For demo purposes, we'll use Gulf region center coordinates
      onLocationFound({
        latitude: 25.0,
        longitude: 55.0
      })
      setManualLocation('')
    }
  }

  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{t('safety.locationServices')}</span>
          <h2>{t('safety.findYourLocation')}</h2>
          <p style={{ marginTop: '6px', color: 'var(--muted)', fontSize: '10px' }}>
            {t('safety.locationDisclosure')}
          </p>
        </div>
        <MapPin size={18} color="var(--cyan)" />
      </div>

      <div style={{ marginTop: '18px' }}>
        <button
          className="button-primary"
          onClick={requestLocation}
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading ? (
            <>
              <Loader size={14} className="spin" />
              {t('safety.locating')}
            </>
          ) : (
            <>
              <Navigation size={14} />
              {t('safety.useMyLocation')}
            </>
          )}
        </button>

        {error && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '12px', padding: '10px 12px', border: '1px solid rgba(214,93,98,.24)', borderRadius: '7px', background: 'rgba(214,93,98,.06)' }}>
            <AlertCircle size={14} color="var(--red)" style={{ marginTop: '1px', flexShrink: 0 }} />
            <p style={{ margin: 0, color: 'var(--text)', fontSize: '10px', lineHeight: '1.5' }}>
              {error}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0 12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ color: 'var(--muted)', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
            {t('safety.orSearchManually')}
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={manualLocation}
            onChange={(e) => setManualLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
            placeholder={t('safety.enterLocation')}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              background: 'var(--bg)',
              color: 'var(--text)',
              fontSize: '11px',
              outline: 'none'
            }}
          />
          <button
            className="button-primary compact"
            onClick={handleManualSearch}
            disabled={!manualLocation.trim()}
          >
            {t('safety.search')}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '15px', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '7px', background: 'var(--bg)' }}>
        <MapPin size={13} color="var(--cyan)" style={{ marginTop: '1px', flexShrink: 0 }} />
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '9px', lineHeight: '1.5' }}>
          {t('safety.privacyNote')}
        </p>
      </div>
    </div>
  )
}
