'use client'
import { useEffect, useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useUser()
  const { signOut } = useClerk()
  const [profile, setProfile] = useState<any>(null)
  const [upgrading, setUpgrading] = useState<string|null>(null)

  useEffect(() => { fetch('/api/user/profile').then(r=>r.json()).then(setProfile) }, [])

  async function handleUpgrade(plan: string) {
    setUpgrading(plan)
    const res = await fetch('/api/stripe/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({plan}) })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setUpgrading(null)
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-neutral-400">← 戻る</Link>
        <h1 className="text-lg font-bold">設定</h1>
      </div>
      <section className="mb-6">
        <p className="text-xs text-neutral-500 mb-2">アカウント</p>
        <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
          <p className="font-bold">{profile?.plan === 'team' ? 'Team' : profile?.is_paid ? 'Personal' : 'Free'}プラン</p>
          <p className="text-neutral-400 text-sm">{user?.emailAddresses[0]?.emailAddress}</p>
        </div>
      </section>
      {!profile?.is_paid && (
        <section className="mb-6 space-y-3">
          <p className="text-xs text-neutral-500">アップグレード（買切り）</p>
          {(['personal','team'] as const).map(plan => (
            <div key={plan} className={`rounded-2xl p-4 border ${plan==='team'?'bg-emerald-950 border-emerald-800':'bg-neutral-900 border-neutral-800'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold capitalize">{plan}</p>
                  <p className="text-emerald-400 font-bold text-xl">¥{plan==='personal'?'2,980':'7,980'}</p>
                </div>
                <button onClick={() => handleUpgrade(plan)} disabled={upgrading===plan} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-xl">
                  {upgrading===plan?'処理中...':'購入'}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
      <section className="space-y-3">
        <button onClick={() => signOut(()=>router.push('/'))} className="w-full bg-neutral-900 border border-neutral-700 text-neutral-300 font-medium py-3 rounded-xl">ログアウト</button>
        <Link href="/auth/withdraw" className="w-full bg-neutral-900 border border-red-900 text-red-400 font-medium py-3 rounded-xl block text-center">退会する</Link>
      </section>
    </main>
  )
}
