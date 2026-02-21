"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getHomepage } from "@/lib/api"
import styles from "./page.module.css"

type Post = {
  id: string
  title: string
  description?: string
  author?: string
  created_at: string
  image_url?: string
}

type HomepageData = {
  status: string
  latest_post?: Post
  popular_posts: Post[]
}

export default function HomePage() {
  const [data, setData] = useState<HomepageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getHomepage()
        setData(res)
      } catch {
        setError("Gagal memuat data beranda.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.loadingState}>Memuat beranda...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className={styles.page}>
        <p className={styles.errorState}>{error}</p>
      </main>
    )
  }

  if (!data) return null

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Beranda</h1>
        <div className={styles.status}>
          {data.status}
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Postingan Terbaru</h2>

        {data.latest_post ? (
          <article className={`${styles.card} ${styles.latestCard}`}>
            {data.latest_post.image_url && (
              <Image
                src={data.latest_post.image_url}
                alt={data.latest_post.title}
                width={0}
                height={0}
                sizes="100vw"
                unoptimized
                className={styles.postImage}
              />
            )}

            <h3 className={styles.postTitle}>{data.latest_post.title}</h3>

            {data.latest_post.description && (
              <p className={styles.postDescription}>
                {data.latest_post.description}
              </p>
            )}

            <div className={styles.meta}>
              {data.latest_post.author && (
                <>
                  <span className={styles.author}>{data.latest_post.author}</span>
                  <span>•</span>
                </>
              )}
              <span>
                {new Date(data.latest_post.created_at).toLocaleString("id-ID")}
              </span>
            </div>
          </article>
        ) : (
          <p className={styles.emptyState}>Belum ada postingan terbaru.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Postingan Populer</h2>

        {data.popular_posts.length > 0 ? (
          <div className={styles.list}>
            {data.popular_posts.map((post) => (
              <article key={post.id} className={styles.card}>
                {post.image_url && (
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    width={0}
                    height={0}
                    sizes="100vw"
                    unoptimized
                    className={styles.popularImage}
                  />
                )}

                <h3 className={styles.postTitle}>{post.title}</h3>

                {post.description && (
                  <p className={styles.postDescription}>
                    {post.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>Belum ada postingan populer.</p>
        )}
      </section>
    </main>
  )
}
