import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import sql from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [card] = await sql`SELECT * FROM cv_cards WHERE id = ${params.id} AND user_id = ${userId}`
  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(card)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, company, title, email, phone, address, website, memo, tags, met_at, follow_up_at } = await request.json()
  const [card] = await sql`
    UPDATE cv_cards SET name=${name}, company=${company}, title=${title}, email=${email}, phone=${phone},
    address=${address}, website=${website}, memo=${memo}, tags=${tags??[]}, met_at=${met_at}, follow_up_at=${follow_up_at}
    WHERE id = ${params.id} AND user_id = ${userId} RETURNING *`
  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(card)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await sql`DELETE FROM cv_cards WHERE id = ${params.id} AND user_id = ${userId}`
  return NextResponse.json({ success: true })
}
