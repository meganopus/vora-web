'use client'

import React, { useState } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  isToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'
import { useHeatmap, useHeatmapDetail, HeatmapDay } from '@/hooks/useHeatmap'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { clsx } from 'clsx'
import styles from './HeatmapCalendar.module.css'

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function HeatmapCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const monthKey = format(currentMonth, 'yyyy-MM')
  const { data: heatmapData, isLoading } = useHeatmap(monthKey)
  const { data: detailData, isLoading: isLoadingDetail } =
    useHeatmapDetail(selectedDate)

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  // To handle the 7-column grid properly including empty spaces for days not in month (if startOfWeek is used)
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate leading empty cells
  const startDay = (monthStart.getDay() + 6) % 7 // Convert 0-6 (Sun-Sat) to 0-6 (Mon-Sun)
  const emptyCells = Array.from({ length: startDay })

  const getRateColor = (rate: number, scheduled: number) => {
    if (scheduled === 0) return styles['rate-gray']
    if (rate >= 80) return styles['rate-green']
    if (rate >= 40) return styles['rate-yellow']
    if (rate > 0) return styles['rate-red']
    return styles['rate-gray']
  }

  const handleDayClick = (dayData: HeatmapDay) => {
    if (dayData.scheduled > 0) {
      setSelectedDate(dayData.date)
      setIsDetailOpen(true)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3 className={styles.monthLabel}>
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className={styles.nav}>
          <button
            onClick={prevMonth}
            className={styles.navBtn}
            aria-label="Previous Month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className={styles.navBtn}
            aria-label="Next Month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className={styles.dayName}>
            {day}
          </div>
        ))}

        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} className={styles.emptyCell} />
        ))}

        {isLoading
          ? Array.from({ length: dateRange.length }).map((_, i) => (
              <Skeleton
                key={`skeleton-${i}`}
                className={clsx(styles.dayCell, styles['rate-gray'])}
              />
            ))
          : heatmapData?.map((day) => (
              <button
                key={day.date}
                className={clsx(
                  styles.dayCell,
                  getRateColor(day.rate, day.scheduled),
                  isToday(parseISO(day.date)) && styles.dayCellToday
                )}
                onClick={() => handleDayClick(day)}
                disabled={day.scheduled === 0}
                aria-label={`${format(parseISO(day.date), 'MMM d')}: ${day.rate}% completion`}
              >
                <div className={styles.accessiblePattern} />
                <span className={styles.dayNumber}>
                  {format(parseISO(day.date), 'd')}
                </span>
                <div className={styles.tooltip}>
                  {format(parseISO(day.date), 'MMM d, yyyy')} — {day.rate}% (
                  {day.completed}/{day.scheduled} habits)
                </div>
              </button>
            ))}
      </div>

      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={
          selectedDate
            ? format(parseISO(selectedDate), 'EEEE, MMM d')
            : 'Day Details'
        }
      >
        {isLoadingDetail ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {detailData?.habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{habit.emoji || '✨'}</span>
                  <span className="font-semibold text-gray-800">
                    {habit.name}
                  </span>
                </div>
                {habit.completed ? (
                  <CheckCircle2 className="text-green-500" size={24} />
                ) : (
                  <XCircle className="text-red-400" size={24} />
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
