import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { analyticsApi } from '@/api'
import type {
  LearningStats,
  WordMasteryProgress,
  StatsPeriod,
  StatsFilters
} from '@/types'

export const useAnalyticsStore = defineStore('analytics', () => {
  // 状态
  const stats = ref<LearningStats | null>(null)
  const historicalData = ref<{
    labels: string[]
    datasets: {
      wordsRecorded: number[]
      reviewsCompleted: number[]
      accuracy: number[]
      timeSpent: number[]
      newWordsMastered: number[]
    }
  } | null>(null)

  const masteryProgress = ref<{
    items: WordMasteryProgress[]
    total: number
    summary: {
      totalWords: number
      mastered: number
      inProgress: number
      struggling: number
      averageMasteryLevel: number
    }
  } | null>(null)

  const learningPatterns = ref<{
    optimalStudyTimes: Array<{
      hour: number
      performance: number
      sessionCount: number
    }>
    difficultyTrends: {
      easy: { accuracy: number, timeSpent: number }
      medium: { accuracy: number, timeSpent: number }
      hard: { accuracy: number, timeSpent: number }
    }
    reviewTypeEfficiency: Array<{
      type: string
      accuracy: number
      averageTime: number
      improvementRate: number
    }>
    contextualLearning: Array<{
      context: string
      retentionRate: number
      wordCount: number
    }>
  } | null>(null)

  const personalizedInsights = ref<{
    strengths: string[]
    weaknesses: string[]
    recommendations: Array<{
      title: string
      description: string
      priority: 'high' | 'medium' | 'low'
      category: 'time_management' | 'difficulty' | 'review_strategy' | 'content'
    }>
    achievements: Array<{
      title: string
      description: string
      unlockedAt: string
      icon: string
    }>
    nextMilestones: Array<{
      title: string
      description: string
      progress: number
      target: number
    }>
  } | null>(null)

  const vocabularyDistribution = ref<{
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
  } | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const totalWordsLearned = computed(() => stats.value?.wordsRecorded || 0)
  const averageAccuracy = computed(() => stats.value?.averageAccuracy || 0)
  const studyStreak = computed(() => stats.value?.consistencyDays || 0)
  const learningVelocity = computed(() => stats.value?.learningVelocity || 0)

  const masteryDistribution = computed(() => {
    if (!masteryProgress.value) return null
    return {
      mastered: masteryProgress.value.summary.mastered,
      inProgress: masteryProgress.value.summary.inProgress,
      struggling: masteryProgress.value.summary.struggling,
      total: masteryProgress.value.summary.totalWords
    }
  })

  const bestStudyTime = computed(() => {
    if (!learningPatterns.value?.optimalStudyTimes.length) return null
    return learningPatterns.value.optimalStudyTimes.reduce((best, current) =>
      current.performance > best.performance ? current : best
    )
  })

  const topWeaknesses = computed(() => {
    if (!personalizedInsights.value) return []
    return personalizedInsights.value.weaknesses.slice(0, 3)
  })

  const highPriorityRecommendations = computed(() => {
    if (!personalizedInsights.value) return []
    return personalizedInsights.value.recommendations
      .filter(rec => rec.priority === 'high')
      .slice(0, 3)
  })

  // 数据获取方法
  const fetchLearningStats = async (filters: StatsFilters) => {
    loading.value = true
    error.value = null

    try {
      const response = await analyticsApi.getLearningStats(filters)
      if (response.success) {
        stats.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch learning stats'
      console.error('Error fetching learning stats:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchHistoricalStats = async (
    period: StatsPeriod,
    limit = 30,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await analyticsApi.getHistoricalStats(period, limit, groupBy)
      if (response.success) {
        historicalData.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch historical stats'
      console.error('Error fetching historical stats:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchMasteryProgress = async (filters = {}, page = 1, limit = 20) => {
    loading.value = true
    error.value = null

    try {
      const response = await analyticsApi.getWordMasteryProgress(filters, page, limit)
      if (response.success) {
        masteryProgress.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch mastery progress'
      console.error('Error fetching mastery progress:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchLearningPatterns = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await analyticsApi.getLearningPatterns()
      if (response.success) {
        learningPatterns.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch learning patterns'
      console.error('Error fetching learning patterns:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchPersonalizedInsights = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await analyticsApi.getPersonalizedInsights()
      if (response.success) {
        personalizedInsights.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch personalized insights'
      console.error('Error fetching personalized insights:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchVocabularyDistribution = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await analyticsApi.getVocabularyDistribution()
      if (response.success) {
        vocabularyDistribution.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch vocabulary distribution'
      console.error('Error fetching vocabulary distribution:', err)
    } finally {
      loading.value = false
    }
  }

  const getWordMasteryDetail = async (wordEntryId: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await analyticsApi.getWordMasteryDetail(wordEntryId)
      if (response.success) {
        return response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get word mastery detail'
      console.error('Error getting word mastery detail:', err)
    } finally {
      loading.value = false
    }
    return null
  }

  const getProgressPrediction = async (targetMasteryLevel = 4) => {
    loading.value = true
    error.value = null

    try {
      const response = await analyticsApi.getProgressPrediction(targetMasteryLevel)
      if (response.success) {
        return response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get progress prediction'
      console.error('Error getting progress prediction:', err)
    } finally {
      loading.value = false
    }
    return null
  }

  const getComparativeAnalysis = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await analyticsApi.getComparativeAnalysis()
      if (response.success) {
        return response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get comparative analysis'
      console.error('Error getting comparative analysis:', err)
    } finally {
      loading.value = false
    }
    return null
  }

  const exportAnalytics = async (format: 'csv' | 'json' | 'pdf', filters?: StatsFilters) => {
    loading.value = true
    error.value = null

    try {
      const response = await analyticsApi.exportAnalytics(format, filters)
      if (response.success) {
        return response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to export analytics'
      console.error('Error exporting analytics:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 刷新所有数据
  const refreshAllData = async () => {
    await Promise.allSettled([
      fetchLearningStats({ period: 'monthly' }),
      fetchHistoricalStats('monthly'),
      fetchMasteryProgress(),
      fetchLearningPatterns(),
      fetchPersonalizedInsights(),
      fetchVocabularyDistribution()
    ])
  }

  // 工具方法
  const clearError = () => {
    error.value = null
  }

  const resetData = () => {
    stats.value = null
    historicalData.value = null
    masteryProgress.value = null
    learningPatterns.value = null
    personalizedInsights.value = null
    vocabularyDistribution.value = null
  }

  // 数据格式化辅助方法
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const formatAccuracy = (accuracy: number): string => {
    return `${(accuracy * 100).toFixed(1)}%`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  return {
    // 状态
    stats,
    historicalData,
    masteryProgress,
    learningPatterns,
    personalizedInsights,
    vocabularyDistribution,
    loading,
    error,

    // Computed
    totalWordsLearned,
    averageAccuracy,
    studyStreak,
    learningVelocity,
    masteryDistribution,
    bestStudyTime,
    topWeaknesses,
    highPriorityRecommendations,

    // 数据获取
    fetchLearningStats,
    fetchHistoricalStats,
    fetchMasteryProgress,
    fetchLearningPatterns,
    fetchPersonalizedInsights,
    fetchVocabularyDistribution,
    getWordMasteryDetail,
    getProgressPrediction,
    getComparativeAnalysis,
    exportAnalytics,
    refreshAllData,

    // 工具方法
    clearError,
    resetData,
    formatDuration,
    formatAccuracy,
    formatDate
  }
})