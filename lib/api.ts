import { HomepageFeed } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export async function request<T>(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: unknown,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
  }
  if (body) headers["Content-Type"] = "application/json"

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method, headers, credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    throw new Error(
      e instanceof TypeError && e.message === "Failed to fetch"
        ? "Tidak bisa terhubung ke server."
        : e instanceof Error ? e.message : "Koneksi gagal"
    )
  }

  if (!res.ok) {
    let message = "Permintaan API gagal"
    try { const err = await res.json(); message = err?.detail || message } catch {}
    throw new Error(message)
  }
  if (res.status === 204) return null as T
  return res.json()
}

// -- Upload --
export async function uploadImage(
  token: string,
  file: File,
  bucket: "post-images" | "avatars" = "post-images"
): Promise<string> {
  const form = new FormData()
  form.append("file", file)
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/upload/image?bucket=${bucket}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
  } catch (e) { throw new Error(e instanceof Error ? e.message : "Upload gagal") }

  if (!res.ok) {
    let msg = "Upload gagal"
    try { const e = await res.json(); msg = e?.detail || msg } catch {}
    throw new Error(msg)
  }
  return (await res.json()).url as string
}

// -- Auth --
export function getHomepage() { return request<HomepageFeed>("/homepage/") }
export type ComingSoonResponse = { status: string; message: string }
export function getQuizzesComingSoon() { return request<ComingSoonResponse>("/quizzes/") }
export function getSettingsComingSoon() { return request<ComingSoonResponse>("/settings/") }

export function login(email: string, password: string) {
  return request<{
    access_token: string; token_type: string
    user: { id: string; email: string; username: string; real_name: string | null; avatar_url: string | null; bio: string | null; is_active: boolean }
  }>("/auth/login", "POST", { email, password })
}

export function getMe(token: string) {
  return request<{
    id: string; email: string; username: string; real_name: string | null
    avatar_url: string | null; bio: string | null; is_active: boolean
  }>("/auth/me", "GET", undefined, token)
}

// -- Profile --
export function updateProfile(
  token: string,
  payload: { username?: string; real_name?: string; bio?: string; avatar_url?: string }
) {
  return request<{
    id: string; username: string; real_name: string | null
    avatar_url: string | null; bio: string | null; is_active: boolean; created_at: string
  }>("/profile/me", "PATCH", payload, token)
}

// -- Categories --
export type Category = {
  id: string; name: string; slug: string
  description: string | null; icon: string | null; post_count: number
}
export type CategoryListResponse = { categories: Category[]; total: number }

export function getCategories() { return request<CategoryListResponse>("/categories/") }
export function getCategory(slug: string) { return request<Category>(`/categories/${slug}`) }
export function getPostsByCategory(slug: string, page = 1, limit = 10) {
  return request<{
    category: { id: string; name: string; slug: string; icon: string | null }
    posts: { id: string; title: string; excerpt: string | null; image_url: string | null; created_at: string; author: { username: string; avatar_url: string | null } | null }[]
    total: number; page: number; limit: number
  }>(`/categories/${slug}/posts?page=${page}&limit=${limit}`)
}

// -- Posts --
export type PostAuthor = { username: string; real_name: string | null; avatar_url: string | null }
export type Post = {
  id: string; title: string; content: string; excerpt: string | null
  image_url: string | null; is_published: boolean; created_at: string; updated_at: string
  author_id: string; author: PostAuthor | null; category_id: string | null
  category?: { id: string; name: string; slug: string; icon: string | null } | null
}
export type PostListResponse = { posts: Post[]; total: number; page: number; limit: number }
export type PostCreatePayload = {
  title: string; content: string; excerpt?: string
  image_url?: string; is_published?: boolean; category_id?: string
}

export function getPosts(page = 1, limit = 10) { return request<PostListResponse>(`/posts/?page=${page}&limit=${limit}`) }
export function getPost(id: string) { return request<Post>(`/posts/${id}`) }

// ✅ FIX: removed trailing slash from /posts/my/ → /posts/my
export function getMyPosts(token: string, page = 1, limit = 10) {
  return request<PostListResponse>(`/posts/my?page=${page}&limit=${limit}`, "GET", undefined, token)
}
export function createPost(token: string, payload: PostCreatePayload) { return request<Post>("/posts/", "POST", payload, token) }
export function updatePost(token: string, id: string, payload: Partial<PostCreatePayload>) { return request<Post>(`/posts/${id}`, "PUT", payload, token) }
export function deletePost(token: string, id: string) { return request<null>(`/posts/${id}`, "DELETE", undefined, token) }

// -- Comments --
export type CommentAuthor = { username: string; avatar_url: string | null; real_name: string | null }
export type Comment = { id: string; post_id: string; content: string; is_accepted: boolean; created_at: string; author_id: string; author: CommentAuthor | null }

export function getComments(postId: string) { return request<Comment[]>(`/posts/${postId}/comments`) }
export function createComment(token: string, postId: string, content: string) { return request<Comment>(`/posts/${postId}/comments`, "POST", { content }, token) }
export function acceptComment(token: string, commentId: string) { return request<Comment>(`/comments/${commentId}/accept`, "PATCH", undefined, token) }
export function deleteComment(token: string, commentId: string) { return request<null>(`/comments/${commentId}`, "DELETE", undefined, token) }
