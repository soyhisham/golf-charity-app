// app/admin/users/page.js
// Admin can view all users, their subscription status,
// and edit their details.

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      setUsers(data || [])
      setLoading(false)
    }
    fetchUsers()
  }, [])

  // Filter and search logic
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && user.subscription_status === 'active') ||
      (filter === 'inactive' && user.subscription_status !== 'active')

    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-white">Users 👥</h1>
        <p className="text-slate-400 mt-1">Manage all platform users.</p>
      </div>

      {/* Search and filter */}
      <div className="flex gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-400/50"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400/50"
        >
          <option value="all" className="bg-slate-900">All users</option>
          <option value="active" className="bg-slate-900">Active only</option>
          <option value="inactive" className="bg-slate-900">Inactive only</option>
        </select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: users.length, color: 'text-white' },
          { label: 'Active', value: users.filter(u => u.subscription_status === 'active').length, color: 'text-green-400' },
          { label: 'Inactive', value: users.filter(u => u.subscription_status !== 'active').length, color: 'text-slate-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No users found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">User</th>
                <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Plan</th>
                <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Status</th>
                <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Joined</th>
                <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Charity %</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-slate-800/50 hover:bg-slate-700/20 transition-colors ${
                    i === filteredUsers.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold text-sm flex-shrink-0">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{user.full_name}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm capitalize">
                    {user.subscription_plan || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      user.subscription_status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {user.subscription_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">
                    {user.charity_percentage ? `${user.charity_percentage}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}