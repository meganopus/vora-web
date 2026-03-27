# Product Requirements Document (PRD)

# Vora – Smart Habit Tracking & Task Management Web Application

---

## 1. Overview

| Field               | Detail                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| **Product Name**    | Vora                                                                                             |
| **Document Version**| 3.0                                                                                              |
| **Last Updated**    | 2026-03-25                                                                                       |
| **Status**          | Draft                                                                                            |
| **Product Owner**   | [Product Owner Name]                                                                             |
| **Designers**       | [Design Team]                                                                                    |
| **Tech Lead**       | [Tech Lead Name]                                                                                 |
| **QA Lead**         | [QA Lead Name]                                                                                   |
| **Target Release**  | Q2 2026 (MVP 1)                                                                                  |
| **Platform**        | Web Application (PWA) — Desktop, Tablet, Mobile                                                  |
| **Tech Stack**      | Next.js, TypeScript, Prisma, PostgreSQL, NextAuth                                                |

---

## 2. Quick Links

| Resource             | Link                                    |
| -------------------- | --------------------------------------- |
| Design (Figma)       | [Figma Project Link]                    |
| Technical Spec (TDD) | [TDD Document Link]                     |
| ERD                  | [ERD Document Link]                     |
| API Contract         | [API Specification Link]                |
| FSD                  | [FSD Document Link]                     |
| JIRA Board           | [JIRA Project Link]                     |
| Wireframes           | [Wireframes Document Link]              |
| Repository           | [GitHub / GitLab Repo Link]             |

---

## 3. Background

### 3.1 Context

The modern productivity landscape is saturated with tools that focus narrowly on task completion or habit repetition, neglecting the **emotional dimension** of personal growth. Users frequently abandon habit trackers because the tools feel mechanical—they don't acknowledge that a user might be struggling, nor do they celebrate genuine achievements beyond streak counters.

**Vora** addresses this gap by combining **habit tracking**, **task management**, and an innovative **Smart Daily Check-in (Mood Board)** into a single, emotionally intelligent web application. By checking in on the user's mood at the moment of habit completion, Vora creates a holistic record of both *what* the user did and *how they felt* doing it—unlocking insights that no conventional tracker provides.

The application is designed as a **Progressive Web App (PWA)** to deliver a native-like experience across desktop and mobile browsers, with offline capability and the potential for push notifications.

### 3.2 Current State & Market Context

| Metric                             | Value / Insight                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Global habit-tracking app market   | Estimated USD 5.5 B by 2027 (CAGR ~23%)                                          |
| Average retention at Day 30        | ~10–15% for typical habit apps                                                     |
| Users citing "motivation" as #1 churn driver | 62% (internal survey, N=500)                                            |
| Existing tools with mood integration | < 3 mainstream competitors                                                       |

### 3.3 Problem Statement

**Users lack a unified platform that combines habit tracking, task management, and emotional awareness.**

| Problem                                         | Impact                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| Fragmented tools for habits, tasks, and wellbeing | Cognitive overhead from context-switching; data silos prevent holistic insight |
| Habit trackers feel impersonal and mechanical     | Low motivation → high churn within 30 days                              |
| No emotional context attached to productivity data | Users cannot identify patterns (e.g., "I skip workouts when anxious")   |
| Limited analytics on *why* habits break           | No actionable feedback loop for self-improvement                        |

### 3.4 Current Workarounds

| Workaround                                        | Limitation                                                    |
| -------------------------------------------------- | ------------------------------------------------------------- |
| Combining multiple apps (Todoist + Habitica + Daylio) | No unified analytics; data lives in separate silos            |
| Manual journaling in notebooks                     | No reminders, no trends, tedious data entry                   |
| Spreadsheet tracking                               | No mobile UX, no visualization, error-prone                   |

---

## 4. Objectives

### 4.1 Business Objectives

| #  | Objective                                                                               | Measure                                |
| -- | --------------------------------------------------------------------------------------- | -------------------------------------- |
| B1 | Establish Vora as a differentiated habit + mood tracking platform                        | 5,000 registered users within 6 months of launch |
| B2 | Achieve superior user retention vs. market average                                       | Day-30 retention ≥ 30%                 |
| B3 | Validate the Smart Check-in feature as a key engagement driver                           | ≥ 60% of active users complete ≥ 1 mood check-in per day |
| B4 | Deliver a performant, accessible PWA that works across devices                           | Lighthouse Performance ≥ 90, Accessibility ≥ 95 |
| B5 | Build a data foundation for future AI-powered habit recommendations                      | ≥ 100K mood + habit data points in first 6 months |

### 4.2 User Objectives

| #  | Objective                                                                                |
| -- | ---------------------------------------------------------------------------------------- |
| U1 | Track daily, weekly, and monthly habits with minimal friction                            |
| U2 | Receive emotionally supportive interactions during their productivity journey             |
| U3 | Manage tasks with priorities, sub-tasks, and smart postponement                          |
| U4 | Gain actionable insights from analytics (streaks, completion rates, mood correlations)    |
| U5 | Customize the experience with color themes, categories, and notification preferences     |
| U6 | Use the app seamlessly across desktop and mobile browsers, including offline              |

---

## 5. Success Metrics

### 5.1 Primary Metrics

