import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleAuthError } from '@/lib/auth'
import {
  createMoodCheckinSchema,
  moodQuerySchema,
} from '@/lib/validations/mood'
import { Mood, Activity } from '@/types/enums'
import { startOfDay } from 'date-fns'

export async function GET(req: Request) {
  try {
    const { userId } = await requireAuth()
    const { searchParams } = new URL(req.url)
    const query = moodQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    )

    const where: any = { userId, deletedAt: null }

    if (query.date) {
      where.date = { equals: startOfDay(new Date(query.date)) }
    } else if (query.from && query.to) {
      where.date = {
        gte: startOfDay(new Date(query.from)),
        lte: startOfDay(new Date(query.to)),
      }
    }

    const moodCheckins = await prisma.moodCheckin.findMany({
      where,
      include: {
        habit: {
          select: { name: true, color: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(moodCheckins)
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await requireAuth()
    const body = await req.json()
    const validatedData = createMoodCheckinSchema.parse(body)

    const date = startOfDay(new Date(validatedData.date))

    // Determine isPositive based on mood
    // BR-061: happy/proud = true, others = false
    const isPositive = ['HAPPY', 'PROUD'].includes(validatedData.mood)

    // 1. Find the completion first
    // We need a completion to exist to link the mood check-in.
    const completion = await prisma.habitCompletion.findFirst({
      where: {
        habitId: validatedData.habitId,
        userId,
        date,
        deletedAt: null,
      },
    })

    if (!completion) {
      return NextResponse.json(
        { error: 'Cannot add mood check-in for uncompleted habit' },
        { status: 422 }
      )
    }

    // 2. Upsert mood check-in
    // If it exists for this habit/date, update it. Otherwise create.
    const moodCheckin = await prisma.moodCheckin.upsert({
      where: {
        habitId_date: {
          habitId: validatedData.habitId,
          date,
        },
      },
      update: {
        mood: validatedData.mood as Mood,
        isPositive,
        reflectionText: validatedData.reflectionText || null,
        // validatedData.selectedActivity is already transformed to Enum value by Zod or null/undefined
        selectedActivity: (validatedData.selectedActivity as Activity) || null,
        deletedAt: null, // Restore if it was soft-deleted
        completionId: completion.id, // Ensure it's linked to the correct completion (should be same)
      },
      create: {
        userId,
        habitId: validatedData.habitId,
        completionId: completion.id,
        date,
        mood: validatedData.mood as Mood,
        isPositive,
        reflectionText: validatedData.reflectionText || null,
        selectedActivity: (validatedData.selectedActivity as Activity) || null,
      },
    })

    return NextResponse.json(moodCheckin)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const firstError = (error as any).issues[0]
      return NextResponse.json({ error: firstError.message }, { status: 422 })
    }
    return handleAuthError(error)
  }
}
