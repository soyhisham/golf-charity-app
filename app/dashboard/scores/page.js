// app/dashboard/scores/page.js
// This page lets users add, view, and delete their golf scores.
// The rolling 5-score logic is the key feature here —
// when a 6th score is added, the oldest one is automatically deleted.

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ScoresPage() {
  const [scores, setScores] = useState([])
  const [newScore, setNewScore] = useState('')
  const [playedOn, setPlayedOn] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userId, setUserId] = useState(null)

  // Load scores when page opens
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      await fetchScores(user.id)
    }
    init()
  }, [])

  const fetchScores = async (uid) => {
    setLoading(true)
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', uid)
      .order('played_on', { ascending: false })

    setScores(data || [])
    setLoading(false)
  }

  const handleAddScore = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    // Validate score range
    const scoreNum = parseInt(newScore)
    if (scoreNum < 1 || scoreNum > 45) {
      setError('Score must be between 1 and 45.')
      setSubmitting(false)
      return
    }

    // Validate date is not in the future
    if (new Date(playedOn) > new Date()) {
      setError('Score date cannot be in the future.')
      setSubmitting(false)
      return
    }

    // If already have 5 scores, delete the oldest one first
    // This is the "rolling 5 scores" logic from the PRD
    if (scores.length >= 5) {
      // scores are ordered newest first, so the last one is oldest
      const oldest = scores[scores.length - 1]
      const { error: deleteError } = await supabase
        .from('scores')
        .delete()
        .eq('id', oldest.id)

      if (deleteError) {
        setError('Failed to remove oldest score. Please try again.')
        setSubmitting(false)
        return
      }
    }

    // Insert the new score
    const { error: insertError } = await supabase
      .from('scores')
      .insert({
        user_id: userId,
        score: scoreNum,
        played_on: playedOn,
      })

    if (insertError) {
      setError('Failed to save score. Please try again.')
      setSubmitting(false)
      return
    }

    // Reset form and refresh scores
    setNewScore('')
    setPlayedOn('')
    setSuccess('Score added successfully!')
    await fetchScores(userId)
    setSubmitting(false)

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleDeleteScore = async (scoreId) => {
    const confirmed = confirm('Are you sure you want to delete this score?')
    if (!confirmed) return

    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', scoreId)

    if (error) {
      setError('Failed to delete score.')
      return
    }

    await fetchScores(userId)
  }

  // Get today's date in YYYY-MM-DD format for the date input max value
  const today = new Date().toISOString().split('T')[0]

  // Calculate average score
  const avgScore = scores.length > 0
    ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1)
    : 0

  // Get best score
  const bestScore = scores.length > 0
    ? Math.max(...scores.map(s => s.score))
    : 0

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Scores ⛳</h1>
        <p className="text-slate-400 mt-1">
          Enter your Stableford scores (1–45). Only your latest 5 are kept for the monthly draw.
        </p>
      </div>

      {/* Stats bar */}
      {scores.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Scores entered', value: `${scores.length}/5`, icon: '📝' },
            { label: 'Average score', value: avgScore, icon: '📊' },
            { label: 'Best score', value: bestScore, icon: '🏆' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-center">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left — Add score form */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-lg mb-2">Add a new score</h2>
          <p className="text-slate-500 text-sm mb-6">
            {scores.length >= 5
              ? '⚠️ You have 5 scores. Adding a new one will remove your oldest score.'
              : `You can add ${5 - scores.length} more score${5 - scores.length !== 1 ? 's' : ''}.`}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
              <span>✅</span> {success}
            </div>
          )}

          <form onSubmit={handleAddScore} className="space-y-4">

            {/* Score input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Stableford Score (1–45)
              </label>
              <input
                type="number"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                min="1"
                max="45"
                required
                className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-400/70 focus:ring-1 focus:ring-green-400/30 transition-all text-2xl font-bold text-center"
                placeholder="28"
              />

              {/* Visual score indicator */}
              {newScore && parseInt(newScore) >= 1 && parseInt(newScore) <= 45 && (
                <div className="mt-2 text-center">
                  <span className={`text-sm font-medium ${
                    parseInt(newScore) >= 36 ? 'text-green-400' :
                    parseInt(newScore) >= 28 ? 'text-blue-400' :
                    parseInt(newScore) >= 20 ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    {parseInt(newScore) >= 36 ? '🔥 Excellent round!' :
                     parseInt(newScore) >= 28 ? '👍 Good round' :
                     parseInt(newScore) >= 20 ? '😐 Average round' :
                     '💪 Keep practising!'}
                  </span>
                </div>
              )}
            </div>

            {/* Date input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date played
              </label>
              <input
                type="date"
                value={playedOn}
                onChange={(e) => setPlayedOn(e.target.value)}
                max={today}
                required
                className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-green-400/70 focus:ring-1 focus:ring-green-400/30 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-900 disabled:text-green-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Saving...
                </span>
              ) : 'Add Score'}
            </button>
          </form>
        </div>

        {/* Right — Scores list */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-lg">Your last 5 scores</h2>
            {/* Progress bar */}
            <span className="text-slate-500 text-sm">{scores.length}/5</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-700 rounded-full h-1.5 mb-6">
            <div
              className="bg-green-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(scores.length / 5) * 100}%` }}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">⛳</p>
              <p className="text-slate-400">No scores yet.</p>
              <p className="text-slate-500 text-sm mt-1">Add your first score to enter the draw.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((score, i) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-3 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Position number */}
                    <span className="text-slate-600 text-sm font-medium w-5">#{i + 1}</span>

                    <div>
                      <p className="text-white font-medium">
                        {new Date(score.played_on).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {i === 0 ? '🆕 Latest' : i === scores.length - 1 && scores.length === 5 ? '⚠️ Will be replaced next' : 'Stableford'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Score value */}
                    <div className={`text-xl font-black px-4 py-1.5 rounded-lg ${
                      score.score >= 36 ? 'bg-green-500/20 text-green-400' :
                      score.score >= 28 ? 'bg-blue-500/20 text-blue-400' :
                      score.score >= 20 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {score.score}
                    </div>

                    {/* Delete button — shows on hover */}
                    <button
                      onClick={() => handleDeleteScore(score.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-lg"
                      title="Delete this score"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {/* Warning if 5 scores — next add replaces oldest */}
              {scores.length === 5 && (
                <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                  <p className="text-amber-400 text-sm">
                    ⚠️ Adding a new score will remove <strong>#{scores.length}</strong> (oldest)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-white font-medium mb-3">📋 How scoring works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { range: '36–45', label: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/10' },
            { range: '28–35', label: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { range: '20–27', label: 'Average', color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map((tier, i) => (
            <div key={i} className={`${tier.bg} rounded-xl p-3 text-center`}>
              <p className={`font-bold text-lg ${tier.color}`}>{tier.range}</p>
              <p className="text-slate-400 text-sm">{tier.label}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}