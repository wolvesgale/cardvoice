import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import sql from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const members = await sql`
    SELECT gm.*, p.email FROM cv_share_group_members gm
    LEFT JOIN cv_profiles p ON gm.user_id = p.id
    WHERE gm.group_id = ${params.id}`
  return NextResponse.json(members)
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [group] = await sql`SELECT * FROM cv_share_groups WHERE id = ${params.id} AND owner_id = ${userId}`
  if (!group) return NextResponse.json({ error: 'Not found or not owner' }, { status: 403 })
  const [{ count }] = await sql`SELECT COUNT(*) as count FROM cv_share_group_members WHERE group_id = ${params.id}`
  if (Number(count) >= 10) return NextResponse.json({ error: 'MEMBER_LIMIT', message: 'メンバーは最大10名までです' }, { status: 403 })
  const { email } = await request.json()
  const clerk = await clerkClient()
  const users = await clerk.users.getUserList({ emailAddress: [email] })
  if (!users.data.length) return NextResponse.json({ error: 'USER_NOT_FOUND', message: 'このメールアドレスのユーザーが見つかりません' }, { status: 404 })
  const targetId = users.data[0].id
  const existing = await sql`SELECT id FROM cv_share_group_members WHERE group_id = ${params.id} AND user_id = ${targetId}`
  if (existing.length) return NextResponse.json({ error: 'ALREADY_MEMBER', message: 'すでにメンバーです' }, { status: 409 })
  await sql`INSERT INTO cv_profiles (id) VALUES (${targetId}) ON CONFLICT (id) DO NOTHING`
  await sql`INSERT INTO cv_share_group_members (group_id, user_id, role) VALUES (${params.id}, ${targetId}, 'member')`
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { targetUserId } = await request.json()
  const [group] = await sql`SELECT * FROM cv_share_groups WHERE id = ${params.id} AND owner_id = ${userId}`
  if (!group && targetUserId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await sql`DELETE FROM cv_share_group_members WHERE group_id = ${params.id} AND user_id = ${targetUserId}`
  return NextResponse.json({ success: true })
}
