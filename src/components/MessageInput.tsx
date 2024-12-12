import { MessageDocument } from '@/models/Message'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Loader from './Loader'

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
    onMutate: async newContent => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: ['messages', selectedConversationId]
      })

      // Get current messages
      const previousMessages = queryClient.getQueryData([
        'messages',
        selectedConversationId
      ])

      // Optimistically update the messages list
      queryClient.setQueryData(
        ['messages', selectedConversationId],
        (old: MessageDocument[]) => {
          const optimisticMessage = {
            _id: 'temp-' + Date.now(),
            content: newContent,
            sender: 'user',
            conversationId: selectedConversationId,
            timestamp: new Date()
          }
          return [...(old || []), optimisticMessage]
        }
      )

      return { previousMessages }
    },
    onError: (err, newContent, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['messages', selectedConversationId],
        context?.previousMessages
      )
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
            <Loader />
          </div>
        )}
      </div>
    </form>
  )
}
