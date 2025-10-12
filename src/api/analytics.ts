import { request } from './client'
import type { LearningStats, WordMasteryProgress, StatsPeriod, StatsFilters } from '@/types'

export const analyticsApi = {
  // 学习统计
  async getLearningStats(filters: StatsFilters): Promise<LearningStats> {
    return request.get('/api/analytics/stats', {
      params: filters
    })
  },

  async getHistoricalStats(
    period: StatsPeriod,
    limit = 30,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<{
    labels: string[]
    datasets: {
      wordsRecorded: number[]
      reviewsCompleted: number[]
      accuracy: number[]
      timeSpent: number[]
      newWordsMastered: number[]
    }
  }> {
    return request.get('/api/analytics/historical', {
      params: { period, limit, groupBy }
    })
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
  ): Promise<{
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
  }> {
    return request.get('/api/analytics/mastery-progress', {
      params: { ...filters, page, limit }
    })
  },

  async getWordMasteryDetail(wordEntryId: number): Promise<
    WordMasteryProgress & {
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
    }
  > {
    return request.get(`/api/analytics/mastery-progress/${wordEntryId}`)
  },

  // 学习模式分析
  async getLearningPatterns(): Promise<{
    optimalStudyTimes: {
      hour: number
      performance: number
      sessionCount: number
    }[]
    difficultyTrends: {
      easy: { accuracy: number; timeSpent: number }
      medium: { accuracy: number; timeSpent: number }
      hard: { accuracy: number; timeSpent: number }
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
  }> {
    return request.get('/api/analytics/patterns')
  },

  // 进度预测
  async getProgressPrediction(targetMasteryLevel = 4): Promise<{
    estimatedCompletionDate: string
    wordsRemaining: number
    requiredDailyReviews: number
    confidenceInterval: {
      optimistic: string
      realistic: string
      pessimistic: string
    }
    recommendations: string[]
  }> {
    return request.get('/api/analytics/prediction', {
      params: { targetMasteryLevel }
    })
  },

  // 比较分析
  async getComparativeAnalysis(): Promise<{
    vsLastMonth: {
      wordsLearned: { current: number; previous: number; change: number }
      accuracy: { current: number; previous: number; change: number }
      timeSpent: { current: number; previous: number; change: number }
      consistency: { current: number; previous: number; change: number }
    }
    vsAverage: {
      learningVelocity: { user: number; average: number; percentile: number }
      retentionRate: { user: number; average: number; percentile: number }
      sessionLength: { user: number; average: number; percentile: number }
    }
  }> {
    return request.get('/api/analytics/comparison')
  },

  // 导出功能
  async exportAnalytics(
    format: 'csv' | 'json' | 'pdf',
    filters?: StatsFilters
  ): Promise<{
    downloadUrl: string
    expiresAt: string
  }> {
    return request.post('/api/analytics/export', {
      format,
      filters
    })
  },

  // 个性化洞察
  async getPersonalizedInsights(): Promise<{
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
  }> {
    return request.get('/api/analytics/insights')
  },

  // 词汇分布分析
  async getVocabularyDistribution(): Promise<{
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
  }> {
    return request.get('/api/analytics/vocabulary-distribution')
  }
}
