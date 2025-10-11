import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosAdapter,
  InternalAxiosRequestConfig
} from 'axios'
import { mockDataService } from '@/services/mockDataService'

const DEFAULT_BASE_URL = 'http://localhost:3001'
const BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || import.meta.env.DEV
const mockRetryTracker = new WeakSet<InternalAxiosRequestConfig>()

type ApiClientError = AxiosError & {
  isNetworkError?: boolean
  isMockResponse?: boolean
}

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const originalAdapter = extractAdapter(axios.defaults.adapter)

if (USE_MOCK_DATA) {
  apiClient.defaults.adapter = createMockEnabledAdapter(originalAdapter)
}

function extractAdapter(adapter: unknown): AxiosAdapter | undefined {
  if (!adapter) {
    return undefined
  }

  if (Array.isArray(adapter)) {
    const [first] = adapter
    return typeof first === 'function' ? (first as AxiosAdapter) : undefined
  }

  return typeof adapter === 'function' ? (adapter as AxiosAdapter) : undefined
}

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error instanceof Error ? error : new Error('Unknown API error'))
    }

    const config = error.config as InternalAxiosRequestConfig | undefined

    if (!USE_MOCK_DATA && config && shouldFallbackToMock(error) && !hasRetriedWithMock(config)) {
      markRetriedWithMock(config)
      const mockPayload = await handleMockRequest(config)
      if (mockPayload) {
        return createMockAxiosResponse(config, mockPayload, 'OK (Mock Fallback)')
      }
    }

    return Promise.reject(normalizeAxiosError(error))
  }
)

function createMockEnabledAdapter(fallback?: AxiosAdapter): AxiosAdapter {
  return async config => {
    const mockPayload = await handleMockRequest(config)
    if (mockPayload) {
      return createMockAxiosResponse(config, mockPayload)
    }

    if (fallback) {
      return fallback(config)
    }

    throw new Error('No adapter available for mock request')
  }
}

function shouldFallbackToMock(error: AxiosError): boolean {
  if (error.response?.status && error.response.status >= 500) {
    return true
  }
  if (!error.response) {
    return true
  }
  if (error.code === AxiosError.ERR_NETWORK) {
    return true
  }
  return false
}

function hasRetriedWithMock(config: InternalAxiosRequestConfig): boolean {
  return mockRetryTracker.has(config)
}

function markRetriedWithMock(config: InternalAxiosRequestConfig) {
  mockRetryTracker.add(config)
}

function createMockAxiosResponse(
  config: InternalAxiosRequestConfig,
  data: unknown,
  statusText = 'OK (Mock)'
): AxiosResponse {
  return {
    data,
    status: 200,
    statusText,
    headers: {
      'x-mock-response': 'true'
    },
    config,
    request: {}
  }
}

function normalizeAxiosError(error: AxiosError): ApiClientError {
  const normalized: ApiClientError = error
  normalized.isNetworkError = !error.response || error.code === AxiosError.ERR_NETWORK
  normalized.isMockResponse = Boolean(error.response?.headers?.['x-mock-response'])
  return normalized
}

function parseRequestData(rawData: InternalAxiosRequestConfig['data']): any {
  if (rawData == null) {
    return {}
  }

  if (typeof rawData === 'string' && rawData.length > 0) {
    try {
      return JSON.parse(rawData)
    } catch {
      return rawData
    }
  }

  return rawData
}

async function handleMockRequest(config: InternalAxiosRequestConfig): Promise<any> {
  const url = config.url || ''
  const method = config.method?.toLowerCase() || 'get'
  const params = config.params || {}
  const data = parseRequestData(config.data)

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

export type { ApiClientError }
export default apiClient
