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
  const [rawMemo, setRawMemo] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 編集用state（各フィールド個別）
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [memo, setMemo] = useState('')
  const [metAt, setMetAt] = useState('')
  const [followUpAt, setFollowUpAt] = useState('')

  useEffect(() => {
    fetch(`/api/cards/${id}`)
      .then(r => r.json())
      .then(data => {
        setCard(data)
        setName(data.name ?? '')
        setCompany(data.company ?? '')
        setTitle(data.title ?? '')
        setEmail(data.email ?? '')
        setPhone(data.phone ?? '')
        setAddress(data.address ?? '')
        setWebsite(data.website ?? '')
        setMemo(data.memo ?? '')
        setMetAt(data.met_at ? data.met_at.split('T')[0] : '')
        setFollowUpAt(data.follow_up_at ? data.follow_up_at.split('T')[0] : '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function handleSave() {
    setSaving(true)
    let finalMemo = memo
    let tags = card?.tags ?? []
    let finalMetAt = metAt || null
    let finalFollowUpAt = followUpAt || null

    if (rawMemo.trim()) {
      try {
        const r = await fetch('/api/cards/memo', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawMemo, cardInfo: { name, company, title, email, phone, address, website } })
        })
        if (r.ok) {
          const d = await r.json()
          finalMemo = d.memo
          tags = d.tags
          if (d.met_at) finalMetAt = d.met_at.split('T')[0]
          if (d.follow_up_at) finalFollowUpAt = d.follow_up_at.split('T')[0]
        }
      } catch {}
    }

    const res = await fetch(`/api/cards/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name||null, company: company||null, title: title||null, email: email||null, phone: phone||null, address: address||null, website: website||null, memo: finalMemo||null, tags, met_at: finalMetAt, follow_up_at: finalFollowUpAt })
    })
    if (res.ok) {
      const updated = await res.json()
      setCard(updated)
      setMetAt(updated.met_at ? updated.met_at.split('T')[0] : '')
      setFollowUpAt(updated.follow_up_at ? updated.follow_up_at.split('T')[0] : '')
      setRawMemo('')
      setEditing(false)
    }
    setSaving(false)
  }

  function cancelEdit() {
    if (!card) return
    setName(card.name ?? '')
    setCompany(card.company ?? '')
    setTitle(card.title ?? '')
    setEmail(card.email ?? '')
    setPhone(card.phone ?? '')
    setAddress(card.address ?? '')
    setWebsite(card.website ?? '')
    setMemo(card.memo ?? '')
    setMetAt(card.met_at ? card.met_at.split('T')[0] : '')
    setFollowUpAt(card.follow_up_at ? card.follow_up_at.split('T')[0] : '')
    setRawMemo('')
    setEditing(false)
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/cards/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/dashboard')
    setDeleting(false)
  }

  const inputClass = "w-full bg-neutral-800 border border-neutral-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
  const viewClass = "text-white text-sm py-1.5"

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center"><div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!card) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-center"><div><p className="text-4xl mb-3">🪪</p><p>名刺が見つかりません</p><button onClick={() => router.push('/dashboard')} className="mt-4 text-emerald-400">← 戻る</button></div></div>

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push('/dashboard')} className="text-neutral-400">← 戻る</button>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={cancelEdit} className="text-sm text-neutral-400 px-3 py-1.5 rounded-lg">キャンセル</button>
              <button onClick={handleSave} disabled={saving} className="text-sm bg-emerald-600 text-white px-4 py-1.5 rounded-lg disabled:opacity-50">{saving ? '保存中...' : '保存'}</button>
            </>
          ) : (
            <>
              <a href={`/api/cards/vcard?id=${id}`} download className="text-sm bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded-lg">📲 vCard</a>
              <button onClick={() => setEditing(true)} className="text-sm bg-neutral-800 text-neutral-300 px-4 py-1.5 rounded-lg">編集</button>
            </>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 mb-4">
        <div className="mb-4">
          {editing
            ? <input value={name} onChange={e => setName(e.target.value)} placeholder="氏名" className="w-full bg-neutral-800 border border-neutral-600 rounded-xl px-3 py-2 text-white text-xl font-bold focus:outline-none focus:border-emerald-500" />
            : <h1 className="text-xl font-bold">{card.name ?? '（名前なし）'}</h1>
          }
        </div>
        <div className="space-y-3 divide-y divide-neutral-800">
          {[
            { label: '会社名', val: company, set: setCompany },
            { label: '役職', val: title, set: setTitle },
            { label: 'メール', val: email, set: setEmail, type: 'email' },
            { label: '電話番号', val: phone, set: setPhone, type: 'tel' },
            { label: '住所', val: address, set: setAddress },
            { label: 'ウェブサイト', val: website, set: setWebsite, type: 'url' },
          ].map(({ label, val, set, type = 'text' }) => (
            <div key={label} className="pt-3 first:pt-0">
              <label className="text-xs text-neutral-500 block mb-1">{label}</label>
              {editing
                ? <input type={type} value={val} onChange={e => set(e.target.value)} className={inputClass} />
                : <p className={viewClass}>{val || <span className="text-neutral-600">未設定</span>}</p>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {card.tags?.length > 0 && !editing && (
        <div className="flex gap-2 flex-wrap mb-4">
          {card.tags.map((tag: string) => <span key={tag} className="text-xs bg-neutral-800 text-emerald-400 px-3 py-1 rounded-full">{tag}</span>)}
        </div>
      )}

      {/* Memo */}
      <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 mb-4">
        <p className="text-xs text-neutral-500 mb-2">メモ</p>
        {editing ? (
          <div className="space-y-3">
            <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3} placeholder="テキストで入力するか、マイクで話してください" className="w-full bg-neutral-800 border border-neutral-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none" />
            <VoiceInput onResult={text => { setRawMemo(text); setMemo(text) }} placeholder="声でメモを追加..." />
          </div>
        ) : (
          <p className="text-sm text-white whitespace-pre-wrap">{card.memo || <span className="text-neutral-600">メモなし</span>}</p>
        )}
      </div>

      {/* 日程 */}
      <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 mb-4 space-y-3">
        <p className="text-xs text-neutral-500">日程</p>
        <div>
          <label className="text-xs text-neutral-500 block mb-1">会った日</label>
          {editing
            ? <input type="date" value={metAt} onChange={e => setMetAt(e.target.value)} className={inputClass} />
            : <p className={viewClass}>{card.met_at ? new Date(card.met_at).toLocaleDateString('ja-JP') : <span className="text-neutral-600">未設定</span>}</p>
          }
        </div>
        <div>
          <label className="text-xs text-neutral-500 block mb-1">フォロー予定日</label>
          {editing
            ? <input type="date" value={followUpAt} onChange={e => setFollowUpAt(e.target.value)} className={inputClass} />
            : <p className={viewClass + (card.follow_up_at ? ' text-emerald-400' : '')}>{card.follow_up_at ? new Date(card.follow_up_at).toLocaleDateString('ja-JP') : <span className="text-neutral-600">未設定</span>}</p>
          }
        </div>
      </div>

      <p className="text-xs text-neutral-600 text-center mb-6">登録日: {new Date(card.created_at).toLocaleDateString('ja-JP')}</p>

      {/* Delete */}
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
