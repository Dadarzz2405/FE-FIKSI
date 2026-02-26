import { request } from "./client"

export type Category = {
  id: string; name: string; slug: string
  description: string | null; icon: string | null; post_count: number
}

export type CategoryListResponse = { categories: Category[]; total: number }

export function getCategories() { return request<CategoryListResponse>("/categories/") }
export function getCategory(slug: string) { return request<Category>(`/categories/${slug}`) }
export function getPostsByCategory(slug: string, page = 1, limit = 10) {
  return request<{
    category: { id: string; name: string; slug: string; icon: string | null }
    posts: { id: string; title: string; excerpt: string | null; image_url: string | null; created_at: string; author: { username: string; avatar_url: string | null } | null }[]
    total: number; page: number; limit: number
  }>(`/categories/${slug}/posts?page=${page}&limit=${limit}`)
}
