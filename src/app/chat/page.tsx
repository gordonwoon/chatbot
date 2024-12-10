'use client'
import { MessageDocument } from '@/models/Message'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

interface Conversation {
  _id: string
  lastMessage: string
  updatedAt: string
}

interface Message {
  _id: string
  content: string
  sender: 'user' | 'assistant'
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [input, setInput] = useState('')
  const queryClient = useQueryClient()

  // Fetch conversations with proper type
  const { data: conversations = [], isPending: conversationsLoading } =
    useQuery<Conversation[]>({
      queryKey: ['conversations'],
      queryFn: async () => {
        const res = await fetch('/api/conversations')
        if (!res.ok) throw new Error('Failed to fetch conversations')
        return res.json()
      }
    })

  // Fetch messages for selected conversation
  const {
    data: messages = [],
    isPending: messagesLoading,
    error
  } = useQuery<Message[]>({
    queryKey: ['messages', selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return []
      const res = await fetch(
        `/api/messages?conversationId=${selectedConversationId}`
      )
      if (!res.ok) throw new Error('Failed to fetch messages')
      return res.json()
    },
    enabled: !!selectedConversationId
  })

  // Send message mutation
  const { mutate: sendMessage } = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          conversationId: selectedConversationId
        })
      })
      if (!res.ok) throw new Error('Failed to send message')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['messages', selectedConversationId]
      })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      setInput('')
    }
  })
  return (
    <div className="flex h-screen">
      {/* Conversations Sidebar */}
      <div className="w-64 border-r p-4">
        <div className="mb-4">
          <span className="text-sm text-gray-600">
            Signed in as: {session?.user?.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="w-full mt-2 p-2 bg-red-500 text-white rounded text-sm"
          >
            Sign Out
          </button>
        </div>
        <button
          onClick={() => setSelectedConversationId(null)}
          className="w-full mb-4 p-2 bg-blue-500 text-white rounded"
        >
          New Chat
        </button>
        <ul>
          {conversations?.map(conv => (
            <li
              key={conv._id}
              onClick={() => setSelectedConversationId(conv._id)}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                selectedConversationId === conv._id ? 'bg-gray-200' : ''
              }`}
            >
              <div className="truncate">{conv.lastMessage}</div>
              <div className="text-xs text-gray-500">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messagesLoading ? (
            <div>Loading messages...</div>
          ) : error ? (
            <div>Error: {error.message}</div>
          ) : (
            <ul className="space-y-2">
              {messages?.map(msg => (
                <li key={msg._id} className="p-2 bg-gray-50 rounded">
                  {msg.content}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          onSubmit={e => {
            e.preventDefault()
            if (input.trim()) sendMessage(input)
          }}
          className="p-4 border-t"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full p-2 border rounded"
          />
        </form>
      </div>
    </div>
  )
}
