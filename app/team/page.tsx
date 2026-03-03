'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TeamPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/share/groups').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setGroups(data)
      else setError(data.message ?? 'Teamプランが必要です')
      setLoading(false)
    })
  }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch('/api/share/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName }) })
    const data = await res.json()
    if (res.ok) { router.push(`/team/${data.id}`) }
    else { setError(data.message ?? '作成に失敗しました'); setCreating(false) }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-neutral-400">← 戻る</Link>
        <h1 className="text-lg font-bold">チーム共有</h1>
      </div>

      {error && <div className="mb-4 bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

      {/* グループ作成 */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-6">
        <p className="text-xs text-neutral-500 mb-3">新しいグループを作成</p>
        <div className="flex gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="グループ名（例：営業チーム）"
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" />
          <button onClick={handleCreate} disabled={creating || !newName.trim()} className="bg-emerald-600 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-medium">
            {creating ? '...' : '作成'}
          </button>
        </div>
      </div>

      {/* グループ一覧 */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 text-neutral-600"><p className="text-4xl mb-3">👥</p><p className="text-sm">まだグループがありません</p></div>
      ) : groups.map(g => (
        <Link key={g.id} href={`/team/${g.id}`}>
          <div className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 mb-3 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{g.name}</p>
                <p className="text-xs text-neutral-500 mt-1">メンバー {g.member_count}名 · 名刺 {g.card_count}枚</p>
              </div>
              <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded-full">{g.role === 'owner' ? 'オーナー' : 'メンバー'}</span>
            </div>
          </div>
        </Link>
      ))}
    </main>
  )
}
