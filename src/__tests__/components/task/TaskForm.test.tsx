import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskForm } from '@/components/features/tasks/TaskForm'
import { Priority, Recurrence } from '@/types/enums'

import styles from '@/components/features/tasks/TaskForm.module.css'

// Mock DatePicker to just be an input
vi.mock('@/components/ui/DatePicker', () => ({
  DatePicker: ({ selectedDate, onDateChange }: any) => (
    <input
      data-testid="date-picker"
      value={selectedDate ? selectedDate.toISOString() : ''}
      onChange={(e) => onDateChange(new Date(e.target.value))}
    />
  ),
}))

const mockInitialData = {
  id: '1',
  userId: 'u1',
  title: 'Original Title',
  description: 'Original Desc',
  priority: Priority.HIGH,
  dueDate: '2025-10-10T00:00:00.000Z',
  originalDueDate: null,
  recurrence: Recurrence.NONE,
  recurrenceRule: null,
  autoPostpone: false,
  completedAt: null,
  sortOrder: 0,
  parentTaskId: null,
  createdAt: '',
  updatedAt: '',
  deletedAt: null,
  subTasks: [
    {
      id: 's1',
      taskId: '1',
      title: 'Sub 1',
      completedAt: null,
      sortOrder: 0,
      createdAt: '',
    },
  ],
}

describe('TaskForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default values for new task', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    expect(screen.getByPlaceholderText('What needs to be done?')).toHaveValue(
      ''
    )
    expect(screen.getByText('Medium')).toHaveAttribute('data-selected', 'true')
  })

  it('renders with initial data for editing', () => {
    render(
      <TaskForm
        initialData={mockInitialData as any}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )
    expect(screen.getByPlaceholderText('What needs to be done?')).toHaveValue(
      'Original Title'
    )
    expect(screen.getByDisplayValue('Original Desc')).toBeInTheDocument()
  })

  it('validates required title (BR-077)', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    fireEvent.click(screen.getByText('Create Task'))

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('handles sub-task addition and removal (BR-090)', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const addButton = screen.getByText('Add Sub-task')
    fireEvent.click(addButton)

    expect(screen.getAllByPlaceholderText('Sub-task title')).toHaveLength(1)

    fireEvent.click(screen.getByLabelText('Remove sub-task'))
    expect(
      screen.queryByPlaceholderText('Sub-task title')
    ).not.toBeInTheDocument()
  })

  it('auto-completes parent when all sub-tasks are checked (BR-086)', async () => {
    render(
      <TaskForm
        initialData={mockInitialData as any}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const subTaskCheckbox = screen.getByRole('checkbox')
    fireEvent.click(subTaskCheckbox)

    // Wait for effect to run and state to update
    await waitFor(() => {
      const parentTitleInput = screen.getByPlaceholderText(
        'What needs to be done?'
      )
      expect(parentTitleInput).toHaveClass(styles.titleCompleted)
    })
  })

  it('prompts for scope when editing a recurring task (BR-101)', async () => {
    const recurringTask = { ...mockInitialData, recurrence: Recurrence.DAILY }
    render(
      <TaskForm
        initialData={recurringTask as any}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    // Change title to make it dirty if needed, or just submit
    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'Updated' },
    })
    fireEvent.click(screen.getByText('Save Changes'))

    expect(screen.getByText('Update recurring task?')).toBeInTheDocument()

    fireEvent.click(screen.getByText('This occurrence only'))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.any(Object), 'this')
    })
  })

  it('toggles auto-postpone (BR-083)', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const label = screen.getByText('Auto-postpone overdue tasks')
    // The toggle is the next sibling of the label's parent div
    const toggle = label.parentElement?.nextElementSibling as HTMLElement
    expect(toggle).toHaveAttribute('data-checked', 'false')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('data-checked', 'true')
  })

  it('submits correctly for new task', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'New Task' },
    })
    fireEvent.click(screen.getByText('Create Task'))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          priority: Priority.MEDIUM,
          recurrence: Recurrence.NONE,
        })
      )
    })
  })
})
