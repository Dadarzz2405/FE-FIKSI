"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getGroupedSubjects, CategoryGrouping } from "@/lib/api"
import styles from "./categories.module.css"

export default function CategoriesPage() {
  const [groupedCategories, setGroupedCategories] = useState<CategoryGrouping[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getGroupedSubjects()
      .then((res) => setGroupedCategories(res.categories))
      .catch(() => setError("Gagal memuat kategori."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Kategori</h1>
        <p className={styles.subtitle}>Temukan pertanyaan berdasarkan mata pelajaran</p>
      </div>

      {loading && <p className={styles.loadingState}>Memuat kategori...</p>}
      {error && <p className={styles.errorState}>{error}</p>}

      {!loading && !error && groupedCategories.map((group) => (
        <div key={group.id} style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "var(--text-color)" }}>
            {group.icon} {group.name}
          </h2>
          {group.description && <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>{group.description}</p>}
          <div className={styles.grid}>
            {group.subjects.map((sub) => (
              <Link key={sub.id} href={`/categories/${sub.slug}`} className={styles.card}>
                <span className={styles.icon}>{sub.icon || "📌"}</span>
                <div className={styles.info}>
                  <strong className={styles.name}>{sub.name}</strong>
                  <span className={styles.count}>{sub.post_count} pertanyaan</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </main>
  )
}
