# Conquer Page - Implementation & Feature Proposal

This document outlines the technical implementation strategy for the requested features on the Conquer page, along with proposals for additional enhancements to make the platform even more powerful.

---

## Part 1: Implementation Plan for Requested Features

### 1. Database Schema Overhaul
To properly support time tracking, daily repeating tasks, and consistency calendars without making the application fragile, we should adopt the following schema:

*   **`sections`**: Remains the same (e.g., "Fitness", "Code").
*   **`goals`** *(currently `tasks`)*: The main milestones.
    *   *New Columns*: `deadline` (Timestamp), `is_pinned` (Boolean), `total_time_spent` (Integer, seconds).
*   **`subtasks`** *(new table)*: The smaller, actionable items under a goal.
    *   *Columns*: `id`, `goal_id`, `title`, `is_repeatable` (Boolean), `last_completed_date` (Date), `due_date` (Date).
*   **`work_logs`** *(new table)*: To track the Pomodoro/Stopwatch sessions.
    *   *Columns*: `id`, `section_id`, `goal_id`, `duration_seconds`, `created_date`.
    *   *Why?* Getting the "Consistency Calendar" is as easy as querying this table grouped by `created_date`.

### 2. Highlights Dashboard (The 2-Column UI)
Directly beneath the top statistics grid, we will introduce a premium Glassmorphic highlights box:
*   **Left Column (Today's Focus & Pending):** 
    *   Dynamically loads from `subtasks`.
    *   Shows any subtask where `is_repeatable = true` and `last_completed_date` is NOT today.
    *   Shows one-off tasks whose `due_date` is today or earlier (Pending tasks roll over automatically).
*   **Right Column (Pinned Goals):** 
    *   Queries `goals` where `is_pinned = true`.
    *   Displays the goal title, its parent section tag, and a visual countdown to its `deadline`.

### 3. Time Tracking (Pomodoro & Stopwatch)
*   **UI Placement:** A floating widget in the bottom right (or docked to the Highlights Dashboard).
*   **User Flow:** User selects an active subtask/goal -> Starts Timer -> When stopped or completed, a new entry is logged into `work_logs`.
*   **Compact Display:** Time will be mathematically reduced (e.g., `125m` becomes `2hr 5m`, `3000m` becomes `2d 2hr`) and displayed as a minimal pill badge next to the parent Goal and Section headers.

### 4. Consistency Calendar
*   A GitHub-style contribution heatmap for each section. 
*   Powered by `work_logs`. Days with more time spent will glow brighter. 
*   Hovering over a square will reveal micro-animations showing precisely how much time was logged on that given day.

---

## Part 2: Additional Proposed Features

To elevate "Conquer" into a state-of-the-art productivity engine, consider these additions:

### 1. Focus Mode (Zen Interface)
*   **Concept:** When the Pomodoro timer starts, provide a toggle to enter "Focus Mode". 
*   **Effect:** The UI dims, sidebars and extraneous sections hide, leaving only the timer, a beautiful ambient background, and the single task you are currently working on.

### 2. Progress Journeys (Micro-Journaling)
*   **Concept:** Goals change over time. Completing a massive goal (like "Run a Marathon") shouldn't just be a single checkbox.
*   **Effect:** Allow adding "Journal Entries" (text notes or image links) to a Goal. They appear as a mini timeline under the goal, so you can document the *process* of completing the impossible list, not just the completion.

### 3. "Level Up" Gamification engine
*   **Concept:** Assign an XP value to tasks and pomodoro minutes. 
*   **Effect:** As you complete tasks and rack up hours, you "Level Up" your overall profile. This adds a psychological layer of motivation to keep your consistency streaks alive.

### 4. Eisenhower Priority Sorting
*   **Concept:** Instead of just linearly sorting tasks, allow opening a "Matrix View".
*   **Effect:** Drag and drop tasks onto a quadrant (Urgent & Important / Not Urgent & Important). Helps rapidly decide what goes into your "Today's Checklist".

### 5. Smart Analytics Drawer
*   **Concept:** A slide-out panel that graphs your productivity.
*   **Effect:** Charts showing which days of the week you log the most hours, total hours spent by section (e.g., 60% Code, 40% Fitness), and streak statistics.
