import { useMemo, useState } from 'react'
import { api } from './api.js'
import { useAdminData } from './Admin.jsx'
import { AVAILABILITY, asset, formatPrice } from '../../lib/format.js'
import { ProductImage } from '../../components/ProductBits.jsx'

const EMPTY = { name: '', slug: '', category: '', price: '', comparePrice: '', stock: '', availability: 'a-confirmer', hidden: true, featured: false, short: '', description: '', features: [], usage: '', precautions: '', volume: '', adminNote: '', images: [] }

export default function Products({ onAuthLost }) {
  const { data, error, setError, reload } = useAdminData('/catalogue', onAuthLost)
  const [editing, setEditing] = useState(null) // produit en cours d'édition (ou EMPTY)
  const [filter, setFilter] = useState('')
  const catName = useMemo(() => Object.fromEntries((data?.categories || []).map((c) => [c.slug, c.name])), [data])

  if (!data) return <p className="text-ink-600">{error || 'Chargement…'}</p>
  if (editing)
    return <ProductForm initial={editing} categories={data.categories} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); reload() }} onAuthLost={onAuthLost} />

  const list = data.products.filter((p) => !filter || p.category === filter || (filter === '__noprice' && p.price === null) || (filter === '__hidden' && p.hidden))
  const toggle = async (p, key) => {
    try {
      await api(`/produits/${p.id}`, { method: 'PUT', body: { ...p, [key]: !p[key] } })
      reload()
    } catch (e) { e.status === 401 ? onAuthLost() : setError(e.message) }
  }
  const remove = async (p) => {
    if (!window.confirm(`Supprimer définitivement « ${p.name} » ?`)) return
    try { await api(`/produits/${p.id}`, { method: 'DELETE' }); reload() } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Produits ({data.products.length})</h1>
        <div className="flex flex-wrap gap-2">
          <select className="field w-auto" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrer">
            <option value="">Tous les produits</option>
            {data.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            <option value="__noprice">Prix à confirmer</option>
            <option value="__hidden">Masqués</option>
          </select>
          <button type="button" className="btn-primary" onClick={() => setEditing({ ...EMPTY, category: data.categories[0]?.slug || '' })}>Ajouter un produit</button>
        </div>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-ivory-200 text-xs uppercase tracking-wider text-ink-400">
            <tr><th className="p-3">Produit</th><th className="p-3">Catégorie</th><th className="p-3">Prix</th><th className="p-3">Disponibilité / stock</th><th className="p-3">Visible</th><th className="p-3">Populaire</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {list.map((p) => (
              <tr key={p.id} className={p.hidden ? 'bg-ivory/60 text-ink-400' : ''}>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-ivory-200 bg-white"><ProductImage product={p} compact /></span>
                    <span>
                      <span className="block font-medium text-ink">{p.name}</span>
                      {p.adminNote && <span className="block max-w-xs truncate text-xs text-ink-400" title={p.adminNote}>{p.adminNote}</span>}
                    </span>
                  </div>
                </td>
                <td className="p-3">{catName[p.category] || p.category}</td>
                <td className="p-3">{p.price === null ? <span className="whitespace-nowrap rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-gold-600">Prix à confirmer</span> : formatPrice(p.price)}</td>
                <td className="p-3">{AVAILABILITY[p.availability]?.label}{typeof p.stock === 'number' && <span className="block text-xs text-ink-400">Stock : {p.stock}</span>}</td>
                <td className="p-3"><Toggle on={!p.hidden} onClick={() => toggle(p, 'hidden')} label="Visible" /></td>
                <td className="p-3"><Toggle on={p.featured} onClick={() => toggle(p, 'featured')} label="Populaire" /></td>
                <td className="whitespace-nowrap p-3 text-right">
                  <button type="button" className="mr-3 text-emerald hover:underline" onClick={() => setEditing({ ...EMPTY, ...p })}>Modifier</button>
                  <button type="button" className="text-red-700 hover:underline" onClick={() => remove(p)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Toggle({ on, onClick, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-emerald' : 'bg-ink/20'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

function ProductForm({ initial, categories, onCancel, onSaved, onAuthLost }) {
  const [p, setP] = useState({ ...initial, price: initial.price ?? '', comparePrice: initial.comparePrice ?? '', stock: initial.stock ?? '', volume: initial.volume ?? '', featuresText: (initial.features || []).join('\n') })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isNew = !initial.id
  const set = (k) => (e) => setP((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const upload = async (e) => {
    const files = [...e.target.files]
    e.target.value = ''
    setError('')
    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) { setError(`${f.name} dépasse 5 Mo.`); continue }
      try {
        const { src } = await api('/images', { method: 'POST', raw: f })
        setP((x) => ({ ...x, images: [...x.images, { src, alt: x.name }] }))
      } catch (err) { err.status === 401 ? onAuthLost() : setError(err.message) }
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const body = { ...p, features: p.featuresText.split('\n').map((s) => s.trim()).filter(Boolean) }
    try {
      await api(isNew ? '/produits' : `/produits/${initial.id}`, { method: isNew ? 'POST' : 'PUT', body })
      onSaved()
    } catch (err) {
      err.status === 401 ? onAuthLost() : setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const input = (k, label, extra = {}) => (
    <div className={extra.wide ? 'sm:col-span-2' : ''}>
      <label htmlFor={`p-${k}`} className="label">{label}</label>
      {extra.textarea
        ? <textarea id={`p-${k}`} rows={extra.rows || 3} className="field" value={p[k]} onChange={set(k)} />
        : <input id={`p-${k}`} className="field" value={p[k]} onChange={set(k)} {...extra.input} />}
      {extra.help && <p className="mt-1 text-xs text-ink-400">{extra.help}</p>}
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">{isNew ? 'Nouveau produit' : `Modifier : ${initial.name}`}</h1>
        <div className="flex gap-2">
          <button type="button" className="btn-outline" onClick={onCancel}>Annuler</button>
          <button className="btn-primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </div>
      </div>
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}

      <div className="card grid gap-5 p-6 sm:grid-cols-2">
        {input('name', 'Nom exact du produit *', { input: { required: true, maxLength: 140 } })}
        <div>
          <label htmlFor="p-category" className="label">Catégorie *</label>
          <select id="p-category" className="field" value={p.category} onChange={set('category')}>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        {input('price', 'Prix (FCFA)', { input: { inputMode: 'numeric', placeholder: 'Vide = prix à confirmer' }, help: 'Laissez vide si le prix n’est pas confirmé : le site affichera « Prix sur demande ».' })}
        {input('comparePrice', 'Ancien prix (FCFA), seulement pour une vraie promotion', { input: { inputMode: 'numeric' }, help: 'Doit être supérieur au prix actuel. Vide = pas de promotion.' })}
        <div>
          <label htmlFor="p-availability" className="label">Disponibilité</label>
          <select id="p-availability" className="field" value={p.availability} onChange={set('availability')}>
            {Object.entries(AVAILABILITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        {input('stock', 'Stock (facultatif, non affiché aux clients)', { input: { inputMode: 'numeric' }, help: 'À 0, le produit passe automatiquement en rupture.' })}
        {input('volume', 'Contenance / format (si connu)', { input: { placeholder: 'ex. 100 ml, 20 g' } })}
        {input('slug', 'Adresse de la page (slug)', { help: isNew ? 'Laissez vide pour la créer à partir du nom.' : 'Change l’URL de la fiche produit.' })}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-emerald" checked={!p.hidden} onChange={(e) => setP((x) => ({ ...x, hidden: !e.target.checked }))} /> Visible sur le site</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-emerald" checked={p.featured} onChange={set('featured')} /> Afficher dans « Produits populaires »</label>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="text-2xl font-semibold">Photos</h2>
        <div className="flex flex-wrap gap-4">
          {p.images.map((img, i) => (
            <figure key={img.src} className="w-36">
              <div className="h-36 w-36 overflow-hidden rounded-xl border border-ivory-200 bg-white"><img src={asset(img.thumb || img.src)} alt="" className="h-full w-full object-contain" /></div>
              <input className="field mt-2 px-2 py-1.5 text-xs" value={img.alt} placeholder="Texte alternatif" aria-label="Texte alternatif de la photo"
                onChange={(e) => setP((x) => ({ ...x, images: x.images.map((m, j) => (j === i ? { ...m, alt: e.target.value } : m)) }))} />
              <div className="mt-1 flex justify-between text-xs">
                <button type="button" disabled={i === 0} className="text-emerald disabled:opacity-30" onClick={() => setP((x) => { const a = [...x.images]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return { ...x, images: a } })}>← Avant</button>
                <button type="button" className="text-red-700" onClick={() => setP((x) => ({ ...x, images: x.images.filter((_, j) => j !== i) }))}>Retirer</button>
              </div>
            </figure>
          ))}
          <label className="flex h-36 w-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gold/50 text-center text-xs text-ink-600 hover:bg-white">
            <span className="text-2xl text-gold-600">+</span>Ajouter des photos<br />(JPEG, PNG, WebP, 5 Mo max)
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={upload} />
          </label>
        </div>
        <p className="text-xs text-ink-400">Utilisez uniquement de vraies photos du produit. Format carré conseillé, environ 1000 × 1000 pixels.</p>
      </div>

      <div className="card grid gap-5 p-6 sm:grid-cols-2">
        {input('short', 'Résumé (cartes et référencement)', { wide: true, textarea: true, rows: 2 })}
        {input('description', 'Description', { wide: true, textarea: true, rows: 5 })}
        {input('featuresText', 'Caractéristiques vérifiées (une par ligne)', { wide: true, textarea: true, rows: 4 })}
        {input('usage', "Mode d'utilisation", { textarea: true, rows: 4 })}
        {input('precautions', 'Précautions', { textarea: true, rows: 4 })}
        {input('adminNote', 'Note interne (jamais affichée sur le site)', { wide: true, textarea: true, rows: 2 })}
      </div>
    </form>
  )
}
