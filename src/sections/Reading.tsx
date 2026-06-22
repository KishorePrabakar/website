import { useInView } from '../hooks/useInView'
import SectionTitle from '../components/SectionTitle'
import { BOOKS } from '../data'

// Placeholder cover colors per book index — gives each a distinct identity
const COVER_COLORS = [
  { bg:'#1a1200', spine:'#b8860b', text:'#daa520' },
  { bg:'#0a0f1a', spine:'#3b82f6', text:'#93c5fd' },
  { bg:'#0f0a00', spine:'#d97706', text:'#fbbf24' },
  { bg:'#0d0d0d', spine:'#6b7280', text:'#e5e7eb' },
  { bg:'#0a0a0f', spine:'#7c3aed', text:'#c4b5fd' },
  { bg:'#001a0a', spine:'#059669', text:'#6ee7b7' },
]

function BookCover({ title, author, idx }: { title: string; author: string; idx: number }) {
  const col = COVER_COLORS[idx % COVER_COLORS.length]
  return (
    <div className="flex rounded overflow-hidden flex-shrink-0"
      style={{ width:54, height:80, boxShadow:'3px 3px 12px rgba(0,0,0,.55)' }}>
      {/* spine */}
      <div style={{ width:10, background:`linear-gradient(to right,${col.spine}99,${col.spine},${col.spine}99)`, flexShrink:0 }} />
      {/* face */}
      <div className="flex flex-col items-center justify-center px-1 py-1.5 gap-1 text-center flex-1"
        style={{ background:col.bg, borderLeft:`1px solid ${col.spine}33` }}>
        <div style={{ fontSize:'0.38rem', fontWeight:700, color:col.text, lineHeight:1.3 }}
          className="leading-tight">
          {title.length > 30 ? title.slice(0,28)+'…' : title}
        </div>
        <div style={{ fontSize:'0.32rem', color:col.text, opacity:.55 }}>{author.split(' ').slice(-1)[0]}</div>
        <div style={{ fontSize:'0.55rem', color:col.text, opacity:.3 }}>◆</div>
      </div>
    </div>
  )
}

export default function Reading() {
  const ref = useInView()
  return (
    <section id="reading" ref={ref as React.RefObject<HTMLElement>} className="reveal">
      <SectionTitle num="05" title="Reading List" />
      <div className="flex flex-col gap-2">
        {BOOKS.map((b, i) => (
          <div key={b.title}
            className="flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-[var(--accent)]"
            style={{
              background: 'var(--bg-raised)',
              borderColor: b.status === 'reading' ? 'rgba(232,197,71,.3)' : 'var(--border)',
            }}
          >
            <BookCover title={b.title} author={b.author} idx={i} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-[0.58rem] px-1.5 py-0.5 rounded border uppercase tracking-wider flex-shrink-0"
                  style={{
                    background: b.status === 'reading' ? 'rgba(232,197,71,.1)' : 'var(--tag-bg)',
                    borderColor: b.status === 'reading' ? 'rgba(232,197,71,.3)' : 'var(--border)',
                    color: b.status === 'reading' ? 'var(--accent)' : 'var(--text-light)',
                  }}
                >
                  {b.status}
                </span>
              </div>
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{b.title}</div>
              <div className="text-[0.68rem] mb-1" style={{ color: 'var(--text-light)' }}>{b.author}</div>
              <p className="text-[0.68rem] italic" style={{ color: 'var(--text-dim)' }}>{b.take}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
