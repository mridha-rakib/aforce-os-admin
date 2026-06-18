interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
}

export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-neon' : 'bg-slate-700'}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  )
}
