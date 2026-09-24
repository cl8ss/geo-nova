import { AlertTriangle, Skull, Wind } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface GasInfo {
  symbol: string
  formula: string
  name: string
  nameAr: string
  color: string
  colorAr: string
  odor: string
  odorAr: string
  sources: string[]
  sourcesAr: string[]
  hazards: string[]
  hazardsAr: string[]
  symptoms: string[]
  symptomsAr: string[]
  safety: string[]
  safetyAr: string[]
}

const gases: GasInfo[] = [
  {
    symbol: 'CO',
    formula: 'CO',
    name: 'Carbon Monoxide',
    nameAr: 'أول أكسيد الكربون',
    color: 'Colorless',
    colorAr: 'عديم اللون',
    odor: 'Odorless',
    odorAr: 'عديم الرائحة',
    sources: ['Combustion engines', 'Furnaces', 'Generators', 'Welding operations'],
    sourcesAr: ['محركات الاحتراق', 'الأفران', 'المولدات', 'عمليات اللحام'],
    hazards: ['Odorless — cannot be detected by smell', 'Binds to hemoglobin 200× stronger than oxygen', 'Causes oxygen deprivation in tissues'],
    hazardsAr: ['عديم الرائحة — لا يمكن اكتشافه بالشم', 'يرتبط بالهيموغلوبين بقوة 200 ضعف الأكسجين', 'يسبب نقص الأكسجين في الأنسجة'],
    symptoms: ['Headache', 'Dizziness', 'Weakness', 'Nausea', 'Confusion', 'Loss of consciousness'],
    symptomsAr: ['صداع', 'دوخة', 'ضعف', 'غثيان', 'ارتباك', 'فقدان الوعي'],
    safety: ['Evacuate to fresh air immediately', 'Never rely on odor to detect CO', 'Use calibrated gas detectors only', 'Call emergency services'],
    safetyAr: ['اخلِ إلى هواء نقي فوراً', 'لا تعتمد أبداً على الرائحة لاكتشاف CO', 'استخدم أجهزة كشف الغاز المعايرة فقط', 'اتصل بخدمات الطوارئ']
  },
  {
    symbol: 'H₂S',
    formula: 'H₂S',
    name: 'Hydrogen Sulfide',
    nameAr: 'كبريتيد الهيدروجين',
    color: 'Colorless',
    colorAr: 'عديم اللون',
    odor: 'Rotten eggs (at low concentrations)',
    odorAr: 'بيض فاسد (في التركيزات المنخفضة)',
    sources: ['Oil and gas operations', 'Sewers', 'Wastewater treatment', 'Petroleum refineries'],
    sourcesAr: ['عمليات النفط والغاز', 'المجاري', 'معالجة مياه الصرف', 'مصافي البترول'],
    hazards: ['Paralyzes sense of smell at high concentrations', 'Heavier than air — accumulates in low areas', 'Highly flammable and explosive'],
    hazardsAr: ['يشل حاسة الشم عند التركيزات العالية', 'أثقل من الهواء — يتراكم في المناطق المنخفضة', 'قابل للاشتعال والانفجار بشدة'],
    symptoms: ['Eye irritation', 'Respiratory distress', 'Loss of smell', 'Unconsciousness', 'Respiratory failure'],
    symptomsAr: ['تهيج العين', 'ضيق التنفس', 'فقدان حاسة الشم', 'فقدان الوعي', 'فشل تنفسي'],
    safety: ['Evacuate upwind immediately', 'Never approach a suspected leak', 'Avoid low-lying areas', 'Use breathing apparatus if trained'],
    safetyAr: ['اخلِ في اتجاه الريح فوراً', 'لا تقترب أبداً من تسرب مشتبه به', 'تجنب المناطق المنخفضة', 'استخدم جهاز التنفس إذا كنت مدرباً']
  },
  {
    symbol: 'SO₂',
    formula: 'SO₂',
    name: 'Sulfur Dioxide',
    nameAr: 'ثاني أكسيد الكبريت',
    color: 'Colorless',
    colorAr: 'عديم اللون',
    odor: 'Pungent, irritating',
    odorAr: 'نفاذة ومهيجة',
    sources: ['Fossil fuel combustion', 'Smelting', 'Paper mills', 'Chemical plants'],
    sourcesAr: ['احتراق الوقود الأحفوري', 'الصهر', 'مصانع الورق', 'المصانع الكيميائية'],
    hazards: ['Respiratory irritant', 'Worsens asthma and bronchitis', 'Forms sulfuric acid in moisture'],
    hazardsAr: ['مهيج للجهاز التنفسي', 'يزيد من حدة الربو والتهاب الشعب الهوائية', 'يشكل حمض الكبريتيك في الرطوبة'],
    symptoms: ['Coughing', 'Shortness of breath', 'Chest tightness', 'Throat irritation', 'Wheezing'],
    symptomsAr: ['سعال', 'ضيق التنفس', 'ضيق الصدر', 'تهيج الحلق', 'صفير'],
    safety: ['Move to fresh air', 'Do not attempt to neutralize', 'Use proper respiratory protection', 'Seek medical attention'],
    safetyAr: ['انتقل إلى هواء نقي', 'لا تحاول المعادلة', 'استخدم حماية تنفسية مناسبة', 'اطلب العناية الطبية']
  },
  {
    symbol: 'NO₂',
    formula: 'NO₂',
    name: 'Nitrogen Dioxide',
    nameAr: 'ثاني أكسيد النيتروجين',
    color: 'Reddish-brown',
    colorAr: 'بني محمر',
    odor: 'Sharp, acrid',
    odorAr: 'حادة ولاذعة',
    sources: ['Combustion processes', 'Vehicles', 'Power plants', 'Welding'],
    sourcesAr: ['عمليات الاحتراق', 'المركبات', 'محطات الطاقة', 'اللحام'],
    hazards: ['Forms nitric acid in lungs', 'Increases infection susceptibility', 'Delayed symptoms possible'],
    hazardsAr: ['يشكل حمض النيتريك في الرئتين', 'يزيد من القابلية للعدوى', 'أعراض متأخرة محتملة'],
    symptoms: ['Coughing', 'Wheezing', 'Respiratory infections', 'Chest pain', 'Fluid in lungs'],
    symptomsAr: ['سعال', 'صفير', 'التهابات الجهاز التنفسي', 'ألم الصدر', 'سوائل في الرئتين'],
    safety: ['Evacuate immediately', 'Seek medical monitoring even if asymptomatic', 'Never approach the source', 'Call emergency services'],
    safetyAr: ['اخلِ فوراً', 'اطلب المراقبة الطبية حتى بدون أعراض', 'لا تقترب أبداً من المصدر', 'اتصل بخدمات الطوارئ']
  },
  {
    symbol: 'Cl₂',
    formula: 'Cl₂',
    name: 'Chlorine',
    nameAr: 'الكلور',
    color: 'Greenish-yellow',
    colorAr: 'أصفر مخضر',
    odor: 'Sharp, bleach-like',
    odorAr: 'حادة تشبه المبيض',
    sources: ['Water treatment', 'Chemical manufacturing', 'Swimming pools', 'Bleach mixing accidents'],
    sourcesAr: ['معالجة المياه', 'التصنيع الكيميائي', 'حمامات السباحة', 'حوادث خلط المبيض'],
    hazards: ['Severe respiratory irritant', 'Reacts with water to form acids', 'Heavier than air'],
    hazardsAr: ['مهيج شديد للجهاز التنفسي', 'يتفاعل مع الماء لتشكيل أحماض', 'أثقل من الهواء'],
    symptoms: ['Burning eyes and throat', 'Difficulty breathing', 'Coughing', 'Chest tightness', 'Nausea'],
    symptomsAr: ['حرقة في العينين والحلق', 'صعوبة التنفس', 'سعال', 'ضيق الصدر', 'غثيان'],
    safety: ['Evacuate to high ground upwind', 'Remove contaminated clothing', 'Never approach or neutralize leak', 'Call emergency services immediately'],
    safetyAr: ['اخلِ إلى مرتفع في اتجاه الريح', 'اخلع الملابس الملوثة', 'لا تقترب أبداً أو تحاول معادلة التسرب', 'اتصل بخدمات الطوارئ فوراً']
  },
  {
    symbol: 'NH₃',
    formula: 'NH₃',
    name: 'Ammonia',
    nameAr: 'الأمونيا',
    color: 'Colorless',
    colorAr: 'عديم اللون',
    odor: 'Sharp, pungent',
    odorAr: 'حادة ونفاذة',
    sources: ['Fertilizer plants', 'Refrigeration systems', 'Cleaning products', 'Industrial processes'],
    sourcesAr: ['مصانع الأسمدة', 'أنظمة التبريد', 'منتجات التنظيف', 'العمليات الصناعية'],
    hazards: ['Corrosive to skin and eyes', 'Forms caustic ammonium hydroxide', 'Lighter than air but irritates immediately'],
    hazardsAr: ['مسبب للتآكل للجلد والعينين', 'يشكل هيدروكسيد الأمونيوم الكاوي', 'أخف من الهواء لكنه يهيج فوراً'],
    symptoms: ['Eye and throat irritation', 'Coughing', 'Chemical burns', 'Respiratory distress', 'Skin burns'],
    symptomsAr: ['تهيج العين والحلق', 'سعال', 'حروق كيميائية', 'ضيق التنفس', 'حروق الجلد'],
    safety: ['Evacuate and call emergency services', 'Flush exposed skin with water', 'Do not attempt to stop leak', 'Seek immediate medical care'],
    safetyAr: ['اخلِ واتصل بخدمات الطوارئ', 'اغسل الجلد المعرض بالماء', 'لا تحاول إيقاف التسرب', 'اطلب العناية الطبية الفورية']
  },
  {
    symbol: 'VOCs',
    formula: 'Various',
    name: 'Volatile Organic Compounds',
    nameAr: 'المركبات العضوية المتطايرة',
    color: 'Varies',
    colorAr: 'متنوع',
    odor: 'Varies (many odorless)',
    odorAr: 'متنوع (كثير منها عديم الرائحة)',
    sources: ['Paints and solvents', 'Fuels', 'Industrial emissions', 'Building materials'],
    sourcesAr: ['الدهانات والمذيبات', 'الوقود', 'الانبعاثات الصناعية', 'مواد البناء'],
    hazards: ['Many compounds with varied toxicity', 'Long-term health effects', 'Indoor air quality concern'],
    hazardsAr: ['مركبات كثيرة بسمية متنوعة', 'آثار صحية طويلة الأمد', 'مصدر قلق لجودة الهواء الداخلي'],
    symptoms: ['Headaches', 'Dizziness', 'Eye irritation', 'Respiratory issues', 'Nausea', 'Fatigue'],
    symptomsAr: ['صداع', 'دوخة', 'تهيج العين', 'مشاكل التنفس', 'غثيان', 'إرهاق'],
    safety: ['Ensure adequate ventilation', 'Use in well-ventilated areas', 'Follow material safety data sheets', 'Wear appropriate protection'],
    safetyAr: ['ضمن تهوية كافية', 'استخدم في مناطق جيدة التهوية', 'اتبع صحائف بيانات سلامة المواد', 'ارتدِ الحماية المناسبة']
  }
]

