import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleAuthError } from '@/lib/auth'
import { updateHabitSchema } from '@/lib/validations/habit'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { id } = await params

    const habit = await prisma.habit.findFirst({
      where: { id, userId, deletedAt: null },
      include: { category: true },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    return NextResponse.json(habit)
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { id } = await params
    const body = await req.json()

    // Validate request
    const validatedData = updateHabitSchema.parse(body)

    // Check if habit exists and belongs to user
    const existingHabit = await prisma.habit.findFirst({
      where: { id, userId, deletedAt: null },
    })

    if (!existingHabit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    // BR-028: Frequency type cannot be changed after creation
    if (
      (body as any).frequency &&
      (body as any).frequency !== existingHabit.frequency
    ) {
      return NextResponse.json(
        { error: 'Frequency type cannot be changed after creation' },
        { status: 422 }
      )
    }

    // If changing category, check ownership
    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: validatedData.categoryId, userId, deletedAt: null },
      })
      if (!category) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 422 })
      }
    }

    const { weeklyDays, monthlyDates, ...restData } = validatedData
    // Update habit
    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: {
        ...restData,
        weeklyDays: weeklyDays ? JSON.stringify(weeklyDays) : undefined,
        monthlyDates: monthlyDates ? JSON.stringify(monthlyDates) : undefined,
      },
      include: { category: true },
    })

    return NextResponse.json(updatedHabit)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const firstError = (error as any).issues[0]
      return NextResponse.json({ error: firstError.message }, { status: 422 })
    }
    return handleAuthError(error)
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { id } = await params

    const habit = await prisma.habit.findFirst({
      where: { id, userId, deletedAt: null },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    // Soft delete
    await prisma.habit.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: 'Habit deleted successfully' })
  } catch (error) {
    return handleAuthError(error)
  }
}
