'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WithdrawPage() {
  const router = useRouter()
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleWithdraw() {
    if (confirm !== '退会する') return
    setLoading(true)
    const res = await fetch('/api/user/withdraw', { method:'DELETE' })
    if (res.ok) router.push('/')
    else setLoading(false)
  }

  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><span className="text-3xl">⚠️</span><h1 className="text-xl font-bold mt-3">退会の確認</h1><p className="text-neutral-400 text-sm mt-2">退会するとすべてのデータが削除されます。</p></div>
        <div className="space-y-4">
          <input type="text" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="退会する" className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none" />
          <button onClick={handleWithdraw} disabled={loading||confirm!=='退会する'} className="w-full bg-red-600 disabled:opacity-40 text-white font-semibold py-3 rounded-xl">{loading?'処理中...':'退会する'}</button>
          <button onClick={()=>router.push('/settings')} className="w-full bg-neutral-800 text-white py-3 rounded-xl">キャンセル</button>
        </div>
      </div>
    </main>
  )
}
