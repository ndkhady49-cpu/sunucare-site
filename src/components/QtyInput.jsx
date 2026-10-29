import { MinusIcon, PlusIcon } from './Icons.jsx'

export default function QtyInput({ value, onChange, label = 'Quantité', small = false }) {
  const h = small ? 'h-9' : 'h-12'
  return (
    <div className={`inline-flex ${h} items-center rounded-full border border-ink/15 bg-white`} role="group" aria-label={label}>
      <button type="button" className={`${h} w-10 rounded-l-full text-forest hover:bg-ivory disabled:opacity-40`} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Diminuer la quantité">
        <MinusIcon className="mx-auto h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min="1"
        max="99"
        value={value}
        onChange={(e) => onChange(Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1)))}
        className="w-10 bg-transparent text-center text-sm font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        aria-label={label}
      />
      <button type="button" className={`${h} w-10 rounded-r-full text-forest hover:bg-ivory disabled:opacity-40`} onClick={() => onChange(value + 1)} disabled={value >= 99} aria-label="Augmenter la quantité">
        <PlusIcon className="mx-auto h-4 w-4" />
      </button>
    </div>
  )
}
