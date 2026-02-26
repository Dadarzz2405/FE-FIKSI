import { request } from "./client"
import type { RankInfo } from "./profile"

export type CommentAuthor = {
  username: string; avatar_url: string | null; real_name: string | null
  level: number; reputation: number; cp_total: number; rank: RankInfo
}

export type Comment = {
  id: string; post_id: string; content: string; is_accepted: boolean
  created_at: string; author_id: string
  upvote_count: number; has_upvoted: boolean
  author: CommentAuthor | null
}

export function getComments(postId: string, token?: string) {
  return request<Comment[]>(`/posts/${postId}/comments`, "GET", undefined, token)
}
export function createComment(token: string, postId: string, content: string) {
  return request<Comment>(`/posts/${postId}/comments`, "POST", { content }, token)
}
export function acceptComment(token: string, commentId: string) {
  return request<Comment>(`/comments/${commentId}/accept`, "PATCH", undefined, token)
}
export function upvoteComment(token: string, commentId: string) {
  return request<Comment>(`/comments/${commentId}/upvote`, "POST", undefined, token)
}
export function deleteComment(token: string, commentId: string) {
  return request<null>(`/comments/${commentId}`, "DELETE", undefined, token)
}
