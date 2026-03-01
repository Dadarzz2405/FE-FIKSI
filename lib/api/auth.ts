import { request } from "./client"

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
