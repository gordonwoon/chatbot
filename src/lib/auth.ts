import User from '@/models/User'
import type { DefaultSession, NextAuthOptions } from 'next-auth'
import credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from './mongodb'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    credentials({
      name: 'Credentials',
      id: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        await connectDB()
        const user = await User.findOne({
          email: credentials?.email
        }).select('+password')
        if (!user) throw new Error('Wrong Email')
        const passwordMatch = await bcrypt.compare(
          credentials!.password,
          user.password
        )
        if (!passwordMatch) throw new Error('Wrong Password')
        return user
      }
    })
  ],
  pages: {
    signIn: '/signin',
    error: '/signin' // Error code passed in query string
  },
  callbacks: {
    // Add this session callback
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub // The user id is stored in token.sub by default
      }
    }),
    // Add this JWT callback to ensure ID is in the token
    jwt: ({ token, user }) => {
      if (user) {
        token.sub = user.id // Ensures user.id is stored in token.sub
      }
      return token
    }
  },
  session: {
    strategy: 'jwt'
  }
}
