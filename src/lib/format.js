export const formatPrice = (n) =>
  typeof n === 'number' ? `${new Intl.NumberFormat('fr-FR').format(n).replace(/ | /g, ' ')} FCFA` : null

// Une promotion n'existe que si un ancien prix réel, supérieur au prix actuel, est renseigné.
export const isPromo = (p) => typeof p.price === 'number' && typeof p.comparePrice === 'number' && p.comparePrice > p.price

export const AVAILABILITY = {
  disponible: { label: 'Disponible', tone: 'ok' },
  'a-confirmer': { label: 'Disponibilité à confirmer', tone: 'neutral' },
  rupture: { label: 'Rupture de stock', tone: 'out' }
}

// Chemins des images : préfixe la base du site (utile pour la préversion en chemins relatifs).
export const asset = (src) => {
  if (!src) return src
  if (/^(https?:|data:|blob:)/.test(src)) return src
  if (src.startsWith('/images/')) return import.meta.env.BASE_URL + src.slice(1)
  return src
}
