# Functional Specification Document (FSD)

# Vora – Smart Habit Tracking & Task Management Web Application

---

## Document Information

| Field              | Detail                                              |
| ------------------ | --------------------------------------------------- |
| **Document Title** | Vora – Functional Specification Document            |
| **Version**        | 2.0                                                 |
| **Date**           | 2026-03-25                                          |
| **PRD Reference**  | `prd.md` v3.0                                       |
| **Author**         | [Author Name]                                       |
| **Reviewers**      | [Product Owner], [Tech Lead], [QA Lead]             |
| **Status**         | Draft                                               |

---

## 1. Executive Summary

Vora is a Progressive Web Application (PWA) that unifies **habit tracking**, **task management**, and **emotional awareness** into a single platform. The system enables users to create and track habits across daily, weekly, and monthly frequencies; manage prioritized tasks with sub-tasks and smart postponement; and participate in a **Smart Daily Check-in** that captures mood at the moment of habit completion.

The application shall persist data to a PostgreSQL database via Prisma ORM, support offline operation through service workers, and deliver a responsive experience across mobile (320px+), tablet (768px+), and desktop (1024px+) viewports. Authentication shall be handled via NextAuth.js supporting email credentials and Google OAuth.

This FSD translates all 21 user stories and 13 in-scope features from the PRD into 60+ testable functional requirements with business rules, acceptance criteria, data specifications, and interface contracts.

---

## 2. Scope

### 2.1 In Scope

- User authentication (registration, login, logout, session management)
- Habit CRUD with categories, colors, frequencies (daily/weekly/monthly), and reminders
- Smart Daily Check-in modal with positive and negative mood paths
- Task CRUD with sub-tasks, priorities, due dates, recurrence, and auto-postpone
- Analytics dashboard (completion rate, line chart, streaks, calendar heatmap)
- Theme system (light/dark mode, per-habit color customization)
- Responsive layout with bottom navigation (mobile) / sidebar (desktop)
- PWA: service worker, offline support, installability
- Animations and micro-interactions (completion stamps, mascot, confetti)
- WCAG 2.1 AA accessibility compliance
- Browser notifications for habit reminders
- Event analytics tracking

### 2.2 Out of Scope

- Social features, collaborative habits, gamification
- AI-powered recommendations
- Third-party calendar integrations
- Data export/import
- Native mobile applications
- Admin dashboard
- Localization (i18n) — architecture-ready only

### 2.3 Assumptions

| ID   | Assumption                                                                                   |
| ---- | -------------------------------------------------------------------------------------------- |
| A-01 | Users have a modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)                 |
| A-02 | Users will grant notification permissions voluntarily; reminders degrade gracefully if denied |
| A-03 | PostgreSQL database is provisioned and accessible; Prisma migrations handle schema           |
| A-04 | OAuth credentials (Google) are configured in the deployment environment                      |
| A-05 | The mascot is a single, pre-designed character with multiple emotional state sprites/animations |
| A-06 | MVP 1 operates in English only                                                               |
| A-07 | Rate limiting is required: 100 req/min general API, 10 req/min auth endpoints (EPIC-010)     |
| A-08 | Maximum latency for API responses shall be ≤ 200ms (P95) under normal load                  |

### 2.4 Dependencies

| ID   | Dependency                                                    | Type       |
| ---- | ------------------------------------------------------------- | ---------- |
| D-01 | Next.js 14+ framework                                        | Technical  |
| D-02 | Prisma ORM + PostgreSQL database                              | Technical  |
| D-03 | NextAuth.js authentication library                            | Technical  |
| D-04 | Chart library (Recharts or Chart.js) for analytics            | Technical  |
| D-05 | Service worker tooling (next-pwa or Workbox)                  | Technical  |
| D-06 | Mascot design assets (multiple emotional states)              | Design     |
| D-07 | Predefined color palette (8–12 colors) finalized by design    | Design     |

---

## 3. User Roles & Permissions

| Role                | Description                                        | Key Capabilities                                                                                       |
| ------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Anonymous User**  | Unauthenticated visitor                            | View login/register page only. No access to app features.                                              |
| **Authenticated User** | Registered and logged-in user                   | Full CRUD on own habits and tasks. Access to own analytics, mood check-ins, settings. No cross-user access. |

> **Note:** MVP 1 has a single user role. All authenticated users have identical permissions scoped to their own data. Admin roles are out of scope.

---

## 4. Functional Requirements

### 4.1 Authentication & Session Management

#### FR-001: User Registration (Email)
- **Priority:** Must Have
- **PRD Reference:** US-20, Scope Item 11
- **User Story:** As a new user, I want to register with my email so I can create an account.
- **Business Rules:**
  - BR-001: Email must be unique across all accounts
  - BR-002: Password must be ≥ 8 characters with ≥ 1 uppercase, ≥ 1 lowercase, ≥ 1 digit
  - BR-003: Email must match RFC 5322 format
- **Acceptance Criteria:**
  - [ ] Given I am on the registration page, when I enter a valid email and password, then my account is created and I am redirected to the Home Dashboard
  - [ ] Given I enter an email already in use, when I submit, then I see an error: "An account with this email already exists"
  - [ ] Given I enter a weak password, when I submit, then I see inline validation errors specifying the unmet requirements
  - [ ] Given registration succeeds, then a `user_registered` analytics event is fired with `authMethod: "email"`
- **Error Handling:**
  - Network failure → Display: "Unable to connect. Please check your internet connection and try again."
  - Server error (5xx) → Display: "Something went wrong. Please try again later."

#### FR-002: User Registration (OAuth – Google)
- **Priority:** Must Have
- **PRD Reference:** US-20, Scope Item 11
- **User Story:** As a new user, I want to register with my Google account for faster onboarding.
- **Business Rules:**
  - BR-004: If a Google account email matches an existing email credential account, the accounts shall be linked
  - BR-005: Google profile name shall be used as the display name; user can change it later
- **Acceptance Criteria:**
  - [ ] Given I click "Continue with Google", when I authorize in the Google popup, then my account is created and I am redirected to the Home Dashboard
  - [ ] Given the Google popup is closed without authorization, then I remain on the registration page with no error
  - [ ] Given registration succeeds, then a `user_registered` event fires with `authMethod: "google"`
- **Error Handling:**
  - OAuth failure → Display: "Google sign-in failed. Please try again or use email registration."

#### FR-003: User Login
- **Priority:** Must Have
- **PRD Reference:** US-20
- **User Story:** As a returning user, I want to log in so I can access my data.
- **Business Rules:**
  - BR-006: After 5 consecutive failed login attempts, the account shall be temporarily locked for 15 minutes
  - BR-007: Sessions shall expire after 30 days of inactivity
  - BR-008: A valid session token (JWT) must be present for all authenticated API requests
- **Acceptance Criteria:**
  - [ ] Given I enter valid credentials, when I click "Log in", then I am redirected to the Home Dashboard
  - [ ] Given I enter invalid credentials, when I click "Log in", then I see "Invalid email or password"
  - [ ] Given I am already logged in, when I navigate to the login page, then I am redirected to the Home Dashboard
  - [ ] Given login succeeds, then a `user_logged_in` event fires
- **Error Handling:**
  - Account locked → Display: "Too many failed attempts. Please try again in 15 minutes."

#### FR-004: User Logout
- **Priority:** Must Have
- **PRD Reference:** US-20
- **Business Rules:**
  - BR-009: Logout shall invalidate the current session token
  - BR-010: Locally cached data shall be preserved for offline access upon re-login
- **Acceptance Criteria:**
  - [ ] Given I am logged in, when I click "Log out", then my session is terminated and I am redirected to the login page
  - [ ] Given I log out, when I use the browser back button, then I cannot access authenticated pages

#### FR-005: Session Persistence
- **Priority:** Must Have
- **PRD Reference:** US-21
- **Business Rules:**
  - BR-011: Sessions shall persist across browser restarts (using HTTP-only cookies or localStorage tokens)
  - BR-012: When a session expires, the user shall be prompted to re-authenticate
- **Acceptance Criteria:**
  - [ ] Given I close and reopen the browser within 30 days, then I am still logged in
  - [ ] Given my session expired, when I perform any action, then I see a re-login prompt

---

### 4.2 Habit Management

#### FR-006: Create Habit
- **Priority:** Must Have
- **PRD Reference:** US-01, Scope Item 2
- **User Story:** As a user, I want to create a new habit with name, category, color, and frequency.
- **Business Rules:**
  - BR-013: Habit name is required; max 100 characters
  - BR-014: Category must be selected from the predefined list or user-created categories
  - BR-015: Color must be selected from the predefined palette (8–12 colors)
  - BR-016: Frequency must be one of: Daily, Weekly, Monthly
  - BR-017: For Daily frequency: target value (numeric) and unit (text) are required
  - BR-018: For Weekly frequency: at least 1 day must be selected (Mon–Sun)
  - BR-019: For Monthly frequency: at least 1 date must be selected (1–31)
  - BR-020: Reminder time is optional; if set, must be a valid time (HH:MM)
- **Acceptance Criteria:**
  - [ ] Given I click "Add Habit", then a creation form appears with: name (text input), category (dropdown), color (picker), frequency (radio: Daily/Weekly/Monthly)
  - [ ] Given I select "Daily" frequency, then I see target value and unit fields
  - [ ] Given I select "Weekly" frequency, then I see day-of-week checkboxes (Mon–Sun)
  - [ ] Given I select "Monthly" frequency, then I see a calendar modal for date selection
  - [ ] Given I fill all required fields and click "Save", then the habit is created, appears in my habit list, and a `habit_created` event fires
  - [ ] Given I leave the name blank, when I click "Save", then I see "Habit name is required"
  - [ ] Given I select Weekly but no days, when I click "Save", then I see "Select at least one day"
