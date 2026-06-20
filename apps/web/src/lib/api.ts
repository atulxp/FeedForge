import type { Account, CreatePostInput, DashboardSnapshot, Post, PostStatus } from '@zpf/shared'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => undefined) as { message?: string | string[] } | undefined
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message
    throw new Error(message ?? `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  dashboard: () => request<DashboardSnapshot>('/dashboard'),
  accounts: () => request<Account[]>('/accounts'),
  posts: () => request<Post[]>('/posts'),
  createPost: (input: CreatePostInput) => request<Post>('/posts', {
    method: 'POST',
    body: JSON.stringify(input),
  }),
  updatePostStatus: (id: string, status: PostStatus) => request<Post>(`/posts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  retryPost: (id: string) => request<Post>(`/posts/${id}/retry`, { method: 'POST' }),
}
