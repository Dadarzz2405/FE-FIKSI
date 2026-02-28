/**
 * File: lib/auth.ts
 * Purpose: Lightweight auth helpers (login wrapper) used by UI.
 * Notes: stores token to localStorage on success.
 */
import { request } from "../lib/api"

export interface LoginResponse {
  access_token: string
  token_type: "bearer"
}

export interface User {
  id: string
  email: string
  username: string
  real_name?: string
  avatar_url?: string
  bio?: string
  is_active: boolean
}

export async function login(email: string, password: string) {
  const res = await request<LoginResponse>(
    "/auth/login",
    "POST",
    { email, password }
  )

  localStorage.setItem("access_token", res.access_token)
  return res
}