- **Error Handling:**
  - Network failure on save → Queue locally; show toast: "Saved offline. Will sync when connected."
  - Duplicate habit name → Allow (no uniqueness constraint on name)

#### FR-007: Read / View Habits (Home Dashboard)
- **Priority:** Must Have
- **PRD Reference:** US-02, US-03, Scope Item 1
- **User Story:** As a user, I want to see my habits for today on the Home Dashboard.
- **Business Rules:**
  - BR-021: The dashboard shall display only habits scheduled for the current date based on their frequency settings
  - BR-022: Daily habits appear every day
  - BR-023: Weekly habits appear only on their selected days
  - BR-024: Monthly habits appear only on their selected dates
  - BR-025: Habits shall be grouped by category when category filter is active
  - BR-026: Each habit card shall display: name, category icon, color indicator, completion checkbox, and streak count
- **Acceptance Criteria:**
  - [ ] Given I navigate to Home, then I see all habits scheduled for today
  - [ ] Given I have a weekly habit set for Monday and today is Monday, then it appears in the list
  - [ ] Given I have a weekly habit set for Monday and today is Tuesday, then it does NOT appear
  - [ ] Given I have no habits, then I see an empty state with a "Create your first habit" CTA
  - [ ] Given I click the calendar, then I can navigate to other dates and see habits scheduled for those dates

#### FR-008: Update Habit
- **Priority:** Must Have
- **PRD Reference:** US-04
- **User Story:** As a user, I want to edit an existing habit.
- **Business Rules:**
  - BR-027: All fields from creation are editable
  - BR-028: Changing frequency shall not delete historical completion data
  - BR-029: Changes take effect from the current day forward
- **Acceptance Criteria:**
  - [ ] Given I click the edit icon on a habit, then the edit form opens pre-populated with current values
  - [ ] Given I change the name and click "Save", then the habit updates immediately in the list
  - [ ] Given I change frequency from Daily to Weekly, then the habit only appears on selected days going forward while historical data is preserved

#### FR-009: Delete Habit
- **Priority:** Must Have
- **PRD Reference:** US-04
- **Business Rules:**
  - BR-030: Deletion shall be soft-delete (set `deletedAt` timestamp; do not destroy data)
  - BR-031: A confirmation dialog must appear before deletion
  - BR-032: Deleted habits shall not appear in the dashboard but historical analytics data shall be preserved
- **Acceptance Criteria:**
  - [ ] Given I click "Delete" on a habit, then a confirmation dialog appears: "Delete [habit name]? This action cannot be undone."
  - [ ] Given I confirm deletion, then the habit disappears from the list and a success toast appears
  - [ ] Given I cancel deletion, then no changes are made
  - [ ] Given a habit is deleted, then its historical data remains in analytics

#### FR-010: Complete Habit
- **Priority:** Must Have
- **PRD Reference:** US-02, Scope Item 3
- **User Story:** As a user, I want to mark a habit as complete for today.
- **Business Rules:**
  - BR-033: Clicking the habit checkbox shall immediately trigger the Smart Check-in modal (FR-015)
  - BR-034: Habit is marked complete ONLY after the check-in modal is closed (either completed or dismissed)
  - BR-035: For daily numeric habits, completion requires meeting the target value
  - BR-036: A completion record stores: `habitId`, `userId`, `date`, `completedAt` timestamp
  - BR-037: Only one completion per habit per calendar day is allowed
- **Acceptance Criteria:**
  - [ ] Given I click a habit checkbox, then the Smart Check-in modal opens
  - [ ] Given I complete or dismiss the check-in, then the habit shows a completion stamp animation and a `habit_completed` event fires
  - [ ] Given I already completed a habit today, then the checkbox is checked and the stamp is visible
  - [ ] Given I try to complete a habit for a past date, then completion is NOT allowed (current day only)

#### FR-011: Uncomplete Habit
- **Priority:** Must Have
- **PRD Reference:** Alternative Flow "Undo Completion"
- **Business Rules:**
  - BR-038: Unchecking a completed habit shall soft-delete the associated mood check-in record
  - BR-039: The completion stamp animation shall reverse
  - BR-040: A `habit_uncompleted` event shall fire
- **Acceptance Criteria:**
  - [ ] Given I uncheck a completed habit, then the completion is reverted, the stamp disappears, and the mood data for that check-in is soft-deleted
  - [ ] Given I uncheck, then I can re-complete the habit and a new check-in modal appears

#### FR-012: Category Sidebar / Drawer
- **Priority:** Must Have
- **PRD Reference:** US-03
- **Business Rules:**
  - BR-041: The sidebar shall list all predefined categories plus any user-created categories
  - BR-042: Each category shall display a count of active (non-deleted) habits in that category
  - BR-043: An "All" option shall be the default, showing all habits
  - BR-044: On mobile (< 768px), the sidebar shall render as a slide-out drawer
  - BR-045: On desktop (≥ 1024px), the sidebar shall be persistently visible
- **Acceptance Criteria:**
  - [ ] Given I open the category sidebar, then I see all categories with habit counts
  - [ ] Given I select "Sports", then only habits in the Sports category are shown
  - [ ] Given I select "All", then all habits are shown
  - [ ] Given I am on mobile, then the sidebar is a drawer that slides in from the left

#### FR-013: Interactive Calendar (Home)
- **Priority:** Must Have
- **PRD Reference:** Scope Item 1
- **Business Rules:**
  - BR-046: The calendar shall default to the current date
  - BR-047: Selecting a date shall update the habit list to show habits scheduled for that date
  - BR-048: Dates with completions shall show a dot indicator
  - BR-049: The calendar shall support month navigation (previous/next)
- **Acceptance Criteria:**
  - [ ] Given I view the Home Dashboard, then I see a calendar with today highlighted
  - [ ] Given I click a different date, then the habit list updates to show that date's habits
  - [ ] Given a date has completions, then a dot indicator appears on that date

#### FR-014: Habit Reminders / Notifications
- **Priority:** Must Have
- **PRD Reference:** US-05, Scope Item 13
- **Business Rules:**
  - BR-050: The system shall request browser notification permission upon first reminder setup
  - BR-051: If permission is denied, the reminder time is saved but no notifications are sent; a warning shall be shown
  - BR-052: Notifications shall display: habit name, "Time to [habit name]!", and "Mark as Done" action
  - BR-053: Notification timing shall respect the user's local timezone
  - BR-054: Notifications shall only fire on days the habit is scheduled
- **Acceptance Criteria:**
  - [ ] Given I set a reminder for 08:00, then I receive a browser notification at 08:00 local time on scheduled days
  - [ ] Given I denied notification permissions, then I see a warning: "Enable notifications in your browser settings to receive reminders"
  - [ ] Given I click the notification action, then the app opens and navigates to the Home Dashboard

---

### 4.3 Smart Daily Check-in & Mood Board

#### FR-015: Check-in Modal Trigger
- **Priority:** Must Have
- **PRD Reference:** US-06, Scope Item 3
- **Business Rules:**
  - BR-055: The modal shall trigger immediately when a user clicks a habit completion checkbox
  - BR-056: The modal is blocking — background interaction is disabled (overlay with backdrop blur)
  - BR-057: The modal must be dismissible via close (X) button or Escape key
  - BR-058: Dismissing the modal still marks the habit as complete (FR-010, BR-034)
- **Acceptance Criteria:**
  - [ ] Given I click a habit checkbox, then a modal overlay appears with blur backdrop, blocking interaction behind it
  - [ ] Given the modal is open, when I press Escape, then the modal closes and the habit is marked complete
  - [ ] Given the modal is open, when I click X, then a `mood_checkin_skipped` event fires and the habit is marked complete

#### FR-016: Mood Selection
- **Priority:** Must Have
- **PRD Reference:** US-06
- **Business Rules:**
  - BR-059: Six mood options shall be displayed: Happy (😊), Proud (💪), Worried (😟), Annoyed (😠), Sad (😢), Angry (😡)
  - BR-060: Exactly one mood must be selected per check-in
  - BR-061: Moods are classified as Positive (Happy, Proud) or Negative (Worried, Annoyed, Sad, Angry)
  - BR-062: Selection determines the subsequent path (positive vs. negative)
- **Acceptance Criteria:**
  - [ ] Given the check-in modal is open, then I see 6 mood options each with emoji icon and label
  - [ ] Given I click a mood, then it is visually highlighted and the flow advances to the appropriate path
  - [ ] Given I have not selected a mood, then I cannot advance (selection is required to proceed)

#### FR-017: Positive Mood Path
- **Priority:** Must Have
- **PRD Reference:** US-07
- **Business Rules:**
  - BR-063: A congratulatory message shall be displayed (randomized from a set of ≥ 5 messages)
  - BR-064: An animated mascot or "Good Job" stamp shall play
  - BR-065: The modal shall auto-close after 2 seconds (± 200ms)
  - BR-066: Mood data shall be stored before auto-close
- **Acceptance Criteria:**
  - [ ] Given I select "Happy" or "Proud", then I see a congratulatory message + mascot animation
  - [ ] Given 2 seconds elapse, then the modal auto-closes
  - [ ] Given the modal closes, then a `mood_checkin_completed` event fires with `isPositive: true`
  - [ ] Given the modal is auto-closing, when I click X before 2s, then it closes immediately

#### FR-018: Negative Mood Path
- **Priority:** Must Have
- **PRD Reference:** US-08
- **Business Rules:**
  - BR-067: Step 1: Display an empathetic acknowledgment message
  - BR-068: Step 2: Show follow-up: "What's making you feel this way?" with an optional text area (max 500 characters)
  - BR-069: Step 3: After optional reflection, show: "What would calm you down?" with 5 activity options
  - BR-070: The 5 calming activities are: Take a short break, Practice deep breathing, Listen to calming music, Talk to someone, Go for a walk
  - BR-071: Activity selection is optional; user can skip
  - BR-072: Step 4: Display a supportive mascot animation, then close
  - BR-073: All collected data (mood, reflection text, selected activity) shall be stored
