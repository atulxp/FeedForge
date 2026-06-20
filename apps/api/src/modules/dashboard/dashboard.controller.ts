import { Controller, Get, Query, Req } from '@nestjs/common'
import type { DashboardSnapshot } from '@zpf/shared'
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

    return {
      generatedAt: new Date().toISOString(),
      range: { from: fromIso, to: toIso, days: rangeDays },
      metrics: [
        { label: 'YouTube views', value: youtube.views, unit: 'number', delta: percentChange(youtube.views, previousYoutube.views), detail: 'Selected-range YouTube Analytics views', series: compactSeries(youtube.series.map((point) => point.views)) },
        { label: 'Watch time', value: Math.round(youtube.watchMinutes / 60), unit: 'hours', delta: percentChange(youtube.watchMinutes, previousYoutube.watchMinutes), detail: 'Selected-range YouTube watch hours', series: compactSeries(youtube.series.map((point) => point.views)) },
        { label: 'Subscribers gained', value: youtube.subscribersGained, unit: 'number', delta: percentChange(youtube.subscribersGained, previousYoutube.subscribersGained), detail: 'Net subscribers gained in selected range', series: compactSeries(youtube.series.map((point) => point.views)) },
        { label: 'Published posts', value: publishedPosts.length, unit: 'number', delta: 0, detail: 'Posts published in selected range', series: postCountSeries(publishedPosts, from, to) },
      ],
      accounts,
      reachSeries: buildReachSeries(youtube.series),
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

function buildReachSeries(series: Array<{ date: string; views: number }>) {
  const values = compactDateSeries(series)
  return values.map((point) => {
    const total = point.views
    return {
      label: new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${point.date}T00:00:00.000Z`)),
      total,
      instagram: 0,
      youtube: total,
      tiktok: 0,
    }
  })
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
