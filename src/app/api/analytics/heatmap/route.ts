import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  getDate,
  parseISO,
} from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const monthQuery = req.nextUrl.searchParams.get('month') // YYYY-MM

    if (!monthQuery) {
      return NextResponse.json(
        { error: 'Month query parameter is required' },
        { status: 400 }
      )
    }

    const targetDate = parseISO(`${monthQuery}-01`)
    const start = startOfMonth(targetDate)
    const end = endOfMonth(targetDate)
    const days = eachDayOfInterval({ start, end })

    // 1. Fetch habits active during this month
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        // Habit must have been created before or during the month
        createdAt: { lte: end },
        deletedAt: undefined,
        // And not deleted before the month started
        OR: [{ deletedAt: null }, { deletedAt: { gte: start } }],
      },
    })

    // 2. Fetch completions for this month
    const completions = await prisma.habitCompletion.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
        deletedAt: null,
      },
    })

    // Map completions by date string
    const completionsMap = new Map<string, number>()
    completions.forEach((c) => {
      const dateStr = format(c.date, 'yyyy-MM-dd')
      completionsMap.set(dateStr, (completionsMap.get(dateStr) || 0) + 1)
    })

    const heatmapData = days.map((day) => {
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

      const scheduled = habitsDueOnDay.length
      const completed = completionsMap.get(dayStr) || 0
      const rate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0

      return {
        date: dayStr,
        rate,
        completed,
        scheduled,
      }
    })

    return NextResponse.json(heatmapData)
  } catch (error) {
    console.error('Heatmap API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
