"use client"

import React, { useMemo } from "react"
import "./MonthView.css"

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// simple helper to compute readable text color (black or white) based on background color
function getContrastColor(hexOrRgb) {
  try {
    // normalize rgb(...) or hex (#RRGGBB or #RGB)
    let r, g, b
    const str = String(hexOrRgb).trim()

    if (str.startsWith("rgb")) {
      const nums = str.replace(/[^\d,.-]/g, "").split(",").map(Number)
      ;[r, g, b] = nums
    } else {
      let hex = str.replace("#", "")
      if (hex.length === 3) {
        hex = hex.split("").map((c) => c + c).join("")
      }
      if (hex.length !== 6) throw new Error("invalid hex")
      r = parseInt(hex.slice(0, 2), 16)
      g = parseInt(hex.slice(2, 4), 16)
      b = parseInt(hex.slice(4, 6), 16)
    }

    // luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.6 ? "#111827" : "#ffffff"
  } catch {
    return "#ffffff"
  }
}

export default function MonthView({ currentDate = new Date(), events = [], onDateSelect = () => {}, onEventClick = () => {} }) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // build days grid with leading & trailing nulls so it's always a multiple of 7
  const days = useMemo(() => {
    const arr = []
    for (let i = 0; i < startingDayOfWeek; i++) arr.push(null)
    for (let i = 1; i <= daysInMonth; i++) arr.push(i)
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [startingDayOfWeek, daysInMonth])

  // helper to find events for a date (compare numerically to avoid locale issues)
  const getEventsForDate = (day) => {
    if (!day) return []
    return events.filter((event) => {
      const d = new Date(event.startTime)
      if (Number.isNaN(d.getTime())) return false
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const handleDayClick = (day) => {
    if (!day) return
    if (typeof onDateSelect === "function") onDateSelect(new Date(year, month, day))
  }

  const handleDayKeyDown = (e, day) => {
    if (!day) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleDayClick(day)
    }
  }

  const handleEventKeyDown = (e, event) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (typeof onEventClick === "function") onEventClick(event)
    }
  }

  return (
    <div className="month-view" role="application" aria-label="Month view">
      <div className="weekdays" aria-hidden>
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}
      </div>

      <div className="days-grid" role="grid" aria-rowcount={days.length / 7}>
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day)

          // aria label for the cell
          const ariaLabel = day
            ? `${new Date(year, month, day).toDateString()} — ${dayEvents.length} event${dayEvents.length !== 1 ? "s" : ""}`
            : ""

          return (
            <div
              key={index}
              className={`day-cell ${!day ? "empty" : ""} ${isToday(day) ? "today" : ""}`}
              onClick={() => handleDayClick(day)}
              onKeyDown={(e) => handleDayKeyDown(e, day)}
              role={day ? "button" : "presentation"}
              tabIndex={day ? 0 : -1}
              aria-label={ariaLabel}
              aria-disabled={!day}
            >
              {day && (
                <>
                  <div className="day-number">{day}</div>

                  <div className="day-events" role="list" aria-live="polite">
                    {dayEvents.slice(0, 2).map((event) => {
                      const bg = event.color || "#2563eb"
                      const textColor = getContrastColor(bg)
                      return (
                        <div
                          key={event._id || `${event.title}-${event.startTime}`}
                          className="event-item"
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (typeof onEventClick === "function") onEventClick(event)
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation()
                            handleEventKeyDown(e, event)
                          }}
                          title={event.title}
                          style={{ backgroundColor: bg, color: textColor }}
                          aria-label={`${event.title} at ${new Date(event.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`}
                        >
                          {event.title}
                        </div>
                      )
                    })}

                    {dayEvents.length > 2 && (
                      <div
                        className="more-events"
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (typeof onDateSelect === "function") onDateSelect(new Date(year, month, day))
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            e.stopPropagation()
                            if (typeof onDateSelect === "function") onDateSelect(new Date(year, month, day))
                          }
                        }}
                        aria-label={`Show ${dayEvents.length - 2} more events`}
                      >
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
