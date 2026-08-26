do $$
declare
    v_user_id uuid := '85438938-309b-4e8a-b74a-af17ac1949cb';
    v_category_id uuid := '7fb0513b-262c-44f5-8f53-597f6aa92205';
    v_section_id uuid;
    s record;
    ch record;
begin
    delete from public.impossible_items where parent_id = v_category_id;

    create temp table _sections (idx int, title text);
    create temp table _children (section_idx int, idx int, title text);

    insert into _sections values
        (0, 'public work'),
        (1, 'reputation'),
        (2, 'communication'),
        (3, 'network'),
        (4, 'leverage');

    insert into _children values
        (0, 0, 'publish 25 pieces of useful public content about technology, projects, ideas, or things i have learned'),
        (0, 1, 'publish 100 pieces of public work across any combination of writing, video, posts, or technical content'),
        (0, 2, 'have one piece of work reach 10,000 people organically'),
        (0, 3, 'have 10 separate pieces of work each reach at least 1,000 people'),
        (1, 0, 'have 100 people voluntarily follow my work on at least one platform'),
        (1, 1, 'have 1,000 people voluntarily follow my work on at least one platform'),
        (1, 2, 'have a respected person or organisation publicly recognise, share, or recommend something i created'),
        (1, 3, 'be invited to contribute to, speak at, or participate in an event because of work i had previously done'),
        (2, 0, 'give a presentation or talk to 25+ people'),
        (2, 1, 'give a presentation, workshop, or technical talk to 100+ people'),
        (2, 2, 'publish 10 explanations of difficult ideas that receive meaningful positive feedback from people who did not know me personally'),
        (3, 0, 'build genuine professional relationships with 10 people i would independently consider highly capable'),
        (3, 1, 'collaborate on a meaningful project with 5 people i did not previously know'),
        (3, 2, 'have at least 3 people i can contact for genuinely useful advice in different professional domains'),
        (3, 3, 'help 10 people with opportunities, introductions, knowledge, or practical support without expecting anything in return'),
        (4, 0, 'build a community, project, publication, or platform that attracts 100 active participants or contributors'),
        (4, 1, 'create something that leads to an opportunity i would not have received through a normal job application'),
        (4, 2, 'receive an inbound collaboration, job, speaking, or business opportunity because someone discovered my public work'),
        (4, 3, 'build a reputation strong enough that at least one meaningful opportunity per year comes to me without me actively applying for it');

    for s in select idx, title from _sections order by idx loop
        insert into public.impossible_items (user_id, parent_id, title, completed, status, sort_order)
        values (v_user_id, v_category_id, s.title, false, 'active', s.idx)
        returning id into v_section_id;

        for ch in select ch2.idx, ch2.title from _children ch2 where ch2.section_idx = s.idx order by ch2.idx loop
            insert into public.impossible_items (user_id, parent_id, title, completed, status, sort_order)
            values (v_user_id, v_section_id, ch.title, false, 'active', ch.idx);
        end loop;
    end loop;

    drop table _sections;
    drop table _children;

    raise notice 'Seeded power & influence with 5 sections.';
end $$;
