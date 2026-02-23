"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { request, getMyPosts } from "@/lib/api"
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
  const username = rawUsername?.replace(/^@/, "")

  const { user: currentUser, token, loading: authLoading } = useAuth()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const normalize = (u: string) => u?.replace(/^@/, "").toLowerCase() ?? ""
  const isOwnProfile =
    !authLoading &&
    !!currentUser &&
    (normalize(currentUser.username) === normalize(username) ||
      normalize(currentUser.username) === normalize(rawUsername))

  useEffect(() => {
    if (!username) return
    let cancelled = false
    const tid = setTimeout(() => {
      setProfile(null)
      setError(null)
      setLoading(true)
    }, 0)
    request<Profile>(`/profile/${username}`)
      .then((data) => {
        if (!cancelled) setProfile(data)
      })
      .catch(() => {
        if (!cancelled) setError("Profil tidak ditemukan.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
      clearTimeout(tid)
    }
  }, [username])

  useEffect(() => {
    if (!isOwnProfile || !token) return
    getMyPosts(token, 1, 20)
      .then((res) => setPosts(res.posts))
      .catch(() => {})
  }, [isOwnProfile, token])

  const page: React.CSSProperties = {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "clamp(1rem, 1.8vw, 1.5rem)",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  }
  const card: React.CSSProperties = {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "14px",
    padding: "1.75rem",
  }

  if (loading)
    return (
      <main style={page}>
        <p style={{ color: "var(--text-secondary)" }}>Memuat profil...</p>
      </main>
    )

  if (error || !profile)
    return (
      <main style={page}>
        <p style={{ color: "#ffb8b3" }}>{error ?? "Profil tidak ditemukan."}</p>
        <Link href="/" style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          ← Beranda
        </Link>
      </main>
    )

  const joinDate = new Date(profile.created_at).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  })

  return (
    <main style={page}>
      {/* ── Profile card ── */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.username}
                width={80}
                height={80}
                style={{
                  borderRadius: "50%",
                  border: "2px solid var(--border-color)",
                  display: "block",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #58a6ff, #1f6feb)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "2rem",
                  fontWeight: 700,
                  userSelect: "none",
                }}
              >
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
                  {profile.real_name || profile.username}
                </h1>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    margin: "0.2rem 0 0",
                    fontSize: "0.9rem",
                  }}
                >
                  @{profile.username.replace(/^@/, "")}
                </p>
              </div>

              {/* Edit button — redirects to dedicated edit page */}
              {isOwnProfile && (
                <Link
                  href={`/profile/${profile.username}/edit`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: "transparent",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-secondary)",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    padding: "0.4rem 0.85rem",
                    borderRadius: "8px",
                    textDecoration: "none",
                    transition: "border-color 180ms ease, color 180ms ease",
                    whiteSpace: "nowrap",
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
                </Link>
              )}
            </div>

            {profile.bio && (
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginTop: "0.75rem",
                  lineHeight: 1.6,
                  fontSize: "0.9rem",
                }}
              >
                {profile.bio}
              </p>
            )}
            <p
              style={{
                color: "var(--text-muted)",
                marginTop: "0.6rem",
                fontSize: "0.8rem",
              }}
            >
              Bergabung {joinDate}
            </p>
          </div>
        </div>
      </div>

      {/* ── Posts list (own profile only) ── */}
      {isOwnProfile && (
        <div>
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 650,
              marginBottom: "0.85rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            Pertanyaan Saya
          </h2>

          {posts.length === 0 ? (
            <div
              style={{
                padding: "2rem 1rem",
                textAlign: "center",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                border: "1px dashed var(--border-color)",
                borderRadius: "10px",
              }}
            >
              <p>Belum ada pertanyaan.</p>
              <Link
                href="/posts"
                style={{
                  display: "inline-block",
                  marginTop: "0.5rem",
                  fontSize: "0.85rem",
                }}
              >
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
                    display: "block",
                    padding: "1rem 1.1rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "10px",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "border-color 180ms ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        color: "var(--text-primary)",
                        flex: 1,
                      }}
                    >
                      {post.title}
                    </span>
                    {!post.is_published && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "999px",
                          background: "rgba(210,153,34,0.15)",
                          color: "#e3b341",
                          border: "1px solid rgba(210,153,34,0.4)",
                        }}
                      >
                        DRAFT
                      </span>
                    )}
                  </div>
                  {post.excerpt && (
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        marginTop: "0.3rem",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {post.excerpt}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      marginTop: "0.4rem",
                    }}
                  >
                    {new Date(post.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
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