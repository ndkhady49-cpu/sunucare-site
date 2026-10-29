import { useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useCatalog } from '../lib/catalog.jsx'
import { useSeo } from '../lib/seo.js'
import { isPromo } from '../lib/format.js'
import { ProductGrid } from '../components/ProductBits.jsx'
import { Breadcrumbs, PageHero } from '../components/Ui.jsx'
import { normalize } from '../components/SearchDialog.jsx'
import { waLink } from '../lib/whatsapp.js'
import { WhatsAppIcon } from '../components/Icons.jsx'
import NotFound from './NotFound.jsx'

export default function Shop({ promoOnly = false }) {
  const { slug } = useParams()
  const { products, categories, catBySlug } = useCatalog()
  const [params, setParams] = useSearchParams()
  const category = slug ? catBySlug[slug] : null

  const q = params.get('q') || ''
  const sort = params.get('tri') || ''
  const dispo = params.get('dispo') === '1'
  const promo = promoOnly || params.get('promo') === '1'
  const hasPromos = products.some(isPromo)

  const title = promoOnly ? 'Promotions' : category ? category.name : 'Boutique'
  useSeo({
    title,
    description: promoOnly
      ? 'Les offres en cours chez SunuCare Shop, avec des prix avant et après vérifiés.'
      : category
        ? `${category.name} chez SunuCare Shop : ${category.description} Commande sur WhatsApp, livraison au Sénégal.`
        : 'Tous les produits SunuCare Shop : soins, bien-être, parfums, beauté et accessoires. Prix en FCFA, commande sur WhatsApp.'
  })

  const list = useMemo(() => {
    let l = products
    if (category) l = l.filter((p) => p.category === category.slug)
    if (q) l = l.filter((p) => normalize(p.name).includes(normalize(q)))
    if (dispo) l = l.filter((p) => p.availability === 'disponible')
    if (promo) l = l.filter(isPromo)
    if (sort === 'prix-croissant' || sort === 'prix-decroissant') {
      const dir = sort === 'prix-croissant' ? 1 : -1
      // Les produits sans prix public restent à la fin
      l = [...l].sort((a, b) => {
        const pa = typeof a.price === 'number', pb = typeof b.price === 'number'
        if (pa !== pb) return pa ? -1 : 1
        return pa ? (a.price - b.price) * dir : 0
      })
    }
    return l
  }, [products, category, q, dispo, promo, sort])

  if (slug && !category) return <NotFound />

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    value ? next.set(key, value) : next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <>
      <PageHero
        eyebrow={promoOnly ? 'Offres' : category ? 'Catégorie' : 'SunuCare Shop'}
        title={title}
        text={promoOnly ? 'Seules les réductions réelles, avec un prix avant et un prix après, apparaissent ici.' : category?.description || 'Tous nos produits, avec des prix clairs en FCFA.'}
      />
      <div className="container-x py-8 sm:py-10">
        <Breadcrumbs items={[{ to: '/', label: 'Accueil' }, ...(category || promoOnly ? [{ to: '/boutique', label: 'Boutique' }] : []), { label: title }]} />

        {!promoOnly && (
          <div className="mb-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <Chip to="/boutique" active={!category}>Tout</Chip>
            {categories.map((c) => <Chip key={c.slug} to={`/boutique/${c.slug}`} active={category?.slug === c.slug}>{c.name}</Chip>)}
          </div>
        )}

        <div className="mb-8 grid gap-3 rounded-2xl border border-gold/20 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_220px_auto_auto] lg:items-center">
          <div>
            <label htmlFor="shop-q" className="sr-only">Rechercher par nom</label>
            <input id="shop-q" type="search" className="field" placeholder="Rechercher par nom…" value={q} onChange={(e) => update('q', e.target.value)} />
          </div>
          <div>
            <label htmlFor="shop-sort" className="sr-only">Trier</label>
            <select id="shop-sort" className="field" value={sort} onChange={(e) => update('tri', e.target.value)}>
              <option value="">Trier : par défaut</option>
              <option value="prix-croissant">Prix croissant</option>
              <option value="prix-decroissant">Prix décroissant</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-emerald" checked={dispo} onChange={(e) => update('dispo', e.target.checked ? '1' : '')} />
            Disponibles uniquement
          </label>
          {hasPromos && !promoOnly && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-emerald" checked={promo} onChange={(e) => update('promo', e.target.checked ? '1' : '')} />
              En promotion
            </label>
          )}
        </div>

        <p className="mb-5 text-sm text-ink-600" aria-live="polite">{list.length} produit{list.length > 1 ? 's' : ''}</p>

        {list.length > 0 ? (
          <ProductGrid products={list} />
        ) : (
          <div className="rounded-2xl border border-dashed border-gold/40 bg-white px-6 py-14 text-center">
            <p className="font-display text-2xl text-forest">
              {promoOnly ? 'Aucune promotion en cours pour le moment.' : category && !q && !dispo ? 'De nouveaux produits arrivent bientôt dans cette catégorie.' : 'Aucun produit ne correspond à votre recherche.'}
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-600">
              {promoOnly ? 'Écrivez-nous sur WhatsApp pour être informé(e) des prochaines offres.' : 'Vous cherchez un article précis ? Demandez-nous sur WhatsApp, nous vous répondons.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={waLink('Bonjour SunuCare Shop, je cherche un produit :')} target="_blank" rel="noopener noreferrer" className="btn-wa"><WhatsAppIcon /> Écrire sur WhatsApp</a>
              <Link to="/boutique" className="btn-outline">Voir tous les produits</Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function Chip({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${active ? 'border-forest bg-forest text-ivory' : 'border-ink/15 bg-white text-ink hover:border-gold'}`}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  )
}
