import { useEffect, useRef } from 'react'

export function useInView(className = 'in-view') {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.add('reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add(className); obs.unobserve(e.target) } })
    }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [className])
  return ref
}
