"use client"
/**
 * File: components/AuthSplit.tsx
 * Purpose: Combined Login/Signup UI with social (Google) flow support.
 * Notes: handles local form submit, signup flow, and redirects for OAuth.
 */

import { FormEvent, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login, request } from "@/lib/api"

type AuthMode = "login" | "signup"

interface AuthSplitProps {
  initialMode: AuthMode
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13 17.8 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
      <path fill="#FBBC05" d="M10.6 28.6A14.8 14.8 0 0 1 9.5 24c0-1.6.3-3.1.7-4.6L2.3 13.3A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8.1-6z"/>
      <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.8l-8 6.1C6.5 42.5 14.6 48 24 48z"/>
    </svg>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#6e7681", fontSize: "0.78rem" }}>
      <span style={{ flex: 1, height: 1, background: "#30363d" }} />
      {label}
      <span style={{ flex: 1, height: 1, background: "#30363d" }} />
    </div>
  )
}

const googleBtnStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.6rem",
  background: "#ffffff",
  border: "1px solid #d0d7de",
  borderRadius: "10px",
  color: "#24292f",
  fontSize: "0.9rem",
  fontWeight: 600,
  padding: "0.65rem 1rem",
  cursor: "pointer",
  transition: "background 180ms ease, box-shadow 180ms ease",
}

const successBoxStyle: React.CSSProperties = {
  border: "1px solid rgba(63,185,80,0.5)",
  borderRadius: "10px",
  background: "rgba(63,185,80,0.12)",
  color: "#7ee787",
  fontSize: "0.82rem",
  padding: "0.62rem 0.75rem",
  lineHeight: "1.5",
}

