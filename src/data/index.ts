export const PROFILE = {
  name: 'Kishore Prabakar',
  title: 'backend & ai developer',
  tag: 'building scalable systems & ml apps',
  bio: "Hey, I'm Kishore — backend & AI developer from VSBEC-IT. Tech optimist. I build backend systems, play with AI/ML, and ship things that work. Currently into Backend Systems, DSA, Blockchain, and anything that scales or learns.",
  location: 'Karur, Tamil Nadu',
  timezone: 'IST · UTC+5:30',
  available: true,
  email: 'kishoreprabakar24@gmail.com',
  links: {
    github:     'https://github.com/KishorePrabakar',
    linkedin:   'https://www.linkedin.com/in/kishoreprabakar24',
    x:          'https://x.com/kraxonstar',
    leetcode:   'https://leetcode.com/u/KishorePrabakar/',
    resume:     'https://drive.google.com/file/d/1PbiStNiqqVVH7gHYKMWmHeXZQKbFeJ0B/view',
  },
  // non-hero links (used in section 06 cards only)
  extLinks: {
    wakatime:   'https://wakatime.com/@kraxonyanks',
    chess:      'https://www.chess.com/member/kraxonknight',
    spotify:    'https://open.spotify.com/user/xdfp9g0u7hzf8aw47583ehxhl',
    letterboxd: 'https://letterboxd.com/kraxondrafts/',
    x:          'https://x.com/kraxonstar',
  },
}

export const TYPEWRITER_PHRASES = [
  'backend & ai developer',
  'i build things that scale',
  'i break things to understand them',
  'currently shipping something new',
  'backend & ai developer',
]

export const SKILLS = [
  { category: 'Backend',    proficiency: 88, tags: ['Node.js','Express','REST APIs','GraphQL','WebSockets','JWT Auth','Rate Limiting','Job Queues'] },
  { category: 'Frontend',   proficiency: 70, tags: ['React','JavaScript','TypeScript','HTML / CSS'] },
  { category: 'Databases',  proficiency: 80, tags: ['PostgreSQL','MongoDB','SQLite','Redis','Raw SQL'] },
  { category: 'AI & Data',  proficiency: 72, tags: ['Groq API','LLM Integration','Embeddings','RAG','Pandas','NumPy','ML Basics'] },
  { category: 'Systems',    proficiency: 78, tags: ['Git','Linux','Docker','CLI Design','TCP / HTTP','Cron Jobs'] },
  { category: 'Blockchain', proficiency: 55, tags: ['SHA-256','Merkle Trees','Blockchain basics','ethers.js','Solidity'] },
]

export const CERTS = [
  { label: 'SQL — HackerRank',        url: 'https://www.hackerrank.com/certificates/sql' },
  { label: 'React — HackerRank',      url: 'https://www.hackerrank.com/certificates/react' },
  { label: 'Google Data Analytics',   url: 'https://github.com/KishorePrabakar' },
  { label: 'AWS Developer Associate', url: 'https://github.com/KishorePrabakar' },
]

