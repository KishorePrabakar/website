import { NextRequest, NextResponse } from 'next/server'
import { getApplicationTracker } from '@/lib/radar/services/application'

export async function GET(request: NextRequest) {
  try {
    const applicationTracker = getApplicationTracker()
    const applications = await applicationTracker.getAllApplications()
    const stats = await applicationTracker.getStats()

    return NextResponse.json({
      applications,
      stats,
    })
  } catch (error) {
    console.error('Applications API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, jobTitle, company } = body

    if (!jobId || !jobTitle || !company) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, jobTitle, company' },
        { status: 400 }
      )
    }

    const applicationTracker = getApplicationTracker()
    const application = await applicationTracker.saveApplication(jobId, { title: jobTitle, company })

    return NextResponse.json({
      success: true,
      application,
    })
  } catch (error) {
    console.error('Application creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, status, notes } = body

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, status' },
        { status: 400 }
      )
    }

    const applicationTracker = getApplicationTracker()
    const application = await applicationTracker.updateApplicationStatus(applicationId, status, notes)

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      application,
    })
  } catch (error) {
    console.error('Application update error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('id')

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing applicationId' },
        { status: 400 }
      )
    }

    const applicationTracker = getApplicationTracker()
    const deleted = await applicationTracker.deleteApplication(applicationId)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Application deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}