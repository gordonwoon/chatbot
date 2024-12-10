'use client'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { FormEvent, useState } from 'react'

export default function Login() {
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const res = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      callbackUrl: '/chat'
    })
    if (res?.error) {
      setError(res.error as string)
    }
    if (res?.ok) {
      setError('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        {error && <div className="text-black">{error}</div>}
        <h1 className="text-2xl mb-4">Sign In</h1>
        <label className="w-full text-sm">Email</label>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          name="email"
        />
        <label className="w-full text-sm">Password</label>
        <div className="flex w-full">
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
            name="password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Sign In
        </button>

        <Link
          href="/register"
          className="text-sm text-[#888] transition duration-150 ease hover:text-black"
        >
          {`Don't have an account?`}
        </Link>
      </form>
    </div>
  )
}