export function ToxicGasInfo() {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{t('safety.safetyLibrary')}</span>
          <h2>{t('safety.toxicGasInformation')}</h2>
          <p style={{ marginTop: '6px', color: 'var(--muted)', fontSize: '10px' }}>
            {t('safety.industrialHazards')}
          </p>
        </div>
        <Skull size={18} color="var(--red)" />
      </div>

      <div className="simulation-banner" style={{ marginTop: '18px' }}>
        <span className="simulation-spark">
          <span />
        </span>
        <div>
          <strong>{t('safety.educationalReference')}</strong>
          <p>{t('safety.gasInfoDisclaimer')}</p>
        </div>
      </div>

      <div style={{ marginTop: '18px', display: 'grid', gap: '12px' }}>
        {gases.map((gas) => (
          <div
            key={gas.symbol}
            style={{
              padding: '14px 16px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--bg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  background: 'rgba(214,93,98,.11)',
                  color: 'var(--red)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                {gas.symbol}
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', color: 'var(--ink)', fontSize: '13px', fontWeight: 600 }}>
                  {isArabic ? gas.nameAr : gas.name}
                </strong>
                <span style={{ color: 'var(--muted)', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
                  {gas.formula}
                </span>
              </div>
              <AlertTriangle size={16} color="var(--red)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
              <div>
                <span style={{ display: 'block', color: 'var(--muted)', fontSize: '8px', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                  {t('safety.color')}
                </span>
                <span style={{ color: 'var(--text)', fontSize: '10px' }}>
                  {isArabic ? gas.colorAr : gas.color}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--muted)', fontSize: '8px', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                  {t('safety.odor')}
                </span>
                <span style={{ color: 'var(--text)', fontSize: '10px' }}>
                  {isArabic ? gas.odorAr : gas.odor}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <span style={{ display: 'block', color: 'var(--muted)', fontSize: '9px', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                {t('safety.commonSources')}
              </span>
              <ul style={{ margin: 0, paddingInlineStart: '18px', color: 'var(--text)', fontSize: '10px', lineHeight: '1.6' }}>
                {(isArabic ? gas.sourcesAr : gas.sources).map((source, i) => (
                  <li key={i}>{source}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <span style={{ display: 'block', color: 'var(--muted)', fontSize: '9px', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                {t('safety.hazards')}
              </span>
              <ul style={{ margin: 0, paddingInlineStart: '18px', color: 'var(--text)', fontSize: '10px', lineHeight: '1.6' }}>
                {(isArabic ? gas.hazardsAr : gas.hazards).map((hazard, i) => (
                  <li key={i}>{hazard}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--muted)', fontSize: '9px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                <Wind size={11} /> {t('safety.exposureSymptoms')}
              </span>
              <ul style={{ margin: 0, paddingInlineStart: '18px', color: 'var(--text)', fontSize: '10px', lineHeight: '1.6' }}>
                {(isArabic ? gas.symptomsAr : gas.symptoms).map((symptom, i) => (
                  <li key={i}>{symptom}</li>
                ))}
              </ul>
            </div>

            <div style={{ padding: '10px 12px', border: '1px solid rgba(214,93,98,.2)', borderRadius: '7px', background: 'rgba(214,93,98,.05)' }}>
              <span style={{ display: 'block', color: 'var(--red)', fontSize: '9px', fontWeight: 600, marginBottom: '6px' }}>
                {t('safety.safetyGuidance')}
              </span>
              <ul style={{ margin: 0, paddingInlineStart: '18px', color: 'var(--text)', fontSize: '10px', lineHeight: '1.6' }}>
                {(isArabic ? gas.safetyAr : gas.safety).map((guidance, i) => (
                  <li key={i}>{guidance}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '18px', padding: '10px 12px', border: '1px solid rgba(214,93,98,.24)', borderRadius: '7px', background: 'rgba(214,93,98,.06)' }}>
        <AlertTriangle size={14} color="var(--red)" style={{ marginTop: '1px', flexShrink: 0 }} />
        <p style={{ margin: 0, color: 'var(--text)', fontSize: '9px', lineHeight: '1.5' }}>
          <strong>{t('safety.odorWarning')}</strong> {t('safety.odorWarningText')}
        </p>
      </div>

      <p className="phase-disclaimer" style={{ marginTop: '18px' }}>
        ● {t('safety.generalGuidance')}
      </p>
    </div>
  )
}
