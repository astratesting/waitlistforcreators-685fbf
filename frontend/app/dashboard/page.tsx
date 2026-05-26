'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Download, Gift, TrendingUp, Users } from 'lucide-react'
import { supabase, Referral, WaitlistUser } from '@/lib/supabase'

type Metrics = {
  users: WaitlistUser[]
  referrals: Referral[]
}

function growthRate(users: WaitlistUser[]) {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const lastSeven = users.filter((user) => now - new Date(user.created_at).getTime() <= 7 * day).length
  const previousSeven = users.filter((user) => {
    const age = now - new Date(user.created_at).getTime()
    return age > 7 * day && age <= 14 * day
  }).length
  if (previousSeven === 0) return lastSeven > 0 ? 100 : 0
  return Math.round(((lastSeven - previousSeven) / previousSeven) * 100)
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>({ users: [], referrals: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true)
      const [usersResult, referralsResult] = await Promise.all([
        supabase.from('users').select('*').order('waitlist_position', { ascending: true }),
        supabase.from('referrals').select('*')
      ])

      if (usersResult.error || referralsResult.error) {
        setError(usersResult.error?.message || referralsResult.error?.message || 'Unable to load dashboard.')
      } else {
        setMetrics({
          users: (usersResult.data || []) as WaitlistUser[],
          referrals: (referralsResult.data || []) as Referral[]
        })
      }
      setLoading(false)
    }

    loadMetrics()
  }, [])

  const stats = useMemo(() => {
    const totalSignups = metrics.users.length
    const referralConversions = metrics.referrals.length
    const conversionRate = totalSignups ? Math.round((referralConversions / totalSignups) * 100) : 0
    return {
      totalSignups,
      referralConversions,
      conversionRate,
      growth: growthRate(metrics.users)
    }
  }, [metrics])

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-300">Founder analytics</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Waitlist command center</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Track signup volume, referral conversion, and growth momentum before launch.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-slate-950">
            <Download size={18} /> Export CSV
          </button>
        </div>

        {error && <div className="mt-8 rounded-2xl bg-red-500/10 p-4 font-bold text-red-200 ring-1 ring-red-400/30">{error}</div>}
        {loading && <div className="mt-8 rounded-2xl bg-white/10 p-4 font-bold text-slate-200">Loading founder metrics...</div>}

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total signups', value: stats.totalSignups, icon: Users, accent: 'from-orange-400 to-rose-400' },
            { label: 'Referral conversions', value: stats.referralConversions, icon: Gift, accent: 'from-violet-400 to-fuchsia-400' },
            { label: 'Conversion rate', value: `${stats.conversionRate}%`, icon: BarChart3, accent: 'from-sky-400 to-cyan-300' },
            { label: '7-day growth', value: `${stats.growth}%`, icon: TrendingUp, accent: 'from-emerald-400 to-lime-300' }
          ].map((item) => (
            <div key={item.label} className="rounded-[2rem] bg-white/10 p-6 ring-1 ring-white/10">
              <div className={`mb-5 inline-flex rounded-2xl bg-gradient-to-br ${item.accent} p-3 text-slate-950`}><item.icon /></div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
              <p className="mt-2 text-4xl font-black">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] bg-white p-6 text-slate-950">
            <h2 className="text-2xl font-black">Recent signups</h2>
            <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <tr><th className="p-4">Email</th><th className="p-4">Code</th><th className="p-4">Position</th></tr>
                </thead>
                <tbody>
                  {metrics.users.slice(0, 8).map((user) => (
                    <tr key={user.id} className="border-t border-slate-100">
                      <td className="p-4 font-bold">{user.email}</td>
                      <td className="p-4 text-grape">{user.referral_code}</td>
                      <td className="p-4">#{user.waitlist_position}</td>
                    </tr>
                  ))}
                  {!metrics.users.length && !loading && <tr><td className="p-4 text-slate-500" colSpan={3}>No signups yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/10 p-6 ring-1 ring-white/10">
            <h2 className="text-2xl font-black">Reward tiers unlocked</h2>
            <div className="mt-5 space-y-3">
              {['vip-launch-brief', 'creator-teardown-pack', 'founding-member-pricing', 'private-launch-room'].map((tier) => {
                const count = metrics.referrals.filter((referral) => referral.reward_tier === tier).length
                return (
                  <div key={tier} className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                    <span className="font-bold capitalize">{tier.replaceAll('-', ' ')}</span>
                    <span className="rounded-full bg-white px-3 py-1 font-black text-slate-950">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