| Metric                       | Baseline | Target   | Measurement Method                         | Timeline            |
| ---------------------------- | -------- | -------- | ------------------------------------------ | -------------------- |
| Daily Active Users (DAU)     | 0        | 1,000    | Analytics (unique sessions/day)            | 3 months post-launch |
| Day-30 Retention Rate        | 0%       | ≥ 30%    | Cohort analysis                            | Ongoing monthly      |
| Mood Check-in Completion Rate| 0%       | ≥ 60%    | Events: `mood_checkin_completed` / active users | Monthly            |
| Habit Completion Rate        | 0%       | ≥ 50%    | `habit_completed` / `habit_scheduled`      | Monthly              |
| Task Completion Rate         | 0%       | ≥ 45%    | `task_completed` / `task_created`          | Monthly              |

### 5.2 Secondary Metrics

| Metric                        | Baseline | Target    | Measurement Method                       | Timeline     |
| ----------------------------- | -------- | --------- | ---------------------------------------- | ------------ |
| Average Session Duration      | 0 min    | ≥ 4 min   | Analytics (session timestamps)           | Monthly      |
| Habits Created per User       | 0        | ≥ 5       | `habit_created` count per user           | 30 days post-signup |
| Streak Length (avg)           | 0 days   | ≥ 7 days  | Max consecutive completion days          | Monthly      |
| Lighthouse Performance Score  | N/A      | ≥ 90      | Lighthouse CI                            | Each release |
| Lighthouse Accessibility Score| N/A      | ≥ 95      | Lighthouse CI                            | Each release |
| Page Load Time                | N/A      | < 2 sec   | Web Vitals (LCP)                         | Each release |
| Negative-Mood Follow-Through  | 0%       | ≥ 40%     | Users who select a calming activity after negative mood | Monthly |

---

## 6. Scope

### 6.1 MVP 1 – Core Experience

**Goal:** Deliver a fully functional habit-tracking and task-management web application with Smart Daily Check-in, analytics dashboard, and responsive PWA support.

**Target:** Q2 2026

#### ✅ In-Scope (MVP 1)

| # | Feature                                                      | Details                                                                                      | EPIC |
|---|--------------------------------------------------------------|----------------------------------------------------------------------------------------------|------|
| 1 | **Project Foundation & Infrastructure**                      | Next.js setup, Prisma schema, PostgreSQL, CI/CD pipeline, dev tooling                        | EPIC-001 |
| 2 | **Authentication**                                           | User registration & login (email + Google OAuth), session management, account lockout        | EPIC-002 |
| 3 | **Category Management**                                      | Create, read, edit, reorder, and delete habit categories; default seeding on registration    | EPIC-003 |
| 4 | **Habit Dashboard (Home) & Habit CRUD**                      | Daily habit list, interactive calendar, completion checkboxes, 3-step creation wizard, edit/delete | EPIC-004 |
| 5 | **Smart Daily Check-in & Mood Board**                        | Modal triggered on habit completion; 6 mood options; positive path (confetti + mascot); negative path (reflection + calming activities); upsert persistence | EPIC-005 |
| 6 | **Task Management**                                          | Task CRUD, sub-tasks (max 20), priority levels, due dates, auto-postpone, recurrence, sorting & filtering | EPIC-006 |
| 7 | **Analytics Dashboard**                                      | Completion rate donut, line chart (weekly/monthly/yearly), streak stats, calendar heatmap with drill-down | EPIC-007 |
| 8 | **Design System & Theming**                                  | CSS design tokens, component library, light/dark/system themes, mascot, responsive layout shell | EPIC-008 |
| 9 | **PWA & Offline Support**                                    | Web app manifest, service worker caching, offline fallback, background sync, Lighthouse PWA ≥ 90 | EPIC-009 |
| 10| **Security & Performance Hardening**                         | Security headers, CSP, rate limiting, bundle optimization, Lighthouse Performance ≥ 90, structured logging | EPIC-010 |

#### ❌ Out of Scope (MVP 1)

| # | Feature                          | Reason                                                        |
|---|----------------------------------|---------------------------------------------------------------|
| 1 | Social features (sharing, groups)| Deferred to MVP 2; requires social graph infrastructure        |
| 2 | AI-powered habit recommendations | Requires sufficient mood + habit data; planned for MVP 2       |
| 3 | Third-party calendar integrations (Google Cal, Outlook) | Deferred to MVP 2; OAuth complexity |
| 4 | Gamification (XP, badges, levels)| Deferred to MVP 2; requires game design iteration              |
| 5 | Collaborative / shared habits    | Deferred to MVP 2; requires real-time sync infrastructure     |
| 6 | Data export / import (CSV, JSON) | Nice-to-have; deferred to post-MVP 1 patch                   |
| 7 | Native mobile apps (iOS/Android) | PWA covers mobile; native deferred indefinitely               |
| 8 | Admin dashboard                  | Not needed for consumer-facing MVP                            |

### 6.2 Future Iterations Roadmap

| Phase   | Features                                                                    | Target     |
| ------- | --------------------------------------------------------------------------- | ---------- |
| MVP 2   | Social features, AI habit recommendations, gamification, calendar integrations | Q4 2026    |
| MVP 3   | Collaborative habits, team/family dashboards, advanced analytics (mood x habit correlation) | Q1 2027    |
| Post-MVP| Data export/import, API for third-party integrations, localization (i18n)     | Ongoing    |

---

## 7. User Flow

### 7.1 Primary Flow — Habit Completion with Smart Check-in

