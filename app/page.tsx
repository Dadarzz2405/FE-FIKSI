// app/page.tsx
import { getHomepage } from "@/lib/api"

export default async function HomePage() {
  const data = await getHomepage()

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <small>Status: {data.status}</small>
    </main>
  )
}
