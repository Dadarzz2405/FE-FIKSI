import { request } from "./client"

export type Subject = {
  id: string; name: string; slug: string; academic_category_id: string;
  icon: string | null; post_count: number
}

export type SubjectListResponse = { subjects: Subject[]; total: number }

export type CategoryGrouping = {
  id: string; name: string; slug: string; description: string | null; icon: string | null;
  subjects: Subject[]
}

export type GroupedSubjectsResponse = { categories: CategoryGrouping[]; total_categories: number; total_subjects: number }

export function getSubjects() { return request<SubjectListResponse>("/subjects/") }
export function getGroupedSubjects() { return request<GroupedSubjectsResponse>("/subjects/grouped") }
export function getSubject(slug: string) { return request<Subject>(`/subjects/${slug}`) }
export function getPostsBySubject(slug: string, page = 1, limit = 10) {
  return request<{
    subject: { id: string; name: string; slug: string; icon: string | null; academic_category_id: string }
    posts: { id: string; title: string; excerpt: string | null; image_url: string | null; created_at: string; author: { username: string; avatar_url: string | null } | null }[]
    total: number; page: number; limit: number
  }>(`/subjects/${slug}/posts?page=${page}&limit=${limit}`)
}
