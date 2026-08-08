# Job Radar Implementation Plan - Borrowing from Best Open Source Projects

## Research Summary: Top Repos to Mimic

### 🎯 Job Aggregation Systems
1. **job-hunter-web** (BharathLakkoju) - Personal job intelligence dashboard
   - 4-hour automatic scraping cycle
   - Smart deduplication across platforms
   - Match scoring engine (0-100%)
   - Telegram alerts for high-match jobs
   - Tech: Next.js 16, React 19, Tailwind CSS, Supabase, Drizzle ORM

2. **joblens** (narendra-12-08) - Multi-source job search
   - 5 sources: Indeed, RemoteOK, Remotive, Arbeitnow, HN
   - Salary filter, visa sponsorship filter
   - Auto-extracted tech stack tags
   - Mobile-first design
   - Tech: Next.js 16, Turbopack, Tailwind CSS

3. **job-radar** (mazenemam19) - Multi-tenant SaaS
   - ATS company scraping (hundreds of companies)
   - Per-user skill filtering and AI scoring
   - Pipeline funnel view
   - Kanban-style application tracker
   - Tech: Next.js, Supabase, Gemini AI, Nodemailer

4. **jobseek** (colophon-group) - Company career page monitoring
   - 4,400+ company career pages
   - Typesense search with faceted filtering
   - Direct from employer (no reposts)
   - Self-hosted with MIT license
   - Tech: Next.js, Playwright, Python, Drizzle ORM

### 📊 Skills Analysis & Market Trends
1. **roleprint** (HamzaLatif02) - NLP job market analytics
   - 4-stage NLP pipeline (spaCy, NLTK VADER, BERTopic)
   - Skill demand trends across 10 tech roles
   - Skill gap analysis
   - 6-hour automatic scraping cycle
   - Tech: Python, spaCy, FastAPI, PostgreSQL, Redis

2. **job-intelligence-agent** - AI displacement scoring
   - 8 job sources with taxonomy-first NLP
   - AI displacement risk scoring
   - 4-quadrant skill matrix (future-proof/leverage/endangered/commoditized)
   - Resume-to-market comparison
   - Tech: Python, spaCy, LLM integration

3. **JobPulse-AI** (Omkar-narsale) - ML-powered analytics
   - K-Means clustering for salary/experience tiers
   - Isolation Forest anomaly detection
   - AI job matcher with TF-IDF cosine similarity
   - Skill gap analysis engine
   - Tech: Python, scikit-learn, React, Glassmorphic UI

### 📧 Cold Email & Application Automation
1. **job-autopilot** (Schlaflied) - AI-powered application system
   - GPT-4o integration
   - LinkedIn auto-connect with rate limiting
   - AI-generated personalized cold emails
   - Gmail integration with draft creation
   - Kanban board for pipeline tracking
   - Tech: Python, GPT-4o, Chrome DevTools, Streamlit

2. **JobHunter** (arinbalyan) - 100+ job board automation
   - Scrappy integration (141 job boards)
   - AI scoring (1-10) via free LLM providers
   - Company research with talking points
   - SMTP sending with rate limiting
   - Email tracking (open/click pixels)
   - Tech: Rust, Go, Python, free LLM providers

3. **ApplyX** (KIET7UKE) - Chrome extension + dashboard
   - 1-click personalized outreach
   - Llama 3.1 & Groq integration
   - Resume matching with job posts
   - Gmail API integration
   - Tech: TypeScript, Chrome Extension, Next.js, Supabase

4. **ai-job-agent** (AkbarDevop) - Comprehensive automation
   - LinkedIn Easy Apply automation
   - ATS automation (Greenhouse, Lever, Jobvite, Ashby)
   - Cold email skills with msmtp
   - JD scoring with 7-block rubric
   - Tailored PDF rendering
   - Tech: Node.js, Python, Claude Code integration

## 🏗️ Architecture Design (Borrowing Best Patterns)

