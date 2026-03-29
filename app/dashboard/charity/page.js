// app/dashboard/charity/page.js
// Shows the user their current charity and lets them
// update their donation percentage or switch charity.

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function CharityPage() {
  const [profile, setProfile] = useState(null)
  const [charities, setCharities] = useState([])
  const [currentCharity, setCurrentCharity] = useState(null)
  const [selectedCharity, setSelectedCharity] = useState('')
  const [percentage, setPercentage] = useState(10)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)
      setSelectedCharity(profileData?.charity_id || '')
      setPercentage(profileData?.charity_percentage || 10)

      const { data: charitiesData } = await supabase
        .from('charities')
        .select('*')

      setCharities(charitiesData || [])

      if (profileData?.charity_id) {
        const charity = charitiesData?.find(c => c.id === profileData.charity_id)
        setCurrentCharity(charity)
      }

      setLoading(false)
    }
    init()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSuccess('')

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('profiles')
      .update({
        charity_id: selectedCharity,
        charity_percentage: percentage,
      })
      .eq('id', user.id)

    if (!error) {
      const updated = charities.find(c => c.id === selectedCharity)
      setCurrentCharity(updated)
      setSuccess('Charity preferences saved!')
      setTimeout(() => setSuccess(''), 3000)
    }

    setSaving(false)
  }

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

  const planPrice = profile?.subscription_plan === 'yearly' ? 9999 : 999
  const donationAmount = ((planPrice * percentage) / 100).toFixed(0)

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-white">My Charity ❤️</h1>
        <p className="text-slate-400 mt-1">
          Manage which charity receives your donation and how much.
        </p>
      </div>

      {/* Current charity highlight */}
      {currentCharity && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
          <p className="text-slate-400 text-sm mb-3">Currently supporting</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400 font-black text-2xl">
              {currentCharity.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">{currentCharity.name}</h2>
              <p className="text-slate-400 text-sm mt-0.5">{currentCharity.description}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-3 text-center">
              <p className="text-green-400 font-black text-2xl">₹{donationAmount}</p>
              <p className="text-slate-500 text-xs">Your donation this period</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl px-5 py-3 text-center">
              <p className="text-white font-black text-2xl">{percentage}%</p>
              <p className="text-slate-500 text-xs">Of your subscription</p>
            </div>
          </div>
        </div>
      )}

      {/* Change settings */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-6">Update preferences</h2>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
            <span>✅</span> {success}
          </div>
        )}

        <div className="space-y-6">

          {/* Charity selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Choose a charity
            </label>
            <div className="grid grid-cols-1 gap-3">
              {charities.map((charity) => (
                <button
                  key={charity.id}
                  onClick={() => setSelectedCharity(charity.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                    selectedCharity === charity.id
                      ? 'border-green-400/50 bg-green-500/10'
                      : 'border-slate-700 bg-slate-900/30 hover:border-slate-500'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedCharity === charity.id ? 'border-green-400' : 'border-slate-600'
                  }`}>
                    {selectedCharity === charity.id && (
                      <div className="w-2.5 h-2.5 bg-green-400 rounded-full"/>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{charity.name}</p>
                    <p className="text-slate-500 text-sm">{charity.description?.substring(0, 60)}...</p>
                  </div>
                  {charity.is_featured && (
                    <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full flex-shrink-0">
                      ⭐ Featured
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Percentage slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-slate-300">
                Donation percentage
              </label>
              <span className="text-green-400 font-bold">
                {percentage}% — ₹{donationAmount}/period
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full accent-green-400"
            />
            <div className="flex justify-between text-slate-600 text-xs mt-1">
              <span>Minimum 10%</span>
              <span>Maximum 50%</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-900 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* All charities info */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-white font-medium mb-1">About our charity partners</h3>
        <p className="text-slate-400 text-sm">
          100% of your chosen donation percentage goes directly to the charity.
          GolfCharity takes no commission on charity contributions.
        </p>
      </div>

    </div>
  )
}