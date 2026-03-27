import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  calculateNextDueDate,
  processTaskRecurrence,
} from '@/lib/services/recurrence'
import { Recurrence } from '@/types/enums'

describe('Recurrence Service', () => {
  describe('calculateNextDueDate', () => {
    it('should add 1 day for DAILY recurrence', () => {
      const current = new Date('2025-02-10')
      const next = calculateNextDueDate(current, Recurrence.DAILY)
      expect(next.toISOString()).toContain('2025-02-11')
    })

    it('should add 1 week for WEEKLY recurrence', () => {
      const current = new Date('2025-02-10') // Monday
      const next = calculateNextDueDate(current, Recurrence.WEEKLY)
      expect(next.toISOString()).toContain('2025-02-17')
    })

    it('should add 1 month for MONTHLY recurrence', () => {
      const current = new Date('2025-02-10')
      const next = calculateNextDueDate(current, Recurrence.MONTHLY)
      expect(next.toISOString()).toContain('2025-03-10')
    })

    it('should handle month-end for MONTHLY recurrence', () => {
      const current = new Date('2025-01-31')
      const next = calculateNextDueDate(current, Recurrence.MONTHLY)
      // Jan 31 + 1 month = Feb 28 (non-leap year)
      expect(next.getDate()).toBe(28)
      expect(next.getMonth()).toBe(1) // Feb
    })

    it('should handle CUSTOM recurrence (every 3 days)', () => {
      const current = new Date('2025-02-10')
      const next = calculateNextDueDate(current, Recurrence.CUSTOM, {
        interval: 3,
        unit: 'days',
      })
      expect(next.toISOString()).toContain('2025-02-13')
    })

    it('should handle CUSTOM recurrence (every 2 weeks)', () => {
      const current = new Date('2025-02-10')
      const next = calculateNextDueDate(current, Recurrence.CUSTOM, {
        interval: 2,
        unit: 'weeks',
      })
      expect(next.toISOString()).toContain('2025-02-24')
    })
  })

  describe('processTaskRecurrence', () => {
    const mockTx = {
      task: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    }

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should create a new task instance with reset properties', async () => {
      const oldTask = {
        id: 'old-1',
        title: 'Recurring Task',
        description: 'Desc',
        priority: 'HIGH',
        dueDate: new Date('2025-02-10'),
        recurrence: Recurrence.DAILY,
        recurrenceRule: null,
        autoPostpone: true,
        userId: 'user-1',
        subTasks: [
          { id: 'st-1', title: 'Sub 1', sortOrder: 0, completedAt: new Date() },
        ],
      }

      mockTx.task.findUnique.mockResolvedValue(oldTask)
      mockTx.task.create.mockResolvedValue({ id: 'new-2' })

      await processTaskRecurrence('old-1', mockTx)

      expect(mockTx.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Recurring Task',
          dueDate: expect.any(Date),
          completedAt: null,
          originalDueDate: null,
          subTasks: {
            create: [
              expect.objectContaining({
                title: 'Sub 1',
                completedAt: null, // reset sub-task
              }),
            ],
          },
        }),
      })

      const createCall = mockTx.task.create.mock.calls[0][0]
      expect(createCall.data.dueDate.toISOString()).toContain('2025-02-11')
    })

    it('should return null if task is not recurring', async () => {
      mockTx.task.findUnique.mockResolvedValue({ recurrence: Recurrence.NONE })
      const result = await processTaskRecurrence('none', mockTx)
      expect(result).toBeNull()
      expect(mockTx.task.create).not.toHaveBeenCalled()
    })
  })
})
