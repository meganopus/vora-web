import { addDays, addWeeks, addMonths } from 'date-fns'
import { Recurrence } from '@/types/enums'

/**
 * calculateNextDueDate
 *
 * Calculates the next occurrence date based on the current due date and recurrence type.
 */
export function calculateNextDueDate(
  currentDueDate: Date,
  type: Recurrence,
  rule?: any
): Date {
  switch (type) {
    case Recurrence.DAILY:
      return addDays(currentDueDate, 1)
    case Recurrence.WEEKLY:
      return addWeeks(currentDueDate, 1)
    case Recurrence.MONTHLY:
      return addMonths(currentDueDate, 1)
    case Recurrence.CUSTOM:
      if (rule && typeof rule === 'object') {
        const interval = Number(rule.interval) || 1
        const unit = rule.unit as string

        switch (unit) {
          case 'days':
            return addDays(currentDueDate, interval)
          case 'weeks':
            return addWeeks(currentDueDate, interval)
          case 'months':
            return addMonths(currentDueDate, interval)
        }
      }
      return addDays(currentDueDate, 1) // Fallback to daily
    default:
      return currentDueDate
  }
}

/**
 * processTaskRecurrence
 *
 * Logic to generate a new task instance when a recurring task is completed.
 * Should be called within a Prisma transaction.
 */
export async function processTaskRecurrence(taskId: string, tx: any) {
  const task = await tx.task.findUnique({
    where: { id: taskId },
    include: { subTasks: true },
  })

  // BR-097: Only process if task exists, is recurring, and has a due date
  if (!task || task.recurrence === Recurrence.NONE || !task.dueDate) {
    return null
  }

  // Calculate next date (BR-097)
  const currentDueDate = new Date(task.dueDate)
  const nextDueDate = calculateNextDueDate(
    currentDueDate,
    task.recurrence,
    task.recurrenceRule
  )

  // BR-098: New instance inherits all properties except dueDate and completedAt
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    completedAt: _completedAt,
    originalDueDate: _originalDueDate,
    subTasks,
    ...cloneData
  } = task

  const nextTask = await tx.task.create({
    data: {
      ...cloneData,
      dueDate: nextDueDate,
      originalDueDate: null, // Reset as it's a new instance
      completedAt: null, // Reset completion status
      subTasks: {
        create: subTasks.map((st: any) => ({
          title: st.title,
          sortOrder: st.sortOrder,
          completedAt: null, // Reset sub-task completion state
        })),
      },
    },
  })

  return nextTask
}
