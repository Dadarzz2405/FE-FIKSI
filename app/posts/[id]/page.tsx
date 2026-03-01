"use client"

import { useEffect, useState, FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getPost, deletePost, getComments, createComment, acceptComment, deleteComment, Post, Comment } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import styles from "./post.module.css"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const postId = params?.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

  useEffect(() => {
    if (!postId) return
    async function fetchPost() {
      try {
        const res = await getPost(postId)
        setPost(res)
      } catch {
        setError("Postingan tidak ditemukan.")
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [postId])

  useEffect(() => {
    if (!postId) return
    getComments(postId)
      .then((res) => setComments(Array.isArray(res) ? res : []))
      .catch(() => {/* non-critical */})
      .finally(() => setCommentsLoading(false))
  }, [postId])

  async function handleDelete() {
    if (!token || !post) return
    if (!confirm("Hapus postingan ini secara permanen?")) return
    setDeleting(true)
    try {
      await deletePost(token, post.id)
      router.push("/posts")
    } catch {
      alert("Gagal menghapus postingan.")
      setDeleting(false)
    }
  }

  async function handleCommentSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token || !post) return
    setCommentError(null)
    setSubmittingComment(true)
    try {
      const newComment = await createComment(token, post.id, commentText.trim())
      setComments((prev) => [...prev, newComment])
      setCommentText("")
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : "Gagal mengirim jawaban.")
    } finally {
      setSubmittingComment(false)
    }
  }

  async function handleAccept(commentId: string) {
    if (!token) return
    try {
      const updated = await acceptComment(token, commentId)
      setComments((prev) =>
        prev.map((c) => ({ ...c, is_accepted: c.id === updated.id }))
      )
    } catch {
      alert("Gagal menerima jawaban.")
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!token) return
    if (!confirm("Hapus jawaban ini?")) return
    setDeletingCommentId(commentId)
    try {
      await deleteComment(token, commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch {
      alert("Gagal menghapus jawaban.")
    } finally {
      setDeletingCommentId(null)
    }
  }

  if (loading) return (
    <main className={styles.page}>
      <p className={styles.loading}>Memuat postingan...</p>
    </main>
  )

  if (error || !post) return (
    <main className={styles.page}>
      <p className={styles.error}>{error || "Postingan tidak ditemukan."}</p>
      <Link href="/posts" className={styles.back}>← Kembali ke Pertanyaan</Link>
    </main>
  )

  const isOwner = user && post.author_id === user.id

  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/posts" className={styles.back}>← Semua Pertanyaan</Link>
        {isOwner && (
          <button type="button" className={styles.deleteButton} onClick={handleDelete} disabled={deleting}>
            {deleting ? "Menghapus..." : "Hapus Postingan"}
          </button>
        )}
      </div>

      <article className={styles.article}>
        {post.image_url && (
          <Image
            src={post.image_url} alt={post.title}
            width={0} height={0} sizes="100vw" unoptimized
            className={styles.image}
          />
        )}

        <div className={styles.body}>
          {/* Category badge */}
          {post.category && (
            <Link href={`/categories/${post.category.slug}`} className={styles.categoryBadge}>
              {post.category.icon && <span>{post.category.icon}</span>}
              {post.category.name}
            </Link>
          )}

          <h1 className={styles.title}>{post.title}</h1>

          <div className={styles.meta}>
            {post.author && (
              <Link href={`/profile/${post.author.username}`} className={styles.authorLink}>
                {post.author.avatar_url ? (
                  <Image src={post.author.avatar_url} alt={post.author.username} width={24} height={24} className={styles.avatar} />
                ) : (
                  <span className={styles.avatarFallback}>{post.author.username.charAt(0).toUpperCase()}</span>
                )}
                <span>@{post.author.username}</span>
                {post.author.real_name && (
                  <span className={styles.realName}>({post.author.real_name})</span>
                )}
              </Link>
            )}
            <span className={styles.dot}>·</span>
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </time>
            {!post.is_published && <span className={styles.draftBadge}>DRAFT</span>}
          </div>

          <div className={styles.content}>
            {(typeof post.content === "string" ? post.content : "").split("\n").map((paragraph, i) =>
              paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
            )}
          </div>
        </div>
      </article>

      {/* ── Comments / Answers Section ── */}
      <section className={styles.commentsSection}>
        <h2 className={styles.commentsTitle}>
          {comments.length} Jawaban
        </h2>

        {commentsLoading ? (
          <p className={styles.commentsLoading}>Memuat jawaban...</p>
        ) : comments.length === 0 ? (
          <p className={styles.commentsEmpty}>Belum ada jawaban. Jadilah yang pertama!</p>
        ) : (
          <div className={styles.commentsList}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`${styles.commentCard} ${comment.is_accepted ? styles.accepted : ""}`}
              >
                {comment.is_accepted && (
                  <div className={styles.acceptedBadge}>✅ Jawaban Terbaik</div>
                )}

                <div className={styles.commentContent}>{comment.content}</div>

                <div className={styles.commentMeta}>
                  {comment.author ? (
                    <Link href={`/profile/${comment.author.username}`} className={styles.commentAuthor}>
                      {comment.author.avatar_url ? (
                        <Image src={comment.author.avatar_url} alt={comment.author.username} width={20} height={20} className={styles.commentAvatar} />
                      ) : (
                        <span className={styles.commentAvatarFallback}>
                          {comment.author.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                      @{comment.author.username}
                    </Link>
                  ) : null}
                  <span className={styles.dot}>·</span>
                  <time>
                    {new Date(comment.created_at).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </time>

                  <div className={styles.commentActions}>
                    {/* Post owner can accept */}
                    {isOwner && !comment.is_accepted && (
                      <button
                        type="button"
                        className={styles.acceptButton}
                        onClick={() => handleAccept(comment.id)}
                      >
                        ✓ Terima Jawaban
                      </button>
                    )}
                    {/* Comment owner can delete */}
                    {user && comment.author_id === user.id && (
                      <button
                        type="button"
                        className={styles.deleteCommentButton}
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                      >
                        {deletingCommentId === comment.id ? "..." : "Hapus"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Answer form */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <h3 className={styles.commentFormTitle}>Tulis Jawaban</h3>
            {commentError && <div className={styles.commentError}>{commentError}</div>}
            <textarea
              className={styles.commentTextarea}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Tulis jawabanmu di sini..."
              required
              disabled={submittingComment}
              rows={4}
            />
            <button type="submit" className={styles.commentSubmit} disabled={submittingComment || !commentText.trim()}>
              {submittingComment ? "Mengirim..." : "Kirim Jawaban"}
            </button>
          </form>
        ) : (
          <div className={styles.loginPrompt}>
            <Link href="/login">Masuk</Link> untuk menulis jawaban.
          </div>
        )}
      </section>
    </main>
  )
}
