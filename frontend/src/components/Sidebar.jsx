"use client"

import React, { useState, useEffect } from "react"
import MiniCalendar from "./MiniCalendar"
import "./Sidebar.css"

export default function Sidebar({ selectedDate, onDateSelect, refreshKey, onCloseSidebar }) {
  const [upcomingEvents, setUpcomingEvents] = useState([])

  useEffect(() => {
    const ac = new AbortController()

    const fetchUpcomingEvents = async () => {
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const nextWeek = new Date(today)
        nextWeek.setDate(nextWeek.getDate() + 7)

        const params = new URLSearchParams()
        params.append("startDate", today.toISOString())
        params.append("endDate", nextWeek.toISOString())

        const response = await fetch(`/api/events?${params.toString()}`, { signal: ac.signal })
        if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`)

        const data = await response.json()

        const upcoming = (Array.isArray(data) ? data : [])
          .filter((event) => {
            const s = new Date(event.startTime)
            return !Number.isNaN(s.getTime()) && s >= today
          })
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
          .slice(0, 5)

        setUpcomingEvents(upcoming)
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching upcoming events:", error)
          setUpcomingEvents([])
        }
      }
    }

    fetchUpcomingEvents()
    return () => ac.abort()
  }, [selectedDate, refreshKey])

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        const ac = new AbortController()
        ;(async () => {
          try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const nextWeek = new Date(today)
            nextWeek.setDate(nextWeek.getDate() + 7)
            const params = new URLSearchParams()
            params.append("startDate", today.toISOString())
            params.append("endDate", nextWeek.toISOString())
            const response = await fetch(`/api/events?${params.toString()}`, { signal: ac.signal })
            if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`)
            const data = await response.json()
            const upcoming = (Array.isArray(data) ? data : [])
              .filter((event) => {
                const s = new Date(event.startTime)
                return !Number.isNaN(s.getTime()) && s >= today
              })
              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
              .slice(0, 5)
            setUpcomingEvents(upcoming)
          } catch (err) {
            if (err.name !== "AbortError") console.error("Error fetching on visibility:", err)
          }
        })()
        return () => ac.abort()
      }
    }

    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [refreshKey])

  const handleEventClick = (event) => {
    if (typeof onDateSelect === "function") onDateSelect(new Date(event.startTime))
    if (typeof onCloseSidebar === "function") onCloseSidebar()
  }

  const handleKeyDown = (e, event) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleEventClick(event)
    }
  }

  return (
    <aside className="sidebar" aria-label="Sidebar">
      <div className="sidebar-content">
        {/* mobile close control */}
        {typeof onCloseSidebar === "function" && (
          <div className="sidebar-mobile-header">
            <button
              className="sidebar-close-btn"
              onClick={onCloseSidebar}
              aria-label="Close sidebar"
              title="Close"
            >
              ✕
            </button>
          </div>
        )}

        <MiniCalendar selectedDate={selectedDate} onDateSelect={onDateSelect} />

        <div className="upcoming-section" aria-live="polite">
          <h3>Upcoming Events</h3>
          <div className="events-list" role="list">
            {upcomingEvents.length === 0 ? (
              <p className="no-events">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => {
                const start = new Date(event.startTime)
                const timeLabel = isNaN(start.getTime())
                  ? ""
                  : start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
                return (
                  <div
                    key={event._id || `${event.title}-${event.startTime}`}
                    className="upcoming-event"
                    style={{ borderLeftColor: event.color || "#2563eb" }}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleEventClick(event)}
                    onKeyDown={(e) => handleKeyDown(e, event)}
                    aria-label={`${event.title} on ${start.toDateString()} ${timeLabel}`}
                  >
                    <div className="event-date">
                      {isNaN(start.getTime())
                        ? ""
                        : start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </div>
                    <div className="event-details">
                      <div className="event-title">{event.title}</div>
                      <div className="event-time">{timeLabel}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
