import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })
export const PLANS = {
  personal: {
    name: 'Personal',
    price: 2980,
    priceId: 'price_1T6o6WPIEWwUBqM2TZMJudGN',
    description: '名刺無制限・音声メモ・vCardエクスポート',
  },
  team: {
    name: 'Team',
    price: 7980,
    priceId: 'price_1T6o6wPIEWwUBqM2uP2X3UoP',
    description: 'Personal全機能＋10人共有・CSV出力',
  },
} as const
