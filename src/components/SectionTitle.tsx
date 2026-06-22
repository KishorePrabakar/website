interface Props { num: string; title: string }
export default function SectionTitle({ num, title }: Props) {
  return (
    <h2
      className="text-xl font-bold mb-6 relative inline-block"
      style={{ color: 'var(--text)' }}
    >
      {num} / {title}
      <span
        className="absolute -bottom-1 left-0 h-0.5 w-full"
        style={{ background:'linear-gradient(to right, var(--accent), transparent)', opacity:0.4 }}
      />
    </h2>
  )
}
