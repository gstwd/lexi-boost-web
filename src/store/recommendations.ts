import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { recommendationsApi } from '@/api'
import type {
  PersonalizedRecommendations,
  WordRecommendation,
  WeeklyGoal,
  StudyTimeRecommendation,
  DifficultyAdjustment
} from '@/types'

export const useRecommendationsStore = defineStore('recommendations', () => {
  // 状态
  const recommendations = ref<PersonalizedRecommendations | null>(null)
  const urgentReviews = ref<WordRecommendation[]>([])
  const dailyPlan = ref<{
    recommendations: WordRecommendation[]
    estimatedDuration: number
    breakdown: {
      newWords: number
      reviews: number
      practice: number
    }
  } | null>(null)

  const weeklyGoals = ref<WeeklyGoal[]>([])
  const studyTimeRecommendation = ref<StudyTimeRecommendation | null>(null)
  const difficultyAdjustments = ref<DifficultyAdjustment[]>([])

  const learningStrategies = ref<{
    currentStrategies: string[]
    suggestedStrategies: Array<{
      strategy: string
      reason: string
      expectedImprovement: number
      difficulty: 'easy' | 'medium' | 'hard'
    }>
    personalizedTips: string[]
  } | null>(null)

  const contentRecommendations = ref<{
    suggestedWords: Array<{
      word: string
      reason: string
      difficulty: number
      priority: number
      relatedWords: string[]
    }>
    topicsToExplore: Array<{
      topic: string
      wordCount: number
      averageDifficulty: number
      description: string
    }>
    reviewMaterials: Array<{
      type: 'article' | 'video' | 'exercise' | 'game'
      title: string
      description: string
      difficulty: number
      estimatedTime: number
      url?: string
    }>
  } | null>(null)

  const settings = ref({
    enabled: true,
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    types: ['review', 'study_time', 'difficulty', 'content'] as string[],
    maxRecommendations: 10,
    difficulty: 'balanced' as 'conservative' | 'balanced' | 'aggressive',
    includeContentSuggestions: true
  })

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasUrgentReviews = computed(() => urgentReviews.value.length > 0)
  const criticalUrgentReviews = computed(() => urgentReviews.value.filter(review => review.urgencyLevel === 'critical'))

  const completedGoals = computed(() => weeklyGoals.value.filter(goal => goal.current >= goal.target))

  const pendingGoals = computed(() => weeklyGoals.value.filter(goal => goal.current < goal.target))

  const goalProgress = computed(() => {
    if (weeklyGoals.value.length === 0) return 0
    const totalProgress = weeklyGoals.value.reduce((sum, goal) => sum + Math.min(goal.current / goal.target, 1), 0)
    return (totalProgress / weeklyGoals.value.length) * 100
  })

  const highPriorityAdjustments = computed(() => difficultyAdjustments.value.filter(adj => adj.confidence > 0.8))

  const dailyPlanDuration = computed(() => dailyPlan.value?.estimatedDuration || 0)

  const easyStrategies = computed(
    () => learningStrategies.value?.suggestedStrategies.filter(s => s.difficulty === 'easy') || []
  )

  // 推荐获取
  const fetchRecommendations = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await recommendationsApi.getPersonalizedRecommendations()
      if (response.success) {
        recommendations.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch recommendations'
      console.error('Error fetching recommendations:', err)
    } finally {
      loading.value = false
    }
  }

  const refreshRecommendations = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await recommendationsApi.refreshRecommendations()
      if (response.success) {
        recommendations.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to refresh recommendations'
      console.error('Error refreshing recommendations:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchUrgentReviews = async (limit = 10) => {
    loading.value = true
    error.value = null

    try {
      const response = await recommendationsApi.getUrgentReviews(limit)
      if (response.success) {
        urgentReviews.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch urgent reviews'
      console.error('Error fetching urgent reviews:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchDailyPlan = async (targetMinutes = 30) => {
    loading.value = true
    error.value = null

    try {
      const response = await recommendationsApi.getDailyReviewPlan(targetMinutes)
      if (response.success) {
        dailyPlan.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch daily plan'
      console.error('Error fetching daily plan:', err)
    } finally {
      loading.value = false
    }
  }

  const getAdaptiveReviews = async (sessionLength = 20) => {
    loading.value = true
    error.value = null

    try {
      const response = await recommendationsApi.getAdaptiveReviews(sessionLength)
      if (response.success) {
        return response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get adaptive reviews'
      console.error('Error getting adaptive reviews:', err)
    } finally {
      loading.value = false
    }
    return []
  }

  // 目标管理
  const fetchWeeklyGoals = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await recommendationsApi.getWeeklyGoals()
      if (response.success) {
        weeklyGoals.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch weekly goals'
      console.error('Error fetching weekly goals:', err)
    } finally {
      loading.value = false
    }
  }

  const updateGoalProgress = async (goalType: string, progress: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await recommendationsApi.updateGoalProgress(goalType, progress)
      if (response.success) {
        const index = weeklyGoals.value.findIndex(goal => goal.type === goalType)
        if (index !== -1) {
          weeklyGoals.value[index] = response.data
        }
        return response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update goal progress'
      console.error('Error updating goal progress:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 学习时间优化
  const fetchStudyTimeRecommendation = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await recommendationsApi.getStudyTimeRecommendation()
      if (response.success) {
        studyTimeRecommendation.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch study time recommendation'
      console.error('Error fetching study time recommendation:', err)
    } finally {
      loading.value = false
    }
  }

  // 难度调整
  const fetchDifficultyAdjustments = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await recommendationsApi.getDifficultyAdjustments()
      if (response.success) {
        difficultyAdjustments.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch difficulty adjustments'
      console.error('Error fetching difficulty adjustments:', err)
    } finally {
      loading.value = false
    }
  }

  const applyDifficultyAdjustment = async (wordId: number, newDifficulty: number) => {
    loading.value = true
    error.value = null

    try {
      await recommendationsApi.applyDifficultyAdjustment(wordId, newDifficulty)
      // 从列表中移除已应用的调整
      difficultyAdjustments.value = difficultyAdjustments.value.filter(adj => adj.wordId !== wordId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to apply difficulty adjustment'
      console.error('Error applying difficulty adjustment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const dismissDifficultyAdjustment = async (wordId: number) => {
    loading.value = true
    error.value = null

    try {
      await recommendationsApi.dismissDifficultyAdjustment(wordId)
      // 从列表中移除已忽略的调整
      difficultyAdjustments.value = difficultyAdjustments.value.filter(adj => adj.wordId !== wordId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to dismiss difficulty adjustment'
      console.error('Error dismissing difficulty adjustment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 学习策略
  const fetchLearningStrategies = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await recommendationsApi.getLearningStrategies()
      if (response.success) {
        learningStrategies.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch learning strategies'
      console.error('Error fetching learning strategies:', err)
    } finally {
      loading.value = false
    }
  }

  // 内容推荐
  const fetchContentRecommendations = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await recommendationsApi.getContentRecommendations()
      if (response.success) {
        contentRecommendations.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch content recommendations'
      console.error('Error fetching content recommendations:', err)
    } finally {
      loading.value = false
    }
  }

  // 反馈系统
  const provideFeedback = async (
    recommendationId: string,
    feedback: {
      helpful: boolean
      followed: boolean
      rating: number
      comment?: string
    }
  ) => {
    loading.value = true
    error.value = null

    try {
      await recommendationsApi.provideFeedback(recommendationId, feedback)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to provide feedback'
      console.error('Error providing feedback:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 设置管理
  const fetchSettings = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await recommendationsApi.getRecommendationSettings()
      if (response.success) {
        settings.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch recommendation settings'
      console.error('Error fetching recommendation settings:', err)
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (newSettings: Partial<typeof settings.value>) => {
    loading.value = true
    error.value = null

    try {
      await recommendationsApi.updateRecommendationSettings(newSettings)
      Object.assign(settings.value, newSettings)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update recommendation settings'
      console.error('Error updating recommendation settings:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 批量获取所有推荐数据
  const fetchAllRecommendations = async (targetMinutes = 30) => {
    await Promise.allSettled([
      fetchRecommendations(),
      fetchUrgentReviews(),
      fetchDailyPlan(targetMinutes),
      fetchWeeklyGoals(),
      fetchStudyTimeRecommendation(),
      fetchDifficultyAdjustments(),
      fetchLearningStrategies(),
      fetchContentRecommendations()
    ])
  }

  // 工具方法
  const clearError = () => {
    error.value = null
  }

  const resetData = () => {
    recommendations.value = null
    urgentReviews.value = []
    dailyPlan.value = null
    weeklyGoals.value = []
    studyTimeRecommendation.value = null
    difficultyAdjustments.value = []
    learningStrategies.value = null
    contentRecommendations.value = null
  }

  return {
    // 状态
    recommendations,
    urgentReviews,
    dailyPlan,
    weeklyGoals,
    studyTimeRecommendation,
    difficultyAdjustments,
    learningStrategies,
    contentRecommendations,
    settings,
    loading,
    error,

    // Computed
    hasUrgentReviews,
    criticalUrgentReviews,
    completedGoals,
    pendingGoals,
    goalProgress,
    highPriorityAdjustments,
    dailyPlanDuration,
    easyStrategies,

    // 推荐获取
    fetchRecommendations,
    refreshRecommendations,
    fetchUrgentReviews,
    fetchDailyPlan,
    getAdaptiveReviews,

    // 目标管理
    fetchWeeklyGoals,
    updateGoalProgress,

    // 学习时间优化
    fetchStudyTimeRecommendation,

    // 难度调整
    fetchDifficultyAdjustments,
    applyDifficultyAdjustment,
    dismissDifficultyAdjustment,

    // 学习策略
    fetchLearningStrategies,

    // 内容推荐
    fetchContentRecommendations,

    // 反馈
    provideFeedback,

    // 设置
    fetchSettings,
    updateSettings,

    // 批量操作
    fetchAllRecommendations,

    // 工具方法
    clearError,
    resetData
  }
})
