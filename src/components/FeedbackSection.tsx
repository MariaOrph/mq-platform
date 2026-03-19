'use client'

import { useEffect, useState, useCallback } from 'react'
import { FEEDBACK_DIMENSIONS, MIN_RESPONSES_TO_SHOW } from '@/lib/feedback/dimensions'

interface FeedbackRequest {
  id:               string
  respondent_email: string
  respondent_name:  string | null
  relationship:     string | null
  status:           'pending' | 'completed'
  created_at:       string
}

interface FeedbackResults {
  peerDimScores:    number[]
  peerValuesScores: Record<string, number>
  comments:         string[]
  responseCount:    number
}

interface FeedbackData {
  requests:       FeedbackRequest[]
  totalSent:      number
  totalCompleted: number
  results:        FeedbackResults | null
}

interface Props {
  token:       string
  selfScores:  (number | null)[]   // d1–d7 from assessment
}

export default function FeedbackSection({ token, selfScores }: Props) {
  const [data,          setData]          = useState<FeedbackData | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [activeTab,     setActiveTab]     = useState<'send' | 'results'>('send')
  const [emailInput,    setEmailInput]    = useState('')
  const [nameInput,     setNameInput]     = useState('')
  const [relInput,      setRelInput]      = useState('')
  const [sending,       setSending]       = useState(false)
  const [sendFeedback,  setSendFeedback]  = useState<string | null>(null)
  const [showComments,  setShowComments]  = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/feedback', { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      setData(json)
      if (json.results) setActiveTab('results')
    } catch { /* silent */ }
    setLoading(false)
  }, [token])

  useEffect(() => { loadData() }, [loadData])

  async function handleSend() {
    const emails = emailInput.split(/[\s,;]+/).map(e => e.trim()).filter(e => e.includes('@'))
    if (emails.length === 0) return
    setSending(true)
    setSendFeedback(null)
    try {
      const res  = await fetch('/api/feedback', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          respondents: emails.map(email => ({
            email,
            name:         nameInput.trim() || undefined,
            relationship: relInput.trim() || undefined,
          })),
        }),
      })
      const json = await res.json()
      const sentCount = json.sent?.length ?? 0
      setSendFeedback(sentCount > 0 ? `✓ Request${sentCount > 1 ? 's' : ''} sent` : 'No valid emails found')
      setEmailInput(''); setNameInput(''); setRelInput('')
      await loadData()
    } catch {
      setSendFeedback('Something went wrong — please try again')
    }
    setSending(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/feedback?id=${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    })
    await loadData()
  }

  if (loading) return (
    <div className="rounded-2xl p-6 flex items-center justify-center"
         style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', minHeight: 120 }}>
      <div className="flex gap-1.5">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full animate-bounce"
               style={{ backgroundColor: '#0AF3CD', animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )

  const completed  = data?.totalCompleted ?? 0
  const needed     = Math.max(0, MIN_RESPONSES_TO_SHOW - completed)
  const hasResults = !!data?.results

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-base">🔄</span>
            <p className="text-sm font-bold" style={{ color: '#0A2E2A' }}>360 Feedback</p>
          </div>
          <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>
            {completed} response{completed !== 1 ? 's' : ''} received
          </p>
        </div>
        {!hasResults && completed > 0 && (
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
            {needed} more needed to unlock results
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 px-5 mb-4">
        {(['send', 'results'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={tab === 'results' && !hasResults}
            className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all disabled:opacity-30"
            style={{
              backgroundColor: activeTab === tab ? '#0A2E2A' : 'transparent',
              color:           activeTab === tab ? '#0AF3CD' : '#9CA3AF',
            }}
          >
            {tab === 'send' ? 'Send requests' : `Results${hasResults ? ` (${data!.results!.responseCount})` : ''}`}
          </button>
        ))}
      </div>

      <div className="px-5 pb-5">

        {/* ── Send tab ─────────────────────────────────────────────────────── */}
        {activeTab === 'send' && (
          <div className="space-y-4">

            {/* Send form */}
            <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: '#F9FAFB' }}>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#0A2E2A' }}>
                  Email address <span className="font-normal text-xs" style={{ color: '#9CA3AF' }}>(or paste multiple, comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2.5 rounded-xl border bg-white text-sm outline-none"
                  style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
                    Their name
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="Alex"
                    className="w-full px-3 py-2.5 rounded-xl border bg-white text-sm outline-none"
                    style={{ borderColor: '#E5E7EB', color: '#0A2E2A' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
                    Relationship
                  </label>
                  <select
                    value={relInput}
                    onChange={e => setRelInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border bg-white text-sm outline-none appearance-none"
                    style={{ borderColor: '#E5E7EB', color: relInput ? '#0A2E2A' : '#9CA3AF' }}
                  >
                    <option value="">Select…</option>
                    <option value="Direct report">Direct report</option>
                    <option value="Peer">Peer</option>
                    <option value="Manager">Manager</option>
                    <option value="Stakeholder">Stakeholder</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={sending || !emailInput.trim() || !nameInput.trim() || !relInput}
                className="w-full py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
              >
                {sending ? 'Sending…' : 'Send request →'}
              </button>
              {sendFeedback && (
                <p className="text-xs text-center font-semibold" style={{ color: '#05A88E' }}>{sendFeedback}</p>
              )}
            </div>

            {/* Existing requests */}
            {(data?.requests ?? []).length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>
                  Requests sent
                </p>
                <div className="space-y-2">
                  {(data?.requests ?? []).map(r => (
                    <div key={r.id}
                         className="flex items-center justify-between rounded-xl px-3 py-2.5"
                         style={{ backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#0A2E2A' }}>
                          {r.respondent_name ?? r.respondent_email}
                        </p>
                        {r.respondent_name && (
                          <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{r.respondent_email}</p>
                        )}
                        {r.relationship && (
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>{r.relationship}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: r.status === 'completed' ? '#D1FAE5' : '#FEF3C7',
                                color:           r.status === 'completed' ? '#065F46' : '#92400E',
                              }}>
                          {r.status === 'completed' ? '✓ Done' : 'Pending'}
                        </span>
                        {r.status === 'pending' && (
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="text-xs hover:opacity-60 transition-opacity"
                            style={{ color: '#D1D5DB' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress towards unlock */}
            {!hasResults && (
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: '#E8FDF7' }}>
                <p className="text-xs leading-relaxed" style={{ color: '#05A88E' }}>
                  {completed === 0
                    ? `Results unlock once you have ${MIN_RESPONSES_TO_SHOW} responses. Send requests above to get started.`
                    : `${completed} of ${MIN_RESPONSES_TO_SHOW} responses needed to unlock results. Keep going!`
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Results tab ──────────────────────────────────────────────────── */}
        {activeTab === 'results' && hasResults && (() => {
          const results = data!.results!
          return (
            <div className="space-y-6">

              <p className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>
                Based on {results.responseCount} anonymous responses. Scores are shown alongside your self-assessment for each dimension.
              </p>

              {/* MQ Dimension comparison */}
              <div className="space-y-5">
                {FEEDBACK_DIMENSIONS.map((dim, i) => {
                  const peerScore = results.peerDimScores[i]
                  const selfScore = selfScores[i]
                  const gap       = selfScore !== null ? peerScore - selfScore : null
                  return (
                    <div key={dim.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold" style={{ color: '#0A2E2A' }}>{dim.name}</span>
                        <div className="flex items-center gap-2">
                          {gap !== null && (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: gap > 5 ? '#D1FAE5' : gap < -5 ? '#FEE2E2' : '#F3F4F6',
                                    color: gap > 5 ? '#065F46' : gap < -5 ? '#991B1B' : '#6B7280',
                                  }}>
                              {gap > 0 ? '+' : ''}{gap}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Peer bar */}
                      <div className="mb-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs w-8 text-right flex-shrink-0" style={{ color: dim.color, fontWeight: 700 }}>{peerScore}</span>
                          <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                            <div className="h-2 rounded-full transition-all duration-700"
                                 style={{ width: `${peerScore}%`, backgroundColor: dim.color }} />
                          </div>
                          <span className="text-xs w-12 flex-shrink-0" style={{ color: dim.color }}>Others</span>
                        </div>
                        {selfScore !== null && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs w-8 text-right flex-shrink-0" style={{ color: '#9CA3AF', fontWeight: 600 }}>{selfScore}</span>
                            <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                              <div className="h-1.5 rounded-full transition-all duration-700"
                                   style={{ width: `${selfScore}%`, backgroundColor: '#D1D5DB' }} />
                            </div>
                            <span className="text-xs w-12 flex-shrink-0" style={{ color: '#9CA3AF' }}>You</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Values comparison */}
              {Object.keys(results.peerValuesScores).length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>
                    ⭐ Values — peer view
                  </p>
                  <div className="space-y-3">
                    {Object.entries(results.peerValuesScores).map(([name, score]) => (
                      <div key={name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-semibold" style={{ color: '#0A2E2A' }}>{name}</span>
                          <span className="text-xs font-bold" style={{ color: '#F59E0B' }}>{score}</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                          <div className="h-2 rounded-full transition-all duration-700"
                               style={{ width: `${score}%`, backgroundColor: '#F59E0B' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              {results.comments.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowComments(v => !v)}
                    className="w-full flex items-center justify-between py-2 px-1"
                    style={{ color: '#9CA3AF' }}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Written feedback ({results.comments.length})
                    </span>
                    <span className="text-xs">{showComments ? '▲ hide' : '▼ show'}</span>
                  </button>
                  {showComments && (
                    <div className="space-y-2 mt-2">
                      {results.comments.map((c, i) => (
                        <div key={i} className="rounded-xl p-3"
                             style={{ backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6', borderLeft: '3px solid #0AF3CD' }}>
                          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>"{c}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )
        })()}
      </div>
    </div>
  )
}
