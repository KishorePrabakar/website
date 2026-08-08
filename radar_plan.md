# /radar Endpoint Implementation Plan

## Overview
Complete job search portal that automatically fetches, ranks, and serves job openings optimized for freshers/entry-level candidates with focus on easy apply and low competition opportunities.

## Key Advantage: Real Platform Coverage
This solution uses **jobspy-js** to scrape the actual major job platforms that people use:
- **LinkedIn** (where most professional jobs are posted)
- **Indeed** (largest job board globally)
- **Glassdoor** (company reviews + jobs)
- **Google Jobs** (aggregated search)
- **ZipRecruiter** (fast-growing platform)

**vs. the previous approach:**
- Old: Used niche APIs (Workbeam, Himalayas, Nomado24) that few people actually use
- New: Scrapes the platforms where 90%+ of real job opportunities exist
- Old: Required multiple API integrations with different schemas
- New: Single library with unified interface
- Old: Limited to whatever data the APIs chose to expose
- New: Full access to all public job data on each platform

**vs. Paid API Aggregators (LoopCV, JSearch, etc.):**
- Paid: $50-200/month for similar coverage, rate limits, API keys
- This: $0, open source, no rate limits (except platform-specific)
- Paid: You're dependent on their service uptime
- This: Full control, can modify as needed
- Paid: They may block your account for "excessive usage"
- This: Your own scraping, your own rules

**vs. Previous jobspy-js Only Approach:**
- Previous: Limited to 9 pre-defined platforms
- New: Can scrape ANY job site (company pages, niche boards, etc.)
- Previous: Manual extraction rules
- New: AI-powered extraction that adapts to site changes
- Previous: Might miss jobs on custom career pages
- New: Comprehensive coverage - no job left behind
- Previous: Requires maintenance when sites change
- New: AI adapts automatically to layout changes

## AI-Powered Intelligence

### Smart Extraction
- **Crawl4AI**: Learns site patterns, adapts to layout changes automatically
- **Firecrawl**: Semantic understanding of page structure
- **Natural Language Processing**: Extracts relevant data even from unstructured pages

### Intelligent Ranking
- **Semantic Matching**: Uses AI to match job descriptions with your profile
- **Skill Extraction**: Automatically identifies required vs preferred skills
- **Salary Normalization**: AI converts different salary formats to comparable data
- **Company Analysis**: AI assesses company size, industry, growth signals

### Adaptive Behavior
- **Self-Healing**: If a site changes layout, AI adapts without code changes
- **Pattern Recognition**: Learns which job sources yield the best results for you
- **Quality Scoring**: AI evaluates job posting quality and likelihood of being real

## Why This is "Smart" Scraping

### Traditional Scraping vs AI Scraping

**Traditional Scraping (brittle):**
```javascript
// Breaks when site changes
const title = document.querySelector('.job-title').textContent;
const salary = document.querySelector('.salary-range').textContent;
```

**AI Scraping (resilient):**
```javascript
// Adapts to any layout
const jobData = await crawl4ai.extract({
  url: "https://example.com/jobs/123",
  instruction: "Extract job title, salary range, company, and requirements"
});
// AI finds the data regardless of HTML structure
```

### Real-World Benefits

**Scenario 1: Company Career Page Redesign**
- Traditional: Scraping breaks, requires manual fix
- AI: Automatically adapts to new layout, no code changes needed

**Scenario 2: Niche Job Board with Unique Structure**
- Traditional: Requires custom scraper for each site
- AI: One tool handles any site structure automatically

**Scenario 3: Salary in Unexpected Format**
- Traditional: Regex fails on "80k-120k", "$80-120k", "80,000-120,000"
- AI: Understands all formats, normalizes automatically

**Scenario 4: Job Description in Table vs Paragraphs**
- Traditional: Different selectors needed
- AI: Extracts content regardless of HTML structure

## Core Requirements
- **Target Level**: Fresher/Entry-level (configurable for future)
- **Ranking Priority**: Package and role relevance
- **Competition Focus**: Easy apply + less populated jobs
- **Approach**: High-level methods using existing APIs

## Phase 1: API Selection & Integration

### Smart AI-Based Web Scraping (Free & Future-Proof)

