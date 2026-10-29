import { useEffect, useState } from 'react'
import { api } from './api.js'
import { useAdminData } from './Admin.jsx'
import { asset } from '../../lib/format.js'

export default function Categories({ onAuthLost }) {
  const { data, error, setError, reload } = useAdminData('/catalogue', onAuthLost)
  const [list, setList] = useState(null)
  const [saved, setSaved] = useState(false)
  useEffect(() => { if (data) setList(data.categories) }, [data])
  if (!list) return <p className="text-ink-600">{error || 'Chargement…'}</p>

  const count = (slug) => data.products.filter((p) => p.category === slug).length
  const update = (i, k, v) => { setSaved(false); setList((l) => l.map((c, j) => (j === i ? { ...c, [k]: v } : c))) }
  const move = (i, d) => setList((l) => { const a = [...l]; [a[i], a[i + d]] = [a[i + d], a[i]]; return a })
  const uploadImage = async (i, file) => {
    try { const { src } = await api('/images', { method: 'POST', raw: file }); update(i, 'image', src) } catch (e) { e.status === 401 ? onAuthLost() : setError(e.message) }
  }
  const save = async () => {
    setError('')
    try { await api('/categories', { method: 'PUT', body: list }); setSaved(true); reload() } catch (e) { e.status === 401 ? onAuthLost() : setError(e.message) }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Catégories</h1>
        <div className="flex gap-2">
          <button type="button" className="btn-outline" onClick={() => setList((l) => [...l, { slug: '', name: '', description: '', image: '', imageAlt: '', hidden: true }])}>Ajouter une catégorie</button>
          <button type="button" className="btn-primary" onClick={save}>Enregistrer</button>
        </div>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}
      {saved && <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Catégories enregistrées.</p>}
      <div className="space-y-4">
        {list.map((c, i) => (
          <div key={i} className="card grid gap-4 p-5 md:grid-cols-[120px_1fr_auto]">
            <label className="flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-gold/50 bg-white text-center text-xs text-ink-600">
              {c.image ? <img src={asset(c.image)} alt="" className="h-full w-full object-cover" /> : 'Ajouter une photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files[0] && uploadImage(i, e.target.files[0])} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field" placeholder="Nom" value={c.name} onChange={(e) => update(i, 'name', e.target.value)} aria-label="Nom de la catégorie" />
              <input className="field" placeholder="Adresse (slug), ex. soins-visage" value={c.slug} disabled={count(c.slug) > 0} onChange={(e) => update(i, 'slug', e.target.value)} aria-label="Adresse de la catégorie" />
              <textarea className="field sm:col-span-2" rows="2" placeholder="Description" value={c.description} onChange={(e) => update(i, 'description', e.target.value)} aria-label="Description" />
              <p className="text-xs text-ink-400">{count(c.slug)} produit(s)</p>
            </div>
            <div className="flex flex-row items-start gap-3 text-sm md:flex-col">
              <label className="flex items-center gap-2"><input type="checkbox" className="accent-emerald" checked={!c.hidden} onChange={(e) => update(i, 'hidden', !e.target.checked)} /> Visible</label>
              <button type="button" disabled={i === 0} className="text-emerald disabled:opacity-30" onClick={() => move(i, -1)}>Monter</button>
              <button type="button" disabled={i === list.length - 1} className="text-emerald disabled:opacity-30" onClick={() => move(i, 1)}>Descendre</button>
              {count(c.slug) === 0 && <button type="button" className="text-red-700" onClick={() => setList((l) => l.filter((_, j) => j !== i))}>Supprimer</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