- **Acceptance Criteria:**
  - [ ] Given I select a negative mood, then I see an empathetic message and a "What's making you feel this way?" prompt
  - [ ] Given I enter reflection text (optional) and click "Continue", then I see 5 calming activity suggestions
  - [ ] Given I select an activity or click "Skip", then I see a supportive mascot animation
  - [ ] Given the flow completes, then a `mood_checkin_completed` event fires with `isPositive: false`, `hasReflection`, and `selectedActivity`
  - [ ] Given I enter exactly 500 characters in the reflection field, then no more input is accepted

#### FR-019: Mood Data Persistence
- **Priority:** Must Have
- **PRD Reference:** US-06, US-07, US-08
- **Business Rules:**
  - BR-074: Each mood check-in record shall store: `id`, `userId`, `habitId`, `date`, `mood`, `isPositive`, `reflectionText` (nullable), `selectedActivity` (nullable), `createdAt`
  - BR-075: Duplicate check-in for the same habit on the same day shall overwrite the previous record
  - BR-076: Mood data shall be stored locally first, then synced to the server
- **Acceptance Criteria:**
  - [ ] Given I complete a check-in, then the data persists in the database
  - [ ] Given I complete the same habit twice on the same day (after uncompleting), then only the latest mood record is retained
  - [ ] Given I am offline during check-in, then the data is stored locally and syncs when connected

---

### 4.4 Task Management

#### FR-020: Create Task
- **Priority:** Must Have
- **PRD Reference:** US-10, Scope Item 4
- **Business Rules:**
  - BR-077: Title is required; max 200 characters
  - BR-078: Description is optional; supports rich text (bold, italic, lists); max 2000 characters
  - BR-079: Sub-tasks are optional; each sub-task has a title (max 200 chars) and a completion checkbox
  - BR-080: Due date is optional; must be today or a future date when creating
  - BR-081: Priority defaults to "Medium" if not specified
  - BR-082: Recurrence options: Does not repeat (default), Daily, Weekly, Monthly, Custom
  - BR-083: Auto-postpone defaults to OFF
- **Acceptance Criteria:**
  - [ ] Given I click "Add Task", then a form appears with all fields as specified
  - [ ] Given I enter a title and click "Save", then the task is created with default priority (Medium) and a `task_created` event fires
  - [ ] Given I add 3 sub-tasks, then each appears in an indented list with its own checkbox
  - [ ] Given I set a due date in the past, then I see "Due date must be today or later"

#### FR-021: Complete Task
- **Priority:** Must Have
- **PRD Reference:** US-11
- **Business Rules:**
  - BR-084: Completing a task shall trigger a strikethrough animation on the task title
  - BR-085: Sub-tasks can be completed independently of the parent task
  - BR-086: When all sub-tasks are completed, the parent task shall auto-complete
  - BR-087: Completing a parent task shall NOT auto-complete incomplete sub-tasks
  - BR-088: A `task_completed` event shall fire
- **Acceptance Criteria:**
  - [ ] Given I check a task checkbox, then the task title shows a strikethrough animation
  - [ ] Given I complete all 3 sub-tasks, then the parent task auto-completes
  - [ ] Given I uncheck a sub-task after parent auto-completed, then the parent reverts to incomplete

#### FR-022: Auto-Postpone
- **Priority:** Must Have
- **PRD Reference:** US-12
- **Business Rules:**
  - BR-089: When auto-postpone is ON and the task's due date has passed, the system shall move the due date to the current date
  - BR-090: Auto-postpone runs when the app loads (client-side) or via a server-side scheduled job
  - BR-091: The original due date shall be preserved in a `originalDueDate` field
  - BR-092: A postpone history log shall track each postponement with date and reason ("auto")
  - BR-093: Auto-postpone does NOT apply to completed tasks
- **Acceptance Criteria:**
  - [ ] Given a task with auto-postpone ON is overdue, when I open the app, then the task's due date updates to today
  - [ ] Given a completed task with auto-postpone ON is overdue, then no postponement occurs

#### FR-023: Task Filtering & Sorting
- **Priority:** Must Have
- **PRD Reference:** US-13
- **Business Rules:**
  - BR-094: Filter options: All, Today, Upcoming (due date > today), Overdue (due date < today, not completed)
  - BR-095: Sort options: Priority (default, High→Low), Due Date (ascending), Created Date (newest first)
  - BR-096: Filters and sorts persist for the session but reset on logout
- **Acceptance Criteria:**
  - [ ] Given I select "Today" filter, then I see only tasks due today
  - [ ] Given I select "Overdue" filter, then I see only incomplete tasks with past due dates
  - [ ] Given I select "Priority" sort, then tasks appear High → Medium → Low

#### FR-024: Task Recurrence
- **Priority:** Must Have
- **PRD Reference:** US-10
- **Business Rules:**
  - BR-097: When a recurring task is completed, a new instance shall be created for the next occurrence
  - BR-098: New instances inherit all properties except due date, which advances per recurrence rule
  - BR-099: Recurring tasks display a recurrence icon indicator
- **Acceptance Criteria:**
  - [ ] Given I complete a daily recurring task, then a new instance appears for tomorrow
  - [ ] Given I complete a weekly recurring task (set to Mondays), then a new instance appears for next Monday

#### FR-025: Edit Task
- **Priority:** Must Have
- **PRD Reference:** Implied by Task CRUD
- **Business Rules:**
  - BR-100: All fields from creation are editable
  - BR-101: Editing a recurring task shall prompt: "Edit this occurrence only" or "Edit all future occurrences"
- **Acceptance Criteria:**
  - [ ] Given I click edit on a task, then the form pre-populates with current values
  - [ ] Given I edit a recurring task, then I am prompted for scope of change

#### FR-026: Delete Task
- **Priority:** Must Have
- **Business Rules:**
  - BR-102: Soft-delete with confirmation dialog
  - BR-103: Deleting a recurring task shall prompt: "Delete this occurrence only" or "Delete all future occurrences"
- **Acceptance Criteria:**
  - [ ] Given I click delete, then a confirmation dialog appears
  - [ ] Given I confirm, then the task is removed from the list

---

### 4.5 Analytics Dashboard

#### FR-027: Completion Rate Gauge
- **Priority:** Must Have
- **PRD Reference:** US-14
- **Business Rules:**
  - BR-104: Formula: `(Completed Habits Today / Total Scheduled Habits Today) × 100`
  - BR-105: Displayed as a circular progress indicator with percentage in the center
  - BR-106: Updates in real-time when habits are completed/uncompleted
  - BR-107: If no habits are scheduled, display 0% with message "No habits scheduled today"
- **Acceptance Criteria:**
  - [ ] Given I have 3/5 habits complete, then the gauge shows 60%
  - [ ] Given I complete another habit, then the gauge animates to 80% without page reload

#### FR-028: Activity Line Chart
- **Priority:** Must Have
- **PRD Reference:** US-15
- **Business Rules:**
  - BR-108: X-axis: time periods; Y-axis: completion rate (0–100%)
  - BR-109: Toggle views: Weekly (last 7 days), Monthly (last 30 days), Yearly (last 12 months)
  - BR-110: Default view: Weekly
  - BR-111: Interactive tooltips shall show exact date and percentage on hover/tap
  - BR-112: Chart shall be lazy-loaded to optimize initial page load
- **Acceptance Criteria:**
  - [ ] Given I view the chart, then I see a line chart defaulting to Weekly view
  - [ ] Given I toggle to Monthly, then the chart updates with 30-day data
  - [ ] Given I hover over a data point, then a tooltip shows the date and percentage

#### FR-029: Streak & Statistics Cards
- **Priority:** Must Have
- **PRD Reference:** US-16
- **Business Rules:**
  - BR-113: **Streak Days 🔥**: Count of consecutive calendar days where ALL scheduled habits were completed. Resets to 0 on any missed day.
  - BR-114: **Perfect Days 🏆**: Total count of days with 100% habit completion (all time)
  - BR-115: **Active Days**: Total count of days with at least 1 habit completed (all time)
- **Acceptance Criteria:**
  - [ ] Given I have completed all habits for 7 consecutive days, then Streak shows 7 🔥
  - [ ] Given I miss all habits today, then Streak resets to 0
  - [ ] Given I have 15 days historically with 100% completion, then Perfect Days shows 15

#### FR-030: Calendar Heatmap
- **Priority:** Must Have
- **PRD Reference:** US-17
- **Business Rules:**
  - BR-116: Monthly grid layout; each cell represents a day
  - BR-117: Color coding: 🟢 Green (80–100%), 🟡 Yellow (40–79%), 🔴 Red (1–39%), ⚪ Gray (0% or no data)
  - BR-118: Each color-coded cell must also have an accessible non-color indicator (pattern or icon)
  - BR-119: Clicking a day opens a detailed breakdown showing each habit and its completion status
  - BR-120: Tooltips show: date, percentage, habits completed / habits scheduled
  - BR-121: Month navigation (previous/next) supported
- **Acceptance Criteria:**
  - [ ] Given I view the heatmap for the current month, then each day is color-coded per completion rate
  - [ ] Given I click a green day, then I see a breakdown of which habits were completed
  - [ ] Given I hover over a day, then I see a tooltip with date and percentage

---

### 4.6 Theme & Personalization

