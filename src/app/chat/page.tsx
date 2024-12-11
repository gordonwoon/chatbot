'use client'
import { ConversationsList } from '@/components/ConversationList'
import { MessageInput } from '@/components/MessageInput'
import { MessageList } from '@/components/MessageList'
import { UserProfile } from '@/components/UserProfile'
import { useState } from 'react'

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    () => crypto.randomUUID()
  )

  return (
    <div className="flex h-screen">
      {/* Conversations Sidebar */}
      <div className="w-64 border-r p-4">
        <UserProfile />
        <button
          onClick={() => setSelectedConversationId(() => crypto.randomUUID())}
          className="w-full mb-4 p-2 bg-blue-500 text-white rounded"
        >
          New Chat
        </button>
        <ConversationsList
          selectedConversationId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList selectedConversationId={selectedConversationId} />
        </div>

        <MessageInput selectedConversationId={selectedConversationId} />
      </div>
    </div>
  )
}
