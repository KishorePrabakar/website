import { useState, useEffect, useCallback } from 'react'
import { useTheme } from './hooks/useTheme'
import ScrollProgress from './components/ScrollProgress'
import FloatNav from './components/FloatNav'
import ThemeToggle from './components/ThemeToggle'
import ScrollTop from './components/ScrollTop'
import CommandPalette from './components/CommandPalette'
import Terminal from './components/Terminal'
import Hero from './sections/Hero'
import About from './sections/About'
import Skills from './sections/Skills'
import Projects from './sections/Projects'
import Blogs from './sections/Blogs'
import Reading from './sections/Reading'
import Life from './sections/Life'
import Contact from './sections/Contact'
import { PROFILE } from './data'
import { Github, Linkedin, Twitter } from 'lucide-react'

declare global { interface Window { _wakaCallback?: (r: unknown) => void } }

function Divider() {
  return <div className="my-12 h-px" style={{ background:'var(--border)' }} />
}

export default function App() {
  const { dark, toggle } = useTheme()
  const [cmdOpen, setCmdOpen]  = useState(false)
  const [termOpen, setTermOpen] = useState(false)

  // Ctrl+K → command palette
  const onKey = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault(); setCmdOpen(o => !o)
    }
    if (e.key === 'Escape') { setCmdOpen(false); setTermOpen(false) }
  }, [])
  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onKey])

  return (
    <div className={dark ? 'dark' : 'light'}>
      <div id="scroll-progress" />
      <ScrollProgress />
      <ThemeToggle dark={dark} toggle={toggle} />
      <FloatNav />
      <ScrollTop />

      {/* Ctrl+K hint */}
      <button
        onClick={() => setCmdOpen(true)}
        className="fixed top-5 right-16 z-50 hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[0.62rem] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
        style={{ borderColor:'var(--border)', color:'var(--text-light)', background:'var(--bg-raised)' }}
      >
        <span>⌘K</span>
      </button>

      <main className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="pt-24 pb-4">
          <Hero onOpenTerminal={() => setTermOpen(true)} />
        </div>

        <Divider />
        <About />
        <Divider />
        <Skills />
        <Divider />
        <Projects />
        <Divider />
        <Blogs />
        <Divider />
        <Reading />
        <Divider />
        <Life />
        <Divider />
        <Contact />

        {/* Footer */}
        <footer className="py-10 mt-4 border-t text-center" style={{ borderColor:'var(--border)' }}>
          <div className="flex justify-center gap-4 mb-4">
            {[
              { icon: Github,   href: PROFILE.links.github,   label:'GitHub' },
              { icon: Linkedin, href: PROFILE.links.linkedin,  label:'LinkedIn' },
              { icon: Twitter,  href: 'https://x.com/kraxonstar', label:'X' },
            ].map(({ icon:Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] hover:-translate-y-0.5"
                style={{ borderColor:'var(--border)', color:'var(--text-dim)', background:'var(--bg-raised)' }}
                aria-label={label}>
                <Icon size={13} />
              </a>
            ))}
          </div>
          <p className="text-xs" style={{ color:'var(--text-light)' }}>
            built with React · Vite · Tailwind · 🍵
          </p>
          <p className="text-[0.65rem] mt-1" style={{ color:'var(--text-light)', opacity:.5 }}>
            © {new Date().getFullYear()} {PROFILE.name}
          </p>
        </footer>
      </main>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <Terminal open={termOpen} onClose={() => setTermOpen(false)} />
    </div>
  )
}