#### FR-031: Light / Dark Mode Toggle
- **Priority:** Must Have
- **PRD Reference:** US-18, Scope Item 7
- **Business Rules:**
  - BR-122: Default theme shall follow the system preference (`prefers-color-scheme`)
  - BR-123: User override persists in localStorage AND user profile (database)
  - BR-124: Theme switch shall apply instantly without page reload (CSS custom properties)
- **Acceptance Criteria:**
  - [ ] Given I toggle the theme switch, then the entire UI switches immediately
  - [ ] Given I set dark mode, close the browser, and reopen, then dark mode is still active
  - [ ] Given I log in on a new device, then my theme preference syncs from the database

#### FR-032: Habit Color Customization
- **Priority:** Must Have
- **PRD Reference:** US-19, Scope Item 7
- **Business Rules:**
  - BR-125: 8–12 predefined colors shall be available (defined by design team)
  - BR-126: Custom hex input is NOT supported in MVP 1
  - BR-127: Selected color applies to: habit card border/accent, calendar dot, analytics chart segment
- **Acceptance Criteria:**
  - [ ] Given I create a habit and pick the purple color, then the habit card shows purple accents
  - [ ] Given I change a habit's color from purple to green, then all UI elements update immediately

---

### 4.7 Navigation & Responsive Layout

#### FR-033: Bottom Navigation Bar (Mobile / Tablet)
- **Priority:** Must Have
- **PRD Reference:** Scope Item 6
- **Business Rules:**
  - BR-128: Three navigation items: Home (Habits), Tasks, Analytics
  - BR-129: Active tab shall be visually highlighted with the brand accent color
  - BR-130: Bottom nav is visible on viewports < 1024px
  - BR-131: Minimum touch target: 44×44px per nav item
- **Acceptance Criteria:**
  - [ ] Given I am on mobile, then I see a bottom navigation bar with 3 tabs
  - [ ] Given I tap "Tasks", then I navigate to the Tasks screen and the Tasks tab is highlighted
  - [ ] Given I am on desktop (≥ 1024px), then the bottom nav is hidden and a sidebar appears instead

#### FR-034: Sidebar Navigation (Desktop)
- **Priority:** Must Have
- **PRD Reference:** Scope Item 6
- **Business Rules:**
  - BR-132: Sidebar replaces bottom nav on viewports ≥ 1024px
  - BR-133: Sidebar shall include: navigation items, user avatar, theme toggle, and logout option
  - BR-134: Sidebar is persistently visible (not collapsible in MVP 1)
- **Acceptance Criteria:**
  - [ ] Given I am on desktop, then I see a persistent sidebar with Home, Tasks, Analytics, and Settings
  - [ ] Given I resize from desktop to tablet, then the sidebar transitions to bottom navigation

---

### 4.8 PWA & Offline Support

#### FR-035: Progressive Web App
- **Priority:** Must Have
- **PRD Reference:** Scope Item 10
- **Business Rules:**
  - BR-135: The application shall provide a valid Web App Manifest (`manifest.json`) with name, icons, theme color, and display mode ("standalone")
  - BR-136: A service worker shall cache critical assets (HTML shell, CSS, JS bundles, fonts)
  - BR-137: The app shall be installable via the browser's "Add to Home Screen" prompt
- **Acceptance Criteria:**
  - [ ] Given I visit Vora in Chrome, then the browser offers an "Install" prompt
  - [ ] Given I install the PWA, then it opens in standalone mode without browser chrome
  - [ ] Given I run Lighthouse, then the PWA score is ≥ 90

#### FR-036: Offline Data Sync
- **Priority:** Must Have
- **PRD Reference:** US-21, Scope Item 12
- **Business Rules:**
  - BR-138: Data mutations (habit completions, mood check-ins, task changes) made offline shall be queued in IndexedDB
  - BR-139: When connectivity resumes, queued mutations shall sync to the server in order (FIFO)
  - BR-140: Conflicts shall be resolved with "last-write-wins" strategy using timestamps
  - BR-141: A visual indicator shall show sync status (synced ✅, syncing 🔄, offline ⚠️)
  - BR-142: Sync shall complete within 5 seconds of connectivity restoration
- **Acceptance Criteria:**
  - [ ] Given I complete a habit while offline, then the completion is stored locally
  - [ ] Given I reconnect, then the offline data syncs and the sync indicator shows ✅
  - [ ] Given a conflict exists, then the latest timestamp wins

---

### 4.9 Animations & Micro-interactions

#### FR-037: Completion Stamp Animation
- **Priority:** Should Have
- **PRD Reference:** Scope Item 8
- **Business Rules:**
  - BR-143: A stamp/checkmark animation shall play when a habit is marked complete (duration: 400–600ms)
  - BR-144: Animation shall respect `prefers-reduced-motion` OS setting
- **Acceptance Criteria:**
  - [ ] Given I complete a habit, then a stamp animation plays on the habit card
  - [ ] Given I have reduced-motion enabled in OS settings, then the stamp appears instantly without animation

#### FR-038: Mascot Animations
- **Priority:** Should Have
- **PRD Reference:** Scope Item 8
- **Business Rules:**
  - BR-145: The mascot shall have at minimum 3 states: celebratory (positive mood), supportive (negative mood), neutral (idle/default)
  - BR-146: Mascot animations shall be lightweight (< 200KB total for all states)
  - BR-147: Mascot appears in the Smart Check-in modal only (not on dashboard in MVP 1)
- **Acceptance Criteria:**
  - [ ] Given I select a positive mood, then a celebratory mascot animation plays
  - [ ] Given I select a negative mood, then a supportive mascot animation plays at the end of the flow

#### FR-039: Milestone Confetti
- **Priority:** Could Have
- **PRD Reference:** Scope Item 8
- **Business Rules:**
  - BR-148: Confetti animation triggers on milestone achievements: 7-day streak, 30-day streak, 100 completions
  - BR-149: Confetti shall be canvas-based and dispose after 3 seconds
- **Acceptance Criteria:**
  - [ ] Given I achieve a 7-day streak, then a confetti animation plays for 3 seconds

#### FR-040: Accessibility Compliance
- **Priority:** Must Have
- **PRD Reference:** Scope Item 9
- **Business Rules:**
  - BR-150: All interactive elements must be keyboard-navigable (Tab, Enter, Escape, Arrow keys)
  - BR-151: All images and icons must have appropriate `alt` text or `aria-label`
  - BR-152: Color contrast ratio must meet WCAG 2.1 AA (≥ 4.5:1 for normal text, ≥ 3:1 for large text)
  - BR-153: All form inputs must have associated `<label>` elements
  - BR-154: Focus indicators must be visible on all focusable elements
  - BR-155: Minimum touch/click target: 44×44px
- **Acceptance Criteria:**
  - [ ] Given I navigate the entire app using only keyboard, then all features are accessible
  - [ ] Given I use a screen reader, then all content is announced correctly
  - [ ] Given I run axe-core or Lighthouse accessibility audit, then the score is ≥ 95

### 4.10 Category Management (EPIC-003)

#### FR-041: Create Category
- **Priority:** Must Have
- **PRD Reference:** US-23, EPIC-003
- **Business Rules:**
  - BR-156: Category name required; 1–50 characters; unique per user (BR-043 in FSD v1 scope)
  - BR-157: Icon is a single emoji character (stored as string)
  - BR-158: Color must be selected from the predefined 12-color palette
  - BR-159: Maximum 20 categories per user
- **Acceptance Criteria:**
  - [ ] Given I enter a name, icon, and color and click "Save", then the category is created and appears in the sidebar
  - [ ] Given I enter a name already used by one of my categories, then I see "Category name already exists"
  - [ ] Given I have 20 categories, then the "Add Category" button is disabled with tooltip "Maximum 20 categories reached"

#### FR-042: Read / List Categories
- **Priority:** Must Have
- **PRD Reference:** US-22, US-23, EPIC-003
- **Business Rules:**
  - BR-160: System SHALL seed 4 default categories (Health, Work, Personal, Learning) on new user registration via NextAuth `createUser` event
  - BR-161: Categories SHALL be ordered by `sort_order` ascending
  - BR-162: Soft-deleted categories SHALL be excluded from all queries
- **Acceptance Criteria:**
  - [ ] Given I am a new user, then I see 4 default categories immediately after registration
  - [ ] Given I list my categories, then only non-deleted categories appear, ordered by sort_order
  - [ ] Given I call GET /api/categories, then only the authenticated user's categories are returned (no cross-user data)

#### FR-043: Edit Category
- **Priority:** Must Have
- **PRD Reference:** US-24, EPIC-003
- **Business Rules:**
  - BR-163: All fields (name, icon, color) are editable
  - BR-164: Default system categories (seeded) may be edited by the user but not deleted
- **Acceptance Criteria:**
  - [ ] Given I update a category name and save, then the new name appears in the sidebar and all habit cards immediately
  - [ ] Given I try to rename to an existing category name, then I see a uniqueness error

#### FR-044: Reorder Categories
- **Priority:** Should Have
- **PRD Reference:** US-25, EPIC-003
- **Business Rules:**
  - BR-165: Drag-and-drop reorder SHALL update `sort_order` for all affected categories in a single PATCH batch call
  - BR-166: Optimistic UI update SHALL revert to previous order if the API call fails
- **Acceptance Criteria:**
  - [ ] Given I drag a category to a new position, then the sidebar reorders immediately (optimistic)
  - [ ] Given the reorder API call fails, then the order reverts to the previous state with an error toast

#### FR-045: Delete Category
- **Priority:** Must Have
- **PRD Reference:** US-26, EPIC-003
- **Business Rules:**
  - BR-167: Deletion is soft-delete; sets `deletedAt` timestamp
  - BR-168: On deletion, all habits in the deleted category SHALL be reassigned to the default "Personal" category
  - BR-169: A confirmation dialog MUST appear before deletion
  - BR-170: Default seeded categories (isDefault=true) CANNOT be deleted
