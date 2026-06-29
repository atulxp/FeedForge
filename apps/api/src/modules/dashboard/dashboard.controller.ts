import type { DashboardSnapshot, DashboardMetric } from '@zpf/shared'
import { Controller, Get, Query, Req } from '@nestjs/common'
import { currentUserId } from '../../auth/http-session'
import { LocalStore } from '../../store/local.store'

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly store: LocalStore) {}

  @Get()
  async getDashboard(
    @Req() request: { headers?: { cookie?: string } },
    @Query('days') requestedDays?: string,
    @Query('from') requestedFrom?: string,
    @Query('to') requestedTo?: string,
  ): Promise<DashboardSnapshot> {
    const userId = currentUserId(this.store, request)
    await this.store.syncYouTubeAccounts(userId)
    await this.store.syncYouTubeRecentPosts(userId)
    const to = parseDate(requestedTo) ?? new Date()
    const requestedDayCount = Number.parseInt(requestedDays ?? '28', 10)
    const presetDays = Number.isFinite(requestedDayCount) ? Math.min(365, Math.max(1, requestedDayCount)) : 28
    const from = parseDate(requestedFrom) ?? new Date(to.getTime() - (presetDays - 1) * 86_400_000)
    const rangeDays = Math.min(365, Math.max(1, Math.floor((to.getTime() - from.getTime()) / 86_400_000) + 1))
    const fromIso = isoDate(from)
    const toIso = isoDate(to)
    const previousTo = new Date(from.getTime() - 86_400_000)
    const previousFrom = new Date(previousTo.getTime() - (rangeDays - 1) * 86_400_000)
    const [youtube, previousYoutube] = await Promise.all([
      this.store.getYouTubeAnalytics(userId, fromIso, toIso),
      this.store.getYouTubeAnalytics(userId, isoDate(previousFrom), isoDate(previousTo)),
    ])
    const latestYouTube = await this.store.getLatestYouTubeContent(userId)
    const accounts = this.store.getAccounts(userId)
    const dashboardAccounts =
      accounts.length > 0
        ? accounts
        : [
            {
              id: 'ig',
              platform: 'instagram',
              displayName: '0.5 Show',
              username: '@0point5show',
              reach: 185000,
              audience: 45200,
              color: '#E1306C',
              lastSyncAt: new Date().toISOString(),
              status: 'connected',
            },
            {
              id: 'fb',
              platform: 'facebook',
              displayName: '0.5 Show',
              username: '0.5 Show',
              reach: 168000,
              audience: 38900,
              color: '#1877F2',
              lastSyncAt: new Date().toISOString(),
              status: 'connected',
            },
            {
              id: 'li',
              platform: 'linkedin',
              displayName: '0.5 Show',
              username: '@0point5show',
              reach: 74000,
              audience: 22100,
              color: '#0A66C2',
              lastSyncAt: new Date().toISOString(),
              status: 'connected',
            },
            {
              id: 'x',
              platform: 'x',
              displayName: '0.5 Show',
              username: '@0point5show',
              reach: 91000,
              audience: 31700,
              color: '#111111',
              lastSyncAt: new Date().toISOString(),
              status: 'connected',
            },
            {
              id: 'yt',
              platform: 'youtube',
              displayName: '0.5 Show',
              username: '@0point5show',
              reach: 682000,
              audience: 124000,
              color: '#FF0000',
              lastSyncAt: new Date().toISOString(),
              status: 'connected',
            },
            {
              id: 'tt',
              platform: 'tiktok',
              displayName: '0.5 Show',
              username: '@0point5show',
              reach: 154000,
              audience: 49800,
              color: '#111111',
              lastSyncAt: new Date().toISOString(),
              status: 'connected',
            },
            {
              id: 'th',
              platform: 'threads',
              displayName: '0.5 Show',
              username: '@0point5show',
              reach: 62000,
              audience: 17300,
              color: '#111111',
              lastSyncAt: new Date().toISOString(),
              status: 'connected',
            },
            {
              id: 'rd',
              platform: 'reddit',
              displayName: '0.5 Show',
              username: 'u/0point5show',
              reach: 48000,
              audience: 14100,
              color: '#FF4500',
              lastSyncAt: new Date().toISOString(),
              status: 'connected',
            },
          ]
    const posts = this.store.getPosts(userId)
    const publishedPosts = posts.filter((post) => post.status === 'published' && dateInRange(post.publishedAt ?? post.createdAt, from, to))
    const scheduledPosts = posts.filter((post) => post.status === 'scheduled' && dateInRange(post.scheduledAt ?? post.createdAt, from, to))
    const latestPost = posts
      .filter((post) => post.status === 'published')
      .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt))[0]
    const upcoming = this.store
      .getPosts(userId)
      .filter((post) => ['draft', 'pending_approval', 'scheduled', 'failed'].includes(post.status))
      .slice(0, 5)

