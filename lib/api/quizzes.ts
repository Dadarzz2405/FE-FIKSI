import { request } from "./client"

export type QuizResult = {
  score: number; total: number; score_pct: number; passed: boolean
  event: string | null; xp_gained: number; rep_gained: number; cp_gained: number
  leveled_up: boolean; new_level: number; message: string
}

export function submitQuiz(
  token: string,
  payload: { quiz_id: string; score: number; total: number; difficulty: string },
) {
  return request<QuizResult>("/quizzes/submit", "POST", payload, token)
}
