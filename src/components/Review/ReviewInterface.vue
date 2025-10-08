<template>
  <div class="review-interface min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- 头部进度栏 -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold text-gray-800">单词复习</h1>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-600">
              {{ currentQuestionIndex + 1 }} / {{ currentSession?.totalQuestions || 0 }}
            </div>
            <button
              class="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
              :disabled="!currentSession"
              @click="pauseSession"
            >
              {{ sessionPaused ? '继续' : '暂停' }}
            </button>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${sessionProgress}%` }"
          ></div>
        </div>

        <!-- 会话信息 -->
        <div class="flex items-center justify-between mt-2 text-sm text-gray-600">
          <div>已用时间: {{ formatTime(sessionElapsedTime) }}</div>
          <div>正确率: {{ sessionAccuracy.toFixed(1) }}%</div>
          <div>剩余时间: {{ formatTime(estimatedRemainingTime) }}</div>
        </div>
      </div>

      <!-- 开始复习界面 -->
      <div
        v-if="!currentSession && !sessionPaused && !sessionCompleted"
        class="bg-white rounded-xl shadow-lg p-8 text-center"
      >
        <div class="mb-6">
          <svg class="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">开始单词复习</h2>
          <p class="text-gray-600">准备开始你的学习之旅</p>
        </div>

        <div class="space-y-4 max-w-md mx-auto">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-medium text-blue-800 mb-2">今日目标</h3>
            <div class="text-sm text-blue-700">
              • 复习 20 个单词
              <br />
              • 提高记忆效率
              <br />
              • 巩固已学知识
            </div>
          </div>

          <button
            class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            @click="startNewSession"
          >
            开始复习
          </button>
        </div>
      </div>

      <!-- 复习卡片区域 -->
      <div v-if="currentQuestion && !sessionPaused" class="bg-white rounded-xl shadow-lg p-8 mb-6">
        <!-- 复习类型显示 -->
        <div class="text-center mb-6">
          <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {{ getReviewTypeLabel(currentQuestion.type) }}
          </span>
        </div>

        <!-- 识别模式 -->
        <div v-if="currentQuestion.type === 'recognition'" class="text-center">
          <div class="mb-6">
            <h2 class="text-3xl font-bold text-gray-800 mb-2">
              {{ currentQuestion.word }}
            </h2>
            <div class="text-gray-500 mb-4">选择正确的含义</div>
          </div>

          <div class="space-y-3">
            <button
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              :disabled="answerSubmitted"
              class="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
              :class="{
                'bg-green-100 border-green-500': answerSubmitted && option.correct,
                'bg-red-100 border-red-500': answerSubmitted && selectedAnswerId === option.id && !option.correct,
                'border-gray-300': !answerSubmitted
              }"
              @click="submitAnswer(option.id)"
            >
              {{ option.text }}
            </button>
          </div>
        </div>

        <!-- 回忆模式 -->
        <div v-else-if="currentQuestion.type === 'recall'" class="text-center">
          <div class="mb-6">
            <div class="text-gray-600 mb-4">这个含义对应的单词是？</div>
            <p class="text-xl text-gray-800 mb-6">
              {{ currentQuestion.meaning }}
            </p>
          </div>

          <div class="max-w-md mx-auto">
            <input
              v-model="userAnswer"
              type="text"
              placeholder="输入单词..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center text-xl"
              :disabled="answerSubmitted"
              @keydown.enter="submitAnswer(userAnswer.trim())"
            />
            <button
              v-if="!answerSubmitted"
              class="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              :disabled="!userAnswer.trim()"
              @click="submitAnswer(userAnswer.trim())"
            >
              提交答案
            </button>
          </div>
        </div>

        <!-- 语境模式 -->
        <div v-else-if="currentQuestion.type === 'context'" class="text-center">
          <div class="mb-6">
            <div class="text-gray-600 mb-4">根据语境，选择单词的正确含义</div>
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
              <p class="text-gray-800 italic">"{{ currentQuestion.context }}"</p>
            </div>
            <h2 class="text-2xl font-bold text-blue-600">
              {{ currentQuestion.word }}
            </h2>
          </div>

          <div class="space-y-3">
            <button
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              :disabled="answerSubmitted"
              class="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
              :class="{
                'bg-green-100 border-green-500': answerSubmitted && option.correct,
                'bg-red-100 border-red-500': answerSubmitted && selectedAnswerId === option.id && !option.correct,
                'border-gray-300': !answerSubmitted
              }"
              @click="submitAnswer(option.id)"
            >
              {{ option.text }}
            </button>
          </div>
        </div>

        <!-- 造句模式 -->
        <div v-else-if="currentQuestion.type === 'production'" class="text-center">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
              {{ currentQuestion.word }}
            </h2>
            <div class="text-gray-600 mb-4">含义: {{ currentQuestion.meaning }}</div>
            <div class="text-gray-500">请用这个单词造一个句子</div>
          </div>

          <div class="max-w-2xl mx-auto">
            <textarea
              v-model="userAnswer"
              placeholder="在这里输入你的句子..."
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              :disabled="answerSubmitted"
            ></textarea>
            <button
              v-if="!answerSubmitted"
              class="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              :disabled="!userAnswer.trim()"
              @click="submitAnswer(userAnswer.trim())"
            >
              提交句子
            </button>
          </div>
        </div>

        <!-- 答案反馈 -->
        <div
          v-if="answerSubmitted"
          class="mt-8 p-4 rounded-lg"
          :class="{
            'bg-green-50 border border-green-200': isCorrect,
            'bg-red-50 border border-red-200': !isCorrect
          }"
        >
          <div class="flex items-center justify-center mb-4">
            <svg v-if="isCorrect" class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span
              class="ml-2 text-lg font-medium"
              :class="{
                'text-green-800': isCorrect,
                'text-red-800': !isCorrect
              }"
            >
              {{ isCorrect ? '回答正确！' : '回答错误' }}
            </span>
          </div>

          <div v-if="!isCorrect && currentQuestion.type !== 'production'" class="text-center text-gray-700 mb-4">
            <div class="font-medium">正确答案: {{ correctAnswer }}</div>
          </div>

          <!-- 详细解释 -->
          <div v-if="currentQuestion.explanation" class="text-center text-gray-600 mb-4">
            <div class="font-medium mb-2">解释：</div>
            <p>{{ currentQuestion.explanation }}</p>
          </div>

          <!-- 信心度调整 -->
          <div class="text-center">
            <div class="text-sm text-gray-600 mb-2">这道题的难度如何？</div>
            <div class="flex justify-center space-x-2">
              <button
                v-for="level in difficultyLevels"
                :key="level.value"
                class="px-3 py-1 text-xs rounded-full border transition-colors"
                :class="{
                  'bg-blue-100 text-blue-800 border-blue-300': questionDifficulty === level.value,
                  'bg-gray-100 text-gray-600 border-gray-300': questionDifficulty !== level.value
                }"
                @click="setQuestionDifficulty(level.value)"
              >
                {{ level.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 继续按钮 -->
        <div v-if="answerSubmitted" class="text-center mt-6">
          <button
            class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            @click="nextQuestion"
          >
            {{ currentQuestionIndex + 1 >= (currentSession?.totalQuestions || 0) ? '完成复习' : '下一题' }}
          </button>
        </div>
      </div>

      <!-- 暂停界面 -->
      <div v-if="sessionPaused" class="bg-white rounded-xl shadow-lg p-8 text-center">
        <div class="mb-6">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">复习已暂停</h2>
          <p class="text-gray-600">休息一下，准备好后继续复习</p>
        </div>

        <div class="space-y-4">
          <button
            class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            @click="resumeSession"
          >
            继续复习
          </button>
          <button
            class="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            @click="endSession"
          >
            结束本次复习
          </button>
        </div>
      </div>

      <!-- 会话完成界面 -->
      <div v-if="sessionCompleted" class="bg-white rounded-xl shadow-lg p-8 text-center">
        <div class="mb-6">
          <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">复习完成！</h2>
          <p class="text-gray-600">恭喜你完成了本次复习会话</p>
        </div>

        <!-- 会话统计 -->
        <div class="grid md:grid-cols-3 gap-4 mb-6">
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">
              {{ sessionStats.correctAnswers }}
            </div>
            <div class="text-sm text-blue-700">答对题数</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ sessionStats.accuracy.toFixed(1) }}%</div>
            <div class="text-sm text-green-700">正确率</div>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">
              {{ formatTime(sessionStats.totalTime) }}
            </div>
            <div class="text-sm text-purple-700">用时</div>
          </div>
        </div>

        <div class="space-y-4">
          <button
            class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            @click="viewDetailedResults"
          >
            查看详细结果
          </button>
          <button
            class="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            @click="startNewSession"
          >
            开始新的复习
          </button>
          <button class="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors" @click="$emit('close')">
            返回
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useReviewsStore } from '@/store'
import type { SimpleReviewSession, ReviewQuestion } from '@/types'

const emit = defineEmits<{
  close: []
}>()

// Store
const reviewsStore = useReviewsStore()

// 状态
const currentSession = ref<SimpleReviewSession | null>(null)
const currentQuestion = ref<ReviewQuestion | null>(null)
const currentQuestionIndex = ref(0)
const sessionPaused = ref(false)
const sessionCompleted = ref(false)
const answerSubmitted = ref(false)
const isCorrect = ref(false)
const correctAnswer = ref('')
const userAnswer = ref('')
const selectedAnswerId = ref<string | null>(null)
const questionDifficulty = ref<number | null>(null)
const sessionStartTime = ref<Date | null>(null)
const sessionElapsedTime = ref(0)

// 定时器
let elapsedTimeTimer: NodeJS.Timeout | null = null

// 复习类型标签
const reviewTypeLabels = {
  recognition: '单词识别',
  recall: '单词回忆',
  context: '语境理解',
  production: '单词造句'
}

// 难度级别
const difficultyLevels = [
  { value: 1, label: '很简单' },
  { value: 2, label: '简单' },
  { value: 3, label: '适中' },
  { value: 4, label: '困难' },
  { value: 5, label: '很困难' }
]

// Computed
const sessionProgress = computed(() => {
  if (!currentSession.value) return 0
  const answered = currentSession.value.answeredQuestions?.length || currentQuestionIndex.value
  const total = currentSession.value.totalQuestions || currentSession.value.reviews?.length || 1
  return (answered / total) * 100
})

const sessionAccuracy = computed(() => {
  if (!currentSession.value) return 0
  const answered = currentSession.value.answeredQuestions?.length || 0
  const correct = currentSession.value.correctAnswers || 0
  return answered > 0 ? (correct / answered) * 100 : 0
})

const estimatedRemainingTime = computed(() => {
  if (!currentSession.value || sessionElapsedTime.value === 0) return 0
  const averageTimePerQuestion = sessionElapsedTime.value / Math.max(currentQuestionIndex.value, 1)
  const remainingQuestions = currentSession.value.totalQuestions - currentQuestionIndex.value
  return Math.round(averageTimePerQuestion * remainingQuestions)
})

const sessionStats = computed(() => ({
  correctAnswers: currentSession.value?.correctAnswers || 0,
  totalQuestions: currentSession.value?.totalQuestions || 0,
  accuracy: sessionAccuracy.value,
  totalTime: sessionElapsedTime.value
}))

// 方法
const getReviewTypeLabel = (type: string) => {
  return reviewTypeLabels[type as keyof typeof reviewTypeLabels] || type
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const startElapsedTimeTimer = () => {
  if (elapsedTimeTimer) clearInterval(elapsedTimeTimer)

  elapsedTimeTimer = setInterval(() => {
    if (!sessionPaused.value && sessionStartTime.value) {
      sessionElapsedTime.value = Math.floor((Date.now() - sessionStartTime.value.getTime()) / 1000)
    }
  }, 1000)
}

const stopElapsedTimeTimer = () => {
  if (elapsedTimeTimer) {
    clearInterval(elapsedTimeTimer)
    elapsedTimeTimer = null
  }
}

const loadCurrentQuestion = () => {
  if (currentSession.value && currentSession.value.questions) {
    currentQuestion.value = currentSession.value.questions[currentQuestionIndex.value] || null

    // 重置答题状态
    answerSubmitted.value = false
    isCorrect.value = false
    correctAnswer.value = ''
    userAnswer.value = ''
    selectedAnswerId.value = null
    questionDifficulty.value = null
  }
}

const submitAnswer = async (answer: any) => {
  if (!currentQuestion.value || answerSubmitted.value) return

  answerSubmitted.value = true
  const startTime = Date.now()

  try {
    const response = await reviewsStore.submitReviewAnswer?.(
      currentQuestion.value.id,
      answer,
      Math.floor((Date.now() - startTime) / 1000)
    )

    if (response) {
      isCorrect.value = response.correct
      correctAnswer.value = response.correctAnswer || ''

      // 更新会话统计
      if (currentSession.value) {
        if (!currentSession.value.answeredQuestions) currentSession.value.answeredQuestions = []
        currentSession.value.answeredQuestions.push(currentQuestion.value)
        if (isCorrect.value) {
          currentSession.value.correctAnswers = (currentSession.value.correctAnswers || 0) + 1
        }
      }

      // 记录用户选择
      if (currentQuestion.value.type !== 'production' && currentQuestion.value.type !== 'recall') {
        selectedAnswerId.value = answer
      }
    }
  } catch (error) {
    console.error('Submit answer failed:', error)
  }
}

const setQuestionDifficulty = (difficulty: number) => {
  questionDifficulty.value = difficulty
}

const nextQuestion = async () => {
  if (!currentQuestion.value) return

  // 提交难度反馈
  if (questionDifficulty.value) {
    try {
      await reviewsStore.submitQuestionFeedback?.(currentQuestion.value.id, questionDifficulty.value)
    } catch (error) {
      console.error('Submit difficulty feedback failed:', error)
    }
  }

  // 检查是否完成所有题目
  if (currentQuestionIndex.value + 1 >= (currentSession.value?.totalQuestions || 0)) {
    await completeSession()
    return
  }

  // 下一题
  currentQuestionIndex.value += 1
  loadCurrentQuestion()
}

const pauseSession = () => {
  sessionPaused.value = true
  stopElapsedTimeTimer()
}

const resumeSession = () => {
  sessionPaused.value = false
  if (!sessionStartTime.value) {
    sessionStartTime.value = new Date(Date.now() - sessionElapsedTime.value * 1000)
  }
  startElapsedTimeTimer()
}

const endSession = async () => {
  if (currentSession.value) {
    try {
      await reviewsStore.endReviewSession?.(currentSession.value.sessionId)
      stopElapsedTimeTimer()
      emit('close')
    } catch (error) {
      console.error('End session failed:', error)
    }
  }
}

const completeSession = async () => {
  if (!currentSession.value) return

  try {
    await reviewsStore.completeReviewSession?.(currentSession.value.sessionId)
    stopElapsedTimeTimer()
    sessionCompleted.value = true
  } catch (error) {
    console.error('Complete session failed:', error)
  }
}

const viewDetailedResults = () => {
  if (currentSession.value) {
    // 跳转到详细结果页面或打开模态框
    console.log('View detailed results for session:', currentSession.value.sessionId)
  }
}

const startNewSession = async () => {
  try {
    // 重置状态
    currentQuestionIndex.value = 0
    sessionCompleted.value = false
    sessionElapsedTime.value = 0
    sessionStartTime.value = new Date()

    // 开始新会话 - Mock implementation
    const session = {
      sessionId: `session_${Date.now()}`,
      reviews: [],
      currentIndex: 0,
      startTime: Date.now(),
      status: 'active' as const,
      totalQuestions: 20,
      correctAnswers: 0,
      questions: []
    }
    if (session) {
      currentSession.value = session
      loadCurrentQuestion()
      startElapsedTimeTimer()
    }
  } catch (error) {
    console.error('Start new session failed:', error)
  }
}

// 初始化
onMounted(async () => {
  try {
    // 检查是否有正在进行的会话
    const session = reviewsStore.currentSession

    if (session && session.status === 'active') {
      // 恢复现有会话
      currentSession.value = session
      sessionStartTime.value = new Date(Date.now() - (session.elapsedTime || 0) * 1000)
      loadCurrentQuestion()
      startElapsedTimeTimer()
    }
    // 不自动开始新会话，让用户手动开始
  } catch (error) {
    console.error('Initialize review interface failed:', error)
  }
})

onUnmounted(() => {
  stopElapsedTimeTimer()
})

// 监听会话状态变化
watch(
  () => reviewsStore.currentSession,
  newSession => {
    if (newSession) {
      currentSession.value = newSession
    }
  },
  { deep: true }
)
</script>