**Recommended Approach: Hybrid System**

**Option 1: Crawl4AI (Primary - 100% Free)**
- **Installation**: `pip install crawl4ai` or Docker deployment
- **Coverage**: ANY website - truly generic web scraper
- **AI-Powered**: LLM-ready output, smart Markdown extraction, adaptive intelligence
- **Completely Free**: Open source (Apache 2.0), 76k+ GitHub stars, no API keys
- **Features**:
  - LLM-ready output with headings, tables, code
  - Fast async browser pool with caching
  - Adaptive intelligence - learns site patterns
  - Deploy anywhere (Docker, local, cloud)
  - CSS/XPath extraction + LLM-based extraction
  - Zero API keys required
- **Perfect for**: Custom career pages, niche job boards, company sites

**Option 2: Firecrawl Keyless (Secondary - 1,000 Free Credits/Month)**
- **Installation**: npm package or direct API calls
- **Coverage**: Any URL, 96% of the web including JS-heavy pages
- **No API Key Required**: 1,000 free credits/month automatically
- **AI-Powered**: Semantic scraping, clean Markdown/JSON output
- **Features**:
  - Search + Scrape + Interact capabilities
  - Handles JavaScript rendering
  - Agent-oriented endpoints
  - MCP server support
  - Self-hosting option available
- **Perfect for**: Quick implementation, complex sites, fallback

**Option 3: jobspy-js (Tertiary - Specialized Job Scraping)**
- **Coverage**: LinkedIn, Indeed, Glassdoor, Google Jobs, etc. (9 major platforms)
- **Installation**: `npm install jobspy-js`
- **No API Keys Required**: Uses scraping techniques
- **Features**:
  - Specialized for job boards
  - Experience level filtering
  - Salary extraction
  - Automatic deduplication
- **Perfect for**: Major job boards when Crawl4AI/Firecrawl aren't needed

**Hybrid Strategy:**
1. **Use Crawl4AI** for: Company career pages, niche job boards, custom sites
2. **Use Firecrawl** for: Complex sites, when Crawl4AI needs backup, under 1K pages/month
3. **Use jobspy-js** for: Major platforms (LinkedIn/Indeed) when specialized features needed
4. **Fallback to free APIs** (Workbeam, Himalayas) for: Additional coverage

**Why This Hybrid Approach:**
- ✅ **Truly generic**: Can scrape ANY job site, not just pre-defined platforms
- ✅ **AI-powered**: Smart extraction, adapts to site changes automatically
- ✅ **Zero cost**: Crawl4AI is 100% free, Firecrawl gives 1K free credits/month
- ✅ **Future-proof**: If new job sites emerge, just add URLs to scrape
- ✅ **Comprehensive**: Won't miss jobs on niche boards, company pages, etc.
- ✅ **Resilient**: Multiple fallback options if one method fails

### Salary Data (AI-Powered Extraction)
- **Crawl4AI/Firecrawl**: Both include intelligent salary extraction from descriptions
- **LLM-based parsing**: Use free AI APIs (Groq) for salary normalization if needed
- **Optional external APIs** (if better benchmarks needed):
  - Jobicy Salary API (free tier)
  - SalaryFYI API (free)
  - Can be added later if needed

## Phase 2: Ranking Algorithm Design

### Competition Scoring (Lower = Better)
1. **Freshness Score** (0-100)
   - Posted within 24 hours: 0 points (best)
   - Posted 1-3 days ago: 25 points
   - Posted 4-7 days ago: 50 points
   - Posted 8-14 days ago: 75 points
   - Posted 15+ days ago: 100 points (worst)

2. **Easy Apply Bonus** (0-50 points reduction)
   - LinkedIn Easy Apply detected: -50 points
   - Indeed "Easy Apply" or similar: -30 points
   - Standard application: 0 points
   - Note: jobspy-js provides apply method information

3. **Application Volume Estimation** (0-100 points)
   - If platform provides applicant count (LinkedIn): direct score
   - If not available: estimate based on:
     - Company size (larger = more applicants)
     - Job board popularity (LinkedIn > Indeed > Glassdoor)
     - Time since posting (older = more applicants)
     - Geographic specificity (more specific = less competition)

