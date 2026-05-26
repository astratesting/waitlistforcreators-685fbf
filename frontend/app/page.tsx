'use client'

import { FormEvent, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Gift, Link2, ShieldCheck, TrendingUp, Users } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { supabase, WaitlistUser } from '@/lib/supabase'

const milestones = [
  { label: 'VIP launch brief', referrals: 1 },
  { label: 'Creator teardown pack', referrals: 3 },
  { label: 'Founding member pricing', referrals: 5 },
  { label: 'Private launch room', referrals: 10 }
]

function makeReferralCode(email: string) {
  const clean = email.split('@')[0].replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase()
  return `${clean || 'CREATOR'}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function rewardTier(referrals: number) {
  if (referrals >= 10) return 'private-launch-room'
  if (referrals >= 5) return 'founding-member-pricing'
  if (referrals >= 3) return 'creator-teardown-pack'
  if (referrals >= 1) return 'vip-launch-brief'
  return 'starter'
}

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [status, setStatus] = useState<string>('')
  const [user, setUser] = useState<WaitlistUser | null>(null)
  const [referralCount, setReferralCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const progress = useMemo(() => Math.min((referralCount / 10) * 100, 100), [referralCount])

  async function submitWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setStatus('')

    const normalizedEmail = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setStatus('Enter a valid creator email.')
      setLoading(false)
      return
    }

    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existing) {
      setUser(existing as WaitlistUser)
      setStatus('You are already on the waitlist. Share your link to climb.')
      await loadReferralCount(existing.id)
      setLoading(false)
      return
    }

    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const newUser = {
      email: normalizedEmail,
      referral_code: makeReferralCode(normalizedEmail),
      waitlist_position: (count || 0) + 1
    }

    const { data, error } = await supabase.from('users').insert(newUser).select('*').single()

    if (error || !data) {
      setStatus(error?.message || 'Signup failed. Try again.')
      setLoading(false)
      return
    }

    if (referralCode.trim()) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode.trim().toUpperCase())
        .maybeSingle()

      if (referrer) {
        await supabase.from('referrals').insert({
          referrer_id: referrer.id,
          referred_email: normalizedEmail,
          reward_tier: rewardTier(1)
        })
      }
    }

    setUser(data as WaitlistUser)
    setReferralCount(0)
    setStatus('You are in. Share your link to unlock creator perks.')
    setLoading(false)
  }

  async function loadReferralCount(userId: string) {
    const { count } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
    setReferralCount(count || 0)
  }

  const shareUrl = user ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${user.referral_code}` : ''

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#fed7aa,transparent_36%),linear-gradient(135deg,#fff7ed,#faf5ff_55%,#eef2ff)]">
      <Navbar />
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-grape shadow-sm ring-1 ring-purple-100">
            <ShieldCheck size={16} /> Built for creators launching paid communities
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight text-ink sm:text-7xl">
            Turn creator demand into a ranked launch waitlist.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            Capture emails, reward referrals, show milestone progress, and give founders live signup analytics before launch day.
          </p>

          <form onSubmit={submitWaitlist} className="mt-8 rounded-[2rem] bg-white p-3 shadow-glow ring-1 ring-slate-200 sm:flex">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="creator@example.com"
              className="min-h-14 flex-1 rounded-2xl border-0 px-5 text-base outline-none ring-0 focus:ring-0"
            />
            <input
              value={referralCode}
              onChange={(event) => setReferralCode(event.target.value.toUpperCase())}
              placeholder="Referral code"
              className="min-h-14 w-full rounded-2xl border-0 px-5 text-base outline-none ring-0 focus:ring-0 sm:w-44"
            />
            <button disabled={loading} className="mt-2 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 font-bold text-white disabled:opacity-60 sm:mt-0 sm:w-auto">
              {loading ? 'Joining...' : 'Join waitlist'} <ArrowRight size={18} />
            </button>
          </form>
          {status && <p className="mt-4 font-semibold text-slate-700">{status}</p>}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['2,400+', 'creator launches tracked'],
              ['38%', 'avg referral lift'],
              ['10 min', 'setup to campaign']
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl bg-white/70 p-5 shadow-sm ring-1 ring-white">
                <p className="text-2xl font-black text-ink">{value}</p>
                <p className="text-sm font-semibold text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }} className="rounded-[2.5rem] bg-ink p-6 text-white shadow-2xl">
          <div className="rounded-[2rem] bg-white p-6 text-ink">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Your rank</p>
                <p className="text-4xl font-black">#{user?.waitlist_position || 128}</p>
              </div>
              <div className="rounded-2xl bg-orange-100 p-3 text-flame"><TrendingUp /></div>
            </div>
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
                <span>{referralCount} referrals</span>
                <span>10 goal</span>
              </div>
              <div className="h-4 rounded-full bg-slate-100">
                <div className="h-4 rounded-full bg-gradient-to-r from-flame to-grape" style={{ width: `${progress || 30}%` }} />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {milestones.map((milestone) => (
                <div key={milestone.label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="font-bold">{milestone.label}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-grape ring-1 ring-purple-100">{milestone.referrals} refs</span>
                </div>
              ))}
            </div>
            {user && (
              <div className="mt-6 rounded-2xl bg-cream p-4">
                <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500"><Link2 size={16} /> Share link</p>
                <p className="mt-2 break-all font-bold text-ink">{shareUrl}</p>
              </div>
            )}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm font-bold">
            <div className="rounded-2xl bg-white/10 p-4"><Users className="mx-auto mb-2" /> Leads</div>
            <div className="rounded-2xl bg-white/10 p-4"><Gift className="mx-auto mb-2" /> Rewards</div>
            <div className="rounded-2xl bg-white/10 p-4"><BarChart3 className="mx-auto mb-2" /> Metrics</div>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
