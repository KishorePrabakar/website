do $$
declare
    v_user_id uuid := '85438938-309b-4e8a-b74a-af17ac1949cb';
    v_knowledge_id uuid := '3db04e63-079e-42ed-ad42-44478e2b7db5';
    v_section_id uuid;
    s record;
    ch record;
begin
    delete from public.impossible_items where parent_id = v_knowledge_id;

    create temp table _sections (idx int, title text);
    create temp table _children (section_idx int, idx int, title text);

    insert into _sections values
        (0, 'politics & geopolitics'),
        (1, 'economics & business'),
        (2, 'science & technology'),
        (3, 'medicine & the human body'),
        (4, 'psychology & people'),
        (5, 'history & civilisation');

    insert into _children values
        (0, 0, 'understand how the government of india actually functions beyond headlines and election slogans'),
        (0, 1, 'explain the major interests, strengths, and conflicts involving india, china, the united states, russia, and the european union'),
        (0, 2, 'follow one major geopolitical event from beginning to resolution and document how my understanding changed'),
        (1, 0, 'understand inflation, interest rates, unemployment, government spending, taxation, and economic growth well enough to explain how they affect ordinary people'),
        (1, 1, 'understand how a company actually makes money by deeply analysing the business model of 10 successful companies'),
        (1, 2, 'explain one major economic crisis, including what caused it and what happened afterwards'),
        (2, 0, 'understand the basic scientific method well enough to distinguish evidence, correlation, causation, and bad scientific claims'),
        (2, 1, 'deeply investigate one major technology that changed civilisation and explain how it actually works'),
        (2, 2, 'read and understand at least 10 significant scientific or technical papers, articles, or reports beyond their headlines'),
        (3, 0, 'understand the major systems of the human body and how they interact'),
        (3, 1, 'understand the basic mechanisms behind common topics such as sleep, exercise, nutrition, infection, and medication'),
        (3, 2, 'learn enough to recognise obvious medical misinformation without pretending to be a doctor'),
        (4, 0, 'understand the major cognitive biases that repeatedly affect human judgement'),
        (4, 1, 'identify at least 10 recurring patterns in human behaviour through observation, reading, or personal experience'),
        (4, 2, 'understand the basics of persuasion, incentives, status, attachment, and group behaviour well enough to recognise them in real life'),
        (5, 0, 'build a coherent mental timeline of major human civilisations and historical eras'),
        (5, 1, 'deeply study one civilisation from rise to decline'),
        (5, 2, 'understand how at least 5 major historical events continue to shape the modern world');

    for s in select idx, title from _sections order by idx loop
        insert into public.impossible_items (user_id, parent_id, title, completed, status, sort_order)
        values (v_user_id, v_knowledge_id, s.title, false, 'active', s.idx)
        returning id into v_section_id;

        for ch in select ch2.idx, ch2.title from _children ch2 where ch2.section_idx = s.idx order by ch2.idx loop
            insert into public.impossible_items (user_id, parent_id, title, completed, status, sort_order)
            values (v_user_id, v_section_id, ch.title, false, 'active', ch.idx);
        end loop;
    end loop;

    drop table _sections;
    drop table _children;

    raise notice 'Seeded knowledge with 6 sections.';
end $$;
