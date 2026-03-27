import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleAuthError } from '@/lib/auth'
import { updateCategorySchema } from '@/lib/validations/category'
import { z } from 'zod'
/**
 * GET /api/categories/[id]
 * Returns a specific category for the authenticated user.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { id } = await params

    const category = await prisma.category.findFirst({
      where: { id, userId, deletedAt: null },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    return handleAuthError(error)
  }
}

/**
 * PATCH /api/categories/[id]
 * Updates a specific category for the authenticated user.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { id } = await params
    const body = await req.json()

    // 1. Validate Input
    const validatedData = updateCategorySchema.parse(body)

    // 2. Check Ownership and Existence
    const category = await prisma.category.findFirst({
      where: { id, userId, deletedAt: null },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // 3. Name uniqueness check if name is being changed
    if (validatedData.name && validatedData.name !== category.name) {
      const existing = await prisma.category.findFirst({
        where: {
          userId,
          name: { contains: validatedData.name },
          deletedAt: null,
          NOT: { id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Category name already exists' },
          { status: 409 }
        )
      }
    }

    // 4. Update Category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(updatedCategory)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    return handleAuthError(error)
  }
}

/**
 * DELETE /api/categories/[id]
 * Soft-deletes a category and reassigns habits to the "Personal" category.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { id } = await params

    // 1. Check Ownership and Existence
    const category = await prisma.category.findFirst({
      where: { id, userId, deletedAt: null },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default category' },
        { status: 400 }
      )
    }

    // 2. Get the "Personal" (default) category ID for this user
    const personalCategory = await prisma.category.findFirst({
      where: { userId, isDefault: true, deletedAt: null },
    })

    if (!personalCategory) {
      return NextResponse.json(
        { error: 'Default category not found' },
        { status: 500 }
      )
    }

    // 3. Reassign habits and soft-delete in a transaction
    await prisma.$transaction(async (tx) => {
      // Reassign habits
      await tx.habit.updateMany({
        where: { categoryId: id, userId },
        data: { categoryId: personalCategory.id },
      })

      // Soft-delete category
      await tx.category.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    return handleAuthError(error)
  }
}
