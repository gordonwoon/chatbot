import { MessageDocument } from '@/models/Message'
import { useQuery } from '@tanstack/react-query'

interface Props {
  selectedConversationId: string
}

export function MessageList({ selectedConversationId }: Props) {
  // Fetch messages for selected conversation
  const {
    data: messages = [],
    isPending: messagesLoading,
    error
  } = useQuery<MessageDocument[]>({
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

  if (messagesLoading) return <div>Loading messages...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul className="space-y-2">
      {messages?.map(msg => (
        <li key={msg._id} className="p-2 bg-gray-50 rounded">
          {msg.content}
        </li>
      ))}
    </ul>
  )
}