### Tech Stack Selection
```yaml
Framework: Next.js 16 (App Router + Turbopack)
Language: TypeScript
Styling: Tailwind CSS 4 + shadcn/ui
Database: Supabase (PostgreSQL)
ORM: Drizzle ORM
AI: Free tier (Groq/Llama) + fallback to paid if needed
Scraping: Crawl4AI (primary) + Firecrawl (backup) + jobspy-js (specialized)
Search: Typesense (for faceted search)
Cache: Redis (Vercel KV)
Queue: Vercel Cron Jobs + Upstash QStash
Testing: Vitest + Playwright + React Testing Library
Email: Nodemailer + Resend (free tier)
Monitoring: Vercel Analytics + Sentry (free tier)
```

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  Dashboard | Analytics | Skills | Applications | Settings    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──────────────────────────────────────┐
                     │                                      │
┌────────────────────▼─────────────────┐  ┌─────────────────▼──────────────────┐
│         API Routes (Next.js)          │  │      Background Jobs (Cron)        │
│  /api/jobs | /api/skills | /api/trends │  │  Scraping | Scoring | Emailing    │
└────────────────────┬─────────────────┘  └─────────────────┬──────────────────┘
                     │                                      │
                     ├──────────────────────────────────────┤
                     │                                      │
┌────────────────────▼──────────────────────────────────────▼─────────────────┐
│                         Service Layer                                            │
│  JobScraper | SkillAnalyzer | TrendEngine | ScoringEngine | EmailService     │
└────────────────────┬──────────────────────────────────────┬─────────────────┘
                     │                                      │
                     ├──────────────────────────────────────┤
                     │                                      │
┌────────────────────▼─────────────────┐  ┌─────────────────▼──────────────────┐
│         Data Layer (Supabase)         │  │    External Services               │
│  Jobs | Skills | Trends | Applications │  │  Crawl4AI | Firecrawl | Groq AI   │
└───────────────────────────────────────┘  └────────────────────────────────────┘
```

## 🎨 UI/UX Design Patterns (Borrowing from job-hunter-web & joblens)

### Dashboard Layout
```typescript
// Borrowed from job-hunter-web's Notion-style dashboard
interface DashboardLayout {
  sidebar: Navigation[]
  mainContent: {
    hotJobs: JobCard[]
    skillsGap: SkillAnalysis[]
    marketTrends: TrendChart[]
    applications: KanbanBoard
  }
  commandPalette: CmdK
  notifications: Toast
}
```

### Design System
```css
/* Borrowed from joblens's Fluid Glass aesthetic */
:root {
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --accent-primary: #3b82f6;
  --accent-secondary: #8b5cf6;
}
.fluid-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
}
```

## 🧪 Testing Framework (Based on Vitest + Playwright Best Practices)

### Test Structure
```typescript
// vitest.config.ts - Borrowed from Next.js testing best practices
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'vitest.setup.ts']
    }
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './') }
  }
})
```

### Test Categories
```typescript
// 1. Unit Tests (Vitest)
describe('JobScoringEngine', () => {
  it('calculates match score correctly', () => {
    const score = calculateMatchScore(jobProfile, userSkills)
    expect(score).toBeBetween(0, 100)
  })
})

// 2. Component Tests (React Testing Library)
describe('JobCard', () => {
  it('renders job details correctly', () => {
    render(<JobCard job={mockJob} />)
    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
  })
})

// 3. API Route Tests (Vitest)
describe('/api/jobs', () => {
  it('returns jobs with correct filters', async () => {
    const response = await GET(request)
    const data = await response.json()
    expect(data.jobs).toHaveLength(20)
  })
})

// 4. E2E Tests (Playwright)
test('complete job application flow', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('[data-testid="job-card"]')
  await page.click('[data-testid="apply-button"]')
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
})
```

## 🚀 Feature Implementation Plan

### Phase 1: Core Infrastructure (Week 1-2)
1. **Setup Next.js 16 project** with TypeScript, Tailwind CSS, shadcn/ui
2. **Configure Supabase** with Drizzle ORM
3. **Setup Vitest + Playwright** testing framework
4. **Implement authentication** (Supabase Auth)
5. **Create base dashboard layout** (borrow from job-hunter-web)

### Phase 2: Job Scraping & Aggregation (Week 3-4)
1. **Integrate Crawl4AI** for generic scraping
2. **Add Firecrawl** as backup (1K free credits)
3. **Implement jobspy-js** for major platforms
4. **Create deduplication system** (borrow from job-hunter-web)
5. **Build job storage pipeline** with Supabase

### Phase 3: Hot Jobs Detection (Week 5)
```typescript
// Borrowed from roleprint's trend detection
interface HotJobsDetector {
  detectTrendingJobs(jobs: Job[]): HotJob[]
  calculateVelocity(job: Job): number
  identifyEmergingSkills(jobs: Job[]): Skill[]
}

