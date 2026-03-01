import { request } from "./client"

export type RankInfo = { name: string; icon: string; min_cp: number }

export type ProfileData = {
  id: string
  username: string
  real_name: string | null
  avatar_url: string | null
  bio: string | null
  is_active: boolean
  created_at: string
  level:            number
  xp_current:       number
  xp_total:         number
  xp_to_next_level: number
  reputation:       number
  cp_total:         number
  rank:             RankInfo
  cp_to_next_rank:  number | null
}

export function updateProfile(
  token: string,
  payload: { username?: string; real_name?: string; bio?: string; avatar_url?: string },
) {
  return request<ProfileData>("/profile/me", "PATCH", payload, token)
}
