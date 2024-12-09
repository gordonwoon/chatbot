import mongoose, { model, Schema } from 'mongoose'

export interface MessageDocument {
  _id: string
  userId: string // ID of the user who sent/received the message
  sender: 'user' | 'ai' // Explicitly type who sent the message
  content: string
  timestamp: Date
  parentMessageId?: string // Optional reference to parent message for threading
  conversationId: string // Group messages in conversations
}

const MessageSchema = new Schema<MessageDocument>({
  userId: { type: String, required: true, index: true },
  sender: { type: String, required: true, enum: ['user', 'ai'] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  parentMessageId: { type: String, index: true },
  conversationId: { type: String, required: true, index: true }
})

// Add indexes for common queries
MessageSchema.index({ userId: 1, conversationId: 1, timestamp: -1 })

const Message =
  mongoose.models?.Message || model<MessageDocument>('Message', MessageSchema)
export default Message
