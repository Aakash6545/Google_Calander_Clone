"use client"

import { useState } from "react"
import "./MiniCalendar.css"

export default function MiniCalendar({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const isSelected = (day) => {
    if (!day) return false
    const date = new Date(year, month, day)
    return date.toDateString() === selectedDate.toDateString()
  }

  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  return (
    <div className="mini-calendar">
      <div className="mini-calendar-header">
        <button onClick={handlePrevMonth}>&#8249;</button>
        <span className="month-year">
          {currentMonth.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </span>
        <button onClick={handleNextMonth}>&#8250;</button>
      </div>

      <div className="mini-weekdays">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="mini-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="mini-days">
        {days.map((day, index) => (
          <button
            key={index}
            className={`mini-day ${!day ? "empty" : ""} ${
              isSelected(day) ? "selected" : ""
            } ${isToday(day) ? "today" : ""}`}
            onClick={() => {
              if (day) {
                onDateSelect(new Date(year, month, day))
              }
            }}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  )
}
