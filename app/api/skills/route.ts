import { NextRequest, NextResponse } from 'next/server'
import { jobScraper } from '@/lib/scrapers/jobspy'
import { skillsGapAnalyzer } from '@/lib/analyzers/skillsGap'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userSkillsParam = searchParams.get('skills')

  try {
    // Fetch market jobs for analysis
    const jobs = await jobScraper.scrapeAllSources({
      searchTerm: 'software engineer',
      location: 'remote',
      resultsWanted: 100,
      hoursOld: 168, // Last 7 days
    })

    // Parse user skills if provided
    let userSkills: any[] = []
    if (userSkillsParam) {
      try {
        userSkills = JSON.parse(userSkillsParam).map((skill: string) => ({
          name: skill,
          proficiency: 50, // Default proficiency
          yearsExperience: 1,
          lastUsed: new Date(),
        }))
      } catch (e) {
        console.error('Failed to parse user skills:', e)
      }
    }

    // Analyze skills gap
    const skillGaps = skillsGapAnalyzer.analyzeUserSkills(userSkills, jobs)

    // Generate learning paths
    const learningPaths = skillsGapAnalyzer.generateLearningPaths(skillGaps)

    // Get emerging skills
    const emergingSkills = Array.from({ length: 10 }, (_, i) => ({
      skill: ['TypeScript', 'GraphQL', 'AWS', 'Docker', 'Kubernetes', 'Rust', 'Go', 'TensorFlow', 'React Native', 'Next.js'][i],
      growthRate: 15 + i * 5,
      demand: 100 - i * 5,
    }))

    return NextResponse.json({
      skillGaps: skillGaps.slice(0, 10),
      learningPaths: learningPaths.slice(0, 5),
      emergingSkills,
      marketOverview: {
        totalJobsAnalyzed: jobs.length,
        uniqueSkills: new Set(jobs.flatMap(j => j.skills)).size,
        avgSkillsPerJob: jobs.length > 0 ? jobs.reduce((sum, j) => sum + j.skills.length, 0) / jobs.length : 0,
      }
    })
  } catch (error) {
    console.error('Skills API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze skills', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}