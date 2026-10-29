import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Panier conservé dans le navigateur (localStorage) pendant la navigation et entre les visites.
export const useCart = create(
  persist(
    (set, get) => ({
      items: [], // { id, slug, name, price, image, qty }
      add: (product, qty = 1) => {
        const items = get().items
        const found = items.find((i) => i.id === product.id)
        if (found) {
          set({ items: items.map((i) => (i.id === product.id ? { ...i, qty: Math.min(99, i.qty + qty) } : i)) })
        } else {
          set({
            items: [
              ...items,
              {
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: typeof product.price === 'number' ? product.price : null,
                image: product.images?.[0]?.thumb || product.images?.[0]?.src || null,
                qty: Math.min(99, qty)
              }
            ]
          })
        }
      },
      setQty: (id, qty) => set({ items: get().items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i)) }),
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
      // Met à jour noms et prix si le catalogue a changé depuis l'ajout au panier
      sync: (products) => {
        const byId = Object.fromEntries(products.map((p) => [p.id, p]))
        set({
          items: get()
            .items.filter((i) => byId[i.id] && byId[i.id].availability !== 'rupture')
            .map((i) => ({ ...i, name: byId[i.id].name, price: typeof byId[i.id].price === 'number' ? byId[i.id].price : null }))
        })
      }
    }),
    { name: 'sunucare-panier', version: 1 }
  )
)

export const cartTotals = (items) => {
  const count = items.reduce((n, i) => n + i.qty, 0)
  const subtotal = items.reduce((n, i) => n + (typeof i.price === 'number' ? i.price * i.qty : 0), 0)
  const hasUnpriced = items.some((i) => typeof i.price !== 'number')
  return { count, subtotal, hasUnpriced }
}
