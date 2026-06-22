interface Props { available: boolean }
export default function AvailableBadge({ available }: Props) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.62rem] font-bold tracking-widest uppercase border"
      style={{
        color: available ? '#4ade80' : '#f87171',
        borderColor: available ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)',
        background: available ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: available ? '#4ade80' : '#f87171',
          boxShadow: `0 0 5px ${available ? '#4ade80' : '#f87171'}`,
          animation: 'pip 2.2s ease-in-out infinite',
        }}
      />
      {available ? 'open to opportunities' : 'not looking'}
    </div>
  )
}
