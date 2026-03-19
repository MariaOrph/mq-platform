import { useState, useRef, useCallback, useEffect } from 'react'

// Web Speech API type shims (not in default TS lib)
declare global {
  interface Window {
    SpeechRecognition:       new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
  interface SpeechRecognition extends EventTarget {
    continuous:     boolean
    interimResults: boolean
    lang:           string
    start():  void
    stop():   void
    abort():  void
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror:  ((event: Event) => void) | null
    onend:    (() => void) | null
  }
  interface SpeechRecognitionEvent extends Event {
    resultIndex: number
    results:     SpeechRecognitionResultList
  }
}

interface UseVoiceInputOptions {
  /** Called each time a phrase is finalised by the speech engine */
  onTranscript: (text: string) => void
  lang?: string
}

interface UseVoiceInputResult {
  listening:  boolean
  supported:  boolean
  interim:    string   // live in-progress phrase (not yet finalised)
  toggle:     () => void
}

export function useVoiceInput({
  onTranscript,
  lang = 'en-GB',
}: UseVoiceInputOptions): UseVoiceInputResult {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const [interim,   setInterim]   = useState('')

  const recognitionRef   = useRef<SpeechRecognition | null>(null)
  const onTranscriptRef  = useRef(onTranscript)
  const listeningRef     = useRef(false)

  // keep callback ref fresh so the recognition handler always calls the latest version
  useEffect(() => { onTranscriptRef.current = onTranscript }, [onTranscript])

  // initialise once
  useEffect(() => {
    if (typeof window === 'undefined') return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) { setSupported(false); return }

    const recognition: SpeechRecognition = new SR()
    recognition.continuous     = true
    recognition.interimResults = true
    recognition.lang           = lang

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          const text = result[0].transcript.trim()
          if (text) onTranscriptRef.current(text)
          setInterim('')
        } else {
          interimText += result[0].transcript
        }
      }
      if (interimText) setInterim(interimText)
    }

    recognition.onerror = () => {
      setListening(false)
      listeningRef.current = false
      setInterim('')
    }

    recognition.onend = () => {
      // auto-restart if still meant to be listening (e.g. after a natural pause)
      if (listeningRef.current) {
        try { recognition.start() } catch { /* ignore */ }
      } else {
        setInterim('')
      }
    }

    recognitionRef.current = recognition
    return () => { recognition.abort() }
  // lang intentionally not in dep array — changing lang mid-session is not a use case
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    if (listeningRef.current) {
      listeningRef.current = false
      setListening(false)
      recognition.stop()
    } else {
      listeningRef.current = true
      setListening(true)
      try { recognition.start() } catch { /* already started */ }
    }
  }, [])

  return { listening, supported, interim, toggle }
}
