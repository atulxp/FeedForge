'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Account, CreatePostInput, Post } from '@zpf/shared'
import { api } from '@/lib/api'
import { platformCode, platformLabel } from '@/lib/format'

const contentTypes: Array<Post['contentType']> = ['clip', 'reel', 'short', 'video', 'image', 'carousel', 'thread', 'text']

export default function NewContentPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [contentType, setContentType] = useState<Post['contentType']>('clip')
  const [scheduledAt, setScheduledAt] = useState('')
  const [campaign, setCampaign] = useState('Episode 49')
  const [submitForApproval, setSubmitForApproval] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.accounts()
      .then((result) => {
        setAccounts(result)
        setSelected(result.slice(0, 3).map((account) => account.id))
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not load accounts'))
  }, [])

  const selectedAccounts = useMemo(
    () => accounts.filter((account) => selected.includes(account.id)),
    [accounts, selected],
  )
  const threadsSelected = selectedAccounts.some((account) => account.platform === 'threads')
  const instagramTextOnly = contentType === 'text' && selectedAccounts.some((account) => account.platform === 'instagram')

  function toggleAccount(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSaving(true)

    const input: CreatePostInput = {
      title,
      text,
      contentType,
      targetAccountIds: selected,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      submitForApproval,
      campaign,
      tags: ['local', 'episode-49'],
    }

    try {
      await api.createPost(input)
      router.push('/calendar')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save post')
      setSaving(false)
    }
  }

  return (
    <div className="content">
      <div className="page-heading">
        <div><p className="eyebrow">Multi-platform composer</p><h1>Create content</h1><p>Write once, choose targets, and schedule with platform rules enforced.</p></div>
      </div>

      <form className="composer-grid" onSubmit={submit}>
        <section className="panel form-panel">
          <label>Internal title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Episode 49 launch clip" required /></label>
          <div className="form-split">
            <label>Content type<select value={contentType} onChange={(event) => setContentType(event.target.value as Post['contentType'])}>{contentTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label>Campaign<input value={campaign} onChange={(event) => setCampaign(event.target.value)} /></label>
          </div>
          <label>Post copy<textarea value={text} onChange={(event) => setText(event.target.value)} rows={9} maxLength={threadsSelected ? 500 : undefined} placeholder="Write the master copy for this post..." required /></label>
          <div className="counter">{text.length}{threadsSelected ? ' / 500 for Threads' : ' characters'}</div>
          <label>Schedule<input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} /></label>
          <label className="check-line"><input type="checkbox" checked={submitForApproval} onChange={(event) => setSubmitForApproval(event.target.checked)} />Submit to approval queue</label>
          {instagramTextOnly ? <div className="validation-message">Instagram cannot receive a text-only post. Choose another format or remove Instagram.</div> : null}
          {error ? <div className="validation-message">{error}</div> : null}
          <div className="form-actions">
            <button className="secondary-button" type="button" onClick={() => router.push('/content')}>Cancel</button>
            <button className="primary-button" disabled={saving || instagramTextOnly} type="submit">{saving ? 'Saving...' : submitForApproval ? 'Submit for approval' : scheduledAt ? 'Schedule post' : 'Save draft'}</button>
          </div>
        </section>

        <aside className="panel target-panel">
          <p className="eyebrow">Target accounts</p>
          <h2>{selected.length} selected</h2>
          <div className="account-picker">
            {accounts.map((account) => (
              <label className={selected.includes(account.id) ? 'selected' : ''} key={account.id}>
                <input type="checkbox" checked={selected.includes(account.id)} onChange={() => toggleAccount(account.id)} />
                <span className="platform-icon" style={{ background: account.color }}>{platformCode(account.platform)}</span>
                <span><strong>{platformLabel(account.platform)}</strong><small>{account.username}</small></span>
              </label>
            ))}
          </div>
          <div className="preview-card">
            <small>Live preview</small>
            <strong>{title || 'Your post title'}</strong>
            <p>{text || 'Your post copy will appear here as you write.'}</p>
            <span>{selectedAccounts.map((account) => platformCode(account.platform)).join(' | ') || 'Choose a target'}</span>
          </div>
        </aside>
      </form>
    </div>
  )
}
