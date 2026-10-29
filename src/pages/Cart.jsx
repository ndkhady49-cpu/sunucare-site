import { Link } from 'react-router-dom'
import { useCart, cartTotals } from '../store/cart.js'
import { useSeo } from '../lib/seo.js'
import { asset, formatPrice } from '../lib/format.js'
import { PageHero } from '../components/Ui.jsx'
import QtyInput from '../components/QtyInput.jsx'
import { BagIcon, TrashIcon, WhatsAppIcon } from '../components/Icons.jsx'
import { orderMessage, waLink } from '../lib/whatsapp.js'

export default function Cart() {
  useSeo({ title: 'Panier', description: 'Votre panier SunuCare Shop.', noindex: true })
  const { items, setQty, remove } = useCart()
  const { subtotal, hasUnpriced, count } = cartTotals(items)

  if (!items.length) {
    return (
      <>
        <PageHero title="Votre panier" />
        <div className="container-x py-16 text-center">
          <BagIcon className="mx-auto h-12 w-12 text-gold" />
          <p className="mt-4 font-display text-2xl text-forest">Votre panier est vide.</p>
          <p className="mt-2 text-sm text-ink-600">Parcourez la boutique et ajoutez les produits qui vous plaisent.</p>
          <Link to="/boutique" className="btn-primary mt-8">Découvrir la boutique</Link>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHero title="Votre panier" text={`${count} article${count > 1 ? 's' : ''} dans votre panier.`} />
      <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
        <ul className="card divide-y divide-ivory-200">
          {items.map((it) => (
            <li key={it.id} className="flex gap-4 p-4 sm:p-5">
              <Link to={`/produit/${it.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-ivory-200 bg-white sm:h-24 sm:w-24">
                {it.image ? <img src={asset(it.image)} alt={it.name} className="h-full w-full object-contain" /> : <span className="flex h-full items-center justify-center bg-ivory text-gold-600"><BagIcon /></span>}
              </Link>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/produit/${it.slug}`} className="text-sm font-semibold hover:text-emerald sm:text-[15px]">{it.name}</Link>
                  <button type="button" onClick={() => remove(it.id)} className="rounded-full p-1.5 text-ink-400 hover:bg-ivory hover:text-red-700" aria-label={`Retirer ${it.name} du panier`}>
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-ink-600">Prix unitaire : {formatPrice(it.price) ?? 'à confirmer'}</p>
                <div className="mt-auto flex items-center justify-between gap-3">
                  <QtyInput small value={it.qty} onChange={(q) => setQty(it.id, q)} label={`Quantité de ${it.name}`} />
                  <span className="text-sm font-semibold text-forest">{typeof it.price === 'number' ? formatPrice(it.price * it.qty) : 'Prix à confirmer'}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit space-y-4 lg:sticky lg:top-32">
          <div className="card p-6">
            <h2 className="text-2xl font-semibold">Récapitulatif</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-ink-600">Sous-total</dt><dd className="font-semibold">{formatPrice(subtotal)}</dd></div>
              {hasUnpriced && <p className="rounded-lg bg-gold-100 px-3 py-2 text-xs text-ink">Certains articles ont un prix à confirmer : la boutique vous l'indiquera sur WhatsApp.</p>}
              <div className="flex justify-between"><dt className="text-ink-600">Livraison</dt><dd className="text-right text-ink-600">À confirmer</dd></div>
              <div className="flex justify-between border-t border-ivory-200 pt-3 text-base">
                <dt className="font-semibold">Total des articles</dt><dd className="font-semibold text-forest">{formatPrice(subtotal)}{hasUnpriced ? ' +' : ''}</dd>
              </div>
            </dl>
            <Link to="/commande" className="btn-primary mt-6 w-full">Valider ma commande</Link>
            <a href={waLink(orderMessage({ items, subtotal, hasUnpriced }))} target="_blank" rel="noopener noreferrer" className="btn-wa mt-3 w-full">
              <WhatsAppIcon /> Envoyer le panier sur WhatsApp
            </a>
          </div>
          <Link to="/boutique" className="block text-center text-sm text-emerald hover:underline">Continuer mes achats</Link>
        </aside>
      </div>
    </>
  )
}
