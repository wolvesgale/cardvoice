'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { VoiceInput } from '@/components/voice/VoiceInput'
import type { Card } from '@/lib/types'

export default function CardDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [card, setCard] = useState<Card | null>(null)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Card>>({})
  const [rawMemo, setRawMemo] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetch(`/api/cards/${id}`)
      .then(r => r.json())
      .then(data => { setCard(data); setEditData(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function handleSave() {
    setSaving(true)
    let memoData = { memo: editData.memo ?? '', tags: editData.tags ?? [], met_at: editData.met_at ?? null, follow_up_at: editData.follow_up_at ?? null }
    if (rawMemo.trim()) {
      try {
        const r = await fetch('/api/cards/memo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rawMemo, cardInfo: editData }) })
        if (r.ok) memoData = await r.json()
      } catch {}
    }
    const res = await fetch(`/api/cards/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...editData, ...memoData }) })
    if (res.ok) { const updated = await res.json(); setCard(updated); setEditData(updated); setRawMemo(''); setEditing(false) }
    setSaving(false)
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/cards/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/dashboard')
    setDeleting(false)
  }

  const field = (key: keyof Card, label: string, type = 'text') => (
    <div key={key}>
      <label className="text-xs text-neutral-500 block mb-1">{label}</label>
      {editing
        ? <input type={type} value={(editData[key] as string) ?? ''} onChange={e => setEditData(p => ({ ...p, [key]: e.target.value || null }))} className="w-full bg-neutral-800 border border-neutral-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" />
        : <p className="text-white text-sm py-2">{(card?.[key] as string) || <span className="text-neutral-600">未設定</span>}</p>
      }
    </div>
  )

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center"><div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!card) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-center"><div><p className="text-4xl mb-3">🪪</p><p>名刺が見つかりません</p><button onClick={() => router.push('/dashboard')} className="mt-4 text-emerald-400">← 戻る</button></div></div>

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push('/dashboard')} className="text-neutral-400">← 戻る</button>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setEditData(card); setRawMemo('') }} className="text-sm text-neutral-400 px-3 py-1.5 rounded-lg">キャンセル</button>
              <button onClick={handleSave} disabled={saving} className="text-sm bg-emerald-600 text-white px-4 py-1.5 rounded-lg disabled:opacity-50">{saving ? '保存中...' : '保存'}</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="text-sm bg-neutral-800 text-neutral-300 px-4 py-1.5 rounded-lg">編集</button>
          )}
        </div>
      </div>
      <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 mb-4">
        <div className="mb-4">
          {editing
            ? <input value={editData.name ?? ''} onChange={e => setEditData(p => ({ ...p, name: e.target.value || null }))} placeholder="氏名" className="w-full bg-neutral-800 border border-neutral-600 rounded-xl px-3 py-2 text-white text-xl font-bold focus:outline-none focus:border-emerald-500" />
            : <h1 className="text-xl font-bold">{card.name ?? '（名前なし）'}</h1>
          }
        </div>
        <div className="space-y-3 divide-y divide-neutral-800">
          {field('company', '会社名')}{field('title', '役職')}{field('email', 'メール', 'email')}{field('phone', '電話番号', 'tel')}{field('address', '住所')}{field('website', 'ウェブサイト', 'url')}
        </div>
      </div>
      {card.tags?.length > 0 && !editing && (
        <div className="flex gap-2 flex-wrap mb-4">{card.tags.map((tag: string) => <span key={tag} className="text-xs bg-neutral-800 text-emerald-400 px-3 py-1 rounded-full">{tag}</span>)}</div>
      )}
      <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 mb-4">
        <p className="text-xs text-neutral-500 mb-2">メモ</p>
        {editing ? (
          <div className="space-y-3">
            <textarea value={editData.memo ?? ''} onChange={e => setEditData(p => ({ ...p, memo: e.target.value || null }))} rows={3} placeholder="テキスト入力かマイクで話してください" className="w-full bg-neutral-800 border border-neutral-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none" />
            <VoiceInput onResult={text => { setRawMemo(text); setEditData(p => ({ ...p, memo: text })) }} placeholder="声でメモを追加..." />
          </div>
        ) : (
          <p className="text-sm text-white whitespace-pre-wrap">{card.memo || <span className="text-neutral-600">メモなし</span>}</p>
        )}
      </div>
      {(card.met_at || card.follow_up_at) && !editing && (
        <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 mb-4 space-y-2">
          {card.met_at && <div className="flex justify-between text-sm"><span className="text-neutral-500">会った日</span><span>{new Date(card.met_at).toLocaleDateString('ja-JP')}</span></div>}
          {card.follow_up_at && <div className="flex justify-between text-sm"><span className="text-neutral-500">フォロー予定</span><span className="text-emerald-400">{new Date(card.follow_up_at).toLocaleDateString('ja-JP')}</span></div>}
        </div>
      )}
      <p className="text-xs text-neutral-600 text-center mb-6">登録日: {new Date(card.created_at).toLocaleDateString('ja-JP')}</p>
      {!editing && (
        showDeleteConfirm ? (
          <div className="bg-red-950 border border-red-800 rounded-2xl p-4 text-center">
            <p className="text-red-400 text-sm mb-3">この名刺を削除しますか？取り消せません。</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-neutral-800 text-white py-2 rounded-xl text-sm">キャンセル</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm disabled:opacity-50">{deleting ? '削除中...' : '削除する'}</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowDeleteConfirm(true)} className="w-full text-red-500 text-sm py-2">この名刺を削除</button>
        )
      )}
    </main>
  )
}
