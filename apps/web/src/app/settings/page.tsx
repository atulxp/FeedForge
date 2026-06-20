'use client'

import { useEffect, useState } from 'react'
import type { Account } from '@zpf/shared'
import { api } from '@/lib/api'
import { platformCode, platformLabel, relativeTime } from '@/lib/format'

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  useEffect(() => { void api.accounts().then(setAccounts) }, [])

  return (
    <div className="content">
      <div className="page-heading"><div><p className="eyebrow">Workspace settings</p><h1>Connected channels</h1><p>Local development accounts model OAuth connections until real platform credentials are configured.</p></div></div>
      <section className="settings-grid">
        {accounts.map((account) => (
          <article className="panel settings-card" key={account.id}>
            <span className="platform-icon" style={{ background: account.color }}>{platformCode(account.platform)}</span>
            <span><strong>{platformLabel(account.platform)}</strong><small>{account.username}</small></span>
            <b>{account.status}</b>
            <small>Synced {relativeTime(account.lastSyncAt)}</small>
          </article>
        ))}
      </section>
    </div>
  )
}
