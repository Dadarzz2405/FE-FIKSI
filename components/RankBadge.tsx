"use client"
/**
 * File: components/RankBadge.tsx
 * Purpose: Small visual component that renders a user's rank badge.
 * Notes: supports animated shimmer for high tiers.
 */

export type RankData = { name: string; icon: string; min_rep?: number }

interface Props {
  rank: RankData
  size?: "xs" | "sm" | "md" | "lg"
  showName?: boolean
  animated?: boolean   // shimmer on Diamond/Platinum
}

const TIERS: Record<string, { bg: string; border: string; text: string; glow?: string }> = {
  Bronze:   { bg: "rgba(180,120,60,0.12)",  border: "rgba(180,120,60,0.45)",  text: "#e0a060" },
  Silver:   { bg: "rgba(192,192,210,0.12)", border: "rgba(192,192,210,0.45)", text: "#c0c0d0" },
  Gold:     { bg: "rgba(230,180,0,0.14)",   border: "rgba(230,180,0,0.5)",    text: "#f0c020" },
  Platinum: { bg: "rgba(72,209,204,0.12)",  border: "rgba(72,209,204,0.45)",  text: "#48d1cc", glow: "0 0 8px rgba(72,209,204,0.35)" },
  Diamond:  { bg: "rgba(96,180,255,0.13)",  border: "rgba(96,180,255,0.5)",   text: "#78b4ff", glow: "0 0 10px rgba(96,180,255,0.4)" },
}

const PAD = { xs: "0.1rem 0.35rem", sm: "0.15rem 0.5rem", md: "0.25rem 0.7rem", lg: "0.35rem 0.9rem" }
const FSZ = { xs: "0.65rem", sm: "0.75rem", md: "0.83rem", lg: "0.95rem" }
const ISZ = { xs: "0.75rem", sm: "0.85rem", md: "1rem",    lg: "1.15rem" }

export default function RankBadge({ rank, size = "sm", showName = true, animated = true }: Props) {
  const t   = TIERS[rank.name] ?? TIERS.Bronze
  const hi  = animated && (rank.name === "Diamond" || rank.name === "Platinum")

  return (
    <>
      {hi && (
        <style>{`
          @keyframes rb-shimmer {
            0%   { background-position: -200% center; }
            100% { background-position:  200% center; }
          }
          .rb-shimmer {
            background: linear-gradient(90deg, ${t.text} 0%, #fff 40%, ${t.text} 60%, #fff 80%, ${t.text} 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: rb-shimmer 3s linear infinite;
          }
        `}</style>
      )}
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "0.28rem",
        padding: PAD[size], borderRadius: 999,
        background: t.bg, border: `1px solid ${t.border}`,
        fontSize: FSZ[size], fontWeight: 700,
        boxShadow: t.glow,
        whiteSpace: "nowrap", letterSpacing: "0.01em",
        userSelect: "none",
        transition: "box-shadow 200ms ease",
      }}>
        <span style={{ fontSize: ISZ[size], lineHeight: 1 }}>{rank.icon}</span>
        {showName && (
          <span className={hi ? "rb-shimmer" : ""} style={hi ? {} : { color: t.text }}>
            {rank.name}
          </span>
        )}
      </span>
    </>
  )
}