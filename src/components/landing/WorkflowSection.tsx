import { ArrowRight, Database, ScanLine, Waves } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const steps = [
  { icon: Waves, label: 'Capture', text: 'Sensors listen to the environment in real time.' },
  { icon: Database, label: 'Understand', text: 'Signals become patterns, context, and clarity.' },
  { icon: ScanLine, label: 'Act early', text: 'The right people see what matters, when it matters.' },
]

export function WorkflowSection() {
  const { t } = useTranslation()

  return <section className="workflow-section" id="approach"><div className="page-width"><div className="workflow-heading"><div><span className="eyebrow">{t('landing.How it works')}</span><h2>{t('landing.From signal to')}<br /><em>{t('landing.safer action.')}</em></h2></div><p>{t('landing.Quietly intelligent infrastructure for the moments that matter most.')}</p></div><div className="workflow-steps">{steps.map(({ icon: Icon, label, text }, index) => <div className="workflow-step" key={label}><div className="workflow-number">0{index + 1}</div><div className="workflow-icon"><Icon size={21} /></div><h3>{t('landing.' + label)}</h3><p>{t('landing.' + text)}</p>{index < steps.length - 1 && <ArrowRight className="workflow-arrow" size={19} />}</div>)}</div></div></section>
}