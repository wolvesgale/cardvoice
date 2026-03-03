import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import sql from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groups = await sql`
    SELECT g.*, gm.role,
      (SELECT COUNT(*) FROM cv_share_group_members WHERE group_id = g.id) as member_count,
      (SELECT COUNT(*) FROM cv_shared_cards WHERE group_id = g.id) as card_count
    FROM cv_share_groups g
    JOIN cv_share_group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ${userId}
    ORDER BY g.created_at DESC`
  return NextResponse.json(groups)
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [profile] = await sql`SELECT plan FROM cv_profiles WHERE id = ${userId}`
  if (profile?.plan !== 'team') return NextResponse.json({ error: 'Team plan required' }, { status: 403 })
  const { name } = await request.json()
  const [group] = await sql`INSERT INTO cv_share_groups (owner_id, name) VALUES (${userId}, ${name}) RETURNING *`
  await sql`INSERT INTO cv_share_group_members (group_id, user_id, role) VALUES (${group.id}, ${userId}, 'owner')`
  return NextResponse.json(group)
}
