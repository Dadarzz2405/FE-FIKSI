"use client"
/**
 * File: app/posts/page.tsx
 * Purpose: Posts listing and creation UI.
 * Notes: manages pagination, file upload preview, create/delete handlers.
 */

import { useEffect, useState, FormEvent, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { getPosts, createPost, deletePost, getCategories, uploadImage, Post, Category } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import styles from "./page.module.css"

const LIMIT = 10

function UpArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isPublished, setIsPublished] = useState(true)
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      .catch(() => {})
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    setFormError(null)
    setSubmitting(true)
    try {
      let imageUrl: string | undefined
      if (imageFile) {
        imageUrl = await uploadImage(token, imageFile, "post-images")
      }

      const newPost = await createPost(token, {
        title,
        content,
        image_url: imageUrl,
        is_published: isPublished,
        category_id: categoryId || undefined,
      })
      if (newPost.is_published) {
        setPosts((prev) => [newPost, ...prev])
        setTotal((t) => t + 1)
      }
      setTitle("")
      setContent("")
      clearImage()
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
              <label className={styles.label}>Gambar (opsional)</label>

              {imagePreview ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "220px",
                      objectFit: "contain",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "#0d1117",
                    }}
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    disabled={submitting}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      background: "rgba(0,0,0,0.65)",
                      border: "none",
                      borderRadius: "50%",
                      width: "26px",
                      height: "26px",
                      color: "#fff",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "1.5rem",
                    border: "2px dashed var(--border-color)",
                    borderRadius: "8px",
                    cursor: submitting ? "not-allowed" : "pointer",
                    background: "#0d1117",
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                    transition: "border-color 180ms ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
                >
                  <span style={{ fontSize: "1.5rem" }}>🖼️</span>
                  <span>Klik untuk pilih gambar</span>
                  <span style={{ fontSize: "0.78rem" }}>PNG, JPG, GIF, WebP — maks. 5 MB</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    disabled={submitting}
                  />
                </label>
              )}
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
                  <><span className={styles.spinner} />Mengunggah...</>
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

                  {/* Upvote count chip */}
                  <span className={styles.upvoteChip}>
                    <UpArrowIcon className={styles.upvoteChipIcon} />
                    {post.upvote_count ?? 0}
                  </span>

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
