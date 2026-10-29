import { api } from './api.js'
import { useAdminData } from './Admin.jsx'
import { formatPrice } from '../../lib/format.js'

const STATUS = { nouvelle: 'bg-gold-100 text-gold-600', 'confirmée': 'bg-emerald-50 text-emerald-700', 'livrée': 'bg-forest text-ivory', 'annulée': 'bg-ink/10 text-ink-600' }

export default function Orders({ onAuthLost }) {
  const { data, error, setError, reload } = useAdminData('/commandes', onAuthLost)
  if (!data) return <p className="text-ink-600">{error || 'Chargement…'}</p>
  const patch = async (o, body) => {
    try { await api(`/commandes/${o.reference}`, { method: 'PATCH', body }); reload() } catch (e) { e.status === 401 ? onAuthLost() : setError(e.message) }
  }
  const remove = async (o) => {
    if (!window.confirm(`Supprimer la demande ${o.reference} et les coordonnées du client ?`)) return
    try { await api(`/commandes/${o.reference}`, { method: 'DELETE' }); reload() } catch (e) { setError(e.message) }
  }
  return (
    <div>
      <h1 className="mb-2 text-3xl font-semibold">Demandes de commande ({data.length})</h1>
      <p className="mb-6 max-w-3xl text-sm text-ink-600">
        Chaque demande est enregistrée quand le client ouvre WhatsApp depuis la page de commande. Vérifiez que son message est bien arrivé sur WhatsApp avant de la traiter.
      </p>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}
      {data.length === 0 && <p className="card p-8 text-center text-ink-600">Aucune demande pour le moment.</p>}
      <div className="space-y-4">
        {data.map((o) => (
          <article key={o.reference} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-forest">{o.reference}</p>
                <p className="text-xs text-ink-400">{new Date(o.createdAt).toLocaleString('fr-FR')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS[o.status]}`}>{o.status}</span>
                <select className="field w-auto py-1.5 text-xs" value={o.status} onChange={(e) => patch(o, { status: e.target.value })} aria-label="Changer le statut">
                  {Object.keys(STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <p className="font-medium">{o.customer.name}</p>
                <p><a className="text-emerald hover:underline" href={`https://wa.me/${o.customer.phone.replace(/\D/g, '').replace(/^(?!221)(\d{9})$/, '221$1')}`} target="_blank" rel="noopener noreferrer">{o.customer.phone}</a></p>
                <p className="text-ink-600">{o.customer.address}, {o.customer.zone}</p>
                {o.customer.notes && <p className="mt-1 text-ink-600">Notes : {o.customer.notes}</p>}
              </div>
              <ul className="space-y-1">
                {o.items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-3"><span>{it.name} × {it.qty}</span><span>{it.price === null ? 'à confirmer' : formatPrice(it.price * it.qty)}</span></li>
                ))}
                <li className="flex justify-between border-t border-ivory-200 pt-1 font-semibold"><span>Total articles</span><span>{formatPrice(o.subtotal)}{o.hasUnpriced ? ' +' : ''}</span></li>
              </ul>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input className="field flex-1 py-2 text-sm" defaultValue={o.note} placeholder="Note interne (frais de livraison convenus, paiement…)" onBlur={(e) => e.target.value !== o.note && patch(o, { note: e.target.value })} aria-label="Note interne" />
              <button type="button" className="text-sm text-red-700 hover:underline" onClick={() => remove(o)}>Supprimer</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
