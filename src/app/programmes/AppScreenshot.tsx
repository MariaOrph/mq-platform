'use client'

import { useState } from 'react'

interface Props {
  src:       string
  alt:       string
  className: string
}

/**
 * Image that hides itself if the file is missing, letting the placeholder
 * underneath show through. Lives on the /programmes landing page so we can
 * ship the layout before all the screenshot assets are in place.
 */
export default function AppScreenshot({ src, alt, className }: Props) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
