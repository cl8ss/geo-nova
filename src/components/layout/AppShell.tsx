import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { DocumentLang } from '../language/DocumentLang'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  return <div className="app-shell"><DocumentLang /><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><main className="app-main"><TopBar theme={theme} onThemeToggle={toggleTheme} onMenu={() => setSidebarOpen(true)} /><Outlet /></main></div>
}
