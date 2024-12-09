// src/middleware/auth.ts
import { getServerSession, User } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export class AuthError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'AuthError'
  }
}

export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new AuthError()
  }

  return session.user
}

type ApiHandler<T> = (req: Request, user: User) => Promise<T>

export function withAuth<T>(handler: ApiHandler<T>) {
  return async (req: Request) => {
    try {
      const user = await requireAuth()
      return handler(req, user)
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    }
  }
}
