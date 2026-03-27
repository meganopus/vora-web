import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, getDay, getDate, parseISO } from 'date-fns'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date: dateParam } = await params
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id as string

    const targetDate = startOfDay(parseISO(dateParam))

    // 1. Fetch habits active on this specific date
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        createdAt: { lte: targetDate },
        deletedAt: undefined,
        OR: [{ deletedAt: null }, { deletedAt: { gte: targetDate } }],
      },
    })

    // 2. Fetch completions for this date
    const completions = await prisma.habitCompletion.findMany({
      where: {
        userId,
        date: targetDate,
        deletedAt: null,
      },
      select: {
        habitId: true,
      },
    })

    const completedHabitIds = new Set(completions.map((c) => c.habitId))

    const drillDownData = habits
      .filter((habit) => {
        // Check Frequency
        if (habit.frequency === 'DAILY') return true
        if (habit.frequency === 'WEEKLY') {
          try {
            return (
              JSON.parse(
                (habit.weeklyDays as unknown as string) || '[]'
              ) as number[]
            ).includes(getDay(targetDate))
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
            ).includes(getDate(targetDate))
          } catch {
            return false
          }
        }
        return false
      })
      .map((habit) => ({
        id: habit.id,
        name: habit.name,
        completed: completedHabitIds.has(habit.id),
        color: habit.color,
        emoji: null, // Habit doesn't have emoji field in schema
      }))

    return NextResponse.json({
      date: dateParam,
      habits: drillDownData,
    })
  } catch (error) {
    console.error('Heatmap Drill-Down API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
