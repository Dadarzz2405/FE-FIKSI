"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { getPostsByCategory } from "@/lib/api"
import styles from "../categories.module.css"
import postStyles from "../../posts/page.module.css"

type CategoryPost = {
  id: string
  title: string
  excerpt: string | null
  image_url: string | null
  created_at: string
  author: { username: string; avatar_url: string | null } | null
}

type PageData = {
  category: { id: string; name: string; slug: string; icon: string | null }
  posts: CategoryPost[]
  total: number
  page: number
}

export default function CategoryDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [data, setData] = useState<PageData | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    queueMicrotask(() => setLoading(true))
    getPostsByCategory(slug, page)
      .then((res) => {
        if (!cancelled) setData(res as PageData)
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat postingan.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, page])

  const LIMIT = 10
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  if (loading) return (
    <main className={styles.page}>
      <p className={styles.loadingState}>Memuat...</p>
    </main>
  )

  if (error || !data) return (
    <main className={styles.page}>
      <p className={styles.errorState}>{error || "Kategori tidak ditemukan."}</p>
      <Link href="/categories" style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>← Semua Kategori</Link>
    </main>
  )

  return (
    <main className={styles.page}>
      <div>
        <Link href="/categories" style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textDecoration: "none" }}>
          ← Semua Kategori
        </Link>
        <div className={styles.header} style={{ marginTop: "0.75rem" }}>
          <h1 className={styles.title}>
            {data.category.icon && <span style={{ marginRight: "0.5rem" }}>{data.category.icon}</span>}
            {data.category.name}
          </h1>
          <p className={styles.subtitle}>{data.total} pertanyaan</p>
        </div>
      </div>

      {data.posts.length === 0 ? (
        <div className={postStyles.emptyState}>
          <p>Belum ada pertanyaan di kategori ini.</p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
            <Link href="/posts">Buat pertanyaan pertama →</Link>
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {data.posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className={postStyles.postCard}>
              <h3 className={postStyles.postTitle}>{post.title}</h3>
              {post.excerpt && <p className={postStyles.postExcerpt}>{post.excerpt}</p>}
              <div className={postStyles.postMeta}>
                {post.author && (
                  <>
                    <span className={postStyles.postAuthor}>@{post.author.username}</span>
                    <span>·</span>
                  </>
                )}
                <span>
                  {new Date(post.created_at).toLocaleDateString("id-ID", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
            </Link>
          ))}

          {totalPages > 1 && (
            <div className={postStyles.pagination}>
              <button
                type="button"
                className={postStyles.pageButton}
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >← Sebelumnya</button>
              <span className={postStyles.pageInfo}>Halaman {page} dari {totalPages}</span>
              <button
                type="button"
                className={postStyles.pageButton}
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >Berikutnya →</button>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
