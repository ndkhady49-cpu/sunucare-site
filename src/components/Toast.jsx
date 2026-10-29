import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null)
  const timer = useRef()
  const show = useCallback((text) => {
    setMsg(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(null), 3500)
  }, [])
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 sm:bottom-6">
        {msg && (
          <div className="pointer-events-auto flex items-center gap-4 rounded-2xl bg-forest px-5 py-3 text-sm text-ivory shadow-lg">
            <span>{msg}</span>
            <Link to="/panier" className="font-semibold text-gold-400 underline-offset-4 hover:underline" onClick={() => setMsg(null)}>
              Voir le panier
            </Link>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
