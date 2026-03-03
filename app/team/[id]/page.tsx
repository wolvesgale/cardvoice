'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [members, setMembers] = useState<any[]>([])
  const [cards, setCards] = useState<any[]>([])
  const [myCards, setMyCards] = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState<'cards'|'members'>('cards')
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    fetch(`/api/share/groups/${id}/members`).then(r => r.json()).then(d => { if (Array.isArray(d)) setMembers(d) })
    fetch(`/api/share/groups/${id}/cards`).then(r => r.json()).then(d => { if (Array.isArray(d)) setCards(d) })
    fetch('/api/cards').then(r => r.json()).then(d => { if (Array.isArray(d)) setMyCards(d) })
  }, [id])

  async function handleInvite() {
    if (!inviteEmail.trim()) return
    setInviting(true); setError(''); setSuccess('')
    const res = await fetch(`/api/share/groups/${id}/members`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inviteEmail }) })
    const data = await res.json()
    if (res.ok) { setSuccess('招待しました！'); setInviteEmail(''); fetch(`/api/share/groups/${id}/members`).then(r => r.json()).then(d => setMembers(d)) }
    else setError(data.message ?? '招待に失敗しました')
    setInviting(false)
  }

  async function handleShareCard(cardId: string) {
    const res = await fetch(`/api/share/groups/${id}/cards`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cardId }) })
    if (res.ok) { fetch(`/api/share/groups/${id}/cards`).then(r => r.json()).then(d => setCards(d)); setShowShareModal(false) }
  }

  async function handleRemoveCard(cardId: string) {
    await fetch(`/api/share/groups/${id}/cards`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cardId }) })
    setCards(prev => prev.filter(c => c.id !== cardId))
  }

  const sharedCardIds = new Set(cards.map(c => c.id))

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/team" className="text-neutral-400">← 戻る</Link>
        <h1 className="text-lg font-bold">グループ</h1>
      </div>

      {error && <div className="mb-3 bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}
      {success && <div className="mb-3 bg-emerald-950 border border-emerald-800 text-emerald-400 text-sm rounded-xl px-4 py-3">{success}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['cards', 'members'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
            {t === 'cards' ? `名刺 (${cards.length})` : `メンバー (${members.length}/10)`}
          </button>
        ))}
      </div>

      {/* 名刺タブ */}
      {tab === 'cards' && (
        <div>
          <button onClick={() => setShowShareModal(true)} className="w-full bg-neutral-900 border border-emerald-700 hover:border-emerald-500 rounded-2xl p-4 mb-4 text-emerald-400 text-sm font-medium transition-colors">
            + 名刺を共有する
          </button>
          {cards.length === 0 ? (
            <div className="text-center py-12 text-neutral-600"><p className="text-3xl mb-2">🪪</p><p className="text-sm">共有された名刺がありません</p></div>
          ) : cards.map(card => (
            <div key={card.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-3">
              <div className="flex justify-between items-start">
                <Link href={`/card/${card.id}`} className="flex-1">
                  <p className="font-semibold">{card.name ?? '（名前なし）'}</p>
                  <p className="text-sm text-neutral-400">{card.company ?? ''}</p>
                </Link>
                <button onClick={() => handleRemoveCard(card.id)} className="text-xs text-red-500 px-2 py-1">削除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* メンバータブ */}
      {tab === 'members' && (
        <div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-4">
            <p className="text-xs text-neutral-500 mb-3">メンバーを招待（メールアドレス）</p>
            <div className="flex gap-2">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleInvite()}
                type="email" placeholder="user@example.com"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" />
              <button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()} className="bg-emerald-600 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm">
                {inviting ? '...' : '招待'}
              </button>
            </div>
          </div>
          {members.map(m => (
            <div key={m.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{m.email ?? m.user_id.slice(0, 8) + '...'}</p>
                <p className="text-xs text-neutral-500">{m.role === 'owner' ? 'オーナー' : 'メンバー'}</p>
              </div>
              {m.role !== 'owner' && (
                <button onClick={async () => {
                  await fetch(`/api/share/groups/${id}/members`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId: m.user_id }) })
                  setMembers(prev => prev.filter(x => x.id !== m.id))
                }} className="text-xs text-red-500 px-2 py-1">削除</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 名刺選択モーダル */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50" onClick={() => setShowShareModal(false)}>
          <div className="bg-neutral-900 rounded-t-2xl w-full max-h-[70vh] overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
            <p className="font-semibold mb-4">共有する名刺を選択</p>
            {myCards.filter(c => !sharedCardIds.has(c.id)).map(card => (
              <button key={card.id} onClick={() => handleShareCard(card.id)} className="w-full text-left bg-neutral-800 hover:bg-neutral-700 rounded-xl p-3 mb-2 transition-colors">
                <p className="font-medium text-sm">{card.name ?? '（名前なし）'}</p>
                <p className="text-xs text-neutral-400">{card.company ?? ''}</p>
              </button>
            ))}
            {myCards.filter(c => !sharedCardIds.has(c.id)).length === 0 && (
              <p className="text-neutral-500 text-sm text-center py-4">共有できる名刺がありません</p>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
