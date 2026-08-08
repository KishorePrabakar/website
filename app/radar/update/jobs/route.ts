import { NextRequest, NextResponse } from 'next/server'
import { getAutoUpdateService } from '@/lib/radar/services/autoUpdate'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron job request (in production, add authentication)
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Cron job triggered: Updating jobs')

    // Perform the update
    const autoUpdateService = getAutoUpdateService()
    const result = await autoUpdateService.performUpdate()

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Update completed successfully' : 'Update failed',
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}