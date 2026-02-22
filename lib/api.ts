import { HomepageFeed } from "./types"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

export async function request<T>(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: unknown,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  if (body) {
    headers["Content-Type"] = "application/json"
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    const msg =
      e instanceof TypeError && e.message === "Failed to fetch"
        ? "Tidak bisa terhubung ke server. Pastikan backend berjalan di http://localhost:8000"
        : e instanceof Error
          ? e.message
          : "Koneksi gagal"
    throw new Error(msg)
  }

  if (!res.ok) {
    let message = "Permintaan API gagal"
    try {
      const error = await res.json()
      message = error?.detail || message
    } catch {}
    throw new Error(message)
  }

  if (res.status === 204) {
    return null as T
  }

  return res.json()
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export function getHomepage() {
  return request<HomepageFeed>("/homepage/")
}

export function login(email: string, password: string) {
  return request<{
    access_token: string
    token_type: string
    user: {
      id: string
      email: string
      username: string
      real_name: string | null
      avatar_url: string | null
      bio: string | null
      is_active: boolean
    }
  }>("/auth/login", "POST", { email, password })
}

export function getMe(token: string) {
  return request<{
    id: string
    email: string
    username: string
    real_name: string | null
    avatar_url: string | null
    bio: string | null
    is_active: boolean
  }>("/auth/me", "GET", undefined, token)
}

// ── Posts ────────────────────────────────────────────────────────────────────

export type PostAuthor = {
  username: string
  real_name: string | null
  avatar_url: string | null
}

export type Post = {
  id: string
  title: string
  content: string
  excerpt: string | null
  image_url: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  author_id: string
  author: PostAuthor | null
}

export type PostListResponse = {
  posts: Post[]
  total: number
  page: number
  limit: number
}

export type PostCreatePayload = {
  title: string
  content: string
  excerpt?: string
  image_url?: string
  is_published?: boolean
}

export function getPosts(page = 1, limit = 10) {
  return request<PostListResponse>(`/posts/?page=${page}&limit=${limit}`)
}

export function getPost(id: string) {
  return request<Post>(`/posts/${id}`)
}

export function getMyPosts(token: string, page = 1, limit = 10) {
  return request<PostListResponse>(
    `/posts/my/?page=${page}&limit=${limit}`,
    "GET",
    undefined,
    token
  )
}

export function createPost(token: string, payload: PostCreatePayload) {
  return request<Post>("/posts/", "POST", payload, token)
}

export function updatePost(
  token: string,
  id: string,
  payload: Partial<PostCreatePayload>
) {
  return request<Post>(`/posts/${id}`, "PUT", payload, token)
}

export function deletePost(token: string, id: string) {
  return request<null>(`/posts/${id}`, "DELETE", undefined, token)
}