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
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)

  // new: mobile sidebar toggle
  const [showSidebar, setShowSidebar] = useState(false)

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
    if (view === "month") date.setMonth(date.getMonth() - 1)
    else if (view === "week") date.setDate(date.getDate() - 7)
    else date.setDate(date.getDate() - 1)
    setCurrentDate(date)
  }

  const handleNext = () => {
    const date = new Date(currentDate)
    if (view === "month") date.setMonth(date.getMonth() + 1)
    else if (view === "week") date.setDate(date.getDate() + 7)
    else date.setDate(date.getDate() + 1)
    setCurrentDate(date)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleCreateEvent = (eventData) => {
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
    } else setShowModal(false)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setShowModal(true)
    // close mobile sidebar when selecting a date
    setShowSidebar(false)
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
    setShowSidebar(false)
  }

  return (
    <div className="calendar-container">
      {/* Sidebar + overlay */}
      <div className={`sidebar-wrapper ${showSidebar ? "open" : "collapsed"}`}>
        <Sidebar selectedDate={selectedDate} onDateSelect={handleDateFromSidebar} refreshKey={sidebarRefreshKey} />
      </div>

      <div className={`sidebar-overlay ${showSidebar ? "visible" : ""}`} onClick={() => setShowSidebar(false)} />

      <div className="calendar-main">
        <div className="calendar-header">
          <div className="header-controls">
            {/* mobile hamburger to open sidebar */}
            <button
              className="mobile-menu-btn"
              aria-label="Open sidebar"
              onClick={() => setShowSidebar((s) => !s)}
              title="Open sidebar"
            >
              {/* simple hamburger */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            <button className="btn btn-today" onClick={handleToday}>
              Today
            </button>

            <div className="nav-arrows" role="group" aria-label="Navigate date">
              <button className="btn btn-nav" onClick={handlePrevious} aria-label="Previous">
                &#8249;
              </button>
              <button className="btn btn-nav" onClick={handleNext} aria-label="Next">
                &#8250;
              </button>
            </div>

            <h2 className="header-title">
              {currentDate.toLocaleDateString(undefined, { year: "numeric", month: "long" })}
            </h2>
          </div>

          <div className="view-controls" role="tablist" aria-label="Views">
            <button
              className={`btn view-btn ${view === "day" ? "active" : ""}`}
              onClick={() => setView("day")}
              role="tab"
              aria-selected={view === "day"}
            >
              Day
            </button>
            <button
              className={`btn view-btn ${view === "week" ? "active" : ""}`}
              onClick={() => setView("week")}
              role="tab"
              aria-selected={view === "week"}
            >
              Week
            </button>
            <button
              className={`btn view-btn ${view === "month" ? "active" : ""}`}
              onClick={() => setView("month")}
              role="tab"
              aria-selected={view === "month"}
            >
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
