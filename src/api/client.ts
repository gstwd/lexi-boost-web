import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error: AxiosError) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error: AxiosError) => {
    console.error('Response Error:', error.response?.status, error.message)

    if (error.response?.status === 401) {
      console.warn('Unauthorized access')
    } else if (error.response?.status && error.response?.status >= 500) {
      console.error('Server error')
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('Network error')
    }

    return Promise.reject(error)
  }
)

export default apiClient