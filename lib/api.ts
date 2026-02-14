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

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let message = "API request failed"

    try {
      const error = await res.json()
      message = error?.detail || message
    } catch {
    }

    throw new Error(message)
  }

  if (res.status === 204) {
    return null as T
  }

  return res.json()
}

export function getHomepage() {
  return request<HomepageFeed>("/homepage")
}

export function login(email: string, password: string) {
  return request<{
    access_token: string
    token_type: string
  }>("/auth/login", "POST", { email, password })
}

export function getMe(token: string) {
  return request<{
    id: number
    email: string
    name: string
  }>("/users/me", "GET", undefined, token)
}
