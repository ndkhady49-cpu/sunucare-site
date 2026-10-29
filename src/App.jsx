import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { CatalogProvider } from './lib/catalog.jsx'
import { ToastProvider } from './components/Toast.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import NotFound, { About, Contact, Faq, Privacy, Shipping, Terms } from './pages/Info.jsx'

const Admin = lazy(() => import('./pages/admin/Admin.jsx'))

export default function App() {
  return (
    <CatalogProvider>
      <ToastProvider>
        <Routes>
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<p className="p-10 text-center">Chargement…</p>}>
                <Admin />
              </Suspense>
            }
          />
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="boutique" element={<Shop />} />
            <Route path="boutique/:slug" element={<Shop />} />
            <Route path="produit/:slug" element={<Product />} />
            <Route path="promotions" element={<Shop promoOnly />} />
            <Route path="a-propos" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="panier" element={<Cart />} />
            <Route path="commande" element={<Checkout />} />
            <Route path="faq" element={<Faq />} />
            <Route path="livraison-retours" element={<Shipping />} />
            <Route path="confidentialite" element={<Privacy />} />
            <Route path="conditions-generales-de-vente" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </CatalogProvider>
  )
}
