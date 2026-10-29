import { Link } from 'react-router-dom'
import { ChevronRight } from './Icons.jsx'

export function SectionHeading({ eyebrow, title, text, align = 'left', as: H = 'h2', children }) {
  const center = align === 'center'
  return (
    <div className={`mb-8 flex flex-col gap-3 sm:mb-10 ${center ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'}`}>
      <div className={center ? 'flex flex-col items-center' : ''}>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <H className="text-3xl font-semibold sm:text-4xl">{title}</H>
        <div className={`gold-rule mt-4 ${center ? 'mx-auto' : ''}`} />
        {text && <p className={`mt-4 max-w-2xl text-[15px] leading-7 text-ink-600 ${center ? 'mx-auto' : ''}`}>{text}</p>}
      </div>
      {children}
    </div>
  )
}

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-6 text-xs text-ink-400">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {it.to ? <Link to={it.to} className="hover:text-emerald">{it.label}</Link> : <span aria-current="page" className="text-ink-600">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function PageHero({ eyebrow, title, text }) {
  return (
    <section className="border-b border-gold/20 bg-gradient-to-b from-white to-ivory">
      <div className="container-x py-10 sm:py-14">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
        <div className="gold-rule mt-4" />
        {text && <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-600">{text}</p>}
      </div>
    </section>
  )
}
