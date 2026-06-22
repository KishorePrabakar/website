import React from 'react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useInView } from '../hooks/useInView'
import SectionTitle from '../components/SectionTitle'
import {
  WAKATIME_HASH, WAKATIME_USER, GITHUB_USER,
  LEETCODE_USER, CHESS_USER, LB_USER, PROFILE
} from '../data'
import { cacheGet, cacheSet } from '../lib/cache'

/* ── Shared card shell ─────────────────────────────── */
function LC({ href, cls = '', style, children }: { href?: string; cls?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const base = `ghost-card flex flex-col overflow-hidden relative ${cls}`
  const s: React.CSSProperties = { padding:'0.85rem 1rem', ...style }
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={base} style={s}>{children}</a>
  return <div className={base} style={s}>{children}</div>
}

function Chip({ children, green }: { children: React.ReactNode; green?: boolean }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.58rem] font-bold tracking-widest uppercase mb-2 w-fit"
      style={{
        background: green ? 'rgba(29,185,84,0.1)' : 'var(--tag-bg)',
        borderColor: green ? 'rgba(29,185,84,0.3)' : 'var(--border)',
        color: green ? '#1DB954' : 'var(--text-light)',
      }}>
      {children}
    </div>
  )
}

function Pip({ color = '#4ade80' }: { color?: string }) {
  return <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 5px ${color}`, animation:'pip 2.2s ease-in-out infinite' }} />
}

/* ── SPOTIFY PLAYLIST CARD ──────────────────────────── */
const PLAYLIST_ID = '35Pwlp04tX7Wga87NECRKQ'
const PLAYLIST_URL = `https://open.spotify.com/playlist/${PLAYLIST_ID}`
const EMBED_URL = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`

// Tracks shown in the discography scroll — aesthetic display only
// Real playback handled by the Spotify embed iframe
const TRACKS = [
  { title:'Blinding Lights',      artist:'The Weeknd',         color:'#c084fc' },
  { title:'Die For You',          artist:'The Weeknd',         color:'#f59e0b' },
  { title:'Save Your Tears',      artist:'The Weeknd',         color:'#3b82f6' },
  { title:'Starboy',              artist:'The Weeknd, Daft Punk', color:'#e8c547' },
  { title:'Often',                artist:'The Weeknd',         color:'#4ade80' },
  { title:'SICKO MODE',           artist:'Travis Scott',       color:'#f87171' },
  { title:'goosebumps',           artist:'Travis Scott',       color:'#a78bfa' },
  { title:'Stan',                 artist:'Eminem',             color:'#60a5fa' },
  { title:'Lose Yourself',        artist:'Eminem',             color:'#fb923c' },
  { title:'Not Like Us',          artist:'Kendrick Lamar',     color:'#34d399' },
]

const EQ_HEIGHTS = [35,72,50,85,42,60,38,90,55,65]

function SpotifyCard() {
  const [playing, setPlaying]     = React.useState(false)
  const [showEmbed, setShowEmbed] = React.useState(false)
  const [activeIdx, setActiveIdx] = React.useState(0)
  const [hovered, setHovered]     = React.useState(false)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const trackRef  = React.useRef<HTMLDivElement>(null)

  // Cycle through tracks for display animation
  React.useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setActiveIdx(i => (i+1) % TRACKS.length), 8000)
    return () => clearInterval(t)
  }, [playing])

  // Auto-scroll track list — only after user has interacted (prevents page scroll on mount)
  const hasInteracted = React.useRef(false)
  React.useEffect(() => {
    if (!hasInteracted.current || !trackRef.current) return
    const active = trackRef.current.children[activeIdx] as HTMLElement
    active?.scrollIntoView({ behavior:'smooth', block:'nearest' })
  }, [activeIdx])

  // Spotify embed postMessage controls
  const sendCmd = (cmd: string) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ command: cmd }), '*')
  }

  const handlePlay = () => {
    hasInteracted.current = true
    if (!showEmbed) { setShowEmbed(true); setPlaying(true); return }
    setPlaying(p => !p)
    sendCmd(playing ? 'pause' : 'play')
  }

  const handlePrev = () => {
    setActiveIdx(i => (i - 1 + TRACKS.length) % TRACKS.length)
    sendCmd('prev')
  }

  const handleNext = () => {
    setActiveIdx(i => (i + 1) % TRACKS.length)
    sendCmd('next')
  }

  const track = TRACKS[activeIdx]

  return (
    <div
      className="ghost-card flex flex-col overflow-hidden relative"
      style={{ background:'#050505', borderColor:'#111', padding:0, cursor:'default' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Spotify embed iframe — hidden but active for real playback */}
      {/* Spotify embed — visible when playing so browser allows audio */}
      <div style={{
        height: playing ? 80 : 0,
        overflow: 'hidden',
        transition: 'height 0.4s ease',
        margin: playing ? '0 0 8px 0' : 0,
      }}>
        {showEmbed && (
          <iframe
            ref={iframeRef}
            src={EMBED_URL}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            width="100%"
            height="80"
            style={{ border:'none', borderRadius:8 }}
            title="Spotify playlist"
          />
        )}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[0.58rem] font-bold tracking-widest uppercase"
          style={{ background:'rgba(29,185,84,0.1)', borderColor:'rgba(29,185,84,0.3)', color:'#1DB954' }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
          Spotify
        </div>
        <span className="text-[0.6rem]" style={{ color:'#555' }}>my playlist</span>
      </div>

      {/* Album art area — active track color splash */}
      <div className="relative mx-3 rounded-xl overflow-hidden mb-3"
        style={{ height:160, background:`linear-gradient(135deg, ${track.color}22, #111 60%)`, transition:'background 1s ease' }}>

        {/* Vinyl record animation */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{
            width:110, height:110,
            borderRadius:'50%',
            background:`conic-gradient(#111 0deg, #1a1a1a 30deg, #111 60deg, #1a1a1a 90deg, #111 120deg, #1a1a1a 150deg, #111 180deg, #1a1a1a 210deg, #111 240deg, #1a1a1a 270deg, #111 300deg, #1a1a1a 330deg)`,
            boxShadow:`0 0 30px ${track.color}44, 0 0 60px ${track.color}22`,
            animation: playing ? 'spin 4s linear infinite' : 'none',
            transition:'box-shadow 1s ease',
          }}>
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full flex items-center justify-center"
              style={{ width:38, height:38, background:track.color, boxShadow:`0 0 12px ${track.color}` }}>
              <div className="rounded-full" style={{ width:10, height:10, background:'#050505' }} />
            </div>
          </div>
        </div>

        {/* Track info */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 max-w-[calc(100%-130px)]">
          <div className="text-xs font-bold truncate mb-0.5" style={{ color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,.8)' }}>
            {track.title}
          </div>
          <div className="text-[0.62rem] truncate" style={{ color:'rgba(255,255,255,.55)' }}>
            {track.artist}
          </div>
          {/* EQ bars when playing */}
          {playing && (
            <div className="flex items-end gap-0.5 mt-2" style={{ height:16 }}>
              {EQ_HEIGHTS.slice(0,6).map((h,i) => (
                <div key={i} className="rounded-t-sm" style={{
                  width:3,
                  background:track.color,
                  opacity:.8,
                  ['--eq-h' as string]: h+'%',
                  animation:`eq 1.1s ease-in-out ${i*0.11}s infinite`,
                  height:'15%',
                }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Track list — scrollable discography */}
      <div ref={trackRef}
        className="flex-1 overflow-y-auto mx-3 rounded-lg"
        style={{ maxHeight:140, scrollbarWidth:'none' }}>
        {TRACKS.map((t, i) => (
          <div key={i}
            onClick={() => { hasInteracted.current = true; setActiveIdx(i); if (!playing) { setPlaying(true); setShowEmbed(true) } }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all"
            style={{
              background: i === activeIdx ? `${t.color}18` : 'transparent',
              borderLeft: i === activeIdx ? `2px solid ${t.color}` : '2px solid transparent',
            }}>
            <span className="text-[0.55rem] w-3 text-center flex-shrink-0" style={{ color:'#555' }}>
              {i === activeIdx && playing
                ? <span style={{ color:t.color }}>▶</span>
                : i+1
              }
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[0.68rem] font-medium truncate" style={{ color: i===activeIdx ? '#fff' : '#999' }}>
                {t.title}
              </div>
              <div className="text-[0.55rem] truncate" style={{ color:'#555' }}>{t.artist}</div>
            </div>
            {i === activeIdx && playing && (
              <div className="flex items-end gap-px" style={{ height:12, flexShrink:0 }}>
                {[40,80,55].map((h,j) => (
                  <div key={j} style={{
                    width:2, borderRadius:1, background:t.color,
                    ['--eq-h' as string]: h+'%',
                    animation:`eq 0.9s ease-in-out ${j*0.15}s infinite`,
                    height:'10%',
                  }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls — fade in on hover */}
      <div className="px-3 pt-2 pb-3 flex items-center justify-between"
        style={{
          opacity: hovered ? 1 : 0.3,
          transition:'opacity 0.3s ease',
        }}>

        {/* Prev */}
        <button onClick={handlePrev}
          className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:scale-110"
          style={{ color:'#aaa', background:'#1a1a1a' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
          </svg>
        </button>

        {/* Play / Pause */}
        <button onClick={handlePlay}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95"
          style={{ background:'#1DB954', boxShadow: playing ? '0 0 16px #1DB95466' : 'none' }}>
          {playing
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#000"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="#000" style={{ marginLeft:2 }}><path d="M8 5v14l11-7z"/></svg>
          }
        </button>

        {/* Next */}
        <button onClick={handleNext}
          className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:scale-110"
          style={{ color:'#aaa', background:'#1a1a1a' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 4V8z M16 6h2v12h-2z"/>
          </svg>
        </button>

        {/* Open in Spotify */}
        <a href={PLAYLIST_URL} target="_blank" rel="noopener noreferrer"
          className="text-[0.58rem] flex items-center gap-1 transition-colors hover:text-[#1DB954]"
          style={{ color:'#555' }}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
          open
        </a>
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(-90deg) } to { transform: rotate(270deg) } }`}</style>
    </div>
  )
}

/* ── GITHUB ─────────────────────────────────────────── */
type GHStats = { total: number; streak: number; longest: number; days: { count: number; level: number }[] }
function GitHubCard() {
  const [stats, setStats] = useState<GHStats | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cached = cacheGet<GHStats>('gh_life_v2')
    if (cached) { setStats(cached); return }
    fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.contributions) return
        const days = d.contributions as { count: number; level: number }[]
        let cur = 0, longest = 0, run = 0
        let lastActive = days.length - 1
        while (lastActive > 0 && days[lastActive].count === 0) lastActive--
        for (let i = lastActive; i >= 0; i--) { if (days[i].count > 0) cur++; else break }
        days.forEach(day => { if (day.count > 0) { run++; longest = Math.max(longest, run) } else run = 0 })
        const total = Object.values(d.total || {}).reduce((s: number, v) => s + (v as number), 0) as number
        const s: GHStats = { total, streak: cur, longest, days }
        setStats(s); cacheSet('gh_life_v2', s)
      }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!stats || !canvasRef.current) return
    const canvas = canvasRef.current
    const COLS = 52, ROWS = 7, S = 8, GAP = 2
    canvas.width = COLS*(S+GAP)-GAP; canvas.height = ROWS*(S+GAP)-GAP
    canvas.style.width = '100%'; canvas.style.height = 'auto'
    const ctx = canvas.getContext('2d')!
    const dark = !document.documentElement.classList.contains('light')
    const fills = dark
      ? ['#1e2126','rgba(232,197,71,.18)','rgba(232,197,71,.48)','#e8c547']
      : ['#e5e7eb','#bbf7d0','#4ade80','#16a34a']
    stats.days.slice(-COLS*ROWS).forEach((d, i) => {
      const x = Math.floor(i/ROWS)*(S+GAP), y = (i%ROWS)*(S+GAP)
      ctx.fillStyle = fills[Math.min(d.level, 3)]
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(x, y, S, S, 2); else ctx.rect(x, y, S, S)
      ctx.fill()
    })
  }, [stats])

  return (
    <LC href={`https://github.com/${GITHUB_USER}`} cls="lc-github">
      <Chip>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.58v-2.03c-3.34.72-4.04-1.6-4.04-1.6-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
        GitHub
      </Chip>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { val: stats?.total ?? '—', lbl: 'contributions' },
          { val: stats?.streak ?? '—', lbl: 'streak 🔥', accent: true },
          { val: stats?.longest ?? '—', lbl: 'longest' },
        ].map(({ val, lbl, accent }) => (
          <div key={lbl} className="text-center">
            <div className="text-xl font-bold" style={{ color: accent ? 'var(--accent)' : 'var(--text)', filter: accent ? 'drop-shadow(0 0 6px rgba(232,197,71,.4))' : undefined }}>{val}</div>
            <div className="text-[0.52rem]" style={{ color:'var(--text-light)' }}>{lbl}</div>
          </div>
        ))}
      </div>
      <canvas ref={canvasRef} className="rounded mb-2" />
      <div className="flex items-center justify-between">
        <span className="text-[0.55rem]" style={{ color:'var(--text-light)' }}>@{GITHUB_USER}</span>
        <div className="flex gap-1">
          {['var(--border)','rgba(232,197,71,.2)','rgba(232,197,71,.5)','var(--accent)'].map((c,i) => (
            <span key={i} className="w-2 h-2 rounded-sm" style={{ background: c }} />
          ))}
        </div>
      </div>
    </LC>
  )
}

/* ── BOOK ───────────────────────────────────────────── */
function BookCard() {
  return (
    <LC href="https://www.navalmanack.com/">
      <Chip>📖 reading</Chip>
      <div className="flex-1 flex items-center justify-center py-2">
        <div className="flex rounded overflow-hidden" style={{ height:110, boxShadow:'4px 4px 16px rgba(0,0,0,.55)' }}>
          <div className="w-3.5 flex-shrink-0" style={{ background:'linear-gradient(to right,#b8860b,#daa520,#b8860b)' }} />
          <div className="flex flex-col items-center justify-center px-3 py-2 gap-1 text-center" style={{ background:'linear-gradient(160deg,#1a1200,#2d1f00)', borderLeft:'1px solid rgba(218,165,32,.25)', width:100 }}>
            <div className="text-[0.55rem] font-bold" style={{ color:'#daa520', lineHeight:1.3 }}>The Almanack of Naval Ravikant</div>
            <div className="text-[0.46rem]" style={{ color:'rgba(218,165,32,.55)' }}>Eric Jorgenson</div>
            <div className="text-[0.7rem]" style={{ color:'rgba(218,165,32,.35)' }}>◆</div>
          </div>
        </div>
      </div>
      <p className="text-[0.6rem] italic text-center mt-1" style={{ color:'var(--text-light)' }}>on wealth & happiness</p>
    </LC>
  )
}

/* ── WATCHING ───────────────────────────────────────── */
function WatchCard() {
  return (
    <LC href={`https://letterboxd.com/${LB_USER}/films/diary/`}>
      <Chip>🎬 watching</Chip>
      <div className="flex gap-2 flex-1">
        {/* CSS-drawn BB poster — no CDN dependency */}
        <div className="rounded flex-shrink-0 overflow-hidden" style={{
          width:52, height:75,
          boxShadow:'3px 3px 12px rgba(0,0,0,.6)',
          background:'linear-gradient(160deg,#0a0a0a 0%,#1a1a00 100%)',
          border:'1px solid #2a2a00',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          padding:'4px 3px', gap:2,
        }}>
          <div style={{
            width:14, height:14,
            borderRadius:'50%',
            background:'radial-gradient(circle,#a3e635 0%,#4ade80 40%,#166534 100%)',
            boxShadow:'0 0 8px #4ade8088',
            flexShrink:0,
          }}/>
          <div style={{ fontSize:'0.38rem', fontWeight:800, color:'#e8c547', textAlign:'center', lineHeight:1.2, letterSpacing:'0.02em' }}>
            BREAKING<br/>BAD
          </div>
          <div style={{ fontSize:'0.3rem', color:'rgba(232,197,71,0.4)', letterSpacing:'0.1em', textTransform:'uppercase' }}>AMC</div>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <div className="text-base font-bold" style={{ color:'var(--text)' }}>Breaking Bad</div>
          <div className="text-[0.6rem]" style={{ color:'var(--text-light)' }}>AMC · Drama · 2008</div>
          <div className="h-0.5 rounded overflow-hidden mt-1 mb-1" style={{ background:'var(--tag-bg)' }}>
            <div className="h-full rounded" style={{ width:'62%', background:'linear-gradient(90deg,#e8c547,#f0a500)', animation:'progress-glow 3s ease-in-out infinite' }} />
          </div>
          <div className="text-[0.57rem] italic" style={{ color:'var(--text-light)' }}>currently bingeing</div>
        </div>
      </div>
      <div className="text-[0.62rem] font-bold mt-2" style={{ color:'var(--accent)' }}>★ 9.5 / 10</div>
    </LC>
  )
}

/* ── RESUME ─────────────────────────────────────────── */
function ResumeCard() {
  return (
    <LC href={PROFILE.links.resume}>
      <Chip>📄 résumé</Chip>
      <div className="flex-1 flex flex-col gap-1 py-1">
        <div className="text-sm font-bold" style={{ color:'var(--text)' }}>{PROFILE.name}</div>
        <div className="text-[0.62rem]" style={{ color:'var(--text-dim)' }}>Backend & AI Developer</div>
        <div className="h-px my-1" style={{ background:'var(--border)' }} />
        {['Node.js · Express · REST','PostgreSQL · MongoDB · Redis','LLMs · RAG · Embeddings'].map(line => (
          <div key={line} className="flex items-center gap-2 text-[0.6rem]" style={{ color:'var(--text-dim)' }}>
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background:'var(--accent)', opacity:.7 }} />
            {line}
          </div>
        ))}
      </div>
      <div className="text-[0.6rem] border-t pt-2 mt-1" style={{ color:'var(--accent)', borderColor:'var(--border)' }}>open PDF ↗</div>
    </LC>
  )
}

/* ── LOCATION ───────────────────────────────────────── */
function LocationCard() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { timeZone:'Asia/Kolkata', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true }))
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t)
  }, [])
  return (
    <LC>
      <Chip>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        Karur, India
      </Chip>
      <div className="text-2xl font-bold tabular-nums" style={{ color:'var(--accent)', filter:'drop-shadow(0 0 8px rgba(232,197,71,.35))', lineHeight:1 }}>{time}</div>
      <div className="text-[0.57rem] mb-2 mt-0.5" style={{ color:'var(--text-light)' }}>{PROFILE.timezone}</div>
      <div className="text-2xl leading-none mb-2">🇮🇳</div>
      <div className="text-[0.56rem] px-2 py-0.5 rounded-full border w-fit tracking-widest uppercase"
        style={{ color:'var(--accent)', borderColor:'rgba(232,197,71,.3)', background:'rgba(232,197,71,.08)' }}>
        open to remote ✦
      </div>
    </LC>
  )
}

/* ── X CARD ─────────────────────────────────────────── */
function XCard() {
  return (
    <LC href='https://x.com/kraxonstar'>
      <Chip>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.626L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
        @kraxonstar
      </Chip>
      <div className="text-base font-bold mb-1" style={{ color:'var(--text)' }}>Kishore Prabakar</div>
      <div className="text-[0.68rem] flex-1" style={{ color:'var(--text-dim)', lineHeight:1.5 }}>
        backend & ai developer. building scalable things. tech optimist.
      </div>
      <div className="text-[0.6rem] mt-2" style={{ color:'var(--accent)' }}>view profile →</div>
    </LC>
  )
}

/* ── CHESS ──────────────────────────────────────────── */
type ChessData = { rapid?: number; blitz?: number; bullet?: number; wins: number; losses: number; draws: number }
function ChessCard() {
  const [data, setData] = useState<ChessData | null>(null)
  const [live, setLive] = useState<'ok'|'err'|''>('')

  useEffect(() => {
    const cached = cacheGet<ChessData>('chess_stats')
    if (cached) { setData(cached); setLive('ok'); return }
    fetch(`https://api.chess.com/pub/player/${CHESS_USER}/stats`)
      .then(r => r.ok ? r.json() : null)
      .then(s => {
        if (!s) { setLive('err'); return }
        let w = 0, l = 0, d = 0
        const get = (k: string) => {
          const m = s[k]; if (!m) return undefined
          const r = m.record || {}; w += r.win||0; l += r.loss||0; d += r.draw||0
          return m.last?.rating
        }
        const data: ChessData = { rapid: get('chess_rapid'), blitz: get('chess_blitz'), bullet: get('chess_bullet'), wins:w, losses:l, draws:d }
        setData(data); setLive('ok'); cacheSet('chess_stats', data)
      }).catch(() => setLive('err'))
  }, [])

  return (
    <LC href={`https://www.chess.com/member/${CHESS_USER}`}>
      <div className="flex items-center gap-1 mb-2">
        <Chip>♟ Chess.com</Chip>
        <Pip color={live === 'ok' ? '#4ade80' : live === 'err' ? '#f87171' : '#4e5560'} />
      </div>
      {data ? (
        <>
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {[['Rapid',data.rapid],['Blitz',data.blitz],['Bullet',data.bullet]].map(([lbl,val]) => (
              <div key={lbl} className="rounded-lg text-center py-2" style={{ background:'var(--tag-bg)', border:'1px solid var(--border)' }}>
                <div className="text-[0.5rem] uppercase tracking-wider mb-0.5" style={{ color:'var(--text-light)' }}>{lbl}</div>
                <div className="text-lg font-bold" style={{ color:'var(--accent)', filter:'drop-shadow(0 0 4px rgba(232,197,71,.3))' }}>{val ?? '—'}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 text-[0.6rem] border-t pt-2" style={{ borderColor:'var(--border)' }}>
            <span style={{ color:'#4ade80', fontWeight:600 }}>▲ {data.wins}W</span>
            <span style={{ color:'#f87171', fontWeight:600 }}>▼ {data.losses}L</span>
            <span style={{ color:'var(--text-dim)' }}>◆ {data.draws}D</span>
            <span className="ml-auto text-[0.56rem]" style={{ color:'var(--text-light)' }}>
              {data.wins+data.losses+data.draws > 0 ? Math.round(data.wins/(data.wins+data.losses+data.draws)*100) : 0}% · {data.wins+data.losses+data.draws}g
            </span>
          </div>
        </>
      ) : <div className="text-[0.65rem] italic" style={{ color:'var(--text-light)' }}>loading...</div>}
    </LC>
  )
}

/* ── WAKATIME ───────────────────────────────────────── */
type WakaLang = { name: string; text: string; percent: number }
const PAL = ['#e8c547','#f0a500','#c47ed4','#5ba4cf','#4ade80','#f87171']

function WakaCard() {
  const [langs, setLangs] = useState<WakaLang[]>([])
  const [total, setTotal] = useState('')
  const [state, setState] = useState<'load'|'ok'|'err'>('load')
  const svgRef = useRef<SVGSVGElement>(null)

  const render = useCallback((ls: WakaLang[], tot: string) => {
    setLangs(ls); setTotal(tot); setState('ok')
    if (!svgRef.current) return
    const R = 50, CX = 60, CY = 60, C = 2*Math.PI*R, G = 2
    const top = ls.slice(0,5)
    svgRef.current.innerHTML = `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="var(--tag-bg)" stroke-width="10"/>`
    let off = 0
    top.forEach((l, i) => {
      const len = Math.max((l.percent/100)*C - G, 0)
      const el = document.createElementNS('http://www.w3.org/2000/svg','circle')
      el.setAttribute('cx',`${CX}`); el.setAttribute('cy',`${CY}`); el.setAttribute('r',`${R}`)
      el.setAttribute('fill','none'); el.setAttribute('stroke',PAL[i]); el.setAttribute('stroke-width','10')
      el.setAttribute('stroke-linecap','butt'); el.setAttribute('stroke-dasharray',`0 ${C}`)
      el.setAttribute('stroke-dashoffset',`-${off}`)
      el.style.transition = `stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1) ${i*.08}s`
      el.style.filter = `drop-shadow(0 0 3px ${PAL[i]}88)`
      svgRef.current!.appendChild(el)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.setAttribute('stroke-dasharray',`${len} ${C-len}`)
      }))
      off += (l.percent/100)*C
    })
  }, [])

  useEffect(() => {
    const cached = cacheGet<{ languages: WakaLang[]; total: string }>('waka_v4')
    if (cached?.languages?.length) { render(cached.languages, cached.total); return }

    const norm = (d: { languages?: WakaLang[]; grand_total?: { human_readable_total?: string; text?: string } }) => {
      if (!d?.languages?.length) return false
      const ls = d.languages.map((l: WakaLang) => ({ name:l.name, text:l.text, percent:l.percent }))
      const tot = d.grand_total?.human_readable_total || d.grand_total?.text || ''
      cacheSet('waka_v4', { languages:ls, total:tot })
      render(ls, tot)
      return true
    }

    // Step 1: JSONP
    const timer = setTimeout(() => tryProxy(), 5000)
    window._wakaCallback = (r: unknown) => {
      const rd = r as { data?: { languages: WakaLang[]; grand_total: { human_readable_total: string; text: string } } }
      clearTimeout(timer)
      if (!norm((rd?.data ?? rd) as Parameters<typeof norm>[0])) tryProxy()
    }
    const s = document.createElement('script')
    s.onerror = () => { clearTimeout(timer); tryProxy() }
    s.src = `https://wakatime.com/share/@${WAKATIME_USER}/${WAKATIME_HASH}.json?callback=_wakaCallback`
    document.head.appendChild(s)

    async function tryProxy() {
      const url = `https://wakatime.com/api/v1/users/${WAKATIME_USER}/stats/last_7_days`
      const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      ]
      for (const p of proxies) {
        try {
          const res = await Promise.race([fetch(p), new Promise<never>((_,r)=>setTimeout(()=>r(new Error),5000))])
          const body = await res.json()
          const raw = body?.contents ? JSON.parse(body.contents) : body
          if (norm(raw?.data ?? raw)) return
        } catch { continue }
      }
      setState('err')
    }
  }, [render])

  return (
    <LC href={`https://wakatime.com/@${WAKATIME_USER}`}>
      <div className="flex items-center gap-1 mb-1">
        <Chip>⏱ WakaTime</Chip>
        <Pip color={state==='ok'?'#4ade80':state==='err'?'#f87171':'#4e5560'} />
      </div>
      {state === 'err' ? (
        <>
          <img loading="lazy" src={`https://github-readme-stats.vercel.app/api/wakatime?username=${WAKATIME_USER}&hide_border=true&bg_color=141618&title_color=e8c547&text_color=c9cdd4&icon_color=e8c547&langs_count=5&hide_title=true&line_height=26`}
            alt="WakaTime" style={{ width:'100%', borderRadius:5, marginBottom:-18 }} className="dark-only" />
        </>
      ) : state === 'load' ? (
        <div className="h-2 rounded w-1/2 mt-2" style={{ background:'var(--tag-bg)', animation:'skeleton 1.8s ease-in-out infinite' }} />
      ) : (
        <>
          <div className="flex justify-center mb-3">
            <div className="relative" style={{ width:120, height:120 }}>
              <svg ref={svgRef} viewBox="0 0 120 120" style={{ width:120, height:120, transform:'rotate(-90deg)', overflow:'visible' }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-sm font-bold" style={{ color:'var(--text)' }}>
                  {(total||'').replace(/\s*hours?/gi,'h').replace(/\s*mins?/gi,'m').replace(/\s*secs?/gi,'s') || '—'}
                </div>
                <div className="text-[0.5rem] uppercase tracking-wider" style={{ color:'var(--text-light)' }}>this week</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {langs.slice(0,5).map((l,i) => (
              <div key={l.name} className="flex items-center gap-2 text-[0.6rem]">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:PAL[i], boxShadow:`0 0 4px ${PAL[i]}88` }} />
                <span className="flex-1 truncate" style={{ color:'var(--text-dim)' }}>{l.name}</span>
                <span style={{ color:'var(--text-light)' }}>{l.text}</span>
                <span className="w-7 text-right font-bold" style={{ color:'var(--accent)' }}>{l.percent.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </LC>
  )
}

/* ── LEETCODE ───────────────────────────────────────── */
type LCData = { easySolved:number; totalEasy:number; mediumSolved:number; totalMedium:number; hardSolved:number; totalHard:number; totalSolved:number; ranking:number; acceptanceRate:number }
function LeetCodeCard() {
  const [data, setData] = useState<LCData|null>(null)
  const [live, setLive] = useState<'ok'|'err'|''>('')
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const cached = cacheGet<LCData>('lc_stats')
    if (cached) { setData(cached); setLive('ok'); return }
    const apis = [
      `https://leetcode-stats-api.vercel.app/${LEETCODE_USER}`,
      `https://leetcode-stats-api.herokuapp.com/${LEETCODE_USER}`,
    ]
    const tryNext = async (i: number) => {
      if (i >= apis.length) { setLive('err'); return }
      try {
        const res = await Promise.race([fetch(apis[i]), new Promise<never>((_,r)=>setTimeout(()=>r(new Error),10000))])
        const d = await res.json()
        if (!d || d.status==='error' || !d.totalSolved) { tryNext(i+1); return }
        setData(d); setLive('ok'); cacheSet('lc_stats', d)
      } catch { tryNext(i+1) }
    }
    tryNext(0)
  }, [])

  useEffect(() => {
    if (!data || !svgRef.current) return
    const R=32, CX=40, CY=40, C=2*Math.PI*R, G=1.5
    const all = data.totalEasy+data.totalMedium+data.totalHard
    const segs = [
      { val:data.easySolved, tot:data.totalEasy, c:'#00b8a3' },
      { val:data.mediumSolved, tot:data.totalMedium, c:'#ffc01e' },
      { val:data.hardSolved, tot:data.totalHard, c:'#ef4743' },
    ]
    svgRef.current.innerHTML = `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="var(--tag-bg)" stroke-width="8"/>`
    let off = 0
    segs.forEach(s => {
      const frac = all > 0 ? s.val/all : 0
      const len = Math.max(frac*C - G, 0)
      const el = document.createElementNS('http://www.w3.org/2000/svg','circle')
      el.setAttribute('cx',`${CX}`); el.setAttribute('cy',`${CY}`); el.setAttribute('r',`${R}`)
      el.setAttribute('fill','none'); el.setAttribute('stroke',s.c); el.setAttribute('stroke-width','8')
      el.setAttribute('stroke-linecap','butt'); el.setAttribute('stroke-dasharray',`0 ${C}`)
      el.setAttribute('stroke-dashoffset',`-${off}`)
      el.style.transition = `stroke-dasharray 1.1s cubic-bezier(.4,0,.2,1)`
      el.style.filter = `drop-shadow(0 0 3px ${s.c}88)`
      svgRef.current!.appendChild(el)
      requestAnimationFrame(()=>requestAnimationFrame(()=>{ el.setAttribute('stroke-dasharray',`${len} ${C-len}`) }))
      off += frac*C
    })
  }, [data])

  return (
    <LC href={`https://leetcode.com/u/${LEETCODE_USER}/`}>
      <div className="flex items-center gap-1 mb-1">
        <Chip>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg>
          LeetCode
        </Chip>
        <Pip color={live==='ok'?'#4ade80':live==='err'?'#f87171':'#4e5560'} />
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0" style={{ width:80, height:80 }}>
          <svg ref={svgRef} viewBox="0 0 80 80" style={{ width:80, height:80, transform:'rotate(-90deg)', overflow:'visible' }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold" style={{ color:'var(--text)' }}>{data?.totalSolved ?? '—'}</span>
            <span className="text-[0.48rem] uppercase tracking-wider" style={{ color:'var(--text-light)' }}>solved</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          {data && [
            { lbl:'Easy',   val:data.easySolved,   tot:data.totalEasy,   c:'#00b8a3' },
            { lbl:'Medium', val:data.mediumSolved, tot:data.totalMedium, c:'#ffc01e' },
            { lbl:'Hard',   val:data.hardSolved,   tot:data.totalHard,   c:'#ef4743' },
          ].map(s => (
            <div key={s.lbl} className="flex items-center gap-2 text-[0.6rem]">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:s.c, boxShadow:`0 0 4px ${s.c}88` }} />
              <span className="flex-1" style={{ color:'var(--text-dim)' }}>{s.lbl}</span>
              <span style={{ color:'var(--text-light)' }}>{s.val}<span className="text-[0.5rem]">/{s.tot}</span></span>
            </div>
          ))}
          {data?.ranking && (
            <div className="text-[0.56rem] border-t pt-1 mt-0.5" style={{ color:'var(--text-light)', borderColor:'var(--border)' }}>
              rank <strong style={{ color:'var(--accent)' }}>#{data.ranking.toLocaleString()}</strong>
            </div>
          )}
        </div>
      </div>
    </LC>
  )
}

/* ── GRID ───────────────────────────────────────────── */
export default function Life() {
  const ref = useInView()
  return (
    <section id="life" ref={ref as React.RefObject<HTMLElement>} className="reveal">
      <SectionTitle num="06" title="On the Internet" />
      <p className="text-[0.75rem] mb-4" style={{ color:'var(--text-light)', letterSpacing:'.06em' }}>what my life looks like right now</p>
      <div className="life-grid">
        <div style={{ gridArea:'sp' }}><SpotifyCard /></div>
        <div style={{ gridArea:'xc' }}><XCard /></div>
        <div style={{ gridArea:'gh' }}><GitHubCard /></div>
        <div style={{ gridArea:'watch' }}><WatchCard /></div>
        <div style={{ gridArea:'book' }}><BookCard /></div>
        <div style={{ gridArea:'res' }}><ResumeCard /></div>
        <div style={{ gridArea:'loc' }}><LocationCard /></div>
        <div style={{ gridArea:'chess' }}><ChessCard /></div>
        <div style={{ gridArea:'waka' }}><WakaCard /></div>
        <div style={{ gridArea:'leet' }}><LeetCodeCard /></div>
      </div>
      <style>{`
        .life-grid{display:grid;gap:.7rem;grid-template-columns:repeat(4,1fr);grid-template-areas:"sp xc gh gh" "sp watch book res" "loc chess waka leet"}
        .life-grid>div,.life-grid>div>*{height:100%}
        @media(max-width:820px){.life-grid{grid-template-columns:repeat(2,1fr);grid-template-areas:"sp sp" "xc watch" "gh gh" "book res" "loc chess" "waka leet"}}
        @media(max-width:500px){.life-grid{grid-template-columns:1fr;grid-template-areas:"sp""gh""xc""watch""book""res""loc""chess""waka""leet"}}
        @keyframes eq{0%,100%{height:12%}50%{height:var(--eq-h,55%)}}
        @keyframes pip{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.25;transform:scale(.5)}}
        @keyframes progress-glow{0%,100%{box-shadow:none}50%{box-shadow:0 0 6px rgba(232,197,71,.6)}}
        @keyframes skeleton{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      `}</style>
    </section>
  )
}
