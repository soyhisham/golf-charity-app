// app/dashboard/draws/page.js
// Shows the user their draw history —
// which draws they entered, how many numbers they matched,
// and whether they won anything.

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DrawsPage() {
  const [draws, setDraws] = useState([])
  const [myResults, setMyResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Get all published draws
      const { data: drawsData } = await supabase
        .from('draws')
        .select('*')
        .eq('status', 'published')
        .order('draw_date', { ascending: false })

      setDraws(drawsData || [])

      // Get this user's results
      const { data: resultsData } = await supabase
        .from('draw_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setMyResults(resultsData || [])
      setLoading(false)
    }
    init()
  }, [])

  // Match a draw to user's result
  const getResultForDraw = (drawId) => {
    return myResults.find(r => r.draw_id === drawId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <svg className="animate-spin h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Draw History 🏆</h1>
        <p className="text-slate-400 mt-1">
          Monthly draws happen on the last day of each month. Match 3, 4, or 5 numbers to win.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Draws entered',
            value: draws.length,
            icon: '🎯',
          },
          {
            label: 'Times won',
            value: myResults.filter(r => r.prize_amount > 0).length,
            icon: '🏆',
          },
          {
            label: 'Total won',
            value: `₹${myResults.reduce((sum, r) => sum + (r.prize_amount || 0), 0).toLocaleString('en-IN')}`,
            icon: '💰',
          },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 text-center">
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
            <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* How matching works */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-white font-medium mb-4">How the draw works</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { match: '3 numbers', share: '25%', label: 'of prize pool', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { match: '4 numbers', share: '35%', label: 'of prize pool', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
            { match: '5 numbers', share: '40%', label: 'Jackpot!', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          ].map((tier, i) => (
            <div key={i} className={`border ${tier.bg} rounded-xl p-3 text-center`}>
              <p className={`font-black text-2xl ${tier.color}`}>{tier.share}</p>
              <p className="text-white text-sm font-medium">{tier.match}</p>
              <p className="text-slate-500 text-xs">{tier.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Draw list */}
      {draws.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">🎯</p>
          <p className="text-white font-semibold text-lg">No draws yet</p>
          <p className="text-slate-400 mt-2">
            The first draw will happen at the end of this month.
            Make sure you have 5 scores entered!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg">Past draws</h2>
          {draws.map((draw) => {
            const result = getResultForDraw(draw.id)
            const won = result && result.prize_amount > 0

            return (
              <div
                key={draw.id}
                className={`border rounded-2xl p-6 transition-all ${
                  won
                    ? 'bg-green-500/5 border-green-500/30'
                    : 'bg-slate-800/40 border-slate-700/50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                  {/* Draw info */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold">
                        Draw — {new Date(draw.draw_date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </h3>
                      {won && (
                        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                          🏆 Winner!
                        </span>
                      )}
                      {draw.rolled_over && (
                        <span className="bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full">
                          🔄 Jackpot rolled over
                        </span>
                      )}
                    </div>

                    {/* Winning numbers */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-500 text-sm">Winning numbers:</span>
                      {draw.winning_numbers.map((num, i) => (
                        <span
                          key={i}
                          className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold ${
                            result?.matched_numbers?.includes(num)
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Result */}
                  <div className="text-right">
                    {result ? (
                      <div>
                        <p className={`text-2xl font-black ${won ? 'text-green-400' : 'text-slate-400'}`}>
                          {result.match_count} match{result.match_count !== 1 ? 'es' : ''}
                        </p>
                        {won ? (
                          <div>
                            <p className="text-green-400 font-bold text-lg">
                              +₹{result.prize_amount.toLocaleString('en-IN')}
                            </p>
                            <p className={`text-xs mt-1 ${
                              result.payment_status === 'paid'
                                ? 'text-green-400'
                                : 'text-amber-400'
                            }`}>
                              {result.payment_status === 'paid' ? '✅ Paid' : '⏳ Payment pending'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-slate-500 text-sm">No prize this time</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">Not entered</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}