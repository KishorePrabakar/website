-- 1. Reorder categories: mind=0, engineering=1, physical=2, exploration=3, knowledge=4, money=5, power=6, relationships=7
UPDATE public.impossible_items SET sort_order = 0 WHERE title = 'mind' AND parent_id IS NULL;
UPDATE public.impossible_items SET sort_order = 1 WHERE title = 'engineering & building' AND parent_id IS NULL;
UPDATE public.impossible_items SET sort_order = 2 WHERE title = 'physical capability' AND parent_id IS NULL;
UPDATE public.impossible_items SET sort_order = 3 WHERE title = 'exploration' AND parent_id IS NULL;
UPDATE public.impossible_items SET sort_order = 4 WHERE title = 'knowledge' AND parent_id IS NULL;
UPDATE public.impossible_items SET sort_order = 5 WHERE title = 'money & freedom' AND parent_id IS NULL;
UPDATE public.impossible_items SET sort_order = 6 WHERE title = 'power & influence' AND parent_id IS NULL;
UPDATE public.impossible_items SET sort_order = 7 WHERE title = 'relationships & social' AND parent_id IS NULL;

-- 2. Mark mind as private
UPDATE public.impossible_items SET is_private = true WHERE title = 'mind' AND parent_id IS NULL;

-- Mark all mind descendants as private (recursive)
DO $$
DECLARE
    v_mind_id uuid;
    changed int;
BEGIN
    SELECT id INTO v_mind_id FROM public.impossible_items WHERE title = 'mind' AND parent_id IS NULL;
    
    -- Mark existing children of mind
    UPDATE public.impossible_items SET is_private = true WHERE parent_id = v_mind_id AND is_private = false;
    
    -- Recursively mark deeper descendants
    LOOP
        UPDATE public.impossible_items child
        SET is_private = true
        FROM public.impossible_items parent
        WHERE child.parent_id = parent.id
          AND parent.is_private = true
          AND child.is_private = false;
        GET DIAGNOSTICS changed = ROW_COUNT;
        EXIT WHEN changed = 0;
    END LOOP;
END $$;

-- 3. Seed mind goals (all private)
DO $$
DECLARE
    v_user_id uuid := '85438938-309b-4e8a-b74a-af17ac1949cb';
    v_mind_id uuid;
    v_section_id uuid;
    s record;
    ch record;
