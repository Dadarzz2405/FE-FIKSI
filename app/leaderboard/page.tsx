"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { getLeaderboard, type LeaderboardEntry } from "@/lib/api"
import RankBadge from "@/components/RankBadge"

type SortKey = "reputation" | "xp_total" | "cp_total" | "level"

const TABS: { key: SortKey; label: string; icon: string; accent: string }[] = [
  { key: "reputation", label: "Reputasi",  icon: "⭐", accent: "#3fb950" },
  { key: "cp_total",   label: "CP",        icon: "🏆", accent: "#f78166" },
  { key: "xp_total",   label: "Total XP",  icon: "✨", accent: "#4facfe" },
  { key: "level",      label: "Level",     icon: "🔮", accent: "#d2a8ff" },
]

const MEDAL = ["🥇", "🥈", "🥉"]
const PODIUM_H   = [110, 80, 60]
const PODIUM_CLR = ["rgba(230,180,0,0.25)", "rgba(192,192,210,0.18)", "rgba(180,120,60,0.18)"]
const PODIUM_BDR = ["rgba(230,180,0,0.5)",  "rgba(192,192,210,0.4)",  "rgba(180,120,60,0.4)"]

function Avatar({ entry, size }: { entry: LeaderboardEntry; size: number }) {
  return entry.avatar_url ? (
    <Image src={entry.avatar_url} alt={entry.username} width={size} height={size}
      style={{ borderRadius: "50%", objectFit: "cover", display: "block" }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #4facfe, #1a6cff)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800,
      fontSize: size * 0.38,
    }}>
      {entry.username.charAt(0).toUpperCase()}
    </div>
  )
}

