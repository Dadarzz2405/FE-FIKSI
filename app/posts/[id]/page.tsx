"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getPost, deletePost, Post } from "@/lib/api"
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

  useEffect(() => {
    if (!postId) return
    async function fetch() {
      try {
        const res = await getPost(postId)
        setPost(res)
      } catch {
        setError("Postingan tidak ditemukan.")
      } finally {
        setLoading(false)
      }
    }
    fetch()
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

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Memuat postingan...</p>
      </main>
    )
  }

  if (error || !post) {
    return (
      <main className={styles.page}>
        <p className={styles.error}>{error || "Postingan tidak ditemukan."}</p>
        <Link href="/posts" className={styles.back}>← Kembali ke Postingan</Link>
      </main>
    )
  }

  const isOwner = user && post.author_id === user.id

  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/posts" className={styles.back}>← Semua Postingan</Link>
        {isOwner && (
          <button
            type="button"
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Menghapus..." : "Hapus Postingan"}
          </button>
        )}
      </div>

      <article className={styles.article}>
        {post.image_url && (
          <Image
            src={post.image_url}
            alt={post.title}
            width={0}
            height={0}
            sizes="100vw"
            unoptimized
            className={styles.image}
          />
        )}

        <div className={styles.body}>
          <h1 className={styles.title}>{post.title}</h1>

          <div className={styles.meta}>
            {post.author && (
              <Link href={`/profile/${post.author.username}`} className={styles.authorLink}>
                {post.author.avatar_url ? (
                  <Image
                    src={post.author.avatar_url}
                    alt={post.author.username}
                    width={24}
                    height={24}
                    className={styles.avatar}
                  />
                ) : (
                  <span className={styles.avatarFallback}>
                    {post.author.username.charAt(0).toUpperCase()}
                  </span>
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
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            {!post.is_published && (
              <span className={styles.draftBadge}>DRAFT</span>
            )}
          </div>

          <div className={styles.content}>
            {post.content.split("\n").map((paragraph, i) =>
              paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
            )}
          </div>
        </div>
      </article>
    </main>
  )
}