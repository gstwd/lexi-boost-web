import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios'
import { mockDataService } from '@/services/mockDataService'
import { ElMessage } from 'element-plus'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
// const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || import.meta.env.DEV
const USE_MOCK_DATA = true
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  async config => {
    if (USE_MOCK_DATA) {
      const mockResponse = await handleMockRequest(config)
      if (mockResponse) {
        const response: AxiosResponse = {
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {}
        }
        const mockError = new Error('MOCK_RESPONSE') as any
        mockError.response = response
        mockError.isMock = true
        throw mockError
      }
    }
    return config
  },
  (error: AxiosError) => {
    ElMessage.error('请求发送失败，请检查网络或配置')
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError | any) => {
    // ✅ Mock 响应处理
    if (error.isMock && error.response) {
      return Promise.resolve(error.response)
    }

    // ✅ 后端不可用时尝试 Mock
    if (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNREFUSED' ||
      (error.response?.status && error.response.status >= 500)
    ) {
      const mockResponse = await handleMockRequest(error.config)
      if (mockResponse) {
        ElMessage.warning('后端服务不可用，已使用模拟数据') // ✅ 提示使用了 mock
        return Promise.resolve({
          data: mockResponse,
          status: 200,
          statusText: 'OK (Mock)',
          headers: {},
          config: error.config,
          request: {}
        })
      }
    }

    // ✅ 错误分类弹窗提示
    if (error.response?.status === 401) {
      ElMessage.warning('未授权或登录已过期，请重新登录')
    } else if (error.response?.status && error.response.status >= 500) {
      ElMessage.error('服务器内部错误，请稍后再试')
    } else if (error.code === 'NETWORK_ERROR') {
      ElMessage.error('网络错误，请检查连接')
    } else if (error.response?.status === 404) {
      ElMessage.error('请求的资源不存在')
    } else {
      ElMessage.error(error.message || '请求发生错误')
    }

    return Promise.reject(error)
  }
)

