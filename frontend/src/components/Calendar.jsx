"use client"

import { useState, useEffect } from "react"
import MonthView from "./MonthView"
import WeekView from "./WeekView"
import DayView from "./DayView"
import EventModal from "./EventModal"
import Sidebar from "./Sidebar"
import "./Calendar.css"

export default function Calendar({ events, onCreateEvent, onUpdateEvent, onDeleteEvent, onFetchEvents }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState("month") // 'month', 'week', 'day'
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  // key to force Sidebar to refresh its data
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)

  useEffect(() => {
    const start = getStartDate()
    const end = getEndDate()
    onFetchEvents(start, end)
  }, [currentDate, view])

  const getStartDate = () => {
    const date = new Date(currentDate)
    if (view === "month") {
      date.setDate(1)
      date.setHours(0, 0, 0, 0)
    } else if (view === "week") {
      const day = date.getDay()
      date.setDate(date.getDate() - day)
      date.setHours(0, 0, 0, 0)
    } else {
      date.setHours(0, 0, 0, 0)
    }
    return date
  }

  const getEndDate = () => {
    const date = new Date(currentDate)
    if (view === "month") {
      date.setMonth(date.getMonth() + 1)
      date.setDate(0)
      date.setHours(23, 59, 59, 999)
    } else if (view === "week") {
      date.setDate(date.getDate() + (6 - date.getDay()))
      date.setHours(23, 59, 59, 999)
    } else {
      date.setHours(23, 59, 59, 999)
    }
    return date
  }

  const handlePrevious = () => {
    const date = new Date(currentDate)
    if (view === "month") {
      date.setMonth(date.getMonth() - 1)
    } else if (view === "week") {
      date.setDate(date.getDate() - 7)
    } else {
      date.setDate(date.getDate() - 1)
    }
    setCurrentDate(date)
  }

  const handleNext = () => {
    const date = new Date(currentDate)
    if (view === "month") {
      date.setMonth(date.getMonth() + 1)
    } else if (view === "week") {
      date.setDate(date.getDate() + 7)
    } else {
      date.setDate(date.getDate() + 1)
    }
    setCurrentDate(date)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleCreateEvent = (eventData) => {
    // support async or sync onCreateEvent; bump sidebar key after completion
    Promise.resolve(onCreateEvent(eventData)).finally(() => {
      setShowModal(false)
      setSidebarRefreshKey((k) => k + 1)
    })
  }

  const handleUpdateEvent = (eventData) => {
    if (selectedEvent) {
      Promise.resolve(onUpdateEvent(selectedEvent._id, eventData)).finally(() => {
        setShowModal(false)
        setSidebarRefreshKey((k) => k + 1)
      })
    } else {
      setShowModal(false)
    }
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setShowModal(true)
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setShowModal(true)
  }

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      Promise.resolve(onDeleteEvent(selectedEvent._id)).finally(() => {
        setShowModal(false)
        setSidebarRefreshKey((k) => k + 1)
      })
    }
  }

  const handleDateFromSidebar = (date) => {
    setCurrentDate(date)
    setView("month")
  }

  return (
    <div className="calendar-container">
      <Sidebar selectedDate={selectedDate} onDateSelect={handleDateFromSidebar} refreshKey={sidebarRefreshKey} />
      <div className="calendar-main">
        <div className="calendar-header">
          <div className="header-controls">
            <button className="btn btn-today" onClick={handleToday}>
              Today
            </button>
            <div className="nav-arrows">
              <button className="btn btn-nav" onClick={handlePrevious}>
                &#8249;
              </button>
              <button className="btn btn-nav" onClick={handleNext}>
                &#8250;
              </button>
            </div>
            <h2 className="header-title">
              {currentDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </h2>
          </div>

          <div className="view-controls">
            <button className={`btn view-btn ${view === "day" ? "active" : ""}`} onClick={() => setView("day")}>
              Day
            </button>
            <button className={`btn view-btn ${view === "week" ? "active" : ""}`} onClick={() => setView("week")}>
              Week
            </button>
            <button className={`btn view-btn ${view === "month" ? "active" : ""}`} onClick={() => setView("month")}>
              Month
            </button>
          </div>
        </div>

        <div className="calendar-content">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
            />
          )}
        </div>
      </div>

      {showModal && (
        <EventModal
          event={selectedEvent}
          date={selectedDate}
          onClose={() => setShowModal(false)}
          onCreate={handleCreateEvent}
          onUpdate={handleUpdateEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  )
}
