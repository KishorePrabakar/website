import { ScrapedJob } from '../scrapers/jobspy'

export interface TrendData {
  skill: string
  demand: number
  growthRate: number
  trend: 'rising' | 'stable' | 'declining'
  avgSalary: number
  companies: string[]
}

export interface SalaryTrend {
  period: string
  avgSalary: number
  minSalary: number
  maxSalary: number
  role: string
}

export interface RoleDemand {
  role: string
  demand: number
  growthRate: number
  avgSalary: number
  topSkills: string[]
}

export class MarketTrendsEngine {
  private historicalData: Map<string, TrendData[]> = new Map()
  private currentData: TrendData[] = []

  analyzeMarketTrends(jobs: ScrapedJob[]): {
    skills: TrendData[]
    salaries: SalaryTrend[]
    roles: RoleDemand[]
    predictions: any[]
  } {
    // Analyze skill trends
    const skillTrends = this.analyzeSkillTrends(jobs)

    // Analyze salary trends
    const salaryTrends = this.analyzeSalaryTrends(jobs)

    // Analyze role demand
    const roleDemand = this.analyzeRoleDemand(jobs)

    // Generate predictions
    const predictions = this.generatePredictions(skillTrends)

    return {
      skills: skillTrends,
      salaries: salaryTrends,
      roles: roleDemand,
      predictions,
    }
  }

  private analyzeSkillTrends(jobs: ScrapedJob[]): TrendData[] {
    const skillData = new Map<string, {
      count: number
      salaries: number[]
      companies: Set<string>
      recentCount: number
    }>()

    const now = Date.now()
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000

    for (const job of jobs) {
      for (const skill of job.skills) {
        const current = skillData.get(skill) || {
          count: 0,
          salaries: [],
          companies: new Set(),
          recentCount: 0,
        }

        current.count++
        current.companies.add(job.company)

        if (job.salary && job.salary.min && job.salary.max) {
          current.salaries.push((job.salary.min + job.salary.max) / 2)
        }

        if (job.postedDate.getTime() > sevenDaysAgo) {
          current.recentCount++
        }

        skillData.set(skill, current)
      }
    }

    const trends: TrendData[] = []

    for (const [skill, data] of skillData.entries()) {
      const growthRate = data.count > 0 ? (data.recentCount / data.count) * 100 : 0
      const avgSalary = data.salaries.length > 0
        ? data.salaries.reduce((a, b) => a + b, 0) / data.salaries.length
        : 0

      let trend: 'rising' | 'stable' | 'declining' = 'stable'
      if (growthRate > 30) trend = 'rising'
      else if (growthRate < 10) trend = 'declining'

      trends.push({
        skill,
        demand: data.count,
        growthRate,
        trend,
        avgSalary,
        companies: Array.from(data.companies),
      })
    }

    // Sort by demand
    this.currentData = trends.sort((a, b) => b.demand - a.demand)
    return this.currentData
  }

  private analyzeSalaryTrends(jobs: ScrapedJob[]): SalaryTrend[] {
    const salaryData = new Map<string, {
      salaries: number[]
      min: number
      max: number
    }>()

    for (const job of jobs) {
      if (job.salary && job.salary.min && job.salary.max) {
        const avgSalary = (job.salary.min + job.salary.max) / 2
        const key = this.getSalaryPeriodKey(job.salary.period || 'yearly')

        const current = salaryData.get(key) || {
          salaries: [],
          min: Infinity,
          max: -Infinity,
        }

        current.salaries.push(avgSalary)
        current.min = Math.min(current.min, job.salary.min)
        current.max = Math.max(current.max, job.salary.max)

        salaryData.set(key, current)
      }
    }

    const trends: SalaryTrend[] = []

    for (const [period, data] of salaryData.entries()) {
      const avgSalary = data.salaries.length > 0
        ? data.salaries.reduce((a, b) => a + b, 0) / data.salaries.length
        : 0

      trends.push({
        period,
        avgSalary: Math.round(avgSalary),
        minSalary: data.min === Infinity ? 0 : data.min,
        maxSalary: data.max === -Infinity ? 0 : data.max,
        role: 'All Roles',
      })
    }

    return trends
  }

