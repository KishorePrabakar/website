import { useState, useEffect } from 'react'

export function useTypewriter(phrases: string[]) {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<'typing'|'pausing'|'deleting'>('typing')
  const [idx, setIdx]   = useState(0)
  const [charIdx, setCharIdx] = useState(0)

  useEffect(() => {
    const phrase = phrases[idx]
    if (phase === 'typing') {
      if (charIdx < phrase.length) {
        const t = setTimeout(() => { setText(phrase.slice(0, charIdx+1)); setCharIdx(c => c+1) }, 55)
        return () => clearTimeout(t)
      } else {
        if (idx === phrases.length - 1) return
        const t = setTimeout(() => setPhase('pausing'), 1800)
        return () => clearTimeout(t)
      }
    }
    if (phase === 'pausing') {
      const t = setTimeout(() => setPhase('deleting'), 400)
      return () => clearTimeout(t)
    }
    if (phase === 'deleting') {
      if (charIdx > 0) {
        const t = setTimeout(() => { setText(phrase.slice(0, charIdx-1)); setCharIdx(c => c-1) }, 28)
        return () => clearTimeout(t)
      } else {
        setIdx(i => (i+1) % phrases.length)
        setPhase('typing')
      }
    }
  }, [text, phase, charIdx, idx, phrases])

  return { text, done: phase === 'typing' && charIdx === phrases[idx].length && idx === phrases.length - 1 }
}
