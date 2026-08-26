# Impossible List — Knowledge Category: Future Seed

> **This file is internal documentation only.** It must not be rendered, imported, linked, exposed, or otherwise made visible anywhere on the website.

## Current state

The knowledge category on `/conquer` is intentionally minimal. It currently contains 6 starter sections with 18 total goals:

1. **politics & geopolitics** — 3 goals
2. **economics & business** — 3 goals
3. **science & technology** — 3 goals
4. **medicine & the human body** — 3 goals
5. **psychology & people** — 3 goals
6. **history & civilisation** — 3 goals

These are entry-level intellectual outcomes, not a curriculum. They represent the first layer of a much larger impossible list.

## Philosophy

This category follows the same rules as the rest of the impossible list:

- Every item is a **concrete outcome**, not a learning objective
- Items describe **demonstrable understanding**, completed analyses, or observable evidence of knowledge
- No item should read like a course syllabus or textbook chapter heading
- The list is deliberately small and will grow over time

## Future expansion plan

Future work should expand this category significantly. Expansion should cover additional depth in:

- Politics & geopolitics
- Economics & business
- Science & technology
- Medicine & the human body
- Psychology & people
- History & civilisation
- Philosophy
- Mathematics
- Law & governance
- Media & information literacy
- Systems thinking
- Other intellectually valuable domains

### Rules for expansion

1. **Preserve existing goals.** The current 18 starter goals must remain unless explicitly replaced with better versions. Do not delete them to make room for new ones.
2. **Add ambitious, specific goals.** Each new goal should represent a genuine intellectual achievement — not a vague aspiration.
3. **No redundancy.** Before adding a goal, check that no existing goal already covers the same concept at a similar or higher level of specificity.
4. **No syllabi.** Goals must not become "learn topic X" or "study framework Y." They should describe outcomes like analyses, explanations, investigations, projects, or demonstrable understanding.
5. **Use measurable outcomes where possible.** Prefer goals with counts, thresholds, specific deliverables, or other observable evidence.
6. **Maintain the recursive tree structure.** New items must fit the existing `impossible_items` table schema (`parent_id` self-referencing FK, `sort_order`, `completed`, `status`).
7. **Respect the progression.** Within each section, order goals from foundational to advanced.

## Future AI seed prompt

If you are an AI coding agent reading this file, here is your context and instructions:

---

### Task

You are expanding the **knowledge** category of an impossible list application hosted at `/conquer`.

### What exists

- A Supabase PostgreSQL table `impossible_items` with columns: `id` (uuid), `user_id` (uuid FK), `parent_id` (uuid self-FK), `title` (text), `description` (text), `completed` (boolean), `status` (text: active/someday/completed/abandoned), `sort_order` (integer), `created_at`, `updated_at`.
- RLS policies: public read, owner-only write.
- The knowledge category (`title = 'knowledge'`, `parent_id IS NULL`) currently has 6 child sections, each with 3 child goals. The user_id is `85438938-309b-4e8a-b74a-af17ac1949cb`.
- The app renders the tree recursively: top-level items are categories, their children are sections, and their children are goals. All visible to the public; editing requires authentication (triggered by typing "neo" or visiting `/conquer/login`).

### Instructions

1. **Inspect first.** Query the existing knowledge items before adding anything. Understand what is already there.
2. **Do not duplicate.** Avoid adding goals that overlap with existing ones. If an existing goal covers a concept, expand it with more specificity or add a genuinely different angle.
3. **Preserve existing goals** unless the user explicitly asks you to replace them.
4. **Add ambitious, specific, non-redundant, measurable intellectual goals.** Each should describe a concrete outcome: a completed analysis, a demonstrable explanation, a researched investigation, a built mental model, or other observable evidence of understanding.
5. **Do not create a course syllabus.** Avoid "learn X", "study Y", "understand Z" without a concrete deliverable. Prefer "explain X well enough to Y", "analyse Z and produce W", "investigate X and document findings".
6. **Use the existing tree structure.** Add new sections as children of the knowledge category, and goals as children of those sections. Set `completed = false`, `status = 'active'`, and assign appropriate `sort_order` values.
7. **Maintain the impossible list philosophy.** These are lifetime goals, not tasks. They should feel ambitious and slightly intimidating, not like a homework assignment.
8. **Commit and push** the SQL migration file to `supabase/migrations/` in the repo.

### Database access

Use the Supabase CLI (`npx supabase db query --linked --project-ref kbmimkfdhblyrdskdcxc`) to run SQL directly against the production database. The CLI is already authenticated in the development environment.

### Example seed pattern

```sql
do $$
declare
    v_user_id uuid := '85438938-309b-4e8a-b74a-af17ac1949cb';
    v_knowledge_id uuid; -- fetch from DB first
    v_section_id uuid;
begin
    -- Find knowledge category
    select id into v_knowledge_id from public.impossible_items
    where user_id = v_user_id and parent_id is null and title = 'knowledge';

    -- Insert a new section
    insert into public.impossible_items (user_id, parent_id, title, completed, status, sort_order)
    values (v_user_id, v_knowledge_id, 'new section title', false, 'active', 6)
    returning id into v_section_id;

    -- Insert children
    insert into public.impossible_items (user_id, parent_id, title, completed, status, sort_order)
    values (v_user_id, v_section_id, 'concrete goal title', false, 'active', 0);
end $$;
```

---

*Last updated: August 2026*