export const PROJECTS = [
  { title:'Briefly',            slug:'briefly',         repo:'KishorePrabakar/briefly',         pinned:true,  tags:['AI/ML','React','Node.js','Groq API','MongoDB'],  desc:'Paste meeting notes → AI extracts summary, action items, and key decisions. Full auth, session history, and templated prompts.' },
  { title:'Sift',               slug:'sift',            repo:'KishorePrabakar/sift',            pinned:true,  tags:['Web Tools','Scraping','React','Express'],          desc:'Drop Amazon product links → instant side-by-side comparison. Price, rating, and features extracted automatically.' },
  { title:'Link Vault',         slug:'linkvault',       repo:'KishorePrabakar/linkvault',       pinned:true,  tags:['Backend','Express','SQLite','Cheerio','REST'],     desc:'Bookmarking API with auto-scraping, tag system, and full-text search. Organised link management built for developers.' },
  { title:'Auth Service',       slug:'authservice',     repo:'KishorePrabakar/authservice',     pinned:false, tags:['Backend','JWT','bcrypt','Security'],               desc:'Standalone JWT microservice — register, login, refresh, revoke. Stateless auth with bcrypt and production-ready security patterns.' },
  { title:'Rate Limiter',       slug:'ratelimiter',     repo:'KishorePrabakar/ratelimiter',     pinned:false, tags:['Systems','Algorithms','Middleware','Node.js'],     desc:'Token bucket algorithm from scratch — no libraries. Configurable Express middleware with per-route window and limit settings.' },
  { title:'SHA-256 Scratch',    slug:'sha256',          repo:'KishorePrabakar/sha256',          pinned:false, tags:['Crypto','Bitwise','Algorithms','BYO'],             desc:'Pure SHA-256 using only bitwise operations. No crypto libraries. Foundational for understanding blockchain hashing.' },
  { title:'Semantic Search',    slug:'semantic-search', repo:'KishorePrabakar/semantic-search', pinned:false, tags:['AI/ML','Embeddings','pgvector','RAG'],             desc:'Search documents by meaning using vector embeddings. pgvector backend handles chunking and nearest-neighbour retrieval.' },
  { title:'Commit Message Gen', slug:'commitgen',       repo:'KishorePrabakar/commitgen',       pinned:false, tags:['CLI','AI/ML','LLM','DevTools'],                    desc:'CLI tool — pipe git diff to an LLM, get a meaningful, structured commit message in seconds.' },
]

export const BLOGS = [
  { title:'No Sin to be feared of.',                slug:'sin',     href:'/blogs/sin.html',     tag:'philosophy', date:'18 Jul 2025', teaser:'the idea of "sin" probably started as a way to stop people from hurting each other.', wordCount:420 },
  { title:'Making money with Open Source software', slug:'oss',     href:'/blogs/oss.html',     tag:'business',   date:'11 Jul 2025', teaser:"At first I thought open source is all charity. Turns out it's a lot more interesting.",  wordCount:680 },
  { title:'Notes on Success — Part 1',              slug:'success', href:'/blogs/success.html', tag:'self',       date:'22 Jun 2025', teaser:'Not "set clear goals". Self-interpreting what actually moves the needle.',               wordCount:590 },
  { title:'First Blog',                             slug:'first',   href:'/blogs/first.html',   tag:'misc',       date:'19 Jun 2025', teaser:'Just a vibe.',                                                                          wordCount:80 },
]

export const BOOKS = [
  { title:'The Almanack of Naval Ravikant', author:'Eric Jorgenson',   status:'reading', take:'on wealth & happiness — Naval condensed.' },
  { title:'Zero to One',                   author:'Peter Thiel',       status:'read',    take:'Competition is for losers. Still processing.' },
  { title:'Atomic Habits',                 author:'James Clear',       status:'read',    take:'Systems > goals. 1% compounding is true.' },
  { title:'The Pragmatic Programmer',      author:'Andrew Hunt',       status:'read',    take:'DRY, broken windows, tracer bullets — stuck.' },
  { title:'Clean Code',                    author:'R.C. Martin',       status:'read',    take:'Changed how I name variables. Genuinely.' },
  { title:'Sapiens',                       author:'Yuval Noah Harari', status:'read',    take:'Made me question everything "natural".' },
]

export const WAKATIME_HASH = 'cd2f1903-a58f-4026-9514-6d8affbf5ba5'
export const WAKATIME_USER = 'kraxonyanks'
export const GITHUB_USER   = 'KishorePrabakar'
export const LEETCODE_USER = 'KishorePrabakar'
export const CHESS_USER    = 'kraxonknight'
export const SPOTIFY_UID   = 'xdfp9g0u7hzf8aw47583ehxhl'
export const LB_USER       = 'kraxondrafts'
export const FORMSPREE_ID  = 'YOUR_FORM_ID'
