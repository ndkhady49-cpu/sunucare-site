import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart, cartTotals } from '../store/cart.js'
import { useSeo } from '../lib/seo.js'
import { asset, formatPrice } from '../lib/format.js'
import { PageHero } from '../components/Ui.jsx'
import { WhatsAppIcon } from '../components/Icons.jsx'
import { orderMessage, waLink } from '../lib/whatsapp.js'

const ZONES = ['Dakar', 'Pikine', 'Guédiawaye', 'Keur Massar', 'Rufisque', 'Thiès', 'Mbour', 'Saint-Louis', 'Touba', 'Kaolack', 'Ziguinchor']
const EMPTY = { name: '', phone: '', address: '', zone: '', notes: '' }

// Enregistre la demande côté serveur si l'API est disponible (pour l'administration). Sans serveur, on passe directement à WhatsApp.
async function saveOrder(payload) {
  if (import.meta.env.VITE_STATIC_ONLY) return null
  try {
    const r = await fetch('/api/commandes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!r.ok || !r.headers.get('content-type')?.includes('json')) return null
    return (await r.json()).reference || null
  } catch {
    return null
  }
}

export default function Checkout() {
  useSeo({ title: 'Validation de commande', description: 'Finalisez votre commande SunuCare Shop sur WhatsApp.', noindex: true })
  const { items, clear } = useCart()
  const totals = cartTotals(items)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(null) // { link, reference }
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 2) e.name = 'Indiquez votre nom.'
    const digits = form.phone.replace(/\D/g, '')
    if (digits.length < 9 || digits.length > 15) e.phone = 'Indiquez un numéro valide, par exemple 77 123 45 67.'
    if (form.address.trim().length < 4) e.address = 'Indiquez votre adresse de livraison.'
    if (form.zone.trim().length < 2) e.zone = 'Indiquez votre ville ou zone.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setBusy(true)
    // Fenêtre ouverte tout de suite (sinon le navigateur peut la bloquer), puis dirigée vers WhatsApp
    const win = window.open('', '_blank')
    const customer = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]))
    const reference = await saveOrder({ customer, items: items.map(({ id, qty }) => ({ id, qty })) })
    const link = waLink(orderMessage({ items, ...totals, customer, reference }))
    if (win) win.location.href = link
    else window.location.href = link
    setSent({ link, reference })
    window.scrollTo(0, 0)
    setBusy(false)
  }

  if (sent) {
    return (
      <>
        <PageHero title="Dernière étape : envoyez votre message" />
        <div className="container-x max-w-2xl py-12">
          <div className="card p-8 text-center">
            <WhatsAppIcon className="mx-auto h-12 w-12 text-[#1F8F4E]" />
            <p className="mt-4 text-[15px] leading-7 text-ink">
              WhatsApp s'est ouvert avec votre demande de commande{sent.reference ? <> (réf. <strong>{sent.reference}</strong>)</> : null}.
              <strong> Appuyez sur « Envoyer » dans WhatsApp</strong> pour la transmettre à la boutique.
            </p>
            <p className="mt-3 text-sm text-ink-600">
              Votre commande n'est pas encore validée : SunuCare Shop vous répondra pour confirmer la disponibilité, les frais de livraison et le total.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a href={sent.link} target="_blank" rel="noopener noreferrer" className="btn-wa"><WhatsAppIcon /> Rouvrir WhatsApp</a>
              <button type="button" className="btn-outline" onClick={() => { clear(); setSent(null) }}>J'ai envoyé le message, vider le panier</button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!items.length) {
    return (
      <>
        <PageHero title="Validation de commande" />
        <div className="container-x py-16 text-center">
          <p className="font-display text-2xl text-forest">Votre panier est vide.</p>
          <Link to="/boutique" className="btn-primary mt-6">Découvrir la boutique</Link>
        </div>
      </>
    )
  }

  const field = (k, label, props = {}) => (
    <div className={props.wide ? 'sm:col-span-2' : ''}>
      <label htmlFor={`f-${k}`} className="label">{label}{props.optional ? <span className="font-normal text-ink-400"> (facultatif)</span> : ' *'}</label>
      {props.textarea ? (
        <textarea id={`f-${k}`} rows="3" className="field" value={form[k]} onChange={set(k)} maxLength={500} placeholder={props.placeholder} />
      ) : (
        <input id={`f-${k}`} className="field" value={form[k]} onChange={set(k)} maxLength={props.max || 120} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `e-${k}` : undefined} {...props.input} />
      )}
      {errors[k] && <p id={`e-${k}`} className="mt-1 text-xs text-red-700">{errors[k]}</p>}
    </div>
  )

  return (
    <>
      <PageHero title="Validation de commande" text="Renseignez vos informations : votre demande sera envoyée à la boutique sur WhatsApp, au 78 242 65 72." />
      <form onSubmit={submit} noValidate className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
        <div className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
          <h2 className="text-2xl font-semibold sm:col-span-2">Vos informations</h2>
          {field('name', 'Nom complet', { input: { autoComplete: 'name' } })}
          {field('phone', 'Téléphone', { input: { type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '77 123 45 67' }, max: 20 })}
          {field('address', 'Adresse de livraison', { wide: true, input: { autoComplete: 'street-address', placeholder: 'Quartier, rue, point de repère' }, max: 200 })}
          <div className="sm:col-span-2">
            {field('zone', 'Ville ou zone', { input: { list: 'zones', autoComplete: 'address-level2' } })}
            <datalist id="zones">{ZONES.map((z) => <option key={z} value={z} />)}</datalist>
          </div>
          {field('notes', 'Notes', { wide: true, optional: true, textarea: true, placeholder: 'Horaires de livraison, précisions…' })}
          <p className="text-xs leading-5 text-ink-600 sm:col-span-2">
            Vos informations servent uniquement à traiter votre commande. Voir la <Link to="/confidentialite" className="text-emerald underline">politique de confidentialité</Link>.
          </p>
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-32">
          <div className="card p-6">
            <h2 className="text-2xl font-semibold">Votre commande</h2>
            <ul className="mt-5 space-y-3">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 text-sm">
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-ivory-200 bg-white">
                    {it.image && <img src={asset(it.image)} alt="" className="h-full w-full object-contain" />}
                  </span>
                  <span className="flex-1">{it.name} <span className="text-ink-400">× {it.qty}</span></span>
                  <span className="font-medium">{typeof it.price === 'number' ? formatPrice(it.price * it.qty) : 'À confirmer'}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-ivory-200 pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-ink-600">Total des articles</dt><dd className="font-semibold">{formatPrice(totals.subtotal)}{totals.hasUnpriced ? ' +' : ''}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-600">Livraison</dt><dd className="text-ink-600">À confirmer</dd></div>
            </dl>
            <p className="mt-4 rounded-lg bg-ivory px-3 py-2 text-xs leading-5 text-ink-600">
              Le montant de la livraison dépend de votre zone. La boutique vous confirme le total avant toute validation.
            </p>
            <button type="submit" disabled={busy} className="btn-wa mt-5 w-full">
              <WhatsAppIcon /> {busy ? 'Ouverture de WhatsApp…' : 'Envoyer ma demande sur WhatsApp'}
            </button>
          </div>
        </aside>
      </form>
    </>
  )
}
