const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const I = ({ d, className = 'h-5 w-5', children }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>{d ? <path d={d} /> : children}</svg>
)
export const SearchIcon = (p) => <I {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></I>
export const BagIcon = (p) => <I {...p}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></I>
export const MenuIcon = (p) => <I {...p} d="M4 7h16M4 12h16M4 17h16" />
export const CloseIcon = (p) => <I {...p} d="M6 6l12 12M18 6 6 18" />
export const ChevronRight = (p) => <I {...p} d="m9 6 6 6-6 6" />
export const ArrowRight = (p) => <I {...p} d="M5 12h14m-5-5 5 5-5 5" />
export const MinusIcon = (p) => <I {...p} d="M6 12h12" />
export const PlusIcon = (p) => <I {...p} d="M12 6v12M6 12h12" />
export const TrashIcon = (p) => <I {...p} d="M5 7h14M10 7V5h4v2m-7 0 1 12h8l1-12" />
export const PhoneIcon = (p) => <I {...p} d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
export const PinIcon = (p) => <I {...p}><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></I>
export const TruckIcon = (p) => <I {...p}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></I>
export const SparkIcon = (p) => <I {...p} d="M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M6 18l2.5-2.5m7-7L18 6" />
export const ChatIcon = (p) => <I {...p} d="M4 5h16v11H9l-5 4V5Z" />
export const TagIcon = (p) => <I {...p}><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="8.5" r="1.3" /></I>
export const ShieldIcon = (p) => <I {...p} d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Zm-3 9 2 2 4-4" />
export const GridIcon = (p) => <I {...p} d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
export const LeafIcon = (p) => <I {...p} d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15m0 0 7-7" />
export const BottleIcon = (p) => <I {...p} d="M10 3h4v3h-4zM9 6h6l1 3v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l1-3Z" />
export const HandIcon = (p) => <I {...p} d="M7 12V6a1.5 1.5 0 0 1 3 0v5m0-6a1.5 1.5 0 0 1 3 0v6m0-5a1.5 1.5 0 0 1 3 0v6m0-3a1.5 1.5 0 0 1 3 0v4a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-3l-3-5a1.5 1.5 0 0 1 2.5-1.6L7 14" />
export const WhatsAppIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.86 9.86 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.24 8.24 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06a6.7 6.7 0 0 1-1.99-1.23 7.5 7.5 0 0 1-1.37-1.71c-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.6.19 1.14.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
  </svg>
)