```
┌─────────────┐
│  User opens  │
│   Vora app   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐     No      ┌──────────────────┐
│ Is user logged   ├────────────►│  Login / Register │
│ in?              │             │  Screen           │
└──────┬──────────┘             └────────┬─────────┘
       │ Yes                             │
       ▼                                 │
┌─────────────────┐◄────────────────────┘
│  Home Dashboard  │
│  (Habit List)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ User taps habit  │
│ completion ✓     │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────┐
│  Smart Check-in Modal    │
│  "How are you feeling?"  │
│  [😊][💪][😟][😠][😢][😡] │
└──────┬──────────────────┘
       │
       ├── Positive (😊 💪) ──────────────────┐
       │                                       ▼
       │                          ┌──────────────────────┐
       │                          │ Congratulatory Msg    │
       │                          │ + Mascot Animation    │
       │                          │ (auto-close 2s)       │
       │                          └──────────┬───────────┘
       │                                     │
       │                                     ▼
       │                          ┌──────────────────────┐
       │                          │ Store mood data       │
       │                          │ Mark habit complete   │
       │                          └──────────┬───────────┘
       │                                     │
       ├── Negative (😟😠😢😡) ───────┐      │
       │                               ▼      │
       │                 ┌─────────────────┐   │
       │                 │ Empathetic Msg   │   │
       │                 │ "What's making   │   │
       │                 │  you feel this?" │   │
       │                 └────────┬────────┘   │
       │                          │             │
       │                          ▼             │
       │                 ┌─────────────────┐   │
       │                 │ Reflection       │   │
       │                 │ (optional text)  │   │
       │                 └────────┬────────┘   │
       │                          │             │
       │                          ▼             │
       │                 ┌─────────────────┐   │
       │                 │ "What would      │   │
       │                 │  calm you down?" │   │
       │                 │ • Short break    │   │
       │                 │ • Deep breathing │   │
       │                 │ • Calming music  │   │
       │                 │ • Talk to someone│   │
       │                 │ • Go for a walk  │   │
       │                 └────────┬────────┘   │
       │                          │             │
       │                          ▼             │
       │                 ┌─────────────────┐   │
       │                 │ Supportive Mascot│   │
       │                 │ + Store data     │   │
       │                 └────────┬────────┘   │
       │                          │             │
       ▼                          ▼             ▼
┌─────────────────────────────────────────────────┐
│            Return to Home Dashboard              │
│            (habit marked complete ✅)             │
└─────────────────────────────────────────────────┘
```

### 7.2 Alternative Flows

| Flow                       | Description                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Skip Check-in**          | User may dismiss the modal (X button) to skip mood tracking; habit is still marked complete             |
| **Undo Completion**        | User can uncheck a completed habit to revert; mood data for that check-in is soft-deleted               |
| **Offline Completion**     | Habit is completed locally; data syncs to cloud when connectivity is restored                           |
| **Multiple Habits at Once**| Each habit completion triggers its own check-in; user completes them sequentially                       |

### 7.3 Error / Edge Cases

| Edge Case                              | Handling                                                                |
| -------------------------------------- | ----------------------------------------------------------------------- |
| Network failure during check-in        | Queue data locally; retry sync in background                            |
| Session expired during modal           | Preserve check-in data locally; prompt re-login; resume sync            |
| Duplicate check-in for same habit/day  | Overwrite previous mood entry for that habit on that day with latest    |
| User closes browser during modal       | On next visit, do not re-trigger modal; treat habit as incomplete       |
| Habit due time passes without action   | Send push notification reminder (if enabled); no auto-complete          |

---

## 8. User Stories

### 8.1 Habit Management

