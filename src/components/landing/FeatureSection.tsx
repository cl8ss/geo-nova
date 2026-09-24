import { BellRing, ChartNoAxesCombined, Eye, Radio } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function FeatureSection() {
  const { t } = useTranslation()

  return <section className="feature-section page-width" id="platform"><div className="section-intro"><span className="eyebrow">{t('landing.One clear picture')}</span><h2>{t('landing.Complex systems.')}<br /><em>{t('landing.Simple decisions.')}</em></h2><p>{t('landing.From the factory floor to the control room, Geo Nova brings the full environmental story into focus.')}</p></div><div className="feature-grid">
    <article className="feature-card" key="1">
      <div className="feature-top"><span className="feature-icon"><Radio size={18} /></span><span>01</span></div>
      <h3>{t('landing.Monitor every signal')}</h3>
      <p>{t('landing.Bring air quality, atmospheric conditions, and sensor health into one calm, clear view.')}</p>
      <ArrowMark />
    </article>
    <article className="feature-card" key="2">
      <div className="feature-top"><span className="feature-icon"><BellRing size={18} /></span><span>02</span></div>
      <h3>{t('landing.Know before it escalates')}</h3>
      <p>{t('landing.Spot patterns early and turn subtle changes into timely, confident decisions.')}</p>
      <ArrowMark />
    </article>
    <article className="feature-card" key="3">
      <div className="feature-top"><span className="feature-icon"><ChartNoAxesCombined size={18} /></span><span>03</span></div>
      <h3>{t('landing.Make data useful')}</h3>
      <p>{t('landing.Translate complex environmental data into a shared language your whole team understands.')}</p>
      <ArrowMark />
    </article>
    <article className="feature-card" key="4">
      <div className="feature-top"><span className="feature-icon"><Eye size={18} /></span><span>04</span></div>
      <h3>{t('landing.Build a safer future')}</h3>
      <p>{t('landing.Create a culture of awareness with transparent insights for every stakeholder.')}</p>
      <ArrowMark />
    </article>
  </div></section>
}
function ArrowMark() { return <span className="arrow-mark">↗</span> }