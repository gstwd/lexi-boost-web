<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Study Session</h1>
        <p class="text-gray-600">Practice and improve your vocabulary</p>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div class="text-center">
          <div class="text-red-400 mb-4">
            <svg class="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-red-800 mb-2">Unable to load study content</h3>
          <p class="text-red-700 mb-4">{{ error }}</p>
          <button
            @click="loadStudyWords"
            class="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>

      <div v-else-if="studyWords.length === 0" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 class="text-xl font-medium text-gray-900 mb-2">No words available for study</h3>
        <p class="text-gray-600 mb-6">Add some words to your vocabulary first.</p>
        <router-link
          to="/words"
          class="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Go to Words
        </router-link>
      </div>

      <div v-else-if="!studyStarted" class="text-center">
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div class="text-indigo-500 mb-4">
            <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Ready to Study?</h2>
          <p class="text-gray-600 mb-6">
            We have {{ studyWords.length }} words ready for your study session.
          </p>
          <button
            @click="startStudy"
            class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Start Study Session
          </button>
        </div>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-lg p-8">
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm font-medium text-gray-500">
              Progress: {{ currentIndex + 1 }} / {{ studyWords.length }}
            </span>
            <span
              :class="difficultyBadgeClass(currentWord.difficulty)"
              class="px-3 py-1 text-sm font-medium rounded-full"
            >
              {{ currentWord.difficulty }}
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${((currentIndex + 1) / studyWords.length) * 100}%` }"
            ></div>
          </div>
        </div>

        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">{{ currentWord.word }}</h2>
          <div v-if="currentWord.pronunciation" class="text-lg text-gray-500 mb-4">
            [{{ currentWord.pronunciation }}]
          </div>

          <div v-if="!showMeaning" class="mb-6">
            <button
              @click="revealMeaning"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Show Meaning
            </button>
          </div>

          <div v-else class="mb-6">
            <p class="text-xl text-gray-700 mb-4">{{ currentWord.meaning }}</p>
            <div v-if="currentWord.tags && currentWord.tags.length > 0" class="flex justify-center flex-wrap gap-2 mb-6">
              <span
                v-for="tag in currentWord.tags"
                :key="tag"
                class="bg-indigo-100 text-indigo-700 px-3 py-1 text-sm rounded-full"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="showMeaning" class="flex justify-center space-x-4">
          <button
            @click="nextWord"
            class="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {{ currentIndex + 1 >= studyWords.length ? 'Finish' : 'Next Word' }}
          </button>
        </div>
      </div>

      <div v-if="studyCompleted" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
          <div class="text-center">
            <div class="text-green-500 mb-4">
              <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Study Session Complete!</h3>
            <p class="text-gray-600 mb-6">
              Congratulations! You've studied {{ studyWords.length }} words.
            </p>
            <div class="space-y-3">
              <button
                @click="restartStudy"
                class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Study Again
              </button>
              <button
                @click="goToWords"
                class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Back to Words
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWordsStore } from '@/store'
import type { Word } from '@/api'

const router = useRouter()
const wordsStore = useWordsStore()

const { words, loading, error } = wordsStore

const studyWords = ref<Word[]>([])
const studyStarted = ref(false)
const currentIndex = ref(0)
const showMeaning = ref(false)
const studyCompleted = ref(false)

const currentWord = computed(() => studyWords.value[currentIndex.value])

const difficultyBadgeClass = (difficulty: string) => {
  const classes = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  }
  return classes[difficulty as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const loadStudyWords = async () => {
  if (words.length === 0) {
    await wordsStore.fetchWords()
  }
  studyWords.value = [...words].sort(() => Math.random() - 0.5)
}

const startStudy = () => {
  studyStarted.value = true
  currentIndex.value = 0
  showMeaning.value = false
  studyCompleted.value = false
}

const revealMeaning = () => {
  showMeaning.value = true
}

const nextWord = () => {
  if (currentIndex.value + 1 >= studyWords.value.length) {
    studyCompleted.value = true
  } else {
    currentIndex.value++
    showMeaning.value = false
  }
}

const restartStudy = () => {
  studyCompleted.value = false
  loadStudyWords()
  startStudy()
}

const goToWords = () => {
  router.push('/words')
}

onMounted(() => {
  loadStudyWords()
})
</script>