// app/admin/page.js
// Admin overview — shows key stats at a glance

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Active subscribers
      const { count: activeSubscribers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active')

      // Total draws
      const { count: totalDraws } = await supabase
        .from('draws')
        .select('*', { count: 'exact', head: true })

      // Pending winners
      const { count: pendingWinners } = await supabase
        .from('draw_results')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'pending')
        .gt('prize_amount', 0)

      // Total scores
      const { count: totalScores } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true })

      // Calculate total prize pool
      const monthlyPool = (activeSubscribers || 0) * 999 * 0.5
      const charityPool = (activeSubscribers || 0) * 999 * 0.1

      setStats({
        totalUsers: totalUsers || 0,
        activeSubscribers: activeSubscribers || 0,
        totalDraws: totalDraws || 0,
        pendingWinners: pendingWinners || 0,
        totalScores: totalScores || 0,
        monthlyPool: monthlyPool.toFixed(0),
        charityPool: charityPool.toFixed(0),
      })

      // Recent users
      const { data: recent } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentUsers(recent || [])
      setLoading(false)
    }

    loadStats()
  }, [])

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
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
        <p className="text-slate-400 mt-1">Platform health at a glance.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total users', value: stats.totalUsers, icon: '👥', color: 'text-white' },
          { label: 'Active subscribers', value: stats.activeSubscribers, icon: '✅', color: 'text-green-400' },
          { label: 'Scores entered', value: stats.totalScores, icon: '⛳', color: 'text-blue-400' },
          { label: 'Pending payouts', value: stats.pendingWinners, icon: '⏳', color: stats.pendingWinners > 0 ? 'text-amber-400' : 'text-white' },
          { label: 'Monthly prize pool', value: `₹${Number(stats.monthlyPool).toLocaleString('en-IN')}`, icon: '🏆', color: 'text-amber-400' },
          { label: 'Charity pool this month', value: `₹${Number(stats.charityPool).toLocaleString('en-IN')}`, icon: '❤️', color: 'text-green-400' },
          { label: 'Total draws run', value: stats.totalDraws, icon: '🎯', color: 'text-white' },
          { label: 'Inactive users', value: stats.totalUsers - stats.activeSubscribers, icon: '😴', color: 'text-slate-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500 text-sm">{stat.label}</span>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/admin/draws', label: 'Run a draw', icon: '🎯', color: 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20' },
            { href: '/admin/winners', label: 'Verify winners', icon: '✅', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' },
            { href: '/admin/users', label: 'Manage users', icon: '👥', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20' },
            { href: '/admin/charities', label: 'Edit charities', icon: '❤️', color: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' },
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className={`border rounded-xl p-4 text-center transition-all ${action.color}`}
            >
              <span className="text-2xl block mb-2">{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Recent signups</h2>
          <Link href="/admin/users" className="text-green-400 text-sm hover:underline">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {recentUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold text-sm">
                  {user.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{user.full_name}</p>
                  <p className="text-slate-500 text-xs">{user.email}</p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                user.subscription_status === 'active'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {user.subscription_status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}