import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { useSeo } from '../../lib/seo.js'
import Logo from '../../components/Logo.jsx'
import { api } from './api.js'
import Products from './Products.jsx'
import Categories from './Categories.jsx'
import Orders from './Orders.jsx'

export default function Admin() {
  useSeo({ title: 'Administration', noindex: true })
  const [state, setState] = useState('loading') // loading | login | ready | unavailable
  const [message, setMessage] = useState('')

  const check = useCallback(() => {
    api('/session')
      .then(() => setState('ready'))
      .catch((e) => {
        if (e.status === 401) setState('login')
        else { setMessage(e.message); setState('unavailable') }
      })
  }, [])
  useEffect(() => {
    check()
  }, [check])

  if (state === 'loading') return <p className="p-10 text-center text-ink-600">Chargement…</p>
  if (state === 'unavailable')
    return (
      <Shell>
        <div className="card mx-auto mt-16 max-w-lg p-8 text-center">
          <h1 className="text-3xl font-semibold">Administration indisponible</h1>
          <p className="mt-4 text-sm leading-6 text-ink-600">{message}</p>
          <p className="mt-3 text-sm leading-6 text-ink-600">L'administration fonctionne lorsque le site est lancé avec son serveur (voir le guide de lancement).</p>
          <Link to="/" className="btn-outline mt-6">Retour au site</Link>
        </div>
      </Shell>
    )
  if (state === 'login') return <Shell><Login onDone={() => setState('ready')} /></Shell>

  const logout = async () => {
    await api('/logout', { method: 'POST' }).catch(() => {})
    setState('login')
  }
  const tab = ({ isActive }) => `rounded-full px-4 py-2 text-sm font-medium ${isActive ? 'bg-forest text-ivory' : 'text-ink hover:bg-white'}`
  return (
    <Shell
      nav={
        <>
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/admin" end className={tab}>Produits</NavLink>
            <NavLink to="/admin/categories" className={tab}>Catégories</NavLink>
            <NavLink to="/admin/commandes" className={tab}>Commandes</NavLink>
          </nav>
          <button type="button" onClick={logout} className="text-sm text-ink-600 hover:text-red-700">Se déconnecter</button>
        </>
      }
    >
      <Routes>
        <Route index element={<Products onAuthLost={() => setState('login')} />} />
        <Route path="categories" element={<Categories onAuthLost={() => setState('login')} />} />
        <Route path="commandes" element={<Orders onAuthLost={() => setState('login')} />} />
      </Routes>
    </Shell>
  )
}

function Shell({ children, nav }) {
  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-gold/25 bg-white">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 py-3">
          <Link to="/" className="flex items-center gap-3"><Logo className="h-10 w-auto" /><span className="eyebrow">Administration</span></Link>
          {nav}
        </div>
      </header>
      <main className="container-x py-8">{children}</main>
    </div>
  )
}

function Login({ onDone }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <form
      className="card mx-auto mt-16 max-w-sm space-y-5 p-8"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError('')
        try {
          await api('/login', { method: 'POST', body: { password } })
          onDone()
        } catch (err) {
          setError(err.message)
        } finally {
          setBusy(false)
        }
      }}
    >
      <h1 className="text-3xl font-semibold">Connexion</h1>
      <div>
        <label htmlFor="pw" className="label">Mot de passe administrateur</label>
        <input id="pw" type="password" autoComplete="current-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
    </form>
  )
}

export function useAdminData(path, onAuthLost) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const reload = useCallback(() => {
    api(path).then(setData).catch((e) => (e.status === 401 ? onAuthLost() : setError(e.message)))
  }, [path, onAuthLost])
  useEffect(() => {
    reload()
  }, [reload])
  return { data, setData, error, setError, reload }
}
