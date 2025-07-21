import { NextRequest, NextResponse } from 'next/server'

// Mock user data for demonstration
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = parseInt(params.id)
  const user = users.find((u) => u.id === userId)

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ user })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, email } = body

    if (name) users[userIndex].name = name
    if (email) users[userIndex].email = email

    return NextResponse.json({ user: users[userIndex] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = parseInt(params.id)
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  users.splice(userIndex, 1)
  return NextResponse.json({ message: 'User deleted successfully' })
}