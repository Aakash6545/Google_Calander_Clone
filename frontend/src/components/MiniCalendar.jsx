"use client"

import { useState, useEffect, useMemo } from "react"
import "./MiniCalendar.css"

export default function MiniCalendar({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const normSelected = useMemo(() => {
    if (!selectedDate) return null
    const d = selectedDate instanceof Date ? selectedDate : new Date(selectedDate)
    if (Number.isNaN(d.getTime())) return null
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }, [selectedDate])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() 

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const days = useMemo(() => {
    const arr = []
    for (let i = 0; i < startingDayOfWeek; i++) arr.push(null)
    for (let i = 1; i <= daysInMonth; i++) arr.push(i)
    while (arr.length % 7 !== 0) arr.push(null) 
    return arr
  }, [startingDayOfWeek, daysInMonth])

  const isSelected = (day) => {
    if (!day || !normSelected) return false
    return (
      normSelected.getFullYear() === year &&
      normSelected.getMonth() === month &&
      normSelected.getDate() === day
    )
  }

  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    )
  }

  return (
    <div className="mini-calendar" role="application" aria-label="Mini calendar">
      <div className="mini-calendar-header">
        <button
          onClick={handlePrevMonth}
          aria-label="Previous month"
          title="Previous month"
          className="nav-btn"
        >
          ‹
        </button>

        <span className="month-year" aria-live="polite">
          {currentMonth.toLocaleDateString(undefined, { month: "short", year: "numeric" })}
        </span>

        <button
          onClick={handleNextMonth}
          aria-label="Next month"
          title="Next month"
          className="nav-btn"
        >
          ›
        </button>
      </div>

      <div className="mini-weekdays" aria-hidden>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="mini-weekday">
            {d}
          </div>
        ))}
      </div>

      <div className="mini-days" role="grid" aria-rowcount={days.length / 7}>
        {days.map((day, index) => {
          const selected = isSelected(day)
          const today = isToday(day)
          const isEmpty = day === null

          return (
            <button
              key={isEmpty ? `empty-${index}` : `day-${day}`}
              className={[
                "mini-day",
                isEmpty ? "empty" : "",
                selected ? "selected" : "",
                today ? "today" : "",
              ].join(" ")}
              onClick={() => {
                if (!isEmpty) onDateSelect(new Date(year, month, day))
              }}
              disabled={isEmpty}
              aria-pressed={selected}
              aria-label={isEmpty ? "" : new Date(year, month, day).toDateString()}
              role="gridcell"
              tabIndex={isEmpty ? -1 : 0}
            >
              {day || ""}
            </button>
          )
        })}
      </div>
    </div>
  )
}
