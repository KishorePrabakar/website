# Conquer Page - Implementation & Feature Proposal

This document outlines the technical implementation strategy for the requested features on the Conquer page, along with proposals for additional enhancements to make the platform even more powerful.

---

## Part 1: Implementation Plan for Requested Features

### 1. Database Schema Overhaul

To properly support time tracking, daily repeating tasks, and advanced analytics, we should expand the schema:

- **`sections`**: The overarching categories (e.g., "Fitness", "Code").
- **`goals`** _(currently `tasks`)_: The main milestones you are working towards.
  - _New Columns_: `deadline` (Timestamp), `is_pinned` (Boolean), `total_time_spent` (Integer, seconds).
- **`subtasks`** _(new table)_: The smaller, actionable items under a goal.
  - _Columns_: `id`, `goal_id`, `title`, `is_repeatable` (Boolean), `last_completed_date` (Date), `due_date` (Date), `due_time` (Time).
- **`work_logs`** _(new table)_: To track the Pomodoro/Stopwatch sessions.
  - _Columns_: `id`, `section_id`, `goal_id`, `duration_seconds`, `created_date`.

### 2. Standalone Advanced Analytics Calendar

_Replacing the linear per-section streak lines with a dedicated, powerful calendar module._

- **Standalone Module:** A dedicated, robust analytics dashboard widget overriding the simple per-section lines.
- **Rich Filtering & Multi-Select:** Filter your history by specific sections. Selecting multiple sections at once assigns them distinct colors for easy visual comparison on the same chart.
- **View Toggles:** Toggle between "Streak Dots" (a contribution heatmap style) and "Graph View" (bar/line charts plotting the exact time spent).

### 3. Customizable Multi-Column Section Layout

_Moving away from a single vertical checklist into a dynamic workspace dashboard._

- **Drag-and-Drop Placement:** Sections can be dragged freely. Dropping a section to the side of an existing one locks it into a multi-column view. It persists exactly where you left it.
- **Resizable Panels:** Drag the edges of any section to increase or reduce its dimensions.
- **Auto-Flow Task Arrangement:** Inside a resized section, tasks automatically reflow and arrange themselves into multi-column layouts based on available space (with a configurable limit/breakpoint to prevent visually overwhelming dense columns).

### 4. Highlights Dashboard & Today's Focus

- **Left Column (Today's Focus & Pending):**
  - Dynamically loads from `subtasks` & rolls over incomplete tasks.
  - **Quick Add To-Do:** Features a frictionless text input bar directly in the Today's Focus section allowing you to type and instantly add a new task.
- **Right Column (Pinned Goals):**
  - Queries `goals` where `is_pinned = true`. Displays custom countdowns to deadlines.

### 5. Seamless Task Creation UI (No Browser Alerts)

- **Native-Feeling UX:** Complete replacement of blocking browser alerts (`prompt()`/`alert()`).
- **Yellow "+" Action Button:** A clean, bold yellow `+` button serves as the trigger for new items.
- **In-Site Mini Modal:** Clicking the `+` opens a smooth, floating popover window within the page.
- **Input Fields:**
  - **Title:** Standard task name.
  - **Sub-deadline Date:** A styled native calendar picker interface.
  - **Time Selector:** Defaults to current time; features an interactive, Android-style circular clock/alarm UI to quickly spin the dials and select hours/minutes.

### 6. Minimal Time Tracking

- **Status Widget:** Tracked time mathematically converts to clean shorthand (e.g., `2hr 5m`, `3d 2hr`) avoiding visual clutter next to headers.

---

## Part 2: Additional Proposed Features

To elevate "Conquer" into a state-of-the-art productivity engine, consider these additions:

### 1. Smart Grid Reset & Layout Templates (New Suggestion)

- **Concept:** Since you are actively moving and resizing columns, layouts can occasionally get messy. Provide a few "Snap Templates" (e.g., "3-Column Kanban", "Wide Priority", "Reset Default").
- **Effect:** Instantly organizes your scattered sections into a clean grid without losing your specific section filtering.

### 2. Focus Mode (Zen Interface)

- **Concept:** When the Pomodoro timer starts, provide a toggle to enter "Focus Mode".
- **Effect:** The UI dims, sidebars and extraneous sections hide, leaving only the timer, a beautiful ambient background, and the single task you are currently working on.

### 3. Progress Journeys (Micro-Journaling)

- **Concept:** Completing a massive goal shouldn't just be a single checkbox.
- **Effect:** Allow adding "Journal Entries" (text notes or image links) to a Goal. They appear as a mini timeline under the goal to document your process.

### 4. "Level Up" Gamification Engine

- **Concept:** Assign an XP value to tasks and pomodoro minutes.
- **Effect:** As you complete tasks and rack up hours, you "Level Up" your overall profile, giving a psychological dopamine hit to maintain streaks.

### 5. Eisenhower Priority Sorting

- **Concept:** Instead of just linearly sorting tasks, allow opening a "Matrix View".
- **Effect:** Drag and drop tasks onto a 2x2 quadrant (Urgent/Important) to visually decide what moves into Today's Focus.
