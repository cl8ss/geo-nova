import { AlertOctagon, MapPin, Phone, Wind, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface EmergencyPanelProps {
  gasType?: string
  location?: { latitude: number; longitude: number }
  country?: string
  onClose: () => void
}

const countryEmergency: Record<string, { emergency: string; nameAr: string }> = {
  Oman: { emergency: '9999', nameAr: 'عُمان' },
  'Saudi Arabia': { emergency: '911', nameAr: 'السعودية' },
  'United Arab Emirates': { emergency: '999', nameAr: 'الإمارات' },
  Qatar: { emergency: '999', nameAr: 'قطر' },
  Kuwait: { emergency: '112', nameAr: 'الكويت' },
  Bahrain: { emergency: '999', nameAr: 'البحرين' }
}

const gasGuidance: Record<string, { actions: string[]; actionsAr: string[] }> = {
  CO: {
    actions: [
      'Move to fresh air immediately',
      'Call emergency services',
      'Do not re-enter the area',
      'Seek medical attention if symptomatic'
    ],
    actionsAr: [
      'انتقل فوراً إلى هواء نقي',
      'اتصل بخدمات الطوارئ',
      'لا تعد إلى المنطقة',
      'اطلب العناية الطبية إذا ظهرت أعراض'
    ]
  },
  H2S: {
    actions: [
      'Evacuate immediately upwind',
      'Call emergency services',
      'Avoid low-lying areas',
      'Use breathing apparatus if available'
    ],
    actionsAr: [
      'اخلِ المنطقة فوراً في اتجاه الريح',
      'اتصل بخدمات الطوارئ',
      'تجنب المناطق المنخفضة',
      'استخدم جهاز التنفس إذا كان متاحاً'
    ]
  },
  default: {
    actions: [
      'Move to fresh air immediately',
      'Call emergency services',
      'Remove contaminated clothing',
      'Seek medical attention'
    ],
    actionsAr: [
      'انتقل فوراً إلى هواء نقي',
      'اتصل بخدمات الطوارئ',
      'اخلع الملابس الملوثة',
      'اطلب العناية الطبية'
    ]
  }
}

export function EmergencyPanel({ gasType, location, country, onClose }: EmergencyPanelProps) {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const emergencyInfo = country ? countryEmergency[country] : null
  const guidance = gasType ? gasGuidance[gasType] || gasGuidance.default : gasGuidance.default

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,.7)',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        width: 'min(480px, calc(100% - 32px))',
        maxHeight: 'calc(100vh - 64px)',
        overflowY: 'auto',
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,.3)'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'grid',
              placeItems: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(214,93,98,.11)',
              color: 'var(--red)'
            }}>
              <AlertOctagon size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'var(--ink)', fontSize: '17px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                {t('safety.emergencyGuidance')}
              </h2>
              <p style={{ margin: '3px 0 0', color: 'var(--muted)', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
                {t('safety.immediateActions')}
              </p>
            </div>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label={t('common.Close')}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {gasType && (
            <div style={{ marginBottom: '18px', padding: '12px 14px', border: '1px solid rgba(214,93,98,.24)', borderRadius: '8px', background: 'rgba(214,93,98,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Wind size={15} color="var(--red)" />
                <strong style={{ color: 'var(--red)', fontSize: '12px', fontWeight: 600 }}>
                  {t('safety.detectedGas')}: {gasType}
                </strong>
              </div>
              <p style={{ margin: 0, color: 'var(--text)', fontSize: '10px', lineHeight: '1.5' }}>
                {t('safety.gasDetectionNote')}
              </p>
            </div>
          )}

          {location && (
            <div style={{ marginBottom: '18px', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <MapPin size={13} color="var(--cyan)" />
                <span style={{ color: 'var(--muted)', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
                  {t('safety.yourLocation')}:
                </span>
                <span style={{ color: 'var(--text)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                  {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                </span>
              </div>
            </div>
          )}

          {emergencyInfo && (
            <div style={{ marginBottom: '18px', padding: '14px 16px', border: '2px solid var(--red)', borderRadius: '8px', background: 'rgba(214,93,98,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Phone size={16} color="var(--red)" />
                <strong style={{ color: 'var(--ink)', fontSize: '12px', fontWeight: 600 }}>
                  {isArabic ? emergencyInfo.nameAr : country} {t('safety.emergencyNumber')}
                </strong>
              </div>
              <a
                href={`tel:${emergencyInfo.emergency}`}
                style={{
                  display: 'block',
                  padding: '12px',
                  borderRadius: '7px',
                  background: 'var(--red)',
                  color: '#fff',
                  fontSize: '22px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  textAlign: 'center',
                  textDecoration: 'none'
                }}
              >
                {emergencyInfo.emergency}
              </a>
            </div>
          )}

          <div>
            <h3 style={{ margin: '0 0 12px', color: 'var(--ink)', fontSize: '13px', fontWeight: 600 }}>
              {t('safety.recommendedActions')}
            </h3>
            <ol style={{ margin: 0, paddingInlineStart: '20px', color: 'var(--text)', fontSize: '11px', lineHeight: '1.7' }}>
              {(isArabic ? guidance.actionsAr : guidance.actions).map((action, i) => (
                <li key={i} style={{ marginBottom: '6px' }}>{action}</li>
              ))}
            </ol>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '18px', padding: '10px 12px', border: '1px solid rgba(214,156,56,.2)', borderRadius: '7px', background: 'rgba(214,156,56,.06)' }}>
            <AlertOctagon size={14} color="var(--amber)" style={{ marginTop: '1px', flexShrink: 0 }} />
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '9px', lineHeight: '1.5' }}>
              {t('safety.emergencyPanelDisclaimer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
