# Calendar Clone — README

This is the documentation of project describing what the project does, how to run it, architecture and implementation notes

## What this is
A single-page calendar application (assignment) with:
- Month / Week / Day views
- Sidebar mini-calendar + upcoming events
- Create / update / delete events via a modal
- Responsive layout: sidebar overlays on small screens, visible on large screens (hamburger toggles)
- Server API integration at `/api/events` (expects startDate/endDate query params)

## Quick setup (Windows)
Requirements: Node 16+ / npm or yarn

1. Install
   - Open terminal in project root:
     - npm: `npm install`
     - yarn: `yarn`
2. Dev server
   - npm: `npm run dev`
   - yarn: `yarn dev`
3. Build / production
   - npm: `npm run build` then `npm start`
4. Env / API
   - Ensure the backend or API route is available at `/api/events`.
   - If using a separate backend, set API base in your integration (env vars or proxy).

## Project structure (high level)
- frontend/src/components
  - Calendar.jsx — root calendar controller (state, view, sidebar control, fetch orchestration)
  - Sidebar.jsx / MiniCalendar.jsx — sidebar UI, upcoming events fetch, date picker
  - MonthView.jsx / WeekView.jsx / DayView.jsx — view-specific rendering + event layout
  - EventModal.jsx — create/update/delete event UI
- CSS files per component for modular styling and responsive rules

## Architecture & technology choices
- Framework: React (client components) — simple component-driven UI for an assignment
- CSS: component stylesheets (responsive rules / media queries)
- Data flow:
  - Calendar is the single source of truth for visible date range and triggers fetches (via onFetchEvents).
  - Sidebar fetches upcoming events itself (abortable fetch with AbortController) and exposes a refreshKey prop to re-fetch after changes.
- Layout and performance:
  - Month view renders a grid with padded null cells for consistent layout.
  - Week/Day views use absolute positioning for event blocks to support overlapping and precise timing.
  - AbortController used to avoid races on navigation and tab visibility handlers to refresh when user returns.

## Business logic & edge cases handled
- Date normalization:
  - Inputs are normalized to Date objects; invalid dates are guarded.
  - Comparisons use numeric timestamps to avoid locale pitfalls.
- Ranges:
  - getStartDate/getEndDate compute correct inclusive ranges for month/week/day.
- Event validity:
  - Events are normalized (start/end) and fallback end times are computed if missing.
  - Events spanning midnight are considered in day filters (an event is included if it intersects the day range).
- Overlapping events:
  - Week view has a layout algorithm to detect overlaps and allocate columns so overlapping events render side-by-side without visual collision.
- Network robustness:
  - Sidebar fetch uses AbortController and error handling; visibilitychange triggers a lightweight refresh.
- Accessibility & keyboard:
  - Clickable rows have keyboard handlers (Enter / Space).
  - Focus and aria attributes added to interactive elements.

## Animations & interactions
- Sidebar open/close: CSS transform transitions for smooth slide-in/out and an overlay with fade transition.
- Buttons: subtle hover and translateY micro-interactions.
- Event blocks: box-shadow, transform on focus to indicate elevation.
- Modal: simple fade/scale (CSS) for create/update flows.
- No heavy JS animation library used — CSS transitions for simplicity and performance.

## Known limitations & recommended future enhancements
Short-term / priority
- Recurring events: not implemented — add recurrence rules (RRULE) and expansion logic server- or client-side.
- Drag & drop for resizing/moving events.
- Timezone handling: currently uses local timezone; add explicit timezone support.
- Server validation: ensure server enforces event constraints (conflicts, required fields).
- Tests: add unit tests for layout algorithms (overlap detection) and integration tests for sidebar refresh flows.

UX / polish
- Improve MonthView "more" handling: inline popover or in-cell expand on small screens.
- Better offline support / optimistic UI for create/update/delete.
- Accessibility audit: ARIA roles, focus trap in modal, more keyboard shortcuts.

## How to debug the common issues encountered in the assignment
- Sidebar not updating: verify Calendar increments refreshKey after create/update/delete and Sidebar uses refreshKey in useEffect.
- Sidebar visibility: check CSS media queries and Calendar's isMobile logic; hamburger toggles showSidebar.
- Events clipped in Week/Day views: ensure `.events-container` / `.day-column` use `overflow: visible` and event blocks use `box-sizing: border-box`.
- Racey fetches: check AbortController usage; on navigation new fetch should cancel previous.

If you want, I can:
- Add a short CONTRIBUTING or developer notes file with run/debug tips.
- Produce unit tests for the WeekView overlap layout and Sidebar fetch behavior.
