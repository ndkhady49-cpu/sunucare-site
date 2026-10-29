// Serveur SunuCare Shop : sert le site, le catalogue, les demandes de commande et l'administration.
// Lancement : ADMIN_PASSWORD="…" npm start   (voir GUIDE-LANCEMENT.md)
import express from 'express'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'server/data')
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(ROOT, 'server/uploads')
const DIST = path.join(ROOT, 'dist')
const PORT = Number(process.env.PORT) || 3000
const PROD = process.env.NODE_ENV === 'production'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
const ADMIN_ENABLED = ADMIN_PASSWORD.length >= 10
const SESSION_HOURS = 8

mkdirSync(DATA_DIR, { recursive: true })
mkdirSync(UPLOAD_DIR, { recursive: true })

// ---------- Stockage JSON (écriture atomique) ----------
const file = (name) => path.join(DATA_DIR, `${name}.json`)
function load(name, fallback) {
  try { return JSON.parse(readFileSync(file(name), 'utf8')) } catch { return fallback }
}
function save(name, data) {
  const tmp = `${file(name)}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify(data, null, 1))
  renameSync(tmp, file(name))
}
if (!existsSync(file('catalogue'))) {
  save('catalogue', JSON.parse(readFileSync(path.join(ROOT, 'src/data/catalogue.json'), 'utf8')))
  console.log('Catalogue initialisé depuis src/data/catalogue.json')
}
let catalogue = load('catalogue', { categories: [], products: [] })
let orders = load('commandes', [])

// ---------- Validation ----------
const AVAIL = ['disponible', 'a-confirmer', 'rupture']
const str = (v, max, def = '') => (typeof v === 'string' ? v.trim().slice(0, max) : def)
const intOrNull = (v, max = 10_000_000) => {
  if (v === null || v === '' || v === undefined) return null
  const n = Number(v)
  return Number.isInteger(n) && n >= 0 && n <= max ? n : undefined
}
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
const okImg = (s) => typeof s === 'string' && /^\/(images|uploads)\/[\w./-]+$/.test(s) && !s.includes('..')

function cleanProduct(input, existingId) {
  const errors = []
  const p = {
    name: str(input.name, 140),
    category: str(input.category, 60),
    price: intOrNull(input.price),
    comparePrice: intOrNull(input.comparePrice),
    stock: intOrNull(input.stock, 100000),
    availability: AVAIL.includes(input.availability) ? input.availability : 'a-confirmer',
    hidden: !!input.hidden,
    featured: !!input.featured,
    short: str(input.short, 400),
    description: str(input.description, 3000),
    features: Array.isArray(input.features) ? input.features.map((f) => str(f, 200)).filter(Boolean).slice(0, 15) : [],
    usage: str(input.usage, 2000),
    precautions: str(input.precautions, 2000),
    volume: str(input.volume, 40) || null,
    adminNote: str(input.adminNote, 1000),
    images: Array.isArray(input.images)
      ? input.images.filter((i) => i && okImg(i.src) && (!i.thumb || okImg(i.thumb))).slice(0, 8).map((i) => ({ src: i.src, ...(i.thumb ? { thumb: i.thumb } : {}), alt: str(i.alt, 200) }))
      : []
  }
  p.slug = slugify(str(input.slug, 80) || p.name)
  if (!p.name) errors.push('Le nom est obligatoire.')
  if (!p.slug) errors.push("L'adresse (slug) est invalide.")
  if (!catalogue.categories.some((c) => c.slug === p.category)) errors.push('Catégorie inconnue.')
  if (p.price === undefined) errors.push('Prix invalide (nombre entier en FCFA, ou vide).')
  if (p.comparePrice === undefined) errors.push('Ancien prix invalide.')
  if (p.stock === undefined) errors.push('Stock invalide.')
  if (p.comparePrice !== null && (p.price === null || p.comparePrice <= p.price)) errors.push("L'ancien prix doit être supérieur au prix actuel (sinon, laissez-le vide).")
  if (catalogue.products.some((o) => o.slug === p.slug && o.id !== existingId)) errors.push('Un autre produit utilise déjà cette adresse (slug).')
  if (p.stock === 0) p.availability = 'rupture'
  return { p, errors }
}

// ---------- Sessions admin ----------
const sessions = new Map() // token -> expiration
const SALT = randomBytes(16)
const PASS_HASH = ADMIN_ENABLED ? scryptSync(ADMIN_PASSWORD, SALT, 32) : null
const cookieOf = (req, name) => (req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).find(([k]) => k === name)?.[1]

function rateLimiter(max, windowMs) {
  const hits = new Map()
  return (req, res, next) => {
    const now = Date.now()
    const h = (hits.get(req.ip) || []).filter((t) => now - t < windowMs)
    if (h.length >= max) return res.status(429).json({ error: 'Trop de tentatives. Réessayez plus tard.' })
    h.push(now)
    hits.set(req.ip, h)
    if (hits.size > 5000) hits.clear()
    next()
  }
}

function requireAdmin(req, res, next) {
  if (!ADMIN_ENABLED) return res.status(503).json({ error: "Administration non configurée : définissez ADMIN_PASSWORD (10 caractères minimum)." })
  const token = cookieOf(req, 'sc_admin')
  const exp = token && sessions.get(token)
  if (!exp || exp < Date.now()) {
    if (token) sessions.delete(token)
    return res.status(401).json({ error: 'Session expirée. Reconnectez-vous.' })
  }
  // Protection CSRF : en-tête personnalisé obligatoire pour toute modification
  if (req.method !== 'GET' && req.get('X-SunuCare-Admin') !== '1') return res.status(403).json({ error: 'Requête refusée.' })
  next()
}

// ---------- Application ----------
const app = express()
app.disable('x-powered-by')
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY)

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy':
      "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  })
  next()
})

const publicCatalogue = () => ({
  categories: catalogue.categories.filter((c) => !c.hidden),
  products: catalogue.products.filter((p) => !p.hidden).map(({ adminNote, stock, ...p }) => p)
})

app.get('/api/catalogue', (req, res) => {
  res.set('Cache-Control', 'no-cache')
  res.json(publicCatalogue())
})

// Demande de commande : enregistrée avant l'ouverture de WhatsApp. Les prix sont recalculés côté serveur.
app.post('/api/commandes', rateLimiter(10, 10 * 60_000), express.json({ limit: '20kb' }), (req, res) => {
  const c = req.body?.customer || {}
  const customer = { name: str(c.name, 120), phone: str(c.phone, 20), address: str(c.address, 200), zone: str(c.zone, 120), notes: str(c.notes, 500) }
  if (!customer.name || customer.phone.replace(/\D/g, '').length < 9 || !customer.address || !customer.zone)
    return res.status(400).json({ error: 'Informations client incomplètes.' })
  const raw = Array.isArray(req.body?.items) ? req.body.items.slice(0, 50) : []
  const items = []
  for (const it of raw) {
    const p = catalogue.products.find((x) => x.id === it?.id && !x.hidden)
    const qty = Number(it?.qty)
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 99) continue
    items.push({ id: p.id, name: p.name, price: p.price, qty })
  }
  if (!items.length) return res.status(400).json({ error: 'Panier vide.' })
  const d = new Date()
  const reference = `SC-${d.toISOString().slice(2, 10).replace(/-/g, '')}-${randomBytes(2).toString('hex').toUpperCase()}`
  orders.unshift({
    reference,
    createdAt: d.toISOString(),
    status: 'nouvelle',
    customer,
    items,
    subtotal: items.reduce((n, i) => n + (i.price ?? 0) * i.qty, 0),
    hasUnpriced: items.some((i) => i.price === null),
    note: ''
  })
  save('commandes', orders)
  res.status(201).json({ reference })
})

// ---------- Administration ----------
const admin = express.Router()
admin.use(express.json({ limit: '200kb' }))

admin.post('/login', rateLimiter(5, 15 * 60_000), (req, res) => {
  if (!ADMIN_ENABLED) return res.status(503).json({ error: "Administration non configurée : définissez ADMIN_PASSWORD (10 caractères minimum)." })
  const given = scryptSync(String(req.body?.password || ''), SALT, 32)
  if (!timingSafeEqual(given, PASS_HASH)) return res.status(401).json({ error: 'Mot de passe incorrect.' })
  const token = randomBytes(32).toString('hex')
  sessions.set(token, Date.now() + SESSION_HOURS * 3600_000)
  const secure = PROD && process.env.COOKIE_SECURE !== '0' ? '; Secure' : ''
  res.set('Set-Cookie', `sc_admin=${token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${SESSION_HOURS * 3600}${secure}`)
  res.json({ ok: true })
})

admin.post('/logout', (req, res) => {
  sessions.delete(cookieOf(req, 'sc_admin'))
  res.set('Set-Cookie', 'sc_admin=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0')
  res.json({ ok: true })
})

admin.use(requireAdmin)
admin.get('/session', (req, res) => res.json({ ok: true }))
admin.get('/catalogue', (req, res) => res.json(catalogue))

admin.post('/produits', (req, res) => {
  const { p, errors } = cleanProduct(req.body || {})
  if (errors.length) return res.status(400).json({ error: errors.join(' ') })
  p.id = p.slug
  if (catalogue.products.some((o) => o.id === p.id)) return res.status(400).json({ error: 'Ce produit existe déjà.' })
  catalogue.products.push(p)
  save('catalogue', catalogue)
  res.status(201).json(p)
})

admin.put('/produits/:id', (req, res) => {
  const i = catalogue.products.findIndex((o) => o.id === req.params.id)
  if (i < 0) return res.status(404).json({ error: 'Produit introuvable.' })
  const { p, errors } = cleanProduct(req.body || {}, req.params.id)
  if (errors.length) return res.status(400).json({ error: errors.join(' ') })
  p.id = req.params.id // l'identifiant reste stable (paniers déjà remplis)
  catalogue.products[i] = p
  save('catalogue', catalogue)
  res.json(p)
})

admin.delete('/produits/:id', (req, res) => {
  const before = catalogue.products.length
  catalogue.products = catalogue.products.filter((o) => o.id !== req.params.id)
  if (catalogue.products.length === before) return res.status(404).json({ error: 'Produit introuvable.' })
  save('catalogue', catalogue)
  res.json({ ok: true })
})

admin.put('/categories', (req, res) => {
  const list = Array.isArray(req.body) ? req.body.slice(0, 30) : null
  if (!list) return res.status(400).json({ error: 'Liste invalide.' })
  const cats = list.map((c, i) => ({
    slug: slugify(str(c.slug, 60) || str(c.name, 60)),
    name: str(c.name, 80),
    description: str(c.description, 400),
    image: okImg(c.image) ? c.image : '',
    imageAlt: str(c.imageAlt, 200),
    order: i + 1,
    hidden: !!c.hidden
  }))
  if (cats.some((c) => !c.name || !c.slug)) return res.status(400).json({ error: 'Chaque catégorie doit avoir un nom.' })
  if (new Set(cats.map((c) => c.slug)).size !== cats.length) return res.status(400).json({ error: 'Deux catégories ont la même adresse.' })
  const used = new Set(catalogue.products.map((p) => p.category))
  const missing = [...used].filter((s) => !cats.some((c) => c.slug === s))
  if (missing.length) return res.status(400).json({ error: `Catégorie encore utilisée par des produits : ${missing.join(', ')}. Déplacez ces produits d'abord.` })
  catalogue.categories = cats
  save('catalogue', catalogue)
  res.json(cats)
})

