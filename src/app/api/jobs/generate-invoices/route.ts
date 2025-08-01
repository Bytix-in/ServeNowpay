import { NextRequest, NextResponse } from 'next/server'
import { runInvoiceBackgroundJob, invoiceBackgroundJob } from '@/lib/invoiceBackgroundJob'

/**
 * Manual trigger for invoice background job
 * POST: Run the job immediately
 * GET: Check job status and pending orders
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const {
      batchSize = 10,
      maxRetries = 3,
      delayBetweenBatches = 1000
    } = body

    // Run the background job
    const result = await runInvoiceBackgroundJob({
      batchSize,
      maxRetries,
      delayBetweenBatches
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error running invoice background job:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run invoice background job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get job status
    const jobStatus = invoiceBackgroundJob.getStatus()

    // Get orders that need invoices
    const ordersNeedingInvoices = await invoiceBackgroundJob.getOrdersNeedingInvoices(limit)

    return NextResponse.json({
      success: true,
      jobStatus,
      pendingOrders: {
        count: ordersNeedingInvoices.length,
        orders: ordersNeedingInvoices
      },
      actions: {
        runJob: 'POST /api/jobs/generate-invoices',
        checkStatus: 'GET /api/jobs/generate-invoices'
      }
    })

  } catch (error) {
    console.error('Error getting invoice job status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get job status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}