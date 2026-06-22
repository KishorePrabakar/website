import { useEffect } from 'react'

export function useScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById('scroll-progress')
    if (!bar) return
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      const pct   = total > 0 ? (window.scrollY / total) * 100 : 0
      bar.style.width = pct + '%'
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
}
