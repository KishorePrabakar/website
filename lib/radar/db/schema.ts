import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const resendApiKey = process.env.RESEND_API_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Initialize Resend if API key is available
export const resend = resendApiKey ? new Resend(resendApiKey) : null

// Database types
export interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  job_type?: string
  experience?: string
  posted_date: string
  apply_url: string
  source: string
  skills: string[]
  created_at: string
}

export interface Application {
  id: string
  job_id: string
  job_title: string
  company: string
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected' | 'ghosted'
  applied_date?: string
  last_update: string
  notes?: string
  resume_url?: string
  cover_letter_url?: string
  created_at: string
}

export interface Skill {
  id: number
  name: string
  demand: number
  growth_rate: number
  trend: 'rising' | 'stable' | 'declining'
  avg_salary?: number
  last_updated: string
}