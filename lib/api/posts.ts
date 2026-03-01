import { request } from "./client"
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

export function getPosts(page = 1, limit = 10) { return request<PostListResponse>(`/posts/?page=${page}&limit=${limit}`) }
export function getPost(id: string) { return request<Post>(`/posts/${id}`) }
export function getMyPosts(token: string, page = 1, limit = 10) {
  return request<PostListResponse>(`/posts/my?page=${page}&limit=${limit}`, "GET", undefined, token)
}
export function createPost(token: string, payload: PostCreatePayload) { return request<Post>("/posts/", "POST", payload, token) }
export function updatePost(token: string, id: string, payload: Partial<PostCreatePayload>) { return request<Post>(`/posts/${id}`, "PUT", payload, token) }
export function deletePost(token: string, id: string) { return request<null>(`/posts/${id}`, "DELETE", undefined, token) }
export function getUpvoteStatus(postId: string, token?: string) {
  return request<PostUpvoteStatus>(`/posts/${postId}/upvote`, "GET", undefined, token)
}
export function toggleUpvote(token: string, postId: string) {
  return request<PostUpvoteStatus>(`/posts/${postId}/upvote`, "POST", undefined, token)
}
