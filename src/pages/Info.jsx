import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSeo } from '../lib/seo.js'
import { STORE } from '../data/store.js'
import { useCatalog } from '../lib/catalog.jsx'
import { asset } from '../lib/format.js'
import { Breadcrumbs, PageHero, SectionHeading } from '../components/Ui.jsx'
import { ChatIcon, PhoneIcon, PinIcon, TruckIcon, WhatsAppIcon } from '../components/Icons.jsx'
import { waLink } from '../lib/whatsapp.js'

export function About() {
  useSeo({ title: 'À propos', description: "SunuCare Shop, boutique sénégalaise de soins, bien-être, parfums et accessoires pratiques. Découvrez notre mission." })
  const { categories } = useCatalog()
  return (
    <>
      <PageHero eyebrow="Notre histoire" title="À propos de SunuCare Shop" text={`« ${STORE.slogan} »`} />
      <div className="container-x grid gap-12 py-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4 text-[15px] leading-7 text-ink-600">
          <h2 className="text-3xl font-semibold">Notre mission</h2>
          <div className="gold-rule" />
          <p>
            SunuCare Shop est une boutique basée à Fass Mbao, Cité Mandela, qui réunit des produits de soin, de beauté, de bien-être,
            des parfums et des accessoires pratiques pour le quotidien.
          </p>
          <p>
            Notre mission est simple : vous aider à prendre soin de vous et à vous simplifier la vie, avec une sélection de produits utiles,
            des prix clairs et un contact direct avec la boutique, du premier message jusqu'à la livraison.
          </p>
          <p>Nous livrons au Sénégal, avec une priorité sur Dakar. Les frais et le délai vous sont toujours annoncés avant la commande.</p>
        </div>
        <div className="overflow-hidden rounded-3xl ring-1 ring-gold/40">
          <img src={asset('/images/brand/banniere-1200.webp')} alt="Univers SunuCare Shop" loading="lazy" className="h-auto w-full" />
        </div>
      </div>
      <section className="container-x py-8">
        <SectionHeading title="Nos univers" align="center" />
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((c) => <Link key={c.slug} to={`/boutique/${c.slug}`} className="btn-outline">{c.name}</Link>)}
        </div>
      </section>
    </>
  )
}

export function Contact() {
  useSeo({ title: 'Contact', description: 'Contactez SunuCare Shop sur WhatsApp au 78 242 65 72 ou au 76 455 94 07. Fass Mbao, Cité Mandela, Sénégal.' })
  const [msg, setMsg] = useState({ name: '', text: '' })
  const text = `Bonjour SunuCare Shop${msg.name.trim() ? `, je m'appelle ${msg.name.trim()}` : ''}.\n${msg.text.trim()}`
  return (
    <>
      <PageHero eyebrow="Nous écrire" title="Contact" text="Une question sur un produit, un prix ou une livraison ? Nous vous répondons directement." />
      <div className="container-x grid gap-8 py-12 lg:grid-cols-2">
        <div className="space-y-4">
          <ContactCard icon={WhatsAppIcon} title="WhatsApp (commandes)" href={waLink()} value={STORE.whatsappDisplay} external />
          <ContactCard icon={PhoneIcon} title="Téléphone" href={`tel:+${STORE.phone2}`} value={STORE.phone2Display} />
          <ContactCard icon={PinIcon} title="Adresse" value={STORE.address} />
          <ContactCard icon={TruckIcon} title="Livraison" value="Partout au Sénégal, priorité Dakar. Frais confirmés selon la zone." />
        </div>
        <form
          className="card space-y-5 p-6 sm:p-8"
          onSubmit={(e) => {
            e.preventDefault()
            if (msg.text.trim()) window.open(waLink(text), '_blank', 'noopener')
          }}
        >
          <h2 className="text-2xl font-semibold">Envoyer un message sur WhatsApp</h2>
          <div>
            <label htmlFor="c-name" className="label">Votre nom <span className="font-normal text-ink-400">(facultatif)</span></label>
            <input id="c-name" className="field" value={msg.name} maxLength={80} onChange={(e) => setMsg({ ...msg, name: e.target.value })} />
          </div>
          <div>
            <label htmlFor="c-text" className="label">Votre message *</label>
            <textarea id="c-text" rows="5" required className="field" value={msg.text} maxLength={800} onChange={(e) => setMsg({ ...msg, text: e.target.value })} placeholder="Je voudrais savoir si…" />
          </div>
          <button type="submit" className="btn-wa w-full" disabled={!msg.text.trim()}><WhatsAppIcon /> Ouvrir WhatsApp avec mon message</button>
          <p className="text-xs text-ink-600">Le message s'ouvre dans WhatsApp : il ne part qu'après votre appui sur « Envoyer ».</p>
        </form>
      </div>
    </>
  )
}

