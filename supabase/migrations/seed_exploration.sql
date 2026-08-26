do $$
declare
    v_user_id uuid := '85438938-309b-4e8a-b74a-af17ac1949cb';
    v_explore_id uuid := '319f5a7d-7f02-4373-9207-2ee1051e4b2e';
    v_section_id uuid;
    s record;
    ch record;
begin
    delete from public.impossible_items where parent_id = v_explore_id;

    create temp table _sections (idx int, title text);
    create temp table _children (section_idx int, idx int, title text);

    insert into _sections values
        (0, 'india'),
        (1, 'great cities'),
        (2, 'history & civilisation'),
        (3, 'nature & wilderness'),
        (4, 'experiences');

    insert into _children values
        (0, 0, 'spend at least 7 days independently exploring a region of india outside tamil nadu'),
        (0, 1, 'complete a journey through the himalayas'),
        (0, 2, 'explore india''s northeast beyond a single tourist destination'),
        (0, 3, 'experience the cultural and geographical contrast between at least 10 indian states'),
        (0, 4, 'visit a place in india that feels completely unlike the part of india i grew up in'),
        (1, 0, 'spend at least 7 days properly exploring bengaluru'),
        (1, 1, 'spend at least 7 days properly exploring mumbai'),
        (1, 2, 'spend at least 7 days properly exploring delhi'),
        (1, 3, 'live in or deeply explore at least 10 globally significant cities'),
        (1, 4, 'spend at least 30 days living in a foreign city rather than visiting it as a tourist'),
        (1, 5, 'independently navigate and experience tokyo, new york city, london, and singapore'),
        (2, 0, 'stand at the pyramids of giza'),
        (2, 1, 'visit rome and explore the physical remains of the roman empire'),
        (2, 2, 'visit athens and see the places that shaped classical greek civilisation'),
        (2, 3, 'visit a historically significant place in china'),
        (2, 4, 'walk through a place whose history i have spent significant time studying before visiting'),
        (3, 0, 'see the himalayas'),
        (3, 1, 'see the northern lights'),
        (3, 2, 'visit a major desert'),
        (3, 3, 'visit a rainforest'),
        (3, 4, 'see an active volcanic landscape'),
        (3, 5, 'visit a national park or wilderness where there is no meaningful urban environment nearby'),
        (3, 6, 'experience a natural landscape so extreme that photographs did not prepare me for it'),
        (4, 0, 'attend a major sporting event with an electric live atmosphere'),
        (4, 1, 'attend a major music, cultural, or public festival outside india'),
        (4, 2, 'watch a sunrise from a place that required significant effort to reach'),
        (4, 3, 'take one completely unplanned trip with only a starting point and a return deadline'),
        (4, 4, 'spend one month deliberately saying yes to unfamiliar experiences'),
        (4, 5, 'have at least one travel story that begins with "this was probably a bad idea"');

    for s in select idx, title from _sections order by idx loop
        insert into public.impossible_items (user_id, parent_id, title, completed, status, sort_order)
        values (v_user_id, v_explore_id, s.title, false, 'active', s.idx)
        returning id into v_section_id;

        for ch in select ch2.idx, ch2.title from _children ch2 where ch2.section_idx = s.idx order by ch2.idx loop
            insert into public.impossible_items (user_id, parent_id, title, completed, status, sort_order)
            values (v_user_id, v_section_id, ch.title, false, 'active', ch.idx);
        end loop;
    end loop;

    drop table _sections;
    drop table _children;

    raise notice 'Seeded exploration with 5 sections.';
end $$;
