"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const hash = window.location.hash?.slice(1) || ""
    const params = new URLSearchParams(hash)
    const error = params.get("error")
    const errorDescription = params.get("error_description")
    const accessToken = params.get("access_token")

    if (accessToken) {
      setStatus("success")
      setMessage("Email berhasil diverifikasi. Silakan masuk.")
      return
    }
    if (error) {
      setStatus("error")
      if (params.get("error_code") === "otp_expired" || error === "access_denied") {
        setMessage(
          "Tautan verifikasi tidak valid atau sudah kadaluarsa. Ini sering terjadi karena email client membuka link otomatis. Silakan coba masuk; jika belum bisa, daftar ulang atau minta kirim ulang email verifikasi dari Supabase."
        )
      } else {
        setMessage(errorDescription || "Verifikasi gagal. Silakan coba lagi.")
      }
      return
    }
    setStatus("success")
    setMessage("Email berhasil diverifikasi. Silakan masuk.")
  }, [])

  return (
    <main style={{ padding: "2rem", maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
      {status === "loading" && <p>Memverifikasi...</p>}
      {status === "success" && (
        <>
          <p>{message}</p>
          <Link href="/login" style={{ display: "inline-block", marginTop: "1rem" }}>
            Ke halaman masuk
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <p>{message}</p>
          <Link href="/login" style={{ display: "inline-block", marginTop: "1rem", marginRight: "0.5rem" }}>
            Ke halaman masuk
          </Link>
          <Link href="/signup" style={{ display: "inline-block", marginTop: "1rem" }}>
            Daftar ulang
          </Link>
        </>
      )}
    </main>
  )
}
