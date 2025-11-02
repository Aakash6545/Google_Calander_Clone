import mongoose from "mongoose"

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    startTime: {
      type: Date,
      required: [true, "Please provide a start time"],
    },
    endTime: {
      type: Date,
      required: [true, "Please provide an end time"],
    },
    location: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: "#1f2937",
      enum: ["#1f2937", "#dc2626", "#ea580c", "#d97706", "#16a34a", "#0891b2", "#2563eb", "#7c3aed"],
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrencePattern: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: null,
    },
    recurrenceEnd: {
      type: Date,
      default: null,
    },
    parentEventId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true },
)

// Validate that endTime is after startTime
eventSchema.pre("save", function (next) {
  if (this.endTime <= this.startTime) {
    throw new Error("End time must be after start time")
  }
  next()
})

export default mongoose.model("Event", eventSchema)
