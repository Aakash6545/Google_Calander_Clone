"use client"

import { useState, useEffect } from "react"
import "./WeekView.css"

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function WeekView({ currentDate, events, onDateSelect, onEventClick }) {
  const [weekDays, setWeekDays] = useState([])

  useEffect(() => {
    const days = []
    const start = new Date(currentDate)
    const day = start.getDay()
    start.setDate(start.getDate() - day)

    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      days.push(d)
    }
    setWeekDays(days)
  }, [currentDate])

  const getEventsForDay = (dayDate) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startTime)
      return eventStart.toDateString() === dayDate.toDateString()
    })
  }

  const getEventPosition = (event) => {
    const start = new Date(event.startTime)
    const hour = start.getHours()
    const minutes = start.getMinutes()
    const top = (hour * 60 + minutes) / 60
    return top
  }

  const getEventHeight = (event) => {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)
    const duration = (end - start) / (1000 * 60 * 60)
    return Math.max(duration, 0.5)
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="week-view">
      <div className="week-header">
        <div className="time-column"></div>
        {weekDays.map((day, index) => (
          <div key={index} className={`day-header ${isToday(day) ? "today" : ""}`}>
            <div className="day-name">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
            <div className="day-date">{day.getDate()}</div>
          </div>
        ))}
      </div>

      <div className="week-body">
        <div className="time-column">
          {HOURS.map((hour) => (
            <div key={hour} className="time-slot">
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {weekDays.map((day, dayIndex) => (
          <div key={dayIndex} className={`day-column ${isToday(day) ? "today" : ""}`} onClick={() => onDateSelect(day)}>
            {HOURS.map((hour) => (
              <div key={hour} className="hour-cell"></div>
            ))}
            <div className="events-container">
              {getEventsForDay(day).map((event) => (
                <div
                  key={event._id}
                  className="event-block"
                  style={{
                    top: `${(getEventPosition(event) / 24) * 100}%`,
                    height: `${(getEventHeight(event) / 24) * 100}%`,
                    backgroundColor: event.color,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventClick(event)
                  }}
                >
                  <div className="event-time">
                    {new Date(event.startTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                  <div className="event-title">{event.title}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
