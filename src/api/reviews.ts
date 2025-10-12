import { request } from './client'
import type { ReviewSchedule, ReviewSession, ReviewFilters, ReviewType, PaginatedResponse } from '@/types'

export const reviewsApi = {
  // 复习调度管理
  async getReviewSchedules(
    filters?: ReviewFilters,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<ReviewSchedule>> {
    return request.get('/api/reviews/schedules', {
      params: { ...filters, page, limit }
    })
  },

  async getDueReviews(limit = 50): Promise<ReviewSchedule[]> {
    return request.get('/api/reviews/due', {
      params: { limit }
    })
  },

  async getReviewSchedule(id: number): Promise<ReviewSchedule> {
    return request.get(`/api/reviews/schedules/${id}`)
  },

  async updateReviewSchedule(id: number, updates: Partial<ReviewSchedule>): Promise<ReviewSchedule> {
    return request.put(`/api/reviews/schedules/${id}`, updates)
  },

  async rescheduleReview(id: number, newDate: string): Promise<ReviewSchedule> {
    return request.post(`/api/reviews/schedules/${id}/reschedule`, {
      newDate
    })
  },

  // 复习会话管理
  async startReviewSession(
    wordRecordIds: number[]
  ): Promise<{ sessionId: string; reviews: ReviewSchedule[] }> {
    return request.post('/api/reviews/sessions/start', {
      wordRecordIds
    })
  },

  async submitReviewResult(sessionData: {
    sessionId: string
    wordRecordId: number
    reviewType: ReviewType
    accuracy: number
    responseTime: number
    userResponse: string
    expectedResponse: string
    contextShown: boolean
    hintsUsed: number
    feedback?: string
    difficultyRating?: number
  }): Promise<ReviewSession & { nextReviewDate: string }> {
    return request.post('/api/reviews/sessions/submit', sessionData)
  },

  async endReviewSession(sessionId: string): Promise<{
    completedReviews: number
    accuracy: number
    timeSpent: number
    nextDueCount: number
  }> {
    return request.post(`/api/reviews/sessions/${sessionId}/end`)
  },

  // 复习历史
  async getReviewSessions(
    page = 1,
    limit = 20,
    filters?: {
      startDate?: string
      endDate?: string
      reviewType?: ReviewType
      accuracy?: { min: number; max: number }
    }
  ): Promise<PaginatedResponse<ReviewSession>> {
    return request.get('/api/reviews/sessions', {
      params: { ...filters, page, limit }
    })
  },

  async getReviewSession(id: number): Promise<ReviewSession> {
    return request.get(`/api/reviews/sessions/${id}`)
  },

  // 复习统计
  async getReviewStats(
    period: 'daily' | 'weekly' | 'monthly',
    limit = 30
  ): Promise<{
    dates: string[]
    reviewCounts: number[]
    accuracyRates: number[]
    timeSpent: number[]
    reviewTypes: Record<ReviewType, number>
    averageResponseTime: number
  }> {
    return request.get('/api/reviews/stats', {
      params: { period, limit }
    })
  },

  async getDashboardStats(): Promise<{
    dueToday: number
    completedToday: number
    streak: number
    weeklyProgress: number
    averageAccuracy: number
    totalWordsLearned: number
    masteredWords: number
  }> {
    return request.get('/api/reviews/dashboard')
  },

  // 复习设置和偏好
  async getReviewSettings(): Promise<{
    dailyGoal: number
    sessionLength: number
    reviewTypes: ReviewType[]
    difficultySetting: 'adaptive' | 'manual'
    showContext: boolean
    allowHints: boolean
    autoSchedule: boolean
  }> {
    return request.get('/api/reviews/settings')
  },

  async updateReviewSettings(settings: {
    dailyGoal?: number
    sessionLength?: number
    reviewTypes?: ReviewType[]
    difficultySetting?: 'adaptive' | 'manual'
    showContext?: boolean
    allowHints?: boolean
    autoSchedule?: boolean
  }): Promise<void> {
    return request.put('/api/reviews/settings', settings)
  },

  // 批量操作
  async markMultipleAsReviewed(
    scheduleIds: number[],
    result: 'correct' | 'incorrect' | 'skip'
  ): Promise<{
    updated: number
    nextReviews: ReviewSchedule[]
  }> {
    return request.post('/api/reviews/bulk-review', {
      scheduleIds,
      result
    })
  },

  async resetReviewProgress(wordRecordIds: number[]): Promise<void> {
    return request.post('/api/reviews/reset', {
      wordRecordIds
    })
  }
}
