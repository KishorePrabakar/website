import { useEffect, useRef } from 'react'
import { useTypewriter } from '../hooks/useTypewriter'
import AvailableBadge from '../components/AvailableBadge'
import { PROFILE, TYPEWRITER_PHRASES } from '../data'

interface Props { onOpenTerminal: () => void }

export default function Hero({ onOpenTerminal }: Props) {
  const { text } = useTypewriter(TYPEWRITER_PHRASES)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => ref.current?.classList.add('animated'), 100)
  }, [])

  return (
    <div ref={ref} className="hero-center text-center py-10">
      <div
        className="text-xs tracking-widest uppercase mb-3"
        style={{ color:'var(--text-light)', animation:'fadeUp .6s ease .1s both' }}
      >
        hey, i'm
      </div>

      <h1
        className="font-bold mb-3 leading-tight"
        style={{
          fontSize:'clamp(2rem,5vw,3.5rem)',
          color:'var(--text)',
          letterSpacing:'-0.02em',
          animation:'fadeUp .7s ease .25s both',
        }}
      >
        {PROFILE.name}
      </h1>

      <div
        className="text-base mb-1 min-h-[1.6em]"
        style={{ color:'var(--accent)', animation:'fadeUp .6s ease .45s both' }}
      >
        <span style={{ opacity:.5 }}>$ </span>
        <span>{text}</span>
        <span style={{ animation:'blink 1s step-end infinite' }}>▋</span>
      </div>

      <p
        className="text-sm mb-5"
        style={{ color:'var(--text-dim)', animation:'fadeUp .6s ease .6s both' }}
      >
        {PROFILE.tag}
      </p>

      <div
        className="flex justify-center mb-5"
        style={{ animation:'fadeUp .6s ease .7s both' }}
      >
        <AvailableBadge available={PROFILE.available} />
      </div>

      <div
        className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-sm"
        style={{ animation:'fadeUp .6s ease .8s both' }}
      >
        {Object.entries(PROFILE.links).map(([key, url], i, arr) => (
          <span key={key} className="flex items-center gap-3">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="capitalize" style={{ color:'var(--accent)' }}>
              {key === 'x' ? 'X' : key === 'leetcode' ? 'LeetCode' : key.charAt(0).toUpperCase()+key.slice(1)}
            </a>
            {i < arr.length - 1 && <span style={{ color:'var(--text-light)' }}>·</span>}
          </span>
        ))}
      </div>

      <div
        className="mt-6 flex justify-center gap-2"
        style={{ animation:'fadeUp .6s ease .95s both' }}
      >
        <button
          onClick={onOpenTerminal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all hover:-translate-y-0.5"
          style={{ borderColor:'var(--border)', color:'var(--text-dim)', background:'var(--bg-raised)' }}
        >
          <span style={{ color:'var(--accent)' }}>$</span> open terminal
        </button>
      </div>
    </div>
  )
}
