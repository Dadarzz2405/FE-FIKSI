import { request } from "./client"

export type LeaderboardEntry = {
  rank_position: number
  user_id:    string
  username:   string
  real_name:  string | null
  avatar_url: string | null
  level:      number
  xp_total:   number
  reputation: number
  cp_total:   number
  rank_name:  string
  rank_icon:  string
}

export function getLeaderboard(
  sortBy: "reputation" | "xp_total" | "cp_total" | "level" = "reputation",
  limit = 20,
) {
  return request<LeaderboardEntry[]>(
    `/leaderboard/?sort_by=${sortBy}&limit=${limit}`,
    "GET",
    undefined,
    undefined,
    { cache: true, cacheTTL: 5 * 60 * 1000 } // 5 minutes - leaderboard changes slowly
  )
}