  private analyzeRoleDemand(jobs: ScrapedJob[]): RoleDemand[] {
    const roleData = new Map<string, {
      count: number
      salaries: number[]
      skills: Map<string, number>
    }>()

    for (const job of jobs) {
      const role = this.normalizeRole(job.title)
      const current = roleData.get(role) || {
        count: 0,
        salaries: [] as number[],
        skills: new Map(),
      }

      current.count++

      if (job.salary && job.salary.min && job.salary.max) {
        current.salaries.push((job.salary.min + job.salary.max) / 2)
      }

      for (const skill of job.skills) {
        const skillCount = current.skills.get(skill) || 0
        current.skills.set(skill, skillCount + 1)
      }

      roleData.set(role, current)
    }

    const roles: RoleDemand[] = []

    for (const [role, data] of roleData.entries()) {
      const avgSalary = data.salaries.length > 0
        ? data.salaries.reduce((a, b) => a + b, 0) / data.salaries.length
        : 0

      // Get top 5 skills for this role
      const topSkills = Array.from(data.skills.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill]) => skill)

      roles.push({
        role,
        demand: data.count,
        growthRate: this.calculateRoleGrowthRate(role),
        avgSalary: Math.round(avgSalary),
        topSkills,
      })
    }

    return roles.sort((a, b) => b.demand - a.demand)
  }

  private generatePredictions(skillTrends: TrendData[]): any[] {
    const predictions = []

    // Predict top rising skills
    const risingSkills = skillTrends
      .filter(t => t.trend === 'rising')
      .slice(0, 5)

    for (const skill of risingSkills) {
      predictions.push({
        type: 'skill_demand',
        skill: skill.skill,
        prediction: 'increasing',
        confidence: Math.min(skill.growthRate / 100, 0.95),
        timeframe: '3 months',
        currentDemand: skill.demand,
      })
    }

    // Predict salary trends
    const highSalarySkills = skillTrends
      .filter(t => t.avgSalary > 100000)
      .slice(0, 3)

    for (const skill of highSalarySkills) {
      predictions.push({
        type: 'salary_trend',
        skill: skill.skill,
        prediction: 'salary_increase',
        confidence: 0.7,
        timeframe: '6 months',
        currentAvgSalary: skill.avgSalary,
      })
    }

    return predictions
  }

  private normalizeRole(title: string): string {
    const lowerTitle = title.toLowerCase()

    if (lowerTitle.includes('senior')) return 'Senior Software Engineer'
    if (lowerTitle.includes('full stack')) return 'Full Stack Developer'
    if (lowerTitle.includes('frontend')) return 'Frontend Developer'
    if (lowerTitle.includes('backend')) return 'Backend Developer'
    if (lowerTitle.includes('devops')) return 'DevOps Engineer'
    if (lowerTitle.includes('data engineer')) return 'Data Engineer'
    if (lowerTitle.includes('machine learning')) return 'ML Engineer'
    if (lowerTitle.includes('product manager')) return 'Product Manager'

    return 'Software Engineer'
  }

  private getSalaryPeriodKey(period: string): string {
    if (period.includes('hour')) return 'hourly'
    if (period.includes('month')) return 'monthly'
    return 'yearly'
  }

  private calculateRoleGrowthRate(role: string): number {
    // In a real implementation, this would use historical data
    // For now, return a mock growth rate
    const growthRates: Record<string, number> = {
      'Senior Software Engineer': 15,
      'Full Stack Developer': 22,
      'Frontend Developer': 18,
      'Backend Developer': 12,
      'DevOps Engineer': 25,
      'Data Engineer': 30,
      'ML Engineer': 35,
      'Product Manager': 10,
    }

    return growthRates[role] || 10
  }

  storeHistoricalData(): void {
    const now = new Date().toISOString().split('T')[0]
    this.historicalData.set(now, [...this.currentData])
  }

  getHistoricalTrends(days: number = 30): TrendData[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const historicalTrends: TrendData[] = []

    for (const [date, data] of this.historicalData.entries()) {
      const dataDate = new Date(date)
      if (dataDate >= cutoffDate) {
        historicalTrends.push(...data)
      }
    }

    return historicalTrends
  }
}

export const getMarketTrendsEngine = () => new MarketTrendsEngine()