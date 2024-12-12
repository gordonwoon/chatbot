import { signOut, useSession } from 'next-auth/react'
import Loader from './Loader'
import { useState } from 'react'

export function UserProfile() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const handleSignOut = async () => {
    setLoading(true)
    await signOut()
    setLoading(false)
  }
  return (
    <div className="mb-4">
      <span className="text-sm text-gray-600">
        Signed in as: {session?.user.email}
      </span>
      <button
        onClick={handleSignOut}
        className="w-full mt-2 p-2 bg-red-500 text-white rounded text-sm"
        disabled={loading}
      >
        {loading ? <Loader /> : 'Sign Out'}
      </button>
    </div>
  )
}
