import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })
export const PLANS = {
  personal: { name: 'Personal', price: 2980, description: '名刺無制限・音声メモ・vCardエクスポート' },
  team: { name: 'Team', price: 7980, description: 'Personal全機能＋共有グループ・CSV出力' },
} as const
