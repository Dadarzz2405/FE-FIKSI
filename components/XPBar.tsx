"use client"

interface Props {
  level: number
  xpCurrent: number
  xpToNext: number
}

export default function XPBar({ level, xpCurrent, xpToNext }: Props) {
  const safeToNext = Math.max(xpToNext, 1)
  const percent = Math.max(0, Math.min(100, Math.round((xpCurrent / safeToNext) * 100)))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        color: "#6a7a92", fontSize: "0.74rem", fontWeight: 600,
      }}>
        <span>Level {level}</span>
        <span>{xpCurrent.toLocaleString()} / {xpToNext.toLocaleString()} XP</span>
      </div>

      <div style={{
        height: 8, borderRadius: 999, overflow: "hidden",
        background: "rgba(79,172,254,0.12)",
        border: "1px solid rgba(79,172,254,0.25)",
      }}>
        <div style={{
          width: `${percent}%`,
          height: "100%",
          borderRadius: 999,
          background: "linear-gradient(90deg, #1a6cff, #4facfe)",
          boxShadow: "0 0 10px rgba(79,172,254,0.45)",
          transition: "width 220ms ease",
        }} />
      </div>
    </div>
  )
}
