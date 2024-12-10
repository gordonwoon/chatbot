import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Message from '@/models/Message'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

interface CreateMessageRequest {
  content: string
  conversationId: string
  parentMessageId?: string
}

export const GET = async (request: Request) => {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)

    // Get conversation ID from URL params
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    // Fetch messages for specific conversation
    const messages = await Message.find({
      userId: session?.user.id,
      conversationId
    }).sort({ timestamp: 1 })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export const POST = async (request: Request) => {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    const body = (await request.json()) as CreateMessageRequest
    const { content, conversationId, parentMessageId } = body

    if (!content || !conversationId) {
      return NextResponse.json(
        { error: 'content and conversationId are required' },
        { status: 400 }
      )
    }

    const newMessage = new Message({
      userId: session?.user.id,
      sender: 'user',
      content,
      conversationId,
      parentMessageId
    })

    await newMessage.save()

    // TODO: Generate AI response
    const aiResponse = new Message({
      userId: session?.user.id, // change to AI user ID
      sender: 'ai',
      content: 'AI response placeholder',
      conversationId,
      parentMessageId: newMessage._id
    })

    await aiResponse.save()

    return NextResponse.json(
      { userMessage: newMessage, aiMessage: aiResponse },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
