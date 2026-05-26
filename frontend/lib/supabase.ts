import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export type WaitlistUser = {
  id: string
  email: string
  referral_code: string
  waitlist_position: number
  created_at: string
}

export type Referral = {
  id: string
  referrer_id: string
  referred_email: string
  reward_tier: string
  created_at?: string
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