// Algorithm: Jobs with high posting velocity + emerging skills
const hotJobs = jobs.filter(job => {
  const velocity = calculatePostingVelocity(job)
  const skillNovelty = calculateSkillNovelty(job.skills)
  return velocity > threshold && skillNovelty > threshold
})
```

### Phase 4: Skills Gap Analysis (Week 6)
```typescript
// Borrowed from job-intelligence-agent's skill analysis
interface SkillsGapAnalyzer {
  analyzeUserSkills(userSkills: Skill[]): SkillGapReport
  compareWithMarket(userSkills: Skill[], marketSkills: Skill[]): Gap[]
  recommendLearning(gaps: Gap[]): LearningPath[]
}

// AI-powered analysis using free Groq API
const skillAnalysis = await analyzeSkills({
  userSkills: extractedSkills,
  marketData: aggregatedJobData,
  aiProvider: 'groq' // Free tier
})
```

### Phase 5: Market Trends Analysis (Week 7)
```typescript
// Borrowed from JobPulse-AI's ML approach
interface MarketTrendsEngine {
  trackSkillDemand(skills: Skill[]): TrendData[]
  detectAnomalies(jobs: Job[]): Anomaly[]
  clusterJobs(jobs: Job[]): Cluster[]
  forecastTrends(historicalData: TrendData[]): Forecast[]
}

// Using Isolation Forest for anomaly detection
const anomalies = detectAnomalies(jobs)
const clusters = kMeansCluster(jobs, { features: ['salary', 'experience'] })
```

### Phase 6: Easy Application System (Week 8-9)
```typescript
// Borrowed from ApplyX and job-autopilot
interface EasyApplicationSystem {
  detectEasyApplyJobs(jobs: Job[]): EasyApplyJob[]
  autoApply(job: EasyApplyJob): Promise<ApplicationResult>
  trackApplication(job: Job, status: ApplicationStatus): void
}

// Integration with multiple ATS platforms
const atsIntegrations = {
  greenhouse: new GreenhouseIntegration(),
  lever: new LeverIntegration(),
  workday: new WorkdayIntegration(),
  ashby: new AshbyIntegration()
}
```

### Phase 7: Cold Email & Mass Application (Week 10-11)
```typescript
// Borrowed from JobHunter and job-autopilot
interface ColdEmailSystem {
  generatePersonalizedEmail(job: Job, userProfile: Profile): Email
  sendEmail(email: Email): Promise<SendResult>
  trackEmail(email: Email): TrackingData
  followUp(email: Email): FollowUpEmail
}

// AI-powered personalization using free Groq
const personalizedEmail = await generateEmail({
  job: jobData,
  userProfile: userData,
  tone: 'professional',
  aiProvider: 'groq'
})
```

### Phase 8: Auto-Update Mechanism (Week 12)
```typescript
// Borrowed from job-hunter-web's 4-hour cycle
interface AutoUpdateSystem {
  scheduleScraping(interval: number): void
  incrementalUpdate(): Promise<UpdateResult>
  notifyUsers(newJobs: Job[]): void
}

// Using Vercel Cron Jobs
export const config = {
  cron: '0 */4 * * *' // Every 4 hours
}

export default async function handler(req, res) {
  const newJobs = await scrapeJobs()
  await analyzeAndStore(newJobs)
  await notifyHighMatchJobs(newJobs)
  return res.status(200).json({ updated: newJobs.length })
}
```

### Phase 9: Performance Optimization (Week 13)
```typescript
// Borrowed from joblens's parallel fetching
interface PerformanceOptimizer {
  parallelScraping(sources: Source[]): Promise<Job[]>
  cacheResults(key: string, data: any): void
  optimizeDatabaseQueries(): void
  implementCDN(): void
}

