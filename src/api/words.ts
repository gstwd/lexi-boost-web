import apiClient from './client'

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

export const wordsApi = {
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
  }
}