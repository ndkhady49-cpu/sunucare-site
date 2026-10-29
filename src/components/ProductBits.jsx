import { Link } from 'react-router-dom'
import { AVAILABILITY, asset, formatPrice, isPromo } from '../lib/format.js'
import { BagIcon, BottleIcon, HandIcon, LeafIcon, SparkIcon, GridIcon, WhatsAppIcon } from './Icons.jsx'
import { useCart } from '../store/cart.js'
import { useToast } from './Toast.jsx'
import { waLink, productMessage } from '../lib/whatsapp.js'

const catIcon = { 'soins-visage': SparkIcon, 'bien-etre-massage': HandIcon, parfums: BottleIcon, 'beaute-corps': LeafIcon, accessoires: GridIcon }

// Image produit : photo réelle si disponible, sinon un emplacement sobre « photo à venir » (jamais d'image inventée).
export function ProductImage({ product, image, size = 'thumb', className = '', eager = false, compact = false }) {
  const img = image || product.images?.[0]
  if (!img) {
    const Icon = catIcon[product.category] || SparkIcon
    if (compact)
      return (
        <div className={`flex h-full w-full items-center justify-center bg-ivory text-gold-600 ${className}`} aria-hidden="true">
          <Icon className="h-6 w-6" />
        </div>
      )
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-ivory to-ivory-200 text-center ${className}`}>
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 text-gold-600">
          <Icon className="h-7 w-7" />
        </span>
        <span className="px-4 font-display text-lg leading-tight text-forest">{product.name}</span>
        <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Photo à venir</span>
      </div>
    )
  }
  const src = asset(size === 'thumb' ? img.thumb || img.src : img.src)
  return (
    <img
      src={src}
      srcSet={img.thumb && img.src ? `${asset(img.thumb)} 450w, ${asset(img.src)} 900w` : undefined}
      sizes={size === 'thumb' ? '(min-width: 1024px) 300px, 50vw' : '(min-width: 1024px) 600px, 100vw'}
      alt={img.alt || product.name}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`h-full w-full object-contain ${className}`}
    />
  )
}

export function Price({ product, className = '' }) {
  if (typeof product.price !== 'number') {
    return <span className={`text-sm font-medium text-ink-600 ${className}`}>Prix sur demande</span>
  }
  return (
    <span className={`flex flex-wrap items-baseline gap-2 ${className}`}>
      <span className="font-semibold text-forest">{formatPrice(product.price)}</span>
      {isPromo(product) && <s className="text-sm text-ink-400">{formatPrice(product.comparePrice)}</s>}
    </span>
  )
}

export function Availability({ product, className = '' }) {
  const a = AVAILABILITY[product.availability] || AVAILABILITY['a-confirmer']
  const tone = { ok: 'text-emerald-700', neutral: 'text-ink-600', out: 'text-red-700' }[a.tone]
  const dot = { ok: 'bg-emerald-500', neutral: 'bg-gold', out: 'bg-red-600' }[a.tone]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tone} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {a.label}
    </span>
  )
}

export function AddToCartButton({ product, qty = 1, className = 'btn-primary', label = 'Ajouter au panier' }) {
  const add = useCart((s) => s.add)
  const toast = useToast()
  const out = product.availability === 'rupture'
  return (
    <button
      type="button"
      className={className}
      disabled={out}
      onClick={() => {
        add(product, qty)
        toast(`${product.name} a été ajouté au panier.`)
      }}
    >
      <BagIcon className="h-4 w-4" />
      {out ? 'Indisponible' : label}
    </button>
  )
}

export function ProductCard({ product }) {
  const out = product.availability === 'rupture'
  return (
    <article className="group card flex flex-col overflow-hidden">
      <Link to={`/produit/${product.slug}`} className="relative block aspect-square overflow-hidden bg-white" aria-label={`Voir ${product.name}`}>
        <ProductImage product={product} className="transition-transform duration-500 group-hover:scale-[1.03]" />
        {isPromo(product) && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-forest-900">Promo</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 border-t border-ivory-200 p-4">
        <h3 className="font-sans text-[15px] font-semibold leading-snug text-ink">
          <Link to={`/produit/${product.slug}`} className="hover:text-emerald">{product.name}</Link>
        </h3>
        <Price product={product} />
        <Availability product={product} />
        <div className="mt-auto flex flex-col gap-2 pt-3">
          <Link to={`/produit/${product.slug}`} className="btn-outline px-4 py-2.5">Voir le produit</Link>
          <div className="flex gap-2">
            <AddToCartButton product={product} className="btn-primary flex-1 px-3 py-2.5 text-[13px]" label="Ajouter" />
            {!out && (
              <a
                href={waLink(productMessage(product))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa px-3 py-2.5"
                aria-label={`Commander ${product.name} sur WhatsApp`}
                title="Commander sur WhatsApp"
              >
                <WhatsAppIcon className="h-[18px] w-[18px]" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
