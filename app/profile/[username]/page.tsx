"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { request, getMyPosts, uploadImage, updateProfile } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

type Profile = {
  id: string
  username: string
  real_name: string | null
  avatar_url: string | null
  bio: string | null
  is_active: boolean
  created_at: string
}

type Post = {
  id: string
  title: string
  excerpt: string | null
  is_published: boolean
  created_at: string
}

export default function ProfilePage() {
  const params = useParams()
  const rawUsername = params?.username as string
  // strip leading @ so we don't pass @@username to the API or display
  const username = rawUsername?.replace(/^@/, "")

  const { user: currentUser, token, refreshUser } = useAuth()

  const [profile, setProfile]   = useState<Profile | null>(null)
  const [posts, setPosts]       = useState<Post[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  // Edit state
  const [editing, setEditing]     = useState(false)
  const [editUsername, setEditUsername] = useState("")
  const [editName, setEditName]   = useState("")
  const [editBio, setEditBio]     = useState("")
  const [saving, setSaving]      = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const router = useRouter()

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError]         = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const isOwnProfile = !!currentUser && (
    currentUser.username === username ||
    currentUser.username === rawUsername
  )

  // Fetch profile
  useEffect(() => {
    if (!username) return
    setLoading(true)
    request<Profile>(`/profile/${username}`)
      .then(setProfile)
      .catch(() => setError("Profil tidak ditemukan."))
      .finally(() => setLoading(false))
  }, [username])

  // Fetch own posts
  useEffect(() => {
    if (!isOwnProfile || !token) return
    getMyPosts(token, 1, 20)
      .then((res) => setPosts(res.posts))
      .catch(() => {})
  }, [isOwnProfile, token])

  // ── Avatar upload ─────────────────────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !token) return
    setAvatarError(null)
    setAvatarUploading(true)
    try {
      const url = await uploadImage(token, file, "avatars")
      const updated = await updateProfile(token, { avatar_url: url })
      setProfile((prev) => prev ? { ...prev, avatar_url: updated.avatar_url } : prev)
      await refreshUser()
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Gagal mengunggah foto.")
    } finally {
      setAvatarUploading(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ""
    }
  }

  // ── Profile text edit ─────────────────────────────────────────────────────
  function startEditing() {
    if (!profile) return
    setEditUsername(profile.username)
    setEditName(profile.real_name ?? "")
    setEditBio(profile.bio ?? "")
    setSaveError(null)
    setEditing(true)
  }

  async function handleSave() {
    if (!token) return
    setSaveError(null)
    setSaving(true)
    try {
      const updated = await updateProfile(token, {
        username: editUsername.trim() || undefined,
        real_name: editName.trim() || undefined,
        bio: editBio.trim(),
      })
      setProfile((prev) =>
        prev ? { ...prev, username: updated.username, real_name: updated.real_name, bio: updated.bio } : prev
      )
      await refreshUser()
      setEditing(false)
      if (updated.username && updated.username !== username) {
        router.replace(`/profile/${updated.username}`)
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan.")
    } finally {
      setSaving(false)
    }
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const page: React.CSSProperties = {
    maxWidth: "760px", margin: "0 auto",
    padding: "clamp(1rem, 1.8vw, 1.5rem)",
    display: "flex", flexDirection: "column", gap: "1.5rem",
  }
  const card: React.CSSProperties = {
    background: "var(--bg-secondary)", border: "1px solid var(--border-color)",
    borderRadius: "14px", padding: "1.75rem",
  }

  if (loading) return <main style={page}><p style={{ color: "var(--text-secondary)" }}>Memuat profil...</p></main>
  if (error || !profile) return (
    <main style={page}>
      <p style={{ color: "#ffb8b3" }}>{error ?? "Profil tidak ditemukan."}</p>
      <Link href="/" style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>← Beranda</Link>
    </main>
  )

  const joinDate = new Date(profile.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" })

  return (
    <main style={page}>
      {/* ── Profile card ─────────────────────────────────────────────────── */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", flexWrap: "wrap" }}>

          {/* ── Avatar ── */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url} alt={profile.username}
                width={80} height={80}
                style={{ borderRadius: "50%", border: "2px solid var(--border-color)", display: "block", objectFit: "cover" }}
              />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "linear-gradient(135deg, #58a6ff, #1f6feb)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "2rem", fontWeight: 700, userSelect: "none",
              }}>
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Upload overlay — own profile only */}
            {isOwnProfile && (
              <>
                <label
                  htmlFor="avatar-upload"
                  title="Ganti foto profil"
                  style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: "rgba(0,0,0,0)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: avatarUploading ? "not-allowed" : "pointer",
                    color: "#fff", fontSize: "1.2rem",
                    opacity: 0, transition: "opacity 180ms ease, background 180ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!avatarUploading) {
                      e.currentTarget.style.opacity = "1"
                      e.currentTarget.style.background = "rgba(0,0,0,0.6)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!avatarUploading) {
                      e.currentTarget.style.opacity = "0"
                      e.currentTarget.style.background = "rgba(0,0,0,0)"
                    }
                  }}
                >
                  {avatarUploading ? "⏳" : "📷"}
                </label>
                <input
                  id="avatar-upload"
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                />
              </>
            )}
          </div>

          {/* ── Info / Edit form ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {saveError && (
                  <div style={{
                    fontSize: "0.82rem", color: "#ffb8b3", padding: "0.5rem 0.75rem",
                    background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.4)",
                    borderRadius: "8px",
                  }}>{saveError}</div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#d7e0ea" }}>
                    Username
                  </label>
                  <input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    disabled={saving}
                    placeholder="username"
                    style={{
                      width: "100%", background: "#0d1117",
                      border: "1px solid var(--border-color)", borderRadius: "8px",
                      color: "var(--text-primary)", fontSize: "0.9rem",
                      padding: "0.55rem 0.75rem", fontFamily: "inherit",
                      outline: "none", boxSizing: "border-box",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#58a6ff" }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-color)" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#d7e0ea" }}>
                    Nama Lengkap
                  </label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={saving}
                    placeholder="Nama lengkap"
                    style={{
                      width: "100%", background: "#0d1117",
                      border: "1px solid var(--border-color)", borderRadius: "8px",
                      color: "var(--text-primary)", fontSize: "0.9rem",
                      padding: "0.55rem 0.75rem", fontFamily: "inherit",
                      outline: "none", boxSizing: "border-box",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#58a6ff" }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-color)" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#d7e0ea" }}>
                    Bio
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    disabled={saving}
                    placeholder="Ceritakan sedikit tentang dirimu..."
                    rows={3}
                    style={{
                      width: "100%", background: "#0d1117",
                      border: "1px solid var(--border-color)", borderRadius: "8px",
                      color: "var(--text-primary)", fontSize: "0.875rem",
                      padding: "0.55rem 0.75rem", fontFamily: "inherit",
                      resize: "vertical", lineHeight: 1.6,
                      outline: "none", boxSizing: "border-box",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#58a6ff" }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-color)" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <button
                    type="button" onClick={handleSave} disabled={saving}
                    style={{
                      background: "#1f6feb", border: "1px solid #388bfd", color: "#fff",
                      fontSize: "0.875rem", fontWeight: 600, padding: "0.45rem 1.1rem",
                      borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    type="button" onClick={() => setEditing(false)} disabled={saving}
                    style={{
                      background: "transparent", border: "1px solid var(--border-color)",
                      color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500,
                      padding: "0.45rem 0.9rem", borderRadius: "8px", cursor: "pointer",
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                  <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
                      {profile.real_name || profile.username}
                    </h1>
                    <p style={{ color: "var(--text-secondary)", margin: "0.2rem 0 0", fontSize: "0.9rem" }}>
                      @{profile.username.replace(/^@/, "")}
                    </p>
                  </div>

                  {isOwnProfile && (
                    <button
                      type="button" onClick={startEditing}
                      style={{
                        background: "transparent", border: "1px solid var(--border-color)",
                        color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 500,
                        padding: "0.4rem 0.85rem", borderRadius: "8px", cursor: "pointer",
                        transition: "border-color 180ms ease, color 180ms ease", whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--accent)"
                        e.currentTarget.style.color = "var(--text-primary)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border-color)"
                        e.currentTarget.style.color = "var(--text-secondary)"
                      }}
                    >
                      ✎ Edit Profil
                    </button>
                  )}
                </div>

                {profile.bio && (
                  <p style={{ color: "var(--text-secondary)", marginTop: "0.75rem", lineHeight: 1.6, fontSize: "0.9rem" }}>
                    {profile.bio}
                  </p>
                )}
                <p style={{ color: "var(--text-muted)", marginTop: "0.6rem", fontSize: "0.8rem" }}>
                  Bergabung {joinDate}
                </p>
              </>
            )}

            {avatarError && (
              <p style={{ color: "#ffb8b3", fontSize: "0.8rem", marginTop: "0.5rem" }}>{avatarError}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Posts list (own profile only) ─────────────────────────────────── */}
      {isOwnProfile && (
        <div>
          <h2 style={{
            fontSize: "1.1rem", fontWeight: 650, marginBottom: "0.85rem",
            paddingBottom: "0.5rem", borderBottom: "1px solid var(--border-color)",
          }}>
            Pertanyaan Saya
          </h2>

          {posts.length === 0 ? (
            <div style={{
              padding: "2rem 1rem", textAlign: "center", fontSize: "0.9rem",
              color: "var(--text-secondary)", border: "1px dashed var(--border-color)", borderRadius: "10px",
            }}>
              <p>Belum ada pertanyaan.</p>
              <Link href="/posts" style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.85rem" }}>
                Ajukan pertanyaan pertama →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  style={{
                    display: "block", padding: "1rem 1.1rem",
                    background: "var(--bg-secondary)", border: "1px solid var(--border-color)",
                    borderRadius: "10px", textDecoration: "none", color: "inherit",
                    transition: "border-color 180ms ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-primary)", flex: 1 }}>
                      {post.title}
                    </span>
                    {!post.is_published && (
                      <span style={{
                        fontSize: "0.7rem", fontWeight: 600, padding: "0.15rem 0.5rem",
                        borderRadius: "999px", background: "rgba(210,153,34,0.15)",
                        color: "#e3b341", border: "1px solid rgba(210,153,34,0.4)",
                      }}>DRAFT</span>
                    )}
                  </div>
                  {post.excerpt && (
                    <p style={{
                      fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.3rem",
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>
                      {post.excerpt}
                    </p>
                  )}
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                    {new Date(post.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}