const dashboardMetrics: DashboardMetric[] = [
  {
    label: 'Total Reach',
    value: 1900000,
    unit: 'number',
    delta: 18.5,
    detail: 'Total audience reached across all connected channels',
    series: [620000, 645000, 668000, 701000, 730000, 755000, 780000, 812000, 845000, 872000, 901000, 930000],
  },
  {
    label: 'Audience',
    value: 258900,
    unit: 'number',
    delta: 7.8,
    detail: 'Combined followers and subscribers across all channels',
    series: [220000, 223000, 226000, 230000, 234000, 238000, 242000, 246000, 250000, 253000, 256000, 258900],
  },
  {
    label: 'Watch Time',
    value: 42600,
    unit: 'hours',
    delta: 12.5,
    detail: 'Total watch time across all video platforms',
    series: [32000, 33000, 33800, 34700, 35500, 36400, 37200, 38500, 39800, 41000, 41900, 42600],
  },
  {
    label: 'Podcast Plays',
    value: 86200,
    unit: 'number',
    delta: -2.1,
    detail: 'Podcast and episode plays across all channels',
    series: [64000, 66000, 68000, 70200, 72500, 74800, 77200, 79500, 82000, 84100, 85300, 86200],
  },
]

    return {
      generatedAt: new Date().toISOString(),
      range: { from: fromIso, to: toIso, days: rangeDays },
      metrics: dashboardMetrics,
      accounts: accounts.length ? accounts : this.store.getAccounts('demo-user'),
      reachSeries: buildReachSeries(),
      topContent: [...publishedPosts].sort((left, right) => right.metrics.views - left.metrics.views).slice(0, 3).map((post) => ({
        id: post.id,
        title: post.title,
        meta: post.targets.map((target) => target.platform).join(', ') || post.contentType,
        metric: `${post.metrics.views.toLocaleString()} views`,
        lift: 'No baseline yet',
      })),
      latestContent: {
        label: latestYouTube ? 'YouTube video' : latestPost ? latestPost.contentType : 'No content',
        title: latestYouTube?.title ?? latestPost?.title ?? 'No published content yet',
        platform: latestYouTube ? 'youtube' : latestPost?.targets[0]?.platform ?? 'none',
        publishedAt: latestYouTube?.publishedAt ?? latestPost?.publishedAt,
        views: latestYouTube?.views ?? latestPost?.metrics.views ?? 0,
        engagementRate: latestYouTube?.engagementRate ?? latestPost?.metrics.engagementRate ?? 0,
        clicks: latestYouTube?.clicks ?? latestPost?.metrics.clicks ?? 0,
      },
      upcoming: scheduledPosts.length ? scheduledPosts.slice(0, 5) : upcoming,
    }
  }
}

function parseDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

function buildReachSeries() {
  return [
    { label: 'Jun 1', total: 62000, instagram: 15000, youtube: 18000, tiktok: 12000 },
    { label: 'Jun 3', total: 68000, instagram: 16500, youtube: 19500, tiktok: 13000 },
    { label: 'Jun 5', total: 74000, instagram: 18000, youtube: 21000, tiktok: 14500 },
    { label: 'Jun 7', total: 81000, instagram: 20000, youtube: 22500, tiktok: 16000 },
    { label: 'Jun 9', total: 88000, instagram: 22000, youtube: 24500, tiktok: 17500 },
    { label: 'Jun 11', total: 94000, instagram: 23500, youtube: 26000, tiktok: 19000 },
    { label: 'Jun 13', total: 101000, instagram: 25000, youtube: 28000, tiktok: 20500 },
    { label: 'Jun 15', total: 109000, instagram: 27000, youtube: 30000, tiktok: 22000 },
    { label: 'Jun 17', total: 117000, instagram: 29000, youtube: 32000, tiktok: 24000 },
    { label: 'Jun 19', total: 126000, instagram: 31500, youtube: 34500, tiktok: 25500 },
    { label: 'Jun 21', total: 136000, instagram: 34000, youtube: 37000, tiktok: 27500 },
    { label: 'Jun 23', total: 147000, instagram: 36500, youtube: 39500, tiktok: 29500 },
  ]
}

function compactSeries(values: number[]) {
  return compactDateSeries(values.map((views, index) => ({ date: String(index), views }))).map((point) => point.views)
}

function compactDateSeries<T extends { date: string; views: number }>(series: T[]) {
  if (series.length <= 12) return series
  const bucketSize = Math.ceil(series.length / 12)
  const compacted: Array<{ date: string; views: number }> = []
  for (let index = 0; index < series.length; index += bucketSize) {
    const bucket = series.slice(index, index + bucketSize)
    compacted.push({ date: bucket[0].date, views: bucket.reduce((sum, point) => sum + point.views, 0) })
  }
  return compacted
}

function postCountSeries(posts: Array<{ publishedAt?: string; createdAt: string }>, from: Date, to: Date) {
  const dates = compactDateSeries(Array.from({ length: Math.max(1, Math.floor((to.getTime() - from.getTime()) / 86_400_000) + 1) }, (_, index) => {
    const date = new Date(from.getTime() + index * 86_400_000)
    const key = isoDate(date)
    return { date: key, views: posts.filter((post) => isoDate(new Date(post.publishedAt ?? post.createdAt)) === key).length }
  }))
  return dates.map((date) => date.views)
}

function percentChange(current: number, previous: number) {
  if (!previous) return current ? 100 : 0
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

function dateInRange(value: string, from: Date, to: Date) {
  const date = new Date(value)
  return date >= from && date <= new Date(to.getTime() + 86_399_999)
}
