-- Seed physical capability and engineering & building categories
-- Runs via Supabase CLI with admin access (bypasses RLS)

do $$
declare
    v_user_id uuid := '85438938-309b-4e8a-b74a-af17ac1949cb';
    v_eng_id uuid := '42f0daa6-c421-428c-9fa2-38992d7cca64';
    v_phys_id uuid := 'd54032bf-7e02-435e-b6be-945b284d10d0';
    v_section_id uuid;
    s record;
    ch record;
begin
    -- ═══════════════════════════════════════════════════════════════════
    -- ENGINEERING & BUILDING
    -- ═══════════════════════════════════════════════════════════════════
    delete from public.impossible_items where parent_id = v_eng_id;

    create temp table _eng_sections (idx int, title text);
    create temp table _eng_children (section_idx int, idx int, title text);

    insert into _eng_sections values
        (0, 'competitive programming'),
        (1, 'hackathons'),
        (2, 'products & internet experiments'),
        (3, 'engineering depth'),
        (4, 'technical range'),
        (5, 'open source'),
        (6, 'ridiculous projects'),
        (7, 'career & reputation');

    insert into _eng_children values
        (0, 0, 'reach a codeforces rating of 1800+'),
        (0, 1, 'solve 500 problems rated 1400+'),
        (0, 2, 'solve 100 problems rated 1800+'),
        (0, 3, 'solve 25 problems rated 2200+'),
        (0, 4, 'participate in 50 rated programming contests'),
        (0, 5, 'achieve a top 10% finish in at least 10 rated contests'),
        (0, 6, 'solve one 2500+ rated problem without reading the editorial'),
        (1, 0, 'participate in 15 hackathons'),
        (1, 1, 'win or place in the top 3 at least 3 times'),
        (1, 2, 'build and submit a working project in a 24-hour hackathon without pulling an existing project from a template'),
        (1, 3, 'win a prize or recognition from a major company, university, or internationally recognised hackathon'),
        (1, 4, 'participate in a hackathon with a team of people i did not previously know'),
        (1, 5, 'ship a hackathon project that still has active users 6 months later'),
        (2, 0, 'launch 25 things publicly: apps, websites, tools, bots, experiments, or open-source utilities'),
        (2, 1, 'get 1,000 real people to use something i built'),
        (2, 2, 'get 10,000 real people to use something i built'),
        (2, 3, 'build one product used by people in at least 10 countries'),
        (2, 4, 'build something that earns its first ₹1 online without freelancing or employment'),
        (2, 5, 'build something that earns ₹10,000 per month for 3 consecutive months'),
        (2, 6, 'launch a product from idea to public release in under 48 hours'),
        (2, 7, 'have a stranger discover, use, and voluntarily recommend something i built'),
        (3, 0, 'design, build, deploy, and maintain a production system with 99.9% measured availability over 30 consecutive days'),
        (3, 1, 'build a system that handles 1,000 requests per second in a controlled benchmark'),
        (3, 2, 'build and document a distributed system with at least 3 independently running services communicating over a network'),
        (3, 3, 'find and fix a real performance bottleneck that produces at least a 10x improvement'),
        (3, 4, 'debug a production failure from logs, metrics, traces, and source code without prior knowledge of the root cause'),
        (3, 5, 'build something where i genuinely understand the major tradeoffs instead of blindly following a tutorial'),
        (4, 0, 'independently build and deploy a complete product with frontend, backend, database, authentication, infrastructure, monitoring, and CI/CD'),
        (4, 1, 'take one unfamiliar technology and build a useful working project with it in 7 days'),
        (4, 2, 'reproduce one interesting technical system from a research paper, engineering blog, or conference talk'),
        (4, 3, 'explain 25 difficult technical concepts publicly well enough that other engineers use the explanation'),
        (4, 4, 'build one serious project primarily using a systems programming language'),
        (4, 5, 'build one serious AI-powered application beyond a simple API wrapper'),
        (5, 0, 'make 50 accepted contributions to open-source projects'),
        (5, 1, 'have 10 pull requests accepted into projects i did not create'),
        (5, 2, 'contribute a meaningful feature or fix to a project with 10,000+ github stars'),
        (5, 3, 'maintain an open-source project that receives 100+ github stars'),
        (5, 4, 'have at least one stranger submit a pull request to something i created'),
        (5, 5, 'have my code run in a project or product used by people i have never met'),
        (6, 0, 'build a technically unnecessary project purely because it sounds absurdly cool'),
        (6, 1, 'recreate a simplified version of a major technology product from first principles'),
        (6, 2, 'build a project that requires learning at least 3 completely unfamiliar technical domains'),
        (6, 3, 'build something that makes another engineer ask "how the hell did you make this?"'),
        (6, 4, 'spend 100+ hours on one personal technical project without it being required for college or work'),
        (7, 0, 'receive a full-time engineering offer after my internship'),
        (7, 1, 'become the person teammates voluntarily ask for help on difficult technical problems'),
        (7, 2, 'receive public recognition for technical work from a respected engineer, company, or technical community'),
        (7, 3, 'give a technical talk, workshop, or presentation to 100+ people'),
        (7, 4, 'have a technical portfolio where every major project can be opened, used, or inspected');

    for s in select idx, title from _eng_sections order by idx loop
        insert into public.impossible_items (user_id, parent_id, title, completed, status, sort_order)
        values (v_user_id, v_eng_id, s.title, false, 'active', s.idx)
        returning id into v_section_id;

        for ch in select ch2.idx, ch2.title from _eng_children ch2 where ch2.section_idx = s.idx order by ch2.idx loop
            insert into public.impossible_items (user_id, parent_id, title, completed, status, sort_order)
            values (v_user_id, v_section_id, ch.title, false, 'active', ch.idx);
        end loop;
    end loop;

    drop table _eng_sections;
    drop table _eng_children;

    -- ═══════════════════════════════════════════════════════════════════
    -- PHYSICAL CAPABILITY
    -- ═══════════════════════════════════════════════════════════════════
    delete from public.impossible_items where parent_id = v_phys_id;

    create temp table _phys_sections (idx int, title text);
    create temp table _phys_children (section_idx int, idx int, title text);

    insert into _phys_sections values
        (0, 'strength & physique'),
        (1, 'calisthenics'),
        (2, 'running'),
        (3, 'cycling'),
        (4, 'swimming & water'),
        (5, 'hyrox & functional endurance'),
        (6, 'mma & combat'),
        (7, 'trekking & mountains'),
        (8, 'outdoor & adventure feats'),
        (9, 'triathlon & ironman');

    insert into _phys_children values
        -- strength & physique
        (0, 0, 'maintain a healthy body composition while visibly carrying above-average muscle mass'),
        (0, 1, 'achieve 10 strict pull-ups'),
        (0, 2, 'achieve 25 strict pull-ups'),
        (0, 3, 'achieve a weighted pull-up with 50% of bodyweight added'),
        (0, 4, 'squat 1.5x bodyweight'),
        (0, 5, 'squat 2x bodyweight'),
        (0, 6, 'deadlift 2x bodyweight'),
        (0, 7, 'bench press 1x bodyweight'),
        (0, 8, 'bench press 1.5x bodyweight'),
        (0, 9, 'achieve all four: 2x bodyweight deadlift, 2x bodyweight squat, 1.5x bodyweight bench press, and 50% bodyweight weighted pull-up'),
        -- calisthenics
        (1, 0, 'perform 10 strict pull-ups'),
        (1, 1, 'perform 20 consecutive strict dips'),
        (1, 2, 'hold a clean wall-supported handstand for 60 seconds'),
        (1, 3, 'perform 10 strict pistol squats on each leg'),
        (1, 4, 'perform a clean bar muscle-up'),
        (1, 5, 'perform 5 consecutive strict bar muscle-ups'),
        (1, 6, 'hold a freestanding handstand for 30 seconds'),
        (1, 7, 'perform a controlled handstand push-up'),
        (1, 8, 'achieve a clean front lever'),
        (1, 9, 'achieve a clean back lever'),
        (1, 10, 'achieve a controlled human flag'),
        -- running
        (2, 0, 'run 5 km without stopping'),
        (2, 1, 'run 5 km in under 25 minutes'),
        (2, 2, 'run 10 km in under 50 minutes'),
        (2, 3, 'complete a half marathon'),
        (2, 4, 'run a half marathon in under 2 hours'),
        (2, 5, 'complete a full marathon'),
        (2, 6, 'run a full marathon in under 4 hours'),
        (2, 7, 'complete an ultramarathon of at least 50 km'),
        -- cycling
        (3, 0, 'cycle 50 km in one ride'),
        (3, 1, 'cycle 100 km in one ride'),
        (3, 2, 'cycle 100 km in under 5 hours of moving time'),
        (3, 3, 'cycle 200 km in one day'),
        (3, 4, 'complete a multi-day cycling trip between two cities'),
        (3, 5, 'complete a self-supported cycling expedition lasting at least 5 days'),
        -- swimming & water
        (4, 0, 'swim 500 m continuously'),
        (4, 1, 'swim 1 km continuously'),
        (4, 2, 'swim 2 km continuously'),
        (4, 3, 'complete a 5 km open-water swim'),
        (4, 4, 'complete an officially organised open-water swimming event'),
        (4, 5, 'learn scuba diving and earn an internationally recognised entry-level certification'),
        (4, 6, 'complete a memorable open-water or scuba experience in a major natural location'),
        -- hyrox & functional endurance
        (5, 0, 'complete a hyrox event'),
        (5, 1, 'complete hyrox in under 90 minutes'),
        (5, 2, 'complete hyrox in under 75 minutes'),
        (5, 3, 'compete in at least 3 hyrox events'),
        (5, 4, 'finish in the top 25% of a hyrox event in my age category'),
        (5, 5, 'complete a difficult obstacle or endurance event outside a standard race format'),
        -- mma & combat
        (6, 0, 'train consistently in a combat sport for 6 consecutive months'),
        (6, 1, 'complete at least 100 coached training sessions'),
        (6, 2, 'participate in controlled sparring or competition'),
        (6, 3, 'compete in at least one officially organised amateur event, where appropriate and safely permitted'),
        (6, 4, 'train consistently for 3 consecutive years across mma or one or more combat disciplines'),
        (6, 5, 'develop enough technical competence to confidently train with experienced practitioners'),
        -- trekking & mountains
        (7, 0, 'complete a full-day trek of at least 20 km'),
        (7, 1, 'hike 30 km in one day'),
        (7, 2, 'hike 50 km in one day'),
        (7, 3, 'complete a multi-day trek lasting at least 3 days'),
        (7, 4, 'complete a self-supported multi-day trek carrying all essential equipment'),
        (7, 5, 'trek to an altitude above 4,000 m'),
        (7, 6, 'summit a peak above 5,000 m'),
        (7, 7, 'complete a technically demanding mountain objective requiring structured physical preparation'),
        -- outdoor & adventure feats
        (8, 0, 'complete a 50 km journey entirely under my own power by running, cycling, hiking, or a combination'),
        (8, 1, 'complete a 100 km human-powered journey in a single day'),
        (8, 2, 'navigate a full-day outdoor route independently using maps/navigation tools'),
        (8, 3, 'complete a multi-day outdoor expedition without relying on a packaged tour'),
        (8, 4, 'complete an adventure where navigation, weather, endurance, and logistics are all my responsibility'),
        (8, 5, 'complete an expedition that requires at least 6 months of deliberate physical preparation'),
        (8, 6, 'complete one adventure that, at the time i add it to this list, feels genuinely intimidating'),
        -- triathlon & ironman
        (9, 0, 'complete a sprint triathlon'),
        (9, 1, 'complete an olympic-distance triathlon'),
        (9, 2, 'complete a half ironman / 70.3 triathlon'),
        (9, 3, 'complete a full ironman-distance triathlon'),
        (9, 4, 'complete an ironman-distance event that i once considered physically impossible');

    for s in select idx, title from _phys_sections order by idx loop
        insert into public.impossible_items (user_id, parent_id, title, completed, status, sort_order)
        values (v_user_id, v_phys_id, s.title, false, 'active', s.idx)
        returning id into v_section_id;

        for ch in select ch2.idx, ch2.title from _phys_children ch2 where ch2.section_idx = s.idx order by ch2.idx loop
            insert into public.impossible_items (user_id, parent_id, title, completed, status, sort_order)
            values (v_user_id, v_section_id, ch.title, false, 'active', ch.idx);
        end loop;
    end loop;

    drop table _phys_sections;
    drop table _phys_children;

    raise notice 'Seeded engineering & building (8 sections) and physical capability (10 sections).';
end $$;
