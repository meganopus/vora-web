import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  startOfDay,
  subDays,
  subMonths,
  eachDayOfInterval,
  format,
  getDay,
  getDate,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
} from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const view = searchParams.get('view') || 'weekly'
    const userId = session.user.id

    const today = startOfDay(new Date())
    let startDate: Date
    let endDate = today
    let dataPoints: { date: Date; label: string }[] = []

    // 1. Determine Date Range
    if (view === 'yearly') {
      startDate = startOfMonth(subMonths(today, 11)) // Last 12 months including current
      endDate = endOfMonth(today)
      const months = eachMonthOfInterval({ start: startDate, end: endDate })
      dataPoints = months.map((d) => ({
        date: d,
        label: format(d, 'MMM yyyy'),
      }))
    } else if (view === 'monthly') {
      startDate = subDays(today, 29) // Last 30 days
      const days = eachDayOfInterval({ start: startDate, end: endDate })
      dataPoints = days.map((d) => ({ date: d, label: format(d, 'MMM d') }))
    } else {
      // Weekly (default)
      startDate = subDays(today, 6) // Last 7 days
      const days = eachDayOfInterval({ start: startDate, end: endDate })
      dataPoints = days.map((d) => ({ date: d, label: format(d, 'EEE') })) // e.g., Mon, Tue
    }

    // 2. Fetch Data
    // Fetch all habits to calculate "Total Due"
    // We explicitly set deletedAt: undefined to bypass the default soft-delete filter
    // so we can apply our own logic (include habits deleted within the window)
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        createdAt: { lte: endDate }, // Created before or during the period
        deletedAt: undefined,
        OR: [
          { deletedAt: null },
          { deletedAt: { gt: startDate } }, // Deleted after the period started
        ],
      },
    })

    // Fetch completions in range
    const completions = await prisma.habitCompletion.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // 3. Calculate Stats
    const result = dataPoints.map((point) => {
      const pointDate = point.date
      let totalDue = 0
      let totalCompleted = 0

      if (view === 'yearly') {
        // Aggregate for the whole month
        const monthStart = startOfMonth(pointDate)
        const monthEnd = endOfMonth(pointDate)

        // Find all days in this month that are <= today (don't count future days if in current month)
        const daysInMonth = eachDayOfInterval({
          start: monthStart,
          end: monthEnd,
        }).filter((d) => d <= today)

        daysInMonth.forEach((day) => {
          // Identify habits due on this day
          const habitsDueOnDay = habits.filter((habit) => {
            // Check lifecycle
            if (habit.createdAt > day) return false
            if (habit.deletedAt && habit.deletedAt < day) return false

            // Check Frequency
            if (habit.frequency === 'DAILY') return true
            // Weekly: 0 (Sun) - 6 (Sat)
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

          totalDue += habitsDueOnDay.length

          // Count completions on this day
          const dayString = format(day, 'yyyy-MM-dd')
          const dayCompletions = completions.filter(
            (c) => format(c.date, 'yyyy-MM-dd') === dayString
          )
          totalCompleted += dayCompletions.length
        })
      } else {
        // Single Day calculation (Weekly / Monthly)

        // Identify habits due on this specific day
        const habitsDue = habits.filter((habit) => {
          // Check lifecycle
          if (habit.createdAt > pointDate) return false
          if (habit.deletedAt && habit.deletedAt < pointDate) return false

          // Check Frequency
          if (habit.frequency === 'DAILY') return true
          if (habit.frequency === 'WEEKLY') {
            try {
              return (
                JSON.parse(
                  (habit.weeklyDays as unknown as string) || '[]'
                ) as number[]
              ).includes(getDay(pointDate))
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
              ).includes(getDate(pointDate))
            } catch {
              return false
            }
          }
          return false
        })

        totalDue = habitsDue.length

        // Count completions
        const pointDateString = format(pointDate, 'yyyy-MM-dd')
        const dayCompletions = completions.filter(
          (c) => format(c.date, 'yyyy-MM-dd') === pointDateString
        )
        totalCompleted = dayCompletions.length
      }

      // Avoid division by zero
      const percentage =
        totalDue === 0 ? 0 : Math.round((totalCompleted / totalDue) * 100)

      return {
        date: point.label,
        rate: percentage,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analytics Chart Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
