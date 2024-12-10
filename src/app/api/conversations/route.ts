import { NextResponse } from 'next/server'
import { withAuth } from '@/middleware/auth'
import { connectDB } from '@/lib/mongodb'
import Message from '@/models/Message'

type Conversation = {
  _id: string
  lastMessage: string
  updatedAt: string
}

export const GET = withAuth(async (request, user) => {
  try {
    await connectDB()
    const conversations: Conversation[] = await Message.aggregate([
      { $match: { userId: user.id } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $last: '$content' },
          updatedAt: { $max: '$createdAt' }
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
})
