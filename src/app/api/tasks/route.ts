import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleAuthError } from '@/lib/auth'
import { createTaskSchema } from '@/lib/validations/task'
import { Priority } from '@/types/enums'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth()
    const { searchParams } = new URL(req.url)

    const filter = searchParams.get('filter') || 'all'
    const sortParam = searchParams.get('sort') || 'createdAt'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)

    // Whitelist sort columns (BR: prevent injection)
    const allowedSorts = ['priority', 'dueDate', 'createdAt']
    const sort = allowedSorts.includes(sortParam) ? sortParam : 'createdAt'

    const where: any = {
      userId,
      deletedAt: null,
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    if (filter === 'active') {
      where.completedAt = null
    } else if (filter === 'completed') {
      where.completedAt = { not: null }
    } else if (filter === 'overdue') {
      where.completedAt = null
      where.dueDate = { lt: now }
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          subTasks: true,
        },
        orderBy:
          sort === 'priority'
            ? undefined
            : { [sort]: sort === 'dueDate' ? 'asc' : 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ])

    // Custom sort for priority
    if (sort === 'priority') {
      const priorityOrder = {
        [Priority.HIGH]: 0,
        [Priority.MEDIUM]: 1,
        [Priority.LOW]: 2,
      }
      tasks.sort(
        (a, b) =>
          priorityOrder[a.priority as Priority] -
          priorityOrder[b.priority as Priority]
      )
    }

    return NextResponse.json({
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth()
    const body = await req.json()

    const validatedData = createTaskSchema.parse(body)

    // Check active tasks limit (BR-079)
    const activeTasksCount = await prisma.task.count({
      where: {
        userId,
        completedAt: null,
        deletedAt: null,
      },
    })

    if (activeTasksCount >= 200) {
      return NextResponse.json(
        {
          error: 'Unprocessable Entity',
          message: 'Maximum 200 active tasks reached',
        },
        { status: 422 }
      )
    }

    const { subTasks, ...taskData } = validatedData

    const task = await prisma.task.create({
      data: {
        ...taskData,
        userId,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        subTasks: subTasks
          ? {
              create: subTasks.map((st: any) => ({
                title: st.title,
                completedAt: st.completedAt ? new Date(st.completedAt) : null,
              })),
            }
          : undefined,
      },
      include: {
        subTasks: true,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation Error', details: error.errors },
        { status: 400 }
      )
    }
    return handleAuthError(error)
  }
}
