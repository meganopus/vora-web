import React, { useEffect, useState } from 'react'
import styles from './CircularProgress.module.css'

interface CircularProgressProps {
  completed: number
  total: number
  size?: number
  strokeWidth?: number
}

export function CircularProgress({
  completed,
  total,
  size = 200,
  strokeWidth = 12, // Increased default thickness for better visibility
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Calculate percentage, handle 0 total habits gracefully
  const hasHabits = total > 0
  // Percentage is 0 if no habits, else calculated
  const percentage = hasHabits
    ? Math.min(Math.max((completed / total) * 100, 0), 100)
    : 0

  // Calculate the target stroke dash offset
  const targetOffset = circumference - (percentage / 100) * circumference

  // State for the offset to control animation
  // Initialize to circumference (0% full) so it starts empty
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    // Determine if we should animate immediately or not.
    // Using a small timeout or requestAnimationFrame ensures the browser paints the initial state (0%)
    // before transitioning to the target state.
    const timer = setTimeout(() => {
      setOffset(targetOffset)
    }, 100)

    return () => clearTimeout(timer)
  }, [targetOffset])

  // Determine stroke color
  const isComplete = percentage === 100 && hasHabits
  const strokeColor = isComplete
    ? 'var(--vora-color-success)'
    : 'var(--color-primary-500)'

  return (
    <div className={styles.container}>
      <div
        className={styles.progressWrapper}
        style={{ width: size, height: size }}
      >
        <svg
          className={styles.svg}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-label={`Progress: ${Math.round(percentage)}%`}
        >
          <circle
            className={styles.circleBg}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <circle
            className={styles.circleProgress}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={strokeColor}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 500ms ease-out' }}
          />
        </svg>
        {/* Centered text */}
        <div className={styles.centeredContent}>
          <span className={styles.percentage}>{Math.round(percentage)}%</span>
          <span className={styles.label}>TODAY</span>
        </div>
      </div>

      {!hasHabits && (
        <div className={styles.message}>No habits scheduled today</div>
      )}
    </div>
  )
}
