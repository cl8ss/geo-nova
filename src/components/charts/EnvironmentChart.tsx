import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function EnvironmentChart({ data }: { data: Array<{ time: string; aqi: number; pm25: number }> }) {
  return <div className="chart-wrap"><ResponsiveContainer width="100%" height={250}><LineChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--chart-grid)" />
    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} dy={10} />
    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} domain={[0, 80]} />
    <Tooltip contentStyle={{ background: 'var(--panel-strong)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)' }} labelStyle={{ color: 'var(--muted)', marginBottom: 5 }} itemStyle={{ color: 'var(--cyan)' }} />
    <Line type="monotone" dataKey="aqi" name="AQI" stroke="var(--cyan)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: 'var(--cyan)', stroke: 'var(--panel-strong)', strokeWidth: 3 }} />
    <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="var(--green)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
  </LineChart></ResponsiveContainer></div>
}
