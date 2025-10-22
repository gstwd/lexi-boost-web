import { request } from './client'
import type { WordEntry, UserWordRecord, WordRecordFilters, PaginatedResponse, DuplicationAnalysis } from '@/types'

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
    return request.get(`/api/words`, {
      params: { page, limit }
    })
  },

  async getWordById(id: number): Promise<Word> {
    return request.get(`/api/words/${id}`)
  },

  async createWord(word: Omit<Word, 'id'>): Promise<Word> {
    return request.post('/api/words', word)
  },

  async updateWord(id: number, word: Partial<Word>): Promise<Word> {
    return request.put(`/api/words/${id}`, word)
  },

  async deleteWord(id: number): Promise<void> {
    return request.delete(`/api/words/${id}`)
  },

  // 词条查询和管理
  async searchWordEntries(query: string, page = 1, limit = 20): Promise<PaginatedResponse<WordEntry>> {
    return request.get('/api/word-entries/search', {
      params: { query, page, limit }
    })
  },

  async getWordEntry(word: string): Promise<WordEntry> {
    return request.get(`/api/word-entries/${encodeURIComponent(word)}`)
  },

  async getWordEntryById(id: number): Promise<WordEntry> {
    return request.get(`/api/word-entries/${id}`)
  },

  // 用户单词记录
  async createWordRecord(record: Omit<UserWordRecord, 'id' | 'createTime' | 'updateTime'>): Promise<UserWordRecord> {
    return request.post('/api/word-records', record)
  },

  async getWordRecords(filters?: WordRecordFilters, page = 1, limit = 20): Promise<PaginatedResponse<UserWordRecord>> {
    return request.get('/api/word-records', {
      params: { ...filters, page, limit }
    })
  },

  async getWordRecord(id: number): Promise<UserWordRecord> {
    return request.get(`/api/word-records/${id}`)
  },

  async updateWordRecord(id: number, updates: Partial<UserWordRecord>): Promise<UserWordRecord> {
    return request.put(`/api/word-records/${id}`, updates)
  },

  async deleteWordRecord(id: number): Promise<void> {
    return request.delete(`/api/word-records/${id}`)
  },

  // 重复录入分析
  async checkDuplication(word: string, meaning: string, context: string): Promise<DuplicationAnalysis> {
    return request.post('/api/word-records/check-duplication', {
      word,
      meaning,
      context
    })
  },

  async getDuplicationAnalysis(wordEntryId: number): Promise<DuplicationAnalysis> {
    return request.get(`/api/word-records/duplication/${wordEntryId}`)
  },

  // 批量操作
  async bulkCreateWordRecords(
    records: Omit<UserWordRecord, 'id' | 'createTime' | 'updateTime'>[]
  ): Promise<UserWordRecord[]> {
    return request.post('/api/word-records/bulk', { records })
  },

  async exportWordRecords(filters?: WordRecordFilters): Promise<{ downloadUrl: string }> {
    return request.post('/api/word-records/export', filters)
  },

  // 统计信息
  async getWordRecordStats(filters?: WordRecordFilters): Promise<{
    totalRecords: number
    uniqueWords: number
    averageConfidence: number
    sourceTypeDistribution: Record<string, number>
    locationDistribution: Record<string, number>
  }> {
    return request.get('/api/word-records/stats', { params: filters })
  }
}
