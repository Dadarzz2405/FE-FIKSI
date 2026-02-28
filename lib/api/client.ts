import { HomepageFeed } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://be-fiksi.onrender.com"
    : "http://localhost:8000");

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export async function request<T>(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: unknown,
  token?: string,
): Promise<T> {
  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
  }
  if (body) headers["Content-Type"] = "application/json"

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method, headers, credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    throw new Error(
      e instanceof TypeError && e.message === "Failed to fetch"
        ? "Tidak bisa terhubung ke server."
        : e instanceof Error ? e.message : "Koneksi gagal",
    )
  }

  if (!res.ok) {
    let message = "Permintaan API gagal"
    try { const err = await res.json(); message = err?.detail || message } catch { }
    throw new Error(message)
  }
  if (res.status === 204) return null as T
  return res.json()
}

export async function uploadImage(
  token: string,
  file: File,
  bucket: "post-images" | "avatars" = "post-images",
): Promise<string> {
  const form = new FormData()
  form.append("file", file)
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/upload/image?bucket=${bucket}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
  } catch (e) { throw new Error(e instanceof Error ? e.message : "Upload gagal") }
  if (!res.ok) {
    let m = "Upload gagal"
    try { const e = await res.json(); m = e?.detail || m } catch { }
    throw new Error(m)
  }
  return (await res.json()).url as string
}

export function getHomepage() { return request<HomepageFeed>("/homepage/") }
