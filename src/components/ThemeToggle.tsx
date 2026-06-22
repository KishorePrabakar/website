import { Moon, Sun } from 'lucide-react'

interface Props { dark: boolean; toggle: () => void }
export default function ThemeToggle({ dark, toggle }: Props) {
  return (
    <button
      onClick={toggle}
      className="fixed top-5 right-6 z-50 w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-200 hover:-translate-y-0.5"
      style={{ background:'var(--bg-raised)', borderColor:'var(--border)', color:'var(--text-dim)' }}
      aria-label="Toggle theme"
    >
      {dark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  )
}
