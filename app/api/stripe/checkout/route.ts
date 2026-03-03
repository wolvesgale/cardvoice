import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { stripe, PLANS } from '@/lib/stripe'
import sql from '@/lib/db'

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { plan } = await request.json()
  const planData = PLANS[plan as keyof typeof PLANS]
  if (!planData) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  const user = await currentUser()
  await sql`INSERT INTO cv_profiles (id) VALUES (${userId}) ON CONFLICT (id) DO NOTHING`
  const [profile] = await sql`SELECT stripe_customer_id FROM cv_profiles WHERE id = ${userId}`
  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user?.emailAddresses[0]?.emailAddress, metadata: { clerk_user_id: userId } })
    customerId = customer.id
    await sql`UPDATE cv_profiles SET stripe_customer_id = ${customerId} WHERE id = ${userId}`
  }
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: planData.priceId, quantity: 1 }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    metadata: { clerk_user_id: userId, plan },
  })
  return NextResponse.json({ url: session.url })
}
