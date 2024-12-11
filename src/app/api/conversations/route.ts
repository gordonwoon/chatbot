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
