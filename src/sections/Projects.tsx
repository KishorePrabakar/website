import { useState, useEffect } from 'react'
import { useInView } from '../hooks/useInView'
import SectionTitle from '../components/SectionTitle'
import Tag from '../components/Tag'
import { PROJECTS, GITHUB_USER } from '../data'
import { cacheGet, cacheSet } from '../lib/cache'
import { Star, GitCommit, ExternalLink } from 'lucide-react'

type GHData = { stars: number; lastCommit: string; ago: string }

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7)  return `${days}d ago`
  if (days < 30) return `${Math.floor(days/7)}w ago`
  if (days < 365) return `${Math.floor(days/30)}mo ago`
  return `${Math.floor(days/365)}y ago`
}

async function fetchGH(slug: string): Promise<GHData | null> {
  const key = `gh_repo_${slug}`
  const cached = cacheGet<GHData>(key)
  if (cached) return cached
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${slug}`)
    if (!res.ok) return null
    const d = await res.json()
    const commitRes = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${slug}/commits?per_page=1`)
    let lastCommit = ''
    if (commitRes.ok) {
      const commits = await commitRes.json()
      lastCommit = commits[0]?.commit?.committer?.date || ''
    }
    const data: GHData = { stars: d.stargazers_count || 0, lastCommit, ago: lastCommit ? timeAgo(lastCommit) : '' }
    cacheSet(key, data)
    return data
  } catch { return null }
}

function ProjectCard({ title, repo, desc, tags, pinned }: typeof PROJECTS[0]) {
  const [gh, setGH] = useState<GHData | null>(null)
  const repoSlug = repo.split('/')[1]

  useEffect(() => {
    fetchGH(repoSlug).then(setGH)
  }, [repoSlug])

  return (
    <a
      href={`https://github.com/${repo}`}
      target="_blank" rel="noopener noreferrer"
      className="ghost-card block p-4 relative overflow-hidden group"
    >
      {/* hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none"
        style={{ background:'radial-gradient(ellipse at 20% 20%, var(--accent), transparent 65%)' }} />

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color:'var(--accent)' }}>{title}</span>
          {pinned && (
            <span className="text-[0.58rem] px-1.5 py-0.5 rounded border uppercase tracking-wider"
              style={{ borderColor:'var(--border)', color:'var(--text-light)' }}>
              pinned
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {gh && gh.stars > 0 && (
            <span className="flex items-center gap-1 text-[0.62rem]" style={{ color:'var(--text-dim)' }}>
              <Star size={10} /> {gh.stars}
            </span>
          )}
          <ExternalLink size={11} style={{ color:'var(--text-light)' }} />
        </div>
      </div>

      <p className="text-xs leading-relaxed mb-3" style={{ color:'var(--text-dim)' }}>{desc}</p>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map(t => <Tag key={t} label={t} />)}
      </div>

      {gh?.ago && (
        <div className="flex items-center gap-1 text-[0.58rem]" style={{ color:'var(--text-light)' }}>
          <GitCommit size={9} /> updated {gh.ago}
        </div>
      )}
    </a>
  )
}

const ALL_TAGS = Array.from(new Set(PROJECTS.flatMap(p => p.tags))).sort()

export default function Projects() {
  const ref = useInView()
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter]     = useState('')

  const filtered = PROJECTS.filter(p =>
    !filter || p.tags.includes(filter)
  )
  const visible = expanded ? filtered : filtered.slice(0, 3)

  return (
    <section id="projects" ref={ref as React.RefObject<HTMLElement>} className="reveal">
      <SectionTitle num="03" title="Projects" />

      {/* Tag filter */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setFilter('')}
          className="text-[0.62rem] px-2 py-1 rounded-full border transition-all"
          style={{
            borderColor: !filter ? 'var(--accent)' : 'var(--border)',
            color: !filter ? 'var(--accent)' : 'var(--text-light)',
            background: !filter ? 'rgba(232,197,71,0.08)' : 'transparent',
          }}
        >all</button>
        {ALL_TAGS.slice(0,8).map(t => (
          <button key={t}
            onClick={() => setFilter(f => f === t ? '' : t)}
            className="text-[0.62rem] px-2 py-1 rounded-full border transition-all"
            style={{
              borderColor: filter === t ? 'var(--accent)' : 'var(--border)',
              color: filter === t ? 'var(--accent)' : 'var(--text-light)',
              background: filter === t ? 'rgba(232,197,71,0.08)' : 'transparent',
            }}
          >{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map(p => <ProjectCard key={p.slug} {...p} />)}
      </div>

      <div className="flex items-center gap-4 mt-4">
        {filtered.length > 3 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
            style={{ borderColor:'var(--border)', color:'var(--text-dim)' }}
          >
            {expanded ? 'show less ↑' : `show ${filtered.length - 3} more ↓`}
          </button>
        )}
        <a href={`https://github.com/${GITHUB_USER}?tab=repositories`} target="_blank" rel="noopener noreferrer"
          className="text-xs transition-colors hover:text-[var(--accent)]"
          style={{ color:'var(--text-dim)' }}>
          all repos on github →
        </a>
      </div>
    </section>
  )
}
