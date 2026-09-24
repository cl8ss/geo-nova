import { Moon, Sun } from 'lucide-react'
import type { Theme } from '../../types/environment'

export function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return <button className="icon-button" type="button" onClick={onToggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title="Toggle theme">
    {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
  </button>
}
