"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { request, uploadImage, updateProfile } from "@/lib/api"
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

export default function EditProfilePage() {
  const params = useParams()
  const rawUsername = params?.username as string
  const username = rawUsername?.replace(/^@/, "")

  const { user: currentUser, token, refreshUser } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  // Form fields
  const [editUsername, setEditUsername] = useState("")
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!username) return
    request<Profile>(`/profile/${username}`)
      .then((p) => {
        setProfile(p)
        setEditUsername(p.username)
        setEditName(p.real_name ?? "")
        setEditBio(p.bio ?? "")
      })
      .catch(() => setUnauthorized(true))
      .finally(() => setLoading(false))
  }, [username])

  // Guard: only own profile
  useEffect(() => {
    if (!loading && currentUser && profile) {
      if (currentUser.username !== profile.username) {
        setUnauthorized(true)
      }
    }
  }, [loading, currentUser, profile])

  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    setAvatarError(null)
  }

  async function handleAvatarUpload() {
    if (!avatarFile || !token) return
    setAvatarError(null)
    setAvatarUploading(true)
    try {
      const url = await uploadImage(token, avatarFile, "avatars")
      const updated = await updateProfile(token, { avatar_url: url })
      setProfile((prev) => prev ? { ...prev, avatar_url: updated.avatar_url } : prev)
      setAvatarFile(null)
      setAvatarPreview(null)
      if (avatarInputRef.current) avatarInputRef.current.value = ""
      await refreshUser()
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Gagal mengunggah foto.")
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setSaveError(null)
    setSaveSuccess(false)
    setSaving(true)
    try {
      const updated = await updateProfile(token, {
        username: editUsername.trim() || undefined,
        real_name: editName.trim() || undefined,
        bio: editBio.trim(),
      })
      setProfile((prev) =>
        prev
          ? { ...prev, username: updated.username, real_name: updated.real_name, bio: updated.bio }
          : prev
      )
      await refreshUser()
      setSaveSuccess(true)
      if (updated.username && updated.username !== username) {
        router.replace(`/profile/${updated.username}/edit`)
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.skeleton}>
          <div style={{ ...styles.skeletonBlock, width: 80, height: 80, borderRadius: "50%" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <div style={{ ...styles.skeletonBlock, width: "60%", height: 20 }} />
            <div style={{ ...styles.skeletonBlock, width: "40%", height: 16 }} />
          </div>
        </div>
      </main>
    )
  }

  if (unauthorized || !profile) {
    return (
      <main style={styles.page}>
        <div style={styles.errorBox}>
          <span style={{ fontSize: "1.5rem" }}>🔒</span>
          <p>Kamu tidak punya akses ke halaman ini.</p>
          <Link href="/" style={styles.backLink}>← Kembali ke Beranda</Link>
        </div>
      </main>
    )
  }

  const currentAvatar = avatarPreview ?? profile.avatar_url

  return (
    <main style={styles.page}>
      {/* ── Breadcrumb ── */}
      <div style={styles.breadcrumb}>
        <Link href={`/profile/${profile.username}`} style={styles.breadcrumbLink}>
          ← Profil @{profile.username}
        </Link>
        <span style={styles.breadcrumbSep}>/</span>
        <span style={styles.breadcrumbCurrent}>Edit Profil</span>
      </div>

      <div style={styles.container}>
        {/* ── Left: Avatar panel ── */}
        <aside style={styles.avatarPanel}>
          <h2 style={styles.sectionHeading}>Foto Profil</h2>

          <div style={styles.avatarWrapper}>
            {currentAvatar ? (
              <Image
                src={currentAvatar}
                alt={profile.username}
                width={120}
                height={120}
                style={styles.avatarImg}
                unoptimized={!!avatarPreview}
              />
            ) : (
              <div style={styles.avatarFallback}>
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Hover overlay */}
            <label
              htmlFor="avatar-upload"
              style={styles.avatarOverlay}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0"
              }}
            >
              <span style={{ fontSize: "1.4rem" }}>📷</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 600 }}>Ganti Foto</span>
            </label>
            <input
              id="avatar-upload"
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarFileChange}
              disabled={avatarUploading}
            />
          </div>

          {avatarError && <p style={styles.fieldError}>{avatarError}</p>}

          {avatarFile && (
            <div style={styles.avatarActions}>
              <button
                type="button"
                onClick={handleAvatarUpload}
                disabled={avatarUploading}
                style={styles.primaryBtn}
              >
                {avatarUploading ? (
                  <><span style={styles.spinner} /> Mengunggah...</>
                ) : "Simpan Foto"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAvatarFile(null)
                  setAvatarPreview(null)
                  if (avatarInputRef.current) avatarInputRef.current.value = ""
                }}
                disabled={avatarUploading}
                style={styles.ghostBtn}
              >
                Batal
              </button>
            </div>
          )}

          <p style={styles.avatarHint}>PNG, JPG, GIF, WebP · Maks. 5 MB</p>
        </aside>

        {/* ── Right: Form panel ── */}
        <section style={styles.formPanel}>
          <h2 style={styles.sectionHeading}>Informasi Profil</h2>

          <form onSubmit={handleSave} style={styles.form}>
            {saveError && (
              <div style={styles.alertError}>
                <span>⚠️</span> {saveError}
              </div>
            )}
            {saveSuccess && (
              <div style={styles.alertSuccess}>
                <span>✅</span> Profil berhasil disimpan!
              </div>
            )}

            {/* Username */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="edit-username">
                Username
              </label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputPrefix}>@</span>
                <input
                  id="edit-username"
                  type="text"
                  value={editUsername}
                  onChange={(e) => {
                    setEditUsername(e.target.value)
                    setSaveSuccess(false)
                  }}
                  disabled={saving}
                  placeholder="username"
                  maxLength={50}
                  style={{ ...styles.input, paddingLeft: "2rem" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#58a6ff")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#30363d")}
                />
              </div>
              <span style={styles.fieldHint}>Hanya huruf, angka, dan underscore. Maks. 50 karakter.</span>
            </div>

            {/* Real name */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="edit-name">
                Nama Lengkap
              </label>
              <input
                id="edit-name"
                type="text"
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value)
                  setSaveSuccess(false)
                }}
                disabled={saving}
                placeholder="Nama kamu"
                style={styles.input}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#58a6ff")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#30363d")}
              />
            </div>

            {/* Bio */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="edit-bio">
                Bio
              </label>
              <textarea
                id="edit-bio"
                value={editBio}
                onChange={(e) => {
                  setEditBio(e.target.value)
                  setSaveSuccess(false)
                }}
                disabled={saving}
                placeholder="Ceritakan sedikit tentang dirimu..."
                rows={4}
                maxLength={300}
                style={{ ...styles.input, resize: "vertical", lineHeight: 1.6 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#58a6ff")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#30363d")}
              />
              <span style={styles.fieldHint}>{editBio.length}/300 karakter</span>
            </div>

            <div style={styles.formFooter}>
              <Link href={`/profile/${profile.username}`} style={styles.ghostBtn as React.CSSProperties}>
                Batal
              </Link>
              <button type="submit" disabled={saving} style={styles.primaryBtn}>
                {saving ? (
                  <><span style={styles.spinner} /> Menyimpan...</>
                ) : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

// ── Inline styles matching the app's dark GitHub theme ────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "clamp(1rem, 1.8vw, 1.5rem)",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    animation: "pageEnter 360ms ease",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.82rem",
    color: "#6e7681",
  },
  breadcrumbLink: {
    color: "#8b949e",
    textDecoration: "none",
  },
  breadcrumbSep: {
    color: "#3d444d",
  },
  breadcrumbCurrent: {
    color: "#e6edf3",
    fontWeight: 500,
  },
  container: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: "1.5rem",
    alignItems: "start",
  },
  // ── Avatar panel ──
  avatarPanel: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "14px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },
  sectionHeading: {
    fontSize: "0.9rem",
    fontWeight: 650,
    color: "#e6edf3",
    margin: 0,
    alignSelf: "flex-start",
    letterSpacing: "0.01em",
  },
  avatarWrapper: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: "50%",
    overflow: "hidden",
    border: "2px solid #30363d",
  },
  avatarImg: {
    borderRadius: "50%",
    objectFit: "cover",
    display: "block",
  },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #58a6ff, #1f6feb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "2.5rem",
    fontWeight: 700,
    userSelect: "none",
  },
  avatarOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.25rem",
    color: "#fff",
    cursor: "pointer",
    opacity: 0,
    transition: "opacity 180ms ease",
    borderRadius: "50%",
  },
  avatarActions: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    width: "100%",
  },
  avatarHint: {
    fontSize: "0.72rem",
    color: "#6e7681",
    textAlign: "center",
    margin: 0,
    lineHeight: 1.5,
  },
  // ── Form panel ──
  formPanel: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "14px",
    padding: "1.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#d7e0ea",
    letterSpacing: "0.01em",
  },
  inputWrapper: {
    position: "relative",
  },
  inputPrefix: {
    position: "absolute",
    left: "0.7rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6e7681",
    fontSize: "0.9rem",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    background: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: "8px",
    color: "#e6edf3",
    fontSize: "0.9rem",
    padding: "0.65rem 0.8rem",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 180ms ease, box-shadow 180ms ease",
    boxSizing: "border-box",
  },
  fieldHint: {
    fontSize: "0.73rem",
    color: "#6e7681",
  },
  fieldError: {
    fontSize: "0.8rem",
    color: "#ffb8b3",
    textAlign: "center",
    margin: 0,
  },
  alertError: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.85rem",
    color: "#ffb8b3",
    background: "rgba(248,81,73,0.1)",
    border: "1px solid rgba(248,81,73,0.4)",
    borderRadius: "8px",
    padding: "0.65rem 0.85rem",
  },
  alertSuccess: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.85rem",
    color: "#7ee787",
    background: "rgba(63,185,80,0.1)",
    border: "1px solid rgba(63,185,80,0.4)",
    borderRadius: "8px",
    padding: "0.65rem 0.85rem",
  },
  formFooter: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "0.75rem",
    marginTop: "0.25rem",
    paddingTop: "1rem",
    borderTop: "1px solid #30363d",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "#1f6feb",
    border: "1px solid #388bfd",
    color: "#fff",
    fontSize: "0.875rem",
    fontWeight: 600,
    padding: "0.5rem 1.15rem",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 180ms ease, transform 180ms ease",
    textDecoration: "none",
    whiteSpace: "nowrap" as const,
  },
  ghostBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: "transparent",
    border: "1px solid #30363d",
    color: "#8b949e",
    fontSize: "0.875rem",
    fontWeight: 500,
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 180ms ease, color 180ms ease",
    textDecoration: "none",
    whiteSpace: "nowrap" as const,
  },
  spinner: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  skeleton: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    padding: "1.5rem",
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "14px",
  },
  skeletonBlock: {
    background: "linear-gradient(90deg, #1f2630 25%, #2d3642 50%, #1f2630 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: "6px",
  },
  errorBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    padding: "2.5rem",
    background: "#161b22",
    border: "1px solid rgba(248,81,73,0.3)",
    borderRadius: "14px",
    textAlign: "center",
    color: "#ffb8b3",
    fontSize: "0.9rem",
  },
  backLink: {
    color: "#8b949e",
    textDecoration: "none",
    fontSize: "0.85rem",
  },
}