function ContactCard({ icon: Icon, title, value, href, external }) {
  const body = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-gold-400"><Icon className="h-5 w-5" /></span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">{title}</span>
        <span className="mt-1 block text-[15px] text-ink">{value}</span>
      </span>
    </>
  )
  const cls = 'card flex items-center gap-4 p-5'
  return href ? <a href={href} className={`${cls} hover:ring-1 hover:ring-gold`} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{body}</a> : <div className={cls}>{body}</div>
}

const FAQS = [
  ['Comment passer commande ?', "Ajoutez vos produits au panier, puis cliquez sur « Valider ma commande ». Renseignez vos informations : un message prêt à envoyer s'ouvre dans WhatsApp. Vous pouvez aussi commander un produit directement avec le bouton « Commander sur WhatsApp »."],
  ['Ma commande est-elle validée dès l\'envoi du message ?', "Non. Votre message est une demande de commande. La boutique vous répond pour confirmer la disponibilité, les frais de livraison et le total. La commande est validée après cette confirmation."],
  ['Livrez-vous partout au Sénégal ?', 'Oui, nous livrons au Sénégal, avec une priorité sur Dakar. Les frais et le délai dépendent de votre zone et vous sont communiqués avant la validation.'],
  ['Combien coûte la livraison ?', "Le montant dépend de votre adresse. Il vous est annoncé sur WhatsApp avant que vous ne confirmiez la commande."],
  ['Comment puis-je payer ?', 'Les moyens de paiement acceptés vous sont indiqués par la boutique au moment de la confirmation de votre commande.'],
  ['Pourquoi certains prix sont « sur demande » ?', "Pour certains produits, notamment des parfums, le prix dépend du format disponible. Écrivez-nous sur WhatsApp : nous vous donnons le prix exact avant toute commande."],
  ['Les produits de soin conviennent-ils à tout le monde ?', "Chaque peau est différente. Lisez la notice, faites un essai sur une petite zone et, en cas de doute ou de problème de santé, demandez l'avis d'un professionnel. Nos produits ne remplacent pas un traitement médical."],
  ['Puis-je retourner un produit ?', 'Consultez notre politique de livraison et de retour. Si un produit arrive endommagé ou ne correspond pas à votre commande, contactez-nous dès la réception.']
]