function Podium({ entries, sortKey }: { entries: LeaderboardEntry[]; sortKey: SortKey }) {
  // Reorder to [2nd, 1st, 3rd]
  const order = [entries[1], entries[0], entries[2]].filter(Boolean)

  const val = (e: LeaderboardEntry) =>
    sortKey === "reputation" ? e.reputation
    : sortKey === "cp_total"   ? e.cp_total
    : sortKey === "xp_total"   ? e.xp_total
    : e.level

  const suffix = sortKey === "level" ? "" : sortKey === "cp_total" ? " CP" : sortKey === "xp_total" ? " XP" : " REP"

  return (
    <div style={{
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      gap: "0.75rem", padding: "1.5rem 1rem 0",
    }}>
      {order.map((entry) => {
        const realPos = entry.rank_position - 1 // 0-indexed original position
        const height  = PODIUM_H[realPos]
        const isFirst = entry.rank_position === 1
        const avatarSz = isFirst ? 64 : 52

        return (
          <Link
            key={entry.user_id} href={`/profile/${entry.username}`}
            style={{ textDecoration: "none", color: "inherit",
              flex: 1, maxWidth: 150, display: "flex",
              flexDirection: "column", alignItems: "center", gap: "0.4rem" }}
          >
            {isFirst && (
              <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>👑</span>
            )}

            <div style={{ position: "relative" }}>
              <div style={{
                padding: 3, borderRadius: "50%",
                background: PODIUM_BDR[realPos],
                boxShadow: isFirst ? `0 0 20px rgba(230,180,0,0.35)` : "none",
              }}>
                <Avatar entry={entry} size={avatarSz} />
              </div>
              <span style={{
                position: "absolute", bottom: -2, right: -2,
                fontSize: "1rem", lineHeight: 1,
                filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))",
              }}>
                {MEDAL[realPos]}
              </span>
            </div>

            <span style={{
              fontSize: "0.8rem", fontWeight: 700, color: "#c8d8f0",
              textAlign: "center", wordBreak: "break-word",
            }}>
              @{entry.username}
            </span>
            <RankBadge rank={{ name: entry.rank_name, icon: entry.rank_icon }} size="xs" animated />

            {/* Podium block */}
            <div style={{
              width: "100%", height,
              background: PODIUM_CLR[realPos],
              border: `1px solid ${PODIUM_BDR[realPos]}`,
              borderRadius: "8px 8px 0 0",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 2,
            }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#e8f0ff" }}>
                {val(entry).toLocaleString()}{suffix}
              </span>
              <span style={{ fontSize: "0.62rem", color: "#4a5a78" }}>
                Lv.{entry.level}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>("reputation")

  useEffect(() => {
    getLeaderboard(sortKey)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [sortKey])

  const top3    = entries.slice(0, 3)
  const theRest = entries.slice(3)
  const tab     = TABS.find(t => t.key === sortKey)!

  const valLabel = sortKey === "level" ? (e: LeaderboardEntry) => `Lv. ${e.level}`
    : sortKey === "cp_total"   ? (e: LeaderboardEntry) => `${e.cp_total.toLocaleString()} CP`
    : sortKey === "xp_total"   ? (e: LeaderboardEntry) => `${e.xp_total.toLocaleString()} XP`
    : (e: LeaderboardEntry) => `${e.reputation.toLocaleString()} REP`

  return (
    <main style={{
      maxWidth: 720, margin: "0 auto",
      padding: "clamp(1rem, 2vw, 1.5rem)",
      display: "flex", flexDirection: "column", gap: "1.25rem",
      animation: "pgIn 350ms ease",
    }}>
      <style>{`
        @keyframes pgIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
        @keyframes rowIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:none; } }
        .lb-row:hover { background: #111c2a !important; }
      `}</style>

      {/* Title */}
      <div>
        <h1 style={{ fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)", fontWeight: 800,
          letterSpacing: "-0.03em", color: "#e8f0ff", margin: 0 }}>
          Papan Peringkat
        </h1>
        <p style={{ color: "#4a5a78", fontSize: "0.88rem", marginTop: "0.25rem" }}>
          Pengguna paling berdedikasi di Nusa CoNex
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button
            key={t.key} type="button" onClick={() => {
              if (sortKey === t.key) return
              setLoading(true)
              setSortKey(t.key)
            }}
            style={{
              display: "flex", alignItems: "center", gap: "0.35rem",
              padding: "0.4rem 0.85rem", borderRadius: 8, border: "1px solid",
              fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
              transition: "all 160ms ease",
              background: sortKey === t.key ? `${t.accent}18` : "transparent",
              borderColor: sortKey === t.key ? `${t.accent}55` : "#1a2535",
              color: sortKey === t.key ? t.accent : "#4a5a78",
            }}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{
          height: 200, display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px dashed #1a2535", borderRadius: 14, color: "#4a5a78",
        }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%",
            border: "2px solid #1a2535", borderTopColor: tab.accent,
            animation: "spin 700ms linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : entries.length === 0 ? (
        <div style={{
          height: 180, display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px dashed #1a2535", borderRadius: 14, color: "#4a5a78",
          fontSize: "0.9rem",
        }}>
          Belum ada data peringkat.
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length >= 2 && (
            <div style={{
              background: "linear-gradient(160deg, #0f1825, #0a1020)",
              border: "1px solid #1a2535", borderRadius: 14, overflow: "hidden",
            }}>
              <Podium entries={top3} sortKey={sortKey} />
            </div>
          )}

          {/* Rest of list */}
          <div style={{
            background: "linear-gradient(160deg, #0f1825, #0a1020)",
            border: "1px solid #1a2535", borderRadius: 14, overflow: "hidden",
          }}>
            {theRest.map((entry, i) => (
              <Link
                key={entry.user_id} href={`/profile/${entry.username}`}
                className="lb-row"
                style={{
                  display: "flex", alignItems: "center", gap: "0.85rem",
                  padding: "0.85rem 1.1rem",
                  borderBottom: i < theRest.length - 1 ? "1px solid #111820" : "none",
                  textDecoration: "none", color: "inherit",
                  transition: "background 160ms ease",
                  animation: `rowIn ${180 + i * 35}ms ease both`,
                }}
              >
                {/* Position */}
                <span style={{ width: 28, textAlign: "center", flexShrink: 0,
                  fontSize: "0.82rem", fontWeight: 700, color: "#2a3a52" }}>
                  #{entry.rank_position}
                </span>

                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                  <Avatar entry={entry} size={36} />
                </div>

                {/* Name + badge */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center",
                    gap: "0.45rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#c8d8f0" }}>
                      @{entry.username}
                    </span>
                    <RankBadge rank={{ name: entry.rank_name, icon: entry.rank_icon }}
                      size="xs" animated />
                  </div>
                  {entry.real_name && (
                    <span style={{ fontSize: "0.75rem", color: "#3a4a62" }}>
                      {entry.real_name}
                    </span>
                  )}
                </div>

                {/* Score */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800,
                    color: tab.accent }}>
                    {valLabel(entry)}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#3a4a62" }}>
                    Lv. {entry.level}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
