import { useEffect, useState } from 'react'

const SECTIONS = [
  { id:'about',    label:'01' },
  { id:'skills',   label:'02' },
  { id:'projects', label:'03' },
  { id:'blogs',    label:'04' },
  { id:'reading',  label:'05' },
  { id:'life',     label:'06' },
  { id:'contact',  label:'07' },
]

export default function FloatNav() {
  const [visible, setVisible] = useState(false)
  const [active, setActive]   = useState('')

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400)
      let cur = ''
      SECTIONS.forEach(s => {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.45) cur = s.id
      })
      setActive(cur)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 px-2 py-1.5 rounded-full border transition-all duration-500"
      style={{
        background:'var(--bg-raised)', borderColor:'var(--border)',
        boxShadow:'0 4px 24px rgba(0,0,0,0.35)',
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {SECTIONS.map(s => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="flex items-center justify-center w-8 h-7 rounded-full text-[0.65rem] font-bold tracking-wider transition-all duration-200"
          style={{
            color: active === s.id ? 'var(--bg)' : 'var(--text-light)',
            background: active === s.id ? 'var(--accent)' : 'transparent',
          }}
          onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior:'smooth' }) }}
        >
          {s.label}
        </a>
      ))}
    </nav>
  )
}
