import { Phone, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Country {
  name: string
  nameAr: string
  flag: string
  emergency: string
  police: string
  ambulance: string
  fire: string
}

const gulfCountries: Country[] = [
  {
    name: 'Oman',
    nameAr: 'عُمان',
    flag: '🇴🇲',
    emergency: '9999',
    police: '9999',
    ambulance: '9999',
    fire: '9999'
  },
  {
    name: 'Saudi Arabia',
    nameAr: 'السعودية',
    flag: '🇸🇦',
    emergency: '911',
    police: '999',
    ambulance: '997',
    fire: '998'
  },
  {
    name: 'United Arab Emirates',
    nameAr: 'الإمارات',
    flag: '🇦🇪',
    emergency: '999',
    police: '999',
    ambulance: '998',
    fire: '997'
  },
  {
    name: 'Qatar',
    nameAr: 'قطر',
    flag: '🇶🇦',
    emergency: '999',
    police: '999',
    ambulance: '999',
    fire: '999'
  },
  {
    name: 'Kuwait',
    nameAr: 'الكويت',
    flag: '🇰🇼',
    emergency: '112',
    police: '112',
    ambulance: '112',
    fire: '112'
  },
  {
    name: 'Bahrain',
    nameAr: 'البحرين',
    flag: '🇧🇭',
    emergency: '999',
    police: '999',
    ambulance: '999',
    fire: '999'
  }
]

export function EmergencyContacts() {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{t('safety.emergencyResponse')}</span>
          <h2>{t('safety.gulfEmergencyContacts')}</h2>
          <p style={{ marginTop: '6px', color: 'var(--muted)', fontSize: '10px' }}>
            {t('safety.verifiedNumbers')}
          </p>
        </div>
        <Phone size={18} color="var(--red)" />
      </div>

      <div className="simulation-banner" style={{ marginTop: '18px', borderColor: 'rgba(214,93,98,.24)', background: 'color-mix(in srgb,var(--red) 7%,var(--panel))' }}>
        <span className="simulation-spark" style={{ background: 'rgba(214,93,98,.15)' }}>
          <span style={{ background: 'var(--red)', boxShadow: '0 0 0 5px rgba(214,93,98,.14)' }} />
        </span>
        <div>
          <strong>{t('safety.realEmergency')}</strong>
          <p>{t('safety.callImmediately')}</p>
        </div>
      </div>

      <div style={{ marginTop: '18px', display: 'grid', gap: '10px' }}>
        {gulfCountries.map((country) => (
          <div
            key={country.name}
            style={{
              padding: '13px 15px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--bg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '11px' }}>
              <span style={{ fontSize: '24px' }}>{country.flag}</span>
              <strong style={{ color: 'var(--ink)', fontSize: '13px', fontWeight: 600 }}>
                {isArabic ? country.nameAr : country.name}
              </strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div>
                <span style={{ display: 'block', color: 'var(--muted)', fontSize: '8px', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                  {t('safety.emergencyNumber')}
                </span>
                <a
                  href={`tel:${country.emergency}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: 'var(--red)',
                    fontSize: '15px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={13} />
                  {country.emergency}
                </a>
              </div>

              <div>
                <span style={{ display: 'block', color: 'var(--muted)', fontSize: '8px', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                  {t('safety.police')}
                </span>
                <a
                  href={`tel:${country.police}`}
                  style={{
                    display: 'block',
                    color: 'var(--cyan)',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-display)',
                    textDecoration: 'none'
                  }}
                >
                  {country.police}
                </a>
              </div>

              <div>
                <span style={{ display: 'block', color: 'var(--muted)', fontSize: '8px', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                  {t('safety.ambulance')}
                </span>
                <a
                  href={`tel:${country.ambulance}`}
                  style={{
                    display: 'block',
                    color: 'var(--cyan)',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-display)',
                    textDecoration: 'none'
                  }}
                >
                  {country.ambulance}
                </a>
              </div>

              <div>
                <span style={{ display: 'block', color: 'var(--muted)', fontSize: '8px', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                  {t('safety.fire')}
                </span>
                <a
                  href={`tel:${country.fire}`}
                  style={{
                    display: 'block',
                    color: 'var(--cyan)',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-display)',
                    textDecoration: 'none'
                  }}
                >
                  {country.fire}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '15px', padding: '10px 12px', border: '1px solid rgba(214,156,56,.2)', borderRadius: '7px', background: 'rgba(214,156,56,.06)' }}>
        <AlertCircle size={14} color="var(--amber)" style={{ marginTop: '1px', flexShrink: 0 }} />
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '9px', lineHeight: '1.5' }}>
          {t('safety.verifyNumbers')}
        </p>
      </div>

      <p className="phase-disclaimer" style={{ marginTop: '15px' }}>
        ● {t('safety.emergencyDisclaimer')}
      </p>
    </div>
  )
}
