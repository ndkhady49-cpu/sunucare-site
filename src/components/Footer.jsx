import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { STORE } from '../data/store.js'
import { useCatalog } from '../lib/catalog.jsx'
import { waLink } from '../lib/whatsapp.js'
import { PhoneIcon, PinIcon, WhatsAppIcon } from './Icons.jsx'

export default function Footer() {
  const { categories } = useCatalog()
  const col = 'mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400'
  const a = 'text-sm text-ivory/80 hover:text-gold-400'
  return (
    <footer className="mt-20 bg-forest text-ivory">
      <div className="h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" aria-label="SunuCare Shop, accueil"><Logo framed className="h-20 w-auto" /></Link>
          <p className="mt-5 font-display text-xl italic text-ivory">« {STORE.slogan} »</p>
        </div>
        <div>
          <p className={col}>Boutique</p>
          <ul className="space-y-2.5">
            <li><Link to="/boutique" className={a}>Tous les produits</Link></li>
            {categories.map((c) => <li key={c.slug}><Link to={`/boutique/${c.slug}`} className={a}>{c.name}</Link></li>)}
            <li><Link to="/promotions" className={a}>Promotions</Link></li>
          </ul>
        </div>
        <div>
          <p className={col}>Informations</p>
          <ul className="space-y-2.5">
            <li><Link to="/a-propos" className={a}>À propos</Link></li>
            <li><Link to="/faq" className={a}>FAQ</Link></li>
            <li><Link to="/livraison-retours" className={a}>Livraison et retours</Link></li>
            <li><Link to="/conditions-generales-de-vente" className={a}>Conditions générales de vente</Link></li>
            <li><Link to="/confidentialite" className={a}>Politique de confidentialité</Link></li>
            <li><Link to="/contact" className={a}>Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className={col}>Nous contacter</p>
          <ul className="space-y-3 text-sm text-ivory/85">
            <li>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-gold-400">
                <WhatsAppIcon className="h-5 w-5 text-gold-400" /> WhatsApp : {STORE.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={`tel:+${STORE.phone2}`} className="flex items-center gap-3 hover:text-gold-400">
                <PhoneIcon className="h-5 w-5 text-gold-400" /> Téléphone : {STORE.phone2Display}
              </a>
            </li>
            <li className="flex items-start gap-3"><PinIcon className="h-5 w-5 shrink-0 text-gold-400" /> {STORE.address}</li>
          </ul>
          {STORE.socials.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-3">
              {STORE.socials.map((s) => (
                <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className={a}>{s.label}</a></li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-ivory/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SunuCare Shop. Tous droits réservés.</p>
          <p>Prix en francs CFA (FCFA). Frais de livraison confirmés avant chaque commande.</p>
        </div>
      </div>
    </footer>
  )
}
