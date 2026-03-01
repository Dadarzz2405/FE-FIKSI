import { request } from "./client"
import { invalidateCache } from "../cache"
import type { RankInfo } from "./profile"

export type PostAuthor = {
  username: string; real_name: string | null; avatar_url: string | null
  level: number; reputation: number; cp_total: number
  rank: RankInfo
}

export type Post = {
  id: string; title: string; content: string; excerpt: string | null
  image_url: string | null; is_published: boolean; created_at: string; updated_at: string
  author_id: string; author: PostAuthor | null; subject_id: string | null
  upvote_count?: number
  has_upvoted?: boolean
  subject?: { id: string; name: string; slug: string; icon: string | null; academic_category_id: string } | null
}

export type PostListResponse = { posts: Post[]; total: number; page: number; limit: number }

export type PostCreatePayload = {
  title: string; content: string; excerpt?: string
  image_url?: string; is_published?: boolean; subject_id?: string
}

export type PostUpvoteStatus = { upvote_count: number; is_upvoted: boolean }

export function getPosts(page = 1, limit = 10) { 
  return request<PostListResponse>(
    `/posts/?page=${page}&limit=${limit}`, 
    "GET", 
    undefined, 
    undefined, 
    { cache: true, cacheTTL: 2 * 60 * 1000 } // 2 minutes
  ) 
}
export function getPost(id: string) { 
  return request<Post>(
    `/posts/${id}`, 
    "GET", 
    undefined, 
    undefined, 
    { cache: true, cacheTTL: 5 * 60 * 1000 } // 5 minutes
  ) 
}
export function getMyPosts(token: string, page = 1, limit = 10) {
  return request<PostListResponse>(`/posts/my?page=${page}&limit=${limit}`, "GET", undefined, token)
}
export async function createPost(token: string, payload: PostCreatePayload) { 
  const result = await request<Post>("/posts/", "POST", payload, token)
  // Invalidate posts list cache (both limits)
  for (let page = 1; page <= 5; page++) {
    invalidateCache(`/posts/?page=${page}&limit=10`)
    invalidateCache(`/posts/?page=${page}&limit=20`)
  }
  return result
}

export async function updatePost(token: string, id: string, payload: Partial<PostCreatePayload>) { 
  const result = await request<Post>(`/posts/${id}`, "PUT", payload, token)
  invalidateCache(`/posts/${id}`)
  return result
}

export async function deletePost(token: string, id: string) { 
  const result = await request<null>(`/posts/${id}`, "DELETE", undefined, token)
  // Invalidate related caches
  invalidateCache(`/posts/${id}`)
  for (let page = 1; page <= 5; page++) {
    invalidateCache(`/posts/?page=${page}&limit=10`)
    invalidateCache(`/posts/?page=${page}&limit=20`)
  }
  return result
}
export function getUpvoteStatus(postId: string, token?: string) {
  return request<PostUpvoteStatus>(`/posts/${postId}/upvote`, "GET", undefined, token)
}
export function toggleUpvote(token: string, postId: string) {
  return request<PostUpvoteStatus>(`/posts/${postId}/upvote`, "POST", undefined, token)
}
