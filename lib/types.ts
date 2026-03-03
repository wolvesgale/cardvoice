export type Plan = 'free' | 'personal' | 'team'

export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  is_paid: boolean
  stripe_customer_id: string | null
  paid_at: string | null
  plan: Plan
  created_at: string
}

export interface Card {
  id: string
  user_id: string
  name: string | null
  company: string | null
  title: string | null
  email: string | null
  phone: string | null
  address: string | null
  website: string | null
  memo: string | null
  tags: string[]
  met_at: string | null
  follow_up_at: string | null
  created_at: string
  updated_at: string
}

export interface OcrResult {
  name: string | null
  company: string | null
  title: string | null
  email: string | null
  phone: string | null
  address: string | null
  website: string | null
}

export interface MemoResult {
  memo: string
  tags: string[]
  met_at: string | null
  follow_up_at: string | null
}
