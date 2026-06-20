'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'

export default function SignupPage() {
  const router = useRouter()
  const { refresh } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (password.length < 8) return setError('Use at least 8 characters')
    try {
      await api.signup({ name, email, password })
      await refresh()
      router.replace('/')
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : 'Signup failed')
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="brand-mark">FF</span>
        <p className="eyebrow">New workspace</p>
        <h1>Create your account.</h1>
        <p>Your accounts, posts, tokens, analytics, and reports remain scoped to this FeedForge user.</p>
        <label>Name<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error ? <div className="validation-message">{error}</div> : null}
        <button className="primary-button" type="submit">Create workspace</button>
        <Link href="/login">Already have an account?</Link>
      </form>
    </main>
  )
}
