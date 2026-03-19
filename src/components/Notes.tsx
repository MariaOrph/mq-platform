'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

// ── Types ───────────────────────────────────────────────────────────────────

interface Note {
  id:         string
  title:      string | null
  content:    string
  created_at: string
  updated_at: string
}

interface NotesProps {
  token:   string
  onClose: () => void
  /** 'fullscreen' = covers entire viewport (dashboard entry point)
   *  'panel'      = slides in over Coaching Room as a modal sheet   */
  mode?: 'fullscreen' | 'panel'
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d    = new Date(iso)
  const now  = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)  return d.toLocaleDateString('en-GB', { weekday: 'long' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: diff > 365 ? 'numeric' : undefined })
}

function getPreview(content: string) {
  const first = content.trim().split('\n')[0] ?? ''
  return first.length > 80 ? first.slice(0, 77) + '…' : first
}

// ── Main component ───────────────────────────────────────────────────────────

export default function Notes({ token, onClose, mode = 'fullscreen' }: NotesProps) {
  const [notes,        setNotes]        = useState<Note[]>([])
  const [loaded,       setLoaded]       = useState(false)
  const [activeNote,   setActiveNote]   = useState<Note | null>(null)
  const [editTitle,    setEditTitle]    = useState('')
  const [editContent,  setEditContent]  = useState('')
  const [saving,       setSaving]       = useState(false)
  const [deletingId,   setDeletingId]   = useState<string | null>(null)
  const [view,         setView]         = useState<'list' | 'editor'>('list')
  const [dirty,        setDirty]        = useState(false)

  const contentRef = useRef<HTMLTextAreaElement>(null)
  const saveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load notes ─────────────────────────────────────────────────────────────
  const loadNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { const d = await res.json(); setNotes(d.notes ?? []) }
    } finally { setLoaded(true) }
  }, [token])

  useEffect(() => { loadNotes() }, [loadNotes])

  // Auto-focus textarea when editor opens
  useEffect(() => {
    if (view === 'editor') setTimeout(() => contentRef.current?.focus(), 100)
  }, [view])

  // ── Auto-save ──────────────────────────────────────────────────────────────
  const save = useCallback(async (note: Note, title: string, content: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/notes', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ id: note.id, title: title.trim() || null, content }),
      })
      if (res.ok) {
        const { note: updated } = await res.json()
        setNotes(prev => prev.map(n => n.id === updated.id ? updated : n))
        setActiveNote(updated)
        setDirty(false)
      }
    } finally { setSaving(false) }
  }, [token])

  function scheduleAutoSave(note: Note, title: string, content: string) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(note, title, content), 1200)
  }

  function handleTitleChange(val: string) {
    setEditTitle(val)
    setDirty(true)
    if (activeNote) scheduleAutoSave(activeNote, val, editContent)
  }

  function handleContentChange(val: string) {
    setEditContent(val)
    setDirty(true)
    if (activeNote) scheduleAutoSave(activeNote, editTitle, val)
  }

  // ── New note ───────────────────────────────────────────────────────────────
  async function createNote() {
    const res = await fetch('/api/notes', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ title: null, content: '' }),
    })
    if (res.ok) {
      const { note } = await res.json()
      setNotes(prev => [note, ...prev])
      openNote(note)
    }
  }

  // ── Open note for editing ─────────────────────────────────────────────────
  function openNote(note: Note) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setActiveNote(note)
    setEditTitle(note.title ?? '')
    setEditContent(note.content)
    setDirty(false)
    setView('editor')
  }

  // ── Back to list (flush save) ─────────────────────────────────────────────
  async function backToList() {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    if (activeNote && dirty) await save(activeNote, editTitle, editContent)
    setView('list')
    setActiveNote(null)
  }

  // ── Delete note ───────────────────────────────────────────────────────────
  async function deleteNote(id: string, e?: React.MouseEvent) {
    e?.stopPropagation()
    setDeletingId(id)
    try {
      await fetch(`/api/notes?id=${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotes(prev => prev.filter(n => n.id !== id))
      if (activeNote?.id === id) { setView('list'); setActiveNote(null) }
    } finally { setDeletingId(null) }
  }

  // ── Close (flush save) ────────────────────────────────────────────────────
  async function handleClose() {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    if (activeNote && dirty) await save(activeNote, editTitle, editContent)
    onClose()
  }

  // ── Panel wrapper styles ──────────────────────────────────────────────────
  const isPanel = mode === 'panel'

  if (isPanel) {
    // Rendered as a modal sheet over the coaching room
    return (
      <div
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
        style={{ backgroundColor: 'rgba(10,46,42,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={handleClose}
      >
        <div
          className="w-full sm:max-w-lg flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
          style={{ backgroundColor: '#F4FDF9', maxHeight: '85vh' }}
          onClick={e => e.stopPropagation()}
        >
          <NotesInner
            notes={notes} loaded={loaded} view={view}
            activeNote={activeNote} editTitle={editTitle} editContent={editContent}
            saving={saving} deletingId={deletingId} dirty={dirty}
            contentRef={contentRef}
            onNew={createNote} onOpen={openNote} onBack={backToList}
            onDelete={deleteNote} onClose={handleClose}
            onTitleChange={handleTitleChange} onContentChange={handleContentChange}
          />
        </div>
      </div>
    )
  }

  // Full-screen
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#F4FDF9' }}>
      <NotesInner
        notes={notes} loaded={loaded} view={view}
        activeNote={activeNote} editTitle={editTitle} editContent={editContent}
        saving={saving} deletingId={deletingId} dirty={dirty}
        contentRef={contentRef}
        onNew={createNote} onOpen={openNote} onBack={backToList}
        onDelete={deleteNote} onClose={handleClose}
        onTitleChange={handleTitleChange} onContentChange={handleContentChange}
      />
    </div>
  )
}

// ── Inner content (shared between modes) ─────────────────────────────────────

interface InnerProps {
  notes:         Note[]
  loaded:        boolean
  view:          'list' | 'editor'
  activeNote:    Note | null
  editTitle:     string
  editContent:   string
  saving:        boolean
  deletingId:    string | null
  dirty:         boolean
  contentRef:    React.RefObject<HTMLTextAreaElement | null>
  onNew:         () => void
  onOpen:        (n: Note) => void
  onBack:        () => void
  onDelete:      (id: string, e?: React.MouseEvent) => void
  onClose:       () => void
  onTitleChange:   (v: string) => void
  onContentChange: (v: string) => void
}

function NotesInner({
  notes, loaded, view, activeNote, editTitle, editContent,
  saving, deletingId, dirty, contentRef,
  onNew, onOpen, onBack, onDelete, onClose,
  onTitleChange, onContentChange,
}: InnerProps) {

  // ── LIST VIEW ───────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <>
        {/* Header */}
        <div style={{ backgroundColor: '#0A2E2A', flexShrink: 0 }}>
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                   style={{ backgroundColor: '#fdcb5e' }}>📓</div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'white' }}>My Notes</p>
                <p className="text-xs" style={{ color: '#B9F8DD' }}>
                  {notes.length === 0 ? 'Your private journal' : `${notes.length} note${notes.length === 1 ? '' : 's'}`}
                </p>
              </div>
            </div>
            <button onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                    style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>×</button>
          </div>
        </div>

        {/* New note button */}
        <div className="max-w-2xl mx-auto w-full px-6 pt-5 pb-3" style={{ flexShrink: 0 }}>
          <button
            onClick={onNew}
            className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#fdcb5e', color: '#0A2E2A' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New note
          </button>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 pb-6 space-y-2">

            {!loaded && (
              <div className="flex justify-center py-12">
                <div className="flex gap-1.5">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                         style={{ backgroundColor: '#fdcb5e', animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {loaded && notes.length === 0 && (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">📓</div>
                <p className="text-base font-semibold mb-2" style={{ color: '#0A2E2A' }}>
                  Your private journal
                </p>
                <p className="text-sm max-w-xs mx-auto" style={{ color: '#05A88E' }}>
                  Jot down reflections, insights, or anything that comes up in your coaching sessions. Only you can see these.
                </p>
              </div>
            )}

            {loaded && notes.length > 0 && notes.map(note => {
              const hasTitle   = note.title && note.title.trim()
              const preview    = getPreview(note.content)
              const isEmpty    = !hasTitle && !preview
              return (
                <button
                  key={note.id}
                  onClick={() => onOpen(note)}
                  className="w-full text-left rounded-2xl p-4 transition-all hover:shadow-md group"
                  style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 1px 4px rgba(10,46,42,0.06)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#0A2E2A' }}>
                        {hasTitle ? note.title : (preview || 'Untitled note')}
                      </p>
                      {hasTitle && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: '#6B7280' }}>
                          {isEmpty ? 'Empty note' : preview}
                        </p>
                      )}
                      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                        {formatDate(note.updated_at)}
                      </p>
                    </div>
                    <button
                      onClick={e => onDelete(note.id, e)}
                      disabled={deletingId === note.id}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full flex items-center justify-center transition-opacity flex-shrink-0"
                      style={{ color: '#9CA3AF', backgroundColor: '#F9FAFB' }}
                      title="Delete note"
                    >
                      {deletingId === note.id ? (
                        <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  // ── EDITOR VIEW ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <div style={{ backgroundColor: '#0A2E2A', flexShrink: 0 }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: '#B9F8DD' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            All notes
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: saving ? '#0AF3CD' : dirty ? '#fdcb5e' : 'rgba(185,248,221,0.4)' }}>
              {saving ? 'Saving…' : dirty ? 'Unsaved' : 'Saved'}
            </span>
            <button
              onClick={() => activeNote && onDelete(activeNote.id)}
              disabled={!!deletingId}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}
              title="Delete this note"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
              </svg>
            </button>
            <button onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                    style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>×</button>
          </div>
        </div>
      </div>

      {/* Date */}
      {activeNote && (
        <div className="max-w-2xl mx-auto w-full px-6 pt-4 pb-0 flex-shrink-0">
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            {formatDate(activeNote.updated_at)}
          </p>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 pt-3 pb-8 flex flex-col gap-3">
          {/* Title */}
          <input
            type="text"
            placeholder="Title (optional)"
            value={editTitle}
            onChange={e => onTitleChange(e.target.value)}
            className="w-full text-lg font-bold bg-transparent border-none outline-none placeholder-gray-300"
            style={{ color: '#0A2E2A' }}
          />
          {/* Divider */}
          <div className="h-px" style={{ backgroundColor: '#E8FDF7' }} />
          {/* Content */}
          <textarea
            ref={contentRef}
            placeholder="Start writing…"
            value={editContent}
            onChange={e => onContentChange(e.target.value)}
            className="w-full flex-1 bg-transparent border-none outline-none resize-none text-sm leading-relaxed placeholder-gray-300"
            style={{ color: '#374151', minHeight: '300px' }}
          />
        </div>
      </div>
    </>
  )
}
