import type { ReactNode } from 'react'
import type { Severity } from '../../types/environment'

export function StatusBadge({ children, severity = 'info' }: { children: ReactNode; severity?: Severity }) {
  return <span className={`status-badge ${severity}`}><span className="status-badge-dot" />{children}</span>
}