- **Acceptance Criteria:**
  - [ ] Given I delete a non-default category, then its habits move to "Personal" and the category disappears from the sidebar
  - [ ] Given I attempt to delete a default category, then the delete option is not available / disabled

### 4.11 Design System & Theming Behaviors (EPIC-008)

#### FR-046: CSS Design Token Application
- **Priority:** Must Have
- **PRD Reference:** EPIC-008
- **Business Rules:**
  - BR-171: All colors, spacing, typography, and shadow values SHALL be defined as CSS Custom Properties on `:root`
  - BR-172: Dark mode values SHALL be on `[data-theme="dark"]` selector, overriding `:root` tokens
  - BR-173: `prefers-reduced-motion: reduce` SHALL disable all non-essential animations app-wide
- **Acceptance Criteria:**
  - [ ] Given I toggle dark mode, then the UI switches via CSS Custom Property override with no page reload
  - [ ] Given my OS has reduced-motion enabled, then all Framer Motion and CSS animations are disabled

#### FR-047: Mascot Expression States
- **Priority:** Should Have
- **PRD Reference:** US-28, EPIC-008
- **Business Rules:**
  - BR-174: Mascot SHALL have exactly 4 expression states: happy, proud, concerned, cheering
  - BR-175: Expression crossfade transition SHALL be 300ms
  - BR-176: Mascot total asset size (all states) SHALL be < 200KB
- **Acceptance Criteria:**
  - [ ] Given I select "Happy" mood, then the mascot transitions to the happy expression within 300ms
  - [ ] Given I select a negative mood, then the mascot transitions to the concerned expression
  - [ ] Given reduced-motion is enabled, then expression switches instantly without transition

#### FR-048: Theme Persistence
- **Priority:** Must Have
- **PRD Reference:** US-27, EPIC-008
- **Business Rules:**
  - BR-177: Theme preference SHALL be written to `localStorage` AND persisted to the User database record
  - BR-178: On first visit with no stored preference, `prefers-color-scheme` SHALL determine initial theme
  - BR-179: On login from a new device, theme SHALL be loaded from the DB (overrides localStorage)
- **Acceptance Criteria:**
  - [ ] Given I set dark mode and close/reopen the browser, then dark mode is still active
  - [ ] Given I log in on a new device after setting dark mode elsewhere, then dark mode loads from DB

### 4.12 PWA & Offline Support Behaviors (EPIC-009)

#### FR-049: Web App Manifest
- **Priority:** Must Have
- **PRD Reference:** US-29, EPIC-009
- **Business Rules:**
  - BR-180: `manifest.json` SHALL include: name="Vora", short_name="Vora", icons (192×192 and 512×512), theme_color=#ED9DFF, background_color=#FFFFFF, display="standalone", start_url="/"
- **Acceptance Criteria:**
  - [ ] Given Lighthouse PWA audit runs, then a valid manifest is detected and the install prompt is available
  - [ ] Given I install from Chrome, then the app opens in standalone mode without browser chrome

#### FR-050: Service Worker Caching Strategy
- **Priority:** Must Have
- **PRD Reference:** EPIC-009
- **Business Rules:**
  - BR-181: Static assets (CSS, JS, fonts, images) SHALL use cache-first strategy
  - BR-182: API responses SHALL use network-first strategy with cache fallback
  - BR-183: Cache SHALL be versioned and invalidated on new deployments
- **Acceptance Criteria:**
  - [ ] Given I visit the app for the first time, then all static assets are cached by the service worker
  - [ ] Given I disconnect from the internet and reload, then the cached shell renders

#### FR-051: Offline Fallback & Background Sync
- **Priority:** Must Have
- **PRD Reference:** US-30, EPIC-009
- **Business Rules:**
  - BR-184: The offline fallback page SHALL display the mascot and message: "You're offline — we'll sync when you're back!"
  - BR-185: Habit completions made while offline SHALL be queued in IndexedDB and replayed via Background Sync API when connectivity is restored
- **Acceptance Criteria:**
  - [ ] Given I am offline and navigate to a non-cached route, then the offline fallback page is shown
  - [ ] Given I mark a habit complete while offline, then it syncs automatically when I reconnect
  - [ ] Given Lighthouse PWA audit runs, then the score is ≥ 90

### 4.13 Security & Performance (EPIC-010)

#### FR-052: HTTP Security Headers
- **Priority:** Must Have
- **PRD Reference:** US-32, EPIC-010
- **Business Rules:**
  - BR-186: `next.config.js` SHALL set: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - BR-187: Content Security Policy SHALL allow Google OAuth and Google Fonts; block inline scripts from external sources
- **Acceptance Criteria:**
  - [ ] Given I run a security headers audit (e.g., securityheaders.com), then all required headers are present
  - [ ] Given CSP is applied, then Google OAuth login still works correctly

#### FR-053: API Rate Limiting
- **Priority:** Must Have
- **PRD Reference:** US-32, EPIC-010
- **Business Rules:**
  - BR-188: General API endpoints SHALL be rate-limited to 100 requests/minute per IP
  - BR-189: Authentication endpoints (`/api/auth/*`) SHALL be rate-limited to 10 requests/minute per IP
  - BR-190: Rate limit exceeded SHALL return HTTP 429 with `Retry-After` header
- **Acceptance Criteria:**
  - [ ] Given a client exceeds 100 req/min on a general endpoint, then subsequent requests receive 429
  - [ ] Given a client exceeds 10 req/min on `/api/auth/login`, then subsequent attempts receive 429

#### FR-054: Bundle Size & Performance Optimization
- **Priority:** Must Have
- **PRD Reference:** US-33, EPIC-010
- **Business Rules:**
  - BR-191: Main JS bundle SHALL be < 150KB gzipped
  - BR-192: Recharts and Framer Motion SHALL be lazy-loaded (dynamic imports, not in initial bundle)
  - BR-193: All images and mascot assets SHALL use `next/image` with appropriate `sizes` and `loading` attributes
- **Acceptance Criteria:**
  - [ ] Given I run `next build --analyze`, then the initial JS chunk is < 150KB gzipped
  - [ ] Given I view the Analytics page, then Recharts is loaded lazily (not in the initial network waterfall)

#### FR-055: Lighthouse Performance Targets
- **Priority:** Must Have
- **PRD Reference:** US-33, EPIC-010
- **Business Rules:**
  - BR-194: Lighthouse Performance score ≥ 90 on Home Dashboard (production build on Vercel Preview)
  - BR-195: Lighthouse Accessibility score ≥ 90 on all pages
  - BR-196: Core Web Vitals: FCP < 1.5s, LCP < 2.5s, CLS < 0.1
- **Acceptance Criteria:**
  - [ ] Given a Lighthouse CI run on the Home Dashboard, then Performance ≥ 90 and Accessibility ≥ 90
  - [ ] Given Chrome DevTools, then FCP < 1.5s and LCP < 2.5s on a simulated Fast 3G connection

#### FR-056: Structured Logging & Health Check
- **Priority:** Must Have
- **PRD Reference:** EPIC-010
- **Business Rules:**
  - BR-197: All API route handlers SHALL use `pino` for structured JSON logging (level, timestamp, requestId, userId, path)
  - BR-198: `GET /api/health` SHALL return HTTP 200 with `{status: "ok", db: "connected"}` when healthy, and 503 when DB is unreachable
- **Acceptance Criteria:**
  - [ ] Given an API call is made, then a JSON log entry appears in the server console with all required fields
  - [ ] Given the DB is reachable, then GET /api/health returns 200 `{status: "ok"}`

#### FR-057: Row-Level Security Audit
- **Priority:** Must Have
- **PRD Reference:** EPIC-010
- **Business Rules:**
  - BR-199: Every Prisma query returning user-owned data SHALL include `where: { userId: session.user.id }` as a non-bypassable filter
  - BR-200: No API response SHALL include another user's data (passwords, habits, tasks, mood data)
- **Acceptance Criteria:**
  - [ ] Given I craft an API request for another user's resource ID, then I receive 404 (not 403, to avoid enumeration)
  - [ ] Given I audit all GET endpoints, then no response contains data from a different userId

#### FR-058: Input Sanitization & Validation
- **Priority:** Must Have
- **PRD Reference:** EPIC-010
- **Business Rules:**
  - BR-201: All API route inputs SHALL be validated with a Zod schema before any business logic or DB query executes
  - BR-202: Prisma parameterized queries protect against SQL injection by default; no raw SQL with user input is permitted
  - BR-203: Error responses SHALL use the `AppError` class and `withErrorHandling` wrapper; no raw stack traces are exposed
- **Acceptance Criteria:**
  - [ ] Given an API receives malformed input, then it returns 400 with a structured Zod error response
  - [ ] Given any unhandled exception occurs, then the client receives a generic 500 message (no stack trace)

---

## 5. Business Rules Catalog