### Package/Role Scoring (Higher = Better)
1. **Salary Score** (0-100)
   - jobspy-js automatically extracts salary from descriptions
   - Normalize salary range to 0-100 scale
   - Use optional salary APIs for market benchmarks if needed
   - Bonus for above-market compensation
   - Handle different currencies and periods (hourly vs yearly)

2. **Role Relevance Score** (0-100)
   - Match against fresher-friendly tech stack
   - Keywords: "junior", "entry level", "fresher", "graduate", "trainee"
   - Required skills match with common fresher skills (JavaScript, Python, etc.)
   - Use jobspy-js experience level filtering where available

### Final Ranking Formula
```
final_score = (salary_score * 0.4) + (role_relevance * 0.3) - (competition_score * 0.3)
```

## Phase 3: Implementation Architecture

### API Endpoint Structure
```
GET /api/radar
Query Parameters:
- level: string (default: "fresher", options: "fresher", "mid", "senior")
- category: string (default: "software-engineering")
- remote: boolean (default: true)
- limit: number (default: 20, max: 50)
- location: string (optional, for location-specific jobs)
```

### Response Format
```json
{
  "jobs": [
    {
      "id": "unique_id",
      "title": "Junior Backend Developer",
      "company": "Company Name",
      "location": "Remote / City",
      "salary": {
        "min": 50000,
        "max": 70000,
        "currency": "USD",
        "period": "yearly"
      },
      "easy_apply": true,
      "posted_date": "2026-08-07",
      "description": "Job description excerpt...",
      "apply_url": "https://...",
      "scores": {
        "final_score": 85,
        "salary_score": 90,
        "role_relevance": 80,
        "competition_score": 20
      },
      "source": "workbeam"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "filters_applied": {
      "level": "fresher",
      "category": "software-engineering",
      "remote": true
    }
  }
}
```

### Backend Implementation
1. **File Structure**
   - `api/radar.js` - Main endpoint handler
   - `lib/scrapers/crawl4ai.js` - Crawl4AI integration
   - `lib/scrapers/firecrawl.js` - Firecrawl integration
   - `lib/scrapers/jobspy.js` - jobspy-js integration
   - `lib/job-scorer.js` - AI-powered ranking algorithm
   - `lib/cache-manager.js` - Caching layer
   - `lib/ai-parser.js` - AI-based data extraction
   - `radar-config.json` - Configuration file

2. **Dependencies to Add**
   - `crawl4ai` (Python) or Docker container
   - `@firecrawl/firecrawl` (npm) for Firecrawl
   - `jobspy-js` (npm) for specialized job scraping
   - Optional: Free AI API (Groq) for enhanced parsing
   - No paid services required

## Phase 4: Configuration & Future Modifiability

### Configuration File
Create `radar-config.json`:
```json
{
  "default_level": "fresher",
  "default_category": "software-engineering",
  "default_remote": true,
  "scraping_method": "hybrid",
  "sources": {
    "crawl4ai": {
      "enabled": true,
      "priority": 1,
      "type": "generic",
      "urls": [
        "https://jobs.lever.co/example",
        "https://boards.greenhouse.io/example",
        "custom_company_career_pages"
      ]
    },
    "firecrawl": {
      "enabled": true,
      "priority": 2,
      "type": "generic",
      "monthly_credits": 1000
    },
    "jobspy_js": {
      "enabled": true,
      "priority": 3,
      "type": "specialized",
      "platforms": ["linkedin", "indeed", "glassdoor"]
    }
  },
  "ranking_weights": {
    "salary": 0.4,
    "role_relevance": 0.3,
    "competition": 0.3
  },
  "fresher_keywords": ["junior", "entry level", "fresher", "graduate", "trainee", "intern"],
  "fresher_skills": ["javascript", "python", "java", "react", "node.js", "html", "css"],
  "job_types": ["fulltime", "internship"],
  "max_results_per_source": 50,
  "hours_old": 72,
  "ai_config": {
    "salary_extraction": true,
    "description_parsing": true,
    "smart_matching": true
  }
}
```