| ID    | User Story                                                                                              | Acceptance Criteria                                                                                                                                                                                                     | Design       | Notes                        | Platform | JIRA Ticket |
| ----- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------- | -------- | ----------- |
| US-01 | As a user, I want to create a new habit with a name, category, color, and frequency so I can track it daily | **Given** I am on the Home Dashboard<br>**When** I click "Add Habit"<br>**Then** a creation form appears with fields for name, category (dropdown), color (picker), and frequency (daily/weekly/monthly)<br>**And** each frequency type shows its specific sub-fields<br>**And** I can save the habit successfully | [Figma link] | Validate required fields     | Web      | [JIRA-###]  |
| US-02 | As a user, I want to mark a habit as complete for today so I can track my progress                       | **Given** I see my habit list for today<br>**When** I click the checkbox next to a habit<br>**Then** the Smart Check-in modal appears<br>**And** after completing the check-in, the habit shows a completion stamp animation<br>**And** the completion is persisted to the database | [Figma link] | Triggers mood check-in flow  | Web      | [JIRA-###]  |
| US-03 | As a user, I want to view my habits organized by category so I can focus on specific areas of my life    | **Given** I am on the Home Dashboard<br>**When** I open the category sidebar<br>**Then** I see all my categories listed with habit counts<br>**And** I can filter habits by selecting a category<br>**And** "All" shows every habit | [Figma link] | Sidebar on mobile = drawer   | Web      | [JIRA-###]  |
| US-04 | As a user, I want to edit or delete a habit so I can keep my habit list relevant                         | **Given** I have an existing habit<br>**When** I click the edit icon (or swipe on mobile)<br>**Then** the edit form pre-populates with current values<br>**And** I can update and save changes<br>**And** I can delete with a confirmation dialog | [Figma link] | Soft-delete for data integrity | Web    | [JIRA-###]  |
| US-05 | As a user, I want to set notification reminders for my habits so I don't forget them                     | **Given** I am creating or editing a habit<br>**When** I enable "Remind me at" and pick a time<br>**Then** I receive a browser notification at that time daily (or on scheduled days)<br>**And** the notification includes the habit name and a quick-complete action | [Figma link] | Requires notification permission | Web  | [JIRA-###]  |

### 8.2 Smart Daily Check-in & Mood Board

| ID    | User Story                                                                                              | Acceptance Criteria                                                                                                                                                                                                     | Design       | Notes                        | Platform | JIRA Ticket |
| ----- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------- | -------- | ----------- |
| US-06 | As a user, I want to select my mood after completing a habit so I can track my emotional state           | **Given** I have just checked a habit as complete<br>**When** the Smart Check-in modal appears<br>**Then** I see 6 mood options (Happy, Proud, Worried, Annoyed, Sad, Angry) with emoji icons<br>**And** I can select exactly one mood | [Figma link] | Blocking modal              | Web      | [JIRA-###]  |
| US-07 | As a user selecting a positive mood, I want to receive a congratulatory response so I feel encouraged    | **Given** I selected "Happy" or "Proud"<br>**When** the system processes my selection<br>**Then** I see a congratulatory message<br>**And** an animated mascot / "Good Job" stamp appears<br>**And** the modal auto-closes after 2 seconds<br>**And** mood data is stored with timestamp and associated habit | [Figma link] | Auto-close timer: 2 sec     | Web      | [JIRA-###]  |
| US-08 | As a user selecting a negative mood, I want empathetic support so I feel acknowledged and can reflect    | **Given** I selected "Worried", "Annoyed", "Sad", or "Angry"<br>**When** the system processes my selection<br>**Then** I see an empathetic message<br>**And** a follow-up: "What's making you feel this way?"<br>**And** an optional reflection text area appears<br>**And** after optional input, I see "What would calm you down?" with activity suggestions<br>**And** I can select a calming activity or skip<br>**And** a supportive mascot animation plays<br>**And** all data (mood, reflection, activity) is stored | [Figma link] | Multi-step within modal     | Web      | [JIRA-###]  |
| US-09 | As a user, I want to skip the mood check-in so I can quickly complete habits when I'm in a hurry        | **Given** the Smart Check-in modal is displayed<br>**When** I click the close (X) button<br>**Then** the modal dismisses<br>**And** the habit is still marked as complete<br>**And** no mood data is recorded for this check-in | [Figma link] | Must not block habit tracking | Web     | [JIRA-###]  |

### 8.3 Task Management

| ID    | User Story                                                                                              | Acceptance Criteria                                                                                                                                                                                                     | Design       | Notes                        | Platform | JIRA Ticket |
| ----- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------- | -------- | ----------- |
| US-10 | As a user, I want to create a task with title, description, sub-tasks, due date, priority, and recurrence | **Given** I am on the Tasks screen<br>**When** I click "Add Task"<br>**Then** a form appears with: title (required), description (rich text, optional), sub-task list (dynamic add/remove), due date (calendar picker), priority (High/Medium/Low), recurrence dropdown, auto-postpone toggle<br>**And** I can save the task | [Figma link] | Sub-tasks: dynamic list     | Web      | [JIRA-###]  |
| US-11 | As a user, I want to mark tasks and sub-tasks as complete so I can track my progress                     | **Given** I see my task list<br>**When** I check the task checkbox<br>**Then** the task shows a strikethrough animation<br>**And** completion is persisted<br>**And** sub-tasks can be completed independently<br>**And** task auto-completes when all sub-tasks are done | [Figma link] | Strikethrough animation     | Web      | [JIRA-###]  |
| US-12 | As a user, I want overdue tasks with auto-postpone enabled to move forward automatically                 | **Given** a task has auto-postpone ON and its due date has passed<br>**When** the next day begins<br>**Then** the task's due date moves to today<br>**And** the task appears in today's list<br>**And** the original due date is preserved in history | [Figma link] | Runs on app load / cron     | Web      | [JIRA-###]  |
| US-13 | As a user, I want to filter and sort my tasks so I can find what's most important                        | **Given** I am on the Tasks screen<br>**When** I use filter options<br>**Then** I can filter by: All, Today, Upcoming, Overdue<br>**And** I can sort by: Priority (default), Due Date, Created Date<br>**And** the list updates immediately | [Figma link] | Default sort: priority      | Web      | [JIRA-###]  |

### 8.4 Analytics Dashboard

| ID    | User Story                                                                                              | Acceptance Criteria                                                                                                                                                                                                     | Design       | Notes                        | Platform | JIRA Ticket |
| ----- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------- | -------- | ----------- |
| US-14 | As a user, I want to see my overall habit completion rate so I know how consistent I am                  | **Given** I navigate to the Analytics tab<br>**When** the page loads<br>**Then** I see a circular progress indicator showing `(Completed / Scheduled) × 100`<br>**And** the value updates in real-time as I complete habits | [Figma link] | Circular gauge component    | Web      | [JIRA-###]  |
| US-15 | As a user, I want to see my habit activity over time on a line chart so I can identify trends            | **Given** I am on the Analytics page<br>**When** I view the activity chart<br>**Then** I see a line chart with X=time, Y=completion rate<br>**And** I can toggle between Weekly, Monthly, Yearly views<br>**And** interactive tooltips show exact values on hover | [Figma link] | Lazy-load chart library     | Web      | [JIRA-###]  |
| US-16 | As a user, I want to see streak, perfect day, and active day stats so I can celebrate my consistency     | **Given** I am on the Analytics page<br>**When** I view the stats section<br>**Then** I see: Streak Days 🔥 (consecutive all-complete days), Perfect Days 🏆 (total 100% days), Active Days (days with any activity)<br>**And** values are accurate and up-to-date | [Figma link] | Real-time calculation       | Web      | [JIRA-###]  |
| US-17 | As a user, I want a calendar heatmap so I can visually scan my monthly performance                       | **Given** I am on the Analytics page<br>**When** I view the calendar heatmap<br>**Then** I see a monthly grid where each day is color-coded: 🟢 80–100%, 🟡 40–79%, 🔴 1–39%, ⚪ No data<br>**And** I can click a day to see a detailed breakdown<br>**And** tooltips show the exact percentage | [Figma link] | Similar to GitHub contributions | Web  | [JIRA-###]  |

### 8.5 Settings & Personalization

| ID    | User Story                                                                                              | Acceptance Criteria                                                                                                                                                                                                     | Design       | Notes                        | Platform | JIRA Ticket |
| ----- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------- | -------- | ----------- |
| US-18 | As a user, I want to toggle between light and dark mode so I can use the app comfortably at any time     | **Given** I am in Settings<br>**When** I toggle the theme switch<br>**Then** the entire app switches between light and dark mode immediately<br>**And** my preference is persisted across sessions | [Figma link] | Store in localStorage + DB  | Web      | [JIRA-###]  |
| US-19 | As a user, I want to customize habit colors so I can visually distinguish my habits                      | **Given** I am creating or editing a habit<br>**When** I open the color picker<br>**Then** I see 8–12 predefined colors<br>**And** I can select one to apply to the habit<br>**And** the color is reflected in the habit card, calendar, and analytics | [Figma link] | Predefined palette only     | Web      | [JIRA-###]  |

### 8.6 Authentication & Data

| ID    | User Story                                                                                              | Acceptance Criteria                                                                                                                                                                                                     | Design       | Notes                        | Platform | JIRA Ticket |
| ----- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------- | -------- | ----------- |
| US-20 | As a new user, I want to register and log in so my data is saved across devices                          | **Given** I am on the login page<br>**When** I choose to register (email or OAuth)<br>**Then** my account is created<br>**And** I am redirected to the Home Dashboard<br>**And** I can log out and log back in with data intact | [Figma link] | NextAuth (Google, GitHub)   | Web      | [JIRA-###]  |
| US-21 | As a user, I want my data to sync in real-time so I can switch between devices seamlessly                | **Given** I complete a habit on my phone<br>**When** I open Vora on my desktop<br>**Then** the completion and mood data are already reflected<br>**And** sync happens within 5 seconds of reconnection | [Figma link] | Cloud-first, local fallback | Web      | [JIRA-###]  |

### 8.7 Category Management (EPIC-003)

| ID    | User Story                                                                                              | Acceptance Criteria                                                                                                                                                                                                     | Design       | Notes                        | Platform | JIRA Ticket |
| ----- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------- | -------- | ----------- |
| US-22 | As a new user, I want default categories created for me so I can start tracking habits immediately       | **Given** I complete registration<br>**When** my account is created<br>**Then** I automatically receive 4 default categories: Health, Work, Personal, Learning<br>**And** each has an icon and default color | [Figma link] | Seeded on NextAuth createUser event | Web | [JIRA-###] |
| US-23 | As a user, I want to create a custom category so I can organize my habits by my own areas of focus      | **Given** I am in Category Management<br>**When** I click "Add Category" and enter a name, icon emoji, and color<br>**Then** the category is created and appears in the sidebar<br>**And** I can assign habits to it | [Figma link] | Max 20 categories per user  | Web      | [JIRA-###]  |
| US-24 | As a user, I want to edit a category's name, icon, or color so I can keep my categories relevant        | **Given** I select a category to edit<br>**When** I update fields and save<br>**Then** the changes are reflected immediately in the sidebar and on all associated habit cards | [Figma link] | —                            | Web      | [JIRA-###]  |
| US-25 | As a user, I want to reorder my categories so I can prioritize what I see first in the sidebar          | **Given** I am viewing my categories<br>**When** I drag and drop a category to a new position<br>**Then** the new order persists and appears the same on next visit | [Figma link] | Optimistic UI with rollback | Web      | [JIRA-###]  |
| US-26 | As a user, I want to delete a category so I can remove areas I no longer track                          | **Given** I delete a non-default category<br>**When** I confirm the deletion<br>**Then** the category is removed<br>**And** its habits are reassigned to the default "Personal" category<br>**And** the category no longer appears in any selector | [Figma link] | Soft-delete; default categories cannot be deleted | Web | [JIRA-###] |

### 8.8 Design System & PWA (EPIC-008, EPIC-009)

| ID    | User Story                                                                                              | Acceptance Criteria                                                                                                                                                                                                     | Design       | Notes                        | Platform | JIRA Ticket |
| ----- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------- | -------- | ----------- |
| US-27 | As a user, I want the app to automatically use my OS light/dark preference so it feels native           | **Given** my OS is set to dark mode<br>**When** I first open Vora<br>**Then** dark mode is active automatically<br>**And** I can override it manually in Settings | [Figma link] | `prefers-color-scheme` API  | Web      | [JIRA-###]  |
| US-28 | As a user, I want the mascot's expression to match my mood selection so the app feels emotionally aware | **Given** I select a mood in the Check-in modal<br>**When** the mood is confirmed<br>**Then** the mascot switches to the matching expression (happy/proud/concerned/cheering) with a 300ms crossfade | [Figma link] | 4 expression states          | Web      | [JIRA-###]  |
| US-29 | As a user, I want to install Vora on my home screen so I can launch it like a native app                | **Given** I visit Vora in Chrome or Edge<br>**When** I click "Add to Home Screen"<br>**Then** the app installs in standalone mode<br>**And** it opens without browser chrome | [Figma link] | Requires manifest.json + SW | Web      | [JIRA-###]  |
| US-30 | As a user, I want to view my habit list offline so I can check my habits even without internet          | **Given** my device is offline<br>**When** I open Vora<br>**Then** I see the cached Home Dashboard with my last-known habits<br>**And** any completions I make are queued and sync when I reconnect | [Figma link] | Background Sync API         | Web      | [JIRA-###]  |

### 8.9 Security & Performance (EPIC-010)

| ID    | User Story                                                                                              | Acceptance Criteria                                                                                                                                                                                                     | Design       | Notes                        | Platform | JIRA Ticket |
| ----- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------- | -------- | ----------- |
| US-31 | As a user, I want my account locked after repeated failed logins so my account is protected from brute-force attacks | **Given** I enter incorrect credentials 5 times<br>**When** I try again<br>**Then** I see "Too many failed attempts. Try again in 15 minutes."<br>**And** no further login attempts are accepted during the lockout | [Figma link] | BR-006; EPIC-002 + EPIC-010  | Web      | [JIRA-###]  |
| US-32 | As a developer, I want rate limiting on API endpoints so the server is protected from abuse             | **Given** a client sends more than 100 requests/min to the general API<br>**When** the threshold is exceeded<br>**Then** the server returns HTTP 429 with a retry-after header<br>**And** legitimate requests are unaffected | — | Auth endpoints: 10 req/min  | Web      | [JIRA-###]  |
| US-33 | As a user, I want the app to load fast so I am not frustrated waiting for content                       | **Given** I open the app on a typical connection<br>**When** the page loads<br>**Then** First Contentful Paint is < 1.5s<br>**And** Largest Contentful Paint is < 2.5s<br>**And** Cumulative Layout Shift is < 0.1 | — | Core Web Vitals targets      | Web      | [JIRA-###]  |

---

## 9. Analytics & Event Tracking

### 9.1 Core Events

| Event Name                 | Trigger                                   | Page / Component       | Key Parameters                                                                       |
| -------------------------- | ----------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| `habit_created`            | User saves a new habit                    | Habit Creation Form    | `habitId`, `category`, `frequency`, `hasReminder`                                    |
| `habit_completed`          | User checks habit checkbox                | Home Dashboard         | `habitId`, `category`, `completionTime`, `dayOfWeek`                                 |
| `habit_uncompleted`        | User unchecks a completed habit           | Home Dashboard         | `habitId`, `category`, `timeSinceCompletion`                                         |
| `mood_checkin_started`     | Smart Check-in modal opens                | Check-in Modal         | `habitId`, `triggerType`                                                             |
| `mood_checkin_completed`   | User completes mood selection             | Check-in Modal         | `habitId`, `mood`, `isPositive`, `hasReflection`, `selectedActivity`                 |
| `mood_checkin_skipped`     | User dismisses modal without selecting    | Check-in Modal         | `habitId`, `dismissMethod`                                                           |
| `task_created`             | User saves a new task                     | Task Creation Form     | `taskId`, `priority`, `hasDueDate`, `hasSubTasks`, `isRecurring`                     |
| `task_completed`           | User checks task checkbox                 | Tasks Screen           | `taskId`, `priority`, `daysUntilDue`, `subTaskCount`                                 |
| `analytics_viewed`         | User navigates to Analytics tab           | Analytics Dashboard    | `activeView` (weekly/monthly/yearly)                                                 |
| `heatmap_day_clicked`      | User clicks a day on calendar heatmap     | Analytics Dashboard    | `date`, `completionPercentage`, `habitsCompleted`, `habitsScheduled`                 |
| `theme_toggled`            | User switches light/dark mode             | Settings               | `newTheme`                                                                           |
| `user_registered`          | User completes registration               | Register Screen        | `authMethod` (email/google/github), `referralSource`                                 |
| `user_logged_in`           | User logs in                              | Login Screen           | `authMethod`, `isReturningUser`                                                      |

### 9.2 Event Structure Examples

**Habit Completion with Mood Check-in:**

```json
{
  "eventName": "mood_checkin_completed",
  "trigger": "Modal Submission",
  "triggerValue": "Mood Selected",
  "page": "Home Dashboard > Check-in Modal",
  "timestamp": "2026-03-15T08:30:00Z",
  "data": {
    "habitId": "hab_abc123",
    "habitName": "Morning Run",
    "category": "Sports",
    "mood": "proud",
    "isPositive": true,
    "hasReflection": false,
    "selectedActivity": null,
    "completionOrder": 2,
    "totalHabitsToday": 5
  },
  "user": {
    "userId": "usr_xyz789",
    "daysSinceRegistration": 14,
    "currentStreak": 7
  },
  "description": "User felt proud after completing their morning run habit"
}
```

**Negative Mood with Reflection:**

```json
{
  "eventName": "mood_checkin_completed",
  "trigger": "Modal Submission",
  "triggerValue": "Mood + Reflection + Activity",
  "page": "Home Dashboard > Check-in Modal",
  "timestamp": "2026-03-15T21:45:00Z",
  "data": {
    "habitId": "hab_def456",
    "habitName": "Evening Reading",
    "category": "Personal Growth",
    "mood": "worried",
    "isPositive": false,
    "hasReflection": true,
    "reflectionLength": 45,
    "selectedActivity": "deep_breathing",
    "completionOrder": 4,
    "totalHabitsToday": 5
  },
  "user": {
    "userId": "usr_xyz789",
    "daysSinceRegistration": 14,
    "currentStreak": 7
  },
  "description": "User felt worried while reading; chose deep breathing as calming activity"
}
```

**Task Created:**

```json
{
  "eventName": "task_created",
  "trigger": "Form Submission",
  "triggerValue": "Save Task Button",
  "page": "Tasks Screen > Task Creation Form",
  "timestamp": "2026-03-15T09:00:00Z",
  "data": {
    "taskId": "tsk_ghi789",
    "title": "Prepare quarterly report",
    "priority": "high",
    "hasDueDate": true,
    "dueDate": "2026-03-20",
    "hasSubTasks": true,
    "subTaskCount": 3,
    "isRecurring": false,
    "autoPostpone": true
  },
  "description": "User created a high-priority task with 3 sub-tasks and auto-postpone enabled"
}
```

---

## 10. Open Questions

| #  | Question                                                                                      | Owner          | Status      | Due Date   | Resolution |
| -- | --------------------------------------------------------------------------------------------- | -------------- | ----------- | ---------- | ---------- |
| 1  | Should the mascot be a single character or customizable by the user?                          | Design         | Open        | [TBD]      |            |
| 2  | What is the maximum number of habits a free-tier user can create?                             | Product        | Open        | [TBD]      |            |
| 3  | Should mood data be permanently stored or auto-purged after a retention period?               | Product / Legal| Open        | [TBD]      |            |
| 4  | What OAuth providers should be supported at launch beyond Google?                             | Engineering    | Open        | [TBD]      |            |
| 5  | Should the calming activity suggestions link to external resources (e.g., guided breathing video)? | Product / Design | Open    | [TBD]      |            |
| 6  | What is the expected concurrent user load for infrastructure sizing?                          | Engineering    | Open        | [TBD]      |            |
| 7  | Is push notification support (via service worker) a hard requirement for MVP 1?               | Product        | Open        | [TBD]      |            |
| 8  | Should the analytics dashboard include mood-over-time visualization in MVP 1?                 | Product        | Open        | [TBD]      |            |
| 9  | How should recurring tasks interact with the auto-postpone feature?                           | Engineering    | Open        | [TBD]      |            |
| 10 | What is the data backup and recovery strategy?                                                | Engineering    | Open        | [TBD]      |            |

---

## 11. Notes & Considerations

### 11.1 Technical Considerations

| Area                      | Consideration                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| **Offline-first**         | Service worker must cache critical assets and queue data mutations for background sync               |
| **Performance**           | Initial page load < 2s (LCP). Animations at 60fps. Lazy-load chart libraries (e.g., Chart.js, Recharts) |
| **Database**              | PostgreSQL via Prisma ORM. Consider connection pooling (e.g., PgBouncer) for scale                  |
| **Authentication**        | NextAuth.js with JWT sessions. Support email + Google OAuth at minimum                               |
| **State Management**      | Consider Zustand or React Context for client-side state; React Query / SWR for server state         |
| **PWA**                   | next-pwa or Workbox for service worker generation. Manifest file for installability                  |
| **Responsive Breakpoints**| 320px (mobile), 768px (tablet), 1024px+ (desktop). CSS Grid + Flexbox layout system                 |
| **Browser Support**       | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+                                                      |

### 11.2 Business Considerations

| Area                      | Consideration                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| **Monetization**          | Freemium model TBD. MVP 1 is fully free. Premium tiers can gate AI features, advanced analytics     |
| **Privacy / GDPR**        | Mood and reflection data is sensitive. Encryption at rest; clear privacy policy; data deletion flow  |
| **Localization**          | MVP 1 in English only. Architecture should support i18n for future expansion                        |
| **User Onboarding**       | Consider a first-time tutorial / wizard to explain Check-in flow and reduce confusion               |
| **Competitive Moat**      | The mood-aware check-in is the primary differentiator. Prioritize polish and emotional design        |

### 11.3 Design Considerations

| Area                      | Consideration                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| **Mascot Design**         | Must convey empathy (negative moods) and celebration (positive moods). Needs multiple emotional states |
| **Animation Budget**      | Keep total animation assets under 500KB to maintain performance                                     |
| **Color Accessibility**   | All color-coded elements (heatmap, priorities) must have non-color indicators (icons, text labels)   |
| **Modal UX**              | The check-in modal is blocking; ensure close (X) is always visible and keybaord-accessible (Esc)    |
| **Touch Targets**         | Minimum 44×44px for all interactive elements per WCAG 2.1 AA                                        |

---

## 12. Appendix

### 12.1 Predefined Habit Categories

| Category            | Icon  | Default Color | Example Habits                                         |
| ------------------- | ----- | ------------- | ------------------------------------------------------ |
| Personal Growth     | 📚    | `#6C63FF`     | Reading, Learning skills, Goal review, Planning        |
| Sports              | 🏃    | `#FF6B6B`     | Gym, Swimming, Running, Cycling, Padel                 |
| Social Health       | 👨‍👩‍👧‍👦 | `#4ECDC4`     | Family time, Call parents, Workshops, Friend time       |
| Financial           | 💰    | `#FFD93D`     | Bills, Shopping, Budgeting, Financial check            |
| Household           | 🏠    | `#95E1D3`     | Cleaning, Watering plants, Laundry, Priority tasks     |

### 12.2 Mood Options Reference

| Emoji | Label    | Category | Follow-up Path                                      |
| ----- | -------- | -------- | --------------------------------------------------- |
| 😊    | Happy    | Positive | Congratulations → Mascot → Auto-close (2s)          |
| 💪    | Proud    | Positive | Congratulations → Mascot → Auto-close (2s)          |
| 😟    | Worried  | Negative | Empathy → Reflection → Calming Activities → Mascot  |
| 😠    | Annoyed  | Negative | Empathy → Reflection → Calming Activities → Mascot  |
| 😢    | Sad      | Negative | Empathy → Reflection → Calming Activities → Mascot  |
| 😡    | Angry    | Negative | Empathy → Reflection → Calming Activities → Mascot  |

### 12.3 Priority System Reference

| Level  | Emoji | Color Code | Sort Order |
| ------ | ----- | ---------- | ---------- |
| High   | 🔴    | `#EF4444`  | 1 (top)    |
| Medium | 🟡    | `#F59E0B`  | 2          |
| Low    | 🟢    | `#10B981`  | 3          |

### 12.4 Glossary

| Term                  | Definition                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------ |
| **Smart Check-in**    | The mood-aware modal that appears upon habit completion to capture emotional state          |
| **Mood Board**        | The UI component within the Smart Check-in that presents emotion options                   |
| **Streak**            | Consecutive calendar days where all scheduled habits were completed                        |
| **Perfect Day**       | A calendar day where 100% of scheduled habits were completed                               |
| **Active Day**        | A calendar day where at least one habit was completed                                      |
| **Auto-Postpone**     | Feature that automatically moves an overdue task's due date to the current day             |
| **Calendar Heatmap**  | A color-coded monthly calendar showing daily completion percentages                        |
| **PWA**               | Progressive Web App — a web application that can be installed and used offline              |
| **DAU**               | Daily Active Users — unique users who open the app in a given day                          |

### 12.5 References

| Document / Resource          | Link                                    |
| ---------------------------- | --------------------------------------- |
| Product Brief                | `brief.md`                              |
| Functional Spec (FSD)        | [FSD Document Link]                     |
| Entity Relationship Diagram  | [ERD Document Link]                     |
| API Contract                 | [API Specification Link]                |
| Technical Design (TDD)       | [TDD Document Link]                     |
| Wireframes                   | [Wireframes Document Link]              |
| WCAG 2.1 AA Guidelines      | [https://www.w3.org/WAI/WCAG21/quickref/](https://www.w3.org/WAI/WCAG21/quickref/) |

---

## 13. Epic Traceability

### 13.1 EPIC → PRD Scope Mapping

| EPIC ID  | Title                                       | Size | PRD Scope Items                         | Sprint |
| -------- | ------------------------------------------- | ---- | --------------------------------------- | ------ |
| EPIC-001 | Setup Project Foundation & Infrastructure   | M    | Scope #1 Data Persistence, CI/CD        | 1      |
| EPIC-002 | Implement User Authentication               | M    | Scope #11 Authentication (US-20, US-31) | 2      |
| EPIC-003 | Build Category Management                   | S    | Scope #4 Habit Dashboard (US-22–US-26)  | 2      |
| EPIC-004 | Build Habit Tracking Core                   | L    | Scope #2 Habit CRUD (US-01–US-05)       | 3      |
| EPIC-005 | Implement Smart Mood Check-in               | M    | Scope #3 Smart Check-in (US-06–US-09)   | 4      |
| EPIC-006 | Build Task Management System                | L    | Scope #4 Task Management (US-10–US-13)  | 4      |
| EPIC-007 | Build Analytics & Insights Dashboard        | L    | Scope #5 Analytics (US-14–US-17)        | 5      |
| EPIC-008 | Implement Design System & Theming           | M    | Scope #6–8 Design (US-18, US-27–US-28)  | 1      |
| EPIC-009 | Enable PWA & Offline Support                | M    | Scope #10 PWA (US-29–US-30)             | 6      |
| EPIC-010 | Harden Security & Performance               | S    | Scope #9 Accessibility, NFRs (US-32–US-33) | 6   |

### 13.2 Recommended Sprint Sequence

| Sprint | EPICs                   | Focus                                 |
| ------ | ----------------------- | ------------------------------------- |
| 1      | EPIC-001, EPIC-008      | Foundation + Design System            |
| 2      | EPIC-002, EPIC-003      | Auth + Category Management            |
| 3      | EPIC-004                | Habit Tracking Core                   |
| 4      | EPIC-005, EPIC-006      | Mood Check-in + Task Management       |
| 5      | EPIC-007                | Analytics Dashboard                   |
| 6      | EPIC-009, EPIC-010      | PWA + Security & Performance Hardening|

### 13.3 Dependency Map

```
EPIC-001 (Foundation)
  ├──► EPIC-002 (Auth)
  │      ├──► EPIC-003 (Categories)
  │      │      └──► EPIC-004 (Habits) ──► EPIC-005 (Mood)
  │      │                              └──► EPIC-007 (Analytics)
  │      └──► EPIC-006 (Tasks)
  ├──► EPIC-008 (Design System)
  │      └──► EPIC-009 (PWA)
  └──► EPIC-010 (Security/Perf)
```

---

*PRD v3.0 — Updated 2026-03-25. Epic traceability added. This PRD is a living document and should be updated as decisions are made on open questions and scope evolves.*
