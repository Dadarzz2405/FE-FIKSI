"use client"

import { useLanguage } from "@/i18n/LanguageContext"

interface LanguageToggleProps {
  compact?: boolean
}

export default function LanguageToggle({ compact = false }: LanguageToggleProps) {
  const { locale, toggleLocale, translating } = useLanguage()

  const isID = locale === "id"

  return (
    <button
      type="button"
      onClick={toggleLocale}
      disabled={translating}
      title={
        translating
          ? "Translating..."
          : isID
          ? "Switch to English"
          : "Ganti ke Bahasa Indonesia"
      }
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        background: "transparent",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        color: translating ? "var(--text-muted)" : "var(--text-secondary)",
        fontSize: "0.8rem",
        fontWeight: 600,
        padding: compact ? "0.35rem 0.5rem" : "0.4rem 0.75rem",
        cursor: translating ? "not-allowed" : "pointer",
        transition: "border-color 180ms ease, color 180ms ease, background 180ms ease",
        whiteSpace: "nowrap",
        letterSpacing: "0.02em",
        opacity: translating ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (translating) return
        e.currentTarget.style.borderColor = "var(--accent)"
        e.currentTarget.style.color = "var(--text-primary)"
        e.currentTarget.style.background = "var(--accent-soft)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-color)"
        e.currentTarget.style.color = "var(--text-secondary)"
        e.currentTarget.style.background = "transparent"
      }}
    >
      {translating ? (
        <>
          <span style={{
            display: "inline-block",
            width: "12px",
            height: "12px",
            border: "2px solid var(--border-color)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }} />
          {!compact && <span style={{ fontSize: "0.75rem" }}>...</span>}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      ) : (
        <>
          <span style={{ fontSize: "1rem", lineHeight: 1 }}>
            {isID ? "🇮🇩" : "🇬🇧"}
          </span>
          {!compact && <span>{isID ? "ID" : "EN"}</span>}
        </>
      )}
    </button>
  )
}