import { CheckCircle2, CircleAlert, LoaderCircle } from 'lucide-react'

export function ConnectionStatus({ loading, error, updatedAt }: { loading: boolean; error: string | null; updatedAt: Date | null }) {
  if (error) return <div className="connection-status connection-error"><CircleAlert size={14} /><span>Connection issue</span><small>{error}</small></div>
  return <div className="connection-status"><span className={loading ? 'connection-spinner' : 'connection-live'}>{loading ? <LoaderCircle size={13} /> : <CheckCircle2 size={14} />}</span><span>{loading ? 'Refreshing data…' : 'Live connection'}</span>{updatedAt && <small>Updated {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>}</div>
}
