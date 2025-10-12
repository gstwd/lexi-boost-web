// 导入 axios 相关的类型和模块
import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosAdapter,
  InternalAxiosRequestConfig,
  AxiosRequestConfig
} from 'axios'
// 导入我们自己编写的 mock 数据服务
import { mockDataService } from '@/services/mockDataService'
// 导入 ApiResponse 类型和 ElementPlus 消息组件
import type { ApiResponse } from '@/types'
import { ElMessage } from 'element-plus'

// --- 1. 全局配置 ---

// 定义默认的 API 基础 URL，用于本地开发
const DEFAULT_BASE_URL = 'http://localhost:3001'
// 从 Vite 环境变量中读取 API 基础 URL，如果没有设置，则使用默认值
const BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL
// 判断是否启用 mock 数据模式
const USE_MOCK_DATA = (import.meta.env.VITE_USE_MOCK_DATA ?? String(import.meta.env.DEV)) === 'true'
// 创建一个 WeakSet 用于跟踪已经因为失败而尝试过 mock 回退的请求。
// WeakSet 可以防止内存泄漏，因为它不会阻止垃圾回收器回收其引用的对象。
const mockRetryTracker = new WeakSet<InternalAxiosRequestConfig>()

// --- 2. 类型定义 ---

// 扩展 AxiosError 类型，增加两个自定义的布尔标志，便于错误处理
type ApiClientError = AxiosError & {
  isNetworkError?: boolean // 标记是否为网络错误
  isMockResponse?: boolean // 标记响应是否来自 mock 数据
}

// --- 3. Axios 实例创建与配置 ---

// 创建一个 axios 实例，作为我们整个应用的 API 客户端
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL, // 设置基础 URL
  timeout: 10000, // 设置请求超时时间为 10 秒
  headers: {
    'Content-Type': 'application/json' // 设置默认的请求头
  }
})

// 提取 axios 默认的适配器，以便在需要时可以发送真实的 HTTP 请求
const originalAdapter = extractAdapter(axios.defaults.adapter)

// 如果启用了 mock 数据模式，则用我们自定义的 mock 适配器替换掉 axios 的默认适配器
if (USE_MOCK_DATA) {
  apiClient.defaults.adapter = createMockEnabledAdapter(originalAdapter)
}

/**
 * 安全地从 axios 配置中提取出适配器函数。
 * axios 的适配器可能是一个函数，也可能是一个函数数组。
 * @param adapter - axios.defaults.adapter
 * @returns 提取出的适配器函数或 undefined
 */
function extractAdapter(adapter: unknown): AxiosAdapter | undefined {
  if (!adapter) {
    return undefined
  }
  // 如果是数组，取第一个元素
  if (Array.isArray(adapter)) {
    const [first] = adapter
    return typeof first === 'function' ? (first as AxiosAdapter) : undefined
  }
  // 如果是函数，直接返回
  return typeof adapter === 'function' ? (adapter as AxiosAdapter) : undefined
}

// --- 4. 响应拦截器 (用于优雅降级) ---

// 为 apiClient 设置响应拦截器，主要用于处理请求失败的情况
apiClient.interceptors.response.use(
  // 对于成功的响应 (HTTP 状态码 2xx)，返回 response.data 并处理 ApiResponse 中的 code
  response => {
    const apiResponse = response.data as ApiResponse<unknown>

    // 检查 ApiResponse 中的 code，如果不是 0 则显示错误消息
    if (apiResponse.code !== 0) {
      const message = apiResponse.message || '请求失败'
      ElMessage.error(message)
      // 创建一个错误对象，包含 ApiResponse 的信息
      const error = new Error(message)
      Object.assign(error, { response: { data: apiResponse } })
      return Promise.reject(error)
    }

    // 返回 response.data 而不是整个 response
    return response.data
  },
  // 对于失败的响应，进入这个异步错误处理函数
  async error => {
    // 如果错误不是 axios 错误，直接拒绝，或包装成一个标准 Error 对象
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error instanceof Error ? error : new Error('Unknown API error'))
    }

    // 获取错误的请求配置信息
    const config = error.config as InternalAxiosRequestConfig | undefined

    // **核心逻辑：失败时回退到 Mock 数据 (优雅降级)**
    // 条件：
    // 1. 没有启用主 mock 模式 (即生产环境)
    // 2. 请求配置存在
    // 3. 错误类型符合回退条件 (如服务器5xx错误、网络错误)
    // 4. 这个请求之前没有尝试过回退到 mock (防止无限循环)
    if (!USE_MOCK_DATA && config && shouldFallbackToMock(error) && !hasRetriedWithMock(config)) {
      markRetriedWithMock(config) // 标记此请求已尝试过 mock 回退
      // 尝试从 mock 服务获取数据
      const mockPayload = await handleMockRequest(config) // handleMockRequest 来自 mockDataService
      if (mockPayload) {
        // 如果成功获取到 mock 数据，就伪造一个成功的 axios 响应并返回
        // 这样对于上层调用者来说，就好像 API 调用成功了一样
        return createMockAxiosResponse(config, mockPayload, 'OK (Mock Fallback)')
      }
    }

    // 如果不满足回退条件，或者 mock 回退也失败了，就将错误规范化后抛出
    return Promise.reject(normalizeAxiosError(error))
  }
)

// --- 5. Mock 适配器 (用于主 Mock 模式) ---

