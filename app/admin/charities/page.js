// app/admin/winners/page.js
// Admin verifies winners and marks payouts as complete.

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchWinners()
  }, [])

  const fetchWinners = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('draw_results')
      .select(`
        *,
        draws (draw_date, winning_numbers),
        profiles (full_name, email)
      `)
      .gt('prize_amount', 0)
      .order('created_at', { ascending: false })

    setWinners(data || [])
    setLoading(false)
  }

  const handleMarkPaid = async (winnerId) => {
    setUpdating(winnerId)
    const { error } = await supabase
      .from('draw_results')
      .update({ payment_status: 'paid', verified: true })
      .eq('id', winnerId)

    if (!error) await fetchWinners()
    setUpdating(null)
  }

  const matchLabel = (count) => {
    if (count === 5) return { label: 'Jackpot!', color: 'text-amber-400 bg-amber-500/20' }
    if (count === 4) return { label: '4-match', color: 'text-green-400 bg-green-500/20' }
    return { label: '3-match', color: 'text-blue-400 bg-blue-500/20' }
  }

  const pendingCount = winners.filter(w => w.payment_status === 'pending').length
  const paidCount = winners.filter(w => w.payment_status === 'paid').length
  const totalPaid = winners
    .filter(w => w.payment_status === 'paid')
    .reduce((sum, w) => sum + w.prize_amount, 0)

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-white">Winners 💰</h1>
        <p className="text-slate-400 mt-1">Verify and manage prize payouts.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending payouts', value: pendingCount, color: pendingCount > 0 ? 'text-amber-400' : 'text-white', icon: '⏳' },
          { label: 'Paid out', value: paidCount, color: 'text-green-400', icon: '✅' },
          { label: 'Total paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, color: 'text-green-400', icon: '💰' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">{s.label}</span>
              <span>{s.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Winners list */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-5">All winners</h2>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading winners...</div>
        ) : winners.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-slate-400">No winners yet. Run a draw first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {winners.map((winner) => {
              const { label, color } = matchLabel(winner.match_count)
              return (
                <div
                  key={winner.id}
                  className={`flex items-center justify-between rounded-xl px-5 py-4 ${
                    winner.payment_status === 'paid'
                      ? 'bg-slate-900/30 opacity-60'
                      : 'bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold">
                      {winner.profiles?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{winner.profiles?.full_name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
                          {label}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs">{winner.profiles?.email}</p>
                      <p className="text-slate-600 text-xs mt-0.5">
                        Draw: {winner.draws?.draw_date
                          ? new Date(winner.draws.draw_date).toLocaleDateString('en-IN')
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-lg">
                        ₹{winner.prize_amount.toLocaleString('en-IN')}
                      </p>
                      <p className={`text-xs ${
                        winner.payment_status === 'paid' ? 'text-green-400' : 'text-amber-400'
                      }`}>
                        {winner.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                      </p>
                    </div>

                    {winner.payment_status === 'pending' && (
                      <button
                        onClick={() => handleMarkPaid(winner.id)}
                        disabled={updating === winner.id}
                        className="bg-green-500 hover:bg-green-400 disabled:bg-green-900 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                      >
                        {updating === winner.id ? 'Updating...' : 'Mark paid'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}