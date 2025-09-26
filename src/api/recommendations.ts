import apiClient from './client'
import type {
  PersonalizedRecommendations,
  WordRecommendation,
  WeeklyGoal,
  StudyTimeRecommendation,
  DifficultyAdjustment,
  ApiResponse
} from '@/types'

export const recommendationsApi = {
  // 个性化推荐
  async getPersonalizedRecommendations(): Promise<ApiResponse<PersonalizedRecommendations>> {
    const response = await apiClient.get('/api/recommendations')
    return response.data
  },

  async refreshRecommendations(): Promise<ApiResponse<PersonalizedRecommendations>> {
    const response = await apiClient.post('/api/recommendations/refresh')
    return response.data
  },

  // 复习推荐
  async getUrgentReviews(limit = 10): Promise<ApiResponse<WordRecommendation[]>> {
    const response = await apiClient.get('/api/recommendations/urgent-reviews', {
      params: { limit }
    })
    return response.data
  },

  async getDailyReviewPlan(targetMinutes = 30): Promise<
    ApiResponse<{
      recommendations: WordRecommendation[]
      estimatedDuration: number
      breakdown: {
        newWords: number
        reviews: number
        practice: number
      }
    }>
  > {
    const response = await apiClient.get('/api/recommendations/daily-plan', {
      params: { targetMinutes }
    })
    return response.data
  },

  async getAdaptiveReviews(sessionLength = 20): Promise<ApiResponse<WordRecommendation[]>> {
    const response = await apiClient.get('/api/recommendations/adaptive-reviews', {
      params: { sessionLength }
    })
    return response.data
  },

  // 学习目标和策略
  async getWeeklyGoals(): Promise<ApiResponse<WeeklyGoal[]>> {
    const response = await apiClient.get('/api/recommendations/weekly-goals')
    return response.data
  },

  async updateGoalProgress(goalType: string, progress: number): Promise<ApiResponse<WeeklyGoal>> {
    const response = await apiClient.post('/api/recommendations/goals/update', {
      goalType,
      progress
    })
    return response.data
  },

  async getStudyTimeRecommendation(): Promise<ApiResponse<StudyTimeRecommendation>> {
    const response = await apiClient.get('/api/recommendations/study-time')
    return response.data
  },

  // 难度调整建议
  async getDifficultyAdjustments(): Promise<ApiResponse<DifficultyAdjustment[]>> {
    const response = await apiClient.get('/api/recommendations/difficulty-adjustments')
    return response.data
  },

  async applyDifficultyAdjustment(wordId: number, newDifficulty: number): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`/api/recommendations/difficulty-adjustments/${wordId}/apply`, {
      newDifficulty
    })
    return response.data
  },

  async dismissDifficultyAdjustment(wordId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`/api/recommendations/difficulty-adjustments/${wordId}/dismiss`)
    return response.data
  },

  // 学习策略推荐
  async getLearningStrategies(): Promise<
    ApiResponse<{
      currentStrategies: string[]
      suggestedStrategies: {
        strategy: string
        reason: string
        expectedImprovement: number
        difficulty: 'easy' | 'medium' | 'hard'
      }[]
      personalizedTips: string[]
    }>
  > {
    const response = await apiClient.get('/api/recommendations/learning-strategies')
    return response.data
  },

  // 内容推荐
  async getContentRecommendations(): Promise<
    ApiResponse<{
      suggestedWords: {
        word: string
        reason: string
        difficulty: number
        priority: number
        relatedWords: string[]
      }[]
      topicsToExplore: {
        topic: string
        wordCount: number
        averageDifficulty: number
        description: string
      }[]
      reviewMaterials: {
        type: 'article' | 'video' | 'exercise' | 'game'
        title: string
        description: string
        difficulty: number
        estimatedTime: number
        url?: string
      }[]
    }>
  > {
    const response = await apiClient.get('/api/recommendations/content')
    return response.data
  },

  // 用户反馈
  async provideFeedback(
    recommendationId: string,
    feedback: {
      helpful: boolean
      followed: boolean
      rating: number // 1-5
      comment?: string
    }
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`/api/recommendations/${recommendationId}/feedback`, feedback)
    return response.data
  },

  async getRecommendationHistory(
    page = 1,
    limit = 20
  ): Promise<
    ApiResponse<{
      items: {
        id: string
        type: string
        title: string
        description: string
        createdAt: string
        followed: boolean
        rating?: number
      }[]
      total: number
      page: number
      limit: number
    }>
  > {
    const response = await apiClient.get('/api/recommendations/history', {
      params: { page, limit }
    })
    return response.data
  },

  // 推荐设置
  async getRecommendationSettings(): Promise<
    ApiResponse<{
      enabled: boolean
      frequency: 'daily' | 'weekly' | 'monthly'
      types: string[]
      maxRecommendations: number
      difficulty: 'conservative' | 'balanced' | 'aggressive'
      includeContentSuggestions: boolean
    }>
  > {
    const response = await apiClient.get('/api/recommendations/settings')
    return response.data
  },

  async updateRecommendationSettings(settings: {
    enabled?: boolean
    frequency?: 'daily' | 'weekly' | 'monthly'
    types?: string[]
    maxRecommendations?: number
    difficulty?: 'conservative' | 'balanced' | 'aggressive'
    includeContentSuggestions?: boolean
  }): Promise<ApiResponse<void>> {
    const response = await apiClient.put('/api/recommendations/settings', settings)
    return response.data
  }
}
