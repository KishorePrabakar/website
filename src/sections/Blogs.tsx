import { useState } from 'react'
import { useInView } from '../hooks/useInView'
import SectionTitle from '../components/SectionTitle'
import { BLOGS } from '../data'
import { readingTime } from '../lib/readingTime'

const TAGS = Array.from(new Set(BLOGS.map(b => b.tag)))

export default function Blogs() {
  const ref = useInView()
  const [filter, setFilter] = useState('')

  const filtered = filter ? BLOGS.filter(b => b.tag === filter) : BLOGS

  return (
    <section id="blogs" ref={ref as React.RefObject<HTMLElement>} className="reveal">
      <SectionTitle num="04" title="Blogs" />

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('')} className="text-[0.62rem] px-2 py-1 rounded-full border transition-all"
          style={{ borderColor: !filter ? 'var(--accent)' : 'var(--border)', color: !filter ? 'var(--accent)' : 'var(--text-light)', background: !filter ? 'rgba(232,197,71,0.08)' : 'transparent' }}>
          all
        </button>
        {TAGS.map(t => (
          <button key={t} onClick={() => setFilter(f => f === t ? '' : t)}
            className="text-[0.62rem] px-2 py-1 rounded-full border transition-all capitalize"
            style={{ borderColor: filter === t ? 'var(--accent)' : 'var(--border)', color: filter === t ? 'var(--accent)' : 'var(--text-light)', background: filter === t ? 'rgba(232,197,71,0.08)' : 'transparent' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col">
        {filtered.map((b, i) => (
          <a key={b.slug} href={b.href}
            className="group block py-4 border-b relative transition-all hover:pl-4"
            style={{ borderColor:'var(--border)', borderTop: i===0 ? '1px solid var(--border)' : undefined }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background:'var(--accent)' }} />
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[0.6rem] px-1.5 py-0.5 rounded border uppercase tracking-wider"
                style={{ background:'var(--tag-bg)', borderColor:'var(--border)', color:'var(--accent)' }}>
                {b.tag}
              </span>
              <span className="text-[0.62rem]" style={{ color:'var(--text-light)' }}>{b.date}</span>
              <span className="text-[0.58rem]" style={{ color:'var(--text-light)' }}>· {readingTime(b.wordCount)}</span>
            </div>
            <h3 className="text-sm font-semibold mb-1 transition-colors group-hover:text-[var(--accent)]"
              style={{ color:'var(--text)' }}>
              {b.title}
            </h3>
            <p className="text-xs" style={{ color:'var(--text-dim)', maxWidth:'52ch' }}>{b.teaser}</p>
          </a>
        ))}
      </div>
    </section>
  )
}
