import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

interface Props {
  selectedConversationId: string
}

export function MessageInput({ selectedConversationId }: Props) {
  const [input, setInput] = useState('')
  const queryClient = useQueryClient()

  // Send message mutation
  const { mutate: sendMessage, isPending } = useMutation({
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
    }
  })
  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        if (input.trim() && !isPending) {
          setInput('') // Clear immediately on submit
          sendMessage(input.trim())
        }
      }}
      className="p-4 border-t"
    >
      <div className="relative">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isPending}
          placeholder={isPending ? 'Sending...' : 'Type your message...'}
          className={`w-full p-2 border rounded ${
            isPending ? 'bg-gray-100' : ''
          }`}
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>
    </form>
  )
}
