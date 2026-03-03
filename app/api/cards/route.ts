import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import sql from '@/lib/db'

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name,company,title,email,phone,address,website,memo,tags,met_at,follow_up_at } = await request.json()
  const [card] = await sql`INSERT INTO cv_cards (user_id,name,company,title,email,phone,address,website,memo,tags,met_at,follow_up_at) VALUES (${userId},${name},${company},${title},${email},${phone},${address},${website},${memo},${tags??[]},${met_at},${follow_up_at}) RETURNING *`
  return NextResponse.json(card)
}
