import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  startOfDay,
  eachDayOfInterval,
  format,
  getDay,
  getDate,
} from 'date-fns'

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const today = startOfDay(new Date())

    // 1. Fetch all habits for the user (including soft-deleted ones if they had completions)
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        deletedAt: undefined,
        // We want to calculate stats for all time, so we need habits that were active at some point.
      },
    })

    if (habits.length === 0) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        perfectDays: 0,
        activeDays: 0,
      })
    }

    // 2. Determine the date range for all-time stats
    // We look at the first habit creation date or first completion.
    const firstHabit = await prisma.habit.findFirst({
      where: { userId, deletedAt: undefined },
      orderBy: { createdAt: 'asc' },
    })

    const firstCompletion = await prisma.habitCompletion.findFirst({
      where: { userId, deletedAt: undefined },
      orderBy: { date: 'asc' },
    })

    if (!firstHabit && !firstCompletion) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        perfectDays: 0,
        activeDays: 0,
      })
    }

    const startDate = startOfDay(
      firstCompletion?.date && firstHabit?.createdAt
        ? firstCompletion.date < firstHabit.createdAt
          ? firstCompletion.date
          : firstHabit.createdAt
        : firstHabit?.createdAt || firstCompletion?.date || new Date()
    )

    const days = eachDayOfInterval({ start: startDate, end: today })

    // 3. Fetch all completions for the user
    const completions = await prisma.habitCompletion.findMany({
      where: {
        userId,
        deletedAt: null,
      },
    })

    // Map completions by date string for easy lookup
    const completionsMap = new Map<string, number>()
    completions.forEach((c) => {
      const dateStr = format(c.date, 'yyyy-MM-dd')
      completionsMap.set(dateStr, (completionsMap.get(dateStr) || 0) + 1)
    })

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let perfectDays = 0
    let activeDays = 0

    // Iterate through all days from start to today
    for (const day of days) {
      const dayStr = format(day, 'yyyy-MM-dd')
      const habitsDueOnDay = habits.filter((habit) => {
        // Check if habit existed on this day
        if (habit.createdAt > day) return false
        if (habit.deletedAt && habit.deletedAt < day) return false

        // Check Frequency
        if (habit.frequency === 'DAILY') return true
        if (habit.frequency === 'WEEKLY') {
          try {
            return (
              JSON.parse(
                (habit.weeklyDays as unknown as string) || '[]'
              ) as number[]
            ).includes(getDay(day))
          } catch {
            return false
          }
        }
        if (habit.frequency === 'MONTHLY') {
          try {
            return (
              JSON.parse(
                (habit.monthlyDates as unknown as string) || '[]'
              ) as number[]
            ).includes(getDate(day))
          } catch {
            return false
          }
        }
        return false
      })

      const scheduledCount = habitsDueOnDay.length
      const completedCount = completionsMap.get(dayStr) || 0

      if (scheduledCount > 0) {
        if (completedCount >= scheduledCount) {
          // Perfect day (at least all scheduled are completed)
          perfectDays++
          tempStreak++
        } else {
          // Not a perfect day
          // Only reset streak if it's not "today" (today might not be finished yet)
          if (dayStr !== format(today, 'yyyy-MM-dd')) {
            tempStreak = 0
          }
        }
      } else {
        // No habits scheduled. Streak continues (doesn't break, but doesn't increment)
        // This handles weekends/off-days naturally.
      }

      if (completedCount > 0) {
        activeDays++
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
    }

    currentStreak = tempStreak

    return NextResponse.json({
      currentStreak,
      longestStreak,
      perfectDays,
      activeDays,
    })
  } catch (error) {
    console.error('Analytics Stats Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
