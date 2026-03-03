import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import sql from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [member] = await sql`SELECT id FROM cv_share_group_members WHERE group_id = ${params.id} AND user_id = ${userId}`
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 })
  const cards = await sql`
    SELECT c.*, sc.shared_by, sc.created_at as shared_at
    FROM cv_shared_cards sc
    JOIN cv_cards c ON sc.card_id = c.id
    WHERE sc.group_id = ${params.id}
    ORDER BY sc.created_at DESC`
  return NextResponse.json(cards)
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [member] = await sql`SELECT id FROM cv_share_group_members WHERE group_id = ${params.id} AND user_id = ${userId}`
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 })
  const { cardId } = await request.json()
  const [card] = await sql`SELECT id FROM cv_cards WHERE id = ${cardId} AND user_id = ${userId}`
  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  const existing = await sql`SELECT id FROM cv_shared_cards WHERE group_id = ${params.id} AND card_id = ${cardId}`
  if (existing.length) return NextResponse.json({ error: 'Already shared' }, { status: 409 })
  await sql`INSERT INTO cv_shared_cards (group_id, card_id, shared_by) VALUES (${params.id}, ${cardId}, ${userId})`
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { cardId } = await request.json()
  await sql`DELETE FROM cv_shared_cards WHERE group_id = ${params.id} AND card_id = ${cardId} AND shared_by = ${userId}`
  return NextResponse.json({ success: true })
}
