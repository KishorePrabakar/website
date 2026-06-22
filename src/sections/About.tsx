import { useInView } from '../hooks/useInView'
import SectionTitle from '../components/SectionTitle'

const FACTS = [
  { icon: '🎓', label: 'studying at', value: 'VSBEC-IT, Karur' },
  { icon: '📍', label: 'based in',    value: 'Tamil Nadu, India' },
  { icon: '☕', label: 'powered by',  value: 'chai & curiosity' },
  { icon: '🎯', label: 'currently',   value: 'DSA · Backend · Blockchain' },
]

const INTERESTS = [
  'distributed systems', 'language models', 'blockchain primitives',
  'cli tooling', 'system design', 'open source',
]

export default function About() {
  const ref = useInView()
  return (
    <section id="about" ref={ref as React.RefObject<HTMLElement>} className="reveal">
      <div className="max-w-2xl mx-auto text-center">
        <SectionTitle num="01" title="About" />

        {/* Main bio */}
        <p className="text-base leading-relaxed mb-6" style={{ color:'var(--text)' }}>
          Hey, I'm Kishore — a backend & AI developer from{' '}
          <a href="https://vsbec.edu.in/" target="_blank" rel="noopener noreferrer"
            style={{ color:'var(--accent)' }}>VSBEC-IT</a>.{' '}
          I build systems that scale, explore AI on the side, and ship things that actually work.
          I care deeply about clean APIs, good abstractions, and writing code that future-me won't hate.
        </p>

        <p className="text-sm leading-relaxed mb-8" style={{ color:'var(--text-dim)' }}>
          Currently deep in Backend Systems, DSA grind, and Blockchain fundamentals.
          When I'm not writing code, I'm reading about how everything works —
          from consensus algorithms to why sleep is a good idea.
        </p>

        {/* Quick facts grid */}
        <div className="grid grid-cols-2 gap-2 mb-8">
          {FACTS.map(f => (
            <div key={f.label}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left"
              style={{ background:'var(--bg-raised)', borderColor:'var(--border)' }}>
              <span className="text-base flex-shrink-0">{f.icon}</span>
              <div>
                <div className="text-[0.55rem] uppercase tracking-wider mb-0.5" style={{ color:'var(--text-light)' }}>{f.label}</div>
                <div className="text-[0.75rem] font-medium" style={{ color:'var(--text)' }}>{f.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Interests */}
        <div>
          <p className="text-[0.62rem] uppercase tracking-widest mb-3" style={{ color:'var(--text-light)' }}>
            things I find interesting
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {INTERESTS.map(tag => (
              <span key={tag}
                className="px-3 py-1 text-xs rounded-full border"
                style={{ background:'var(--tag-bg)', borderColor:'var(--border)', color:'var(--text-dim)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