BEGIN
    SELECT id INTO v_mind_id FROM public.impossible_items
    WHERE user_id = v_user_id AND parent_id IS NULL AND title = 'mind';

    -- Remove existing children
    DELETE FROM public.impossible_items WHERE parent_id = v_mind_id;

    CREATE TEMP TABLE _sections (idx int, title text);
    CREATE TEMP TABLE _children (section_idx int, idx int, title text);

    INSERT INTO _sections VALUES
        (0, 'attention & digital control'),
        (1, 'execution over planning'),
        (2, 'sustained focus'),
        (3, 'tolerance for boredom & discomfort'),
        (4, 'emotional strength'),
        (5, 'self-knowledge'),
        (6, 'curiosity & deliberate living');

    INSERT INTO _children VALUES
        (0, 0, 'complete 30 consecutive days with an average recreational screen time below 2 hours per day'),
        (0, 1, 'complete 100 days where i intentionally chose what to consume instead of opening social media by default'),
        (0, 2, 'spend 7 consecutive days without short-form video feeds'),
        (0, 3, 'complete a 30-day period without installing or using a social media application designed primarily for endless scrolling'),
        (0, 4, 'complete 100 focused work sessions of at least 90 minutes with my phone physically inaccessible'),
        (0, 5, 'go 30 consecutive days without opening an app purely because i was bored'),
        (1, 0, 'take 25 ideas that i was tempted to overplan and produce a visible first version within 24 hours of deciding to pursue them'),
        (1, 1, 'complete 50 meaningful tasks that i initially felt were "too small to matter"'),
        (1, 2, 'complete 10 projects where i deliberately started before feeling fully prepared'),
        (1, 3, 'maintain a single active priority for 30 consecutive days without replacing it because a more exciting plan appeared'),
        (1, 4, 'finish 25 things that i publicly or privately committed to before starting another major side project'),
        (1, 5, 'complete one personally important project after the initial excitement has completely disappeared'),
        (2, 0, 'complete 50 days containing at least 3 hours of deliberate, distraction-controlled work or study'),
        (2, 1, 'complete a 7-day personal deep-work sprint with at least 4 focused hours per day'),
        (2, 2, 'complete a 30-day period averaging at least 3 hours of focused work per day'),
        (2, 3, 'spend 100 total hours working deeply on one meaningful project'),
        (2, 4, 'complete a full day of planned work without needing an external deadline to force me into action'),
        (2, 5, 'complete a project requiring at least 200 hours of deliberate effort across multiple months'),
        (3, 0, 'complete 10 deliberately boring but useful tasks without escaping into my phone'),
        (3, 1, 'spend 24 hours alone without using social media, short-form content, or entertainment as a default escape'),
        (3, 2, 'complete 30 consecutive days of one deliberately uncomfortable action per day'),
        (3, 3, 'do one thing i have postponed for at least 6 months because of fear, uncertainty, or avoidance'),
        (3, 4, 'voluntarily enter 10 situations where rejection, embarrassment, or failure is genuinely possible'),
        (3, 5, 'complete something difficult enough that quitting feels reasonable at least once, and finish it anyway'),
        (4, 0, 'experience a meaningful rejection or failure and return to deliberate work within 7 days'),
        (4, 1, 'document 25 emotionally difficult situations and identify what actually happened versus the story i told myself about it'),
        (4, 2, 'go through one major period of uncertainty without compulsively seeking reassurance or forcing an immediate answer'),
        (4, 3, 'have one difficult conversation that i would previously have avoided and remain honest without becoming needlessly aggressive'),
        (4, 4, 'make at least 10 important decisions after accepting that certainty is impossible'),
        (4, 5, 'let go of one outcome i deeply wanted without allowing the loss to permanently derail the rest of my life'),
        (5, 0, 'maintain a personal journal for 100 separate days'),
        (5, 1, 'write a brutally honest personal review of one year of my life'),
        (5, 2, 'identify and document my 10 most recurring self-sabotaging patterns'),
        (5, 3, 'deliberately change at least 3 recurring patterns after identifying them'),
        (5, 4, 'write down my actual values and use them to make at least 10 difficult decisions'),
        (5, 5, 'write a personal document explaining what kind of life i am trying to build, then revisit and revise it after 1 year of actual living'),
        (6, 0, 'spend 100 hours pursuing something purely because i find it fascinating, without needing it to improve my career'),
        (6, 1, 'complete 12 months where each month contains at least one experience i had never done before'),
        (6, 2, 'deliberately change my mind about at least 10 beliefs after encountering better evidence or reasoning'),
        (6, 3, 'spend 7 consecutive days living without a major personal goal and observe what i naturally choose to do'),
        (6, 4, 'complete one year where, at the end, i can clearly point to at least 12 experiences, projects, relationships, or achievements that would not have happened if i had continued living on autopilot'),
        (6, 5, 'build a life where i can regularly say "i chose to do that" more often than "i just ended up doing that"');

    FOR s IN SELECT idx, title FROM _sections ORDER BY idx LOOP
        INSERT INTO public.impossible_items (user_id, parent_id, title, completed, status, sort_order, is_private)
        VALUES (v_user_id, v_mind_id, s.title, false, 'active', s.idx, true)
        RETURNING id INTO v_section_id;

        FOR ch IN SELECT ch2.idx, ch2.title FROM _children ch2 WHERE ch2.section_idx = s.idx ORDER BY ch2.idx LOOP
            INSERT INTO public.impossible_items (user_id, parent_id, title, completed, status, sort_order, is_private)
            VALUES (v_user_id, v_section_id, ch.title, false, 'active', ch.idx, true);
        END LOOP;
    END LOOP;

    DROP TABLE _sections;
    DROP TABLE _children;

    RAISE NOTICE 'Seeded mind (7 sections, private).';
END $$;
