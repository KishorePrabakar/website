-- Seed engineering & building category with nested goal structure
-- Run this in Supabase SQL Editor (requires auth bypass for inserts)
-- Uses a CTE to find the user_id from existing data, or accepts a parameter

-- Find the user_id from the first existing user in the table
-- If the table is empty, you'll need to log in first to seed the base categories,
-- then re-run this script.

do $$
declare
    v_user_id uuid;
    v_eng_id uuid;
    v_section record;
    v_section_id uuid;
    v_child record;
begin
    -- Get the user_id from any existing item (or first auth user)
    select user_id into v_user_id from public.impossible_items limit 1;

    if v_user_id is null then
        raise notice 'Table is empty. Log in to /conquer first to seed base categories, then re-run this script.';
        return;
    end if;

    -- Find or create the engineering & building category
    select id into v_eng_id from public.impossible_items
    where user_id = v_user_id and parent_id is null and title = 'engineering & building';

    if v_eng_id is null then
        insert into public.impossible_items (user_id, parent_id, title, sort_order)
        values (v_user_id, null, 'engineering & building', 1)
        returning id into v_eng_id;
    end if;

    -- Remove existing placeholder children
    delete from public.impossible_items where parent_id = v_eng_id;

    -- Create sections and children using temp tables
    create temp table _sections (idx int, title text);
    create temp table _children (section_idx int, idx int, title text);

    insert into _sections values
        (0, 'competitive programming'),
        (1, 'hackathons'),
        (2, 'products & internet experiments'),
        (3, 'engineering depth'),
        (4, 'technical range'),
        (5, 'open source'),
        (6, 'ridiculous projects'),
        (7, 'career & reputation');

    insert into _children values
        -- competitive programming
        (0, 0, 'reach a codeforces rating of 1800+'),
        (0, 1, 'solve 500 problems rated 1400+'),
        (0, 2, 'solve 100 problems rated 1800+'),
        (0, 3, 'solve 25 problems rated 2200+'),
        (0, 4, 'participate in 50 rated programming contests'),
        (0, 5, 'achieve a top 10% finish in at least 10 rated contests'),
        (0, 6, 'solve one 2500+ rated problem without reading the editorial'),
        -- hackathons
        (1, 0, 'participate in 15 hackathons'),
        (1, 1, 'win or place in the top 3 at least 3 times'),
        (1, 2, 'build and submit a working project in a 24-hour hackathon without pulling an existing project from a template'),
        (1, 3, 'win a prize or recognition from a major company, university, or internationally recognised hackathon'),
        (1, 4, 'participate in a hackathon with a team of people i did not previously know'),
        (1, 5, 'ship a hackathon project that still has active users 6 months later'),
        -- products & internet experiments
        (2, 0, 'launch 25 things publicly: apps, websites, tools, bots, experiments, or open-source utilities'),
        (2, 1, 'get 1,000 real people to use something i built'),
        (2, 2, 'get 10,000 real people to use something i built'),
        (2, 3, 'build one product used by people in at least 10 countries'),
        (2, 4, 'build something that earns its first ₹1 online without freelancing or employment'),
        (2, 5, 'build something that earns ₹10,000 per month for 3 consecutive months'),
        (2, 6, 'launch a product from idea to public release in under 48 hours'),
        (2, 7, 'have a stranger discover, use, and voluntarily recommend something i built'),
        -- engineering depth
        (3, 0, 'design, build, deploy, and maintain a production system with 99.9% measured availability over 30 consecutive days'),
        (3, 1, 'build a system that handles 1,000 requests per second in a controlled benchmark'),
        (3, 2, 'build and document a distributed system with at least 3 independently running services communicating over a network'),
        (3, 3, 'find and fix a real performance bottleneck that produces at least a 10x improvement'),
        (3, 4, 'debug a production failure from logs, metrics, traces, and source code without prior knowledge of the root cause'),
        (3, 5, 'build something where i genuinely understand the major tradeoffs instead of blindly following a tutorial'),
        -- technical range
        (4, 0, 'independently build and deploy a complete product with frontend, backend, database, authentication, infrastructure, monitoring, and CI/CD'),
        (4, 1, 'take one unfamiliar technology and build a useful working project with it in 7 days'),
        (4, 2, 'reproduce one interesting technical system from a research paper, engineering blog, or conference talk'),
        (4, 3, 'explain 25 difficult technical concepts publicly well enough that other engineers use the explanation'),
        (4, 4, 'build one serious project primarily using a systems programming language'),
        (4, 5, 'build one serious AI-powered application beyond a simple API wrapper'),
        -- open source
        (5, 0, 'make 50 accepted contributions to open-source projects'),
        (5, 1, 'have 10 pull requests accepted into projects i did not create'),
        (5, 2, 'contribute a meaningful feature or fix to a project with 10,000+ github stars'),
        (5, 3, 'maintain an open-source project that receives 100+ github stars'),
        (5, 4, 'have at least one stranger submit a pull request to something i created'),
        (5, 5, 'have my code run in a project or product used by people i have never met'),
        -- ridiculous projects
        (6, 0, 'build a technically unnecessary project purely because it sounds absurdly cool'),
        (6, 1, 'recreate a simplified version of a major technology product from first principles'),
        (6, 2, 'build a project that requires learning at least 3 completely unfamiliar technical domains'),
        (6, 3, 'build something that makes another engineer ask "how the hell did you make this?"'),
        (6, 4, 'spend 100+ hours on one personal technical project without it being required for college or work'),
        -- career & reputation
        (7, 0, 'receive a full-time engineering offer after my internship'),
        (7, 1, 'become the person teammates voluntarily ask for help on difficult technical problems'),
        (7, 2, 'receive public recognition for technical work from a respected engineer, company, or technical community'),
        (7, 3, 'give a technical talk, workshop, or presentation to 100+ people'),
        (7, 4, 'have a technical portfolio where every major project can be opened, used, or inspected');

    -- Insert sections
    for v_section in select idx, title from _sections order by idx loop
        insert into public.impossible_items (user_id, parent_id, title, completed, status, sort_order)
        values (v_user_id, v_eng_id, v.section.title, false, 'active', v_section.idx)
        returning id into v_section_id;

        -- Insert children for this section
        for v_child in select c.idx, c.title from _children c where c.section_idx = v_section.idx order by c.idx loop
            insert into public.impossible_items (user_id, parent_id, title, completed, status, sort_order)
            values (v_user_id, v_section_id, v_child.title, false, 'active', v_child.idx);
        end loop;
    end loop;

    drop table _sections;
    drop table _children;

    raise notice 'Seeded engineering & building with 8 sections and all children.';
end $$;
