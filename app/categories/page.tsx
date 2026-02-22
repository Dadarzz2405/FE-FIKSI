"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getCategories, Category } from "@/lib/api"
import styles from "./categories.module.css"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.categories))
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

      {!loading && !error && (
        <div className={styles.grid}>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} className={styles.card}>
              <span className={styles.icon}>{cat.icon || "📌"}</span>
              <div className={styles.info}>
                <strong className={styles.name}>{cat.name}</strong>
                {cat.description && (
                  <p className={styles.desc}>{cat.description}</p>
                )}
                <span className={styles.count}>{cat.post_count} pertanyaan</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
