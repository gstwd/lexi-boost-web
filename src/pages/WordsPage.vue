<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Words Library</h1>
        <p class="text-gray-600">Manage and explore your vocabulary collection</p>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex">
          <div class="text-red-400 mr-3">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-medium text-red-800">Error loading words</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
            <div class="mt-4">
              <button
                @click="refreshWords"
                class="bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium py-2 px-4 rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="flex justify-between items-center mb-6">
          <div class="text-sm text-gray-600">
            Showing {{ words.length }} of {{ pagination.total }} words
          </div>
          <button
            @click="refreshWords"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Refresh
          </button>
        </div>

        <div v-if="words.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No words found</h3>
          <p class="text-gray-600">Start building your vocabulary by adding some words.</p>
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="word in words"
            :key="word.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-lg font-semibold text-gray-900">{{ word.word }}</h3>
              <span
                :class="difficultyBadgeClass(word.difficulty)"
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ word.difficulty }}
              </span>
            </div>

            <p class="text-gray-600 mb-3">{{ word.meaning }}</p>

            <div v-if="word.pronunciation" class="text-sm text-gray-500 mb-3">
              <span class="font-medium">Pronunciation:</span> {{ word.pronunciation }}
            </div>

            <div v-if="word.tags && word.tags.length > 0" class="flex flex-wrap gap-1">
              <span
                v-for="tag in word.tags"
                :key="tag"
                class="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded-md"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <nav class="flex items-center space-x-2">
            <button
              @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span class="px-3 py-2 text-sm text-gray-700">
              Page {{ pagination.page }} of {{ totalPages }}
            </span>

            <button
              @click="goToPage(pagination.page + 1)"
              :disabled="pagination.page >= totalPages"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useWordsStore } from '@/store'

const wordsStore = useWordsStore()

const { words, loading, error, pagination } = wordsStore
const totalPages = computed(() => wordsStore.totalPages)

const difficultyBadgeClass = (difficulty: string) => {
  const classes = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  }
  return classes[difficulty as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const refreshWords = () => {
  wordsStore.fetchWords(pagination.page, pagination.limit)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    wordsStore.fetchWords(page, pagination.limit)
  }
}

onMounted(() => {
  refreshWords()
})
</script>