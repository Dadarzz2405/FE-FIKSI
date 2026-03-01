"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { request, getMyPosts, type ProfileData } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import RankBadge from "@/components/RankBadge"
import XPBar from "@/components/XPBar"

type Post = {
  id: string; title: string; excerpt: string | null
  is_published: boolean; created_at: string
}

function StatPill({
  label, value, accent, icon,
}: { label: string; value: number | string; accent: string; icon: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "0.3rem",
      background: `${accent}10`, border: `1px solid ${accent}28`,
      borderRadius: 12, padding: "0.85rem 1rem", flex: "1 1 110px",
      position: "relative", overflow: "hidden",
    }}>
      <span style={{
        position: "absolute", right: "0.5rem", top: "0.3rem",
        fontSize: "2rem", opacity: 0.07, userSelect: "none",
      }}>{icon}</span>
      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: accent,
        textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
      <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e0ecff",
        letterSpacing: "-0.03em", lineHeight: 1 }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  )
}

export default function ProfilePage() {
  const params = useParams()
  const rawUsername = params?.username as string
  const username = rawUsername?.replace(/^@/, "")

  const { user: authUser, token, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loadedUsername, setLoadedUsername] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const loading = !!username && loadedUsername !== username

  const isOwn = !authLoading && !!authUser && !!profile && (
    authUser.id === profile.id ||
    authUser.username?.replace(/^@/,"").toLowerCase() === username?.toLowerCase()
  )

  useEffect(() => {
    if (!username) return
    let gone = false
    request<ProfileData>(`/profile/${username}`)
      .then(d => {
        if (!gone) {
          setProfile(d)
          setError(null)
        }
      })
      .catch(() => {
        if (!gone) {
          setProfile(null)
          setError("Profil tidak ditemukan.")
        }
      })
      .finally(() => {
        if (!gone) setLoadedUsername(username)
      })
    return () => { gone = true }
  }, [username])

  useEffect(() => {
    if (!isOwn || !token) return
    getMyPosts(token, 1, 20).then(r => setPosts(r.posts)).catch(() => {})
  }, [isOwn, token])

  const wrap: React.CSSProperties = {
    maxWidth: 760, margin: "0 auto",
    padding: "clamp(1rem, 2vw, 1.5rem)",
    display: "flex", flexDirection: "column", gap: "1.5rem",
    animation: "pgIn 350ms ease",
  }

  if (loading) return (
    <main style={wrap}>
      <style>{`@keyframes pgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
      <p style={{ color: "#4a5a78" }}>Memuat profil...</p>
    </main>
  )

  if (error || !profile) return (
    <main style={wrap}>
      <style>{`@keyframes pgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
      <p style={{ color: "#ff8080" }}>{error ?? "Profil tidak ditemukan."}</p>
      <Link href="/" style={{ color: "#4a5a78", fontSize: "0.875rem" }}>← Beranda</Link>
    </main>
  )

  const joined = new Date(profile.created_at).toLocaleDateString("id-ID", {
    month: "long", year: "numeric",
  })

  return (
    <main style={wrap}>
      <style>{`
        @keyframes pgIn  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
        @keyframes rowIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:none; } }
        .post-row:hover { background: #111c2a !important; border-color: #2a3a52 !important; }
      `}</style>

      {/* ── Profile header ── */}
      <div style={{
        background: "linear-gradient(160deg, #0f1825, #0a1020)",
        border: "1px solid #1a2535", borderRadius: 16, padding: "1.75rem",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start",
          gap: "1.25rem", flexWrap: "wrap" }}>
          {/* Avatar */}
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.username}
              width={80} height={80}
              style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0,
                border: "2px solid #1a2535", display: "block" }} />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #4facfe, #1a6cff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: "2rem", fontWeight: 800,
            }}>
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start",
              justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
              <div>
                <h1 style={{ fontSize: "1.45rem", fontWeight: 800,
                  letterSpacing: "-0.025em", color: "#e8f0ff", margin: 0 }}>
                  {profile.real_name || profile.username}
                </h1>
                <p style={{ color: "#3a4a62", margin: "0.15rem 0 0",
                  fontSize: "0.88rem" }}>
                  @{profile.username.replace(/^@/, "")}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <RankBadge rank={profile.rank} size="sm" animated />
                {isOwn && (
                  <Link href={`/profile/${profile.username}/edit`} style={{
                    fontSize: "0.78rem", color: "#4a5a78",
                    padding: "0.3rem 0.65rem", borderRadius: 7,
                    border: "1px solid #1a2535", textDecoration: "none",
                  }}>
                    ✎ Edit
                  </Link>
                )}
              </div>
            </div>

            {profile.bio && (
              <p style={{ color: "#6a7a92", marginTop: "0.75rem",
                lineHeight: 1.65, fontSize: "0.88rem" }}>
                {profile.bio}
              </p>
            )}
            <p style={{ color: "#2a3a52", marginTop: "0.5rem", fontSize: "0.75rem" }}>
              Bergabung {joined}
            </p>
          </div>
        </div>

        {/* ── XP bar ── */}
        <div style={{
          marginTop: "1.25rem", paddingTop: "1.25rem",
          borderTop: "1px solid #111820",
        }}>
          <XPBar
            level={profile.level}
            xpCurrent={profile.xp_current}
            xpToNext={profile.xp_to_next_level}
          />
        </div>

        {/* ── Stat pills ── */}
        <div style={{
          marginTop: "1.1rem",
          display: "flex", gap: "0.75rem", flexWrap: "wrap",
        }}>
          <StatPill label="Reputasi" value={profile.reputation} accent="#3fb950" icon="⭐" />
          <StatPill label="CP"       value={profile.cp_total}   accent="#f78166" icon="🏆" />
          <StatPill label="Total XP" value={profile.xp_total}   accent="#4facfe" icon="✨" />
        </div>

        {/* CP → rank progress */}
        {profile.cp_to_next_rank != null && (
          <div style={{ marginTop: "0.9rem" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: "0.68rem", color: "#3a4a62", marginBottom: "0.3rem",
            }}>
              <span>{profile.rank.name}</span>
              <span>{profile.cp_to_next_rank.toLocaleString()} CP untuk naik pangkat</span>
            </div>
            <div style={{
              height: 4, borderRadius: 999, background: "rgba(247,129,102,0.1)",
              border: "1px solid rgba(247,129,102,0.2)", overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${Math.round((profile.cp_total / (profile.cp_total + profile.cp_to_next_rank)) * 100)}%`,
                background: "linear-gradient(90deg, #c0430a, #f78166)",
                borderRadius: 999, boxShadow: "0 0 6px rgba(247,129,102,0.4)",
              }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Posts (own profile only) ── */}
      {isOwn && (
        <div>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingBottom: "0.75rem", borderBottom: "1px solid #111820", marginBottom: "0.85rem",
          }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#c8d8f0", margin: 0 }}>
              Pertanyaan Saya
            </h2>
            <Link href="/posts/new" style={{
              fontSize: "0.78rem", color: "#4facfe",
              padding: "0.3rem 0.7rem", borderRadius: 7,
              border: "1px solid rgba(79,172,254,0.25)", textDecoration: "none",
            }}>
              + Baru
            </Link>
          </div>

          {posts.length === 0 ? (
            <div style={{
              padding: "2.5rem 1rem", textAlign: "center",
              border: "1px dashed #1a2535", borderRadius: 12, color: "#3a4a62",
            }}>
              <p style={{ margin: "0 0 0.5rem" }}>Belum ada pertanyaan.</p>
              <Link href="/posts" style={{ fontSize: "0.84rem", color: "#4facfe" }}>
                Ajukan pertanyaan pertama →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {posts.map((post, i) => (
                <Link key={post.id} href={`/posts/${post.id}`}
                  className="post-row"
                  style={{
                    display: "block", padding: "1rem 1.1rem",
                    background: "#0f1825", border: "1px solid #1a2535",
                    borderRadius: 10, textDecoration: "none", color: "inherit",
                    transition: "background 160ms, border-color 160ms",
                    animation: `rowIn ${200 + i * 40}ms ease both`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.93rem",
                      color: "#c8d8f0", flex: 1 }}>
                      {post.title}
                    </span>
                    {!post.is_published && (
                      <span style={{
                        fontSize: "0.65rem", fontWeight: 700,
                        padding: "0.12rem 0.45rem", borderRadius: 999,
                        background: "rgba(210,153,34,0.15)", color: "#e3b341",
                        border: "1px solid rgba(210,153,34,0.35)",
                      }}>
                        DRAFT
                      </span>
                    )}
                  </div>
                  {post.excerpt && (
                    <p style={{
                      fontSize: "0.8rem", color: "#3a4a62", marginTop: "0.3rem",
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>
                      {post.excerpt}
                    </p>
                  )}
                  <p style={{ fontSize: "0.72rem", color: "#2a3a52", marginTop: "0.4rem" }}>
                    {new Date(post.created_at).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
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
