# Core Entity Editor Plan

## Goal
Implement a floating modal editor for editing category, subcategory, and language entities.

## Behavior
- Edit action opens a floating modal
- Modal fields:
  - Name
- Modal actions:
  - Save
  - Delete
  - Cancel
- Use the same modal overlay as task edits
- Wire entity edit/save/delete through Supabase

## Entity types
- Language category
- Knowledge category
- Language topic / subcategory

## UX
- Keep task edit flow unchanged
- Add an entity-specific title: "Edit Language", "Edit Category", "Edit Topic"
- Delete button should appear only in entity edit mode
- Save applies locally after success

## Implementation notes
- Add a new `coreEntityMode` ref or state for type tracking
- Reuse `core-task-modal` by toggling visible fields and title
- Add `data-core-entity-id` and `data-core-entity-type` to edit buttons
