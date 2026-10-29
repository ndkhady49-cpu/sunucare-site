import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCatalog } from '../lib/catalog.jsx'
import { useSeo } from '../lib/seo.js'
import { asset, isPromo } from '../lib/format.js'
import { AddToCartButton, Availability, Price, ProductGrid, ProductImage } from '../components/ProductBits.jsx'
import { Breadcrumbs, SectionHeading } from '../components/Ui.jsx'
import QtyInput from '../components/QtyInput.jsx'
import { ShieldIcon, TruckIcon, WhatsAppIcon } from '../components/Icons.jsx'
import { productMessage, waLink } from '../lib/whatsapp.js'
import NotFound from './NotFound.jsx'

export default function Product() {
  const { slug } = useParams()
  const { bySlug, catBySlug, inCategory } = useCatalog()
  const product = bySlug(slug)
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState(1)
  useEffect(() => { setActive(0); setQty(1) }, [slug])

  const jsonLd = useMemo(() => {
    if (!product) return undefined
    const ld = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.short || product.description }
    if (product.images?.[0]) ld.image = new URL(asset(product.images[0].src), window.location.href).href
    if (typeof product.price === 'number')
      ld.offers = {
        '@type': 'Offer', priceCurrency: 'XOF', price: product.price,
        availability: product.availability === 'disponible' ? 'https://schema.org/InStock' : product.availability === 'rupture' ? 'https://schema.org/OutOfStock' : undefined
      }
    return ld
  }, [product])

  useSeo({
    title: product?.name || 'Produit introuvable',
    description: product ? `${product.short || product.name} Commandez sur WhatsApp chez SunuCare Shop, livraison au Sénégal.` : undefined,
    jsonLd
  })

  if (!product) return <NotFound />
  const cat = catBySlug[product.category]
  const similar = inCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4)
  const images = product.images || []
  const out = product.availability === 'rupture'

  return (
    <>
      <div className="container-x py-8 sm:py-10">
        <Breadcrumbs items={[{ to: '/', label: 'Accueil' }, { to: '/boutique', label: 'Boutique' }, cat && { to: `/boutique/${cat.slug}`, label: cat.name }, { label: product.name }].filter(Boolean)} />
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Galerie */}
          <div>
            <div className="card aspect-square overflow-hidden">
              <ProductImage product={product} image={images[active]} size="full" eager />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`h-20 w-20 overflow-hidden rounded-xl border-2 bg-white ${i === active ? 'border-gold' : 'border-transparent'}`}
                    aria-label={`Afficher la photo ${i + 1}`}
                    aria-pressed={i === active}
                  >
                    <ProductImage product={product} image={img} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations */}
          <div>
            {cat && <Link to={`/boutique/${cat.slug}`} className="eyebrow hover:underline">{cat.name}</Link>}
            <h1 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">{product.name}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Price product={product} className="text-2xl [&>s]:text-base" />
              {isPromo(product) && <span className="rounded-full bg-gold px-2.5 py-1 text-xs font-semibold text-forest-900">Promotion</span>}
            </div>
            <Availability product={product} className="mt-3" />
            {product.volume && <p className="mt-2 text-sm text-ink-600">Contenance : {product.volume}</p>}

            {product.short && <p className="mt-6 text-[15px] leading-7 text-ink">{product.short}</p>}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {!out && <QtyInput value={qty} onChange={setQty} />}
              <AddToCartButton product={product} qty={qty} className="btn-primary h-12 flex-1" />
            </div>
            {!out && (
              <a href={waLink(productMessage(product, qty))} target="_blank" rel="noopener noreferrer" className="btn-wa mt-3 h-12 w-full">
                <WhatsAppIcon /> Commander sur WhatsApp
              </a>
            )}
            {typeof product.price !== 'number' && (
              <p className="mt-3 text-xs text-ink-600">Le prix de ce produit vous est communiqué sur WhatsApp avant toute commande.</p>
            )}

            <ul className="mt-8 grid gap-3 rounded-2xl border border-gold/25 bg-white p-5 text-sm text-ink-600">
              <li className="flex gap-3"><TruckIcon className="h-5 w-5 shrink-0 text-gold-600" /> Livraison au Sénégal, frais confirmés selon votre zone avant la commande.</li>
              <li className="flex gap-3"><ShieldIcon className="h-5 w-5 shrink-0 text-gold-600" /> Disponibilité et total confirmés par la boutique sur WhatsApp.</li>
            </ul>

            <div className="mt-10 space-y-8">
              <Block title="Description"><p>{product.description}</p></Block>
              {product.features?.length > 0 && (
                <Block title="Caractéristiques">
                  <ul className="list-disc space-y-1 pl-5">{product.features.map((f) => <li key={f}>{f}</li>)}</ul>
                </Block>
              )}
              {product.usage && <Block title="Mode d'utilisation"><p>{product.usage}</p></Block>}
              {product.precautions && <Block title="Précautions"><p>{product.precautions}</p></Block>}
            </div>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="container-x pt-10">
          <SectionHeading eyebrow={cat?.name} title="Produits similaires" />
          <ProductGrid products={similar} />
        </section>
      )}
    </>
  )
}

function Block({ title, children }) {
  return (
    <section>
      <h2 className="mb-3 border-b border-gold/25 pb-2 text-2xl font-semibold">{title}</h2>
      <div className="text-[15px] leading-7 text-ink-600">{children}</div>
    </section>
  )
}
