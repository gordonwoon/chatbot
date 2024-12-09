'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageDocument } from '@/models/Message'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [conversationId] = useState(() =>
    // Generate a UUID for new conversation or get from URL
    crypto.randomUUID()
  )
  const queryClient = useQueryClient()

  // Fetch messages for current conversation
  const {
    data: messages,
    isPending,
    error
  } = useQuery<MessageDocument[]>({
    queryKey: ['messages', conversationId],
    queryFn: () =>
      fetch(`/api/messages?conversationId=${conversationId}`).then(res =>
        res.json()
      )
  })

  // Send message mutation
  const { mutate: sendMessage } = useMutation({
    mutationFn: (content: string) =>
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          conversationId
        })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      setInput('')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
    }
  }

  if (isPending) return <div>Loading messages...</div>
  if (error) return <div>Error loading messages: {error.message}</div>

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat with our AI</h1>

      <div className="bg-gray-50 rounded-lg p-4 mb-4 h-[600px] overflow-y-auto">
        {messages?.map(message => (
          <div
            key={message._id}
            className={`mb-4 ${
              message.sender === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={!input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  )
}
