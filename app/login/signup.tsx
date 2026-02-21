"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { request } from "@/lib/api"
import "../login/login.css"  // reuse the same CSS

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1400&q=80"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [realName, setRealName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await request<{
        access_token: string
        token_type: string
        user: object
      }>("/auth/signup", "POST", { email, password, username, real_name: realName })

      localStorage.setItem("access_token", data.access_token)
      window.dispatchEvent(new Event("auth-changed"))
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    /*
      "signup" class flips the flex order:
        auth-panel → order 1 (LEFT)
        auth-image → order 2 (RIGHT)
    */
    <div className="auth-root signup">
      {/* ── LEFT: Form panel ── */}
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
          <h1 className="auth-card-title">Create account</h1>
          <p className="auth-card-sub">Join FIKSI — free forever</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label htmlFor="real_name" className="auth-label">
                Full Name
              </label>
              <input
                id="real_name"
                type="text"
                className="auth-input"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="Your name"
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="username" className="auth-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="auth-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@yourhandle"
                required
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Email Address
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
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Creating account…
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </div>
      </div>

      {/* ── RIGHT: Hero image ── */}
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
    </div>
  )
}