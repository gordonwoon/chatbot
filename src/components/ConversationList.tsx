import { Conversation } from '@/models/Conversation'
import { useQuery } from '@tanstack/react-query'

interface Props {
  selectedConversationId: string
  onSelect: (id: string) => void
}

export function ConversationsList({ selectedConversationId, onSelect }: Props) {
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
  if (conversationsLoading) return <div>Loading messages...</div>

  return (
    <ul>
      {conversations?.map(conv => (
        <li
          key={conv._id}
          onClick={() => onSelect(conv._id)}
          className={`p-2 cursor-pointer hover:bg-gray-100 ${
            selectedConversationId === conv._id ? 'bg-gray-200' : ''
          }`}
        >
          <div className="truncate">{conv.content}</div>
          <div className="text-xs text-gray-500">
            {new Date(conv.timestamp).toLocaleDateString()}
          </div>
        </li>
      ))}
    </ul>
  )
}
