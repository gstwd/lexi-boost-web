import apiClient from './client'
import type { ReviewSchedule, ReviewSession, ReviewFilters, ReviewType, PaginatedResponse, ApiResponse } from '@/types'

export const reviewsApi = {
  // 复习调度管理
  async getReviewSchedules(
    filters?: ReviewFilters,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<PaginatedResponse<ReviewSchedule>>> {
    const response = await apiClient.get('/api/reviews/schedules', {
      params: { ...filters, page, limit }
    })
    return response.data
  },

  async getDueReviews(limit = 50): Promise<ApiResponse<ReviewSchedule[]>> {
    const response = await apiClient.get('/api/reviews/due', {
      params: { limit }
    })
    return response.data
  },

  async getReviewSchedule(id: number): Promise<ApiResponse<ReviewSchedule>> {
    const response = await apiClient.get(`/api/reviews/schedules/${id}`)
    return response.data
  },

  async updateReviewSchedule(id: number, updates: Partial<ReviewSchedule>): Promise<ApiResponse<ReviewSchedule>> {
    const response = await apiClient.put(`/api/reviews/schedules/${id}`, updates)
    return response.data
  },

  async rescheduleReview(id: number, newDate: string): Promise<ApiResponse<ReviewSchedule>> {
    const response = await apiClient.post(`/api/reviews/schedules/${id}/reschedule`, {
      newDate
    })
    return response.data
  },

  // 复习会话管理
  async startReviewSession(
    wordRecordIds: number[]
  ): Promise<ApiResponse<{ sessionId: string; reviews: ReviewSchedule[] }>> {
    const response = await apiClient.post('/api/reviews/sessions/start', {
      wordRecordIds
    })
    return response.data
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
  }): Promise<ApiResponse<ReviewSession & { nextReviewDate: string }>> {
    const response = await apiClient.post('/api/reviews/sessions/submit', sessionData)
    return response.data
  },

  async endReviewSession(sessionId: string): Promise<
    ApiResponse<{
      completedReviews: number
      accuracy: number
      timeSpent: number
      nextDueCount: number
    }>
  > {
    const response = await apiClient.post(`/api/reviews/sessions/${sessionId}/end`)
    return response.data
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
  ): Promise<ApiResponse<PaginatedResponse<ReviewSession>>> {
    const response = await apiClient.get('/api/reviews/sessions', {
      params: { ...filters, page, limit }
    })
    return response.data
  },

  async getReviewSession(id: number): Promise<ApiResponse<ReviewSession>> {
    const response = await apiClient.get(`/api/reviews/sessions/${id}`)
    return response.data
  },

  // 复习统计
  async getReviewStats(
    period: 'daily' | 'weekly' | 'monthly',
    limit = 30
  ): Promise<
    ApiResponse<{
      dates: string[]
      reviewCounts: number[]
      accuracyRates: number[]
      timeSpent: number[]
      reviewTypes: Record<ReviewType, number>
      averageResponseTime: number
    }>
  > {
    const response = await apiClient.get('/api/reviews/stats', {
      params: { period, limit }
    })
    return response.data
  },

  async getDashboardStats(): Promise<
    ApiResponse<{
      dueToday: number
      completedToday: number
      streak: number
      weeklyProgress: number
      averageAccuracy: number
      totalWordsLearned: number
      masteredWords: number
    }>
  > {
    const response = await apiClient.get('/api/reviews/dashboard')
    return response.data
  },

  // 复习设置和偏好
  async getReviewSettings(): Promise<
    ApiResponse<{
      dailyGoal: number
      sessionLength: number
      reviewTypes: ReviewType[]
      difficultySetting: 'adaptive' | 'manual'
      showContext: boolean
      allowHints: boolean
      autoSchedule: boolean
    }>
  > {
    const response = await apiClient.get('/api/reviews/settings')
    return response.data
  },

  async updateReviewSettings(settings: {
    dailyGoal?: number
    sessionLength?: number
    reviewTypes?: ReviewType[]
    difficultySetting?: 'adaptive' | 'manual'
    showContext?: boolean
    allowHints?: boolean
    autoSchedule?: boolean
  }): Promise<ApiResponse<void>> {
    const response = await apiClient.put('/api/reviews/settings', settings)
    return response.data
  },

  // 批量操作
  async markMultipleAsReviewed(
    scheduleIds: number[],
    result: 'correct' | 'incorrect' | 'skip'
  ): Promise<
    ApiResponse<{
      updated: number
      nextReviews: ReviewSchedule[]
    }>
  > {
    const response = await apiClient.post('/api/reviews/bulk-review', {
      scheduleIds,
      result
    })
    return response.data
  },

  async resetReviewProgress(wordRecordIds: number[]): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/api/reviews/reset', {
      wordRecordIds
    })
    return response.data
  }
}
