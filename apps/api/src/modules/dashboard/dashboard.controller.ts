import { Controller, Get } from '@nestjs/common'
import type { DashboardSnapshot } from '@zpf/shared'
import { LocalStore } from '../../store/local.store'

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly store: LocalStore) {}

  @Get()
  getDashboard(): DashboardSnapshot {
    const accounts = this.store.getAccounts()
    const upcoming = this.store
      .getPosts()
      .filter((post) => ['draft', 'pending_approval', 'scheduled', 'failed'].includes(post.status))
      .slice(0, 5)

    return {
      generatedAt: new Date().toISOString(),
      metrics: [
        { label: 'Total reach', value: accounts.reduce((sum, item) => sum + item.reach, 0), unit: 'number', delta: 18.6, detail: 'Unique accounts reached', series: [18, 22, 19, 29, 32, 38, 41, 49, 52, 64, 62, 78] },
        { label: 'Audience', value: accounts.reduce((sum, item) => sum + item.audience, 0), unit: 'number', delta: 7.4, detail: 'Followers + subscribers', series: [28, 30, 34, 35, 39, 42, 46, 49, 53, 57, 61, 66] },
        { label: 'Watch time', value: 42_600, unit: 'hours', delta: 12.3, detail: 'Across video platforms', series: [20, 28, 24, 31, 35, 33, 45, 49, 47, 56, 62, 69] },
        { label: 'Podcast plays', value: 86_200, unit: 'number', delta: -2.1, detail: 'IAB-certified downloads', series: [42, 45, 49, 47, 52, 56, 54, 58, 61, 59, 57, 55] },
      ],
      accounts,
      reachSeries: [
        { label: 'May 12', total: 90, instagram: 38, youtube: 32, tiktok: 20 },
        { label: 'May 16', total: 112, instagram: 45, youtube: 39, tiktok: 28 },
        { label: 'May 20', total: 104, instagram: 43, youtube: 37, tiktok: 24 },
        { label: 'May 24', total: 139, instagram: 57, youtube: 49, tiktok: 33 },
        { label: 'May 28', total: 151, instagram: 61, youtube: 55, tiktok: 35 },
        { label: 'Jun 1', total: 145, instagram: 59, youtube: 53, tiktok: 33 },
        { label: 'Jun 5', total: 180, instagram: 74, youtube: 66, tiktok: 40 },
        { label: 'Jun 9', total: 196, instagram: 81, youtube: 72, tiktok: 43 },
      ],
      topContent: [
        { id: 'top-1', title: 'Why most founders quit one week too early', meta: 'YouTube Short | Episode 48', metric: '428K views', lift: '4.8x baseline' },
        { id: 'top-2', title: 'The 0.5% rule nobody talks about', meta: 'Instagram Reel | Episode 47', metric: '296K reach', lift: '3.2x baseline' },
        { id: 'top-3', title: 'Building in public is not a strategy', meta: 'LinkedIn | Founder Notes', metric: '8.7% engagement', lift: '2.6x baseline' },
      ],
      latestEpisode: {
        number: 49,
        title: 'The cost of waiting',
        downloads: 18_400,
        completionPercent: 72,
        followersGained: 846,
        performancePercent: 31,
      },
      upcoming,
    }
  }
}
