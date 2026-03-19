'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { RATING_LABELS, type FeedbackDimension } from '@/lib/feedback/dimensions'

interface SurveyData {
  requestId:      string
  participantId:  string
  firstName:      string
  respondentName: string | null
  dimensions:     FeedbackDimension[]
  companyValues:  { id: string; value_name: string; behaviours: string[] }[]
}

type PageState = 'loading' | 'ready' | 'submitting' | 'done' | 'already_submitted' | 'error'

export default function FeedbackSurveyPage() {
  const { token } = useParams<{ token: string }>()
  const [pageState,    setPageState]    = useState<PageState>('loading')
  const [survey,       setSurvey]       = useState<SurveyData | null>(null)
  const [ratings,      setRatings]      = useState<Record<string, number>>({})
  const [valRatings,   setValRatings]   = useState<Record<string, number>>({})
  const [comment,      setComment]      = useState('')
  const [currentDim,   setCurrentDim]   = useState(0)  // step through dimensions

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`/api/feedback/survey?token=${token}`)
        const data = await res.json()
        if (data.alreadySubmitted) { setPageState('already_submitted'); return }
        if (!res.ok || !data.requestId) { setPageState('error'); return }
        setSurvey(data)
        setPageState('ready')
      } catch {
        setPageState('error')
      }
    }
    if (token) load()
  }, [token])

  function setRating(key: string, value: number) {
    setRatings(prev => ({ ...prev, [key]: value }))
  }

  function setValRating(valueName: string, value: number) {
    setValRatings(prev => ({ ...prev, [valueName]: value }))
  }

  // Check if current dimension is fully rated
  function dimComplete(dimIndex: number): boolean {
    if (!survey) return false
    const dim = survey.dimensions[dimIndex]
    return dim.statements.every((_, si) => ratings[`d${dim.id}_s${si}`] !== undefined)
  }

  // Total steps = dimensions + (values section if any) + comment
  const totalSteps   = survey ? survey.dimensions.length + (survey.companyValues.length > 0 ? 1 : 0) + 1 : 0
  const valuesStep   = survey ? survey.dimensions.length : -1
  const commentStep  = survey ? survey.dimensions.length + (survey.companyValues.length > 0 ? 1 : 0) : -1
  const isValuesStep = currentDim === valuesStep && (survey?.companyValues.length ?? 0) > 0
  const isCommentStep = currentDim === commentStep

  async function handleSubmit() {
    if (!survey) return
    setPageState('submitting')
    try {
      const res = await fetch('/api/feedback/survey', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, ratings, valuesRatings: valRatings, comment }),
      })
      const data = await res.json()
      if (data.success || data.alreadySubmitted) setPageState('done')
      else setPageState('error')
    } catch {
      setPageState('error')
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (pageState === 'loading') return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8FDF7' }}>
      <div className="flex gap-1.5">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full animate-bounce"
               style={{ backgroundColor: '#0AF3CD', animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )

  // ── Already submitted ────────────────────────────────────────────────────────
  if (pageState === 'already_submitted') return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#E8FDF7' }}>
      <div className="w-full max-w-md text-center">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#0A2E2A' }}>Already submitted</h1>
        <p className="text-sm" style={{ color: '#05A88E' }}>You've already completed this feedback survey. Thank you.</p>
      </div>
    </div>
  )

  // ── Done ─────────────────────────────────────────────────────────────────────
  if (pageState === 'done') return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#E8FDF7' }}>
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
             style={{ backgroundColor: '#0AF3CD' }}>
          <span className="text-2xl font-bold" style={{ color: '#0A2E2A' }}>✓</span>
        </div>
        <h1 className="text-2xl font-semibold mb-3" style={{ color: '#0A2E2A' }}>Thank you</h1>
        <p className="text-sm leading-relaxed" style={{ color: '#05A88E' }}>
          Your feedback has been submitted. Your responses are completely anonymous
          and will only ever be seen as part of an aggregated summary.
        </p>
      </div>
    </div>
  )

  // ── Error ────────────────────────────────────────────────────────────────────
  if (pageState === 'error' || !survey) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#E8FDF7' }}>
      <div className="w-full max-w-md text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#0A2E2A' }}>Survey not found</h1>
        <p className="text-sm" style={{ color: '#05A88E' }}>
          This link may have expired or already been used.
        </p>
      </div>
    </div>
  )

  const progressPct = Math.round((currentDim / totalSteps) * 100)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E8FDF7' }}>

      {/* Header */}
      <div className="bg-white shadow-sm px-6 pt-5 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ backgroundColor: '#0AF3CD' }}>
              <span className="font-bold text-xs" style={{ color: '#0A2E2A' }}>MQ</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#0A2E2A' }}>
              360 Feedback for {survey.firstName}
            </span>
          </div>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
            <div className="h-1.5 rounded-full transition-all duration-500"
                 style={{ width: `${progressPct}%`, backgroundColor: '#0AF3CD' }} />
          </div>
          <p className="text-xs mt-1.5" style={{ color: '#9CA3AF' }}>
            {currentDim + 1} of {totalSteps}
          </p>
        </div>
      </div>

      {/* Intro screen (step 0 before any dim — reuse currentDim === -1 trick via a separate gate) */}

      <div className="max-w-lg mx-auto px-6 py-8">

        {/* Anonymity note — only on first step */}
        {currentDim === 0 && (
          <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: '#B9F8DD' }}>
            <p className="text-sm leading-relaxed" style={{ color: '#0A2E2A' }}>
              <strong>Your responses are completely anonymous.</strong> {survey.firstName} will only ever
              see aggregated results across all respondents — never individual answers.
            </p>
          </div>
        )}

        {/* ── Dimension step ─────────────────────────────────────────────────── */}
        {!isValuesStep && !isCommentStep && (() => {
          const dim = survey.dimensions[currentDim]
          return (
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4"
                   style={{ backgroundColor: dim.bg, color: dim.color }}>
                {dim.name}
              </div>
              <p className="text-xs mb-6" style={{ color: '#9CA3AF' }}>
                Rate each statement based on what you have directly observed.
              </p>

              <div className="space-y-6">
                {dim.statements.map((stmt, si) => {
                  const key     = `d${dim.id}_s${si}`
                  const current = ratings[key]
                  return (
                    <div key={si}>
                      <p className="text-sm font-medium leading-snug mb-3" style={{ color: '#0A2E2A' }}>
                        "{stmt}"
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {([1,2,3,4] as const).map(val => (
                          <button
                            key={val}
                            onClick={() => setRating(key, val)}
                            className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                            style={{
                              backgroundColor: current === val ? dim.color : dim.bg,
                              color:           current === val ? 'rgba(0,0,0,0.75)' : dim.color,
                              border:          `1.5px solid ${dim.color}50`,
                              boxShadow:       current === val ? `0 0 0 1px ${dim.color}` : 'none',
                            }}
                          >
                            {RATING_LABELS[val]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentDim(d => d + 1)}
                disabled={!dimComplete(currentDim)}
                className="w-full mt-8 py-3.5 rounded-xl text-sm font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
              >
                Next →
              </button>
            </div>
          )
        })()}

        {/* ── Values step ────────────────────────────────────────────────────── */}
        {isValuesStep && (
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4"
                 style={{ backgroundColor: '#FEF3C7', color: '#F59E0B' }}>
              ⭐ Company Values
            </div>
            <p className="text-xs mb-6" style={{ color: '#9CA3AF' }}>
              How consistently does {survey.firstName} demonstrate each of these values in their leadership?
            </p>

            <div className="space-y-6">
              {survey.companyValues.map(v => {
                const current = valRatings[v.value_name]
                return (
                  <div key={v.id}>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#0A2E2A' }}>{v.value_name}</p>
                    {v.behaviours.length > 0 && (
                      <ul className="mb-3 space-y-0.5">
                        {v.behaviours.map((b, i) => (
                          <li key={i} className="text-xs" style={{ color: '#6B7280' }}>· {b}</li>
                        ))}
                      </ul>
                    )}
                    <div className="grid grid-cols-4 gap-2">
                      {([1,2,3,4] as const).map(val => (
                        <button
                          key={val}
                          onClick={() => setValRating(v.value_name, val)}
                          className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                          style={{
                            backgroundColor: current === val ? '#F59E0B' : '#FEF3C7',
                            color:           current === val ? 'white' : '#F59E0B',
                            border:          '1.5px solid #F59E0B50',
                            boxShadow:       current === val ? '0 0 0 1px #F59E0B' : 'none',
                          }}
                        >
                          {RATING_LABELS[val]}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentDim(d => d + 1)}
              className="w-full mt-8 py-3.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
            >
              Next →
            </button>
          </div>
        )}

        {/* ── Comment step ───────────────────────────────────────────────────── */}
        {isCommentStep && (
          <div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#0A2E2A' }}>
              Any final thoughts?
            </h2>
            <p className="text-sm mb-6" style={{ color: '#05A88E' }}>
              Optional — share anything else you think would be useful for {survey.firstName}'s development.
              This is anonymous.
            </p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={`e.g. "The area where I think ${survey.firstName} has the biggest opportunity to grow is…"`}
              rows={5}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none mb-6"
              style={{
                border:          '1.5px solid #B9F8DD',
                backgroundColor: 'white',
                color:           '#374151',
                lineHeight:      1.6,
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={pageState === 'submitting'}
              className="w-full py-3.5 rounded-xl text-sm font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
            >
              {pageState === 'submitting' ? 'Submitting…' : 'Submit feedback →'}
            </button>
          </div>
        )}

        {/* Back button */}
        {currentDim > 0 && (
          <button
            onClick={() => setCurrentDim(d => d - 1)}
            className="w-full mt-3 py-2 text-xs font-medium hover:opacity-70 transition-opacity"
            style={{ color: '#9CA3AF' }}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}
