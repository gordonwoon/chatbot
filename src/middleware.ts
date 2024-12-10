// middleware.ts
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export const config = {
  matcher: [
    // Protected chat page
    '/chat/:path*',
    // Protected API routes except auth
    '/api/((?!auth).)*'
  ]
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Redirect to login for non-API routes
    const loginUrl = new URL('/api/auth/signin', request.url)
    loginUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
