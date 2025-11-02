# Google Calendar Clone

A fully functional Google Calendar clone built with React, Node.js, Express, and MongoDB. This project demonstrates a complete full-stack web application with multiple calendar views, event management, and recurring events support.

## Features

- **Multiple Calendar Views**: Month, Week, and Day views for flexible event browsing
- **Event Management**: Create, read, update, and delete events
- **Event Customization**: Color coding, location, description, and all-day event support
- **Recurring Events**: Support for daily, weekly, monthly, and yearly recurring events
- **Mini Calendar Navigation**: Quick date selection from sidebar mini calendar
- **Upcoming Events**: Quick view of upcoming events in the sidebar
- **Smooth Animations**: Polished transitions and hover effects throughout the UI
- **Responsive Design**: Works seamlessly on different screen sizes
- **Real-time Updates**: Events update instantly without page reload

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Vanilla CSS** - Custom styling for calendar components

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

## Project Structure

\`\`\`
google-calendar-clone/
├── backend/
│   ├── models/
│   │   └── Event.js          # Mongoose event schema
│   ├── routes/
│   │   └── events.js         # API endpoints
│   ├── server.js             # Express server setup
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calendar.jsx      # Main calendar component
│   │   │   ├── MonthView.jsx     # Month calendar view
│   │   │   ├── WeekView.jsx      # Week calendar view
│   │   │   ├── DayView.jsx       # Day calendar view
│   │   │   ├── EventModal.jsx    # Event creation/editing modal
│   │   │   ├── Sidebar.jsx       # Sidebar with mini calendar
│   │   │   └── MiniCalendar.jsx  # Mini calendar component
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .gitignore
│
└── README.md
\`\`\`

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env` file based on `.env.example`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Update the `.env` file with your MongoDB URI:
   \`\`\`
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/google-calendar-clone?retryWrites=true&w=majority
   PORT=5000
   \`\`\`

5. Start the backend server:
   \`\`\`bash
   npm start
   \`\`\`
   
   Or for development with auto-reload:
   \`\`\`bash
   npm run dev
   \`\`\`

The backend will run on `http://localhost:5000`

### Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

The frontend will typically run on `http://localhost:5173`

## API Endpoints

### Get Events
- **GET** `/api/events` - Retrieve all events or events in a date range
  - Query Parameters:
    - `startDate` (optional): ISO string of start date
    - `endDate` (optional): ISO string of end date

### Get Single Event
- **GET** `/api/events/:id` - Get a specific event by ID

### Create Event
- **POST** `/api/events`
  - Body:
    \`\`\`json
    {
      "title": "Meeting",
      "description": "Team sync",
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T11:00:00Z",
      "location": "Conference Room",
      "color": "#2563eb",
      "allDay": false,
      "isRecurring": false,
      "recurrencePattern": "weekly",
      "recurrenceEnd": "2024-03-15T00:00:00Z"
    }
    \`\`\`

### Update Event
- **PUT** `/api/events/:id`
  - Body: Same as Create Event

### Delete Event
- **DELETE** `/api/events/:id` - Delete an event

## How to Use

### Creating an Event
1. Click on any date in the calendar to open the event creation modal
2. Fill in the event details (title, description, location, time)
3. Select a color for the event
4. Enable recurring if needed and set the pattern
5. Click "Create" to save the event

### Editing an Event
1. Click on an existing event to open the edit modal
2. Update the desired fields
3. Click "Update" to save changes

### Deleting an Event
1. Click on an event to open its details
2. Click the "Delete" button
3. The event will be immediately removed

### Switching Views
- Use the "Day", "Week", and "Month" buttons in the header to switch between views
- Use navigation arrows to move between time periods
- Click "Today" to jump to the current date

### Mini Calendar
- Use the mini calendar in the sidebar for quick navigation to any date
- Click on a date in the mini calendar to jump to that date

## Features Explained

### Multiple Views

**Month View**
- See entire month at a glance
- Events displayed as colored blocks on each day
- Click any date to create a new event
- Shows up to 2 event titles per day with "+X more" indicator

**Week View**
- See detailed hourly breakdown for 7 days
- Events displayed as blocks in their time slots
- Easy to spot time conflicts
- Click any time slot to create an event at that time

**Day View**
- Focused view of a single day
- Full hourly timeline from 00:00 to 23:59
- Detailed event information including location

### Event Colors

8 predefined colors for organizing events by category:
- Gray, Red, Orange, Yellow, Green, Cyan, Blue, Purple

### Recurring Events

Support for repeating events:
- **Daily**: Event repeats every day
- **Weekly**: Event repeats every 7 days
- **Monthly**: Event repeats on the same date each month
- **Yearly**: Event repeats on the same date each year
- Set an optional end date for recurring events

### All-Day Events

Events can be marked as all-day, which:
- Removes the time selection requirement
- Displays at the top of day/week views
- Useful for birthdays, holidays, etc.

## Edge Cases Handled

1. **Overlapping Events**: Multiple events can exist at the same time; they're all displayed
2. **All-Day Events**: Handled separately from timed events
3. **Recurring Event Generation**: Events are generated dynamically within the queried date range
4. **End Time Validation**: Ensures end time is after start time
5. **Timezone Support**: Uses ISO 8601 format for consistent timezone handling
6. **Event Duration**: Minimum event duration is 30 minutes in the UI

## Animations & Interactions

- **Modal Animations**: Smooth fade-in and slide-up effects when opening/closing modals
- **Hover Effects**: Calendar cells and events provide visual feedback on hover
- **Smooth Transitions**: 200ms transitions on interactive elements
- **Color Transitions**: Smooth color changes on button states
- **Responsive Feedback**: Immediate visual response to user interactions

## Development

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- Thunder Client (for API testing)

### Troubleshooting

**Backend Won't Connect to MongoDB**
- Verify MongoDB is running (if local)
- Check connection string in `.env`
- Ensure network access is allowed (if using MongoDB Atlas)
- Check firewall settings

**Frontend Won't Load Events**
- Verify backend server is running on port 5000
- Check browser console for error messages
- Ensure CORS is properly configured
- Try clearing browser cache and reloading

**Port Already in Use**
- Change the PORT in backend `.env` file
- Change the vite port: `npm run dev -- --port 3000`

## Future Enhancements

1. **User Authentication**: Add login/signup with JWT tokens
2. **Multiple Calendars**: Support multiple calendar collections per user
3. **Calendar Sharing**: Share calendars with other users
4. **Notifications**: Add event reminders and notifications
5. **Import/Export**: Support iCal format import/export
6. **Search**: Add event search functionality
7. **Drag & Drop**: Enable dragging events to reschedule
8. **Mobile App**: React Native version for iOS/Android
9. **Performance**: Add infinite scrolling and event caching
10. **Customization**: Theme customization and settings panel

## License

This project is open source and available under the MIT License.

## Author

Created as a full-stack demonstration project for educational purposes.

---

**Ready to use!** Simply clone the repository, install dependencies, configure MongoDB URI, and run both backend and frontend servers. All files are properly organized and ready for GitHub deployment.
\`\`\`

```text file=".gitignore"
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Build outputs
dist/
build/

# OS
Thumbs.db
.DS_Store
