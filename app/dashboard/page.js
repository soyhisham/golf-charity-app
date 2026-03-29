// app/dashboard/page.js
// The main dashboard overview.
// Shows subscription status, quick stats, recent scores,
// and upcoming draw info — all in one glance.

'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// 1. We rename your main logic to an inner component
function DashboardContent() {
  const [profile, setProfile] = useState(null)
  const [scores, setScores] = useState([])
  const [charity, setCharity] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if they just subscribed (came from /subscribe)
  const justSubscribed = searchParams.get('subscribed') === 'true'

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Get their scores
      const { data: scoresData } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('played_on', { ascending: false })
        .limit(5)

      setScores(scoresData || [])

      // Get their charity
      if (profileData?.charity_id) {
        const { data: charityData } = await supabase
          .from('charities')
          .select('*')
          .eq('id', profileData.charity_id)
          .single()
        setCharity(charityData)
      }

      setLoading(false)
    }

    getData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-slate-400 flex items-center gap-3">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Loading your dashboard...
        </div>
      </div>
    )
  }

  // Calculate days until subscription expires
  const daysLeft = profile?.subscription_end
    ? Math.ceil((new Date(profile.subscription_end) - new Date()) / (1000 * 60 * 60 * 24))
    : 0

  // Calculate charity contribution amount
  const planPrice = profile?.subscription_plan === 'yearly' ? 9999 : 999
  const charityAmount = ((planPrice * (profile?.charity_percentage || 10)) / 100).toFixed(0)

  return (
    <div className="space-y-6">

      {/* Welcome banner — only shows right after subscribing */}
      {justSubscribed && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 flex items-center gap-4">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="text-green-400 font-semibold">You're in! Subscription activated.</p>
            <p className="text-slate-400 text-sm">Start entering your scores to join the next monthly draw.</p>
          </div>
        </div>
      )}

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's your golf performance overview.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Subscription',
            value: profile?.subscription_status === 'active' ? 'Active' : 'Inactive',
            sub: profile?.subscription_plan === 'yearly' ? 'Yearly plan' : 'Monthly plan',
            icon: '💳',
            color: profile?.subscription_status === 'active' ? 'text-green-400' : 'text-red-400',
          },
          {
            label: 'Days remaining',
            value: daysLeft,
            sub: `Renews ${new Date(profile?.subscription_end).toLocaleDateString('en-IN')}`,
            icon: '📅',
            color: daysLeft < 7 ? 'text-amber-400' : 'text-white',
          },
          {
            label: 'Scores entered',
            value: `${scores.length}/5`,
            sub: 'Draw entries this month',
            icon: '⛳',
            color: 'text-white',
          },
          {
            label: 'Charity donation',
            value: `₹${charityAmount}`,
            sub: `${profile?.charity_percentage}% of subscription`,
            icon: '❤️',
            color: 'text-green-400',
          },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500 text-sm">{stat.label}</span>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-slate-500 text-xs mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Recent scores — takes 2 columns */}
        <div className="md:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-lg">Your scores</h2>
            <Link
              href="/dashboard/scores"
              className="text-green-400 text-sm hover:underline"
            >
              Manage scores →
            </Link>
          </div>

          {scores.length === 0 ? (
            // Empty state
            <div className="text-center py-10">
              <p className="text-5xl mb-3">⛳</p>
              <p className="text-white font-medium mb-1">No scores yet</p>
              <p className="text-slate-400 text-sm mb-5">
                Add your last 5 Stableford scores to enter the monthly draw.
              </p>
              <Link
                href="/dashboard/scores"
                className="bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors inline-block"
              >
                Add your first score
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((score, i) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-4">
                    {/* Score rank badge */}
                    <span className="text-slate-600 text-sm w-4">{i + 1}</span>
                    <div>
                      <p className="text-white font-medium">
                        {new Date(score.played_on).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                      <p className="text-slate-500 text-xs">Stableford</p>
                    </div>
                  </div>

                  {/* Score badge — color based on score value */}
                  <div className={`text-lg font-black px-4 py-1 rounded-lg ${
                    score.score >= 36 ? 'bg-green-500/20 text-green-400' :
                    score.score >= 28 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {score.score}
                  </div>
                </div>
              ))}

              {/* Progress bar showing how many scores entered */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Draw entry progress</span>
                  <span className="text-green-400">{scores.length}/5 scores</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all"
                    style={{ width: `${(scores.length / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Charity card */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-4">❤️ Your charity</h2>
            {charity ? (
              <div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 font-bold text-xl mb-3">
                  {charity.name.charAt(0)}
                </div>
                <p className="text-white font-medium">{charity.name}</p>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  {charity.description?.substring(0, 80)}...
                </p>
                <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                  <p className="text-green-400 font-bold text-xl">₹{charityAmount}</p>
                  <p className="text-slate-500 text-xs">Your contribution this period</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No charity selected.</p>
            )}
          </div>

          {/* Next draw card */}
          <div className="bg-gradient-to-b from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-2">🏆 Next draw</h2>
            <p className="text-slate-400 text-sm mb-4">
              Draws happen on the last day of every month.
            </p>
            <div className="text-center">
              <p className="text-amber-400 font-black text-3xl">
                {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
                  .toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
              </p>
              <p className="text-slate-500 text-sm mt-1">Draw date</p>
            </div>
            <Link
              href="/dashboard/draws"
              className="w-full mt-4 block text-center border border-amber-500/30 hover:border-amber-500/60 text-amber-400 text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              View draw history →
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

// 2. This is the new wrapper component that satisfies Next.js 16 build rules
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-64">
        <div className="text-slate-400 flex items-center gap-3">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Loading your dashboard...
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}