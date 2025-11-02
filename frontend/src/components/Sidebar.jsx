"use client"

import { useState, useEffect } from "react"
import MiniCalendar from "./MiniCalendar"
import "./Sidebar.css"

export default function Sidebar({ selectedDate, onDateSelect, refreshKey }) {
  const [upcomingEvents, setUpcomingEvents] = useState([])

  // re-fetch when selectedDate or parent's refreshKey changes
  useEffect(() => {
    fetchUpcomingEvents()
  }, [selectedDate, refreshKey])

  const fetchUpcomingEvents = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)

      const params = new URLSearchParams()
      params.append("startDate", today.toISOString())
      params.append("endDate", nextWeek.toISOString())

      const response = await fetch(`/api/events?${params}`)
      const data = await response.json()

      const upcoming = data
        .filter((event) => new Date(event.startTime) >= today)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, 5)

      setUpcomingEvents(upcoming)
    } catch (error) {
      console.error("Error fetching upcoming events:", error)
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <MiniCalendar selectedDate={selectedDate} onDateSelect={onDateSelect} />

        <div className="upcoming-section">
          <h3>Upcoming Events</h3>
          <div className="events-list">
            {upcomingEvents.length === 0 ? (
              <p className="no-events">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event._id} className="upcoming-event" style={{ borderLeftColor: event.color }}>
                  <div className="event-date">
                    {new Date(event.startTime).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="event-details">
                    <div className="event-title">{event.title}</div>
                    <div className="event-time">
                      {new Date(event.startTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
