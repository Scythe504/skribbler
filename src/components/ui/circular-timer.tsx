"use client"

import { useEffect, useState } from "react"

interface CircularTimerProps {
  duration: number
  isActive: boolean
  onComplete?: () => void
  className?: string
  size?: number
}

export const CircularTimer = ({ duration, isActive, onComplete, className = "", size = 128 }: CircularTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1
          if (newTime === 0 && onComplete) {
            onComplete()
          }
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, onComplete])

  const progress = ((duration - timeLeft) / duration) * 100
  const radius = (size - 4) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-border opacity-100"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeLinecap="square"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
          className={`${timeLeft <= 5 ? "text-destructive" : timeLeft <= 10 ? "text-chart-1" : "text-primary"}`}
        />
      </svg>

      {/* Timer text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xs font-mono text-muted-foreground mb-1">[TIMER]</div>
        <div
          className={`text-2xl font-mono font-bold transition-colors duration-300 py-2 ${
            timeLeft <= 5 ? "text-destructive animate-pulse" : timeLeft <= 10 ? "text-chart-1" : "text-primary"
          }`}
        >
          {timeLeft.toString().padStart(2, "0")}
        </div>
        <div className="text-xs text-muted-foreground mt-1">SEC</div>
      </div>
    </div>
  )
}