| ID     | Rule                                                                                    | Applies To         | Validation                                    |
| ------ | --------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------- |
| BR-001 | Email must be unique across all accounts                                                | Registration       | DB unique constraint + form validation        |
| BR-002 | Password ≥ 8 chars, ≥ 1 upper, ≥ 1 lower, ≥ 1 digit                                  | Registration       | Regex: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$` |
| BR-003 | Email must match RFC 5322 format                                                        | Registration       | Regex validation                              |
| BR-006 | Lock account after 5 failed login attempts for 15 min                                   | Login              | Server-side counter + timestamp               |
| BR-007 | Sessions expire after 30 days of inactivity                                             | Session            | JWT expiry / cookie maxAge                    |
| BR-013 | Habit name required, max 100 chars                                                      | Habit CRUD         | Frontend + backend validation                 |
| BR-017 | Daily habit: target value + unit required                                                | Habit Create       | Conditional form validation                   |
| BR-018 | Weekly habit: ≥ 1 day selected                                                          | Habit Create       | Conditional form validation                   |
| BR-019 | Monthly habit: ≥ 1 date selected                                                        | Habit Create       | Conditional form validation                   |
| BR-030 | Habit deletion is soft-delete                                                           | Habit Delete       | Set `deletedAt`, exclude from queries         |
| BR-033 | Habit checkbox triggers Smart Check-in modal                                            | Habit Complete     | Frontend event handler                        |
| BR-037 | One completion per habit per calendar day                                                | Habit Complete     | DB unique constraint (habitId + userId + date)|
| BR-055 | Check-in modal triggers on habit checkbox click                                         | Check-in           | Frontend event handler                        |
| BR-060 | Exactly one mood per check-in                                                           | Mood Selection     | Radio-button behavior                         |
| BR-065 | Positive path auto-closes after 2 seconds                                               | Check-in           | setTimeout(2000)                              |
| BR-075 | Duplicate check-in same habit/day overwrites                                            | Mood Data          | Upsert on (habitId + userId + date)           |
| BR-077 | Task title required, max 200 chars                                                      | Task Create        | Frontend + backend validation                 |
| BR-086 | All sub-tasks complete → parent auto-completes                                          | Task Complete      | Backend trigger / frontend logic              |
| BR-089 | Auto-postpone moves overdue task due date to today                                      | Task Auto-Postpone | Run on app load + server cron                 |
| BR-093 | Auto-postpone does not apply to completed tasks                                         | Task Auto-Postpone | Filter: `completedAt IS NULL`                 |
| BR-104 | Completion rate: (completed / scheduled) × 100                                          | Analytics          | Server-side calculation                       |
| BR-113 | Streak: consecutive days with ALL habits completed                                      | Analytics          | Server-side calculation with date series      |
| BR-140 | Offline conflict resolution: last-write-wins                                            | Data Sync          | Timestamp comparison                          |
| BR-150 | All interactive elements keyboard-navigable                                             | Accessibility      | Manual + automated testing                    |

---

## 6. Data Specifications

### 6.1 Data Entities

#### User
| Field          | Type         | Required | Validation Rules                        | Description                           |
| -------------- | ------------ | -------- | --------------------------------------- | ------------------------------------- |
| id             | UUID         | Yes      | Auto-generated                          | Primary key                           |
| email          | String(255)  | Yes      | Unique, RFC 5322 format                 | User's email address                  |
| passwordHash   | String(255)  | No       | Bcrypt hash (null for OAuth-only users) | Hashed password                       |
| name           | String(100)  | Yes      | Max 100 chars                           | Display name                          |
| avatarUrl      | String(500)  | No       | Valid URL format                        | Profile picture URL                   |
| theme          | Enum         | Yes      | "light" \| "dark" \| "system"          | Theme preference; default: "system"   |
| createdAt      | DateTime     | Yes      | Auto-generated                          | Account creation timestamp            |
| updatedAt      | DateTime     | Yes      | Auto-updated                            | Last profile update timestamp         |

#### Habit
| Field          | Type         | Required | Validation Rules                        | Description                           |
| -------------- | ------------ | -------- | --------------------------------------- | ------------------------------------- |
| id             | UUID         | Yes      | Auto-generated                          | Primary key                           |
| userId         | UUID         | Yes      | FK → User.id                            | Owner                                 |
| name           | String(100)  | Yes      | Max 100 chars, not empty                | Habit name                            |
| categoryId     | UUID         | Yes      | FK → Category.id                        | Category reference                    |
| color          | String(7)    | Yes      | Hex format (#RRGGBB)                    | Display color from predefined palette |
| frequency      | Enum         | Yes      | "daily" \| "weekly" \| "monthly"        | Frequency type                        |
| targetValue    | Integer      | No       | ≥ 1 (required if daily)                | Daily numeric target                  |
| targetUnit     | String(50)   | No       | Required if daily                       | Unit label (e.g., "glasses", "pages") |
| weeklyDays     | Integer[]    | No       | Values 0–6 (required if weekly)         | Days of week (0=Mon, 6=Sun)           |
| monthlyDates   | Integer[]    | No       | Values 1–31 (required if monthly)       | Dates of month                        |
| reminderTime   | Time         | No       | HH:MM format                            | Notification time                     |
| isActive       | Boolean      | Yes      | Default: true                           | Soft-active flag                      |
| createdAt      | DateTime     | Yes      | Auto-generated                          | Creation timestamp                    |
| updatedAt      | DateTime     | Yes      | Auto-updated                            | Last update timestamp                 |
| deletedAt      | DateTime     | No       | Null = active                           | Soft-delete timestamp                 |

#### HabitCompletion
| Field          | Type         | Required | Validation Rules                        | Description                           |
| -------------- | ------------ | -------- | --------------------------------------- | ------------------------------------- |
| id             | UUID         | Yes      | Auto-generated                          | Primary key                           |
| habitId        | UUID         | Yes      | FK → Habit.id                           | Completed habit reference             |
| userId         | UUID         | Yes      | FK → User.id                            | User who completed                    |
| date           | Date         | Yes      | Unique with (habitId, userId)           | Completion calendar date              |
| value          | Integer      | No       | For numeric habits                      | Achieved value                        |
| completedAt    | DateTime     | Yes      | Auto-generated                          | Exact completion timestamp            |
| deletedAt      | DateTime     | No       | Null = active                           | Soft-delete for undo                  |

#### MoodCheckin
| Field            | Type         | Required | Validation Rules                       | Description                           |
| ---------------- | ------------ | -------- | -------------------------------------- | ------------------------------------- |
| id               | UUID         | Yes      | Auto-generated                         | Primary key                           |
| userId           | UUID         | Yes      | FK → User.id                           | Check-in user                         |
| habitId          | UUID         | Yes      | FK → Habit.id                          | Associated habit                      |
| completionId     | UUID         | Yes      | FK → HabitCompletion.id                | Associated completion                 |
| date             | Date         | Yes      | Unique with (habitId, userId)          | Check-in date                         |
| mood             | Enum         | Yes      | happy\|proud\|worried\|annoyed\|sad\|angry | Selected mood                     |
| isPositive       | Boolean      | Yes      | Derived from mood                      | Positive/negative classification      |
| reflectionText   | String(500)  | No       | Max 500 chars                          | Optional reflection                   |
| selectedActivity | Enum         | No       | short_break\|deep_breathing\|calming_music\|talk_to_someone\|go_for_walk | Calming activity |
| createdAt        | DateTime     | Yes      | Auto-generated                         | Creation timestamp                    |
| deletedAt        | DateTime     | No       | Null = active                          | Soft-delete for undo                  |

#### Category
| Field          | Type         | Required | Validation Rules                        | Description                           |
| -------------- | ------------ | -------- | --------------------------------------- | ------------------------------------- |
| id             | UUID         | Yes      | Auto-generated                          | Primary key                           |
| name           | String(50)   | Yes      | Unique per user (or system-wide for defaults) | Category name               |
| icon           | String(10)   | Yes      | Emoji character                         | Display icon                          |
| defaultColor   | String(7)    | Yes      | Hex format                              | Default color for habits in category  |
| isDefault      | Boolean      | Yes      | Default: false                          | System-provided category              |
| userId         | UUID         | No       | FK → User.id (null for defaults)        | Owner (null = system category)        |
| createdAt      | DateTime     | Yes      | Auto-generated                          | Creation timestamp                    |

#### Task
| Field          | Type         | Required | Validation Rules                        | Description                           |
| -------------- | ------------ | -------- | --------------------------------------- | ------------------------------------- |
| id             | UUID         | Yes      | Auto-generated                          | Primary key                           |
| userId         | UUID         | Yes      | FK → User.id                            | Owner                                 |
| title          | String(200)  | Yes      | Max 200 chars, not empty                | Task title                            |
| description    | Text         | No       | Max 2000 chars, rich text (HTML)        | Task description                      |
| priority       | Enum         | Yes      | "high" \| "medium" \| "low"            | Default: "medium"                     |
| dueDate        | Date         | No       | Must be ≥ today on create               | Due date                              |
| originalDueDate| Date         | No       | Set on first auto-postpone              | Original due date for tracking        |
| recurrence     | Enum         | Yes      | none\|daily\|weekly\|monthly\|custom    | Default: "none"                       |
| recurrenceRule | JSON         | No       | Required if recurrence != "none"        | Custom recurrence config              |
| autoPostpone   | Boolean      | Yes      | Default: false                          | Auto-postpone toggle                  |
| completedAt    | DateTime     | No       | Null = incomplete                       | Completion timestamp                  |
| sortOrder      | Integer      | Yes      | Auto-incremented                        | Display order within list             |
| createdAt      | DateTime     | Yes      | Auto-generated                          | Creation timestamp                    |
| updatedAt      | DateTime     | Yes      | Auto-updated                            | Last update timestamp                 |
| deletedAt      | DateTime     | No       | Null = active                           | Soft-delete timestamp                 |

#### SubTask
| Field          | Type         | Required | Validation Rules                        | Description                           |
| -------------- | ------------ | -------- | --------------------------------------- | ------------------------------------- |
| id             | UUID         | Yes      | Auto-generated                          | Primary key                           |
| taskId         | UUID         | Yes      | FK → Task.id                            | Parent task reference                 |
| title          | String(200)  | Yes      | Max 200 chars                           | Sub-task title                        |
| completedAt    | DateTime     | No       | Null = incomplete                       | Completion timestamp                  |
| sortOrder      | Integer      | Yes      | Auto-incremented                        | Display order                         |
| createdAt      | DateTime     | Yes      | Auto-generated                          | Creation timestamp                    |

### 6.2 Data Relationships

```
User (1) ──────< (N) Habit
User (1) ──────< (N) Task
User (1) ──────< (N) HabitCompletion
User (1) ──────< (N) MoodCheckin
Habit (1) ─────< (N) HabitCompletion
Habit (1) ─────< (N) MoodCheckin
HabitCompletion (1) ──── (0..1) MoodCheckin
Task (1) ──────< (N) SubTask
Category (1) ──< (N) Habit
```

### 6.3 Data Validation Rules

| Rule                                    | Entity           | Implementation                             |
| --------------------------------------- | ---------------- | ------------------------------------------ |
| Email uniqueness                        | User             | DB unique index + pre-save check           |
| One completion per habit/user/day       | HabitCompletion  | DB unique index (habitId, userId, date)    |
| One mood check-in per habit/user/day    | MoodCheckin      | DB unique index (habitId, userId, date)    |
| Habit name not empty                    | Habit            | Frontend + backend trim + length check     |
| Weekly frequency requires ≥ 1 day      | Habit            | Conditional validation                     |
| Monthly frequency requires ≥ 1 date    | Habit            | Conditional validation                     |
| Task due date ≥ today on create         | Task             | Backend validation                         |
| Sub-task belongs to user's task         | SubTask          | Authorization check via Task.userId        |
| Soft-deleted records excluded by default| All entities     | Global query filter: `deletedAt IS NULL`   |

---

## 7. Interface Specifications

### 7.1 User Interface Requirements

| Screen              | Key Functional Elements                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| **Login/Register**  | Email + password form, "Continue with Google" button, toggle between login/register, inline validation    |
| **Home Dashboard**  | Calendar strip, habit list (filterable by category), category sidebar/drawer, FAB "Add Habit"            |
| **Habit Form**      | Name input, category dropdown, color picker (palette), frequency selector with dynamic sub-fields, reminder time picker, save/cancel |
| **Check-in Modal**  | Mood grid (6 options), positive path (message + mascot + auto-close), negative path (empathy → reflection → activities → mascot), close (X) button |
| **Tasks Screen**    | Task list, filter bar (All/Today/Upcoming/Overdue), sort dropdown, FAB "Add Task"                       |
| **Task Form**       | Title input, description (rich text), sub-task list (add/remove), due date picker, priority selector, recurrence dropdown, auto-postpone toggle |
| **Analytics**       | Completion rate gauge, line chart with view toggle, stats cards (streak/perfect/active), calendar heatmap |
| **Settings**        | Theme toggle, profile info, notification preferences, logout button                                       |

### 7.2 API Specifications

| Endpoint                           | Method | Input                                          | Output                                   | Business Logic                                           |
| ---------------------------------- | ------ | ----------------------------------------------- | ---------------------------------------- | -------------------------------------------------------- |
| `/api/auth/register`               | POST   | `{email, password, name}`                        | `{user, token}`                          | Validate, hash password, create user, issue JWT          |
| `/api/auth/login`                  | POST   | `{email, password}`                              | `{user, token}`                          | Validate credentials, check lockout, issue JWT           |
| `/api/auth/[...nextauth]`          | *      | NextAuth config                                  | Session                                  | Handle OAuth flows                                       |
| `/api/habits`                      | GET    | Query: `?date=YYYY-MM-DD&category=UUID`          | `{habits: Habit[]}`                      | Filter by user, date schedule, category, exclude deleted |
| `/api/habits`                      | POST   | `{name, categoryId, color, frequency, ...}`      | `{habit: Habit}`                         | Validate fields, create habit                            |
| `/api/habits/:id`                  | PATCH  | `{name?, categoryId?, color?, ...}`              | `{habit: Habit}`                         | Validate ownership, update fields                        |
| `/api/habits/:id`                  | DELETE | —                                                | `{success: true}`                        | Soft-delete (set deletedAt)                              |
| `/api/habits/:id/complete`         | POST   | `{date: YYYY-MM-DD, value?}`                    | `{completion: HabitCompletion}`          | Create completion record, enforce unique per day         |
| `/api/habits/:id/uncomplete`       | POST   | `{date: YYYY-MM-DD}`                            | `{success: true}`                        | Soft-delete completion + associated mood check-in        |
| `/api/mood-checkins`               | POST   | `{habitId, completionId, mood, reflectionText?, selectedActivity?}` | `{checkin: MoodCheckin}` | Upsert on (habitId, userId, date)                        |
| `/api/tasks`                       | GET    | Query: `?filter=today\|upcoming\|overdue&sort=priority\|dueDate` | `{tasks: Task[]}`      | Filter by user, apply filters/sorts, exclude deleted     |
| `/api/tasks`                       | POST   | `{title, description?, priority?, dueDate?, recurrence?, autoPostpone?, subTasks?[]}` | `{task: Task}` | Validate, create task + sub-tasks                  |
| `/api/tasks/:id`                   | PATCH  | `{title?, description?, priority?, ...}`         | `{task: Task}`                           | Validate ownership, update fields                        |
| `/api/tasks/:id`                   | DELETE | —                                                | `{success: true}`                        | Soft-delete                                              |
| `/api/tasks/:id/complete`          | POST   | —                                                | `{task: Task}`                           | Set completedAt, fire event                              |
| `/api/tasks/:id/subtasks/:sid/complete` | POST | —                                           | `{subTask: SubTask}`                     | Complete sub-task, check if all subs done → auto-complete parent |
| `/api/analytics/completion-rate`   | GET    | Query: `?date=YYYY-MM-DD`                       | `{rate: number, completed: number, scheduled: number}` | Calculate for given date     |
| `/api/analytics/chart`             | GET    | Query: `?view=weekly\|monthly\|yearly`           | `{dataPoints: [{date, rate}]}`           | Aggregate completion rates over period                   |
| `/api/analytics/stats`             | GET    | —                                                | `{streak, perfectDays, activeDays}`      | Calculate streak, perfect days, active days              |
| `/api/analytics/heatmap`           | GET    | Query: `?month=YYYY-MM`                          | `{days: [{date, rate, completed, scheduled}]}` | Daily breakdown for month                     |

### 7.3 Integration Requirements

| Integration        | Type     | Purpose                                               | MVP 1 Scope                        |
| ------------------ | -------- | ----------------------------------------------------- | ----------------------------------- |
| Google OAuth       | External | User authentication via Google accounts               | Full implementation                 |
| Browser Notifications API | Browser | Push notifications for habit reminders          | Request permission + schedule       |
| Service Worker     | Browser  | Offline support, asset caching, background sync       | Full implementation                 |
| IndexedDB          | Browser  | Offline data queue for mutations                      | Store + replay on reconnect         |

---

## 8. Non-Functional Requirements (EPIC-010)

This section formally captures all non-functional requirements from EPIC-010 (Harden Security & Performance). These requirements are cross-cutting and apply to all feature EPICs.

### 8.1 Performance Targets

| NFR ID  | Requirement                                              | Target              | Measurement Method         | FSD Reference |
| ------- | -------------------------------------------------------- | ------------------- | -------------------------- | ------------- |
| NFR-001 | First Contentful Paint (FCP)                             | < 1.5 seconds       | Lighthouse CI, Web Vitals  | FR-055        |
| NFR-002 | Largest Contentful Paint (LCP)                           | < 2.5 seconds       | Lighthouse CI, Web Vitals  | FR-055        |
| NFR-003 | Cumulative Layout Shift (CLS)                            | < 0.1               | Lighthouse CI, Web Vitals  | FR-055        |
| NFR-004 | API Response Time (P95)                                  | < 200ms             | Server logs (pino)         | FR-056        |
| NFR-005 | Initial JS Bundle Size                                   | < 150KB gzipped     | next build --analyze       | FR-054        |
| NFR-006 | Lighthouse Performance Score                             | ≥ 90                | Lighthouse CI              | FR-055        |
| NFR-007 | Lighthouse Accessibility Score                           | ≥ 90 (target 95)    | Lighthouse CI              | FR-040        |
| NFR-008 | Lighthouse PWA Score                                     | ≥ 90                | Lighthouse CI              | FR-049        |

### 8.2 Security Requirements

| NFR ID  | Requirement                                              | Implementation                   | FSD Reference |
| ------- | -------------------------------------------------------- | -------------------------------- | ------------- |
| NFR-009 | HTTP Security Headers                                    | next.config.js headers()         | FR-052        |
| NFR-010 | Content Security Policy (CSP)                            | Allowlist for Google, fonts      | FR-052        |
| NFR-011 | Rate Limiting — General API                              | 100 req/min per IP               | FR-053        |
| NFR-012 | Rate Limiting — Auth Endpoints                           | 10 req/min per IP                | FR-053        |
| NFR-013 | Input Validation                                         | Zod schema on all routes         | FR-058        |
| NFR-014 | Row-Level Security                                       | userId filter on all queries     | FR-057        |
| NFR-015 | Password Hashing                                         | bcrypt (12 rounds)               | FR-001        |
| NFR-016 | Session Security                                         | JWT in HTTP-only cookies, 30-day | FR-003, FR-005|
| NFR-017 | No Raw SQL with User Input                               | Prisma parameterized queries     | FR-058        |
| NFR-018 | No Stack Traces in Error Responses                       | AppError + withErrorHandling     | FR-058        |

### 8.3 Reliability & Privacy

| NFR ID  | Requirement                                              | Implementation                   | FSD Reference |
| ------- | -------------------------------------------------------- | -------------------------------- | ------------- |
| NFR-019 | Offline-First Architecture                               | Service worker + IndexedDB queue | FR-035, FR-036, FR-051 |
| NFR-020 | Offline Sync Conflict Resolution                         | Last-write-wins via server timestamp | FR-036    |
| NFR-021 | Mood/Reflection Data Encryption at Rest                  | PostgreSQL encryption; Vercel infra | Data Architecture |
| NFR-022 | Soft-Delete Data Retention                               | 90-day retention policy; manual purge script | FR-009, FR-026 |
| NFR-023 | Structured Logging                                       | pino JSON logs on all API routes | FR-056        |
| NFR-024 | Health Check Endpoint                                    | GET /api/health → DB connectivity | FR-056       |

---

## 9. Reporting & Analytics Requirements

| Report / Dashboard       | Data Source                    | Functional Requirements                                        |
| ------------------------ | ------------------------------ | -------------------------------------------------------------- |
| Completion Rate Gauge    | HabitCompletion, Habit         | Real-time calculation per day (FR-027)                         |
| Activity Line Chart      | HabitCompletion                | Aggregation by week/month/year with toggle (FR-028)            |
| Streak / Stats Cards     | HabitCompletion                | Server-calculated consecutive day streaks (FR-029)             |
| Calendar Heatmap         | HabitCompletion, Habit         | Daily completion % for monthly grid with drill-down (FR-030)   |
| Event Tracking           | All user interactions          | Client-side analytics events as defined in PRD Section 9       |

---

## 10. EPIC-to-FR Traceability Matrix

### 10.1 PRD User Story → FSD Requirement Mapping (Full)

| PRD User Story           | FSD Requirement(s)                              | Priority    | EPIC     |
| ------------------------ | ----------------------------------------------- | ----------- | -------- |
| US-01 (Create Habit)     | FR-006                                          | Must Have   | EPIC-004 |
| US-02 (Complete Habit)   | FR-010, FR-015, FR-016, FR-017, FR-018          | Must Have   | EPIC-004 |
| US-03 (Category Filter)  | FR-007, FR-012                                  | Must Have   | EPIC-004 |
| US-04 (Edit/Delete)      | FR-008, FR-009                                  | Must Have   | EPIC-004 |
| US-05 (Reminders)        | FR-014                                          | Must Have   | EPIC-004 |
| US-06 (Mood Select)      | FR-015, FR-016, FR-019                          | Must Have   | EPIC-005 |
| US-07 (Positive Path)    | FR-017                                          | Must Have   | EPIC-005 |
| US-08 (Negative Path)    | FR-018                                          | Must Have   | EPIC-005 |
| US-09 (Skip Check-in)    | FR-015 (BR-057, BR-058)                         | Must Have   | EPIC-005 |
| US-10 (Create Task)      | FR-020, FR-024                                  | Must Have   | EPIC-006 |
| US-11 (Complete Task)    | FR-021                                          | Must Have   | EPIC-006 |
| US-12 (Auto-Postpone)    | FR-022                                          | Must Have   | EPIC-006 |
| US-13 (Filter/Sort)      | FR-023                                          | Must Have   | EPIC-006 |
| US-14 (Completion Rate)  | FR-027                                          | Must Have   | EPIC-007 |
| US-15 (Line Chart)       | FR-028                                          | Must Have   | EPIC-007 |
| US-16 (Streak Stats)     | FR-029                                          | Must Have   | EPIC-007 |
| US-17 (Heatmap)          | FR-030                                          | Must Have   | EPIC-007 |
| US-18 (Theme Toggle)     | FR-031                                          | Must Have   | EPIC-008 |
| US-19 (Habit Colors)     | FR-032                                          | Must Have   | EPIC-008 |
| US-20 (Auth)             | FR-001, FR-002, FR-003, FR-004                  | Must Have   | EPIC-002 |
| US-21 (Data Sync)        | FR-005, FR-036                                  | Must Have   | EPIC-002 |
| US-22 (Default Categories)| FR-042                                         | Must Have   | EPIC-003 |
| US-23 (Create Category)  | FR-041                                          | Must Have   | EPIC-003 |
| US-24 (Edit Category)    | FR-043                                          | Must Have   | EPIC-003 |
| US-25 (Reorder Category) | FR-044                                          | Should Have | EPIC-003 |
| US-26 (Delete Category)  | FR-045                                          | Must Have   | EPIC-003 |
| US-27 (OS Theme Pref)    | FR-048                                          | Must Have   | EPIC-008 |
| US-28 (Mascot Expression)| FR-047                                          | Should Have | EPIC-008 |
| US-29 (PWA Install)      | FR-049                                          | Must Have   | EPIC-009 |
| US-30 (Offline Habits)   | FR-050, FR-051                                  | Must Have   | EPIC-009 |
| US-31 (Account Lockout)  | FR-003 (BR-006), FR-053                         | Must Have   | EPIC-010 |
| US-32 (Rate Limiting)    | FR-053                                          | Must Have   | EPIC-010 |
| US-33 (Fast Loading)     | FR-054, FR-055                                  | Must Have   | EPIC-010 |
| Responsive Layout        | FR-033, FR-034                                  | Must Have   | EPIC-008 |
| CSS Token System         | FR-046                                          | Must Have   | EPIC-008 |
| Animations               | FR-037, FR-038, FR-039                          | Should Have | EPIC-008 |
| Accessibility WCAG 2.1 AA| FR-040                                          | Must Have   | EPIC-008 |
| Security Headers         | FR-052                                          | Must Have   | EPIC-010 |
| Row-Level Security       | FR-057                                          | Must Have   | EPIC-010 |
| Input Validation         | FR-058                                          | Must Have   | EPIC-010 |
| Structured Logging       | FR-056                                          | Must Have   | EPIC-010 |

### 10.2 EPIC → FR Coverage Summary

| EPIC ID  | Title                                        | FRs Covered                                        |
| -------- | -------------------------------------------- | -------------------------------------------------- |
| EPIC-001 | Setup Project Foundation & Infrastructure    | (Non-functional; covered by EPIC-010 audit)        |
| EPIC-002 | Implement User Authentication                | FR-001, FR-002, FR-003, FR-004, FR-005             |
| EPIC-003 | Build Category Management                    | FR-041, FR-042, FR-043, FR-044, FR-045             |
| EPIC-004 | Build Habit Tracking Core                    | FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014 |
| EPIC-005 | Implement Smart Mood Check-in                | FR-015, FR-016, FR-017, FR-018, FR-019             |
| EPIC-006 | Build Task Management System                 | FR-020, FR-021, FR-022, FR-023, FR-024, FR-025, FR-026 |
| EPIC-007 | Build Analytics & Insights Dashboard         | FR-027, FR-028, FR-029, FR-030                     |
| EPIC-008 | Implement Design System & Theming            | FR-031, FR-032, FR-033, FR-034, FR-037, FR-038, FR-039, FR-040, FR-046, FR-047, FR-048 |
| EPIC-009 | Enable PWA & Offline Support                 | FR-035, FR-036, FR-049, FR-050, FR-051             |
| EPIC-010 | Harden Security & Performance                | FR-052, FR-053, FR-054, FR-055, FR-056, FR-057, FR-058 |

---

## 11. Appendices

### A. Glossary

| Term                  | Definition                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------ |
| **Smart Check-in**    | Mood-aware modal appearing upon habit completion to capture emotional state                 |
| **Mood Board**        | UI component within the Smart Check-in presenting emotion options                          |
| **Streak**            | Consecutive calendar days where ALL scheduled habits were completed                        |
| **Perfect Day**       | Calendar day with 100% habit completion                                                    |
| **Active Day**        | Calendar day with ≥ 1 habit completion                                                    |
| **Auto-Postpone**     | Feature moving overdue task due date to the current day automatically                      |
| **Calendar Heatmap**  | Color-coded monthly calendar showing daily completion percentages                          |
| **PWA**               | Progressive Web App — installable, offline-capable web application                         |
| **Soft-Delete**       | Setting a `deletedAt` timestamp instead of physically removing a database record           |
| **Upsert**            | Insert a record if it doesn't exist; update it if it does (based on unique key)            |

### B. Revision History

| Version | Date       | Author        | Changes                                                                    |
| ------- | ---------- | ------------- | -------------------------------------------------------------------------- |
| 1.0     | 2026-02-10 | [Author Name] | Initial FSD from PRD v2.0                                                  |
| 2.0     | 2026-03-25 | [Author Name] | Added FR-041–FR-058 (Category, Design System, PWA, Security); updated NFR section; added EPIC-to-FR traceability matrix; synced with PRD v3.0 |

### C. Open Questions / TBD Items

| #  | Question                                                                              | Impact on FSD                                          | Status |
| -- | ------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| 1  | Should mascot be customizable or fixed?                                               | May require additional entity (MascotPreference)       | Open   |
| 2  | Maximum habits per user?                                                              | Requires limit validation in FR-006                    | Open   |
| 3  | Mood data retention period?                                                           | May require scheduled purge job                        | Open   |
| 4  | Additional OAuth providers (GitHub, Apple)?                                           | Additional NextAuth provider configs in FR-002         | Open   |
| 5  | External links in calming activity suggestions?                                       | Changes FR-018 activity options to include URLs        | Open   |
| 6  | Concurrent user load for infrastructure?                                              | Impacts non-functional requirements (Section 8)        | Open   |
| 7  | Push notification as hard MVP 1 requirement?                                          | May downgrade FR-014 priority                          | Open   |
| 8  | Mood-over-time chart in Analytics MVP 1?                                              | Would require new FR (FR-041+) and additional API      | Open   |
| 9  | Recurring task + auto-postpone interaction?                                           | May require additional BR in FR-022/FR-024             | Open   |
| 10 | Data backup & recovery strategy?                                                      | Infrastructure concern; out of FSD scope               | Open   |

---

*FSD v2.0 — Updated 2026-03-25. Derived from PRD v3.0. Synced with EPIC-001 through EPIC-010. Shall be updated as open questions are resolved and design specifications are finalized.*
