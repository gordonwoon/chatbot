import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Conversation } from '@/models/Conversation'
import Message from '@/models/Message'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const GET = async () => {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    const conversations: Conversation[] = await Message.aggregate([
      { $match: { userId: session?.user.id } },
      {
        $group: {
          _id: '$conversationId',
          content: { $last: '$content' },
          timestamp: { $max: '$timestamp' }
        }
      },
      { $sort: { updatedAt: -1 } }
    ])
    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export const DELETE = async (request: Request) => {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('id')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    // Delete all messages in conversation
    await Message.deleteMany({
      conversationId,
      userId: session?.user.id
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
