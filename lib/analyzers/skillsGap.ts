import { ScrapedJob } from '../scrapers/jobspy'

export interface UserSkill {
  name: string
  proficiency: number // 0-100
  yearsExperience: number
  lastUsed: Date
}

export interface SkillGap {
  skill: string
  currentLevel: number
  requiredLevel: number
  gap: number
  marketDemand: number
  priority: 'high' | 'medium' | 'low'
  learningResources: string[]
  estimatedTimeToLearn: string
}

export interface LearningPath {
  skill: string
  steps: Array<{
    title: string
    resources: string[]
    estimatedTime: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  }>
  totalEstimatedTime: string
}

export class SkillsGapAnalyzer {
  private marketSkills: Map<string, { demand: number; trend: 'rising' | 'stable' | 'declining' }> = new Map()

  analyzeUserSkills(userSkills: UserSkill[], marketJobs: ScrapedJob[]): SkillGap[] {
    // Update market skills from jobs
    this.updateMarketSkills(marketJobs)

    const skillGaps: SkillGap[] = []

    // Get all unique skills from market
    const allMarketSkills = this.getAllMarketSkills(marketJobs)

    for (const marketSkill of allMarketSkills) {
      const userSkill = userSkills.find(s => s.name.toLowerCase() === marketSkill.toLowerCase())

      if (!userSkill) {
        // User doesn't have this skill at all
        const marketData = this.marketSkills.get(marketSkill)
        skillGaps.push({
          skill: marketSkill,
          currentLevel: 0,
          requiredLevel: this.getRequiredLevel(marketSkill, marketJobs),
          gap: 100,
          marketDemand: marketData?.demand || 0,
          priority: this.calculatePriority(marketSkill, marketData),
          learningResources: this.getLearningResources(marketSkill),
          estimatedTimeToLearn: this.estimateLearningTime(marketSkill, 0),
        })
      } else if (userSkill.proficiency < 70) {
        // User has skill but not proficient enough
        const marketData = this.marketSkills.get(marketSkill)
        const requiredLevel = this.getRequiredLevel(marketSkill, marketJobs)
        skillGaps.push({
          skill: marketSkill,
          currentLevel: userSkill.proficiency,
          requiredLevel,
          gap: requiredLevel - userSkill.proficiency,
          marketDemand: marketData?.demand || 0,
          priority: this.calculatePriority(marketSkill, marketData),
          learningResources: this.getLearningResources(marketSkill),
          estimatedTimeToLearn: this.estimateLearningTime(marketSkill, userSkill.proficiency),
        })
      }
    }

    // Sort by priority and gap size
    return skillGaps
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return b.gap - a.gap
      })
      .slice(0, 20) // Top 20 skill gaps
  }

  generateLearningPaths(gaps: SkillGap[]): LearningPath[] {
    const learningPaths: LearningPath[] = []

    for (const gap of gaps.slice(0, 10)) { // Top 10 gaps
      const path = this.createLearningPath(gap)
      learningPaths.push(path)
    }

    return learningPaths
  }

  private updateMarketSkills(jobs: ScrapedJob[]): void {
    for (const job of jobs) {
      for (const skill of job.skills) {
        const current = this.marketSkills.get(skill) || { demand: 0, trend: 'stable' as const }
        current.demand++
        this.marketSkills.set(skill, current)
      }
    }

    // Calculate trends based on demand distribution
    const demandValues = Array.from(this.marketSkills.values()).map(v => v.demand)
    const avgDemand = demandValues.reduce((a, b) => a + b, 0) / demandValues.length

    for (const [skill, data] of this.marketSkills.entries()) {
      if (data.demand > avgDemand * 1.5) {
        data.trend = 'rising'
      } else if (data.demand < avgDemand * 0.5) {
        data.trend = 'declining'
      } else {
        data.trend = 'stable'
      }
    }
  }

  private getAllMarketSkills(jobs: ScrapedJob[]): string[] {
    const skillSet = new Set<string>()
    for (const job of jobs) {
      for (const skill of job.skills) {
        skillSet.add(skill)
      }
    }
    return Array.from(skillSet)
  }

  private getRequiredLevel(skill: string, jobs: ScrapedJob[]): number {
    // Calculate average required level from job descriptions
    const skillJobs = jobs.filter(job => job.skills.includes(skill))
    if (skillJobs.length === 0) return 70

    // For now, return a default based on skill type
    const advancedSkills = ['kubernetes', 'aws', 'machine learning', 'devops', 'architecture']
    const intermediateSkills = ['react', 'node.js', 'python', 'typescript', 'docker']

    if (advancedSkills.some(s => skill.includes(s))) return 85
    if (intermediateSkills.some(s => skill.includes(s))) return 75
    return 70
  }

  private calculatePriority(skill: string, marketData?: { demand: number; trend: string }): 'high' | 'medium' | 'low' {
    if (!marketData) return 'low'

    const { demand, trend } = marketData

    if (trend === 'rising' && demand > 50) return 'high'
    if (trend === 'rising' && demand > 20) return 'medium'
    if (trend === 'stable' && demand > 30) return 'medium'
    return 'low'
  }

  private getLearningResources(skill: string): string[] {
    const resources: Record<string, string[]> = {
      'javascript': ['MDN JavaScript Guide', 'JavaScript.info', 'Eloquent JavaScript'],
      'typescript': ['TypeScript Handbook', 'Total TypeScript', 'TypeScript Deep Dive'],
      'react': ['React Documentation', 'React Tutorial', 'React Patterns'],
      'node.js': ['Node.js Documentation', 'Node.js Best Practices', 'Node.js Design Patterns'],
      'python': ['Python Documentation', 'Real Python', 'Python for Data Analysis'],
      'docker': ['Docker Documentation', 'Docker Tutorial', 'Docker Best Practices'],
      'kubernetes': ['Kubernetes Documentation', 'Kubernetes Tutorial', 'Kubernetes Patterns'],
      'aws': ['AWS Documentation', 'AWS Certified Developer', 'AWS Well-Architected'],
      'graphql': ['GraphQL Documentation', 'GraphQL Tutorial', 'GraphQL Best Practices'],
    }

    return resources[skill.toLowerCase()] || ['Official Documentation', 'Online Tutorials', 'Practice Projects']
  }

  private estimateLearningTime(skill: string, currentLevel: number): string {
    const baseTime = this.getBaseLearningTime(skill)
    const remaining = 100 - currentLevel
    const weeks = Math.round((baseTime * remaining) / 100)

    if (weeks < 2) return '1-2 weeks'
    if (weeks < 4) return '2-4 weeks'
    if (weeks < 8) return '1-2 months'
    if (weeks < 12) return '2-3 months'
    return '3+ months'
  }

  private getBaseLearningTime(skill: string): number {
    // Base learning time in weeks for a complete beginner
    const skillComplexity: Record<string, number> = {
      'kubernetes': 12,
      'aws': 10,
      'machine learning': 16,
      'devops': 12,
      'architecture': 14,
      'react': 6,
      'node.js': 6,
      'typescript': 4,
      'python': 6,
      'docker': 4,
      'graphql': 6,
    }

    return skillComplexity[skill.toLowerCase()] || 6 // Default 6 weeks
  }

  private createLearningPath(gap: SkillGap): LearningPath {
    const steps = [
      {
        title: `Foundation: ${gap.skill} Basics`,
        resources: gap.learningResources.slice(0, 2),
        estimatedTime: '2-3 weeks',
        difficulty: 'beginner' as const,
      },
      {
        title: `Intermediate: ${gap.skill} in Practice`,
        resources: gap.learningResources,
        estimatedTime: '3-4 weeks',
        difficulty: 'intermediate' as const,
      },
      {
        title: `Advanced: ${gap.skill} Mastery`,
        resources: [...gap.learningResources, 'Advanced Projects', 'Real-world Applications'],
        estimatedTime: '4-6 weeks',
        difficulty: 'advanced' as const,
      },
    ]

    return {
      skill: gap.skill,
      steps,
      totalEstimatedTime: gap.estimatedTimeToLearn,
    }
  }

  getMarketSkillDemand(skill: string): number {
    const data = this.marketSkills.get(skill)
    return data ? data.demand : 0
  }

  getSkillTrend(skill: string): 'rising' | 'stable' | 'declining' {
    const data = this.marketSkills.get(skill)
    return data ? data.trend : 'stable'
  }
}

export const skillsGapAnalyzer = new SkillsGapAnalyzer()