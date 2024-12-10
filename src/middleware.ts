// middleware.ts
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { dbConnect } from '@/lib/mongodb'

export async function middleware(request: NextRequest) {
  // 1. Check if the path should be protected
  const path = request.nextUrl.pathname

  // Public paths that don't need auth/db connection
  const publicPaths = [
    '/api/auth/signin',
    '/api/auth/signout',
    '/api/auth/session',
    '/_next',
    '/favicon.ico'
  ]

  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next()
  }

  // 2. Connect to database for API routes
  if (path.startsWith('/api')) {
    try {
      await dbConnect()
    } catch (error) {
      console.error('Database connection error:', error)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }
  }

  // 3. Check authentication
  const token = await getToken({ req: request })

  if (!token && path.startsWith('/api')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

// Configure which paths should be protected
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)'
  ]
}
