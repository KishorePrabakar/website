interface Props { label: string; accent?: boolean }
export default function Tag({ label, accent }: Props) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-[0.68rem] rounded border"
      style={{
        background: accent ? 'rgba(232,197,71,0.1)' : 'var(--tag-bg)',
        borderColor: accent ? 'rgba(232,197,71,0.3)' : 'var(--border)',
        color: accent ? 'var(--accent)' : 'var(--text-dim)',
      }}
    >
      {label}
    </span>
  )
}
