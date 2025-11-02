"use client"

import { useState, useEffect } from "react"
import Calendar from "./components/Calendar"
import "./App.css"

export default function App() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async (startDate, endDate) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.append("startDate", startDate.toISOString())
      if (endDate) params.append("endDate", endDate.toISOString())

      const response = await fetch(`/api/events?${params}`)
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (eventData) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })
      const newEvent = await response.json()
      setEvents([...events, newEvent])
      return newEvent
    } catch (error) {
      console.error("Error creating event:", error)
    }
  }

  const updateEvent = async (eventId, eventData) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })
      const updatedEvent = await response.json()
      setEvents(events.map((e) => (e._id === eventId ? updatedEvent : e)))
      return updatedEvent
    } catch (error) {
      console.error("Error updating event:", error)
    }
  }

  const deleteEvent = async (eventId) => {
    try {
      await fetch(`/api/events/${eventId}`, { method: "DELETE" })
      setEvents(events.filter((e) => e._id !== eventId))
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  return (
    <div className="app">
      <Calendar
        events={events}
        onCreateEvent={createEvent}
        onUpdateEvent={updateEvent}
        onDeleteEvent={deleteEvent}
        onFetchEvents={fetchEvents}
        loading={loading}
      />
    </div>
  )
}
