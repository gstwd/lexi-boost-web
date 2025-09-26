import apiClient from './client'
import type {
  LearningStats,
  WordMasteryProgress,
  StatsPeriod,
  StatsFilters,
  ApiResponse
} from '@/types'

export const analyticsApi = {
  // 学习统计
  async getLearningStats(filters: StatsFilters): Promise<ApiResponse<LearningStats>> {
    const response = await apiClient.get('/api/analytics/stats', {
      params: filters
    })
    return response.data
  },

  async getHistoricalStats(
    period: StatsPeriod,
    limit = 30,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<ApiResponse<{
    labels: string[]
    datasets: {
      wordsRecorded: number[]
      reviewsCompleted: number[]
      accuracy: number[]
      timeSpent: number[]
      newWordsMastered: number[]
    }
  }>> {
    const response = await apiClient.get('/api/analytics/historical', {
      params: { period, limit, groupBy }
    })
    return response.data
  },

  // 单词掌握进度
  async getWordMasteryProgress(
    filters?: {
      masteryLevel?: number[]
      trend?: string[]
      difficulty?: number[]
      search?: string
    },
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{
    items: WordMasteryProgress[]
    total: number
    page: number
    limit: number
    summary: {
      totalWords: number
      mastered: number
      inProgress: number
      struggling: number
      averageMasteryLevel: number
    }
  }>> {
    const response = await apiClient.get('/api/analytics/mastery-progress', {
      params: { ...filters, page, limit }
    })
    return response.data
  },

  async getWordMasteryDetail(wordEntryId: number): Promise<ApiResponse<WordMasteryProgress & {
    recordHistory: {
      date: string
      meaning: string
      context: string
      confidence: number
    }[]
    reviewHistory: {
      date: string
      reviewType: string
      accuracy: number
      responseTime: number
    }[]
  }>> {
    const response = await apiClient.get(`/api/analytics/mastery-progress/${wordEntryId}`)
    return response.data
  },

  // 学习模式分析
  async getLearningPatterns(): Promise<ApiResponse<{
    optimalStudyTimes: {
      hour: number
      performance: number
      sessionCount: number
    }[]
    difficultyTrends: {
      easy: { accuracy: number, timeSpent: number }
      medium: { accuracy: number, timeSpent: number }
      hard: { accuracy: number, timeSpent: number }
    }
    reviewTypeEfficiency: {
      type: string
      accuracy: number
      averageTime: number
      improvementRate: number
    }[]
    contextualLearning: {
      context: string
      retentionRate: number
      wordCount: number
    }[]
  }>> {
    const response = await apiClient.get('/api/analytics/patterns')
    return response.data
  },

  // 进度预测
  async getProgressPrediction(targetMasteryLevel = 4): Promise<ApiResponse<{
    estimatedCompletionDate: string
    wordsRemaining: number
    requiredDailyReviews: number
    confidenceInterval: {
      optimistic: string
      realistic: string
      pessimistic: string
    }
    recommendations: string[]
  }>> {
    const response = await apiClient.get('/api/analytics/prediction', {
      params: { targetMasteryLevel }
    })
    return response.data
  },

  // 比较分析
  async getComparativeAnalysis(): Promise<ApiResponse<{
    vsLastMonth: {
      wordsLearned: { current: number, previous: number, change: number }
      accuracy: { current: number, previous: number, change: number }
      timeSpent: { current: number, previous: number, change: number }
      consistency: { current: number, previous: number, change: number }
    }
    vsAverage: {
      learningVelocity: { user: number, average: number, percentile: number }
      retentionRate: { user: number, average: number, percentile: number }
      sessionLength: { user: number, average: number, percentile: number }
    }
  }>> {
    const response = await apiClient.get('/api/analytics/comparison')
    return response.data
  },

  // 导出功能
  async exportAnalytics(format: 'csv' | 'json' | 'pdf', filters?: StatsFilters): Promise<ApiResponse<{
    downloadUrl: string
    expiresAt: string
  }>> {
    const response = await apiClient.post('/api/analytics/export', {
      format,
      filters
    })
    return response.data
  },

  // 个性化洞察
  async getPersonalizedInsights(): Promise<ApiResponse<{
    strengths: string[]
    weaknesses: string[]
    recommendations: {
      title: string
      description: string
      priority: 'high' | 'medium' | 'low'
      category: 'time_management' | 'difficulty' | 'review_strategy' | 'content'
    }[]
    achievements: {
      title: string
      description: string
      unlockedAt: string
      icon: string
    }[]
    nextMilestones: {
      title: string
      description: string
      progress: number
      target: number
    }[]
  }>> {
    const response = await apiClient.get('/api/analytics/insights')
    return response.data
  },

  // 词汇分布分析
  async getVocabularyDistribution(): Promise<ApiResponse<{
    difficultyDistribution: Record<string, number>
    partOfSpeechDistribution: Record<string, number>
    frequencyDistribution: {
      veryCommon: number
      common: number
      uncommon: number
      rare: number
    }
    sourceDistribution: Record<string, number>
    locationDistribution: Record<string, number>
  }>> {
    const response = await apiClient.get('/api/analytics/vocabulary-distribution')
    return response.data
  }
}