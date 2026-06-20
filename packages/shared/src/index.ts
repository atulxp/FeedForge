export const platforms = [
  'instagram',
  'facebook',
  'linkedin',
  'x',
  'youtube',
  'tiktok',
  'threads',
] as const

export type Platform = (typeof platforms)[number]
export type PostStatus =
  | 'draft'
  | 'pending_approval'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'archived'

export type Account = {
  id: string
  platform: Platform
  displayName: string
  username: string
  status: 'active' | 'token_expired' | 'disconnected' | 'rate_limited' | 'error'
  color: string
  lastSyncAt: string
  reach: number
  audience: number
  growthPercent: number
}

export type PostTarget = {
  id: string
  accountId: string
  platform: Platform
  status: PostStatus
  text?: string
  error?: string
  retries: number
}

export type Post = {
  id: string
  title: string
  text: string
  contentType: 'text' | 'image' | 'video' | 'reel' | 'short' | 'story' | 'carousel' | 'thread' | 'clip'
  status: PostStatus
  scheduledAt?: string
  publishedAt?: string
  campaign?: string
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
  targets: PostTarget[]
}

export type CreatePostInput = {
  title: string
  text: string
  contentType: Post['contentType']
  targetAccountIds: string[]
  scheduledAt?: string
  submitForApproval?: boolean
  campaign?: string
  tags?: string[]
  notes?: string
}

export type DashboardMetric = {
  label: string
  value: number
  unit: 'number' | 'hours'
  delta: number
  detail: string
  series: number[]
}

export type ReachPoint = {
  label: string
  total: number
  instagram: number
  youtube: number
  tiktok: number
}

export type DashboardSnapshot = {
  generatedAt: string
  metrics: DashboardMetric[]
  accounts: Account[]
  reachSeries: ReachPoint[]
  topContent: Array<{
    id: string
    title: string
    meta: string
    metric: string
    lift: string
  }>
  latestEpisode: {
    number: number
    title: string
    downloads: number
    completionPercent: number
    followersGained: number
    performancePercent: number
  }
  upcoming: Post[]
}

export type LocalState = {
  accounts: Account[]
  posts: Post[]
}
