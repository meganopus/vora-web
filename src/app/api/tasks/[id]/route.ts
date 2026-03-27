import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleAuthError } from '@/lib/auth'
import { Recurrence } from '@/types/enums'
import { updateTaskSchema } from '@/lib/validations/task'
import { processTaskRecurrence } from '@/lib/services/recurrence'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { id } = await params

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        subTasks: true,
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { id } = await params
    const body = await req.json()

    const validatedData = updateTaskSchema.parse(body)

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Task not found' },
        { status: 404 }
      )
    }

    const { subTasks, ...taskData } = validatedData
    const { searchParams } = new URL(req.url)
    const scope = searchParams.get('scope') || 'future'

    if (scope === 'this' && existingTask.recurrence !== Recurrence.NONE) {
      taskData.recurrence = Recurrence.NONE
      ;(taskData as any).recurrenceRule = null
    }

    // Transaction to handle subtasks update
    const updatedTask = await prisma.$transaction(async (tx) => {
      // Update main task
      await tx.task.update({
        where: { id },
        data: {
          ...taskData,
          dueDate:
            taskData.dueDate === null
              ? null
              : taskData.dueDate
                ? new Date(taskData.dueDate)
                : undefined,
          completedAt:
            taskData.completedAt === null
              ? null
              : taskData.completedAt
                ? new Date(taskData.completedAt)
                : undefined,
        },
      })

      // Handle recurrence logic (BR-097)
      const isPreviouslyCompleted = !!existingTask.completedAt
      const isNowCompleted =
        taskData.completedAt !== undefined && taskData.completedAt !== null
      if (!isPreviouslyCompleted && isNowCompleted) {
        await processTaskRecurrence(id, tx)
      }

      // Handle subtasks if provided
      if (subTasks) {
        // Delete removed subtasks
        const keepIds = subTasks
          .filter((st: any) => st.id)
          .map((st: any) => st.id)
        await tx.subTask.deleteMany({
          where: {
            taskId: id,
            id: { notIn: keepIds },
          },
        })

        // Upsert/Create
        for (const st of subTasks) {
          if (st.id) {
            await tx.subTask.update({
              where: { id: st.id },
              data: {
                title: st.title,
                completedAt: st.completedAt ? new Date(st.completedAt) : null,
              },
            })
          } else {
            await tx.subTask.create({
              data: {
                taskId: id,
                title: st.title,
                completedAt: st.completedAt ? new Date(st.completedAt) : null,
              },
            })
          }
        }
      }

      return tx.task.findUnique({
        where: { id },
        include: { subTasks: true },
      })
    })

    return NextResponse.json(updatedTask)
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { id } = await params

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Task not found' },
        { status: 404 }
      )
    }

    await prisma.task.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    return handleAuthError(error)
  }
}
