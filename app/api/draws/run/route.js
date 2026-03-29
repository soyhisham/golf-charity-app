// app/api/draws/run/route.js
// This API route runs the monthly draw.
// Only admins can call this.
// It:
// 1. Generates 5 random winning numbers (1–45)
// 2. Gets all active subscribers and their scores
// 3. Compares each user's scores against winning numbers
// 4. Calculates prize amounts
// 5. Saves results to the database

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    const { adminId, useAlgorithm } = body

    // Verify the requester is an admin
    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Step 1: Generate 5 unique winning numbers (1–45)
    // useAlgorithm = false means pure random (standard lottery)
    // useAlgorithm = true means weighted by most common user scores
    let winningNumbers = []

    if (useAlgorithm) {
      // Algorithmic draw — weighted by most frequent scores across all users
      // This makes the draw more interesting — common scores have higher chance
      const { data: allScores } = await supabaseAdmin
        .from('scores')
        .select('score')

      if (allScores && allScores.length > 0) {
        // Count frequency of each score
        const frequency = {}
        allScores.forEach(({ score }) => {
          frequency[score] = (frequency[score] || 0) + 1
        })

        // Build a weighted pool — more frequent scores appear more times
        const weightedPool = []
        Object.entries(frequency).forEach(([score, count]) => {
          for (let i = 0; i < count; i++) {
            weightedPool.push(parseInt(score))
          }
        })

        // Pick 5 unique numbers from weighted pool
        while (winningNumbers.length < 5 && weightedPool.length > 0) {
          const randomIndex = Math.floor(Math.random() * weightedPool.length)
          const picked = weightedPool[randomIndex]
          if (!winningNumbers.includes(picked)) {
            winningNumbers.push(picked)
          }
        }
      }

      // If not enough unique numbers from algorithm, fill with random
      while (winningNumbers.length < 5) {
        const rand = Math.floor(Math.random() * 45) + 1
        if (!winningNumbers.includes(rand)) {
          winningNumbers.push(rand)
        }
      }
    } else {
      // Pure random draw
      while (winningNumbers.length < 5) {
        const rand = Math.floor(Math.random() * 45) + 1
        if (!winningNumbers.includes(rand)) {
          winningNumbers.push(rand)
        }
      }
    }

    // Step 2: Count active subscribers to calculate prize pool
    const { data: activeSubscribers } = await supabaseAdmin
      .from('profiles')
      .select('id, subscription_plan, charity_percentage')
      .eq('subscription_status', 'active')

    const totalSubscribers = activeSubscribers?.length || 0

    // Calculate total prize pool
    // Each monthly subscriber contributes ₹999, yearly ₹9999/12 = ₹833/month
    // 50% of each subscription goes to prize pool
    let totalPool = 0
    activeSubscribers?.forEach(sub => {
      const monthlyValue = sub.subscription_plan === 'yearly' ? 833 : 999
      const charityPortion = (monthlyValue * sub.charity_percentage) / 100
      const prizePortion = monthlyValue * 0.5 // 50% to prize pool
      totalPool += prizePortion
    })

    // Split pool by match tier
    const jackpotPool = totalPool * 0.40  // 40% for 5-match
    const match4Pool = totalPool * 0.35   // 35% for 4-match
    const match3Pool = totalPool * 0.25   // 25% for 3-match

    // Step 3: Check for existing jackpot rollover
    const { data: lastDraw } = await supabaseAdmin
      .from('draws')
      .select('jackpot_amount, rolled_over')
      .eq('rolled_over', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const rolloverAmount = lastDraw?.jackpot_amount || 0
    const totalJackpot = jackpotPool + rolloverAmount

    // Step 4: Create the draw record
    const drawDate = new Date().toISOString().split('T')[0]
    const { data: draw, error: drawError } = await supabaseAdmin
      .from('draws')
      .insert({
        draw_date: drawDate,
        winning_numbers: winningNumbers,
        status: 'pending', // admin publishes manually
        jackpot_amount: totalJackpot,
        pool_4match: match4Pool,
        pool_3match: match3Pool,
      })
      .select()
      .single()

    if (drawError) {
      return NextResponse.json({ error: drawError.message }, { status: 500 })
    }

    // Step 5: Create prize pool record
    await supabaseAdmin
      .from('prize_pools')
      .insert({
        draw_id: draw.id,
        month: drawDate.substring(0, 7), // e.g. "2026-03"
        total_pool: totalPool,
        jackpot_pool: totalJackpot,
        match4_pool: match4Pool,
        match3_pool: match3Pool,
        active_subscribers: totalSubscribers,
      })

    // Step 6: Get all users with scores and check for matches
    const { data: usersWithScores } = await supabaseAdmin
      .from('scores')
      .select('user_id, score')

    // Group scores by user
    const userScoreMap = {}
    usersWithScores?.forEach(({ user_id, score }) => {
      if (!userScoreMap[user_id]) userScoreMap[user_id] = []
      userScoreMap[user_id].push(score)
    })

    // Check each user's scores against winning numbers
    const results = []
    let fiveMatchCount = 0
    let fourMatchCount = 0
    let threeMatchCount = 0

    Object.entries(userScoreMap).forEach(([userId, userScores]) => {
      const matchedNumbers = userScores.filter(s => winningNumbers.includes(s))
      const matchCount = matchedNumbers.length

      if (matchCount >= 3) {
        results.push({
          draw_id: draw.id,
          user_id: userId,
          matched_numbers: matchedNumbers,
          match_count: matchCount,
          prize_amount: 0, // calculated after counting all winners
          payment_status: 'pending',
          verified: false,
        })

        if (matchCount === 5) fiveMatchCount++
        else if (matchCount === 4) fourMatchCount++
        else if (matchCount === 3) threeMatchCount++
      }
    })

    // Step 7: Calculate prize per winner in each tier
    // Prize is split equally among winners in the same tier
    results.forEach(result => {
      if (result.match_count === 5) {
        result.prize_amount = fiveMatchCount > 0
          ? totalJackpot / fiveMatchCount
          : 0
      } else if (result.match_count === 4) {
        result.prize_amount = fourMatchCount > 0
          ? match4Pool / fourMatchCount
          : 0
      } else if (result.match_count === 3) {
        result.prize_amount = threeMatchCount > 0
          ? match3Pool / threeMatchCount
          : 0
      }
    })

    // Step 8: Handle jackpot rollover if no 5-match winner
    if (fiveMatchCount === 0) {
      await supabaseAdmin
        .from('draws')
        .update({ rolled_over: true })
        .eq('id', draw.id)
    }

    // Step 9: Save all results
    if (results.length > 0) {
      await supabaseAdmin
        .from('draw_results')
        .insert(results)
    }

    return NextResponse.json({
      success: true,
      drawId: draw.id,
      winningNumbers,
      totalPool: totalPool.toFixed(0),
      winners: {
        fiveMatch: fiveMatchCount,
        fourMatch: fourMatchCount,
        threeMatch: threeMatchCount,
      },
      jackpotRolledOver: fiveMatchCount === 0,
      rolloverAmount: rolloverAmount,
    })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}