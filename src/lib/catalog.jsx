import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import bundled from '../data/catalogue.json'
import { useCart } from '../store/cart.js'

const CatalogContext = createContext(null)

const publicView = (data) => ({
  categories: data.categories.filter((c) => !c.hidden).sort((a, b) => a.order - b.order),
  products: data.products.filter((p) => !p.hidden)
})

// Le catalogue vient de l'API (si le serveur Node tourne) ; sinon, du fichier catalogue.json intégré.
export function CatalogProvider({ children }) {
  const [data, setData] = useState(() => publicView(bundled))
  const [source, setSource] = useState('fichier')
  const sync = useCart((s) => s.sync)

  useEffect(() => {
    if (import.meta.env.VITE_STATIC_ONLY) {
      sync(publicView(bundled).products)
      return
    }
    let alive = true
    fetch('/api/catalogue')
      .then((r) => (r.ok && r.headers.get('content-type')?.includes('json') ? r.json() : Promise.reject()))
      .then((d) => {
        if (!alive) return
        setData(publicView(d))
        setSource('api')
        sync(publicView(d).products)
      })
      .catch(() => sync(publicView(bundled).products))
    return () => {
      alive = false
    }
  }, [sync])

  const value = useMemo(() => {
    const catBySlug = Object.fromEntries(data.categories.map((c) => [c.slug, c]))
    return {
      ...data,
      source,
      catBySlug,
      bySlug: (slug) => data.products.find((p) => p.slug === slug),
      inCategory: (slug) => data.products.filter((p) => p.category === slug)
    }
  }, [data, source])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export const useCatalog = () => useContext(CatalogContext)
