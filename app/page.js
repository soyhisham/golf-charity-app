// app/page.js
// This is the homepage at localhost:3000/
// It's a 'server component' by default (no 'use client')
// which means it can fetch data directly from the database
// before the page loads — faster and better for SEO.

import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// This function fetches charities from the database
// It runs on the SERVER before the page is sent to the browser
async function getCharities() {
  const { data } = await supabase
    .from('charities')
    .select('*')
    .limit(4)
  return data || []
}

export default async function HomePage() {
  // Fetch charities at page load time
  const charities = await getCharities()

  return (
    <main className="min-h-screen" style={{background: 'linear-gradient(135deg, #0f172a 0%, #0f2a1f 50%, #0f172a 100%)'}}>

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800/50">
        <span className="text-xl font-bold text-green-400">⛳ GolfCharity</span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-green-500/20"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
          Monthly draws now open — join today
        </div>

        {/* Main headline */}
        <h1 className="text-6xl font-bold text-white leading-tight mb-6">
          Golf that gives<br/>
          <span className="text-green-400">back to the world.</span>
        </h1>

        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Enter your Stableford scores, compete in monthly prize draws,
          and automatically donate to a charity you believe in —
          all in one platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5"
          >
            Start your subscription →
          </Link>
          <Link
            href="#how-it-works"
            className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-2xl text-lg transition-all"
          >
            See how it works
          </Link>
        </div>

        {/* Social proof numbers */}
        <div className="flex items-center justify-center gap-12 mt-16 pt-12 border-t border-slate-800">
          {[
            { number: '1,200+', label: 'Active players' },
            { number: '₹2.4L+', label: 'Donated to charity' },
            { number: '48', label: 'Draws completed' },
            { number: '5', label: 'Charities supported' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold text-green-400">{stat.number}</p>
              <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-8 py-20">

        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-4">How it works</h2>
          <p className="text-slate-400 text-lg">Three simple steps to play, win, and give.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: '💳',
              title: 'Subscribe',
              description: 'Choose a monthly or yearly plan. A portion of your fee automatically goes to your chosen charity.',
              color: 'from-green-500/10 to-green-500/5',
              border: 'border-green-500/20',
            },
            {
              step: '02',
              icon: '⛳',
              title: 'Enter your scores',
              description: 'Log your last 5 Stableford scores (1–45). Your scores are your draw tickets — every score counts.',
              color: 'from-blue-500/10 to-blue-500/5',
              border: 'border-blue-500/20',
            },
            {
              step: '03',
              icon: '🏆',
              title: 'Win prizes',
              description: 'Match 3, 4, or all 5 numbers in the monthly draw to win your share of the prize pool.',
              color: 'from-amber-500/10 to-amber-500/5',
              border: 'border-amber-500/20',
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`bg-gradient-to-b ${item.color} border ${item.border} rounded-3xl p-8 relative overflow-hidden`}
            >
              {/* Big step number in background */}
              <span className="absolute top-4 right-6 text-7xl font-black text-white/5 select-none">
                {item.step}
              </span>

              <span className="text-4xl mb-4 block">{item.icon}</span>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRIZE POOL BREAKDOWN ── */}
      <section className="max-w-5xl mx-auto px-8 py-20">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-10">

          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-4">Prize pool breakdown</h2>
            <p className="text-slate-400">Every subscription contributes to the monthly pool. Here's how it's split.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { match: '5-number match', share: '40%', label: 'Jackpot', rollover: true, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
              { match: '4-number match', share: '35%', label: 'Major prize', rollover: false, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
              { match: '3-number match', share: '25%', label: 'Entry prize', rollover: false, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
            ].map((tier, i) => (
              <div key={i} className={`border ${tier.bg} rounded-2xl p-6 text-center`}>
                <p className={`text-5xl font-black ${tier.color} mb-2`}>{tier.share}</p>
                <p className="text-white font-semibold text-lg">{tier.label}</p>
                <p className="text-slate-500 text-sm mt-1">{tier.match}</p>
                {tier.rollover && (
                  <span className="inline-block mt-3 bg-amber-400/20 text-amber-400 text-xs px-3 py-1 rounded-full">
                    🔄 Jackpot rolls over if unclaimed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHARITIES SECTION ── */}
      <section className="max-w-5xl mx-auto px-8 py-20">

        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-4">
            Support a cause <span className="text-green-400">you believe in</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Choose a charity at signup. Minimum 10% of your subscription goes directly to them.
          </p>
        </div>

        {/* Charity cards — data comes from our Supabase database */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {charities.length > 0 ? charities.map((charity) => (
            <div
              key={charity.id}
              className="bg-slate-800/40 border border-slate-700/50 hover:border-green-500/30 rounded-2xl p-6 transition-all hover:-translate-y-0.5 group"
            >
              <div className="flex items-start gap-4">
                {/* Charity initial avatar */}
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 font-bold text-lg flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                  {charity.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{charity.name}</h3>
                    {charity.is_featured && (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{charity.description}</p>
                </div>
              </div>
            </div>
          )) : (
            // Fallback if no charities in DB yet
            <p className="text-slate-500 col-span-2 text-center py-8">
              Charities loading...
            </p>
          )}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/signup"
            className="bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-xl shadow-green-500/25 inline-block"
          >
            Choose your charity & subscribe →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800/50 px-8 py-10 mt-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-green-400 font-bold text-lg">⛳ GolfCharity</span>
          <p className="text-slate-600 text-sm">© 2026 GolfCharity. Built for good.</p>
          <div className="flex gap-6">
            <Link href="/login" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Sign in</Link>
            <Link href="/signup" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}