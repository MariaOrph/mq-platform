'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ResourceViewerInner() {
  const searchParams = useSearchParams()
  const filename = searchParams.get('file') ?? ''
  const title    = searchParams.get('title') ?? 'Resource'

  // Guard: filename must be non-empty and contain no path traversal characters
  const safeFilename = filename && !/[\\/]/.test(filename) ? filename : ''
  const pdfUrl = safeFilename
    ? `/resources/${encodeURIComponent(safeFilename)}`
    : null

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0A2E2A' }}>
      {/* Header */}
      <div className="sticky top-0 z-30" style={{ backgroundColor: '#0A2E2A' }}>
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="/dashboard/resources"
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(10,243,205,0.12)', color: '#0AF3CD' }}
              aria-label="Back to Resource Centre"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </a>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider truncate" style={{ color: '#0AF3CD' }}>
                Resource
              </p>
              <p className="text-sm font-bold truncate" style={{ color: 'white' }}>
                {title}
              </p>
            </div>
          </div>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="text-xs font-semibold px-3 py-2 rounded-xl flex-shrink-0 flex items-center gap-1.5"
              style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
              aria-label="Open or download PDF"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </a>
          )}
        </div>
      </div>

      {/* PDF viewer */}
      <div className="flex-1 flex">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={title}
            className="w-full"
            style={{ flex: 1, border: 'none', backgroundColor: '#F4FDF9' }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="text-center max-w-sm">
              <div className="text-4xl mb-3">📄</div>
              <h1 className="text-base font-bold mb-2" style={{ color: 'white' }}>
                Resource not found
              </h1>
              <p className="text-sm mb-6" style={{ color: 'rgba(185,248,221,0.7)' }}>
                We couldn&apos;t find that resource. It may have been moved or renamed.
              </p>
              <a
                href="/dashboard/resources"
                className="inline-block px-5 py-3 rounded-xl text-sm font-bold"
                style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
              >
                Back to Resource Centre
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResourceViewer() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A2E2A' }}>
        <p className="text-sm" style={{ color: '#0AF3CD' }}>Loading…</p>
      </div>
    }>
      <ResourceViewerInner />
    </Suspense>
  )
}
