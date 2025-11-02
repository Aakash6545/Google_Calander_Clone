import express from "express"
import Event from "../models/Event.js"

const router = express.Router()

// Helper function to generate recurring events
const generateRecurringInstances = (event, startDate, endDate) => {
  const instances = []
  const currentDate = new Date(event.startTime)
  const recEnd = event.recurrenceEnd || endDate

  while (currentDate <= recEnd && currentDate <= endDate) {
    if (currentDate >= startDate) {
      const duration = event.endTime - event.startTime
      instances.push({
        ...event.toObject(),
        _id: new (require("mongodb").ObjectId)(),
        startTime: new Date(currentDate),
        endTime: new Date(currentDate.getTime() + duration),
        parentEventId: event._id,
      })
    }

    // Increment based on pattern
    switch (event.recurrencePattern) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + 1)
        break
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
      case "yearly":
        currentDate.setFullYear(currentDate.getFullYear() + 1)
        break
      default:
        break
    }
  }

  return instances
}

// Get all events or events in a date range
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    let query = {}
    if (startDate && endDate) {
      query = {
        $or: [
          {
            startTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
          },
          {
            endTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
          },
          {
            startTime: { $lte: new Date(startDate) },
            endTime: { $gte: new Date(endDate) },
          },
        ],
      }
    }

    const events = await Event.find(query).sort({ startTime: 1 })

    // Process recurring events
    const allEvents = []
    for (const event of events) {
      if (event.isRecurring && startDate && endDate) {
        const instances = generateRecurringInstances(event, new Date(startDate), new Date(endDate))
        allEvents.push(...instances)
      } else {
        allEvents.push(event)
      }
    }

    res.json(allEvents)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single event
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      return res.status(404).json({ error: "Event not found" })
    }
    res.json(event)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create new event
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      color,
      allDay,
      isRecurring,
      recurrencePattern,
      recurrenceEnd,
    } = req.body

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ error: "Title, start time, and end time are required" })
    }

    const event = new Event({
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      color,
      allDay,
      isRecurring,
      recurrencePattern,
      recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
    })

    await event.save()
    res.status(201).json(event)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update event
router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      color,
      allDay,
      isRecurring,
      recurrencePattern,
      recurrenceEnd,
    } = req.body

    const event = await Event.findById(req.params.id)
    if (!event) {
      return res.status(404).json({ error: "Event not found" })
    }

    if (title) event.title = title
    if (description !== undefined) event.description = description
    if (startTime) event.startTime = new Date(startTime)
    if (endTime) event.endTime = new Date(endTime)
    if (location !== undefined) event.location = location
    if (color) event.color = color
    if (allDay !== undefined) event.allDay = allDay
    if (isRecurring !== undefined) event.isRecurring = isRecurring
    if (recurrencePattern) event.recurrencePattern = recurrencePattern
    if (recurrenceEnd !== undefined) event.recurrenceEnd = recurrenceEnd ? new Date(recurrenceEnd) : null

    await event.save()
    res.json(event)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete event
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)
    if (!event) {
      return res.status(404).json({ error: "Event not found" })
    }
    res.json({ message: "Event deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
