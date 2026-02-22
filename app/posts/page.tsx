"use client"

import { useEffect, useState, FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { getPosts, createPost, deletePost, getCategories, Post, Category } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import styles from "./page.module.css"

const LIMIT = 10

export default function PostsPage() {
  const { user, token } = useAuth()

  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isPublished, setIsPublished] = useState(true)
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const totalPages = Math.ceil(total / LIMIT)

  async function fetchPosts(p: number) {
    setLoading(true)
    setError(null)
    try {
      const res = await getPosts(p, LIMIT)
      setPosts(res.posts)
      setTotal(res.total)
    } catch {
      setError("Gagal memuat postingan.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(page)
  }, [page])

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.categories))
      .catch(() => {/* non-critical */})
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    setFormError(null)
    setSubmitting(true)
    try {
      const newPost = await createPost(token, {
        title,
        content,
        image_url: imageUrl || undefined,
        is_published: isPublished,
        category_id: categoryId || undefined,
      })
      if (newPost.is_published) {
        setPosts((prev) => [newPost, ...prev])
        setTotal((t) => t + 1)
      }
      setTitle("")
      setContent("")
      setImageUrl("")
      setIsPublished(true)
      setCategoryId("")
      setShowForm(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal membuat postingan.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(e: React.MouseEvent, postId: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!token) return
    if (!confirm("Hapus postingan ini?")) return
    setDeletingId(postId)
    try {
      await deletePost(token, postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      setTotal((t) => t - 1)
    } catch {
      alert("Gagal menghapus postingan.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pertanyaan</h1>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <Link href="/categories" className={styles.newButton} style={{ background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
            📚 Kategori
          </Link>
          {user ? (
            <button
              type="button"
              className={styles.newButton}
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? "✕ Batal" : "+ Tanya Sesuatu"}
            </button>
          ) : (
            <Link href="/login" className={styles.newButton}>
              Masuk untuk Bertanya
            </Link>
          )}
        </div>
      </div>

      {showForm && user && (
        <div className={styles.formCard}>
          <p className={styles.formTitle}>Ajukan Pertanyaan</p>
          <form onSubmit={handleSubmit} style={{ display: "contents" }}>
            {formError && <div className={styles.formError}>{formError}</div>}

            <div className={styles.formGroup}>
              <label className={styles.label}>Judul Pertanyaan *</label>
              <input
                className={styles.input}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tulis pertanyaanmu secara singkat dan jelas..."
                required
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Detail / Penjelasan *</label>
              <textarea
                className={styles.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Jelaskan konteks pertanyaanmu, apa yang sudah kamu coba, dll..."
                required
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Kategori</label>
              <select
                className={styles.input}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={submitting}
                style={{ cursor: "pointer" }}
              >
                <option value="">— Pilih kategori —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>URL Gambar (opsional)</label>
              <input
                className={styles.input}
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                disabled={submitting}
              />
            </div>

            <div className={styles.formActions}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  disabled={submitting}
                />
                Publikasikan sekarang
              </label>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Batal
              </button>
              <button type="submit" className={styles.submitButton} disabled={submitting}>
                {submitting ? (
                  <><span className={styles.spinner} />Menyimpan...</>
                ) : "Kirim Pertanyaan"}
              </button>
            </div>
          </form>
        </div>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Semua Pertanyaan</h2>
          {!loading && <span className={styles.count}>{total} pertanyaan</span>}
        </div>

        {loading ? (
          <p className={styles.loadingState}>Memuat pertanyaan...</p>
        ) : error ? (
          <p className={styles.errorState}>{error}</p>
        ) : posts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Belum ada pertanyaan.</p>
            {!user && (
              <p className={styles.loginPrompt}>
                <Link href="/login">Masuk</Link> untuk mulai bertanya.
              </p>
            )}
          </div>
        ) : (
          <>
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className={styles.postCard}
                style={{ animationDelay: `${i * 45}ms` }}
              >
                {post.image_url && (
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    width={0} height={0} sizes="100vw" unoptimized
                    className={styles.postImage}
                  />
                )}

                <h3 className={styles.postTitle}>{post.title}</h3>

                {post.excerpt && (
                  <p className={styles.postExcerpt}>{post.excerpt}</p>
                )}

                <div className={styles.postMeta}>
                  {post.author && (
                    <>
                      <span className={styles.postAuthor}>@{post.author.username}</span>
                      <span>·</span>
                    </>
                  )}
                  <span>
                    {new Date(post.created_at).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                  {!post.is_published && (
                    <span className={styles.draftBadge}>DRAFT</span>
                  )}
                  {user && post.author_id === user.id && (
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={(e) => handleDelete(e, post.id)}
                      disabled={deletingId === post.id}
                    >
                      {deletingId === post.id ? "Menghapus..." : "Hapus"}
                    </button>
                  )}
                </div>
              </Link>
            ))}

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button type="button" className={styles.pageButton} onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                  ← Sebelumnya
                </button>
                <span className={styles.pageInfo}>Halaman {page} dari {totalPages}</span>
                <button type="button" className={styles.pageButton} onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
                  Berikutnya →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
