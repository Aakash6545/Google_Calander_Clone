"use client"
import "./DayView.css"

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function DayView({ currentDate, events, onDateSelect, onEventClick }) {
  const getEventsForDay = () => {
    return events.filter((event) => {
      const eventStart = new Date(event.startTime)
      return eventStart.toDateString() === currentDate.toDateString()
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

  const dayEvents = getEventsForDay()

  return (
    <div className="day-view">
      <div className="day-view-header">
        <h3>
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h3>
      </div>

      <div className="day-view-body">
        <div className="time-column">
          {HOURS.map((hour) => (
            <div key={hour} className="time-slot">
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        <div className="day-column" onClick={() => onDateSelect(currentDate)}>
          {HOURS.map((hour) => (
            <div key={hour} className="hour-cell"></div>
          ))}
          <div className="events-container">
            {dayEvents.map((event) => (
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
                {event.location && <div className="event-location">{event.location}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
