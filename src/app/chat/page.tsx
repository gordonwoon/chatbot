'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageDocument } from '@/models/Message'

type Conversation = {
  _id: string
  lastMessage: string
  updatedAt: string
}

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const queryClient = useQueryClient()

  // Fetch conversations
  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: () => fetch('/api/conversations').then(res => res.json())
  })

  // Fetch messages for selected conversation
  const {
    data: messages,
    isPending,
    error
  } = useQuery<MessageDocument[]>({
    queryKey: ['messages', selectedConversationId],
    queryFn: () =>
      selectedConversationId
        ? fetch(`/api/messages?conversationId=${selectedConversationId}`).then(
            res => res.json()
          )
        : Promise.resolve([]),
    enabled: !!selectedConversationId
  })

  // Send message mutation
  const { mutate: sendMessage } = useMutation({
    mutationFn: (content: string) =>
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          conversationId: selectedConversationId || crypto.randomUUID()
        })
      }).then(res => res.json()),
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
          {isPending ? (
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
