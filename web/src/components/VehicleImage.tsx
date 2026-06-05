import { useState } from 'react'

interface Props {
  src: string | undefined
  alt: string
  className?: string
}

/** Vehicle photo with a graceful fallback when the placeholder URL fails. */
export function VehicleImage({ src, alt, className }: Props) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 ${className ?? ''}`}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M3 16.5 9 10l4 4 3-3 5 5M3 5h18v14H3z" />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
