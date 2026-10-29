import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo.jsx'
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, WhatsAppIcon } from './Icons.jsx'
import { useCart, cartTotals } from '../store/cart.js'
import { useCatalog } from '../lib/catalog.jsx'
import { waLink } from '../lib/whatsapp.js'
import SearchDialog from './SearchDialog.jsx'

const MAIN = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/boutique', label: 'Boutique', end: true }
]
const AFTER = [
  { to: '/promotions', label: 'Promotions' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/contact', label: 'Contact' }
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(false)
  const { categories } = useCatalog()
  const count = useCart((s) => cartTotals(s.items).count)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  const linkCls = ({ isActive }) =>
    `whitespace-nowrap text-[13px] font-medium transition-colors hover:text-emerald ${isActive ? 'text-emerald' : 'text-ink'}`

  return (
    <>
      <div className="bg-forest text-ivory">
        <div className="container-x flex h-9 items-center justify-center gap-2 text-center text-[12px] tracking-wide sm:justify-between">
          <span className="hidden text-ivory/80 sm:inline">{'Le bien-être et le pratique, au quotidien.'}</span>
          <span>
            <span className="hidden sm:inline">Livraison au Sénégal · </span>Commande sur WhatsApp{' '}
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold-400 hover:underline">78 242 65 72</a>
          </span>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-gold/25 bg-white/95 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-[88px]">
          <div className="flex items-center gap-2">
            <button type="button" className="-ml-2 rounded-full p-2 text-forest lg:hidden" onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
              <MenuIcon className="h-6 w-6" />
            </button>
            <Link to="/" aria-label="SunuCare Shop, accueil" className="shrink-0">
              <Logo className="h-12 w-auto lg:h-[68px]" />
            </Link>
          </div>

          <nav aria-label="Navigation principale" className="hidden items-center gap-5 xl:gap-6 lg:flex">
            {MAIN.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>{l.label}</NavLink>)}
            <div className="group relative">
              <button type="button" className="text-[13px] font-medium text-ink hover:text-emerald" aria-haspopup="true">
                Catégories
              </button>
              <div className="invisible absolute left-1/2 top-full w-72 -translate-x-1/2 pt-4 opacity-0 transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <ul className="card overflow-hidden border border-gold/20 py-2">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link to={`/boutique/${c.slug}`} className="block px-5 py-2.5 text-sm text-ink hover:bg-ivory hover:text-emerald">{c.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <NavLink to="/boutique/parfums" className={linkCls}>Parfums</NavLink>
            {AFTER.map((l) => <NavLink key={l.to} to={l.to} className={linkCls}>{l.label}</NavLink>)}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button type="button" onClick={() => setSearch(true)} className="rounded-full p-2.5 text-forest hover:bg-ivory" aria-label="Rechercher un produit">
              <SearchIcon />
            </button>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="hidden rounded-full p-2.5 text-[#1F8F4E] hover:bg-ivory sm:inline-flex" aria-label="Écrire sur WhatsApp">
              <WhatsAppIcon className="h-[22px] w-[22px]" />
            </a>
            <Link to="/panier" className="relative rounded-full p-2.5 text-forest hover:bg-ivory" aria-label={`Panier, ${count} article${count > 1 ? 's' : ''}`}>
              <BagIcon className="h-[22px] w-[22px]" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-forest-900">{count}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-forest-900/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-ivory shadow-xl">
            <div className="flex items-center justify-between border-b border-gold/25 bg-white px-4 py-3">
              <Logo className="h-11 w-auto" />
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-forest" aria-label="Fermer le menu">
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col px-4 py-4" aria-label="Navigation mobile">
              {MAIN.map((l) => <MobileLink key={l.to} {...l} />)}
              <p className="eyebrow mb-1 mt-5 px-3">Catégories</p>
              {categories.map((c) => <MobileLink key={c.slug} to={`/boutique/${c.slug}`} label={c.name} />)}
              <div className="my-4 h-px bg-gold/30" />
              {AFTER.map((l) => <MobileLink key={l.to} {...l} />)}
              <MobileLink to="/faq" label="FAQ" />
            </nav>
            <div className="mt-auto space-y-2 p-4">
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn-wa w-full">
                <WhatsAppIcon /> Écrire sur WhatsApp
              </a>
              <Link to="/panier" className="btn-dark w-full"><BagIcon className="h-4 w-4" /> Panier ({count})</Link>
            </div>
          </div>
        </div>
      )}
      {search && <SearchDialog onClose={() => setSearch(false)} />}
    </>
  )
}

function MobileLink({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `rounded-lg px-3 py-2.5 text-[15px] ${isActive ? 'bg-white font-semibold text-emerald' : 'text-ink hover:bg-white'}`}
    >
      {label}
    </NavLink>
  )
}
