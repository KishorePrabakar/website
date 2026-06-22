import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Hash, FileText, FolderOpen, ArrowRight } from 'lucide-react'
import { PROJECTS, BLOGS } from '../data'

const SECTIONS = [
  { id:'about',    label:'About',         desc:'Who I am' },
  { id:'skills',   label:'Skills',        desc:'Tech stack & proficiency' },
  { id:'projects', label:'Projects',      desc:"Things I've built" },
  { id:'blogs',    label:'Blogs',         desc:'Thoughts & writing' },
  { id:'reading',  label:'Reading List',  desc:'Books & takes' },
  { id:'life',     label:'On the Internet', desc:'Live stats & activity' },
  { id:'contact',  label:'Contact',       desc:'Get in touch' },
]

type Item = { id:string; type:'section'|'project'|'blog'; label:string; desc:string; href?:string }

function buildItems(): Item[] {
  const sections: Item[] = SECTIONS.map(s => ({ ...s, type:'section' }))
  const projects: Item[] = PROJECTS.map(p => ({ id:p.slug, type:'project', label:p.title, desc:p.tags.join(' · '), href:`https://github.com/${p.repo}` }))
  const blogs: Item[]    = BLOGS.map(b => ({ id:b.slug, type:'blog', label:b.title, desc:b.date, href:b.href }))
  return [...sections, ...projects, ...blogs]
}

const ALL = buildItems()

const ICONS: Record<string, React.FC<{size?:number}>> = {
  section: Hash,
  project: FolderOpen,
  blog:    FileText,
}

interface Props { open:boolean; onClose:()=>void }

export default function CommandPalette({ open, onClose }: Props) {
  const [q, setQ]           = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef            = useRef<HTMLInputElement>(null)
  const listRef             = useRef<HTMLDivElement>(null)

  const items = q.trim()
    ? ALL.filter(i => `${i.label} ${i.desc}`.toLowerCase().includes(q.toLowerCase()))
    : ALL

  useEffect(() => { if (open) { setQ(''); setCursor(0); setTimeout(() => inputRef.current?.focus(), 50) } }, [open])
  useEffect(() => { setCursor(0) }, [q])

  const go = useCallback((item: Item) => {
    if (item.type === 'section') {
      document.getElementById(item.id)?.scrollIntoView({ behavior:'smooth' })
    } else if (item.href) {
      if (item.type === 'blog') window.location.href = item.href
      else window.open(item.href, '_blank', 'noopener')
    }
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c+1, items.length-1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c-1, 0)) }
      if (e.key === 'Enter' && items[cursor]) go(items[cursor])
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open, cursor, items, go, onClose])

  useEffect(() => {
    const el = listRef.current?.children[cursor] as HTMLElement
    el?.scrollIntoView({ block:'nearest' })
  }, [cursor])

  if (!open) return null

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-box" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 border-b" style={{ borderColor:'var(--border)' }}>
          <Search size={14} style={{ color:'var(--text-light)', flexShrink:0 }} />
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Search sections, projects, blogs..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          {q && (
            <button onClick={() => setQ('')} style={{ color:'var(--text-light)', fontSize:'0.7rem' }}>✕</button>
          )}
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto py-1">
          {items.length === 0 && (
            <div className="px-5 py-8 text-center" style={{ color:'var(--text-light)', fontSize:'0.78rem' }}>
              No results for "{q}"
            </div>
          )}
          {items.map((item, i) => {
            const Icon = ICONS[item.type]
            return (
              <div
                key={item.id + item.type}
                className={`cmd-item${i === cursor ? ' cmd-active' : ''}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(item)}
              >
                <span style={{ color:'var(--text-light)', flexShrink:0, lineHeight:0 }}><Icon size={13} /></span>
                <span className="cmd-label">{item.label}</span>
                <span className="cmd-badge">{item.type}</span>
                <ArrowRight size={11} style={{ color:'var(--text-light)' }} />
              </div>
            )
          })}
        </div>

        <div className="cmd-footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
