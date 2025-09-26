import apiClient from './client'
import type {
  WordEntry,
  UserWordRecord,
  WordRecordFilters,
  PaginatedResponse,
  ApiResponse,
  DuplicationAnalysis
} from '@/types'

export interface Word {
  id: number
  word: string
  meaning: string
  pronunciation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags?: string[]
}

export interface WordsResponse {
  words: Word[]
  total: number
  page: number
  limit: number
}

// 扩展的API接口
export const wordsApi = {
  // 原有的基础CRUD
  async getWords(page = 1, limit = 20): Promise<WordsResponse> {
    const response = await apiClient.get(`/api/words`, {
      params: { page, limit }
    })
    return response.data
  },

  async getWordById(id: number): Promise<Word> {
    const response = await apiClient.get(`/api/words/${id}`)
    return response.data
  },

  async createWord(word: Omit<Word, 'id'>): Promise<Word> {
    const response = await apiClient.post('/api/words', word)
    return response.data
  },

  async updateWord(id: number, word: Partial<Word>): Promise<Word> {
    const response = await apiClient.put(`/api/words/${id}`, word)
    return response.data
  },

  async deleteWord(id: number): Promise<void> {
    await apiClient.delete(`/api/words/${id}`)
  },

  // 词条查询和管理
  async searchWordEntries(query: string, page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<WordEntry>>> {
    const response = await apiClient.get('/api/word-entries/search', {
      params: { query, page, limit }
    })
    return response.data
  },

  async getWordEntry(word: string): Promise<ApiResponse<WordEntry>> {
    const response = await apiClient.get(`/api/word-entries/${encodeURIComponent(word)}`)
    return response.data
  },

  async getWordEntryById(id: number): Promise<ApiResponse<WordEntry>> {
    const response = await apiClient.get(`/api/word-entries/${id}`)
    return response.data
  },

  // 用户单词记录
  async createWordRecord(
    record: Omit<UserWordRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<UserWordRecord>> {
    const response = await apiClient.post('/api/word-records', record)
    return response.data
  },

  async getWordRecords(
    filters?: WordRecordFilters,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<PaginatedResponse<UserWordRecord>>> {
    const response = await apiClient.get('/api/word-records', {
      params: { ...filters, page, limit }
    })
    return response.data
  },

  async getWordRecord(id: number): Promise<ApiResponse<UserWordRecord>> {
    const response = await apiClient.get(`/api/word-records/${id}`)
    return response.data
  },

  async updateWordRecord(id: number, updates: Partial<UserWordRecord>): Promise<ApiResponse<UserWordRecord>> {
    const response = await apiClient.put(`/api/word-records/${id}`, updates)
    return response.data
  },

  async deleteWordRecord(id: number): Promise<ApiResponse<void>> {
    await apiClient.delete(`/api/word-records/${id}`)
    return { success: true, data: undefined, timestamp: new Date().toISOString() }
  },

  // 重复录入分析
  async checkDuplication(word: string, meaning: string, context: string): Promise<ApiResponse<DuplicationAnalysis>> {
    const response = await apiClient.post('/api/word-records/check-duplication', {
      word,
      meaning,
      context
    })
    return response.data
  },

  async getDuplicationAnalysis(wordEntryId: number): Promise<ApiResponse<DuplicationAnalysis>> {
    const response = await apiClient.get(`/api/word-records/duplication/${wordEntryId}`)
    return response.data
  },

  // 批量操作
  async bulkCreateWordRecords(
    records: Omit<UserWordRecord, 'id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<ApiResponse<UserWordRecord[]>> {
    const response = await apiClient.post('/api/word-records/bulk', { records })
    return response.data
  },

  async exportWordRecords(filters?: WordRecordFilters): Promise<ApiResponse<{ downloadUrl: string }>> {
    const response = await apiClient.post('/api/word-records/export', filters)
    return response.data
  },

  // 统计信息
  async getWordRecordStats(filters?: WordRecordFilters): Promise<
    ApiResponse<{
      totalRecords: number
      uniqueWords: number
      averageConfidence: number
      sourceTypeDistribution: Record<string, number>
      locationDistribution: Record<string, number>
    }>
  > {
    const response = await apiClient.get('/api/word-records/stats', { params: filters })
    return response.data
  }
}
