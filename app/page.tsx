import { getHomepage } from "@/lib/api"

export default async function HomePage() {
  const data = await getHomepage()

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Homepage Feed</h1>
      <p>
        <strong>Status:</strong> {data.status}
      </p>

      <section style={{ marginTop: "2rem" }}>
        <h2>Latest Post</h2>
        {data.latest_post ? (
          <article
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              marginTop: "0.75rem",
            }}
          >
            <h3>{data.latest_post.title}</h3>
            {data.latest_post.description && <p>{data.latest_post.description}</p>}
            <small>
              {data.latest_post.author ? `${data.latest_post.author} • ` : ""}
              {new Date(data.latest_post.created_at).toLocaleString()}
            </small>
          </article>
        ) : (
          <p>No latest post available.</p>
        )}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Popular Posts</h2>
        {data.popular_posts.length > 0 ? (
          <ul style={{ paddingLeft: "1.25rem", marginTop: "0.75rem" }}>
            {data.popular_posts.map((post) => (
              <li key={post.id} style={{ marginBottom: "0.75rem" }}>
                <strong>{post.title}</strong>
                {post.description ? ` - ${post.description}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p>No popular posts yet.</p>
        )}
      </section>
    </main>
  )
}
