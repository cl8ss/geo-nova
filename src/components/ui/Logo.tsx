import { Activity } from 'lucide-react'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="logo-mark"><Activity size={19} strokeWidth={2.5} /></div>
      {!compact && <div><span className="logo-type">geo<span>nova</span></span><span className="logo-subtitle">environmental intelligence</span></div>}
    </div>
  )
}
