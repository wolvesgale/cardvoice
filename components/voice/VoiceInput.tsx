'use client'
import { useState, useRef, useCallback } from 'react'

interface VoiceInputProps { onResult: (text: string) => void; placeholder?: string }

export function VoiceInput({ onResult, placeholder='マイクボタンを押して話してください' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const r = new SR(); r.lang='ja-JP'; r.continuous=false; r.interimResults=true
    r.onresult = (e: any) => { const t = Array.from(e.results).map((r:any)=>r[0].transcript).join(''); setTranscript(t); if(e.results[0].isFinal) onResult(t) }
    r.onend = () => setIsListening(false)
    recognitionRef.current = r; r.start(); setIsListening(true)
  }, [onResult])

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); setIsListening(false) }, [])

  return (
    <div className="w-full">
      <div className="relative">
        <textarea value={transcript} onChange={e=>{setTranscript(e.target.value);onResult(e.target.value)}} placeholder={placeholder} rows={3} className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 pr-14 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 resize-none" />
        <button type="button" onPointerDown={startListening} onPointerUp={stopListening} onPointerLeave={stopListening} className={`absolute right-3 bottom-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isListening?'bg-red-500 animate-pulse':'bg-emerald-600 hover:bg-emerald-500'}`}>🎤</button>
      </div>
      {isListening && <p className="text-emerald-400 text-xs mt-1 animate-pulse">🔴 聞き取り中...</p>}
    </div>
  )
}