// Envoi d'image : corps binaire (JPEG, PNG ou WebP, 5 Mo max), type vérifié par signature
admin.post('/images', express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '5mb' }), (req, res) => {
  const b = req.body
  if (!Buffer.isBuffer(b) || b.length < 12) return res.status(400).json({ error: 'Image manquante ou format non accepté (JPEG, PNG, WebP).' })
  const ext =
    b[0] === 0xff && b[1] === 0xd8 ? 'jpg'
    : b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ? 'png'
    : b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' ? 'webp'
    : null
  if (!ext) return res.status(400).json({ error: 'Le fichier envoyé n’est pas une image valide.' })
  const name = `${Date.now()}-${randomBytes(4).toString('hex')}.${ext}`
  writeFileSync(path.join(UPLOAD_DIR, name), b)
  res.status(201).json({ src: `/uploads/${name}` })
})

admin.get('/commandes', (req, res) => res.json(orders))
admin.patch('/commandes/:ref', (req, res) => {
  const o = orders.find((x) => x.reference === req.params.ref)
  if (!o) return res.status(404).json({ error: 'Commande introuvable.' })
  const STATUS = ['nouvelle', 'confirmée', 'livrée', 'annulée']
  if (req.body?.status !== undefined) {
    if (!STATUS.includes(req.body.status)) return res.status(400).json({ error: 'Statut invalide.' })
    o.status = req.body.status
  }
  if (req.body?.note !== undefined) o.note = str(req.body.note, 1000)
  save('commandes', orders)
  res.json(o)
})
admin.delete('/commandes/:ref', (req, res) => {
  orders = orders.filter((x) => x.reference !== req.params.ref)
  save('commandes', orders)
  res.json({ ok: true })
})

app.use('/api/admin', (req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
}, admin)
app.use('/api', (req, res) => res.status(404).json({ error: 'Introuvable.' }))

// ---------- Fichiers du site ----------
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true }))
app.use('/assets', express.static(path.join(DIST, 'assets'), { maxAge: '1y', immutable: true }))
app.use(express.static(DIST, { maxAge: '1h', index: false }))
app.get('/{*splat}', (req, res) => {
  if (!existsSync(path.join(DIST, 'index.html'))) return res.status(503).send('Site non construit : lancez « npm run build ».')
  res.set('Cache-Control', 'no-cache').sendFile(path.join(DIST, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`SunuCare Shop : http://localhost:${PORT}`)
  console.log(ADMIN_ENABLED ? 'Administration : /admin' : 'Administration désactivée (ADMIN_PASSWORD absent ou trop court).')
})
