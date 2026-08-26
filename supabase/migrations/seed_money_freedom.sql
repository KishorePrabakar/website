do $$
declare
    v_user_id uuid := '85438938-309b-4e8a-b74a-af17ac1949cb';
    v_category_id uuid := '8bf9c1ab-3990-418a-815f-0b853382e566';
    v_section_id uuid;
    s record;
    ch record;
begin
    delete from public.impossible_items where parent_id = v_category_id;

    create temp table _sections (idx int, title text);
    create temp table _children (section_idx int, idx int, title text);

    insert into _sections values
        (0, 'early independence'),
        (1, 'earning & net worth'),
        (2, 'ownership & independent income'),
        (3, 'material milestones'),
        (4, 'freedom & optionality'),
        (5, 'bigger game');

    insert into _children values
        (0, 0, 'earn ₹1,00,000 cumulatively outside salary'),
        (0, 1, 'build an investment portfolio worth ₹1,00,000'),
        (0, 2, 'accumulate 3 months of personal living expenses in liquid savings'),
        (0, 3, 'buy a ₹50,000+ item entirely with money i earned and saved'),
        (0, 4, 'fund a ₹50,000+ trip entirely without debt'),
        (1, 0, 'earn ₹10 lakh in total cumulative income'),
        (1, 1, 'earn ₹10 lakh in a single year'),
        (1, 2, 'earn ₹20 lakh in a single year'),
        (1, 3, 'reach a net worth of ₹10 lakh'),
        (1, 4, 'reach a net worth of ₹25 lakh'),
        (1, 5, 'reach a net worth of ₹50 lakh'),
        (1, 6, 'reach a net worth of ₹1 crore'),
        (2, 0, 'earn the first ₹1 from something i own'),
        (2, 1, 'earn ₹1,00,000 cumulatively from products, business, equity, investments, or other non-salary ownership'),
        (2, 2, 'earn ₹10,000 per month for 6 consecutive months from something i own'),
        (2, 3, 'earn ₹50,000 per month for 6 consecutive months from something i own'),
        (2, 4, 'generate ₹5 lakh in cumulative revenue from a product or business i created'),
        (2, 5, 'own equity or assets worth ₹10 lakh that i did not acquire purely through salary savings'),
        (3, 0, 'build a desk and computer setup worth ₹1 lakh+'),
        (3, 1, 'buy a flagship-level phone entirely without debt'),
        (3, 2, 'build a wardrobe where at least 20 pieces were deliberately selected and professionally fitted or tailored'),
        (3, 3, 'buy a vehicle i genuinely want using a down payment of at least 50% of its purchase price'),
        (3, 4, 'take my family on a trip costing ₹2 lakh+'),
        (3, 5, 'buy a vehicle worth ₹10 lakh+ without financing more than 30% of its value'),
        (3, 6, 'live independently in an apartment chosen primarily for lifestyle and location rather than minimum affordability'),
        (3, 7, 'create a dedicated home workspace worth ₹2 lakh+'),
        (4, 0, 'maintain 6 months of living expenses in liquid or near-liquid assets'),
        (4, 1, 'maintain 12 months of living expenses outside retirement assets'),
        (4, 2, 'have non-salary income cover 25% of annual living expenses for 12 consecutive months'),
        (4, 3, 'have non-salary income cover 50% of annual living expenses for 12 consecutive months'),
        (4, 4, 'take a 3-month break from employment while covering all living expenses without debt'),
        (4, 5, 'take a 6-month break from employment, travel, or build something without needing employment income'),
        (4, 6, 'reach the point where investment and ownership income covers 100% of basic annual living expenses for 12 consecutive months'),
        (5, 0, 'build a business or product that generates ₹10 lakh in cumulative revenue'),
        (5, 1, 'build a business or product that generates ₹25 lakh in cumulative revenue'),
        (5, 2, 'own equity worth ₹50 lakh+'),
        (5, 3, 'create at least 3 paid jobs through something i build or own'),
        (5, 4, 'invest ₹1 lakh+ of my own money into another person''s company, project, or venture'),
        (5, 5, 'fund a ₹1 lakh+ opportunity, education, project, or experience for another person'),
        (5, 6, 'give away ₹5 lakh cumulatively to people or causes i deliberately choose');

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

    raise notice 'Seeded money & freedom with 6 sections.';
end $$;
