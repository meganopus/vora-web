import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TaskCard } from '@/components/task/TaskCard'
import { Priority, Recurrence } from '@/types/enums'
import { addDays, subDays, format } from 'date-fns'

import styles from '@/components/task/TaskCard.module.css'

// We don't need the manual vi.mock for styles anymore if we use the imported ones
// but let's see if we can just fix the assertions.

const mockTaskBase = {
  id: '1',
  userId: 'u1',
  title: 'Test Task',
  description: 'Desc',
  priority: Priority.MEDIUM,
  dueDate: new Date().toISOString(),
  originalDueDate: null,
  recurrence: Recurrence.NONE,
  recurrenceRule: null,
  autoPostpone: false,
  completedAt: null,
  sortOrder: 0,
  parentTaskId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  subTasks: [],
}

describe('TaskCard', () => {
  it('renders task title and priority', () => {
    render(<TaskCard task={mockTaskBase} />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('MEDIUM')).toBeInTheDocument()
  })

  it('renders "Today" for tasks due today', () => {
    render(<TaskCard task={mockTaskBase} />)
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('renders formatted date for future tasks', () => {
    const tomorrow = addDays(new Date(), 1)
    const task = { ...mockTaskBase, dueDate: tomorrow.toISOString() }
    render(<TaskCard task={task} />)
    expect(screen.getByText(format(tomorrow, 'MMM d'))).toBeInTheDocument()
  })

  it('renders overdue indicator for overdue tasks (BR-080)', () => {
    const yesterday = subDays(new Date(), 1)
    const task = { ...mockTaskBase, dueDate: yesterday.toISOString() }
    render(<TaskCard task={task} />)

    expect(screen.getByText(/1 day overdue/i)).toBeInTheDocument()
    // Check if overdue class is applied
    const dateText = screen.getByText(format(yesterday, 'MMM d'))
    expect(dateText.parentElement).toHaveClass(styles.overdueText)
  })

  it('renders sub-task progress (BR-086)', () => {
    const task = {
      ...mockTaskBase,
      subTasks: [
        {
          id: 's1',
          taskId: '1',
          title: 'S1',
          completedAt: new Date().toISOString(),
          sortOrder: 0,
          createdAt: '',
        },
        {
          id: 's2',
          taskId: '1',
          title: 'S2',
          completedAt: null,
          sortOrder: 1,
          createdAt: '',
        },
      ],
    }
    render(<TaskCard task={task} />)
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('renders recurrence icon (BR-099)', () => {
    const task = { ...mockTaskBase, recurrence: Recurrence.DAILY }
    const { container } = render(<TaskCard task={task} />)
    // Repeat icon from lucide-react (svg)
    expect(container.querySelector('svg.lucide-repeat')).toBeInTheDocument()
  })

  it('calls onToggle when checkbox is clicked', () => {
    const onToggle = vi.fn()
    render(<TaskCard task={mockTaskBase} onToggle={onToggle} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(onToggle).toHaveBeenCalledWith('1', true)
  })

  it('calls onEdit when card is clicked', () => {
    const onEdit = vi.fn()
    render(<TaskCard task={mockTaskBase} onEdit={onEdit} />)

    // Click the whole content area
    fireEvent.click(screen.getByText('Test Task'))

    expect(onEdit).toHaveBeenCalledWith('1')
  })

  it('applies completed styles when task is done', () => {
    const task = { ...mockTaskBase, completedAt: new Date().toISOString() }
    render(<TaskCard task={task} />)

    expect(screen.getByText('Test Task')).toHaveClass(styles.titleCompleted)
  })

  it('dispatches analytics event on completion (BR-088)', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    render(<TaskCard task={mockTaskBase} onToggle={() => {}} />)

    fireEvent.click(screen.getByRole('checkbox'))

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent))
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent
    expect(event.type).toBe('task_completed')
    expect(event.detail).toEqual({ taskId: '1', title: 'Test Task' })
  })
})
