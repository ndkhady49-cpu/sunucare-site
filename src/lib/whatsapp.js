import { STORE } from '../data/store.js'
import { formatPrice } from './format.js'

export const waLink = (text) => `https://wa.me/${STORE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`

const line = (it) => {
  const unit = formatPrice(it.price)
  const total = typeof it.price === 'number' ? formatPrice(it.price * it.qty) : null
  return `• ${it.name}\n  Quantité : ${it.qty}\n  Prix unitaire : ${unit ?? 'à confirmer'}${total ? `\n  Total : ${total}` : ''}`
}

export function productMessage(product, qty = 1) {
  return [
    `Bonjour SunuCare Shop, je souhaite commander :`,
    '',
    line({ ...product, qty }),
    '',
    `Pouvez-vous me confirmer la disponibilité et les frais de livraison ? Merci.`
  ].join('\n')
}

export function orderMessage({ items, subtotal, hasUnpriced, customer = {}, reference }) {
  const c = customer
  const parts = [
    `Bonjour SunuCare Shop, voici ma demande de commande${reference ? ` (réf. ${reference})` : ''} :`,
    '',
    ...items.map(line),
    '',
    `Total des articles : ${formatPrice(subtotal)}${hasUnpriced ? ' + article(s) au prix à confirmer' : ''}`,
    `Livraison : frais à confirmer selon la zone`
  ]
  const info = [
    c.name && `Nom : ${c.name}`,
    c.phone && `Téléphone : ${c.phone}`,
    c.address && `Adresse : ${c.address}`,
    c.zone && `Ville / zone : ${c.zone}`,
    c.notes && `Notes : ${c.notes}`
  ].filter(Boolean)
  if (info.length) parts.push('', 'Mes informations de livraison :', ...info)
  parts.push('', `Merci de me confirmer la disponibilité, les frais de livraison et le total.`)
  return parts.join('\n')
}