/**
 * 创建一个支持 mock 功能的 axios 适配器。
 * 这个适配器会优先尝试从 mock 服务获取数据。
 * @param fallback - 原始的 axios 适配器，当 mock 数据不存在时使用
 * @returns 一个新的 AxiosAdapter
 */
function createMockEnabledAdapter(fallback?: AxiosAdapter): AxiosAdapter {
  return async config => {
    // 尝试从 mock 服务获取数据
    const mockPayload = await handleMockRequest(config) // handleMockRequest 来自 mockDataService
    if (mockPayload) {
      // 如果找到了 mock 数据，直接构造并返回一个 mock 响应
      return createMockAxiosResponse(config, mockPayload)
    }

    // 如果没有找到 mock 数据，并且存在原始的适配器，就用它来发送真实的请求
    if (fallback) {
      return fallback(config)
    }

    // 如果既没有 mock 数据，也没有备用适配器，就抛出错误
    throw new Error('No adapter available for mock request')
  }
}

// --- 6. 辅助函数 ---

/**
 * 判断一个 axios 错误是否应该尝试回退到 mock 数据。
 * @param error - Axios 错误对象
 * @returns 如果应该回退，返回 true
 */
function shouldFallbackToMock(error: AxiosError): boolean {
  // 如果是服务器端错误 (500, 502, 503 等)，应该回退
  if (error.response?.status && error.response.status >= 500) {
    return true
  }
  // 如果根本没有收到响应 (例如 DNS 解析失败、服务器不在线、CORS 错误)，应该回退
  if (!error.response) {
    return true
  }
  // 如果是明确的网络错误码，应该回退
  if (error.code === AxiosError.ERR_NETWORK) {
    return true
  }
  // 其他情况（如 404, 401, 403 等客户端错误）不应该回退，因为这些是业务逻辑上的“正常”错误
  return false
}

/**
 * 检查一个请求配置是否已经尝试过 mock 回退。
 * @param config - 请求配置对象
 * @returns 如果已尝试过，返回 true
 */
function hasRetriedWithMock(config: InternalAxiosRequestConfig): boolean {
  return mockRetryTracker.has(config)
}

/**
 * 标记一个请求配置已经尝试过 mock 回退。
 * @param config - 请求配置对象
 */
function markRetriedWithMock(config: InternalAxiosRequestConfig) {
  mockRetryTracker.add(config)
}

/**
 * 创建一个伪造的、成功的 axios 响应对象。
 * @param config - 原始请求配置
 * @param data - mock 数据
 * @param statusText - 状态文本，用于区分是普通 mock 还是回退 mock
 * @returns 一个符合 AxiosResponse 格式的对象
 */
function createMockAxiosResponse(
  config: InternalAxiosRequestConfig,
  data: unknown,
  statusText = 'OK (Mock)'
): AxiosResponse {
  return {
    data,
    status: 200, // 总是返回 200 成功状态码
    statusText,
    headers: {
      'x-mock-response': 'true' // 添加一个自定义响应头，表明这是一个 mock 响应
    },
    config,
    request: {} // 模拟的 request 对象
  }
}

/**
 * 规范化 axios 错误对象，为其添加额外的辅助标志。
 * @param error - 原始的 AxiosError
 * @returns 增强后的 ApiClientError
 */
function normalizeAxiosError(error: AxiosError): ApiClientError {
  const normalized: ApiClientError = error
  // 如果没有 response 或者错误码是 ERR_NETWORK，则认为是网络错误
  normalized.isNetworkError = !error.response || error.code === AxiosError.ERR_NETWORK
  // 检查响应头，判断是否是来自我们自己创建的 mock 响应
  normalized.isMockResponse = Boolean(error.response?.headers?.['x-mock-response'])
  return normalized
}

/**
 * 解析请求体数据。
 * axios 的 config.data 可能是字符串、对象等多种类型。
 * @param rawData - 原始的请求数据
 * @returns 解析后的数据，通常是一个对象
 */
function parseRequestData(rawData: InternalAxiosRequestConfig['data']): unknown {
  if (rawData == null) {
    return {}
  }
  // 如果是 JSON 字符串，尝试解析它
  if (typeof rawData === 'string' && rawData.length > 0) {
    try {
      return JSON.parse(rawData)
    } catch {
      // 解析失败，则返回原始字符串
      return rawData
    }
  }
  // 如果是其他类型（如对象），直接返回
  return rawData
}

async function handleMockRequest(config: InternalAxiosRequestConfig): Promise<unknown> {
  const url = config.url || ''
  const method = config.method?.toLowerCase() || 'get'
  const params = config.params || {}
  const data = parseRequestData(config.data) as Record<string, unknown>

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

// --- 7. 高级封装函数 ---

/**
 * 封装的请求函数，自动提取 ApiResponse 中的 data 字段
 * 这样 API 定义就可以直接返回实际的数据类型，而不需要包装在 ApiResponse 中
 */
export const request = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = (await apiClient.get(url, config)) as ApiResponse<T>
    return response.data
  },

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = (await apiClient.post(url, data, config)) as ApiResponse<T>
    return response.data
  },

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = (await apiClient.put(url, data, config)) as ApiResponse<T>
    return response.data
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = (await apiClient.delete(url, config)) as ApiResponse<T>
    return response.data
  },

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = (await apiClient.patch(url, data, config)) as ApiResponse<T>
    return response.data
  }
}

export type { ApiClientError }
export default apiClient
