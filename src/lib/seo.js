import { useEffect } from 'react'

const SITE = 'SunuCare Shop'

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// Titre et méta-description propres à chaque page.
export function useSeo({ title, description, noindex = false, jsonLd }) {
  useEffect(() => {
    const full = title ? `${title} | ${SITE}` : `${SITE} | Soins, bien-être, parfums et accessoires au Sénégal`
    document.title = full
    if (description) {
      setMeta('name', 'description', description)
      setMeta('property', 'og:description', description)
    }
    setMeta('property', 'og:title', full)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    let script
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
    return () => script?.remove()
  }, [title, description, noindex, jsonLd])
}
