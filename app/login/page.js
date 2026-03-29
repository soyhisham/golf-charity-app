'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, subscription_status')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_32%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#022c22_100%)]" />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative min-h-screen flex">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between px-16 py-14">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-green-500/15 border border-green-400/20 flex items-center justify-center shadow-lg shadow-green-500/10">
              <span className="text-xl">⛳</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight text-white">
              GolfCharity
            </span>
          </div>

          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-400/15 bg-white/5 px-4 py-2 text-sm text-green-300 backdrop-blur-md mb-6">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Welcome back
            </div>

            <h1 className="text-5xl xl:text-6xl font-bold leading-[1.05] tracking-tight">
              Play golf.
              <br />
              <span className="text-green-400">Win prizes.</span>
              <br />
              Change lives.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-300 max-w-lg">
              Every score you enter puts you in the draw. Every subscription supports a charity you believe in.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-xl">
            {[
              ['₹2.4L+', 'Donated to charity'],
              ['1,200+', 'Active players'],
              ['48', 'Monthly draws'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/8 bg-white/5 px-4 py-5 backdrop-blur-sm"
              >
                <p className="text-3xl font-bold text-green-400">{value}</p>
                <p className="mt-1 text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="h-11 w-11 rounded-2xl bg-green-500/15 border border-green-400/20 flex items-center justify-center">
                <span className="text-xl">⛳</span>
              </div>
              <span className="text-2xl font-semibold tracking-tight text-white">
                GolfCharity
              </span>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/8 p-8 sm:p-10 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Welcome back
                </h2>
                <p className="mt-2 text-slate-400">
                  Sign in to your account
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <div className="flex items-start gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white placeholder-slate-500 outline-none transition duration-200 focus:border-green-400/60 focus:ring-4 focus:ring-green-400/10"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-300">
                      Password
                    </label>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white placeholder-slate-500 outline-none transition duration-200 focus:border-green-400/60 focus:ring-4 focus:ring-green-400/10"
                    placeholder="Your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-2 w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-green-500/20 transition duration-200 hover:from-green-400 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                    </span>
                  )}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  new here?
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <Link
                href="/signup"
                className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 font-medium text-slate-200 transition duration-200 hover:border-green-400/40 hover:bg-green-400/5 hover:text-green-300"
              >
                Create an account
              </Link>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              By signing in you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}