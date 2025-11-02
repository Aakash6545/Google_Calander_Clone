"use client"

import { useState, useEffect } from "react"
import MonthView from "./MonthView"
import WeekView from "./WeekView"
import DayView from "./DayView"
import EventModal from "./EventModal"
import Sidebar from "./Sidebar"
import "./Calendar.css"

export default function Calendar({ events = [], onCreateEvent, onUpdateEvent, onDeleteEvent, onFetchEvents }) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [view, setView] = useState("month")
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)

  const SIDEBAR_BREAKPOINT = 900

  // start with sidebar closed; only open when user presses hamburger
  const [showSidebar, setShowSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth < SIDEBAR_BREAKPOINT
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    const onResize = () => setIsMobile(window.innerWidth < SIDEBAR_BREAKPOINT)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    if (typeof document === "undefined") return
    if (showSidebar && isMobile) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev || ""
      }
    }
  }, [showSidebar, isMobile])

  // fetch visible range whenever date/view change (uses ref)
  useEffect(() => {
    try {
      const start = getStartDate()
      const end = getEndDate()
      if (typeof onFetchEventsRef.current === "function") {
        try {
          onFetchEventsRef.current(start, end)
        } catch (err) {
          console.error("onFetchEvents threw:", err)
        }
      }
    } catch (err) {
      console.error("Error computing fetch range:", err)
    }
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
    setCurrentDate((prev) => {
      const date = new Date(prev)
      if (view === "month") date.setMonth(date.getMonth() - 1)
      else if (view === "week") date.setDate(date.getDate() - 7)
      else date.setDate(date.getDate() - 1)
      return date
    })
  }

  const handleNext = () => {
    setCurrentDate((prev) => {
      const date = new Date(prev)
      if (view === "month") date.setMonth(date.getMonth() + 1)
      else if (view === "week") date.setDate(date.getDate() + 7)
      else date.setDate(date.getDate() + 1)
      return date
    })
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // wrappers that call parent's handlers if provided
  const handleCreateEvent = (eventData) => {
    if (typeof onCreateEvent !== "function") {
      setShowModal(false)
      return
    }
    Promise.resolve()
      .then(() => onCreateEvent(eventData))
      .then(() => {
        const start = getStartDate()
        const end = getEndDate()
        if (typeof onFetchEventsRef.current === "function") onFetchEventsRef.current(start, end)
        setSidebarRefreshKey((k) => k + 1)
      })
      .catch((err) => console.error("create event error:", err))
      .finally(() => setShowModal(false))
  }

  const handleUpdateEvent = (eventData) => {
    if (!selectedEvent || typeof onUpdateEvent !== "function") {
      setShowModal(false)
      return
    }
    Promise.resolve()
      .then(() => onUpdateEvent(selectedEvent._id, eventData))
      .then(() => {
        const start = getStartDate()
        const end = getEndDate()
        if (typeof onFetchEventsRef.current === "function") onFetchEventsRef.current(start, end)
        setSidebarRefreshKey((k) => k + 1)
      })
      .catch((err) => console.error("update event error:", err))
      .finally(() => setShowModal(false))
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setShowModal(true)
    setShowSidebar(false)
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setShowModal(true)
  }

  const handleDeleteEvent = () => {
    if (!selectedEvent || typeof onDeleteEvent !== "function") {
      setShowModal(false)
      return
    }
    Promise.resolve()
      .then(() => onDeleteEvent(selectedEvent._id))
      .then(() => {
        const start = getStartDate()
        const end = getEndDate()
        if (typeof onFetchEventsRef.current === "function") onFetchEventsRef.current(start, end)
        setSidebarRefreshKey((k) => k + 1)
      })
      .catch((err) => console.error("delete event error:", err))
      .finally(() => setShowModal(false))
  }

  const handleDateFromSidebar = (date) => {
    setCurrentDate(date)
    setView("month")
    setShowSidebar(false)
  }

  return (
    <div className="calendar-container">
      {/* Sidebar + overlay */}
      <div className={`sidebar-wrapper ${showSidebar ? "open" : "collapsed"}`} aria-hidden={!showSidebar}>
        <Sidebar
          selectedDate={selectedDate}
          onDateSelect={handleDateFromSidebar}
          refreshKey={sidebarRefreshKey}
          onCloseSidebar={() => setShowSidebar(false)}
        />
      </div>

      <div className={`sidebar-overlay ${showSidebar && isMobile ? "visible" : ""}`} onClick={() => setShowSidebar(false)} />

      <div className="calendar-main">
        <div className="calendar-header">
          <div className="header-controls">
            {/* mobile hamburger to open sidebar */}
            <button
              className="mobile-menu-btn"
              aria-label={showSidebar ? "Close sidebar" : "Open sidebar"}
              onClick={() => setShowSidebar((s) => !s)}
              title={showSidebar ? "Close sidebar" : "Open sidebar"}
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
