'use client'

import { useVoiceInput } from '@/hooks/useVoiceInput'

interface MicButtonProps {
  /** Called with each finalised phrase — append it to your input state */
  onTranscript: (text: string) => void
  /** Accent colour for the active state (matches each room's theme) */
  activeColor?: string
  activeBg?:    string
}

export default function MicButton({
  onTranscript,
  activeColor = '#0AF3CD',
  activeBg    = '#E8FDF7',
}: MicButtonProps) {
  const { listening, supported, interim, toggle } = useVoiceInput({ onTranscript })

  if (!supported) return null   // silently hide on unsupported browsers (Firefox)

  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={toggle}
        title={listening ? 'Stop recording' : 'Speak your message'}
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
        style={listening
          ? { backgroundColor: '#FEE2E2', border: '2px solid #EF4444' }
          : { backgroundColor: activeBg, border: `1px solid ${activeColor}80` }
        }
      >
        {listening ? (
          // Animated waveform while recording
          <span className="flex items-end gap-0.5 h-4">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-0.5 rounded-full animate-bounce"
                style={{
                  backgroundColor: '#EF4444',
                  height: i === 1 ? '14px' : '8px',
                  animationDelay:  `${i * 0.15}s`,
                  animationDuration: '0.6s',
                }}
              />
            ))}
          </span>
        ) : (
          // Mic icon
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke={activeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8"  y1="23" x2="16" y2="23"/>
          </svg>
        )}
      </button>

      {/* Interim transcript preview — small badge above the button */}
      {listening && interim && (
        <div
          className="absolute bottom-12 right-0 max-w-48 rounded-xl px-3 py-1.5 text-xs shadow-lg pointer-events-none whitespace-normal z-10"
          style={{ backgroundColor: '#0A2E2A', color: '#B9F8DD', border: '1px solid rgba(10,243,205,0.2)' }}
        >
          <span className="italic opacity-70">{interim}</span>
        </div>
      )}
    </div>
  )
}
