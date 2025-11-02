"use client"
import "./MonthView.css"

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function MonthView({ currentDate, events, onDateSelect, onEventClick }) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const getEventsForDate = (day) => {
    if (!day) return []
    const dateStr = new Date(year, month, day).toDateString()
    return events.filter((event) => new Date(event.startTime).toDateString() === dateStr)
  }

  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const handleDayClick = (day) => {
    if (day) {
      onDateSelect(new Date(year, month, day))
    }
  }

  return (
    <div className="month-view">
      <div className="weekdays">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}
      </div>
      <div className="days-grid">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day)
          return (
            <div
              key={index}
              className={`day-cell ${!day ? "empty" : ""} ${isToday(day) ? "today" : ""}`}
              onClick={() => handleDayClick(day)}
            >
              {day && (
                <>
                  <div className="day-number">{day}</div>
                  <div className="day-events">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event._id}
                        className="event-item"
                        style={{ backgroundColor: event.color }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(event)
                        }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && <div className="more-events">+{dayEvents.length - 2} more</div>}
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
