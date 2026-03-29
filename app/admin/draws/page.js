// app/admin/draws/page.js
// Admin can run simulations, run the real draw,
// and publish results from here.

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [publishing, setPublishing] = useState(null)
  const [result, setResult] = useState(null)
  const [useAlgorithm, setUseAlgorithm] = useState(false)
  const [adminId, setAdminId] = useState(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setAdminId(user.id)
      await fetchDraws()
    }
    init()
  }, [])

  const fetchDraws = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false })
    setDraws(data || [])
    setLoading(false)
  }

  const handleRunDraw = async () => {
    if (!confirm('Are you sure you want to run this month\'s draw?')) return
    setRunning(true)
    setResult(null)

    const response = await fetch('/api/draws/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, useAlgorithm }),
    })

    const data = await response.json()

    if (data.error) {
      alert('Draw failed: ' + data.error)
    } else {
      setResult(data)
      await fetchDraws()
    }

    setRunning(false)
  }

  const handlePublish = async (drawId) => {
    if (!confirm('Publish this draw? Results will be visible to all users.')) return
    setPublishing(drawId)

    const response = await fetch('/api/draws/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawId, adminId }),
    })

    const data = await response.json()
    if (data.success) {
      await fetchDraws()
    } else {
      alert('Failed to publish: ' + data.error)
    }

    setPublishing(null)
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-white">Draw Management 🎯</h1>
        <p className="text-slate-400 mt-1">Run monthly draws and publish results.</p>
      </div>

      {/* Run draw panel */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-5">Run this month's draw</h2>

        {/* Algorithm toggle */}
        <div className="flex items-center justify-between bg-slate-900/50 rounded-xl p-4 mb-5">
          <div>
            <p className="text-white font-medium">Draw mode</p>
            <p className="text-slate-400 text-sm">
              {useAlgorithm
                ? 'Algorithmic — weighted by most common user scores'
                : 'Random — standard lottery style'}
            </p>
          </div>
          <button
            onClick={() => setUseAlgorithm(!useAlgorithm)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              useAlgorithm ? 'bg-green-500' : 'bg-slate-600'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              useAlgorithm ? 'translate-x-6' : 'translate-x-0.5'
            }`}/>
          </button>
        </div>

        <button
          onClick={handleRunDraw}
          disabled={running}
          className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-900 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/20 text-lg"
        >
          {running ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Running draw...
            </span>
          ) : '🎯 Run Draw Now'}
        </button>

        {/* Draw result summary */}
        {result && (
          <div className="mt-5 bg-green-500/10 border border-green-500/20 rounded-xl p-5">
            <h3 className="text-green-400 font-bold text-lg mb-3">✅ Draw complete!</h3>

            <div className="mb-4">
              <p className="text-slate-400 text-sm mb-2">Winning numbers:</p>
              <div className="flex gap-2">
                {result.winningNumbers.map((num, i) => (
                  <span key={i} className="w-10 h-10 bg-green-500 text-white font-bold rounded-full flex items-center justify-center">
                    {num}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: '5-match winners', value: result.winners.fiveMatch, color: 'text-amber-400' },
                { label: '4-match winners', value: result.winners.fourMatch, color: 'text-green-400' },
                { label: '3-match winners', value: result.winners.threeMatch, color: 'text-blue-400' },
              ].map((w, i) => (
                <div key={i} className="bg-slate-800 rounded-xl p-3 text-center">
                  <p className={`text-2xl font-black ${w.color}`}>{w.value}</p>
                  <p className="text-slate-500 text-xs mt-1">{w.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total pool</p>
                <p className="text-white font-bold text-xl">
                  ₹{Number(result.totalPool).toLocaleString('en-IN')}
                </p>
              </div>
              {result.jackpotRolledOver && (
                <span className="bg-amber-500/20 text-amber-400 px-4 py-2 rounded-xl text-sm font-medium">
                  🔄 Jackpot rolled over
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Past draws list */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-5">All draws</h2>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : draws.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-slate-400">No draws run yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {draws.map((draw) => (
              <div key={draw.id} className="flex items-center justify-between bg-slate-900/50 rounded-xl px-5 py-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-white font-medium">
                      {new Date(draw.draw_date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      draw.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {draw.status}
                    </span>
                    {draw.rolled_over && (
                      <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                        🔄 Jackpot rolled
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {draw.winning_numbers?.map((num, i) => (
                      <span key={i} className="w-7 h-7 bg-slate-700 text-slate-300 text-xs font-bold rounded-full flex items-center justify-center">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

                {draw.status === 'pending' && (
                  <button
                    onClick={() => handlePublish(draw.id)}
                    disabled={publishing === draw.id}
                    className="bg-green-500 hover:bg-green-400 disabled:bg-green-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                  >
                    {publishing === draw.id ? 'Publishing...' : 'Publish results'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}