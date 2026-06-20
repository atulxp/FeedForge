'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import type { DashboardSnapshot } from '@zpf/shared'
import { ErrorState, LoadingState } from '@/components/loading-state'
import { ReachChart } from '@/components/reach-chart'
import { Sparkline } from '@/components/sparkline'
import { api } from '@/lib/api'
import { compactNumber, platformCode, relativeTime, statusLabel } from '@/lib/format'

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardSnapshot>()
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      setDashboard(await api.dashboard())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unknown error')
    }
  }, [])

  useEffect(() => { void load() }, [load])

  if (error) return <div className="content"><ErrorState message={error} retry={load} /></div>
  if (!dashboard) return <div className="content"><LoadingState label="Loading command center..." /></div>

  const episode = dashboard.latestEpisode

  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }).format(new Date())}</p>
          <h1>Your brand, at a glance.</h1>
          <p>Performance across every channel for the last 28 days.</p>
        </div>
        <div className="date-filter"><button className="active">28 days</button><button>90 days</button><button>Custom</button></div>
      </div>

      <section className="metric-grid" aria-label="Executive metrics">
        {dashboard.metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <div className="metric-label">{metric.label}<button aria-label={`About ${metric.label}`}>i</button></div>
            <div className="metric-value-row">
              <strong>{compactNumber(metric.value)}{metric.unit === 'hours' ? ' hrs' : ''}</strong>
              <Sparkline values={metric.series} negative={metric.delta < 0} />
            </div>
            <div className="metric-footer">
              <span className={metric.delta < 0 ? 'down' : 'up'}>{metric.delta > 0 ? '+' : '-'} {Math.abs(metric.delta)}%</span>
              <small>{metric.detail}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="platform-grid" aria-label="Platform performance">
        {dashboard.accounts.slice(0, 4).map((account) => (
          <article className="platform-card" key={account.id}>
            <div className="platform-head">
              <span className="platform-icon" style={{ background: account.color }}>{platformCode(account.platform)}</span>
              <span><strong>{account.displayName}</strong><small>{account.username}</small></span>
              <Link href="/settings" aria-label={`Open ${account.displayName}`}>+</Link>
            </div>
            <div className="platform-numbers">
              <span><small>Reach</small><strong>{compactNumber(account.reach)}</strong></span>
              <span><small>Growth</small><strong className="positive">+{account.growthPercent}%</strong></span>
            </div>
            <div className="freshness"><i /> Synced {relativeTime(account.lastSyncAt)}</div>
          </article>
        ))}
      </section>

      <section className="main-grid">
        <article className="panel reach-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">Momentum</p><h2>Daily reach</h2></div>
            <div className="legend"><span className="ig">Instagram</span><span className="yt">YouTube</span><span className="tt">TikTok</span></div>
          </div>
          <ReachChart reachSeries={dashboard.reachSeries} />
        </article>

        <article className="panel podcast-panel">
          <div className="panel-heading"><div><p className="eyebrow">Latest episode</p><h2>{episode.title}</h2></div></div>
          <div className="episode-art"><span>{episode.number}</span><strong>ZERO<br />POINT<br />FIVE</strong></div>
          <div className="episode-stats">
            <span><strong>{compactNumber(episode.downloads)}</strong><small>Downloads</small></span>
            <span><strong>{episode.completionPercent}%</strong><small>Completion</small></span>
            <span><strong>+{compactNumber(episode.followersGained)}</strong><small>Followers</small></span>
          </div>
          <div className="completion"><span style={{ width: `${episode.completionPercent}%` }} /></div>
          <p>Performing <strong>{episode.performancePercent}% above</strong> the 10-episode average.</p>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel">
          <div className="panel-heading"><div><p className="eyebrow">What worked</p><h2>Top content</h2></div><Link href="/analytics">View analytics -&gt;</Link></div>
          <div className="content-list">
            {dashboard.topContent.map((item, index) => (
              <div className="content-row" key={item.id}>
                <span className="rank">{String(index + 1).padStart(2, '0')}</span>
                <span className="content-title"><strong>{item.title}</strong><small>{item.meta}</small></span>
                <span className="content-metric"><strong>{item.metric}</strong><small>{item.lift}</small></span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading"><div><p className="eyebrow">Publishing</p><h2>Coming up</h2></div><Link href="/calendar">Open calendar -&gt;</Link></div>
          <div className="upcoming-list">
            {dashboard.upcoming.slice(0, 4).map((post) => (
              <div className="upcoming-row" key={post.id}>
                <span className={`state-dot ${post.status}`} />
                <span>
                  <small>{post.scheduledAt ? new Date(post.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unscheduled'}</small>
                  <strong>{post.title}</strong>
                  <em>{post.targets.map((target) => platformCode(target.platform)).join(' | ')}</em>
                </span>
                <b className={`state ${post.status}`}>{statusLabel(post.status)}</b>
              </div>
            ))}
          </div>
        </article>
      </section>

      <footer><span><i /> Local API connected</span><span>Generated {relativeTime(dashboard.generatedAt)}</span></footer>
    </div>
  )
}
