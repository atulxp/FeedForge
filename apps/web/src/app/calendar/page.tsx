'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Post, PostStatus } from '@zpf/shared'
import { ErrorState, LoadingState } from '@/components/loading-state'
import { api } from '@/lib/api'
import { dateTime, platformCode, statusLabel } from '@/lib/format'

const filters: Array<'all' | PostStatus> = ['all', 'draft', 'pending_approval', 'scheduled', 'published', 'failed']

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>()
  const [filter, setFilter] = useState<'all' | PostStatus>('all')
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState('')

  const load = useCallback(async () => {
    setError('')
    try { setPosts(await api.posts()) } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unknown error')
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const visiblePosts = useMemo(
    () => posts?.filter((post) => filter === 'all' || post.status === filter) ?? [],
    [filter, posts],
  )

  async function act(post: Post, action: 'approve' | 'archive' | 'retry') {
    setWorkingId(post.id)
    setError('')
    try {
      if (action === 'retry') await api.retryPost(post.id)
      if (action === 'approve') await api.updatePostStatus(post.id, post.scheduledAt ? 'scheduled' : 'draft')
      if (action === 'archive') await api.updatePostStatus(post.id, 'archived')
      await load()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Action failed')
    } finally {
      setWorkingId('')
    }
  }

  return (
    <div className="content">
      <div className="page-heading">
        <div><p className="eyebrow">Publishing calendar</p><h1>Plan, ship, recover.</h1><p>Every draft, approval, scheduled post, and failure in one operational view.</p></div>
        <Link className="primary-button" href="/content/new">+ Create content</Link>
      </div>

      <div className="filter-bar">
        {filters.map((item) => <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item === 'all' ? 'All posts' : statusLabel(item)}</button>)}
      </div>

      {error ? <ErrorState message={error} retry={load} /> : null}
      {!posts && !error ? <LoadingState label="Loading publishing calendar..." /> : null}
      {posts ? (
        <section className="calendar-list">
          {visiblePosts.length === 0 ? <div className="empty-state">No posts match this filter.</div> : null}
          {visiblePosts.map((post) => (
            <article className={`calendar-card ${post.status}`} key={post.id}>
              <div className="calendar-date"><strong>{post.scheduledAt ? new Date(post.scheduledAt).getDate() : '--'}</strong><small>{post.scheduledAt ? new Date(post.scheduledAt).toLocaleString('en', { month: 'short' }) : 'Draft'}</small></div>
              <div className="calendar-copy">
                <div><b className={`state ${post.status}`}>{statusLabel(post.status)}</b><span>{dateTime(post.scheduledAt)}</span></div>
                <h2>{post.title}</h2>
                <p>{post.text}</p>
                <div className="target-codes">{post.targets.map((target) => <i key={target.id}>{platformCode(target.platform)}</i>)}</div>
                {post.targets.find((target) => target.error) ? <div className="failure-detail">{post.targets.find((target) => target.error)?.error}</div> : null}
              </div>
              <div className="calendar-actions">
                {post.status === 'pending_approval' ? <button disabled={workingId === post.id} onClick={() => void act(post, 'approve')}>Approve</button> : null}
                {post.status === 'failed' ? <button disabled={workingId === post.id} onClick={() => void act(post, 'retry')}>Retry</button> : null}
                {post.status !== 'archived' ? <button className="quiet" disabled={workingId === post.id} onClick={() => void act(post, 'archive')}>Archive</button> : null}
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  )
}
