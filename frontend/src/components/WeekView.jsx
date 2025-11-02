"use client"

import React, { useMemo } from "react"
import "./WeekView.css"

/**
 * WeekView
 *
 * Props:
 * - currentDate: Date (any date within the week to show)
 * - events: array of { _id, title, startTime, endTime, color }
 * - onDateSelect(date) - called when user clicks a day (or the "+ more" fallback)
 * - onEventClick(event) - called when an event is clicked
 */
export default function WeekView({
  currentDate = new Date(),
  events = [],
  onDateSelect = () => {},
  onEventClick = () => {},
}) {
  // compute start of week (Sunday) at local midnight
  const getStartOfWeek = (d) => {
    const copy = new Date(d)
    const day = copy.getDay() // 0..6 (Sun..Sat)
    copy.setDate(copy.getDate() - day)
    copy.setHours(0, 0, 0, 0)
    return copy
  }

  const weekStart = useMemo(() => getStartOfWeek(currentDate), [currentDate])

  // array of 7 Date objects for each day in the week
  const days = useMemo(() => {
    const arr = []
    for (let i = 0; i < 7; i++) {
      const dt = new Date(weekStart)
      dt.setDate(weekStart.getDate() + i)
      arr.push(dt)
    }
    return arr
  }, [weekStart])

  // normalize events: ensure valid Date objects and sensible endTimes
  const normalizedEvents = useMemo(() => {
    return (Array.isArray(events) ? events : []).map((ev) => {
      const s = new Date(ev.startTime)
      let e = ev.endTime ? new Date(ev.endTime) : null
      if (!e || Number.isNaN(e.getTime()) || e <= s) {
        // default to 60 minutes if invalid or missing
        e = new Date(s.getTime() + 60 * 60 * 1000)
      }
      return { ...ev, start: s, end: e }
    })
  }, [events])

  // helper: returns events that intersect with the given day (local)
  const getEventsForDay = (dayDate) => {
    const startOfDay = new Date(dayDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(startOfDay)
    endOfDay.setHours(23, 59, 59, 999)

    return normalizedEvents.filter((ev) => ev.start <= endOfDay && ev.end >= startOfDay)
  }

  // convert a time to minutes offset within the day (0..1440)
  const minutesFromStartOfDay = (date, dayStart) => {
    const ms = date.getTime() - dayStart.getTime()
    const mins = Math.round(ms / 60000)
    if (mins < 0) return 0
    if (mins > 24 * 60) return 24 * 60
    return mins
  }

  // layout algorithm to create columns for overlapping events in a single day:
  // returns array of event layout objects { event, top%, height%, left%, width% }
  const layoutEventsForDay = (dayDate) => {
    const evs = getEventsForDay(dayDate)
      .map((ev) => {
        const dayStart = new Date(dayDate)
        dayStart.setHours(0, 0, 0, 0)

        const s = Math.max(0, minutesFromStartOfDay(ev.start, dayStart))
        const e = Math.min(24 * 60, minutesFromStartOfDay(ev.end, dayStart))
        const dur = Math.max(15, e - s) // min 15 mins visible

        return {
          raw: ev,
          startMin: s,
          endMin: s + dur,
          durMin: dur,
        }
      })
      .sort((a, b) => a.startMin - b.startMin || b.durMin - a.durMin)

    // columns: array of lastEndMin for each column and list of events assigned
    const columns = [] // each column: { lastEndMin, items: [idxs] }
    const placements = [] // same length as evs: { colIndex, totalCols }

    for (let i = 0; i < evs.length; i++) {
      const ev = evs[i]
      // find first column where it doesn't overlap
      let placed = false
      for (let c = 0; c < columns.length; c++) {
        if (ev.startMin >= columns[c].lastEndMin) {
          columns[c].lastEndMin = ev.endMin
          columns[c].items.push(i)
          placements[i] = { colIndex: c }
          placed = true
          break
        }
      }
      if (!placed) {
        columns.push({ lastEndMin: ev.endMin, items: [i] })
        placements[i] = { colIndex: columns.length - 1 }
      }
    }

    const totalCols = Math.max(1, columns.length)
    // Now compute final layout percentages
    const result = evs.map((ev, idx) => {
      const colIndex = placements[idx].colIndex
      const left = (colIndex / totalCols) * 100
      const width = 100 / totalCols
      const top = (ev.startMin / (24 * 60)) * 100
      const height = (ev.durMin / (24 * 60)) * 100
      return {
        event: ev.raw,
        top,
        height,
        left,
        width,
      }
    })

    return result
  }

  const handleDayClick = (dayDate) => {
    if (typeof onDateSelect === "function") onDateSelect(new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate()))
  }

  const handleDayKeyDown = (e, dayDate) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleDayClick(dayDate)
    }
  }

  return (
    <div className="week-view" role="application" aria-label="Week view">
      <div className="week-header">
        <div className="time-column-header" aria-hidden />
        {days.map((d, i) => (
          <div key={i} className="day-header" aria-hidden>
            <div className="day-name">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
            <div className="day-number">{d.getDate()}</div>
          </div>
        ))}
      </div>

      <div className="week-grid">
        {/* left time column */}
        <div className="time-column" aria-hidden>
          {Array.from({ length: 24 }).map((_, hour) => (
            <div key={hour} className="time-slot">
              <div className="time-label">{`${hour}:00`}</div>
            </div>
          ))}
        </div>

        {/* day columns */}
        {days.map((d, dayIndex) => {
          const layouts = layoutEventsForDay(d)
          return (
            <div
              key={dayIndex}
              className="day-column"
              role="gridcell"
              tabIndex={0}
              aria-label={d.toDateString()}
              onClick={() => handleDayClick(d)}
              onKeyDown={(e) => handleDayKeyDown(e, d)}
            >
              <div className="day-hour-grid" aria-hidden>
                {Array.from({ length: 24 }).map((_, hr) => (
                  <div key={hr} className="day-hour-row" />
                ))}
              </div>

              <div className="events-container" aria-live="polite">
                {layouts.map((pl) => {
                  const ev = pl.event
                  const bg = ev.color || "#2563eb"
                  // compute text color for readability (simple luminance)
                  const getTextColor = (hex) => {
                    try {
                      const s = String(hex).replace("#", "")
                      let r, g, b
                      if (s.length === 3) {
                        r = parseInt(s[0] + s[0], 16)
                        g = parseInt(s[1] + s[1], 16)
                        b = parseInt(s[2] + s[2], 16)
                      } else {
                        r = parseInt(s.slice(0, 2), 16)
                        g = parseInt(s.slice(2, 4), 16)
                        b = parseInt(s.slice(4, 6), 16)
                      }
                      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
                      return lum > 0.6 ? "#111827" : "#fff"
                    } catch {
                      return "#fff"
                    }
                  }
                  const textColor = getTextColor(bg)

                  return (
                    <button
                      key={ev._id || `${ev.title}-${ev.startTime}`}
                      className="week-event"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (typeof onEventClick === "function") onEventClick(ev)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          e.stopPropagation()
                          if (typeof onEventClick === "function") onEventClick(ev)
                        }
                      }}
                      title={`${ev.title} — ${new Date(ev.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                      style={{
                        top: `${pl.top}%`,
                        height: `${pl.height}%`,
                        left: `${pl.left}%`,
                        width: `calc(${pl.width}% - 6px)`, // small gutter
                        backgroundColor: bg,
                        color: textColor,
                      }}
                      aria-label={ev.title}
                    >
                      <div className="ev-title">{ev.title}</div>
                      <div className="ev-time">
                        {`${new Date(ev.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — ${new Date(ev.endTime || ev.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
