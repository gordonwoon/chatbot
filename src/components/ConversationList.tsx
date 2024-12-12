import { Conversation } from '@/models/Conversation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface Props {
  selectedConversationId: string
  onSelect: (id: string) => void
}

export function ConversationsList({ selectedConversationId, onSelect }: Props) {
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
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/conversations?id=${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete conversation')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }
  })
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent conversation selection
    if (confirm('Delete this conversation?')) {
      await deleteMutation.mutateAsync(id)
      if (id === selectedConversationId) {
        onSelect(crypto.randomUUID()) // Create new conversation if deleted selected one
      }
    }
  }
  if (conversationsLoading) return <div>Loading messages...</div>

  return (
    <ul className="overflow-y-auto flex-1 -mx-4 px-4">
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
          <button
            onClick={e => handleDelete(e, conv._id)}
            className="text-xs text-red-600"
          >
            delete
          </button>
        </li>
      ))}
    </ul>
  )
}
