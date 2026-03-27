'use client'

import React, { useState, useEffect } from 'react'
import styles from './Mascot.module.css'
import { clsx } from 'clsx'

export type MascotExpression =
  | 'happy'
  | 'waving'
  | 'celebrating'
  | 'encouraging'
  | 'concerned'
  | 'pointing'

interface MascotProps {
  expression?: MascotExpression
  size?: 'sm' | 'md' | 'lg' | number
  animate?: boolean
  className?: string
}

const SIZE_MAP = {
  sm: 64,
  md: 120,
  lg: 200,
}

const MascotIllustration: React.FC<{
  expression: MascotExpression
}> = ({ expression }) => {
  const getEyes = () => {
    switch (expression) {
      case 'celebrating':
        return (
          <>
            <path d="M35 45 Q40 35 45 45" className={styles.mascotMouth} />
            <path d="M55 45 Q60 35 65 45" className={styles.mascotMouth} />
          </>
        )
      case 'concerned':
        return (
          <>
            <ellipse
              cx="40"
              cy="45"
              rx="4"
              ry="2"
              className={styles.mascotPupil}
            />
            <ellipse
              cx="60"
              cy="45"
              rx="4"
              ry="2"
              className={styles.mascotPupil}
            />
          </>
        )
      default:
        return (
          <>
            <g className={styles.eyeBlink}>
              <circle cx="40" cy="45" r="6" className={styles.mascotEye} />
              <circle cx="40" cy="45" r="3" className={styles.mascotPupil} />
            </g>
            <g className={styles.eyeBlink}>
              <circle cx="60" cy="45" r="6" className={styles.mascotEye} />
              <circle cx="60" cy="45" r="3" className={styles.mascotPupil} />
            </g>
          </>
        )
    }
  }

  const getMouth = () => {
    switch (expression) {
      case 'happy':
      case 'waving':
      case 'celebrating':
        return <path d="M42 60 Q50 68 58 60" className={styles.mascotMouth} />
      case 'concerned':
        return <path d="M45 65 Q50 62 55 65" className={styles.mascotMouth} />
      default:
        return <path d="M45 62 H55" className={styles.mascotMouth} />
    }
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={clsx(styles.svg, styles.floating)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="voraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary-500)" />
          <stop offset="100%" stopColor="var(--color-accent-500)" />
        </linearGradient>
      </defs>

      {/* Body */}
      <rect
        x="20"
        y="25"
        width="60"
        height="60"
        rx="25"
        className={styles.mascotBody}
      />

      {/* Blush */}
      <circle cx="30" cy="55" r="5" className={styles.mascotBlush} />
      <circle cx="70" cy="55" r="5" className={styles.mascotBlush} />

      {/* Eyes */}
      {getEyes()}

      {/* Mouth */}
      {getMouth()}

      {/* Arms */}
      {expression === 'waving' && (
        <path
          d="M20 55 Q10 45 15 35"
          className={clsx(styles.mascotMouth, styles.armWave)}
          style={{ strokeWidth: 4 }}
        />
      )}
    </svg>
  )
}

export const Mascot: React.FC<MascotProps> = ({
  expression = 'happy',
  size = 'md',
  animate = true,
  className = '',
}) => {
  const [currentExp, setCurrentExp] = useState<MascotExpression>(expression)
  const [prevExp, setPrevExp] = useState<MascotExpression | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size]

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (expression !== currentExp) {
      if (prefersReducedMotion) {
        setCurrentExp(expression)
      } else {
        setPrevExp(currentExp)
        setCurrentExp(expression)
        setIsTransitioning(true)

        const timer = setTimeout(() => {
          setIsTransitioning(false)
          setPrevExp(null)
        }, 300)

        return () => clearTimeout(timer)
      }
    }
  }, [expression, currentExp])

  const animationClass = clsx(
    animate && expression === 'waving' && styles.animateWave,
    animate && expression === 'celebrating' && styles.animateJump,
    animate && expression === 'pointing' && styles.animatePoint,
    animate && expression === 'encouraging' && styles.animateEncourage,
    animate && expression === 'happy' && styles.animateBounce
  )

  return (
    <div
      className={clsx(styles.mascotContainer, className, animationClass)}
      style={{
        width: pixelSize,
        height: pixelSize,
      }}
    >
      <div className={styles.mascotBase}>
        <MascotIllustration expression={currentExp} />
      </div>

      {isTransitioning && prevExp && (
        <div
          className={clsx(
            styles.mascotBase,
            styles.fadeExit,
            styles.fadeExitActive
          )}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <MascotIllustration expression={prevExp} />
        </div>
      )}
    </div>
  )
}
