import { Habit, HabitCompletion } from '@prisma/client'
import { format } from 'date-fns'

interface StreakResult {
  currentStreak: number
  longestStreak: number
  totalCompletions: number
}

/**
 * Calculates streak statistics for a habit.
 */
export function calculateStreaks(
  habit: Habit,
  completions: HabitCompletion[],
  referenceDate: Date = new Date()
): StreakResult {
  if (!completions || completions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
    }
  }

  // Filter out soft-deleted completions
  const validCompletions = completions.filter((c) => !c.deletedAt)

  // Sort completions by date ascending
  const sortedCompletions = [...validCompletions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  if (sortedCompletions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 }
  }

  // Determine calculation range: from first completion to "Today"
  // CRITICAL: We normalize everything to Abstract Date strings (YYYY-MM-DD) treated as UTC Midnight
  // to ensures checks are consistent regardless of server timezone shifts.

  // 1. First completion date (DB stores as UTC midnight)
  const firstCompletion = new Date(sortedCompletions[0].date) // Already UTC midnight

  // 2. Reference Date ("Today") normalized to UTC Midnight based on Local Date
  // If server is UTC, this is UTC date. If server is EST, this is EST date.
  // We accept the server's local date as "The Date".
  // NOTE: This assumes user and server are in sync or consistent.
  const todayLocalStr = format(referenceDate, 'yyyy-MM-dd')
  const todayUtc = new Date(todayLocalStr) // Parses 'YYYY-MM-DD' as UTC midnight in JS

  // Verify range validity
  if (firstCompletion > todayUtc) {
    // If only completions are in future, stats relative to today are 0
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: sortedCompletions.length,
    }
  }

  // 3. Generate all days in interval using safe manual iteration (UTC only)
  // This avoids date-fns eachDayOfInterval potential local timezone behaviors
  const allDays: Date[] = []
  const current = new Date(firstCompletion)

  // Safety break to prevent infinite loops if something is weird
  // Max 10 years (3650 days)
  let sanityCounter = 0
  const MAX_DAYS = 3650

  while (current <= todayUtc && sanityCounter < MAX_DAYS) {
    allDays.push(new Date(current))
    // Move to next day safely in UTC
    current.setUTCDate(current.getUTCDate() + 1)
    sanityCounter++
  }

  // 4. Map DB completions to YYYY-MM-DD strings for lookup
  const completedDates = new Set(
    sortedCompletions.map((c) => new Date(c.date).toISOString().split('T')[0])
  )

  // 5. Filter for SCHEDULED days based on frequency (using UTC components)
  const scheduledDays = allDays.filter((day) => isScheduled(habit, day))

  // 6. Calculate streaks
  let currentStreak = 0
  let maxStreak = 0
  let tempStreak = 0

  // Longest Streak (scan forward)
  for (const day of scheduledDays) {
    const dayStr = day.toISOString().split('T')[0]
    const isCompleted = completedDates.has(dayStr)

    if (isCompleted) {
      tempStreak++
    } else {
      tempStreak = 0
    }

    if (tempStreak > maxStreak) {
      maxStreak = tempStreak
    }
  }

  // Current Streak (scan backward from "Today")
  const todayStr = todayUtc.toISOString().split('T')[0]

  for (let i = scheduledDays.length - 1; i >= 0; i--) {
    const day = scheduledDays[i]
    const dayStr = day.toISOString().split('T')[0]
    const isCompleted = completedDates.has(dayStr)
    const isTodayDate = dayStr === todayStr

    if (isCompleted) {
      currentStreak++
    } else {
      if (isTodayDate) {
        // Today is scheduled but not completed.
        // Streak continues from yesterday.
        continue
      } else {
        // Break streak
        break
      }
    }
  }

  return {
    currentStreak,
    longestStreak: maxStreak,
    totalCompletions: sortedCompletions.length,
  }
}

function isScheduled(habit: Habit, date: Date): boolean {
  if (habit.frequency === 'DAILY') return true

  if (habit.frequency === 'WEEKLY') {
    if (!habit.weeklyDays || habit.weeklyDays.length === 0) return false
    const dayOfWeek = date.getUTCDay() // 0=Sun...
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    try {
      return (
        JSON.parse((habit.weeklyDays as unknown as string) || '[]') as number[]
      ).includes(adjustedDay)
    } catch {
      return false
    }
  }

  if (habit.frequency === 'MONTHLY') {
    if (!habit.monthlyDates || habit.monthlyDates.length === 0) return false
    const dom = date.getUTCDate()
    try {
      return (
        JSON.parse(
          (habit.monthlyDates as unknown as string) || '[]'
        ) as number[]
      ).includes(dom)
    } catch {
      return false
    }
  }

  return false
}
