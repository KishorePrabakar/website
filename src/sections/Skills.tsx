import { useEffect, useRef } from 'react'
import { useInView } from '../hooks/useInView'
import SectionTitle from '../components/SectionTitle'
import Tag from '../components/Tag'
import { SKILLS, CERTS } from '../data'

function SkillCard({ category, proficiency, tags }: { category:string; proficiency:number; tags:string[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && trackRef.current) {
        const fill = trackRef.current.querySelector('.prof-fill') as HTMLElement
        if (fill) fill.style.width = proficiency + '%'
        obs.disconnect()
      }
    }, { threshold: 0.2 })
    if (trackRef.current) obs.observe(trackRef.current)
    return () => obs.disconnect()
  }, [proficiency])

  return (
    <div className="ghost-card p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color:'var(--accent)' }}>
          {category}
        </h3>
        <span className="text-[0.6rem]" style={{ color:'var(--text-light)' }}>
          {proficiency}%
        </span>
      </div>
      <div ref={trackRef} className="prof-track mb-3">
        <div className="prof-fill" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => <Tag key={t} label={t} />)}
      </div>
    </div>
  )
}

export default function Skills() {
  const ref = useInView()
  return (
    <section id="skills" ref={ref as React.RefObject<HTMLElement>} className="reveal">
      <SectionTitle num="02" title="Skills" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {SKILLS.map(s => <SkillCard key={s.category} {...s} />)}
      </div>
      <div className="ghost-card p-4">
        <h3 className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color:'var(--accent)' }}>
          Certifications
        </h3>
        <div className="flex flex-wrap gap-2">
          {CERTS.map(c => (
            <a key={c.label} href={c.url} target="_blank" rel="noopener noreferrer"
              className="inline-block px-3 py-1.5 text-xs rounded border transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor:'var(--border)', color:'var(--text-dim)', background:'var(--tag-bg)' }}>
              {c.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
