"use client"

import { useEffect, useState } from "react"
import { ComingSoonResponse, getQuizzesComingSoon } from "@/lib/api"
import styles from "../coming-soon.module.css"

export default function QuizzesPage() {
  const [data, setData] = useState<ComingSoonResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getQuizzesComingSoon()
      .then((res) => setData(res))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Gagal memuat halaman kuis.")
      )
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Kuis</h1>
        <p className={styles.subtitle}>Status fitur kuis dari backend.</p>
      </div>

      {loading && <p className={styles.loadingState}>Memuat data kuis...</p>}
      {error && <p className={styles.errorState}>{error}</p>}

      {!loading && !error && data && (
        <section className={styles.card}>
          <p className={styles.badge}>{data.status}</p>
          <h2 className={styles.message}>{data.message}</h2>
        </section>
      )}
    </main>
  )
}
