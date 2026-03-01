"use client"
/**
 * File: hooks/useAuth.ts
 * Purpose: React hook that keeps auth state in sync with localStorage and API.
 * Notes: exposes `user`, `token`, `loading`, `logout`, and `refreshUser`.
 */

import { useState, useEffect, useCallback } from "react"
import { getMe } from "@/lib/api"

export interface AuthUser {
  id: string
  email: string
  username: string
  real_name: string | null
  avatar_url: string | null
  bio: string | null
  is_active: boolean
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  const syncFromStorage = useCallback(async () => {
    setLoading(true)
    const storedToken = localStorage.getItem("access_token")
    if (storedToken) {
      setToken(storedToken)
      try {
        const userData = await getMe(storedToken)
        setUser(userData)
      } catch {
        localStorage.removeItem("access_token")
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    } else {
      setToken(null)
      setUser(null)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const onAuthChange = () => {
      void syncFromStorage()
    }

    void syncFromStorage()
    window.addEventListener("storage", onAuthChange)
    window.addEventListener("auth-changed", onAuthChange)

    return () => {
      window.removeEventListener("storage", onAuthChange)
      window.removeEventListener("auth-changed", onAuthChange)
    }
  }, [syncFromStorage])

  const logout = useCallback(() => {
    localStorage.removeItem("access_token")
    setToken(null)
    setUser(null)
    window.dispatchEvent(new Event("auth-changed"))
  }, [])

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem("access_token")
    if (!storedToken) return
    try {
      const userData = await getMe(storedToken)
      setUser(userData)
    } catch {
      logout()
    }
  }, [logout])

  return { user, loading, token, logout, refreshUser }
}
