'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Priority, Recurrence } from '@/types/enums'
import { format } from 'date-fns'
import { createTaskSchema } from '@/lib/validations/task'
import { Task } from '@/types/task'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DatePicker } from '@/components/ui/DatePicker'
import { Archive, Plus, X, CheckCircle2, Circle } from 'lucide-react'
import styles from './TaskForm.module.css'

interface TaskFormProps {
  initialData?: Task
  onSubmit: (data: any, scope?: 'this' | 'future') => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

type TaskFormData = {
  title: string
  description?: string
  priority?: Priority
  dueDate?: Date | null
  recurrence?: Recurrence
  recurrenceRule?: string // JSON string for custom rule
  autoPostpone?: boolean
  completedAt?: string | null
  subTasks?: { id?: string; title: string; completedAt?: string | null }[]
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [showScopePrompt, setShowScopePrompt] = useState(false)
  const [pendingData, setPendingData] = useState<TaskFormData | null>(null)

  const form = useForm<TaskFormData>({
    resolver: zodResolver(createTaskSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || Priority.MEDIUM,
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : undefined,
      recurrence: initialData?.recurrence || Recurrence.NONE,
      recurrenceRule: initialData?.recurrenceRule
        ? JSON.stringify(initialData.recurrenceRule)
        : '',
      autoPostpone: initialData?.autoPostpone || false,
      completedAt: initialData?.completedAt || null,
      subTasks:
        initialData?.subTasks?.map((st) => ({
          id: st.id,
          title: st.title,
          completedAt: st.completedAt,
        })) || [],
    },
  })

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = form

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'subTasks',
  })

  const currentRecurrence = watch('recurrence')
  const subTasks = watch('subTasks')
  const completedAt = watch('completedAt')
  const isRecurring = initialData && initialData.recurrence !== Recurrence.NONE

  // Auto-complete Logic
  useEffect(() => {
    if (!subTasks || subTasks.length === 0) return

    const allDone = subTasks.every((st) => !!st.completedAt)
    const currentCompletedAt = getValues('completedAt')
    const isParentDone = !!currentCompletedAt

    if (allDone && !isParentDone) {
      setValue('completedAt', new Date().toISOString(), { shouldDirty: true })
    } else if (!allDone && isParentDone) {
      // Revert parent if a sub-task is unchecked
      setValue('completedAt', null, { shouldDirty: true })
    }
  }, [subTasks, setValue, getValues])

  const handleFormSubmit = async (data: TaskFormData) => {
    let parsedRule = undefined
    if (data.recurrence === Recurrence.CUSTOM && data.recurrenceRule) {
      try {
        parsedRule = JSON.parse(data.recurrenceRule)
      } catch {
        setError('recurrenceRule', { message: 'Invalid JSON format' })
        return
      }
    }

    // Format valid payload
    const payload = {
      ...data,
      priority: data.priority || Priority.MEDIUM,
      recurrence: data.recurrence || Recurrence.NONE,
      autoPostpone: data.autoPostpone || false,
      dueDate: data.dueDate ? format(data.dueDate, 'yyyy-MM-dd') : null,
      recurrenceRule: parsedRule,
      subTasks: data.subTasks,
    }

    if (isRecurring) {
      setPendingData(data) // Store original data for prompt handling if needed
      setShowScopePrompt(true)
    } else {
      await onSubmit(payload)
    }
  }

  const handleScopeSelection = async (scope: 'this' | 'future') => {
    if (!pendingData) return

    // Format payload again since we are in a closure/different step
    const payload = {
      ...pendingData,
      priority: pendingData.priority || Priority.MEDIUM,
      recurrence: pendingData.recurrence || Recurrence.NONE,
      autoPostpone: pendingData.autoPostpone || false,
      dueDate: pendingData.dueDate
        ? format(pendingData.dueDate, 'yyyy-MM-dd')
        : null,
      recurrenceRule:
        pendingData.recurrence === Recurrence.CUSTOM &&
        pendingData.recurrenceRule
          ? JSON.parse(pendingData.recurrenceRule)
          : undefined,
      subTasks: pendingData.subTasks,
    }

    await onSubmit(payload, scope)
    setShowScopePrompt(false)
  }

  // Helper to get current value of a subtask when updating checkbox
  function getValuesSync(index: number) {
    return getValues(`subTasks.${index}`)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
      {/* Scope Prompt Overlay */}
      {showScopePrompt && (
        <div className={styles.promptOverlay}>
          <div className={styles.promptContent}>
            <h3 className={styles.promptTitle}>Update recurring task?</h3>
            <p className={styles.promptText}>
              This is a repeating task. How would you like to apply your
              changes?
            </p>
            <div className={styles.promptActions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleScopeSelection('this')}
                fullWidth
              >
                This occurrence only
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => handleScopeSelection('future')}
                fullWidth
              >
                All future occurrences
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowScopePrompt(false)}
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div className={styles.fieldGroup}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {/* Visual completion indicator/toggle for parent */}
              <div
                onClick={() =>
                  setValue(
                    'completedAt',
                    completedAt ? null : new Date().toISOString(),
                    { shouldDirty: true }
                  )
                }
                style={{
                  cursor: 'pointer',
                  color: completedAt
                    ? 'var(--primary)'
                    : 'var(--text-tertiary)',
                }}
              >
                {completedAt ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <Circle size={24} />
                )}
              </div>
              <Input
                label=""
                placeholder="What needs to be done?"
                error={errors.title?.message}
                className={completedAt ? styles.titleCompleted : ''}
                style={{
                  textDecoration: completedAt ? 'line-through' : 'none',
                }}
                {...field}
              />
            </div>
          )}
        />
      </div>

      {/* Description */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Description</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              className="vora-input__field" // Reuse global input style
              style={{
                minHeight: '100px',
                padding: '0.75rem',
                resize: 'vertical',
              }}
              placeholder="Add details..."
              {...field}
              value={field.value || ''}
            />
          )}
        />
        {errors.description && (
          <p className="vora-input__error">{errors.description.message}</p>
        )}
      </div>

      {/* Sub-tasks */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Sub-tasks{' '}
          {fields.length > 0 &&
            `(${fields.filter((f) => !!(f as any).completedAt).length}/${fields.length})`}
        </label>
        <div className={styles.subTaskList}>
          {fields.map((field, index) => {
            // Cast field to access custom properties not typed by useFieldArray defaults perfectly sometimes
            const isCompleted = !!(field as any).completedAt
            return (
              <div key={field.id} className={styles.subTaskRow}>
                <input
                  type="checkbox"
                  className={styles.subTaskCheckbox}
                  checked={isCompleted}
                  onChange={(e) => {
                    const curr = getValuesSync(index)
                    if (!curr) return
                    update(index, {
                      title: curr.title || '',
                      id: curr.id,
                      completedAt: e.target.checked
                        ? new Date().toISOString()
                        : null,
                    })
                  }}
                />
                <Controller
                  name={`subTasks.${index}.title`}
                  control={control}
                  render={({ field: inputField }) => (
                    <Input
                      label=""
                      placeholder="Sub-task title"
                      className={styles.subTaskInput}
                      style={{
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        color: isCompleted ? 'var(--text-tertiary)' : 'inherit',
                      }}
                      {...inputField}
                    />
                  )}
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => remove(index)}
                  aria-label="Remove sub-task"
                >
                  <X size={16} />
                </button>
              </div>
            )
          })}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => append({ title: '', completedAt: null })}
          disabled={fields.length >= 20}
          className={styles.addSubTaskBtn}
          leftIcon={<Plus size={16} />}
        >
          Add Sub-task
        </Button>
      </div>

      {/* Row: Priority & Due Date */}
      <div className={styles.row}>
        <div className={styles.col}>
          <label className={styles.label}>Priority</label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <div className={styles.priorityGroup}>
                {[Priority.HIGH, Priority.MEDIUM, Priority.LOW].map((p) => (
                  <div
                    key={p}
                    className={styles.priorityOption}
                    data-selected={field.value === p}
                    onClick={() => field.onChange(p)}
                  >
                    <div
                      className={`${styles.priorityDot} ${styles[p.toLowerCase()]}`}
                    />
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </div>
                ))}
              </div>
            )}
          />
        </div>

        <div className={styles.col}>
          <label className={styles.label}>Due Date</label>
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                selectedDate={field.value || new Date()}
                onDateChange={(date) => field.onChange(date)}
              />
            )}
          />
          {errors.dueDate && (
            <p className="vora-input__error">
              {errors.dueDate.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Recurrence */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Recurrence</label>
        <Controller
          name="recurrence"
          control={control}
          render={({ field }) => (
            <select className={styles.recurrenceSelect} {...field}>
              <option value={Recurrence.NONE}>Does not repeat</option>
              <option value={Recurrence.DAILY}>Daily</option>
              <option value={Recurrence.WEEKLY}>Weekly</option>
              <option value={Recurrence.MONTHLY}>Monthly</option>
              <option value={Recurrence.CUSTOM}>Custom</option>
            </select> // Using native select for simplicity as per requirements
          )}
        />
        {currentRecurrence === Recurrence.CUSTOM && (
          <Controller
            name="recurrenceRule"
            control={control}
            render={({ field }) => (
              <>
                <textarea
                  className={`vora-input__field ${errors.recurrenceRule ? 'vora-input--error' : ''}`}
                  placeholder='{"interval": 2, "unit": "weeks"}'
                  style={{
                    marginTop: '0.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                  }}
                  {...field}
                  value={field.value || ''}
                />
                {errors.recurrenceRule && (
                  <p className="vora-input__error">
                    {errors.recurrenceRule.message}
                  </p>
                )}
              </>
            )}
          />
        )}
      </div>

      {/* Auto Postpone */}
      <div className={styles.toggleGroup}>
        <div className={styles.toggleLabel}>
          <Archive size={18} />
          <span>Auto-postpone overdue tasks</span>
        </div>
        <Controller
          name="autoPostpone"
          control={control}
          render={({ field }) => (
            <div
              className={styles.toggleSwitch}
              data-checked={field.value}
              onClick={() => field.onChange(!field.value)}
            >
              <div className={styles.toggleThumb} />
            </div>
          )}
        />
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}
