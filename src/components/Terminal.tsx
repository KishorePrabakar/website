import { useState, useEffect, useRef, useCallback } from 'react'

const PROMPT = 'kishore@portfolio:~$ '

type Line = { type: 'prompt'|'output'|'error'; text: string }

const JOKES = [
  "Why do Java programmers wear glasses? Because they don't C#.",
  "A SQL query walks into a bar, walks up to two tables and asks: Can I join you?",
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "How many programmers does it take to change a light bulb? None — that's a hardware problem.",
]

const LS_FILES = `total 42
drwxr-xr-x  projects/
-rwxr-xr-x  resume.pdf
-rw-r--r--  coffee.sh
-rw-r--r--  README.md
-rwx------  secret_sauce.sh
-rw-r--r--  .config (hidden but you found it)`

function processCommand(cmd: string): Line[] {
  const c = cmd.trim().toLowerCase()
  if (!c) return []

  if (c === 'help') return [{type:'output', text:`
available commands:
  whoami        who is kishore?
  skills        tech stack
  projects      things shipped
  contact       get in touch
  git log       real commit vibes
  ls -la        what's in the folder
  cat secret_sauce.sh
  sudo hire-me  (try it)
  joke          programming humor
  clear         clear terminal
  exit          close terminal
`}]

  if (c === 'whoami') return [{type:'output', text:`
kishore prabakar
backend & ai developer · karur, india
building systems that scale and ml apps that work
currently: writing code, drinking chai, learning rust
`}]

  if (c === 'skills') return [{type:'output', text:`
backend:    Node.js · Express · REST · GraphQL · WebSockets
databases:  PostgreSQL · MongoDB · Redis · SQLite
ai & ml:    LLMs · RAG · Embeddings · Groq API
systems:    Linux · Docker · Git · TCP/HTTP
blockchain: SHA-256 · Merkle Trees · Solidity
`}]

  if (c === 'projects') return [{type:'output', text:`
→ Briefly          AI meeting notes summarizer
→ Sift             Amazon product comparison tool
→ Link Vault       Developer bookmarking API
→ Auth Service     JWT microservice
→ Rate Limiter     Token bucket from scratch
→ Commit Gen       LLM-powered commit messages

github.com/KishorePrabakar
`}]

  if (c === 'contact') return [{type:'output', text:`
email:    kishoreprabakar24@gmail.com
github:   github.com/KishorePrabakar
linkedin: linkedin.com/in/kishoreprabakar24
x:        x.com/KishorePr24
`}]

  if (c === 'git log') return [{type:'output', text:`
* a3f91bc (HEAD) fix: stopped overthinking, shipped instead
* d84cc12 feat: added chai dependency to daily routine
* 9f2b301 refactor: rewrote personality in TypeScript
* c72ae10 fix: removed sleep from schedule (temporary)
* 1a9f3c8 feat: init — committed to the craft
`}]

  if (c === 'ls -la' || c === 'ls') return [{type:'output', text: LS_FILES}]

  if (c === 'cat secret_sauce.sh') return [{type:'output', text:`
#!/bin/bash
echo "curiosity + consistency + chai"
echo "ship it, then make it better"
echo "read more, scroll less"
`}]

  if (c === 'sudo hire-me') return [
    {type:'output', text:'[sudo] password for recruiter: '},
    {type:'output', text:'Authenticating...'},
    {type:'output', text:'✓ Access granted. Opening resume...'},
  ]

  if (c === 'joke') {
    const j = JOKES[Math.floor(Math.random() * JOKES.length)]
    return [{type:'output', text: j}]
  }

  if (c === 'rm -rf /' || c === 'rm -rf /*') return [{type:'error', text:"Permission denied. Also, please don't."}]

  if (c === 'exit' || c === 'quit') return [{type:'output', text:'closing...'}]
  if (c === 'clear') return [{type:'output', text:'__CLEAR__'}]

  if (c.startsWith('cat ')) return [{type:'error', text:`cat: ${cmd.slice(4)}: No such file or directory`}]
  if (c.startsWith('cd '))  return [{type:'error', text:`cd: ${cmd.slice(3)}: permission denied (this is a portfolio, not your shell)`}]

  return [{type:'error', text:`command not found: ${cmd.split(' ')[0]}. Type 'help' for commands.`}]
}

interface Props { open: boolean; onClose: () => void }

export default function Terminal({ open, onClose }: Props) {
  const [lines, setLines]  = useState<Line[]>([
    { type:'output', text:"kishore's portfolio terminal v1.0.0" },
    { type:'output', text:"type 'help' for available commands." },
    { type:'output', text:'' },
  ])
  const [input, setInput]   = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef  = useRef<HTMLInputElement>(null)
  const bodyRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) { setInput(''); setTimeout(() => inputRef.current?.focus(), 80) }
  }, [open])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  const run = useCallback((cmd: string) => {
    if (!cmd.trim()) return
    const newLines: Line[] = [{ type:'prompt', text: PROMPT + cmd }]
    const result = processCommand(cmd)

    if (result.some(r => r.text === '__CLEAR__')) {
      setLines([{ type:'output', text:'' }])
      setInput('')
      return
    }

    if (cmd.trim().toLowerCase() === 'sudo hire-me') {
      setLines(l => [...l, ...newLines, ...result])
      setTimeout(() => window.open('https://drive.google.com/file/d/1PbiStNiqqVVH7gHYKMWmHeXZQKbFeJ0B/view', '_blank'), 800)
    } else {
      setLines(l => [...l, ...newLines, ...result])
    }

    setHistory(h => [cmd, ...h.slice(0, 49)])
    setHistIdx(-1)
    setInput('')
  }, [])

  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { run(input); return }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const ni = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(ni)
      setInput(history[ni] ?? '')
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const ni = Math.max(histIdx - 1, -1)
      setHistIdx(ni)
      setInput(ni === -1 ? '' : history[ni] ?? '')
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const commands = ['help','whoami','skills','projects','contact','git log','ls -la','cat secret_sauce.sh','sudo hire-me','joke','clear','exit']
      const match = commands.find(c => c.startsWith(input.toLowerCase()))
      if (match) setInput(match)
    }
    if (e.key === 'Escape') onClose()
  }, [input, history, histIdx, run, onClose])

  if (!open) return null

  const colors: Record<string, string> = { prompt:'#e8c547', output:'#7a8290', error:'#f87171' }

  return (
    <div className="terminal-backdrop" onClick={onClose}>
      <div className="terminal-box" onClick={e => e.stopPropagation()} style={{ maxWidth:640 }}>
        {/* Title bar */}
        <div className="terminal-bar">
          <span className="terminal-dot" style={{ background:'#ff5f57' }} />
          <span className="terminal-dot" style={{ background:'#ffbd2e' }} />
          <span className="terminal-dot" style={{ background:'#28c941' }} />
          <span style={{ flex:1, textAlign:'center', fontSize:'0.7rem', color:'#555' }}>
            kishore@portfolio — bash
          </span>
        </div>
        {/* Body */}
        <div ref={bodyRef} className="terminal-body">
          {lines.map((l, i) => (
            <div key={i} style={{ color: colors[l.type] || '#c9cdd4', whiteSpace:'pre-wrap', lineHeight:1.7, fontSize:'0.78rem' }}>
              {l.text}
            </div>
          ))}
          {/* Input row */}
          <div className="terminal-input-row">
            <span style={{ color:'#e8c547', fontSize:'0.78rem', flexShrink:0 }}>{PROMPT}</span>
            <input
              ref={inputRef}
              className="terminal-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              autoComplete="off"
              spellCheck={false}
              style={{ fontSize:'0.78rem' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
