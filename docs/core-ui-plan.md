# Core UI Update Plan

## Objective
Move Languages beneath Tasks in the Core tab, and make UI interactions update smoothly without triggering a loading spinner after every click.

## Scope
- `neo/index.html`
- Core tab rendering and state wiring
- Supabase seed/data load behavior
- Task edit modal and inline actions

## Plan
1. Adjust Core state
   - Add `coreBusy` state for saving operations
   - Keep `prepTasks`, `prepCategories`, and `prepTopics` in memory
2. Optimize data refresh
   - Load data once when the Core tab is opened
   - Use local state updates for toggles and edits instead of full reloads
   - Keep `loadPrepData()` for initial load and seed operations only
3. Reorder UI cards
   - Place the Tasks card above the Languages card
   - Keep Knowledge Categories below Languages
4. Improve task editing
   - Keep modal editor for task details
   - Update the local task list immediately after save
5. Keep the Core card progress bar unique to tasks only

## Implementation Notes
- Use `setPrepTasks()` and `setPrepTopics()` for local updates after an inline toggle
- Avoid repeated `loadPrepData()` after every interaction
- Use `prompt()` only for add-category and add-language flows for now

## Result
- Smooth Core interaction
- Languages rendered under Tasks
- No unnecessary loading spinner after each save or toggle
