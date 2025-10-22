import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wordsApi } from '@/api'
import type { UserWordRecord, WordEntry, WordRecordFilters, DuplicationAnalysis } from '@/types'

export const useWordsStore = defineStore('words', () => {
  // 原有状态
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 新增状态
  const wordRecords = ref<UserWordRecord[]>([])
  const currentWordRecord = ref<UserWordRecord | null>(null)
  const wordEntries = ref<WordEntry[]>([])
  const searchResults = ref<WordEntry[]>([])
  const duplicationAnalysis = ref<DuplicationAnalysis | null>(null)
  const recordFilters = ref<WordRecordFilters>({})
  const recordPagination = ref({
    page: 1,
    limit: 20,
    total: 0
  })

  // Computed
  const totalRecordPages = computed(() => Math.ceil(recordPagination.value.total / recordPagination.value.limit))

  const uniqueWordsCount = computed(() => {
    const uniqueWords = new Set(wordRecords.value.map(record => record.wordEntryId))
    return uniqueWords.size
  })

  // 新增方法 - 词条管理
  const searchWordEntries = async (query: string, page = 1, limit = 20) => {
    loading.value = true
    error.value = null

    try {
      const response = await wordsApi.searchWordEntries(query, page, limit)
      searchResults.value = response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search word entries'
      console.error('Error searching word entries:', err)
    } finally {
      loading.value = false
    }
  }

  const getWordEntry = async (word: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await wordsApi.getWordEntry(word)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get word entry'
      console.error('Error getting word entry:', err)
    } finally {
      loading.value = false
    }
    return null
  }

  // 用户单词记录管理
  const createWordRecord = async (record: Omit<UserWordRecord, 'id' | 'createTime' | 'updateTime'>) => {
    loading.value = true
    error.value = null

    try {
      const response = await wordsApi.createWordRecord(record)
      wordRecords.value.unshift(response)
      recordPagination.value.total += 1
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create word record'
      console.error('Error creating word record:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchWordRecords = async (filters: WordRecordFilters = {}, page = 1, limit = 20) => {
    loading.value = true
    error.value = null

    try {
      const response = await wordsApi.getWordRecords(filters, page, limit)
      wordRecords.value = response.items
      recordPagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch word records'
      console.error('Error fetching word records:', err)
    } finally {
      loading.value = false
    }
  }

  const getWordRecord = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await wordsApi.getWordRecord(id)
      currentWordRecord.value = response
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get word record'
      console.error('Error getting word record:', err)
    } finally {
      loading.value = false
    }
    return null
  }

  const updateWordRecord = async (id: number, updates: Partial<UserWordRecord>) => {
    loading.value = true
    error.value = null

    try {
      const response = await wordsApi.updateWordRecord(id, updates)
      const index = wordRecords.value.findIndex(r => r.id === id)
      if (index !== -1) {
        wordRecords.value[index] = response
      }
      if (currentWordRecord.value?.id === id) {
        currentWordRecord.value = response
      }
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update word record'
      console.error('Error updating word record:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteWordRecord = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      await wordsApi.deleteWordRecord(id)
      wordRecords.value = wordRecords.value.filter(r => r.id !== id)
      recordPagination.value.total -= 1
      if (currentWordRecord.value?.id === id) {
        currentWordRecord.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete word record'
      console.error('Error deleting word record:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 重复检测
  const checkDuplication = async (word: string, meaning: string, context: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await wordsApi.checkDuplication(word, meaning, context)
      duplicationAnalysis.value = response
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to check duplication'
      console.error('Error checking duplication:', err)
    } finally {
      loading.value = false
    }
    return null
  }

  const getDuplicationAnalysis = async (wordEntryId: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await wordsApi.getDuplicationAnalysis(wordEntryId)
      duplicationAnalysis.value = response
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get duplication analysis'
      console.error('Error getting duplication analysis:', err)
    } finally {
      loading.value = false
    }
    return null
  }

  // 工具方法
  const clearError = () => {
    error.value = null
  }

  const resetCurrentWordRecord = () => {
    currentWordRecord.value = null
  }

  const setRecordFilters = (filters: WordRecordFilters) => {
    recordFilters.value = filters
  }

  const clearFilters = () => {
    recordFilters.value = {}
  }

  return {
    // 原有状态和方法
    loading,
    error,
    clearError,

    // 新增状态和方法
    wordRecords,
    currentWordRecord,
    wordEntries,
    searchResults,
    duplicationAnalysis,
    recordFilters,
    recordPagination,
    totalRecordPages,
    uniqueWordsCount,

    // 词条管理
    searchWordEntries,
    getWordEntry,

    // 用户记录管理
    createWordRecord,
    fetchWordRecords,
    getWordRecord,
    updateWordRecord,
    deleteWordRecord,

    // 重复检测
    checkDuplication,
    getDuplicationAnalysis,

    // 工具方法
    resetCurrentWordRecord,
    setRecordFilters,
    clearFilters
  }
})
