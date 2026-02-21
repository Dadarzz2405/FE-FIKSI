"use client"

import { FormEvent, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login, request } from "@/lib/api"

type AuthMode = "login" | "signup"

interface AuthSplitProps {
  initialMode: AuthMode
}

export default function AuthSplit({ initialMode }: AuthSplitProps) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>(initialMode)

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const [signupEmail, setSignupEmail] = useState("")
  const [signupUsername, setSignupUsername] = useState("")
  const [signupRealName, setSignupRealName] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginError(null)
    setLoginLoading(true)

    try {
      const data = await login(loginEmail, loginPassword)
      localStorage.setItem("access_token", data.access_token)
      if (remember) {
        localStorage.setItem("remember_login", "true")
      } else {
        localStorage.removeItem("remember_login")
      }
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
    setSignupLoading(true)

    try {
      const data = await request<{
        access_token: string
        token_type: string
        user: object
      }>("/auth/signup", "POST", {
        email: signupEmail,
        password: signupPassword,
        username: signupUsername,
        real_name: signupRealName,
      })

      localStorage.setItem("access_token", data.access_token)
      window.dispatchEvent(new Event("auth-changed"))
      router.push("/")
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : "Gagal mendaftar")
    } finally {
      setSignupLoading(false)
    }
  }

  return (
    <div className={`auth-shell ${mode === "signup" ? "mode-signup" : "mode-login"}`}>
      <section className="auth-visual" aria-label="Preview aplikasi">
        <div className="auth-brand">
          <Image
            src="/garuda_icon.png"
            alt="Nusa CoNex"
            width={36}
            height={36}
            className="auth-brand-icon"
          />
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
          disabled={mode === "login" ? loginLoading : signupLoading}
        >
          {mode === "login" ? (
            loginLoading ? (
              <>
                <span className="auth-spinner" />
                Sedang masuk...
              </>
            ) : (
              "Lanjut Belajar"
            )
          ) : signupLoading ? (
            <>
              <span className="auth-spinner" />
              Membuat akun...
            </>
          ) : (
            "Mulai Sekarang"
          )}
        </button>

        <button
          type="button"
          className="auth-switch-left"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          disabled={mode === "login" ? loginLoading : signupLoading}
        >
          {mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
        </button>
      </section>

      <section className="auth-form-pane">
        <Link href="/" className="auth-back">
          ← Kembali ke Nusa CoNex
        </Link>

        <div className="auth-slider-viewport">
          <div className="auth-slider-track">
            <div className="auth-slide login-slide" aria-hidden={mode !== "login"}>
              <div className="auth-card">
                <form id="login-form" className="auth-form" onSubmit={handleLogin}>
                  {loginError && (
                    <div className="auth-error" role="alert" aria-live="polite">
                      {loginError}
                    </div>
                  )}

                  <div className="auth-field">
                    <label htmlFor="login-email" className="auth-label">
                      Username atau Alamat Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      className="auth-input"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={loginLoading}
                    />
                  </div>

                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label htmlFor="login-password" className="auth-label">
                        Kata Sandi
                      </label>
                      <Link href="/forgot-password" className="auth-forgot">
                        Lupa kata sandi?
                      </Link>
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

            <div className="auth-slide signup-slide" aria-hidden={mode !== "signup"}>
              <div className="auth-card">
                <form id="signup-form" className="auth-form" onSubmit={handleSignup}>
                  {signupError && (
                    <div className="auth-error" role="alert" aria-live="polite">
                      {signupError}
                    </div>
                  )}

                  <div className="auth-field">
                    <label htmlFor="signup-real-name" className="auth-label">
                      Nama Lengkap
                    </label>
                    <input
                      id="signup-real-name"
                      type="text"
                      className="auth-input"
                      value={signupRealName}
                      onChange={(e) => setSignupRealName(e.target.value)}
                      placeholder="Nama Anda"
                      disabled={signupLoading}
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="signup-username" className="auth-label">
                      Nama Pengguna
                    </label>
                    <input
                      id="signup-username"
                      type="text"
                      className="auth-input"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="@namapengguna"
                      required
                      disabled={signupLoading}
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="signup-email" className="auth-label">
                      Alamat Email
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      className="auth-input"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={signupLoading}
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="signup-password" className="auth-label">
                      Kata Sandi
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      className="auth-input"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Buat kata sandi"
                      required
                      disabled={signupLoading}
                    />
                  </div>

                </form>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
