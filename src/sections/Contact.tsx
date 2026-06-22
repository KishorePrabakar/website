import { useState } from 'react'
import { useInView } from '../hooks/useInView'
import SectionTitle from '../components/SectionTitle'
import { PROFILE, FORMSPREE_ID } from '../data'
import { Send, Github, Linkedin, Twitter } from 'lucide-react'

export default function Contact() {
  const ref = useInView()
  const [status, setStatus] = useState<'idle'|'sending'|'ok'|'err'>('idle')
  const [form, setForm] = useState({ name:'', email:'', message:'' })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method:'POST', headers:{ 'Accept':'application/json' },
        body: new FormData(e.target as HTMLFormElement),
      })
      setStatus(res.ok ? 'ok' : 'err')
    } catch { setStatus('err') }
  }

  const socials = [
    { icon: Github,   href: PROFILE.links.github,   label:'GitHub' },
    { icon: Linkedin, href: PROFILE.links.linkedin,  label:'LinkedIn' },
    { icon: Twitter,  href: 'https://x.com/kraxonstar',         label:'X / Twitter' },
  ]

  return (
    <section id="contact" ref={ref as React.RefObject<HTMLElement>} className="reveal">
      <SectionTitle num="07" title="Contact" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left */}
        <div>
          <p className="text-sm mb-4 leading-relaxed" style={{ color:'var(--text-dim)' }}>
            Open to backend roles, AI/ML projects, freelance work, and interesting ideas. Reach out — I usually reply within a day.
          </p>
          <a href={`mailto:${PROFILE.email}`}
            className="block text-sm mb-5 transition-colors hover:text-[var(--accent)]"
            style={{ color:'var(--accent)' }}>
            {PROFILE.email}
          </a>
          <div className="flex gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] hover:-translate-y-0.5"
                style={{ borderColor:'var(--border)', color:'var(--text-dim)', background:'var(--bg-raised)' }}>
                <Icon size={12} /> {label}
              </a>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input name="name" required placeholder="Name"
            value={form.name} onChange={set('name')} className="form-field" />
          <input name="email" type="email" required placeholder="Email"
            value={form.email} onChange={set('email')} className="form-field" />
          <textarea name="message" required placeholder="Message" rows={4}
            value={form.message} onChange={set('message')} className="form-field" />

          {status === 'ok' && (
            <p className="text-xs" style={{ color:'#4ade80' }}>✓ Message sent! I'll reply soon.</p>
          )}
          {status === 'err' && (
            <p className="text-xs" style={{ color:'#f87171' }}>Something went wrong. Try emailing directly.</p>
          )}

          <button type="submit" disabled={status === 'sending'}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold tracking-wider uppercase transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background:'var(--accent)', color:'#000' }}>
            <Send size={12} />
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  )
}
