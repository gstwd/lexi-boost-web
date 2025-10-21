import { request } from './client'
import type {
  PersonalizedRecommendations,
  WordRecommendation,
  WeeklyGoal,
  StudyTimeRecommendation,
  DifficultyAdjustment
} from '@/types'

export const recommendationsApi = {
  // 个性化推荐
  async getPersonalizedRecommendations(): Promise<PersonalizedRecommendations> {
    return request.get('/api/recommendations')
  },

  async refreshRecommendations(): Promise<PersonalizedRecommendations> {
    return request.post('/api/recommendations/refresh')
  },

  // 复习推荐
  async getUrgentReviews(limit = 10): Promise<WordRecommendation[]> {
    return request.get('/api/recommendations/urgent-reviews', {
      params: { limit }
    })
  },

  async getDailyReviewPlan(targetMinutes = 30): Promise<{
    recommendations: WordRecommendation[]
    estimatedDuration: number
    breakdown: {
      newWords: number
      reviews: number
      practice: number
    }
  }> {
    return request.get('/api/recommendations/daily-plan', {
      params: { targetMinutes }
    })
  },

  async getAdaptiveReviews(sessionLength = 20): Promise<WordRecommendation[]> {
    return request.get('/api/recommendations/adaptive-reviews', {
      params: { sessionLength }
    })
  },

  // 学习目标和策略
  async getWeeklyGoals(): Promise<WeeklyGoal[]> {
    return request.get('/api/recommendations/weekly-goals')
  },

  async updateGoalProgress(goalType: string, progress: number): Promise<WeeklyGoal> {
    return request.post('/api/recommendations/goals/update', {
      goalType,
      progress
    })
  },

  async getStudyTimeRecommendation(): Promise<StudyTimeRecommendation> {
    return request.get('/api/recommendations/study-time')
  },

  // 难度调整建议
  async getDifficultyAdjustments(): Promise<DifficultyAdjustment[]> {
    return request.get('/api/recommendations/difficulty-adjustments')
  },

  async applyDifficultyAdjustment(wordId: number, newDifficulty: number): Promise<void> {
    return request.post(`/api/recommendations/difficulty-adjustments/${wordId}/apply`, {
      newDifficulty
    })
  },

  async dismissDifficultyAdjustment(wordId: number): Promise<void> {
    return request.post(`/api/recommendations/difficulty-adjustments/${wordId}/dismiss`)
  },

  // 学习策略推荐
  async getLearningStrategies(): Promise<{
    currentStrategies: string[]
    suggestedStrategies: {
      strategy: string
      reason: string
      expectedImprovement: number
      difficulty: 'easy' | 'medium' | 'hard'
    }[]
    personalizedTips: string[]
  }> {
    return request.get('/api/recommendations/learning-strategies')
  },

  // 内容推荐
  async getContentRecommendations(): Promise<{
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
  }> {
    return request.get('/api/recommendations/content')
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
  ): Promise<void> {
    return request.post(`/api/recommendations/${recommendationId}/feedback`, feedback)
  },

  async getRecommendationHistory(
    page = 1,
    limit = 20
  ): Promise<{
    items: {
      id: string
      type: string
      title: string
      description: string
      createTime: string
      followed: boolean
      rating?: number
    }[]
    total: number
    page: number
    limit: number
  }> {
    return request.get('/api/recommendations/history', {
      params: { page, limit }
    })
  },

  // 推荐设置
  async getRecommendationSettings(): Promise<{
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    types: string[]
    maxRecommendations: number
    difficulty: 'conservative' | 'balanced' | 'aggressive'
    includeContentSuggestions: boolean
  }> {
    return request.get('/api/recommendations/settings')
  },

  async updateRecommendationSettings(settings: {
    enabled?: boolean
    frequency?: 'daily' | 'weekly' | 'monthly'
    types?: string[]
    maxRecommendations?: number
    difficulty?: 'conservative' | 'balanced' | 'aggressive'
    includeContentSuggestions?: boolean
  }): Promise<void> {
    return request.put('/api/recommendations/settings', settings)
  }
}
