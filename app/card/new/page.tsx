'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CameraCapture } from '@/components/camera/CameraCapture'
import { VoiceInput } from '@/components/voice/VoiceInput'
import type { OcrResult } from '@/lib/types'

type Step = 'select' | 'capture' | 'ocr-loading' | 'manual' | 'confirm' | 'voice' | 'saving'

export default function NewCardPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('select')
  const [rawMemo, setRawMemo] = useState('')
  const [error, setError] = useState('')
  const [editData, setEditData] = useState<OcrResult>({
    name: null, company: null, title: null,
    email: null, phone: null, address: null, website: null,
  })

  async function handleCapture(base64: string, mediaType: string) {
    setStep('ocr-loading')
    setError('')
    try {
      const res = await fetch('/api/cards/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: base64, mediaType }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.message ?? '読み取り失敗。手動で入力してください。')
        setStep('manual')
        return
      }
      setEditData(await res.json())
      setStep('confirm')
    } catch {
      setError('読み取りに失敗しました。手動で入力してください。')
      setStep('manual')
    }
  }

  async function handleSave() {
    setStep('saving')
    let memoData = { memo: rawMemo, tags: [] as string[], met_at: null as string | null, follow_up_at: null as string | null }
    if (rawMemo.trim()) {
      try {
        const r = await fetch('/api/cards/memo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rawMemo, cardInfo: editData }) })
        if (r.ok) memoData = await r.json()
      } catch {}
    }
    const res = await fetch('/api/cards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...editData, ...memoData }) })
    if (!res.ok) { setError('保存に失敗しました'); setStep('voice'); return }
    router.push('/dashboard')
  }

  const field = (key: keyof OcrResult, label: string, type = 'text', placeholder = '') => (
    <div key={key}>
      <label className="text-xs text-neutral-500 block mb-1">{label}</label>
      <input type={type} value={editData[key] ?? ''} placeholder={placeholder}
        onChange={e => setEditData(p => ({ ...p, [key]: e.target.value || null }))}
        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" />
    </div>
  )

  const FormFields = () => (
    <div className="space-y-3">
      {field('name', '氏名 *', 'text', '山田 太郎')}
      {field('company', '会社名', 'text', '株式会社〇〇')}
      {field('title', '役職', 'text', '営業部長')}
      {field('email', 'メール', 'email', 'example@company.com')}
      {field('phone', '電話番号', 'tel', '090-0000-0000')}
      {field('address', '住所', 'text', '東京都渋谷区...')}
      {field('website', 'ウェブサイト', 'url', 'https://...')}
    </div>
  )

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step === 'select' ? router.back() : setStep('select')} className="text-neutral-400">← 戻る</button>
        <h1 className="text-lg font-bold">名刺を追加</h1>
      </div>
      {error && <div className="mb-4 bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

      {step === 'select' && (
        <div className="space-y-4">
          <p className="text-neutral-400 text-sm mb-2">入力方法を選んでください</p>
          <button onClick={() => setStep('capture')} className="w-full bg-neutral-900 border border-neutral-700 hover:border-emerald-600 rounded-2xl p-5 flex items-center gap-4 transition-colors text-left">
            <span className="text-3xl">📷</span>
            <div>
              <p className="font-semibold">名刺を撮影してAI読み取り</p>
              <p className="text-xs text-neutral-500 mt-0.5">カメラで撮るだけ。AIが自動入力</p>
            </div>
          </button>
          <button onClick={() => setStep('manual')} className="w-full bg-neutral-900 border border-emerald-700 hover:border-emerald-500 rounded-2xl p-5 flex items-center gap-4 transition-colors text-left">
            <span className="text-3xl">✏️</span>
            <div>
              <p className="font-semibold text-emerald-400">手動で入力する</p>
              <p className="text-xs text-neutral-500 mt-0.5">フォームに直接入力します</p>
            </div>
          </button>
        </div>
      )}

      {step === 'capture' && (
        <div>
          <p className="text-neutral-400 text-sm mb-4">名刺を撮影してください</p>
          <CameraCapture onCapture={handleCapture} />
          <button onClick={() => setStep('manual')} className="w-full mt-4 text-neutral-500 text-sm py-2">手動入力に切り替える</button>
        </div>
      )}

      {(step === 'ocr-loading' || step === 'saving') && (
        <div className="flex flex-col items-center py-20 gap-4">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-400 text-sm">{step === 'ocr-loading' ? '読み取り中...' : '保存中...'}</p>
        </div>
      )}

      {(step === 'manual' || step === 'confirm') && (
        <div className="space-y-4">
          <p className="text-neutral-400 text-sm">{step === 'confirm' ? '読み取り結果を確認・修正してください' : '名刺の情報を入力してください'}</p>
          <FormFields />
          <button onClick={() => setStep('voice')} disabled={!editData.name} className="w-full bg-emerald-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl">次へ（メモを追加）</button>
          <button onClick={handleSave} disabled={!editData.name} className="w-full bg-neutral-800 disabled:opacity-40 text-neutral-300 py-3 rounded-xl text-sm">メモなしで保存</button>
        </div>
      )}

      {step === 'voice' && (
        <div className="space-y-4">
          <p className="text-neutral-400 text-sm">会った場所・印象・フォロー予定などを声で話してください</p>
          <VoiceInput onResult={setRawMemo} placeholder="例：渋谷のカフェで会った。来月に提案書を送る予定。" />
          <button onClick={handleSave} className="w-full bg-emerald-500 text-white font-semibold py-3 rounded-xl">保存する</button>
          <button onClick={handleSave} className="w-full text-neutral-500 text-sm py-2">メモなしで保存</button>
        </div>
      )}
    </main>
  )
}
