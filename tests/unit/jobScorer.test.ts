import { describe, it, expect } from 'vitest'
import { calculateMatchScore, calculateJobVelocity, identifyEmergingSkills } from '@/lib/analyzers/scoring'

describe('JobScoringEngine', () => {
  const mockUserProfile = {
    skills: ['javascript', 'react', 'node.js', 'typescript', 'python'],
    experience: 2,
    preferredLocations: ['remote', 'san francisco'],
    targetRoles: ['software engineer', 'frontend developer']
  }

  const mockJob = {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    skills: ['javascript', 'react', 'node.js', 'typescript', 'aws'],
    location: 'remote',
    salary: { min: 120000, max: 150000, currency: 'USD' },
    experience: 3,
    postedDate: new Date('2026-08-07')
  }

  describe('calculateMatchScore', () => {
    it('should calculate match score between 0 and 100', () => {
      const score = calculateMatchScore(mockJob, mockUserProfile)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should give higher score for skill matches', () => {
      const highMatchJob = {
        ...mockJob,
        skills: ['javascript', 'react', 'node.js', 'typescript', 'python']
      }
      const lowMatchJob = {
        ...mockJob,
        skills: ['java', 'spring', 'kubernetes', 'docker', 'go']
      }

      const highScore = calculateMatchScore(highMatchJob, mockUserProfile)
      const lowScore = calculateMatchScore(lowMatchJob, mockUserProfile)

      expect(highScore).toBeGreaterThan(lowScore)
    })

    it('should consider experience level match', () => {
      const matchingExpJob = { ...mockJob, experience: 2 }
      const mismatchingExpJob = { ...mockJob, experience: 10 }

      const matchingScore = calculateMatchScore(matchingExpJob, mockUserProfile)
      const mismatchingScore = calculateMatchScore(mismatchingExpJob, mockUserProfile)

      expect(matchingScore).toBeGreaterThan(mismatchingScore)
    })

    it('should penalize location mismatch', () => {
      const remoteJob = { ...mockJob, location: 'remote' }
      const onsiteJob = { ...mockJob, location: 'new york' }

      const remoteScore = calculateMatchScore(remoteJob, mockUserProfile)
      const onsiteScore = calculateMatchScore(onsiteJob, mockUserProfile)

      expect(remoteScore).toBeGreaterThan(onsiteScore)
    })
  })

  describe('calculateJobVelocity', () => {
    it('should calculate posting velocity correctly', () => {
      const jobHistory = [
        { ...mockJob, postedDate: new Date('2026-08-07') },
        { ...mockJob, postedDate: new Date('2026-08-06') },
        { ...mockJob, postedDate: new Date('2026-08-05') }
      ]

      const velocity = calculateJobVelocity(jobHistory)
      expect(velocity).toBeGreaterThan(0)
    })

    it('should identify high-velocity jobs', () => {
      const highVelocityJobs = Array(10).fill(null).map((_, i) => ({
        ...mockJob,
        postedDate: new Date(Date.now() - i * 3600000) // 1 hour apart
      }))

      const velocity = calculateJobVelocity(highVelocityJobs)
      expect(velocity).toBeGreaterThan(5) // High velocity threshold
    })
  })

  describe('identifyEmergingSkills', () => {
    it('should identify skills with increasing demand', () => {
      const jobs = [
        { ...mockJob, skills: ['javascript', 'react', 'rust'], postedDate: new Date('2026-08-07') },
        { ...mockJob, skills: ['javascript', 'react', 'rust'], postedDate: new Date('2026-08-06') },
        { ...mockJob, skills: ['javascript', 'react'], postedDate: new Date('2026-08-05') },
        { ...mockJob, skills: ['javascript'], postedDate: new Date('2026-08-04') }
      ]

      const emergingSkills = identifyEmergingSkills(jobs)
      expect(emergingSkills).toContain('rust')
    })

    it('should rank skills by growth rate', () => {
      const jobs = Array(20).fill(null).map((_, i) => ({
        ...mockJob,
        skills: i > 15 ? ['javascript', 'ai', 'ml'] : ['javascript'],
        postedDate: new Date(Date.now() - i * 86400000)
      }))

      const emergingSkills = identifyEmergingSkills(jobs)
      const aiSkill = emergingSkills.find(s => s.name === 'ai')
      const jsSkill = emergingSkills.find(s => s.name === 'javascript')

      expect(aiSkill?.growthRate).toBeGreaterThan(jsSkill?.growthRate || 0)
    })
  })
})