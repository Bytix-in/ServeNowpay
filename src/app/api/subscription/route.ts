import { NextRequest, NextResponse } from 'next/server'

// Mock subscription data
let subscriptions = [
  {
    id: 'sub_001',
    customerId: 'cust_restaurant_001',
    planId: 'plan_professional',
    planName: 'Professional',
    status: 'active',
    currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    cancelAtPeriodEnd: false,
    amount: 7900, // $79.00 in cents
    currency: 'usd',
    interval: 'month',
    features: {
      maxTables: 50,
      advancedAnalytics: true,
      prioritySupport: true,
      customIntegrations: true,
      apiAccess: true
    },
    usage: {
      tables: 12,
      ordersThisMonth: 1247,
      apiCallsThisMonth: 3456
    },
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2025
    },
    nextInvoiceDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2023-01-15T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  }
]

const plans = [
  {
    id: 'plan_starter',
    name: 'Starter',
    price: 2900, // $29.00 in cents
    interval: 'month',
    features: {
      maxTables: 10,
      advancedAnalytics: false,
      prioritySupport: false,
      customIntegrations: false,
      apiAccess: true
    }
  },
  {
    id: 'plan_professional',
    name: 'Professional',
    price: 7900, // $79.00 in cents
    interval: 'month',
    features: {
      maxTables: 50,
      advancedAnalytics: true,
      prioritySupport: true,
      customIntegrations: true,
      apiAccess: true
    }
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    price: 19900, // $199.00 in cents
    interval: 'month',
    features: {
      maxTables: -1, // unlimited
      advancedAnalytics: true,
      prioritySupport: true,
      customIntegrations: true,
      apiAccess: true,
      customBranding: true,
      dedicatedSupport: true
    }
  }
]

// Get subscription information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (customerId) {
      const subscription = subscriptions.find(sub => sub.customerId === customerId)
      if (!subscription) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ subscription })
    }

    return NextResponse.json({ 
      subscriptions,
      plans 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subscription information' },
      { status: 500 }
    )
  }
}

// Create or update subscription
export async function POST(request: NextRequest) {
  try {
    const { customerId, planId, paymentMethodId } = await request.json()

    const plan = plans.find(p => p.id === planId)
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Check if customer already has a subscription
    const existingSubIndex = subscriptions.findIndex(sub => sub.customerId === customerId)
    
    const subscriptionData = {
      id: existingSubIndex >= 0 ? subscriptions[existingSubIndex].id : `sub_${Date.now()}`,
      customerId,
      planId,
      planName: plan.name,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      cancelAtPeriodEnd: false,
      amount: plan.price,
      currency: 'usd',
      interval: plan.interval,
      features: plan.features,
      usage: existingSubIndex >= 0 ? subscriptions[existingSubIndex].usage : {
        tables: 0,
        ordersThisMonth: 0,
        apiCallsThisMonth: 0
      },
      paymentMethod: {
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025
      },
      nextInvoiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: existingSubIndex >= 0 ? subscriptions[existingSubIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (existingSubIndex >= 0) {
      subscriptions[existingSubIndex] = subscriptionData
    } else {
      subscriptions.push(subscriptionData)
    }

    return NextResponse.json({ 
      subscription: subscriptionData,
      message: existingSubIndex >= 0 ? 'Subscription updated successfully' : 'Subscription created successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}

// Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('id')
    const cancelImmediately = searchParams.get('immediate') === 'true'

    const subIndex = subscriptions.findIndex(sub => sub.id === subscriptionId)
    if (subIndex === -1) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    if (cancelImmediately) {
      subscriptions[subIndex].status = 'canceled'
      subscriptions[subIndex].currentPeriodEnd = new Date().toISOString()
    } else {
      subscriptions[subIndex].cancelAtPeriodEnd = true
    }

    subscriptions[subIndex].updatedAt = new Date().toISOString()

    return NextResponse.json({ 
      subscription: subscriptions[subIndex],
      message: cancelImmediately ? 'Subscription canceled immediately' : 'Subscription will be canceled at period end'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}