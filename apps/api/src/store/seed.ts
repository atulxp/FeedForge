import type { LocalState, Platform, Post, PostStatus } from '@zpf/shared'

const now = new Date()
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString()
const daysFromNow = (days: number, hour: number) => {
  const date = new Date(now)
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

const account = (
  id: string,
  platform: Platform,
  displayName: string,
  username: string,
  color: string,
  reach: number,
  audience: number,
  growthPercent: number,
  freshnessHours: number,
) => ({
  id,
  platform,
  displayName,
  username,
  color,
  reach,
  audience,
  growthPercent,
  status: 'active' as const,
  lastSyncAt: hoursAgo(freshnessHours),
})

function makePost(
  id: string,
  title: string,
  text: string,
  status: PostStatus,
  scheduledAt: string | undefined,
  targets: Array<[string, Platform]>,
): Post {
  return {
    id,
    title,
    text,
    status,
    contentType: 'clip',
    scheduledAt,
    campaign: 'Episode 49',
    tags: ['founder', 'podcast'],
    createdAt: hoursAgo(18),
    updatedAt: hoursAgo(2),
    targets: targets.map(([accountId, platform], index) => ({
      id: `${id}-target-${index + 1}`,
      accountId,
      platform,
      status,
      retries: 0,
    })),
  }
}

export function createSeedState(): LocalState {
  return {
    accounts: [
      account('acc-instagram', 'instagram', 'Instagram', '@zeropointfive', '#e85d92', 842_000, 118_400, 12.8, 4),
      account('acc-youtube', 'youtube', 'YouTube', 'Zero Point Five', '#ef4444', 621_000, 82_600, 21.4, 2),
      account('acc-tiktok', 'tiktok', 'TikTok', '@zeropointfive', '#111827', 298_000, 39_200, 8.2, 7),
      account('acc-linkedin', 'linkedin', 'LinkedIn', 'Zero Point Five Show', '#2563eb', 79_000, 8_700, 3.7, 11),
      account('acc-threads', 'threads', 'Threads', '@zeropointfive', '#4b5563', 34_000, 4_200, 5.1, 9),
      account('acc-facebook', 'facebook', 'Facebook', 'Zero Point Five Show', '#1877f2', 28_000, 5_800, 1.9, 12),
    ],
    posts: [
      makePost(
        'post-launch-clip',
        'Episode 49 launch clip',
        'The cost of waiting is rarely visible until the opportunity has moved on.',
        'scheduled',
        daysFromNow(0, 19),
        [['acc-instagram', 'instagram'], ['acc-youtube', 'youtube'], ['acc-tiktok', 'tiktok']],
      ),
      makePost(
        'post-launch-lessons',
        'Three lessons from a failed launch',
        'A failed launch can be expensive. Refusing to learn from it costs more.',
        'pending_approval',
        daysFromNow(1, 10),
        [['acc-linkedin', 'linkedin'], ['acc-threads', 'threads']],
      ),
      makePost(
        'post-quote-carousel',
        'Episode 49 quote carousel',
        'Five lines worth keeping from our conversation about momentum.',
        'draft',
        daysFromNow(3, 18),
        [['acc-instagram', 'instagram'], ['acc-facebook', 'facebook']],
      ),
      {
        ...makePost(
          'post-failed',
          'The hidden cost of perfect timing',
          'Perfect timing is usually a story we tell after somebody acted.',
          'failed',
          hoursAgo(6),
          [['acc-instagram', 'instagram']],
        ),
        targets: [{
          id: 'post-failed-target-1',
          accountId: 'acc-instagram',
          platform: 'instagram',
          status: 'failed',
          error: 'Development simulation: media processing timed out.',
          retries: 2,
        }],
      },
    ],
  }
}
