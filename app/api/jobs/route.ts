import { NextRequest, NextResponse } from 'next/server'
import { jobScraper } from '@/lib/scrapers/jobspy'
import { hotJobsDetector } from '@/lib/analyzers/hotJobs'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const searchTerm = searchParams.get('search') || 'software engineer'
  const location = searchParams.get('location') || 'remote'
  const limit = parseInt(searchParams.get('limit') || '20')
  const page = parseInt(searchParams.get('page') || '1')
  const hotJobsOnly = searchParams.get('hot') === 'true'

  try {
    // Scrape jobs from multiple sources
    const jobs = await jobScraper.scrapeAllSources({
      searchTerm,
      location,
      resultsWanted: limit * 2, // Get more to filter
      hoursOld: 72, // Last 3 days
    })

    let processedJobs = jobs

    // If hot jobs requested, apply hot jobs detection
    if (hotJobsOnly) {
      const hotJobs = await hotJobsDetector.detectHotJobs(jobs)
      processedJobs = hotJobs
    } else {
      // Apply pagination
      const startIndex = (page - 1) * limit
      processedJobs = jobs.slice(startIndex, startIndex + limit)
    }

    return NextResponse.json({
      jobs: processedJobs,
      meta: {
        total: jobs.length,
        page,
        limit,
        filters: { searchTerm, location, hotJobsOnly }
      }
    })
  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}