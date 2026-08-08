// Placeholder for scoring logic - to be implemented
export interface UserProfile {
  skills: string[]
  experience: number
  preferredLocations: string[]
  targetRoles: string[]
}

export interface Job {
  id: string
  title: string
  company: string
  skills: string[]
  location: string
  salary: { min: number; max: number; currency: string }
  experience: number
  postedDate: Date
}

export interface SkillTrend {
  name: string
  growthRate: number
  demand: number
}

export function calculateMatchScore(job: Job, profile: UserProfile): number {
  // Placeholder implementation
  const skillMatches = job.skills.filter(skill => profile.skills.includes(skill)).length
  const skillScore = (skillMatches / job.skills.length) * 40

  const expMatch = 1 - Math.abs(job.experience - profile.experience) / 10
  const expScore = expMatch * 30

  const locationMatch = profile.preferredLocations.includes(job.location.toLowerCase()) ? 1 : 0.5
  const locationScore = locationMatch * 30

  return Math.round(skillScore + expScore + locationScore)
}

export function calculateJobVelocity(jobs: Job[]): number {
  if (jobs.length < 2) return 0

  const sortedJobs = [...jobs].sort((a, b) => a.postedDate.getTime() - b.postedDate.getTime())
  const timeSpan = sortedJobs[sortedJobs.length - 1].postedDate.getTime() - sortedJobs[0].postedDate.getTime()
  const hours = timeSpan / (1000 * 60 * 60)

  return hours > 0 ? Math.round((jobs.length / hours) * 24) : 0
}

export function identifyEmergingSkills(jobs: Job[]): SkillTrend[] {
  const skillFrequency = new Map<string, { count: number; recent: number }>()

  jobs.forEach(job => {
    job.skills.forEach(skill => {
      const current = skillFrequency.get(skill) || { count: 0, recent: 0 }
      const isRecent = job.postedDate.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      skillFrequency.set(skill, {
        count: current.count + 1,
        recent: current.recent + (isRecent ? 1 : 0)
      })
    })
  })

  return Array.from(skillFrequency.entries()).map(([name, data]) => ({
    name,
    growthRate: data.count > 0 ? (data.recent / data.count) * 100 : 0,
    demand: data.count
  })).sort((a, b) => b.growthRate - a.growthRate)
}