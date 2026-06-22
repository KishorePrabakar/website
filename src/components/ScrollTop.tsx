import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const fn = () => setShow(window.scrollY > window.innerHeight * 0.5)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <button
      onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
      className="fixed bottom-7 right-6 z-50 w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background:'var(--bg-raised)', borderColor:'var(--border)', color:'var(--text-light)',
        opacity: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none',
      }}
      aria-label="Back to top"
    >
      <ArrowUp size={13} />
    </button>
  )
}
