"use client"

/**
 * i18n/LanguageContext.tsx
 *
 * - Indonesian (id.ts) is the ONLY file you maintain
 * - English is auto-translated via MyMemory API (5k chars/day free, 50k with email)
 * - Result is cached in localStorage — API is only called once,
 *   or when you add/change strings in id.ts
 * - While translating, falls back to Indonesian seamlessly
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import id from "./id"
import type { TranslationKeys } from "./id"

// ── Types ────────────────────────────────────────────────────────────────────

export type Locale = "id" | "en"

interface LanguageContextValue {
  locale: Locale
  t: TranslationKeys
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  translating: boolean
}

// ── Storage keys ─────────────────────────────────────────────────────────────

const LOCALE_KEY = "nusa_locale"
const EN_CACHE_KEY = "nusa_en_translation"
const EN_HASH_KEY = "nusa_en_hash"
const DEFAULT_LOCALE: Locale = "id"

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Cheap hash so we know when id.ts has changed and cache needs busting */
function hashObject(obj: object): string {
  const str = JSON.stringify(obj)
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(36)
}

/** Recursively collect all leaf strings from the nested translation object */
function collectStrings(obj: object, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === "string") {
      result[fullKey] = value
    } else if (typeof value === "object" && value !== null) {
      Object.assign(result, collectStrings(value, fullKey))
    }
  }
  return result
}

/** Rebuild the nested object from flat key→value pairs */
function unflattenStrings(flat: Record<string, string>): TranslationKeys {
  const result: Record<string, unknown> = {}
  for (const [dotKey, value] of Object.entries(flat)) {
    const parts = dotKey.split(".")
    let cur = result
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]]) cur[parts[i]] = {}
      cur = cur[parts[i]] as Record<string, unknown>
    }
    cur[parts[parts.length - 1]] = value
  }
  return result as TranslationKeys
}

/**
 * Translate a batch of strings using the MyMemory Translation API.
 *
 * Why MyMemory:
 *  - Free and reliable translations
 *  - No API key required for basic usage
 *  - Free tier: 5,000 characters/day (anonymous), 50,000 characters/day (with email)
 *  - Simple REST API with GET requests
 *
 * Setup (optional for higher limits):
 *  Add to .env: NEXT_PUBLIC_MYMEMORY_EMAIL=your-email@example.com
 *
 * MyMemory processes one string at a time, so we make concurrent requests in small batches.
 */
async function translateBatch(
  strings: Record<string, string>,
  targetLang: string
): Promise<Record<string, string>> {
  const email = process.env.NEXT_PUBLIC_MYMEMORY_EMAIL
  
  const entries = Object.entries(strings)
  const translated: Record<string, string> = {}

  // Separate strings that don't need translation (symbols, emoji, numbers)
  const toTranslate: typeof entries = []
  for (const [key, text] of entries) {
    if (!text.trim() || /^[\s\W\d]+$/.test(text)) {
      translated[key] = text
    } else {
      toTranslate.push([key, text])
    }
  }

  // MyMemory API processes one string at a time, but we can make concurrent requests
  // We'll process in smaller batches to avoid overwhelming the API
  const CHUNK_SIZE = 10
  for (let i = 0; i < toTranslate.length; i += CHUNK_SIZE) {
    const chunk = toTranslate.slice(i, i + CHUNK_SIZE)
    
    // Process chunk concurrently
    const promises = chunk.map(async ([key, text]) => {
      try {
        // Build URL with parameters
        const params = new URLSearchParams({
          q: text,
          langpair: `id|${targetLang}`,
        })
        
        // Add email if provided for higher limits
        if (email) {
          params.append('de', email)
        }

        const res = await fetch(
          `https://api.mymemory.translated.net/get?${params.toString()}`
        )

        if (!res.ok) {
          console.error(`[i18n] MyMemory API error for "${text}":`, res.status, res.statusText)
          return [key, text] // Fall back to original text
        }

        const data = await res.json()
        
        // MyMemory returns the translation in responseData.translatedText
        const translatedText = data?.responseData?.translatedText
        if (translatedText && translatedText !== text) {
          return [key, translatedText]
        } else {
          return [key, text] // Fall back to original text
        }
      } catch (err) {
        console.error(`[i18n] Network error calling MyMemory for "${text}":`, err)
        return [key, text] // Fall back to original text
      }
    })

    // Wait for all translations in this chunk to complete
    const results = await Promise.all(promises)
    
    // Add results to translated object
    for (const [key, translatedText] of results) {
      translated[key] = translatedText
    }

    // Add a small delay between chunks to be respectful to the API
    if (i + CHUNK_SIZE < toTranslate.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return translated
}

// ── Context ──────────────────────────────────────────────────────────────────

const LanguageContext = createContext<LanguageContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [enTranslation, setEnTranslation] = useState<TranslationKeys | null>(null)
  const [translating, setTranslating] = useState(false)

  // On mount: restore saved locale preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_KEY) as Locale | null
      if (stored === "en" || stored === "id") setLocaleState(stored)
    } catch { /* SSR / private mode — ignore */ }
  }, [])

  // Whenever locale switches to English, load the translation
  useEffect(() => {
    if (locale !== "en") return
    if (enTranslation) return // already loaded this session

    // Check localStorage cache first
    try {
      const currentHash = hashObject(id)
      const cachedHash = localStorage.getItem(EN_HASH_KEY)
      const cachedData = localStorage.getItem(EN_CACHE_KEY)

      if (cachedHash === currentHash && cachedData) {
        // Cache hit — id.ts hasn't changed since last translation
        setEnTranslation(JSON.parse(cachedData) as TranslationKeys)
        return
      }
    } catch { /* ignore parse errors — will re-fetch */ }

    // Cache miss or id.ts changed — fetch fresh translation
    setTranslating(true)
    const flat = collectStrings(id)
    translateBatch(flat, "en")
      .then((translatedFlat) => {
        const nested = unflattenStrings(translatedFlat)
        setEnTranslation(nested)
        try {
          localStorage.setItem(EN_CACHE_KEY, JSON.stringify(nested))
          localStorage.setItem(EN_HASH_KEY, hashObject(id))
        } catch { /* storage full — not critical */ }
      })
      .finally(() => setTranslating(false))
  }, [locale, enTranslation])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try { localStorage.setItem(LOCALE_KEY, next) } catch { /* ignore */ }
  }, [])

  const toggleLocale = useCallback(() => {
    setLocale(locale === "id" ? "en" : "id")
  }, [locale, setLocale])

  // While English is loading, fall back to Indonesian so UI never breaks
  const t: TranslationKeys =
    locale === "en" && enTranslation ? enTranslation : id

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale, toggleLocale, translating }}>
      {children}
    </LanguageContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>")
  return ctx
}