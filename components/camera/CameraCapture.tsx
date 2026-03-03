'use client'
import { useRef, useState, useCallback } from 'react'

interface CameraCaptureProps { onCapture: (base64: string, mediaType: string) => void }

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string|null>(null)

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPreview(result)
      onCapture(result.split(',')[1], file.type)
    }
    reader.readAsDataURL(file)
  }, [onCapture])

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative">
          <img src={preview} alt="プレビュー" className="w-full rounded-2xl object-cover max-h-56" />
          <button onClick={()=>{setPreview(null);if(fileInputRef.current)fileInputRef.current.value=''}} className="absolute top-2 right-2 bg-neutral-900 text-white rounded-full w-8 h-8 flex items-center justify-center">✕</button>
        </div>
      ) : (
        <button onClick={()=>fileInputRef.current?.click()} className="w-full border-2 border-dashed border-neutral-700 rounded-2xl py-12 flex flex-col items-center gap-3 text-neutral-400 hover:border-emerald-600 hover:text-emerald-400 transition-colors">
          <span className="text-4xl">📷</span>
          <span className="text-sm font-medium">名刺を撮影 / 画像を選択</span>
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f)}} className="hidden" />
    </div>
  )
}
