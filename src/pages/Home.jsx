import { Link } from 'react-router-dom'
import { useCatalog } from '../lib/catalog.jsx'
import { useSeo } from '../lib/seo.js'
import { asset, isPromo } from '../lib/format.js'
import { STORE } from '../data/store.js'
import { ProductCard, ProductGrid, ProductImage, Price } from '../components/ProductBits.jsx'
import { SectionHeading } from '../components/Ui.jsx'
import { ArrowRight, ChatIcon, GridIcon, ShieldIcon, TagIcon, TruckIcon, WhatsAppIcon } from '../components/Icons.jsx'
import { waLink } from '../lib/whatsapp.js'

const bannerSet = ['800', '1200', '1774'].map((w) => `${asset(`/images/brand/banniere-${w}.webp`)} ${w}w`).join(', ')

export default function Home() {
  const { categories, products, inCategory } = useCatalog()
  useSeo({
    description: 'SunuCare Shop, boutique en ligne au Sénégal : soins, beauté, bien-être, massage, parfums et accessoires pratiques. Commande simple sur WhatsApp.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: STORE.name,
      slogan: STORE.slogan,
      telephone: '+221 78 242 65 72',
      address: { '@type': 'PostalAddress', streetAddress: 'Cité Mandela', addressLocality: 'Fass Mbao', addressCountry: 'SN' },
      areaServed: 'SN'
    }
  })

  // Produits avec photo d'abord, pour une vitrine soignée
  const popular = products
    .filter((p) => p.featured && p.availability !== 'rupture')
    .sort((a, b) => (b.images?.length ? 1 : 0) - (a.images?.length ? 1 : 0))
    .slice(0, 8)
  const promos = products.filter(isPromo)
  const perfumes = inCategory('parfums').slice(0, 4)
  const wellness = [...inCategory('bien-etre-massage'), ...inCategory('soins-visage')].slice(0, 4)
  const hero = products.find((p) => p.slug === 'scalp-massager')

  return (
    <>
      {/* Bannière : image fournie, affichée en entier sans déformation */}
      <section aria-labelledby="hero-title" className="relative bg-ivory">
        <h1 id="hero-title" className="sr-only">SunuCare Shop, votre quotidien mérite le meilleur</h1>
        <div className="relative">
          <img
            src={asset('/images/brand/banniere-1200.webp')}
            srcSet={bannerSet}
            sizes="100vw"
            width="1774"
            height="887"
            alt="Sélection SunuCare Shop : soins, accessoires électroniques, objets du quotidien et bien-être, dans un décor vert et or"
            className="block h-auto w-full"
            fetchpriority="high"
          />
          {/* Sur grand écran, le message occupe la zone ivoire vide au centre de la bannière */}
          <div className="absolute inset-0 hidden items-start justify-center lg:flex">
            <HeroText className="mt-[5.5%] w-[34%] max-w-[520px] text-center" />
          </div>
        </div>
        <div className="border-b border-gold/20 bg-white lg:hidden">
          <HeroText className="container-x py-8 text-center" />
        </div>
      </section>

      {/* Catégories */}
      <section id="categories" className="container-x scroll-mt-24 py-16 sm:py-20">
        <SectionHeading eyebrow="Nos univers" title="Explorez nos catégories" align="center" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
          {categories.map((c, i) => (
            <Link
              key={c.slug}
              to={`/boutique/${c.slug}`}
              className={`group card relative flex flex-col overflow-hidden ${i === categories.length - 1 && categories.length % 2 ? 'col-span-2 lg:col-span-1' : ''}`}
            >
              <span className={`block overflow-hidden bg-white lg:aspect-[4/5] ${i === categories.length - 1 && categories.length % 2 ? 'aspect-[16/7]' : 'aspect-[4/3]'}`}>
                <img src={asset(c.image)} alt={c.imageAlt || ''} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </span>
              <span className="flex items-center justify-between gap-2 border-t-2 border-gold/60 bg-forest px-4 py-3.5 text-ivory">
                <span className="font-display text-lg font-semibold leading-tight">{c.name}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-gold-400 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Produits populaires */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Sélection" title="Produits populaires" text="Des produits choisis pour votre quotidien, avec des prix clairs en FCFA.">
            <Link to="/boutique" className="btn-outline self-start sm:self-auto">Voir toute la boutique</Link>
          </SectionHeading>
          <ProductGrid products={popular} />
        </div>
      </section>

      {/* Pourquoi nous */}
      <section className="container-x py-16 sm:py-20">
        <SectionHeading eyebrow="Nos engagements" title="Pourquoi choisir SunuCare Shop ?" align="center" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            [GridIcon, 'Une sélection variée', 'Soins, bien-être, parfums et accessoires réunis dans une même boutique.'],
            [ShieldIcon, 'Un achat facile', 'Ajoutez au panier, envoyez votre commande sur WhatsApp, nous vous répondons.'],
            [ChatIcon, 'Un contact direct', 'Vous échangez directement avec la boutique, avant et après votre commande.'],
            [TagIcon, 'Des prix clairs', 'Les prix sont affichés en FCFA. Pour certains produits, le prix vous est communiqué sur demande.'],
            [TruckIcon, 'Une livraison annoncée', 'Les frais et le délai de livraison vous sont communiqués avant de valider la commande.']
          ].map(([Icon, t, d]) => (
            <div key={t} className="rounded-2xl border border-gold/25 bg-white p-6">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-forest text-gold-400"><Icon className="h-5 w-5" /></span>
              <h3 className="font-sans text-[15px] font-semibold text-forest">{t}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Beauté & bien-être */}
      <section className="bg-forest py-16 text-ivory sm:py-20">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-gold/40">
            {hero && <img src={asset('/images/products/scalp-massager-2-900.webp')} alt="Femme utilisant le Scalp Massager" loading="lazy" className="aspect-square w-full object-contain" />}
          </div>
          <div>
            <p className="eyebrow mb-2 !text-gold-400">Beauté & bien-être</p>
            <h2 className="text-3xl font-semibold text-ivory sm:text-4xl">Un moment pour soi, chaque jour</h2>
            <div className="gold-rule mt-4" />
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-ivory/80">
              Masseurs, soins de la peau et routines du soir : des produits pratiques pour prendre soin de vous à la maison.
            </p>
            <ul className="mt-8 divide-y divide-ivory/10 border-y border-ivory/10">
              {wellness.map((p) => (
                <li key={p.id}>
                  <Link to={`/produit/${p.slug}`} className="flex items-center gap-4 py-3.5 hover:text-gold-400">
                    <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white"><ProductImage product={p} compact /></span>
                    <span className="flex-1 text-sm font-medium">{p.name}</span>
                    <Price product={p} className="text-sm [&>span:first-child]:text-gold-400" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/boutique/bien-etre-massage" className="btn-gold">Bien-être & Massage</Link>
              <Link to="/boutique/soins-visage" className="btn border border-ivory/30 text-ivory hover:border-gold-400">Soins & Visage</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Parfums */}
      <section className="py-16 sm:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Parfums de marque" title="L'univers des parfums" text="Afnan, Lattafa, Zaara et bien d'autres : découvrez nos flacons et demandez le prix sur WhatsApp.">
            <Link to="/boutique/parfums" className="btn-outline self-start sm:self-auto">Tous les parfums</Link>
          </SectionHeading>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {perfumes.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Promotions : affichées seulement si des prix avant/après réels existent */}
      {promos.length > 0 && (
        <section className="bg-gold-100/60 py-16 sm:py-20">
          <div className="container-x">
            <SectionHeading eyebrow="Offres" title="Promotions en cours">
              <Link to="/promotions" className="btn-outline self-start sm:self-auto">Toutes les promotions</Link>
            </SectionHeading>
            <ProductGrid products={promos.slice(0, 4)} />
          </div>
        </section>
      )}

      {/* Appel à l'action */}
      <section className="container-x pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-forest px-6 py-14 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-3 rounded-[1.25rem] border border-gold/40" />
          <h2 className="text-3xl font-semibold text-ivory sm:text-4xl">Trouvez votre prochain indispensable.</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-ivory/80">Explorez notre boutique et découvrez les produits adaptés à votre quotidien.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/boutique" className="btn-gold">Voir tous les produits</Link>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn border border-ivory/30 text-ivory hover:border-gold-400">
              <WhatsAppIcon /> 78 242 65 72
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

function HeroText({ className }) {
  return (
    <div className={className}>
      <p className="eyebrow mb-3">SunuCare Shop</p>
      <p className="font-display text-[2rem] font-semibold leading-[1.1] text-forest sm:text-4xl lg:text-[clamp(1.9rem,3vw,3.1rem)]">
        Votre quotidien mérite le meilleur.
      </p>
      <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-ink-600 lg:text-[clamp(.8rem,1vw,1rem)]">
        Découvrez notre sélection de soins, beauté, bien-être, parfums et accessoires pratiques.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
        <Link to="/boutique" className="btn-primary lg:px-5 lg:py-2.5 xl:px-6 xl:py-3">Découvrir la boutique</Link>
        <button type="button" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} className="btn-outline bg-white/70 lg:px-5 lg:py-2.5 xl:px-6 xl:py-3">
          Explorer les catégories
        </button>
      </div>
    </div>
  )
}