// Mock request handler
async function handleMockRequest(config: AxiosRequestConfig): Promise<any> {
  const url = config.url || ''
  const method = config.method?.toLowerCase() || 'get'
  const params = config.params || {}
  const data = config.data || {}

  try {
    // Words API
    if (url.match(/\/api\/words$/)) {
      if (method === 'get') return mockDataService.getWords(params.page, params.limit)
      if (method === 'post') return mockDataService.createWord(data)
    }

    if (url.match(/\/api\/words\/\d+$/)) {
      const id = parseInt(url.match(/\/api\/words\/(\d+)$/)?.[1] || '1')
      if (method === 'get') return mockDataService.getWordById(id)
      if (method === 'put') return mockDataService.updateWord(id, data)
      if (method === 'delete') return mockDataService.deleteWord(id)
    }

    if (url.includes('/api/word-entries/search')) {
      return mockDataService.searchWordEntries(params.query, params.page, params.limit)
    }

    if (url.match(/\/api\/word-entries\/[^/]+$/)) {
      const word = url.split('/').pop() || ''
      return mockDataService.getWordEntry(decodeURIComponent(word))
    }

    if (url.match(/\/api\/word-entries\/\d+$/)) {
      const id = parseInt(url.match(/\/api\/word-entries\/(\d+)$/)?.[1] || '1')
      return mockDataService.getWordEntryById(id)
    }

    if (url.includes('/api/word-records')) {
      if (url.includes('/check-duplication') && method === 'post') {
        return mockDataService.checkDuplication(data.word, data.meaning, data.context)
      }
      if (url.includes('/duplication/')) {
        const id = parseInt(url.match(/\/duplication\/(\d+)$/)?.[1] || '1')
        return mockDataService.getDuplicationAnalysis(id)
      }
      if (url.includes('/bulk') && method === 'post') {
        return mockDataService.bulkCreateWordRecords(data.records)
      }
      if (url.includes('/export') && method === 'post') {
        return mockDataService.exportWordRecords(data)
      }
      if (url.includes('/stats')) {
        return mockDataService.getWordRecordStats(params)
      }
      if (url.match(/\/api\/word-records\/\d+$/)) {
        const id = parseInt(url.match(/\/api\/word-records\/(\d+)$/)?.[1] || '1')
        if (method === 'get') return mockDataService.getWordRecord(id)
        if (method === 'put') return mockDataService.updateWordRecord(id, data)
        if (method === 'delete') return mockDataService.deleteWordRecord(id)
      }
      if (method === 'get') return mockDataService.getWordRecords(params, params.page, params.limit)
      if (method === 'post') return mockDataService.createWordRecord(data)
    }

    // Reviews API
    if (url.includes('/api/reviews/schedules')) {
      if (url.includes('/reschedule') && method === 'post') {
        const id = parseInt(url.match(/\/schedules\/(\d+)\/reschedule$/)?.[1] || '1')
        return mockDataService.rescheduleReview(id, data.newDate)
      }
      if (url.match(/\/api\/reviews\/schedules\/\d+$/)) {
        const id = parseInt(url.match(/\/schedules\/(\d+)$/)?.[1] || '1')
        if (method === 'get') return mockDataService.getReviewSchedule(id)
        if (method === 'put') return mockDataService.updateReviewSchedule(id, data)
      }
      if (method === 'get') return mockDataService.getReviewSchedules(params, params.page, params.limit)
    }

    if (url.includes('/api/reviews/due')) {
      return mockDataService.getDueReviews(params.limit)
    }

    if (url.includes('/api/reviews/sessions')) {
      if (url.includes('/start') && method === 'post') {
        return mockDataService.startReviewSession(data.wordRecordIds)
      }
      if (url.includes('/submit') && method === 'post') {
        return mockDataService.submitReviewResult(data)
      }
      if (url.includes('/end') && method === 'post') {
        const sessionId = url.match(/\/sessions\/([^/]+)\/end$/)?.[1] || ''
        return mockDataService.endReviewSession(sessionId)
      }
      if (url.match(/\/api\/reviews\/sessions\/\d+$/)) {
        const id = parseInt(url.match(/\/sessions\/(\d+)$/)?.[1] || '1')
        return mockDataService.getReviewSession(id)
      }
      if (method === 'get') return mockDataService.getReviewSessions(params.page, params.limit, params)
    }

    if (url.includes('/api/reviews/stats')) {
      return mockDataService.getReviewStats(params.period, params.limit)
    }

    if (url.includes('/api/reviews/dashboard')) {
      return mockDataService.getDashboardStats()
    }

    if (url.includes('/api/reviews/settings')) {
      if (method === 'get') return mockDataService.getReviewSettings()
      if (method === 'put') return mockDataService.updateReviewSettings(data)
    }

    if (url.includes('/api/reviews/bulk-review')) {
      return mockDataService.markMultipleAsReviewed(data.scheduleIds, data.result)
    }

    if (url.includes('/api/reviews/reset')) {
      return mockDataService.resetReviewProgress(data.wordRecordIds)
    }

    // Analytics API
    if (url.includes('/api/analytics/stats')) {
      return mockDataService.getLearningStats(params)
    }

    if (url.includes('/api/analytics/historical')) {
      return mockDataService.getHistoricalStats(params.period, params.limit, params.groupBy)
    }

    if (url.includes('/api/analytics/mastery-progress')) {
      if (url.match(/\/mastery-progress\/\d+$/)) {
        const id = parseInt(url.match(/\/mastery-progress\/(\d+)$/)?.[1] || '1')
        return mockDataService.getWordMasteryDetail(id)
      }
      return mockDataService.getWordMasteryProgress(params, params.page, params.limit)
    }

    if (url.includes('/api/analytics/patterns')) {
      return mockDataService.getLearningPatterns()
    }

    if (url.includes('/api/analytics/prediction')) {
      return mockDataService.getProgressPrediction(params.targetMasteryLevel)
    }

    if (url.includes('/api/analytics/comparison')) {
      return mockDataService.getComparativeAnalysis()
    }

    if (url.includes('/api/analytics/export')) {
      return mockDataService.exportAnalytics(data.format, data.filters)
    }

    if (url.includes('/api/analytics/insights')) {
      return mockDataService.getPersonalizedInsights()
    }

    if (url.includes('/api/analytics/vocabulary-distribution')) {
      return mockDataService.getVocabularyDistribution()
    }

    // Recommendations API
    if (url === '/api/recommendations') {
      if (method === 'get') return mockDataService.getPersonalizedRecommendations()
    }

    if (url.includes('/api/recommendations/refresh')) {
      return mockDataService.refreshRecommendations()
    }

    if (url.includes('/api/recommendations/urgent-reviews')) {
      return mockDataService.getUrgentReviews(params.limit)
    }

    if (url.includes('/api/recommendations/daily-plan')) {
      return mockDataService.getDailyReviewPlan(params.targetMinutes)
    }

    if (url.includes('/api/recommendations/adaptive-reviews')) {
      return mockDataService.getAdaptiveReviews(params.sessionLength)
    }

    if (url.includes('/api/recommendations/weekly-goals')) {
      return mockDataService.getWeeklyGoals()
    }

    if (url.includes('/api/recommendations/goals/update')) {
      return mockDataService.updateGoalProgress(data.goalType, data.progress)
    }

    if (url.includes('/api/recommendations/study-time')) {
      return mockDataService.getStudyTimeRecommendation()
    }

    if (url.includes('/api/recommendations/difficulty-adjustments')) {
      if (url.includes('/apply') && method === 'post') {
        const id = parseInt(url.match(/\/difficulty-adjustments\/(\d+)\/apply$/)?.[1] || '1')
        return mockDataService.applyDifficultyAdjustment(id, data.newDifficulty)
      }
      if (url.includes('/dismiss') && method === 'post') {
        const id = parseInt(url.match(/\/difficulty-adjustments\/(\d+)\/dismiss$/)?.[1] || '1')
        return mockDataService.dismissDifficultyAdjustment(id)
      }
      return mockDataService.getDifficultyAdjustments()
    }

    if (url.includes('/api/recommendations/learning-strategies')) {
      return mockDataService.getLearningStrategies()
    }

    if (url.includes('/api/recommendations/content')) {
      return mockDataService.getContentRecommendations()
    }

    if (url.includes('/api/recommendations/') && url.includes('/feedback')) {
      const id = url.match(/\/recommendations\/([^/]+)\/feedback$/)?.[1] || ''
      return mockDataService.provideFeedback(id, data)
    }

    if (url.includes('/api/recommendations/history')) {
      return mockDataService.getRecommendationHistory(params.page, params.limit)
    }

    if (url.includes('/api/recommendations/settings')) {
      if (method === 'get') return mockDataService.getRecommendationSettings()
      if (method === 'put') return mockDataService.updateRecommendationSettings(data)
    }
  } catch (error) {
    console.error('Mock data error:', error)
  }

  return null
}

export default apiClient
