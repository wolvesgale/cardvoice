import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center px-6 text-center">
      <span className="text-5xl mb-4">🪪</span>
      <h1 className="text-4xl font-bold mb-4">Card<span className="text-emerald-400">Voice</span></h1>
      <p className="text-neutral-400 mb-2">撮って、話して、つながる名刺管理</p>
      <p className="text-neutral-500 text-sm mb-10 max-w-xs">名刺を撮影して音声でメモ追加。AIが自動で整理します。</p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link href="/sign-up" className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 rounded-xl">無料で始める</Link>
        <Link href="/sign-in" className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 rounded-xl">ログイン</Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 max-w-sm w-full">
        <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
          <p className="font-bold text-sm mb-1">Personal</p>
          <p className="text-emerald-400 font-bold text-lg">¥2,980</p>
          <p className="text-neutral-500 text-xs mt-1">名刺無制限・音声メモ</p>
        </div>
        <div className="bg-emerald-950 rounded-2xl p-4 border border-emerald-700">
          <p className="font-bold text-sm mb-1">Team</p>
          <p className="text-emerald-400 font-bold text-lg">¥7,980</p>
          <p className="text-neutral-400 text-xs mt-1">10人まで・共有・CSV</p>
        </div>
      </div>
    </main>
  )
}
