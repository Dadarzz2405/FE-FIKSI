"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { login } from "@/lib/api"
import "./login.css"

// Unsplash ocean/nature photo (similar to the reference screenshot)
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1400&q=80"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await login(email, password)
      localStorage.setItem("access_token", data.access_token)
      window.dispatchEvent(new Event("auth-changed"))
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-root login">
      {/* ── Left: Hero image ── */}
      <div className="auth-image">
        <Image
          src={HERO_IMAGE}
          alt="FIKSI background"
          fill
          priority
          style={{ objectFit: "cover" }}
        />
        <p className="auth-image-caption">
          &copy; {new Date().getFullYear()} FIKSI &mdash; Your reading universe
        </p>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="auth-panel">
        <Link href="/" className="auth-back">
          ← Back to FIKSI
        </Link>

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-mark">F</div>
        </div>

        {/* Card */}
        <div className="auth-card">
          <h1 className="auth-card-title">Sign in</h1>
          <p className="auth-card-sub">Access your FIKSI account</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Username or Email Address
              </label>
              <input
                id="email"
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="password" className="auth-label">
                  Password
                </label>
                <Link href="/forgot-password" className="auth-forgot">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <label className="auth-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              />
              Remember Me
            </label>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Signing in…
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  )
}