import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { reviewsApi } from '@/api'
import type {
  ReviewSchedule,
  ReviewSession,
  ReviewFilters,
  ReviewType
} from '@/types'

export const useReviewsStore = defineStore('reviews', () => {
  // 状态
  const schedules = ref<ReviewSchedule[]>([])
  const currentSchedule = ref<ReviewSchedule | null>(null)
  const sessions = ref<ReviewSession[]>([])
  const currentSession = ref<{
    sessionId: string
    reviews: ReviewSchedule[]
    currentIndex: number
    startTime: number
  } | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)

  const filters = ref<ReviewFilters>({})
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0
  })

  // 复习设置
  const settings = ref({
    dailyGoal: 30,
    sessionLength: 20,
    reviewTypes: ['recognition', 'recall', 'context'] as ReviewType[],
    difficultySetting: 'adaptive' as 'adaptive' | 'manual',
    showContext: true,
    allowHints: true,
    autoSchedule: true
  })

  // 统计数据
  const stats = ref({
    dueToday: 0,
    completedToday: 0,
    streak: 0,
    weeklyProgress: 0,
    averageAccuracy: 0,
    totalWordsLearned: 0,
    masteredWords: 0
  })

  // Computed
  const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))

  const dueSchedules = computed(() =>
    schedules.value.filter(schedule =>
      schedule.status === 'due' || schedule.status === 'overdue'
    )
  )

  const overdueSchedules = computed(() =>
    schedules.value.filter(schedule => schedule.status === 'overdue')
  )

  const sessionProgress = computed(() => {
    if (!currentSession.value) return 0
    return (currentSession.value.currentIndex / currentSession.value.reviews.length) * 100
  })

  const dailyProgress = computed(() => {
    if (settings.value.dailyGoal === 0) return 0
    return Math.min((stats.value.completedToday / settings.value.dailyGoal) * 100, 100)
  })

  // 复习调度管理
  const fetchSchedules = async (newFilters: ReviewFilters = {}, page = 1, limit = 20) => {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.getReviewSchedules(newFilters, page, limit)
      if (response.success) {
        schedules.value = response.data.items
        pagination.value = {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total
        }
        filters.value = newFilters
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch schedules'
      console.error('Error fetching schedules:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchDueReviews = async (limit = 50) => {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.getDueReviews(limit)
      if (response.success) {
        schedules.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch due reviews'
      console.error('Error fetching due reviews:', err)
    } finally {
      loading.value = false
    }
  }

  const getSchedule = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.getReviewSchedule(id)
      if (response.success) {
        currentSchedule.value = response.data
        return response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get schedule'
      console.error('Error getting schedule:', err)
    } finally {
      loading.value = false
    }
    return null
  }

  const updateSchedule = async (id: number, updates: Partial<ReviewSchedule>) => {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.updateReviewSchedule(id, updates)
      if (response.success) {
        const index = schedules.value.findIndex(s => s.id === id)
        if (index !== -1) {
          schedules.value[index] = response.data
        }
        if (currentSchedule.value?.id === id) {
          currentSchedule.value = response.data
        }
        return response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update schedule'
      console.error('Error updating schedule:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 复习会话管理
  const startReviewSession = async (wordRecordIds: number[]) => {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.startReviewSession(wordRecordIds)
      if (response.success) {
        currentSession.value = {
          sessionId: response.data.sessionId,
          reviews: response.data.reviews,
          currentIndex: 0,
          startTime: Date.now()
        }
        return response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to start review session'
      console.error('Error starting review session:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const submitReviewResult = async (result: {
    reviewType: ReviewType
    accuracy: number
    responseTime: number
    userResponse: string
    expectedResponse: string
    contextShown: boolean
    hintsUsed: number
    feedback?: string
    difficultyRating?: number
  }) => {
    if (!currentSession.value) {
      throw new Error('No active session')
    }

    loading.value = true
    error.value = null

    try {
      const currentReview = currentSession.value.reviews[currentSession.value.currentIndex]
      const response = await reviewsApi.submitReviewResult({
        sessionId: currentSession.value.sessionId,
        wordRecordId: currentReview.wordRecordId,
        ...result
      })

      if (response.success) {
        // 更新当前会话状态
        currentSession.value.currentIndex++

        // 更新本地调度状态
        const scheduleIndex = schedules.value.findIndex(s => s.id === currentReview.id)
        if (scheduleIndex !== -1) {
          schedules.value[scheduleIndex].nextReviewDate = response.data.nextReviewDate
          schedules.value[scheduleIndex].status = 'pending'
        }

        return response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to submit review result'
      console.error('Error submitting review result:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const endReviewSession = async () => {
    if (!currentSession.value) {
      throw new Error('No active session')
    }

    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.endReviewSession(currentSession.value.sessionId)
      if (response.success) {
        // 更新统计数据
        stats.value.completedToday += response.data.completedReviews

        // 清除当前会话
        currentSession.value = null

        return response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to end review session'
      console.error('Error ending review session:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 复习历史和统计
  const fetchSessions = async (page = 1, limit = 20, sessionFilters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.getReviewSessions(page, limit, sessionFilters)
      if (response.success) {
        sessions.value = response.data.items
        return response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch sessions'
      console.error('Error fetching sessions:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchDashboardStats = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.getDashboardStats()
      if (response.success) {
        stats.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch dashboard stats'
      console.error('Error fetching dashboard stats:', err)
    } finally {
      loading.value = false
    }
  }

  // 设置管理
  const fetchSettings = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.getReviewSettings()
      if (response.success) {
        settings.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch settings'
      console.error('Error fetching settings:', err)
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (newSettings: Partial<typeof settings.value>) => {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.updateReviewSettings(newSettings)
      if (response.success) {
        Object.assign(settings.value, newSettings)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update settings'
      console.error('Error updating settings:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 工具方法
  const clearError = () => {
    error.value = null
  }

  const resetCurrentSession = () => {
    currentSession.value = null
  }

  const getCurrentReview = () => {
    if (!currentSession.value || currentSession.value.currentIndex >= currentSession.value.reviews.length) {
      return null
    }
    return currentSession.value.reviews[currentSession.value.currentIndex]
  }

  const isSessionComplete = computed(() => {
    if (!currentSession.value) return false
    return currentSession.value.currentIndex >= currentSession.value.reviews.length
  })

  const getRemainingReviews = () => {
    if (!currentSession.value) return 0
    return Math.max(0, currentSession.value.reviews.length - currentSession.value.currentIndex)
  }

  return {
    // 状态
    schedules,
    currentSchedule,
    sessions,
    currentSession,
    loading,
    error,
    filters,
    pagination,
    settings,
    stats,

    // Computed
    totalPages,
    dueSchedules,
    overdueSchedules,
    sessionProgress,
    dailyProgress,
    isSessionComplete,

    // 复习调度
    fetchSchedules,
    fetchDueReviews,
    getSchedule,
    updateSchedule,

    // 复习会话
    startReviewSession,
    submitReviewResult,
    endReviewSession,
    getCurrentReview,
    getRemainingReviews,

    // 历史和统计
    fetchSessions,
    fetchDashboardStats,

    // 设置
    fetchSettings,
    updateSettings,

    // 工具方法
    clearError,
    resetCurrentSession
  }
})