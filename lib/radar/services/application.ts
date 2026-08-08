import { supabase, Application as DBApplication } from '../db/schema'

export interface Application {
  id: string
  jobId: string
  jobTitle: string
  company: string
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected' | 'ghosted'
  appliedDate?: Date
  lastUpdate: Date
  notes?: string
  resumeUrl?: string
  coverLetterUrl?: string
}

export interface ApplicationStats {
  total: number
  saved: number
  applied: number
  interview: number
  offer: number
  rejected: number
  ghosted: number
  responseRate: number
}

export class ApplicationTracker {
  async saveApplication(jobId: string, jobData: { title: string; company: string }): Promise<Application> {
    const id = this.generateApplicationId(jobId)

    const { data, error } = await supabase
      .from('applications')
      .insert({
        id,
        job_id: jobId,
        job_title: jobData.title,
        company: jobData.company,
        status: 'saved',
        last_update: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to save application:', error)
      throw error
    }

    return this.mapDbToApplication(data)
  }

  async updateApplicationStatus(
    applicationId: string,
    status: Application['status'],
    notes?: string
  ): Promise<Application | null> {
    const updateData: any = {
      status,
      last_update: new Date().toISOString(),
    }

    if (status === 'applied') {
      updateData.applied_date = new Date().toISOString()
    }

    if (notes) {
      updateData.notes = notes
    }

    const { data, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update application:', error)
      return null
    }

    return this.mapDbToApplication(data)
  }

  async getApplication(applicationId: string): Promise<Application | null> {
    const { data, error } = await supabase
      .from('applications')
      .select()
      .eq('id', applicationId)
      .single()

    if (error || !data) return null

    return this.mapDbToApplication(data)
  }

  async getAllApplications(): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select()
      .order('last_update', { ascending: false })

    if (error) {
      console.error('Failed to fetch applications:', error)
      return []
    }

    return data.map(this.mapDbToApplication)
  }

  async getApplicationsByStatus(status: Application['status']): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select()
      .eq('status', status)
      .order('last_update', { ascending: false })

    if (error) {
      console.error('Failed to fetch applications by status:', error)
      return []
    }

    return data.map(this.mapDbToApplication)
  }

  async getStats(): Promise<ApplicationStats> {
    const applications = await this.getAllApplications()

    const stats: ApplicationStats = {
      total: applications.length,
      saved: applications.filter(a => a.status === 'saved').length,
      applied: applications.filter(a => a.status === 'applied').length,
      interview: applications.filter(a => a.status === 'interview').length,
      offer: applications.filter(a => a.status === 'offer').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      ghosted: applications.filter(a => a.status === 'ghosted').length,
      responseRate: 0,
    }

    const responded = stats.interview + stats.offer + stats.rejected
    stats.responseRate = stats.applied > 0 ? Math.round((responded / stats.applied) * 100) : 0

    return stats
  }

  async deleteApplication(applicationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId)

    return !error
  }

  private generateApplicationId(jobId: string): string {
    return `app-${jobId}-${Date.now()}`
  }

  private mapDbToApplication(dbApp: DBApplication): Application {
    return {
      id: dbApp.id,
      jobId: dbApp.job_id,
      jobTitle: dbApp.job_title,
      company: dbApp.company,
      status: dbApp.status,
      appliedDate: dbApp.applied_date ? new Date(dbApp.applied_date) : undefined,
      lastUpdate: new Date(dbApp.last_update),
      notes: dbApp.notes,
      resumeUrl: dbApp.resume_url,
      coverLetterUrl: dbApp.cover_letter_url,
    }
  }
}

export const getApplicationTracker = () => new ApplicationTracker()