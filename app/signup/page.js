'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          role: 'subscriber',
          subscription_status: 'inactive'
        })

      if (profileError) {
        console.error('Profile creation failed:', profileError.message)
        setError('Account created but profile setup failed: ' + profileError.message)
        setLoading(false)
        return
      }
    }

    router.push('/subscribe')
    setLoading(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_32%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#022c22_100%)]" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative min-h-screen flex">

        {/* Left Branding Panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between px-16 py-14">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-green-500/15 border border-green-400/20 flex items-center justify-center">
              <span className="text-xl">⛳</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight text-white">GolfCharity</span>
          </div>

          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-400/15 bg-white/5 px-4 py-2 text-sm text-green-300 backdrop-blur-md mb-6">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Join the movement
            </div>
            <h1 className="text-5xl xl:text-6xl font-bold leading-tight tracking-tight">
              Play better.<br />
              <span className="text-green-400">Support good causes.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300 max-w-lg">
              Subscribe, enter your golf scores, and compete in monthly prize draws — while every rupee helps a charity you care about.
            </p>
            <div className="mt-10 grid gap-4">
              {[
                { icon: '🏆', text: 'Monthly prize draws with real cash rewards' },
                { icon: '⛳', text: 'Track your last 5 Stableford scores' },
                { icon: '❤️', text: 'Choose a charity to receive part of your fee' },
                { icon: '📊', text: 'Full dashboard with stats and history' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-400/10 text-lg">{item.icon}</span>
                  <span className="text-slate-200">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-slate-500">© 2026 GolfCharity. All rights reserved.</p>
        </div>

        {/* Right Form Panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="h-11 w-11 rounded-2xl bg-green-500/15 border border-green-400/20 flex items-center justify-center">
                <span className="text-xl">⛳</span>
              </div>
              <span className="text-2xl font-semibold tracking-tight text-white">GolfCharity</span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-white">Create your account</h2>
                <p className="mt-2 text-slate-400">Start playing and giving today</p>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white placeholder-slate-500 outline-none transition focus:border-green-400/60 focus:ring-4 focus:ring-green-400/10"
                    placeholder="Rahul Sharma"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white placeholder-slate-500 outline-none transition focus:border-green-400/60 focus:ring-4 focus:ring-green-400/10"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white placeholder-slate-500 outline-none transition focus:border-green-400/60 focus:ring-4 focus:ring-green-400/10"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-green-500/20 transition hover:from-green-400 hover:to-emerald-400 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Create Account
                      <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  )}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10"/>
                <span className="text-xs uppercase tracking-widest text-slate-500">have an account?</span>
                <div className="h-px flex-1 bg-white/10"/>
              </div>

              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 font-medium text-slate-200 transition hover:border-green-400/40 hover:text-green-300"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}