// Parallel scraping with error handling
const jobs = await Promise.allSettled(
  sources.map(source => scrapeSource(source))
)
```

## 📁 Project Structure (Borrowing from job-radar and JoBoom)

```
website/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Main dashboard
│   │   ├── hot-jobs/page.tsx     # Hot jobs view
│   │   ├── skills/page.tsx       # Skills analysis
│   │   ├── trends/page.tsx       # Market trends
│   │   └── applications/page.tsx # Application tracker
│   ├── api/
│   │   ├── jobs/
│   │   │   ├── route.ts          # Job aggregation
│   │   │   └── scrape/route.ts   # Scraping endpoint
│   │   ├── skills/
│   │   │   ├── analyze/route.ts  # Skills analysis
│   │   │   └── gap/route.ts      # Skills gap
│   │   ├── trends/
│   │   │   └── route.ts          # Market trends
│   │   └── applications/
│   │       ├── apply/route.ts    # Easy apply
│   │       └── email/route.ts     # Cold email
│   └── layout.tsx
├── components/
│   ├── dashboard/
│   ├── ui/ (shadcn/ui)
│   └── charts/
├── lib/
│   ├── scrapers/
│   │   ├── crawl4ai.ts
│   │   ├── firecrawl.ts
│   │   └── jobspy.ts
│   ├── analyzers/
│   │   ├── skills.ts
│   │   ├── trends.ts
│   │   └── scoring.ts
│   ├── services/
│   │   ├── email.ts
│   │   ├── notification.ts
│   │   └── cache.ts
│   └── db/
│       ├── schema.ts
│       └── queries.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
└── package.json
```

## 🎯 Key Features Implementation Details

### 1. Hot Jobs Detection
```typescript
// Algorithm combining velocity, novelty, and demand
function detectHotJobs(jobs: Job[]): HotJob[] {
  const jobVelocity = calculatePostingVelocity(jobs)
  const skillNovelty = identifyEmergingSkills(jobs)
  const demandScore = calculateMarketDemand(jobs)

  return jobs.map(job => ({
    ...job,
    hotScore: (
      jobVelocity.get(job.id) * 0.4 +
      skillNovelty.get(job.id) * 0.3 +
      demandScore.get(job.id) * 0.3
    )
  })).filter(job => job.hotScore > 70)
    .sort((a, b) => b.hotScore - a.hotScore)
}
```

### 2. Skills Gap Analysis
```typescript
// AI-powered analysis with learning recommendations
async function analyzeSkillsGap(userSkills: Skill[]): Promise<SkillsGapReport> {
  const marketSkills = await getMarketSkillDemand()
  const gaps = userSkills.filter(skill => {
    const marketDemand = marketSkills.get(skill.name)
    return marketDemand && marketDemand > 0.7 && !userSkills.has(skill.name)
  })

  const learningPaths = await generateLearningPaths(gaps)

  return {
    gaps,
    learningPaths,
    priorityGaps: gaps.sort((a, b) => b.marketDemand - a.marketDemand).slice(0, 5)
  }
}
```

### 3. Market Trends
```typescript
// Real-time trend tracking with historical data
function trackMarketTrends(jobs: Job[]): TrendData[] {
  const skillTrends = trackSkillFrequency(jobs)
  const salaryTrends = trackSalaryChanges(jobs)
  const roleTrends = trackRoleDemand(jobs)

  return {
    skills: skillTrends,
    salaries: salaryTrends,
    roles: roleTrends,
    predictions: forecastTrends(skillTrends)
  }
}
```

### 4. Easy Application
```typescript
// Multi-ATS integration with smart form filling
async function easyApply(job: Job): Promise<ApplicationResult> {
  const atsType = detectATS(job.applyUrl)
  const integration = atsIntegrations[atsType]

  return await integration.apply({
    jobUrl: job.applyUrl,
    resume: await generateTailoredResume(job),
    coverLetter: await generateCoverLetter(job),
    userProfile: await getUserProfile()
  })
}
```

### 5. Cold Email Automation
```typescript
// Personalized email generation with tracking
async function sendColdEmail(job: Job, recruiter: Recruiter): Promise<EmailResult> {
  const email = await generatePersonalizedEmail({
    job,
    recruiter,
    userProfile: await getUserProfile(),
    tone: 'professional yet conversational'
  })

  const trackingId = generateTrackingId()
  const trackedEmail = addTrackingPixel(email, trackingId)

  const result = await emailService.send(trackedEmail)

  await trackEmail({
    trackingId,
    jobId: job.id,
    recruiterId: recruiter.id,
    status: 'sent'
  })

  return result
}
```

## 🔄 Auto-Update Mechanism

### Cron Job Configuration
```typescript
// vercel.json
{
  "crons": [{
    "path": "/api/jobs/scrape",
    "schedule": "0 */4 * * *"
  }, {
    "path": "/api/skills/analyze",
    "schedule": "0 0 * * 0"
  }, {
    "path": "/api/trends/update",
    "schedule": "0 0 * * *"
  }]
}
```

### Incremental Updates
```typescript
async function incrementalUpdate(): Promise<UpdateResult> {
  const lastScrapeTime = await getLastScrapeTime()
  const newJobs = await scrapeJobsSince(lastScrapeTime)

  const processedJobs = await Promise.all([
    deduplicateJobs(newJobs),
    scoreJobs(newJobs),
    extractSkills(newJobs)
  ])

  await storeJobs(processedJobs)
  await updateTrends(processedJobs)

  const highMatchJobs = processedJobs.filter(job => job.matchScore > 80)
  await notifyUsers(highMatchJobs)

  return {
    newJobs: processedJobs.length,
    highMatchJobs: highMatchJobs.length,
    timestamp: new Date()
  }
}
```

## ⚡ Performance Optimization

### 1. Parallel Scraping
```typescript
const jobs = await Promise.allSettled([
  scrapeLinkedIn(),
  scrapeIndeed(),
  scrapeGlassdoor(),
  scrapeCompanyPages()
])
```

### 2. Caching Strategy
```typescript
// Redis caching with 4-hour TTL
async function getCachedJobs(cacheKey: string): Promise<Job[] | null> {
  const cached = await redis.get(cacheKey)
  return cached ? JSON.parse(cached) : null
}

