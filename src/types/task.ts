import { Priority, Recurrence } from '@/types/enums'

export interface SubTask {
  id: string
  taskId: string
  title: string
  completedAt: string | null
  sortOrder: number
  createdAt: string
}

export interface Task {
  id: string
  userId: string
  title: string
  description: string | null
  priority: Priority
  dueDate: string | null
  originalDueDate: string | null
  recurrence: Recurrence
  recurrenceRule: any
  autoPostpone: boolean
  completedAt: string | null
  sortOrder: number
  parentTaskId: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  subTasks?: SubTask[]
}
