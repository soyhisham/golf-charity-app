// app/dashboard/layout.js
// Every page inside /dashboard shares this layout.
// It shows the top navigation bar with the user's name
// and a logout button.

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function DashboardLayout({ children }) {
  const [profile, setProfile] = useState(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(data)

    // Only redirect if we actually got data back AND it's inactive
    // This prevents redirecting while data is still loading
    if (data && data.subscription_status !== 'active') {
      router.push('/subscribe')
    }
  }
  getProfile()
}, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/scores', label: 'My Scores', icon: '⛳' },
    { href: '/dashboard/draws', label: 'Draws', icon: '🏆' },
    { href: '/dashboard/charity', label: 'My Charity', icon: '❤️' },
  ]

  return (
    <div className="min-h-screen" style={{background: '#0f172a'}}>

      {/* Top navbar */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <Link href="/dashboard" className="text-green-400 font-bold text-lg">
            ⛳ GolfCharity
          </Link>

          {/* Nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname === link.href
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* User info + logout */}
          <div className="flex items-center gap-4">
            {profile && (
              <span className="text-slate-400 text-sm hidden md:block">
                👋 {profile.full_name?.split(' ')[0]}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-xl transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav — shown at bottom on small screens */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex z-50">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${
              pathname === link.href ? 'text-green-400' : 'text-slate-500'
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>

      {/* Page content */}
      <div className="max-w-6xl mx-auto px-6 py-8 pb-24 md:pb-8">
        {children}
      </div>
    </div>
  )
}