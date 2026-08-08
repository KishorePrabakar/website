import { ScrapedJob } from '../scrapers/jobspy'

export interface HotJob extends ScrapedJob {
  hotScore: number
  velocityScore: number
  skillNoveltyScore: number
  demandScore: number
}

export class HotJobsDetector {
  private jobHistory: Map<string, ScrapedJob[]> = new Map()
  private skillFrequency: Map<string, { count: number; recent: number; timestamps: number[] }> = new Map()

  async detectHotJobs(jobs: ScrapedJob[]): Promise<HotJob[]> {
    // Update job history
    this.updateJobHistory(jobs)

    // Update skill frequency
    this.updateSkillFrequency(jobs)

    // Calculate scores for each job
    const scoredJobs = jobs.map(job => this.calculateHotScore(job))

    // Sort by hot score and return top jobs
    return scoredJobs
      .sort((a, b) => b.hotScore - a.hotScore)
      .filter(job => job.hotScore > 50) // Only return jobs with significant hot score
      .slice(0, 50) // Limit to top 50
  }

  private updateJobHistory(jobs: ScrapedJob[]): void {
    for (const job of jobs) {
      const key = `${job.title}-${job.company}`.toLowerCase()
      const history = this.jobHistory.get(key) || []
      history.push(job)
      // Keep only last 7 days of history
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const recentHistory = history.filter(j => j.postedDate.getTime() > sevenDaysAgo)
      this.jobHistory.set(key, recentHistory)
    }
  }

  private updateSkillFrequency(jobs: ScrapedJob[]): void {
    const now = Date.now()
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000

    for (const job of jobs) {
      for (const skill of job.skills) {
        const current = this.skillFrequency.get(skill) || { count: 0, recent: 0, timestamps: [] }
        const isRecent = job.postedDate.getTime() > sevenDaysAgo

        current.count++
        if (isRecent) {
          current.recent++
          current.timestamps.push(now)
        }

        // Keep only recent timestamps (last 7 days)
        current.timestamps = current.timestamps.filter(t => t > sevenDaysAgo)

        this.skillFrequency.set(skill, current)
      }
    }
  }

  private calculateHotScore(job: ScrapedJob): HotJob {
    const velocityScore = this.calculateVelocityScore(job)
    const skillNoveltyScore = this.calculateSkillNoveltyScore(job)
    const demandScore = this.calculateDemandScore(job)

    // Weighted formula: 40% velocity, 30% skill novelty, 30% demand
    const hotScore = Math.round(
      velocityScore * 0.4 +
      skillNoveltyScore * 0.3 +
      demandScore * 0.3
    )

    return {
      ...job,
      hotScore,
      velocityScore,
      skillNoveltyScore,
      demandScore,
    }
  }

  private calculateVelocityScore(job: ScrapedJob): number {
    const key = `${job.title}-${job.company}`.toLowerCase()
    const history = this.jobHistory.get(key) || []

    if (history.length < 2) return 50 // Default score for new jobs

    // Calculate posting velocity (jobs per day)
    const timeSpan = history[history.length - 1].postedDate.getTime() - history[0].postedDate.getTime()
    const days = Math.max(timeSpan / (1000 * 60 * 60 * 24), 1)
    const velocity = history.length / days

    // Normalize to 0-100 scale
    // High velocity (>3 jobs/day) = 100, Low velocity (<0.5 jobs/day) = 0
    const normalizedVelocity = Math.min((velocity / 3) * 100, 100)

    return Math.round(normalizedVelocity)
  }

  private calculateSkillNoveltyScore(job: ScrapedJob): number {
    if (job.skills.length === 0) return 50

    let totalNovelty = 0
    for (const skill of job.skills) {
      const skillData = this.skillFrequency.get(skill)
      if (!skillData) {
        totalNovelty += 100 // New skill = high novelty
      } else {
        // Calculate novelty based on recent growth
        const growthRate = skillData.count > 0 ? (skillData.recent / skillData.count) * 100 : 0
        totalNovelty += growthRate
      }
    }

    return Math.round(totalNovelty / job.skills.length)
  }

  private calculateDemandScore(job: ScrapedJob): number {
    if (job.skills.length === 0) return 50

    let totalDemand = 0
    for (const skill of job.skills) {
      const skillData = this.skillFrequency.get(skill)
      if (skillData) {
        // Higher count = higher demand
        // Normalize: 100+ occurrences = 100 demand
        const demand = Math.min((skillData.count / 100) * 100, 100)
        totalDemand += demand
      }
    }

    return Math.round(totalDemand / job.skills.length)
  }

  getEmergingSkills(): Array<{ skill: string; growthRate: number; demand: number }> {
    const emergingSkills: Array<{ skill: string; growthRate: number; demand: number }> = []

    for (const [skill, data] of this.skillFrequency.entries()) {
      if (data.count > 5) { // Only consider skills with meaningful data
        const growthRate = data.count > 0 ? (data.recent / data.count) * 100 : 0
        const demand = data.count

        emergingSkills.push({
          skill,
          growthRate,
          demand,
        })
      }
    }

    // Sort by growth rate
    return emergingSkills.sort((a, b) => b.growthRate - a.growthRate).slice(0, 20)
  }

  getSkillDemand(skill: string): number {
    const data = this.skillFrequency.get(skill)
    return data ? data.count : 0
  }
}

export const hotJobsDetector = new HotJobsDetector()