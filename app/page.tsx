"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getHomepage } from "@/lib/api"

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
        setError("Failed to load homepage data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <p style={{ padding: "2rem" }}>Loading...</p>
  }

  if (error) {
    return <p style={{ padding: "2rem", color: "red" }}>{error}</p>
  }

  if (!data) return null

  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Homepage Feed
        </h1>
        <div
          style={{
            display: "inline-block",
            padding: "0.25rem 0.75rem",
            backgroundColor: "var(--accent)",
            color: "white",
            borderRadius: "12px",
            fontSize: "0.875rem",
            fontWeight: "500",
          }}
        >
          {data.status}
        </div>
      </div>

      {/* ========================= */}
      {/* Latest Post */}
      {/* ========================= */}
      <section style={{ marginTop: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            marginBottom: "1rem",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          Latest Post
        </h2>

        {data.latest_post ? (
          <article
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              padding: "1.5rem",
              marginTop: "1rem",
              transition: "border-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)"
            }}
          >
            {/* IMAGE */}
            {data.latest_post.image_url && (
              <Image
                src={data.latest_post.image_url}
                alt={data.latest_post.title}
                width={1200}
                height={600}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "6px",
                  marginBottom: "1rem",
                  objectFit: "cover",
                  maxHeight: "400px",
                }}
              />
            )}

            <h3
              style={{
                fontSize: "1.25rem",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              {data.latest_post.title}
            </h3>

            {data.latest_post.description && (
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "1rem",
                  lineHeight: "1.6",
                }}
              >
                {data.latest_post.description}
              </p>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
              }}
            >
              {data.latest_post.author && (
                <>
                  <span
                    style={{
                      fontWeight: "500",
                      color: "var(--text-primary)",
                    }}
                  >
                    {data.latest_post.author}
                  </span>
                  <span>•</span>
                </>
              )}
              <span>
                {new Date(data.latest_post.created_at).toLocaleString()}
              </span>
            </div>
          </article>
        ) : (
          <p style={{ color: "var(--text-secondary)", padding: "1rem" }}>
            No latest post available.
          </p>
        )}
      </section>

      {/* ========================= */}
      {/* Popular Posts */}
      {/* ========================= */}
      <section style={{ marginTop: "2.5rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            marginBottom: "1rem",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          Popular Posts
        </h2>

        {data.popular_posts.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {data.popular_posts.map((post) => (
              <article
                key={post.id}
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  padding: "1.25rem",
                  transition: "border-color 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)"
                }}
              >
                {/* IMAGE */}
                {post.image_url && (
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    width={1200}
                    height={600}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "6px",
                      marginBottom: "0.75rem",
                      objectFit: "cover",
                      maxHeight: "250px",
                    }}
                  />
                )}

                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  {post.title}
                </h3>

                {post.description && (
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9375rem",
                      lineHeight: "1.6",
                    }}
                  >
                    {post.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-secondary)", padding: "1rem" }}>
            No popular posts yet.
          </p>
        )}
      </section>
    </main>
  )
}
