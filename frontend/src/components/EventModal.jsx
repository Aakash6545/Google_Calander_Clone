"use client"

import { useState, useEffect } from "react"
import "./EventModal.css"

const COLORS = [
  { name: "Gray", value: "#1f2937" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Yellow", value: "#d97706" },
  { name: "Green", value: "#16a34a" },
  { name: "Cyan", value: "#0891b2" },
  { name: "Blue", value: "#2563eb" },
  { name: "Purple", value: "#7c3aed" },
]

export default function EventModal({ event, date, onClose, onCreate, onUpdate, onDelete }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    color: "#1f2937",
    allDay: false,
    startTime: "",
    endTime: "",
    isRecurring: false,
    recurrencePattern: "daily",
    recurrenceEnd: "",
  })

  useEffect(() => {
    if (event) {
      const startTime = new Date(event.startTime)
      const endTime = new Date(event.endTime)
      setFormData({
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        color: event.color,
        allDay: event.allDay,
        startTime: startTime.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16),
        isRecurring: event.isRecurring,
        recurrencePattern: event.recurrencePattern || "daily",
        recurrenceEnd: event.recurrenceEnd ? new Date(event.recurrenceEnd).toISOString().slice(0, 10) : "",
      })
    } else {
      const start = new Date(date)
      start.setHours(12, 0, 0, 0)
      const end = new Date(start)
      end.setHours(13, 0, 0, 0)

      setFormData({
        title: "",
        description: "",
        location: "",
        color: "#1f2937",
        allDay: false,
        startTime: start.toISOString().slice(0, 16),
        endTime: end.toISOString().slice(0, 16),
        isRecurring: false,
        recurrencePattern: "daily",
        recurrenceEnd: "",
      })
    }
  }, [event, date])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleColorSelect = (color) => {
    setFormData((prev) => ({
      ...prev,
      color,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const eventData = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      recurrenceEnd: formData.recurrenceEnd ? new Date(formData.recurrenceEnd).toISOString() : null,
    }

    if (event) {
      onUpdate(eventData)
    } else {
      onCreate(eventData)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? "Edit Event" : "Create Event"}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter event location"
            />
          </div>

          <div className="form-group">
            <label>
              <input type="checkbox" name="allDay" checked={formData.allDay} onChange={handleChange} />
              All day event
            </label>
          </div>

          {!formData.allDay && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startTime">Start Time *</label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endTime">End Time *</label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Event Color</label>
            <div className="color-picker">
              {COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  className={`color-option ${formData.color === colorOption.value ? "selected" : ""}`}
                  style={{ backgroundColor: colorOption.value }}
                  onClick={() => handleColorSelect(colorOption.value)}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>
              <input type="checkbox" name="isRecurring" checked={formData.isRecurring} onChange={handleChange} />
              Recurring event
            </label>
          </div>

          {formData.isRecurring && (
            <>
              <div className="form-group">
                <label htmlFor="recurrencePattern">Pattern</label>
                <select
                  id="recurrencePattern"
                  name="recurrencePattern"
                  value={formData.recurrencePattern}
                  onChange={handleChange}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="recurrenceEnd">Recurrence End Date</label>
                <input
                  type="date"
                  id="recurrenceEnd"
                  name="recurrenceEnd"
                  value={formData.recurrenceEnd}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="modal-footer">
            {event && (
              <button type="button" className="btn-delete" onClick={onDelete}>
                Delete
              </button>
            )}
            <div className="footer-buttons">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-save">
                {event ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
