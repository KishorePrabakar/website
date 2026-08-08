import { resend } from '../db/schema'

export interface EmailTemplate {
  to: string
  subject: string
  body: string
  jobId: string
  recruiterName?: string
  companyName?: string
}

export interface EmailResult {
  success: boolean
  emailId?: string
  error?: string
  trackingId?: string
}

export interface EmailTracking {
  emailId: string
  sent: boolean
  opened: boolean
  clicked: boolean
  replied: boolean
  sentDate: Date
  openedDate?: Date
  clickedDate?: Date
  repliedDate?: Date
}

export class EmailService {
  private emailQueue: EmailTemplate[] = []
  private trackingData: Map<string, EmailTracking> = new Map()

  async sendEmail(template: EmailTemplate): Promise<EmailResult> {
    try {
      if (!resend) {
        console.warn('Resend not configured, simulating email send')
        return this.simulateEmailSend(template)
      }

      const trackingId = this.generateTrackingId()

      const { data, error } = await resend.emails.send({
        from: 'noreply@kishorepr.vercel.app',
        to: template.to,
        subject: template.subject,
        html: template.body,
        headers: {
          'X-Tracking-ID': trackingId,
        },
      })

      if (error) {
        console.error('Email sending error:', error)
        return {
          success: false,
          error: error.message,
        }
      }

      // Store tracking data
      this.trackingData.set(trackingId, {
        emailId: data?.id || trackingId,
        sent: true,
        opened: false,
        clicked: false,
        replied: false,
        sentDate: new Date(),
      })

      return {
        success: true,
        emailId: data?.id,
        trackingId,
      }
    } catch (error) {
      console.error('Email sending error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private simulateEmailSend(template: EmailTemplate): EmailResult {
    const trackingId = this.generateTrackingId()

    console.log(`[SIMULATED] Sending email to ${template.to} with tracking ID: ${trackingId}`)
    console.log(`Subject: ${template.subject}`)

    this.trackingData.set(trackingId, {
      emailId: trackingId,
      sent: true,
      opened: false,
      clicked: false,
      replied: false,
      sentDate: new Date(),
    })

    return {
      success: true,
      emailId: trackingId,
      trackingId,
    }
  }

  async generatePersonalizedEmail(jobData: {
    title: string
    company: string
    description: string
    skills: string[]
  }, userProfile: {
    name: string
    skills: string[]
    experience: number
  }): Promise<EmailTemplate> {
    // In a real implementation, this would use AI (Groq) for personalization
    const subject = `Regarding ${jobData.title} position at ${jobData.company}`

    const body = this.generateEmailBody(jobData, userProfile)

    return {
      to: 'recruiter@company.com', // In real implementation, extract from job
      subject,
      body,
      jobId: 'job-id-placeholder',
      companyName: jobData.company,
    }
  }

  private generateEmailBody(jobData: any, userProfile: any): string {
    const matchedSkills = jobData.skills.filter((skill: string) =>
      userProfile.skills.some((userSkill: string) =>
        userSkill.toLowerCase().includes(skill.toLowerCase())
      )
    )

    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobData.title} position at ${jobData.company}.

With ${userProfile.experience} years of experience in software development, I have developed expertise in ${matchedSkills.slice(0, 3).join(', ')}, which aligns perfectly with the requirements for this role.

Key qualifications:
- ${userProfile.experience}+ years of experience in software development
- Proficient in ${userProfile.skills.slice(0, 4).join(', ')}
- Strong problem-solving and communication skills
- Experience with ${jobData.skills.slice(0, 2).join(' and ')}

I am particularly drawn to ${jobData.company} because of its innovative approach and commitment to excellence. I am confident that my skills and experience make me a strong candidate for this position.

I would welcome the opportunity to discuss how my background and skills would be a great fit for your team. Thank you for considering my application.

Best regards,
${userProfile.name}
[Your LinkedIn]
[Your GitHub]
[Your Portfolio]`
  }

  async sendBulkEmails(templates: EmailTemplate[]): Promise<EmailResult[]> {
    const results: EmailResult[] = []

    for (const template of templates) {
      // Add delay between emails to avoid spam filters
      await this.delay(2000) // 2 second delay
      const result = await this.sendEmail(template)
      results.push(result)
    }

    return results
  }

  getTrackingData(trackingId: string): EmailTracking | null {
    return this.trackingData.get(trackingId) || null
  }

  updateTrackingStatus(
    trackingId: string,
    event: 'opened' | 'clicked' | 'replied'
  ): void {
    const tracking = this.trackingData.get(trackingId)
    if (!tracking) return

    const now = new Date()

    switch (event) {
      case 'opened':
        tracking.opened = true
        tracking.openedDate = now
        break
      case 'clicked':
        tracking.clicked = true
        tracking.clickedDate = now
        break
      case 'replied':
        tracking.replied = true
        tracking.repliedDate = now
        break
    }

    this.trackingData.set(trackingId, tracking)
  }

  getTrackingStats(): {
    totalSent: number
    totalOpened: number
    totalClicked: number
    totalReplied: number
    openRate: number
    clickRate: number
    replyRate: number
  } {
    const allTracking = Array.from(this.trackingData.values())

    const totalSent = allTracking.length
    const totalOpened = allTracking.filter(t => t.opened).length
    const totalClicked = allTracking.filter(t => t.clicked).length
    const totalReplied = allTracking.filter(t => t.replied).length

    return {
      totalSent,
      totalOpened,
      totalClicked,
      totalReplied,
      openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
      clickRate: totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0,
      replyRate: totalOpened > 0 ? Math.round((totalReplied / totalOpened) * 100) : 0,
    }
  }

  private generateTrackingId(): string {
    return `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // In a real implementation, add tracking pixel to emails
  getTrackingPixelUrl(trackingId: string): string {
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tracking/pixel/${trackingId}`
  }

  getTrackingClickUrl(trackingId: string, targetUrl: string): string {
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tracking/click/${trackingId}?url=${encodeURIComponent(targetUrl)}`
  }
}

export const emailService = new EmailService()