export default function AuthSplit({ initialMode }: AuthSplitProps) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>(initialMode)

  // Login state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Signup state
  const [signupEmail, setSignupEmail] = useState("")
  const [signupUsername, setSignupUsername] = useState("")
  const [signupRealName, setSignupRealName] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null)

  const [googleLoading, setGoogleLoading] = useState(false)

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginError(null)
    setLoginLoading(true)
    try {
      const data = await login(loginEmail, loginPassword)
      localStorage.setItem("access_token", data.access_token)
      if (remember) localStorage.setItem("remember_login", "true")
      else localStorage.removeItem("remember_login")
      window.dispatchEvent(new Event("auth-changed"))
      router.push("/")
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Gagal masuk")
    } finally {
      setLoginLoading(false)
    }
  }

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSignupError(null)
    setSignupSuccess(null)
    setSignupLoading(true)
    try {
      const data = await request<{
        access_token?: string | null
        requires_email_verification?: boolean
        message?: string
        user: object
      }>("/auth/signup", "POST", {
        email: signupEmail,
        password: signupPassword,
        username: signupUsername,
        real_name: signupRealName,
      })
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token)
        window.dispatchEvent(new Event("auth-changed"))
        router.push("/")
      } else {
        setSignupSuccess(
          data.message ||
            "Akun berhasil dibuat! Cek inbox Anda dan klik tautan verifikasi."
        )
      }
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : "Gagal mendaftar")
    } finally {
      setSignupLoading(false)
    }
  }

  /**
   * Supabase Google OAuth flow:
   * 1. Fetch the Supabase OAuth URL from our backend (/auth/google/url)
   * 2. Redirect the browser to that URL
   * 3. Supabase handles the Google account chooser
   * 4. After consent, Supabase redirects to /auth/callback with access_token in the hash
   * 5. The /auth/callback page reads the token, stores it, and redirects to the user's profile
   */
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    const errorSetter = mode === "login" ? setLoginError : setSignupError

    try {
      const data = await request<{ url: string }>("/auth/google/url")
      // Full page redirect — Supabase takes over from here
      window.location.href = data.url
    } catch (err) {
      errorSetter(err instanceof Error ? err.message : "Google sign-in gagal. Coba lagi.")
      setGoogleLoading(false)
    }
  }

  const isLoading = mode === "login" ? loginLoading : signupLoading

  return (
    <div className="auth-page">
      <div className={`auth-shell ${mode === "signup" ? "mode-signup" : "mode-login"}`}>

        {/* ── Left visual panel ── */}
        <section className="auth-visual" aria-label="Preview aplikasi">
          <div className="auth-brand">
            <Image src="/garuda_icon.png" alt="Nusa CoNex" width={36} height={36} className="auth-brand-icon" />
            <span className="auth-brand-text">Nusa CoNex</span>
          </div>

          <h2 className="auth-visual-title">
            {mode === "login" ? "Siap Naik Peringkat Lagi?" : "Saatnya Naik Level"}
          </h2>
          <p className="auth-visual-subtitle">
            {mode === "login"
              ? "Poin, streak, dan analisismu sudah menunggu."
              : "Raih poin, buka peringkat baru, dan kuasai setiap materi."}
          </p>

          <div className="auth-preview-grid" aria-hidden="true">
            <div className="auth-preview-card large">
              <span className="auth-preview-kicker">Progress</span>
              <strong>92% Minggu Ini</strong>
            </div>
            <div className="auth-preview-card">
              <span className="auth-preview-kicker">Streak</span>
              <strong>15 Hari</strong>
            </div>
            <div className="auth-preview-card">
              <span className="auth-preview-kicker">Peringkat</span>
              <strong>#8 Nasional</strong>
            </div>
          </div>

          <button
            type="submit"
            form={mode === "login" ? "login-form" : "signup-form"}
            className="auth-submit auth-panel-submit"
            disabled={isLoading}
          >
            {mode === "login"
              ? loginLoading ? <><span className="auth-spinner" /> Sedang masuk...</> : "Lanjut Belajar"
              : signupLoading ? <><span className="auth-spinner" /> Membuat akun...</> : "Mulai Sekarang"}
          </button>

          <button
            type="button"
            className="auth-switch-left"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login")
              setSignupSuccess(null)
              setSignupError(null)
              setLoginError(null)
            }}
            disabled={isLoading}
          >
            {mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
          </button>
        </section>

        {/* ── Right form panel ── */}
        <section className="auth-form-pane">
          <Link href="/" className="auth-back">← Kembali ke Nusa CoNex</Link>

          <div className="auth-slider-viewport">
            <div className="auth-slider-track">

              {/* LOGIN SLIDE */}
              <div className="auth-slide login-slide" aria-hidden={mode !== "login"}>
                <div className="auth-card">
                  <form id="login-form" className="auth-form" onSubmit={handleLogin}>
                    {loginError && (
                      <div className="auth-error" role="alert" aria-live="polite">{loginError}</div>
                    )}

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loginLoading || googleLoading}
                      style={googleBtnStyle}
                    >
                      {googleLoading
                        ? <span className="auth-spinner" style={{ borderTopColor: "#555", borderColor: "rgba(0,0,0,0.12)" }} />
                        : <GoogleIcon />}
                      {googleLoading ? "Mengalihkan ke Google..." : "Lanjutkan dengan Google"}
                    </button>

                    <Divider label="atau masuk dengan email" />

                    <div className="auth-field">
                      <label htmlFor="login-email" className="auth-label">Username atau Alamat Email</label>
                      <input
                        id="login-email"
                        type="text"
                        className="auth-input"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="username atau you@example.com"
                        required
                        disabled={loginLoading}
                        autoComplete="username"
                      />
                    </div>

                    <div className="auth-field">
                      <div className="auth-label-row">
                        <label htmlFor="login-password" className="auth-label">Kata Sandi</label>
                        <Link href="/forgot-password" className="auth-forgot">Lupa kata sandi?</Link>
                      </div>
                      <input
                        id="login-password"
                        type="password"
                        className="auth-input"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Masukkan kata sandi Anda"
                        required
                        disabled={loginLoading}
                        autoComplete="current-password"
                      />
                    </div>

                    <label className="auth-remember">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        disabled={loginLoading}
                      />
                      Ingat Saya
                    </label>
                  </form>
                </div>
              </div>

              {/* SIGNUP SLIDE */}
              <div className="auth-slide signup-slide" aria-hidden={mode !== "signup"}>
                <div className="auth-card">
                  <form id="signup-form" className="auth-form" onSubmit={handleSignup}>
                    {signupError && (
                      <div className="auth-error" role="alert" aria-live="polite">{signupError}</div>
                    )}
                    {signupSuccess && (
                      <div role="status" aria-live="polite" style={successBoxStyle}>{signupSuccess}</div>
                    )}

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={signupLoading || googleLoading || !!signupSuccess}
                      style={googleBtnStyle}
                    >
                      {googleLoading
                        ? <span className="auth-spinner" style={{ borderTopColor: "#555", borderColor: "rgba(0,0,0,0.12)" }} />
                        : <GoogleIcon />}
                      {googleLoading ? "Mengalihkan ke Google..." : "Daftar dengan Google"}
                    </button>

                    <Divider label="atau daftar dengan email" />

                    <div className="auth-field">
                      <label htmlFor="signup-real-name" className="auth-label">Nama Lengkap</label>
                      <input
                        id="signup-real-name"
                        type="text"
                        className="auth-input"
                        value={signupRealName}
                        onChange={(e) => setSignupRealName(e.target.value)}
                        placeholder="Nama Anda"
                        disabled={signupLoading || !!signupSuccess}
                      />
                    </div>

                    <div className="auth-field">
                      <label htmlFor="signup-username" className="auth-label">Nama Pengguna</label>
                      <input
                        id="signup-username"
                        type="text"
                        className="auth-input"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        placeholder="@namapengguna"
                        required
                        disabled={signupLoading || !!signupSuccess}
                        autoComplete="username"
                      />
                    </div>

                    <div className="auth-field">
                      <label htmlFor="signup-email" className="auth-label">Alamat Email</label>
                      <input
                        id="signup-email"
                        type="email"
                        className="auth-input"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={signupLoading || !!signupSuccess}
                        autoComplete="email"
                      />
                    </div>

                    <div className="auth-field">
                      <label htmlFor="signup-password" className="auth-label">Kata Sandi</label>
                      <input
                        id="signup-password"
                        type="password"
                        className="auth-input"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Buat kata sandi"
                        required
                        disabled={signupLoading || !!signupSuccess}
                        autoComplete="new-password"
                      />
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </div>
  )
}