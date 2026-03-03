import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import sql from '@/lib/db'
import type { Card } from '@/lib/types'

export default async function DashboardPage({ searchParams }: { searchParams: { upgraded?: string; q?: string } }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await sql`INSERT INTO cv_profiles (id) VALUES (${userId}) ON CONFLICT (id) DO NOTHING`
  const [profile] = await sql`SELECT * FROM cv_profiles WHERE id = ${userId}`
  let cards = await sql`SELECT * FROM cv_cards WHERE user_id = ${userId} ORDER BY created_at DESC` as Card[]

  const q = searchParams.q?.toLowerCase()
  if (q) cards = cards.filter(c => [c.name,c.company,c.title,c.email,c.memo].some(v => v?.toLowerCase().includes(q)))

  return (
    <main className="min-h-screen bg-neutral-950 pb-24">
      <div className="sticky top-0 z-10 bg-neutral-950 border-b border-neutral-900 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold">Card<span className="text-emerald-400">Voice</span></h1>
          <Link href="/settings" className="text-xs bg-neutral-800 px-3 py-1.5 rounded-lg text-neutral-300">設定</Link>
        </div>
        <form>
          <input name="q" defaultValue={searchParams.q} placeholder="名前・会社名・メモで検索..." className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-600" />
        </form>
      </div>

      {searchParams.upgraded && (
        <div className="mx-4 mt-4 bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 text-emerald-400 text-sm">🎉 アップグレード完了！</div>
      )}
      {!profile?.is_paid && (
        <div className="mx-4 mt-4 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 flex justify-between items-center">
          <div><p className="text-xs text-neutral-400">無料プラン</p><p className="text-sm font-medium">{cards.length} / 10 枚</p></div>
          <Link href="/settings" className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg">アップグレード</Link>
        </div>
      )}

      <div className="px-4 mt-4 space-y-3">
        {cards.length === 0 ? (
          <div className="text-center py-16 text-neutral-600"><p className="text-4xl mb-3">🪪</p><p className="text-sm">{q ? '検索結果がありません' : 'まだ名刺がありません'}</p></div>
        ) : cards.map(card => (
          <Link key={card.id} href={`/card/${card.id}`}>
            <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{card.name ?? '（名前なし）'}</p>
                  <p className="text-sm text-neutral-400">{card.company ?? ''}</p>
                  {card.title && <p className="text-xs text-neutral-500">{card.title}</p>}
                </div>
                <span className="text-xs text-neutral-600">{new Date(card.created_at).toLocaleDateString('ja-JP')}</span>
              </div>
              {card.memo && <p className="text-xs text-neutral-500 mt-2 line-clamp-2">{card.memo}</p>}
              {card.tags?.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {card.tags.map((tag: string) => <span key={tag} className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">{tag}</span>)}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      <Link href="/card/new" className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-emerald-400 transition-colors">+</Link>
    </main>
  )
}
