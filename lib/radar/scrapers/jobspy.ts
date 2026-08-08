// Job scraping service using jobspy-js
// Note: jobspy-js uses CommonJS and has native dependencies
// This should only be used in server-side API routes

export interface ScrapedJob {
  id: string
  title: string
  company: string
  location: string
  description: string
  salary?: {
    min?: number
    max?: number
    currency?: string
    period?: string
  }
  jobType?: string
  experience?: string
  postedDate: Date
  applyUrl: string
  source: string
  skills: string[]
}

export class JobScraper {
  async scrapeLinkedIn(params: {
    searchTerm: string
    location?: string
    resultsWanted?: number
    hoursOld?: number
  }): Promise<ScrapedJob[]> {
    try {
      // Dynamic import for jobspy-js (CommonJS compatibility)
      const jobspy = require('jobspy-js')
      const { scrapeJobs } = jobspy

      const jobs = await scrapeJobs({
        site_name: ['linkedin'],
        search_term: params.searchTerm,
        location: params.location || 'Remote',
        results_wanted: params.resultsWanted || 20,
        hours_old: params.hoursOld || 72,
        linkedin_fetch_description: true,
      })

      return this.transformJobs(jobs, 'linkedin')
    } catch (error) {
      console.error('LinkedIn scraping error:', error)
      // Return mock data for development
      return this.getMockJobs('linkedin', params.resultsWanted || 10)
    }
  }

  async scrapeIndeed(params: {
    searchTerm: string
    location?: string
    resultsWanted?: number
    hoursOld?: number
  }): Promise<ScrapedJob[]> {
    try {
      const jobspy = require('jobspy-js')
      const { scrapeJobs } = jobspy

      const jobs = await scrapeJobs({
        site_name: ['indeed'],
        search_term: params.searchTerm,
        location: params.location || 'Remote',
        results_wanted: params.resultsWanted || 20,
        hours_old: params.hoursOld || 72,
      })

      return this.transformJobs(jobs, 'indeed')
    } catch (error) {
      console.error('Indeed scraping error:', error)
      return this.getMockJobs('indeed', params.resultsWanted || 10)
    }
  }

  async scrapeGlassdoor(params: {
    searchTerm: string
    location?: string
    resultsWanted?: number
    hoursOld?: number
  }): Promise<ScrapedJob[]> {
    try {
      const jobspy = require('jobspy-js')
      const { scrapeJobs } = jobspy

      const jobs = await scrapeJobs({
        site_name: ['glassdoor'],
        search_term: params.searchTerm,
        location: params.location || 'Remote',
        results_wanted: params.resultsWanted || 20,
        hours_old: params.hoursOld || 72,
      })

      return this.transformJobs(jobs, 'glassdoor')
    } catch (error) {
      console.error('Glassdoor scraping error:', error)
      return this.getMockJobs('glassdoor', params.resultsWanted || 10)
    }
  }

  async scrapeAllSources(params: {
    searchTerm: string
    location?: string
    resultsWanted?: number
    hoursOld?: number
  }): Promise<ScrapedJob[]> {
    const results = await Promise.allSettled([
      this.scrapeLinkedIn(params),
      this.scrapeIndeed(params),
      this.scrapeGlassdoor(params),
    ])

    const allJobs = results
      .filter((result): result is PromiseFulfilledResult<ScrapedJob[]> => result.status === 'fulfilled')
      .flatMap((result) => result.value)

    return this.deduplicateJobs(allJobs)
  }

  private transformJobs(rawJobs: any[], source: string): ScrapedJob[] {
    if (!Array.isArray(rawJobs)) return []

    return rawJobs.map((job) => ({
      id: this.generateJobId(job, source),
      title: job.title || 'Unknown',
      company: job.company || 'Unknown',
      location: job.location || 'Unknown',
      description: job.description || '',
      salary: job.salary ? {
        min: job.salary.min,
        max: job.salary.max,
        currency: job.salary.currency || 'USD',
        period: job.salary.period || 'yearly',
      } : undefined,
      jobType: job.job_type,
      experience: job.experience,
      postedDate: new Date(job.posted_date || Date.now()),
      applyUrl: job.job_url || job.apply_url || '#',
      source,
      skills: this.extractSkills(job.description || ''),
    }))
  }

  private generateJobId(job: any, source: string): string {
    const uniqueString = `${source}-${job.title}-${job.company}-${job.location}`.toLowerCase().replace(/\s+/g, '-')
    return Buffer.from(uniqueString).toString('base64').substring(0, 20)
  }

  private extractSkills(description: string): string[] {
    const commonSkills = [
      'javascript', 'typescript', 'python', 'java', 'react', 'vue', 'angular',
      'node.js', 'express', 'django', 'flask', 'spring', 'docker', 'kubernetes',
      'aws', 'azure', 'gcp', 'postgresql', 'mongodb', 'redis', 'graphql',
      'rest api', 'graphql', 'git', 'ci/cd', 'agile', 'scrum', 'sql', 'nosql',
      'html', 'css', 'sass', 'tailwind', 'next.js', 'nuxt.js', 'gatsby',
    ]

    const lowerDescription = description.toLowerCase()
    return commonSkills.filter(skill => lowerDescription.includes(skill))
  }

  private deduplicateJobs(jobs: ScrapedJob[]): ScrapedJob[] {
    const seen = new Set<string>()
    const uniqueJobs: ScrapedJob[] = []

    for (const job of jobs) {
      const key = `${job.title}-${job.company}-${job.location}`.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        uniqueJobs.push(job)
      }
    }

    return uniqueJobs
  }

  private getMockJobs(source: string, count: number): ScrapedJob[] {
    const titles = [
      'Senior Software Engineer',
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'DevOps Engineer',
      'Data Engineer',
      'Machine Learning Engineer',
      'Product Manager',
      'Technical Lead',
      'Solutions Architect',
    ]

    const companies = [
      'Tech Corp', 'Innovation Labs', 'Digital Solutions', 'Cloud Systems',
      'DataDriven Inc', 'FutureTech', 'StartupXYZ', 'Enterprise Solutions',
    ]

    const locations = ['Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA']

    return Array.from({ length: count }, (_, i) => ({
      id: `mock-${source}-${i}`,
      title: titles[i % titles.length],
      company: companies[i % companies.length],
      location: locations[i % locations.length],
      description: `We are looking for a talented ${titles[i % titles.length]} to join our team. You will work on cutting-edge technologies and collaborate with talented engineers.`,
      salary: {
        min: 100000 + (i * 10000),
        max: 150000 + (i * 10000),
        currency: 'USD',
        period: 'yearly',
      },
      jobType: 'Full-time',
      experience: 'Mid-Senior',
      postedDate: new Date(Date.now() - i * 86400000),
      applyUrl: '#',
      source,
      skills: ['javascript', 'react', 'node.js', 'typescript', 'python'].slice(0, 3 + (i % 3)),
    }))
  }
}

// Only export the class, don't instantiate at module level
// This avoids build issues with native dependencies
export const getJobScraper = () => new JobScraper()