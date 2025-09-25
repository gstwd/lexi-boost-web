import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wordsApi, type Word, type WordsResponse } from '@/api'

export const useWordsStore = defineStore('words', () => {
  const words = ref<Word[]>([])
  const currentWord = ref<Word | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0
  })

  const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))

  const fetchWords = async (page = 1, limit = 20) => {
    loading.value = true
    error.value = null

    try {
      const response: WordsResponse = await wordsApi.getWords(page, limit)
      words.value = response.words
      pagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch words'
      console.error('Error fetching words:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchWordById = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      currentWord.value = await wordsApi.getWordById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch word'
      console.error('Error fetching word:', err)
    } finally {
      loading.value = false
    }
  }

  const addWord = async (word: Omit<Word, 'id'>) => {
    loading.value = true
    error.value = null

    try {
      const newWord = await wordsApi.createWord(word)
      words.value.unshift(newWord)
      pagination.value.total += 1
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add word'
      console.error('Error adding word:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateWord = async (id: number, updates: Partial<Word>) => {
    loading.value = true
    error.value = null

    try {
      const updatedWord = await wordsApi.updateWord(id, updates)
      const index = words.value.findIndex(w => w.id === id)
      if (index !== -1) {
        words.value[index] = updatedWord
      }
      if (currentWord.value?.id === id) {
        currentWord.value = updatedWord
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update word'
      console.error('Error updating word:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteWord = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      await wordsApi.deleteWord(id)
      words.value = words.value.filter(w => w.id !== id)
      pagination.value.total -= 1
      if (currentWord.value?.id === id) {
        currentWord.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete word'
      console.error('Error deleting word:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const resetCurrentWord = () => {
    currentWord.value = null
  }

  return {
    words,
    currentWord,
    loading,
    error,
    pagination,
    totalPages,
    fetchWords,
    fetchWordById,
    addWord,
    updateWord,
    deleteWord,
    clearError,
    resetCurrentWord
  }
})