### Future Extension Points
1. **Proxy Integration**
   - Add rotating proxy support for heavy scraping
   - Environment variables: `PROXY_LIST`, `PROXY_AUTH`
   - Helps avoid platform rate limiting

2. **Level Configuration**
   - Add mid-level and senior-level keyword sets
   - Adjust salary expectations by level
   - Modify role relevance scoring by level

3. **Additional Data Sources**
   - Add more jobspy-js supported platforms (Bayt, Naukri, etc.)
   - Company career pages (custom scrapers)
   - Industry-specific job boards

4. **AI Enhancement** (Optional)
   - Use free AI APIs (Groq) for better job matching
   - Semantic analysis of job descriptions
   - Automated cover letter generation

## Phase 5: Caching & Performance

### Caching Strategy
1. **Cache Duration**: 4 hours (job data changes slowly)
2. **Cache Key**: Based on query parameters
3. **Cache Storage**: 
   - Vercel Edge Config (if available)
   - Or simple in-memory cache with file backup

### Rate Limiting
1. **Per IP**: 60 requests per minute
2. **Per API Source**: Respect individual API limits
3. **Fallback**: If rate limited, return cached data

## Phase 6: Testing & Validation

### Test Cases
1. **Basic Functionality**
   - Fetch jobs for fresher level
   - Verify ranking algorithm
   - Test filtering parameters

2. **Edge Cases**
   - No jobs found
   - API rate limiting
   - Invalid parameters
   - Missing salary data

3. **Performance**
   - Response time < 2 seconds
   - Cache hit rate > 80%
   - Concurrent request handling

## Required API Keys (Phase 1 - None Required)
For initial implementation, **zero API keys are needed**. jobspy-js uses scraping techniques and requires no authentication.

**Optional Future Enhancements** (not required):
- Proxy services (if rate limiting becomes an issue)
- Premium job APIs (for additional data sources)
- Salary benchmarking APIs (for more accurate compensation data)

## Implementation Order
1. Install Crawl4AI (Docker or pip) for generic scraping
2. Setup basic `/api/radar` endpoint
3. Implement Crawl4AI integration for custom career pages
4. Add Firecrawl as backup for complex sites (1K free credits)
5. Implement jobspy-js for major platforms (LinkedIn/Indeed/Glassdoor)
6. Add AI-powered salary extraction and description parsing
7. Implement smart ranking algorithm with AI-based matching
8. Implement caching layer (critical for scraping performance)
9. Create flexible configuration system for multiple sources
10. Add error handling and graceful fallbacks
11. Testing across different site types
12. Documentation and usage examples

## Technical Considerations
- **Vercel Serverless Functions**: 10-second execution limit - scraping needs careful architecture
  - Option A: Use Vercel cron jobs for background scraping, serve cached data via API
  - Option B: Deploy Crawl4AI as separate service (Railway, Render, etc.)
  - Option C: Use Firecrawl for simpler integration (no browser management)
- **AI Integration**: Consider using free Groq API for intelligent parsing and matching
- **Rate Limiting**: Respectful scraping with delays, monitor for blocks
- **Caching Strategy**: Critical - cache scraped data for 4-6 hours to avoid repeated requests
- **Proxy Support**: May need residential proxies for LinkedIn (Crawl4AI supports this)
- **Error Handling**: Multi-level fallbacks (Crawl4AI → Firecrawl → jobspy-js → APIs)
- **Performance**: Balance between real-time freshness and response time
- **Legal Compliance**: Respect robots.txt, terms of service, and rate limits
- **Resource Management**: Browser automation requires memory, may need dedicated hosting

## Deployment Architecture Options

### Option 1: Pure Vercel (Simplest)
- Use Firecrawl Keyless (1K free credits/month)
- Use jobspy-js for major platforms
- Background scraping via Vercel cron jobs
- Best for: Starting out, lower volume

### Option 2: Hybrid Vercel + External Service (Recommended)
- Deploy Crawl4AI on Railway/Render (free tiers available)
- Vercel serves cached data and triggers scraping
- Best for: Full AI scraping capability, higher volume

### Option 3: Self-Hosted (Most Control)
- Run Crawl4AI locally or on your own server
- Complete control, no external dependencies
- Best for: Maximum control, privacy, no platform limits