// 导入 axios 相关的类型和模块
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'
// 导入 ApiResponse 类型和 ElementPlus 消息组件
import type { ApiResponse } from '@/types'
import { ElMessage } from 'element-plus'

// --- 1. 全局配置 ---

// 定义默认的 API 基础 URL，用于本地开发
const DEFAULT_BASE_URL = 'http://localhost:3001'
// 从 Vite 环境变量中读取 API 基础 URL，如果没有设置，则使用默认值
const BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL

// --- 2. 类型定义 ---

// 扩展 AxiosError 类型，增加两个自定义的布尔标志，便于错误处理
type ApiClientError = AxiosError & {
  isNetworkError?: boolean // 标记是否为网络错误
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

// --- 4. 响应拦截器 ---
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
    return Promise.reject(normalizeAxiosError(error))
  }
)

/**
 * 规范化 axios 错误对象，为其添加额外的辅助标志。
 * @param error - 原始的 AxiosError
 * @returns 增强后的 ApiClientError
 */
function normalizeAxiosError(error: AxiosError): ApiClientError {
  const normalized: ApiClientError = error
  // 如果没有 response 或者错误码是 ERR_NETWORK，则认为是网络错误
  normalized.isNetworkError = !error.response || error.code === AxiosError.ERR_NETWORK
  return normalized
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
