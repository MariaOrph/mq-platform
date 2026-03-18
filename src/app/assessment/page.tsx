'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  DIMENSIONS, ALL_QUESTIONS, SCALE_OPTIONS,
  calculateAllScores, getScoreLabel, getDimensionInsight, getPersonalisedMessage,
} from '@/lib/assessment/data'

type Step = 'welcome' | 'info' | 'questions' | 'results'
type ParticipantRole = 'manager' | 'leader'

interface Scores { dimensionScores: number[]; overall: number }

export default function AssessmentPage() {
  const [step, setStep]                     = useState<Step>('welcome')
  const [firstName, setFirstName]           = useState('')
  const [participantRole, setParticipantRole] = useState<ParticipantRole | ''>('')
  const [responses, setResponses]           = useState<number[]>(Array(24).fill(0))
  const [currentQ, setCurrentQ]             = useState(0)
  const [scores, setScores]                 = useState<Scores | null>(null)

  const currentQuestion = ALL_QUESTIONS[currentQ]
  const currentDimension = currentQuestion.dimension
  const progressPercent = ((currentQ + 1) / 24) * 100
  const currentResponse = responses[currentQ]

  function handleSelect(value: number) {
    const updated = [...responses]
    updated[currentQ] = value
    setResponses(updated)
  }

  function handleNext() {
    if (currentQ < 23) {
      setCurrentQ(currentQ + 1)
    } else {
      handleComplete()
    }
  }

  function handleBack() {
    if (currentQ > 0) setCurrentQ(currentQ - 1)
    else setStep('info')
  }

  async function handleComplete() {
    const newScores = calculateAllScores(responses)
    setScores(newScores)
    setStep('results')

    // Save to database in the background
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase
        .from('profiles').select('company_id').eq('id', session.user.id).single()

      await supabase.from('assessments').insert({
        participant_id:   session.user.id,
        company_id:       profile?.company_id ?? null,
        first_name:       firstName,
        participant_role: participantRole,
        responses,
        d1_score:         newScores.dimensionScores[0],
        d2_score:         newScores.dimensionScores[1],
        d3_score:         newScores.dimensionScores[2],
        d4_score:         newScores.dimensionScores[3],
        d5_score:         newScores.dimensionScores[4],
        d6_score:         newScores.dimensionScores[5],
        overall_score:    newScores.overall,
      })
    } catch (err) {
      console.error('Assessment save failed:', err)
    }
  }

  // ── WELCOME ─────────────────────────────────────────────────
  if (step === 'welcome') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
         style={{ backgroundColor: '#E8FDF7' }}>
      <div className="w-full max-w-xl">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: '#0AF3CD' }}>
            <span className="font-bold text-lg" style={{ color: '#0A2E2A' }}>MQ</span>
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-center mb-8" style={{ color: '#0A2E2A' }}>
          MQ Assessment
        </h1>

        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3"
             style={{ color: '#05A88E' }}>What is MQ?</p>
          <p className="text-base leading-relaxed" style={{ color: '#0A2E2A' }}>
            <strong>MQ (Mindset Quotient)</strong> is the ability to notice your thoughts,
            beliefs and emotional triggers, and choose how you respond to them, rather than
            being unconsciously driven by them.
          </p>
        </div>

        <div className="rounded-2xl p-5 mb-8" style={{ backgroundColor: '#B9F8DD' }}>
          <p className="text-sm leading-relaxed" style={{ color: '#0A2E2A' }}>
            <strong>A note on privacy:</strong> Your overall MQ score will be visible to your
            programme lead. Your individual answers and all coaching conversations are completely
            private and will never be shared.
          </p>
        </div>

        <button onClick={() => setStep('info')}
          className="w-full py-4 rounded-xl text-base font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
          Start your assessment →
        </button>
      </div>
    </div>
  )

  // ── INFO ────────────────────────────────────────────────────
  if (step === 'info') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
         style={{ backgroundColor: '#E8FDF7' }}>
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-2" style={{ color: '#0A2E2A' }}>
          Before you begin
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: '#05A88E' }}>
          This helps us personalise your results.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: '#0A2E2A' }}>
            Your first name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            className="w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none"
            style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium mb-3" style={{ color: '#0A2E2A' }}>
            I am a…
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['manager', 'leader'] as const).map(r => (
              <button key={r} onClick={() => setParticipantRole(r)}
                className="py-5 rounded-xl border-2 text-base font-medium capitalize transition-all"
                style={{
                  borderColor:     participantRole === r ? '#0AF3CD' : '#B9F8DD',
                  backgroundColor: participantRole === r ? '#E8FDF7' : 'white',
                  color:           '#0A2E2A',
                  boxShadow:       participantRole === r ? '0 0 0 1px #0AF3CD' : 'none',
                }}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setStep('questions')}
          disabled={!firstName.trim() || !participantRole}
          className="w-full py-4 rounded-xl text-base font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
          Start assessment →
        </button>
      </div>
    </div>
  )

  // ── QUESTIONS ───────────────────────────────────────────────
  if (step === 'questions') return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#E8FDF7' }}>

      {/* Progress header */}
      <div className="bg-white shadow-sm px-6 pt-5 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold"
                  style={{ color: currentDimension.color }}>
              {currentDimension.name} &nbsp;·&nbsp; Dimension {currentQuestion.dimensionIndex + 1} of 6
            </span>
            <span className="text-sm" style={{ color: '#05A88E' }}>
              Question {currentQ + 1} of 24
            </span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#E8FDF7' }}>
            <div className="h-2 rounded-full transition-all duration-300"
                 style={{ width: `${progressPercent}%`, backgroundColor: currentDimension.color }} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <p className="text-xl font-medium leading-relaxed mb-8 text-center"
             style={{ color: '#0A2E2A' }}>
            &ldquo;{currentQuestion.text}&rdquo;
          </p>

          {/* Scale options */}
          <div className="space-y-3">
            {SCALE_OPTIONS.map(opt => {
              const selected = currentResponse === opt.value
              return (
                <button key={opt.value} onClick={() => handleSelect(opt.value)}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all bg-white"
                  style={{
                    borderColor: selected ? currentDimension.color : '#E8FDF7',
                    boxShadow:   selected ? `0 0 0 1px ${currentDimension.color}` : 'none',
                  }}>
                  <span className="text-2xl font-bold w-8 text-center flex-shrink-0"
                        style={{ color: selected ? currentDimension.color : '#B9F8DD' }}>
                    {opt.value}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: '#0A2E2A' }}>
                      {opt.short}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#05A88E' }}>
                      {opt.description}
                    </div>
                  </div>
                  {selected && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                         style={{ backgroundColor: currentDimension.color }}>
                      <span className="text-xs font-bold" style={{ color: '#0A2E2A' }}>✓</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button onClick={handleBack}
            className="px-8 py-4 rounded-xl border-2 text-sm font-medium"
            style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}>
            ← Back
          </button>
          <button onClick={handleNext}
            disabled={currentResponse === 0}
            className="flex-1 py-4 rounded-xl text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
            {currentQ === 23 ? 'See my results →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )

  // ── RESULTS ─────────────────────────────────────────────────
  if (step === 'results' && scores) {
    const label   = getScoreLabel(scores.overall)
    const message = getPersonalisedMessage(scores.overall, firstName)

    return (
      <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#E8FDF7' }}>
        <div className="max-w-2xl mx-auto">

          {/* Score circle */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center justify-center rounded-full mb-4"
                 style={{ width: 160, height: 160, backgroundColor: '#0AF3CD' }}>
              <div className="text-center">
                <div className="text-5xl font-bold leading-none" style={{ color: '#0A2E2A' }}>
                  {scores.overall}
                </div>
                <div className="text-xs font-medium mt-1" style={{ color: '#0A2E2A' }}>
                  out of 100
                </div>
              </div>
            </div>
            <div className="text-2xl font-semibold mb-3" style={{ color: '#0A2E2A' }}>
              {label}
            </div>
            <p className="text-sm text-center max-w-md leading-relaxed" style={{ color: '#05A88E' }}>
              {message}
            </p>
          </div>

          {/* Dimension breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-6" style={{ color: '#0A2E2A' }}>
              Your MQ Profile
            </h2>

            <div className="space-y-7">
              {DIMENSIONS.map((dim, i) => {
                const score   = scores.dimensionScores[i]
                const insight = getDimensionInsight(dim, score)
                return (
                  <div key={dim.id}>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-sm font-semibold" style={{ color: '#0A2E2A' }}>
                        {dim.name}
                      </span>
                      <span className="text-sm font-bold" style={{ color: dim.color }}>
                        {score}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full mb-3" style={{ backgroundColor: '#E8FDF7' }}>
                      <div className="h-2 rounded-full"
                           style={{ width: `${score}%`, backgroundColor: dim.color }} />
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#05A88E' }}>
                      {insight}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Next step — Values in Action */}
          <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: '#0A2E2A' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#0AF3CD' }}>Up next</p>
            <p className="text-base font-bold mb-1" style={{ color: 'white' }}>Values in Action</p>
            <p className="text-sm mb-4" style={{ color: 'rgba(185,248,221,0.7)' }}>
              Complete your Values in Action survey to identify the values that drive your leadership — and how consistently you act on them.
            </p>
            <a href="/dashboard/values"
               className="block w-full text-center py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
               style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
              Start Values in Action →
            </a>
          </div>

          <a href="/dashboard"
             className="block w-full text-center py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
             style={{ backgroundColor: 'white', color: '#0A2E2A', border: '1px solid #B9F8DD' }}>
            Go to my dashboard
          </a>
        </div>
      </div>
    )
  }

  return null
}
