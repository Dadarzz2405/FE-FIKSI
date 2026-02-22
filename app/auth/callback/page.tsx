"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getMe } from "@/lib/api"

type Status = "loading" | "redirecting" | "success" | "error"

function getInitialFromHash(): { status: Status; message: string } {
  if (typeof window === "undefined") {
    return { status: "loading", message: "" }
  }
  const hash = window.location.hash?.slice(1) || ""
  const params = new URLSearchParams(hash)
  const error = params.get("error")
  const errorDescription = params.get("error_description")
  const accessToken = params.get("access_token")

  if (error) {
    const message =
      params.get("error_code") === "otp_expired" || error === "access_denied"
        ? "Tautan verifikasi tidak valid atau sudah kadaluarsa. Ini sering terjadi karena email client membuka link otomatis. Silakan coba masuk; jika belum bisa, daftar ulang atau minta kirim ulang email verifikasi dari Supabase."
        : errorDescription || "Verifikasi gagal. Silakan coba lagi."
    return { status: "error", message }
  }

  if (accessToken) {
    return { status: "loading", message: "" }
  }

  return { status: "success", message: "Email berhasil diverifikasi. Silakan masuk." }
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const [state, setState] = useState<{ status: Status; message: string }>(getInitialFromHash)

  useEffect(() => {
    const hash = window.location.hash?.slice(1) || ""
    const params = new URLSearchParams(hash)
    const accessToken = params.get("access_token")
    if (!accessToken) return

    // Store token immediately so useAuth picks it up
    localStorage.setItem("access_token", accessToken)
    window.dispatchEvent(new Event("auth-changed"))

    // Defer UI update to avoid synchronous setState in effect (satisfies react-hooks/set-state-in-effect)
    queueMicrotask(() => {
      setState({ status: "redirecting", message: "Email berhasil diverifikasi! Mengalihkan ke profil Anda..." })
    })

    getMe(accessToken)
      .then((user) => {
        router.replace(`/profile/${user.username}`)
      })
      .catch(() => {
        router.replace("/")
      })
  }, [router])

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "2rem",
    background: "#0d1117",
    color: "#e6edf3",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  }

  const cardStyle: React.CSSProperties = {
    maxWidth: "440px",
    width: "100%",
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "14px",
    padding: "2rem",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    alignItems: "center",
  }

  const spinnerStyle: React.CSSProperties = {
    width: "36px",
    height: "36px",
    border: "3px solid rgba(88,166,255,0.2)",
    borderTop: "3px solid #58a6ff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  }

  return (
    <div style={containerStyle}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={cardStyle}>
        {(state.status === "loading" || state.status === "redirecting") && (
          <>
            <div style={spinnerStyle} />
            <p style={{ color: "#8b949e", fontSize: "0.95rem" }}>
              {state.status === "loading" ? "Memverifikasi..." : state.message}
            </p>
          </>
        )}

        {state.status === "success" && (
          <>
            <div style={{ fontSize: "2.5rem" }}>✅</div>
            <p style={{ color: "#7ee787" }}>{state.message}</p>
            <Link
              href="/login"
              style={{
                display: "inline-block",
                marginTop: "0.5rem",
                padding: "0.55rem 1.25rem",
                background: "#1f6feb",
                border: "1px solid #388bfd",
                borderRadius: "8px",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              Ke halaman masuk
            </Link>
          </>
        )}

        {state.status === "error" && (
          <>
            <div style={{ fontSize: "2.5rem" }}>⚠️</div>
            <p
              style={{
                color: "#ffb8b3",
                fontSize: "0.875rem",
                lineHeight: "1.6",
                background: "rgba(248,81,73,0.1)",
                border: "1px solid rgba(248,81,73,0.4)",
                borderRadius: "8px",
                padding: "0.75rem",
              }}
            >
              {state.message}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
              <Link
                href="/login"
                style={{
                  padding: "0.5rem 1rem",
                  background: "#1f6feb",
                  border: "1px solid #388bfd",
                  borderRadius: "8px",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                Coba masuk
              </Link>
              <Link
                href="/signup"
                style={{
                  padding: "0.5rem 1rem",
                  background: "transparent",
                  border: "1px solid #30363d",
                  borderRadius: "8px",
                  color: "#8b949e",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                Daftar ulang
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}