import { asset } from '../lib/format.js'

// Logo officiel, affiché tel quel (fond blanc d'origine, proportions conservées).
export default function Logo({ className = 'h-12 w-auto', framed = false }) {
  const img = (
    <img
      src={asset('/images/brand/logo-240.png')}
      srcSet={`${asset('/images/brand/logo-240.png')} 240w, ${asset('/images/brand/logo-480.png')} 480w`}
      sizes="160px"
      width="240"
      height="191"
      alt="SunuCare Shop"
      className={className}
    />
  )
  if (!framed) return img
  return <span className="inline-block rounded-xl bg-white p-2 ring-1 ring-gold/60">{img}</span>
}
