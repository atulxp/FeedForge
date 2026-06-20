'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'

export default function LoginPage() {
  const router = useRouter()
  const { refresh } = useAuth()
  const [email, setEmail] = useState('founder@zeropointfive.local')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    try {
      await api.login({ email, password })
      await refresh()
      router.replace('/')
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed')
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="brand-mark">FF</span>
        <p className="eyebrow">FeedForge</p>
        <h1>Welcome back.</h1>
        <p>Sign in to your isolated FeedForge workspace.</p>
        <label>Email<input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} required /></label>
        <label>Password
          <span className="password-field">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} required />
            <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button>
          </span>
        </label>
        {error ? <div className="validation-message">{error}</div> : null}
        <button className="primary-button" type="submit">Sign in</button>
        <small>Local demo: founder@zeropointfive.local / password123</small>
        <Link href="/signup">Create a new workspace</Link>
      </form>
    </main>
  )
}