export function Faq() {
  useSeo({
    title: 'Questions fréquentes',
    description: 'Commande WhatsApp, livraison au Sénégal, paiement, retours : les réponses aux questions fréquentes sur SunuCare Shop.',
    jsonLd: { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  })
  return (
    <>
      <PageHero eyebrow="Aide" title="Questions fréquentes" />
      <div className="container-x max-w-3xl py-12">
        <div className="space-y-3">
          {FAQS.map(([q, a]) => (
            <details key={q} className="group card p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-[15px] font-semibold text-forest">
                {q}
                <span className="text-xl text-gold-600 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-7 text-ink-600">{a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 rounded-2xl bg-forest p-6 text-center text-ivory">
          <ChatIcon className="mx-auto h-8 w-8 text-gold-400" />
          <p className="mt-3">Vous ne trouvez pas votre réponse ?</p>
          <a href={waLink('Bonjour SunuCare Shop, j’ai une question :')} target="_blank" rel="noopener noreferrer" className="btn-gold mt-4"><WhatsAppIcon /> Nous écrire</a>
        </div>
      </div>
    </>
  )
}

function Legal({ title, description, children }) {
  useSeo({ title, description })
  return (
    <>
      <PageHero eyebrow="Informations" title={title} />
      <div className="container-x max-w-3xl py-10">
        <Breadcrumbs items={[{ to: '/', label: 'Accueil' }, { label: title }]} />
        <div className="prose-legal">{children}</div>
        <p className="mt-12 text-xs text-ink-400">Dernière mise à jour : octobre 2026.</p>
      </div>
    </>
  )
}

export function Shipping() {
  return (
    <Legal title="Livraison et retours" description="Zones, frais et délais de livraison de SunuCare Shop au Sénégal, et conditions de retour.">
      <h2>Zones de livraison</h2>
      <p>SunuCare Shop livre au Sénégal, avec une priorité sur Dakar et sa banlieue. Les livraisons dans les autres villes se font selon les modalités disponibles au moment de la commande.</p>
      <h2>Frais et délais</h2>
      <p>Les frais et le délai de livraison dépendent de votre adresse. Ils vous sont communiqués sur WhatsApp avant la validation de votre commande. Aucun montant n'est ajouté sans votre accord.</p>
      <h2>Réception de la commande</h2>
      <ul>
        <li>Vérifiez l'état du colis et des produits à la réception.</li>
        <li>Si un produit est endommagé, incomplet ou ne correspond pas à votre commande, contactez-nous dès la réception sur WhatsApp au {STORE.whatsappDisplay}, avec une photo si possible.</li>
      </ul>
      <h2>Retours et échanges</h2>
      <p>Chaque demande de retour ou d'échange est étudiée avec vous. Pour des raisons d'hygiène et de sécurité, les produits de soin, cosmétiques et parfums ouverts ou utilisés ne peuvent pas être repris, sauf défaut constaté à la livraison.</p>
      <p>Les appareils (masseurs, accessoires) doivent être retournés complets, dans leur emballage d'origine. Les modalités (délai, frais de retour, remboursement ou échange) vous sont précisées par la boutique lors de votre demande.</p>
    </Legal>
  )
}

export function Privacy() {
  return (
    <Legal title="Politique de confidentialité" description="Comment SunuCare Shop utilise et protège vos données personnelles.">
      <h2>Données collectées</h2>
      <p>Lorsque vous passez une demande de commande, nous recevons les informations que vous saisissez : nom, numéro de téléphone, adresse et zone de livraison, notes éventuelles et produits choisis.</p>
      <h2>Utilisation</h2>
      <p>Ces données servent uniquement à traiter votre commande, organiser la livraison et vous recontacter à ce sujet. Elles ne sont ni vendues ni cédées à des tiers, en dehors du livreur chargé de votre colis.</p>
      <h2>WhatsApp</h2>
      <p>La commande est transmise par WhatsApp, un service de Meta. Le message que vous envoyez est soumis aux conditions et à la politique de confidentialité de WhatsApp.</p>
      <h2>Panier</h2>
      <p>Le contenu de votre panier est conservé dans votre navigateur (stockage local) pour ne pas le perdre pendant la navigation. Vous pouvez le vider à tout moment.</p>
      <h2>Conservation et sécurité</h2>
      <p>Les données de commande sont conservées le temps nécessaire au suivi de la commande et à nos obligations légales. L'espace de gestion de la boutique est protégé par un mot de passe.</p>
      <h2>Vos droits</h2>
      <p>Conformément à la loi sénégalaise n° 2008-12 sur la protection des données à caractère personnel, vous pouvez demander l'accès, la rectification ou la suppression de vos données en nous écrivant sur WhatsApp au {STORE.whatsappDisplay}. Vous pouvez aussi saisir la Commission de Protection des Données Personnelles (CDP).</p>
    </Legal>
  )
}

export function Terms() {
  return (
    <Legal title="Conditions générales de vente" description="Conditions générales de vente de SunuCare Shop : commande, prix, livraison, retours.">
      <h2>1. Vendeur</h2>
      <p>SunuCare Shop, {STORE.address}. WhatsApp : {STORE.whatsappDisplay}. Téléphone : {STORE.phone2Display}.</p>
      <h2>2. Produits</h2>
      <p>Les produits sont présentés avec la plus grande exactitude possible. Les photos sont celles des produits ou de leurs fabricants. Les produits de soin sont des produits cosmétiques ou de bien-être : ils ne remplacent pas un avis ou un traitement médical.</p>
      <h2>3. Prix</h2>
      <p>Les prix sont indiqués en francs CFA (FCFA). Les frais de livraison s'ajoutent au prix des articles et sont communiqués avant la validation. Lorsque le prix d'un produit est indiqué « sur demande », il vous est communiqué avant toute commande.</p>
      <h2>4. Commande</h2>
      <p>La demande de commande est envoyée par WhatsApp depuis le site. La commande n'est ferme qu'après confirmation par SunuCare Shop de la disponibilité, du prix total et de la livraison, puis accord du client.</p>
      <h2>5. Paiement</h2>
      <p>Les moyens de paiement acceptés sont précisés lors de la confirmation de la commande.</p>
      <h2>6. Livraison</h2>
      <p>Les zones, frais et délais sont décrits dans la page <Link to="/livraison-retours" className="text-emerald underline">Livraison et retours</Link>.</p>
      <h2>7. Retours</h2>
      <p>Les conditions de retour et d'échange figurent dans la page <Link to="/livraison-retours" className="text-emerald underline">Livraison et retours</Link>.</p>
      <h2>8. Données personnelles</h2>
      <p>Voir la <Link to="/confidentialite" className="text-emerald underline">politique de confidentialité</Link>.</p>
      <h2>9. Droit applicable</h2>
      <p>Les présentes conditions sont soumises au droit sénégalais. En cas de difficulté, nous vous invitons à nous contacter d'abord pour trouver une solution amiable.</p>
    </Legal>
  )
}

export default function NotFound() {
  useSeo({ title: 'Page introuvable', noindex: true })
  return (
    <div className="container-x py-24 text-center">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="mt-3 text-4xl font-semibold">Cette page est introuvable.</h1>
      <p className="mt-3 text-ink-600">Le produit ou la page demandée n'existe pas ou n'est plus en ligne.</p>
      <Link to="/boutique" className="btn-primary mt-8">Voir la boutique</Link>
    </div>
  )
}
