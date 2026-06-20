import { Injectable, OnModuleInit } from '@nestjs/common'
import type { CreatePostInput, LocalState, Post, PostStatus } from '@zpf/shared'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { createSeedState } from './seed'

@Injectable()
export class LocalStore implements OnModuleInit {
  private readonly filePath = resolve(process.cwd(), 'data', 'local-state.json')
  private state: LocalState = createSeedState()

  async onModuleInit() {
    await mkdir(dirname(this.filePath), { recursive: true })

    try {
      this.state = JSON.parse(await readFile(this.filePath, 'utf8')) as LocalState
    } catch {
      await this.persist()
    }
  }

  getAccounts() {
    return structuredClone(this.state.accounts)
  }

  getPosts(status?: PostStatus) {
    const posts = status ? this.state.posts.filter((post) => post.status === status) : this.state.posts
    return structuredClone(posts.sort((a, b) => {
      const left = a.scheduledAt ?? a.createdAt
      const right = b.scheduledAt ?? b.createdAt
      return left.localeCompare(right)
    }))
  }

  getPost(id: string) {
    const post = this.state.posts.find((item) => item.id === id)
    return post ? structuredClone(post) : undefined
  }

  async createPost(input: CreatePostInput) {
    const now = new Date().toISOString()
    const targetAccounts = this.state.accounts.filter((account) => input.targetAccountIds.includes(account.id))
    const status: PostStatus = input.submitForApproval
      ? 'pending_approval'
      : input.scheduledAt
        ? 'scheduled'
        : 'draft'

    const post: Post = {
      id: randomUUID(),
      title: input.title.trim(),
      text: input.text.trim(),
      contentType: input.contentType,
      status,
      scheduledAt: input.scheduledAt,
      campaign: input.campaign?.trim() || undefined,
      tags: input.tags ?? [],
      notes: input.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      targets: targetAccounts.map((account) => ({
        id: randomUUID(),
        accountId: account.id,
        platform: account.platform,
        status,
        retries: 0,
      })),
    }

    this.state.posts.push(post)
    await this.persist()
    return structuredClone(post)
  }

  async updateStatus(id: string, status: PostStatus) {
    const post = this.state.posts.find((item) => item.id === id)
    if (!post) return undefined

    post.status = status
    post.updatedAt = new Date().toISOString()
    post.targets = post.targets.map((target) => ({ ...target, status }))
    await this.persist()
    return structuredClone(post)
  }

  async retry(id: string) {
    const post = this.state.posts.find((item) => item.id === id)
    if (!post) return undefined

    post.status = post.scheduledAt && new Date(post.scheduledAt) > new Date() ? 'scheduled' : 'publishing'
    post.updatedAt = new Date().toISOString()
    post.targets = post.targets.map((target) => ({
      ...target,
      status: post.status,
      retries: target.retries + 1,
      error: undefined,
    }))
    await this.persist()
    return structuredClone(post)
  }

  private async persist() {
    await writeFile(this.filePath, JSON.stringify(this.state, null, 2), 'utf8')
  }
}
