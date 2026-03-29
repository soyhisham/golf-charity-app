// app/admin/layout.js
// Wrapper for all admin pages.
// Checks the user is actually an admin before showing anything.

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

      // If not admin, kick them out
      if (profile?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setAdminName(profile.full_name)
      setLoading(false)
    }
    checkAdmin()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navLinks = [
    { href: '/admin', label: 'Overview', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/draws', label: 'Draws', icon: '🏆' },
    { href: '/admin/charities', label: 'Charities', icon: '❤️' },
    { href: '/admin/winners', label: 'Winners', icon: '💰' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <svg className="animate-spin h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col fixed h-full">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-800">
          <span className="text-green-400 font-bold text-lg">⛳ GolfCharity</span>
          <p className="text-slate-600 text-xs mt-0.5">Admin Panel</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === link.href
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div className="px-6 py-5 border-t border-slate-800">
          <p className="text-slate-400 text-sm mb-1">Logged in as</p>
          <p className="text-white text-sm font-medium mb-3">{adminName}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm py-2.5 rounded-xl transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content — offset by sidebar width */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}