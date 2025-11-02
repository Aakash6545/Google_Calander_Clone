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
        color: event.color || "#1f2937",
        allDay: event.allDay || false,
        startTime: startTime.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16),
        isRecurring: event.isRecurring || false,
        recurrencePattern: event.recurrencePattern || "daily",
        recurrenceEnd: event.recurrenceEnd ? new Date(event.recurrenceEnd).toISOString().slice(0, 10) : "",
      })
    } else {
      const start = new Date(date || Date.now())
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
          <div style={{display: "flex", flexDirection: "column", gap: 2}}>
            <h2>{event ? "Edit event" : "Create event"}</h2>
            <div className="sub">{new Date(formData.startTime).toLocaleString()}</div>
          </div>

          <button className="close-btn" onClick={onClose} aria-label="Close">
            {/* simple x svg */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="event-top">
            <div className="event-indicator" style={{ backgroundColor: formData.color }}></div>
            <div style={{flex: 1}}>
              <div className="form-group">
                <label htmlFor="title">Event title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Add title"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start</label>
              <input
                type={formData.allDay ? "date" : "datetime-local"}
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End</label>
              <input
                type={formData.allDay ? "date" : "datetime-local"}
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between"}}>
            <div style={{display: "flex", gap: 12, alignItems: "center"}}>
              <label className="switch" title="All day">
                <input
                  type="checkbox"
                  name="allDay"
                  checked={formData.allDay}
                  onChange={(e) => {
                    // toggle and optionally adjust inputs (keeps behavior)
                    handleChange(e)
                    // If enabling allDay, convert datetime to date strings
                    if (e.target.checked) {
                      const start = new Date(formData.startTime)
                      const end = new Date(formData.endTime)
                      handleChange({ target: { name: "startTime", value: start.toISOString().slice(0,10) }})
                      handleChange({ target: { name: "endTime", value: end.toISOString().slice(0,10) }})
                    }
                  }}
                />
              </label>
              <div style={{fontSize:13, color:"#374151"}}>All day</div>
            </div>

            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <div style={{fontSize:13, color:"#374151", marginRight:6}}>Color</div>
              <div className="color-picker" role="list">
                {COLORS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    className={`color-option ${formData.color === colorOption.value ? "selected" : ""}`}
                    style={{ backgroundColor: colorOption.value }}
                    onClick={() => handleColorSelect(colorOption.value)}
                    title={colorOption.name}
                    aria-label={colorOption.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Add location"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add description"
            />
          </div>

          <div className="form-group">
            <label>
              <input type="checkbox" name="isRecurring" checked={formData.isRecurring} onChange={handleChange} />
              &nbsp;Recurring
            </label>
          </div>

          {formData.isRecurring && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="recurrencePattern">Repeat</label>
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
                  <label htmlFor="recurrenceEnd">Ends on</label>
                  <input
                    type="date"
                    id="recurrenceEnd"
                    name="recurrenceEnd"
                    value={formData.recurrenceEnd}
                    onChange={handleChange}
                  />
                </div>
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
                {event ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
