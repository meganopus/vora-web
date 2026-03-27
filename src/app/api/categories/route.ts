import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleAuthError } from '@/lib/auth'
import { createCategorySchema } from '@/lib/validations/category'
import { z } from 'zod'

/**
 * GET /api/categories
 * Returns a list of categories for the authenticated user with habit counts.
 */
export async function GET() {
  try {
    const { userId } = await requireAuth()

    const categories = await prisma.category.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            habits: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    // Formatting response to include habitCount
    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      defaultColor: cat.defaultColor,
      isDefault: cat.isDefault,
      sortOrder: cat.sortOrder,
      habitCount: cat._count.habits,
    }))

    return NextResponse.json(formattedCategories)
  } catch (error) {
    return handleAuthError(error)
  }
}

/**
 * POST /api/categories
 * Creates a new category for the authenticated user.
 */
export async function POST(req: Request) {
  try {
    const { userId } = await requireAuth()
    const body = await req.json()

    // 1. Validate Input
    const validatedData = createCategorySchema.parse(body)

    // 2. Enforce 20-category limit
    const count = await prisma.category.count({
      where: { userId, deletedAt: null },
    })

    if (count >= 20) {
      return NextResponse.json(
        { error: 'Maximum 20 categories reached' },
        { status: 422 }
      )
    }

    // 3. Check for uniqueness (case-insensitive)
    const existing = await prisma.category.findFirst({
      where: {
        userId,
        name: { equals: validatedData.name },
        deletedAt: null,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      )
    }

    // 4. Determine sort_order (max + 1)
    const lastCategory = await prisma.category.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { sortOrder: 'desc' },
    })
    const sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 0

    // 5. Create Category
    const category = await prisma.category.create({
      data: {
        ...validatedData,
        userId,
        sortOrder,
      },
    })

    return NextResponse.json(category, { status: 201 })
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
