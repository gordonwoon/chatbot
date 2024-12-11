import { signOut, useSession } from 'next-auth/react'

export function UserProfile() {
  const { data: session } = useSession()
  return (
    <div className="mb-4">
      <span className="text-sm text-gray-600">
        Signed in as: {session?.user.email}
      </span>
      <button
        onClick={() => signOut()}
        className="w-full mt-2 p-2 bg-red-500 text-white rounded text-sm"
      >
        Sign Out
      </button>
    </div>
  )
}
