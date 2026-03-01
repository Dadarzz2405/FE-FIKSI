"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { request, type ProfileData } from "@/lib/api"
import RankBadge from "@/components/RankBadge"
import XPBar from "@/components/XPBar"

// ── tiny animated counter ─────────────────────────────────────────────────

function Counter({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    let raf: number
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * to))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])
  return <>{val.toLocaleString()}</>
}

// ── single stat tile ─────────────────────────────────────────────────────

function Tile({
  label, value, accent, icon, sub,
}: {
  label: string
  value: number
  accent: string
  icon: string
  sub?: string
}) {
  return (
    <div style={{
      flex: "1 1 120px",
      background: `linear-gradient(135deg, ${accent}14, ${accent}06)`,
      border: `1px solid ${accent}30`,
      borderRadius: 14,
      padding: "1rem 1.1rem",
      display: "flex", flexDirection: "column", gap: "0.35rem",
      position: "relative", overflow: "hidden",
      transition: "transform 180ms ease, box-shadow 180ms ease",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"
        ;(e.currentTarget as HTMLElement).style.boxShadow = `0 6px 24px ${accent}28`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = ""
        ;(e.currentTarget as HTMLElement).style.boxShadow = ""
      }}
    >
      {/* Background icon */}
      <span style={{
        position: "absolute", right: "0.6rem", top: "0.4rem",
        fontSize: "2.2rem", opacity: 0.08, userSelect: "none",
        filter: "grayscale(0.2)",
      }}>
        {icon}
      </span>

      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: accent,
        textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
      <span style={{ fontSize: "1.7rem", fontWeight: 800, color: "#e8f0ff",
        lineHeight: 1, letterSpacing: "-0.03em" }}>
        <Counter to={value} />
      </span>
      {sub && (
        <span style={{ fontSize: "0.7rem", color: "#5a6a88" }}>{sub}</span>
      )}
    </div>
  )
}

// ── main widget ──────────────────────────────────────────────────────────

export default function GamificationWidget() {
  const { user: authUser, token, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [failed, setFailed] = useState(false)
  const username = authUser?.username

  useEffect(() => {
    if (authLoading || !username || !token) return
    let cancelled = false
    request<ProfileData>(`/profile/${username}`)
      .then((data) => {
        if (!cancelled) {
          setProfile(data)
          setFailed(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfile(null)
          setFailed(true)
        }
      })
    return () => { cancelled = true }
  }, [authLoading, username, token])

  const hasAuth = !!username && !!token
  const isStaleProfile = !!profile && !!username && profile.username !== username

  if (authLoading || (hasAuth && !failed && (!profile || isStaleProfile))) return (
    <div style={{
      background: "#0f1620", border: "1px solid #1e2a3a",
      borderRadius: 16, padding: "1.25rem",
      height: 160, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        border: "2px solid #1e2a3a",
        borderTopColor: "#4facfe",
        animation: "spin 700ms linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!hasAuth) return null
  if (!profile) return null

  const cpToNext = profile.cp_to_next_rank

  return (
    <section style={{
      background: "linear-gradient(160deg, #0f1825 0%, #0a1020 100%)",
      border: "1px solid #1a2535",
      borderRadius: 16,
      padding: "1.25rem",
      display: "flex", flexDirection: "column", gap: "1.1rem",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#c8d8f0" }}>
            Statistik Kamu
          </span>
          <RankBadge rank={profile.rank} size="sm" animated />
        </div>
        <Link href={`/profile/${profile.username}`} style={{
          fontSize: "0.75rem", color: "#4facfe", textDecoration: "none",
          padding: "0.25rem 0.6rem", borderRadius: 6,
          border: "1px solid rgba(79,172,254,0.25)",
        }}>
          Profil →
        </Link>
      </div>

      {/* XP bar */}
      <XPBar
        level={profile.level}
        xpCurrent={profile.xp_current}
        xpToNext={profile.xp_to_next_level}
      />

      {/* Stat tiles */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Tile
          label="Reputasi" value={profile.reputation} accent="#3fb950" icon="⭐"
          sub="Skor aktivitas harian"
        />
        <Tile
          label="CP" value={profile.cp_total} accent="#f78166" icon="🏆"
          sub={cpToNext ? `+${cpToNext} CP untuk naik pangkat` : "Pangkat tertinggi! 🎉"}
        />
        <Tile
          label="Total XP" value={profile.xp_total} accent="#4facfe" icon="✨"
          sub={`Level ${profile.level}`}
        />
      </div>

      {/* CP → rank progress bar */}
      {cpToNext && (
        <div>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: "0.68rem", color: "#4a5a78", marginBottom: "0.3rem",
          }}>
            <span>{profile.rank.name}</span>
            <span>{cpToNext.toLocaleString()} CP tersisa</span>
          </div>
          <div style={{
            height: 4, borderRadius: 999,
            background: "rgba(247,129,102,0.1)",
            border: "1px solid rgba(247,129,102,0.2)",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${Math.round((profile.cp_total / (profile.cp_total + cpToNext)) * 100)}%`,
              background: "linear-gradient(90deg, #c0430a, #f78166)",
              borderRadius: 999,
              boxShadow: "0 0 6px rgba(247,129,102,0.45)",
            }} />
          </div>
        </div>
      )}
    </section>
  )
}
