// app/subscribe/page.js
// This page lets users pick a subscription plan.
// Since we're mocking payment, clicking "Subscribe" will
// directly activate their account in Supabase.

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [charities, setCharities] = useState([])
  const [selectedCharity, setSelectedCharity] = useState('')
  const [charityPercentage, setCharityPercentage] = useState(10)
  const [loading, setLoading] = useState(false) 
  const router = useRouter()

  useEffect(() => {
    // Get the currently logged in user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check if already subscribed — skip this page
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single()

      if (profile?.subscription_status === 'active') {
        router.push('/dashboard')
        return
      }
    }

    // Fetch charities for the dropdown
    const getCharities = async () => {
      const { data } = await supabase.from('charities').select('*')
      setCharities(data || [])
      if (data?.length > 0) setSelectedCharity(data[0].id)
    }

    getUser()
    getCharities()
  }, [])

  const plans = {
    monthly: {
      price: 999,
      label: 'Monthly',
      period: 'per month',
      description: 'Billed every month. Cancel anytime.',
      badge: null,
    },
    yearly: {
      price: 9999,
      label: 'Yearly',
      period: 'per year',
      description: 'Save ₹989 compared to monthly billing.',
      badge: 'Best Value',
    }
  }

  const handleSubscribe = async () => {
  if (!selectedCharity) {
    alert('Please select a charity to continue.')
    return
  }

  setLoading(true)

  const startDate = new Date()
  const endDate = new Date()
  if (selectedPlan === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1)
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1)
  }

  // First check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    alert('You are not logged in. Please login again.')
    router.push('/login')
    return
  }

  console.log('Updating profile for user:', user.id) // debug

  const { data, error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_plan: selectedPlan,
      subscription_start: startDate.toISOString().split('T')[0],
      subscription_end: endDate.toISOString().split('T')[0],
      charity_id: selectedCharity,
      charity_percentage: charityPercentage,
      razorpay_payment_id: 'mock_' + Date.now(),
    })
    .eq('id', user.id)
    .select() // this makes Supabase return the updated row

  console.log('Update result:', data, error) // debug

  if (error) {
    alert('Update failed: ' + error.message)
    setLoading(false)
    return
  }

  router.push('/dashboard?subscribed=true')
}

  const selectedPlanData = plans[selectedPlan]
  const charityAmount = ((selectedPlanData.price * charityPercentage) / 100).toFixed(0)
  const prizeAmount = (selectedPlanData.price * 0.5).toFixed(0)

  return (
    <div className="min-h-screen py-12 px-4" style={{background: 'linear-gradient(135deg, #0f172a 0%, #0f2a1f 50%, #0f172a 100%)'}}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <a href="/" className="text-green-400 font-bold text-xl">⛳ GolfCharity</a>
          <h1 className="text-4xl font-bold text-white mt-6 mb-3">
            Choose your plan
          </h1>
          <p className="text-slate-400 text-lg">
            Subscribe to enter monthly draws and support your charity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Plan selection (takes 2 columns) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Plan cards */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(plans).map(([key, plan]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlan(key)}
                  className={`relative p-6 rounded-2xl border text-left transition-all ${
                    selectedPlan === key
                      ? 'border-green-400 bg-green-400/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
                  }`}
                >
                  {/* Best value badge */}
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  )}

                  {/* Selected indicator */}
                  <div className={`w-5 h-5 rounded-full border-2 mb-4 flex items-center justify-center ${
                    selectedPlan === key ? 'border-green-400' : 'border-slate-600'
                  }`}>
                    {selectedPlan === key && (
                      <div className="w-2.5 h-2.5 bg-green-400 rounded-full"/>
                    )}
                  </div>

                  <p className="text-white font-semibold text-lg">{plan.label}</p>
                  <p className="text-green-400 font-black text-3xl mt-1">
                    ₹{plan.price.toLocaleString()}
                  </p>
                  <p className="text-slate-500 text-sm">{plan.period}</p>
                  <p className="text-slate-400 text-xs mt-2">{plan.description}</p>
                </button>
              ))}
            </div>

            {/* Charity selection */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4">
                ❤️ Choose your charity
              </h3>

              <select
                value={selectedCharity}
                onChange={(e) => setSelectedCharity(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400/70 mb-4"
              >
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id} className="bg-slate-900">
                    {charity.name}
                  </option>
                ))}
              </select>

              {/* Charity percentage slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-slate-400 text-sm">
                    Donation percentage
                  </label>
                  <span className="text-green-400 font-semibold">
                    {charityPercentage}% (₹{charityAmount})
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={charityPercentage}
                  onChange={(e) => setCharityPercentage(Number(e.target.value))}
                  className="w-full accent-green-400"
                />
                <div className="flex justify-between text-slate-600 text-xs mt-1">
                  <span>Min 10%</span>
                  <span>Max 50%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right — Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 sticky top-6">
              <h3 className="text-white font-semibold text-lg mb-6">
                Order summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan</span>
                  <span className="text-white">{selectedPlanData.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Prize pool</span>
                  <span className="text-green-400">+₹{prizeAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Charity donation</span>
                  <span className="text-green-400">₹{charityAmount}</span>
                </div>
                <div className="h-px bg-slate-700"/>
                <div className="flex justify-between text-lg">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-white font-bold">
                    ₹{selectedPlanData.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* What you get */}
              <div className="space-y-2 mb-6">
                {[
                  'Monthly draw entry',
                  'Score tracking dashboard',
                  'Charity contribution',
                  'Winner prize eligibility',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-green-400 text-sm">✓</span>
                    <span className="text-slate-400 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-900 disabled:text-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Activating...
                  </span>
                ) : `Subscribe for ₹${selectedPlanData.price.toLocaleString()}`}
              </button>

              <p className="text-slate-600 text-xs text-center mt-4">
                🔒 Demo mode — no real payment taken
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}