async function setCachedJobs(cacheKey: string, jobs: Job[]): Promise<void> {
  await redis.setex(cacheKey, 14400, JSON.stringify(jobs)) // 4 hours
}
```

### 3. Database Optimization
```typescript
// Using Supabase indexes and materialized views
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);
CREATE INDEX idx_jobs_skills ON jobs USING GIN(skills);
CREATE MATERIALIZED VIEW job_trends AS
SELECT
  skill,
  COUNT(*) as demand,
  AVG(salary) as avg_salary
FROM jobs
GROUP BY skill;
```

## 📊 Testing Strategy

### Test Coverage Goals
- Unit Tests: 80% coverage for business logic
- Integration Tests: Critical API routes
- E2E Tests: Main user flows
- Performance Tests: API response times < 2s

### Continuous Testing
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
```

## 🚀 Deployment Strategy

### Vercel Deployment
```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "GROQ_API_KEY": "@groq-api-key"
  }
}
```

### Monitoring
```typescript
// Vercel Analytics + Sentry
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
})
```

## 📈 Success Metrics

### Performance Metrics
- Scraping latency: < 30 seconds per source
- API response time: < 2 seconds (p95)
- Dashboard load time: < 1 second
- Cache hit rate: > 80%

### User Engagement Metrics
- Daily active users
- Jobs viewed per session
- Applications submitted
- Skills analysis viewed
- Email open/click rates

### Business Impact Metrics
- Time to apply reduction
- Application response rate
- Interview conversion rate
- Skill acquisition tracking

This implementation plan borrows the best patterns from top open-source projects while being tailored to your specific requirements for hot jobs detection, skills analysis, market trends, and automated application systems.