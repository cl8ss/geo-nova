import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DocumentLang } from './components/language/DocumentLang'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { LiveMonitoringPage } from './pages/LiveMonitoringPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { AlertsPage } from './pages/AlertsPage'
import { ReportsPage } from './pages/ReportsPage'
import { IntelligencePage } from './pages/IntelligencePage'
import { SafetyPage } from './pages/SafetyPage'

function App() {
  return (
    <BrowserRouter>
      <DocumentLang />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/live-monitoring" element={<LiveMonitoringPage />} />
          <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
          <Route path="/dashboard/alerts" element={<AlertsPage />} />
          <Route path="/dashboard/reports" element={<ReportsPage />} />
          <Route path="/dashboard/intelligence" element={<IntelligencePage />} />
          <Route path="/dashboard/safety" element={<SafetyPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App