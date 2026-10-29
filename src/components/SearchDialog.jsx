import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCatalog } from '../lib/catalog.jsx'
import { CloseIcon, SearchIcon } from './Icons.jsx'
import { ProductImage, Price } from './ProductBits.jsx'

export const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function SearchDialog({ onClose }) {
  const { products, catBySlug } = useCatalog()
  const [q, setQ] = useState('')
  const input = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    input.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = useMemo(() => {
    const n = normalize(q.trim())
    if (!n) return []
    return products.filter((p) => normalize(`${p.name} ${catBySlug[p.category]?.name || ''}`).includes(n)).slice(0, 8)
  }, [q, products, catBySlug])

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Recherche">
      <div className="absolute inset-0 bg-forest-900/50" onClick={onClose} />
      <div className="relative mx-auto mt-0 w-full max-w-2xl bg-white p-4 shadow-xl sm:mt-20 sm:rounded-2xl sm:p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            navigate(`/boutique?q=${encodeURIComponent(q.trim())}`)
            onClose()
          }}
          className="flex items-center gap-3 border-b border-ink/10 pb-3"
        >
          <SearchIcon className="h-5 w-5 text-ink-400" />
          <label htmlFor="search-q" className="sr-only">Rechercher un produit</label>
          <input id="search-q" ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit…" className="flex-1 bg-transparent py-2 text-base outline-none" autoComplete="off" />
          <button type="button" onClick={onClose} className="rounded-full p-2 text-ink-600" aria-label="Fermer la recherche"><CloseIcon /></button>
        </form>
        <ul className="max-h-[60vh] overflow-y-auto">
          {results.map((p) => (
            <li key={p.id}>
              <Link to={`/produit/${p.slug}`} onClick={onClose} className="flex items-center gap-4 rounded-xl p-2 hover:bg-ivory">
                <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-ivory-200 bg-white"><ProductImage product={p} compact /></span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-ink-400">{catBySlug[p.category]?.name}</span>
                </span>
                <Price product={p} className="ml-auto text-sm" />
              </Link>
            </li>
          ))}
          {q.trim() && results.length === 0 && <li className="py-6 text-center text-sm text-ink-600">Aucun produit ne correspond à « {q} ».</li>}
        </ul>
      </div>
    </div>
  )
}
