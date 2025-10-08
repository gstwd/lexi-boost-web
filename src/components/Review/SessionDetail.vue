<template>
  <div class="session-detail">
    <!-- 会话概览 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h4 class="text-lg font-semibold text-gray-800">
            {{ getSessionTypeLabel(session.type) }}
          </h4>
          <p class="text-sm text-gray-600">
            {{ formatDate(session.startedAt) }}
          </p>
        </div>
        <span class="px-3 py-1 text-sm rounded-full" :class="getSessionStatusClass(session.status)">
          {{ getSessionStatusLabel(session.status) }}
        </span>
      </div>

      <div class="grid md:grid-cols-4 gap-4 mb-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">
            {{ session.totalQuestions }}
          </div>
          <div class="text-sm text-blue-700">总题数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">
            {{ session.correctAnswers }}
          </div>
          <div class="text-sm text-green-700">答对</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">{{ accuracy.toFixed(1) }}%</div>
          <div class="text-sm text-purple-700">正确率</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">
            {{ formatDuration(session.duration) }}
          </div>
          <div class="text-sm text-orange-700">用时</div>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div
          class="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
          :style="{ width: `${accuracy}%` }"
        ></div>
      </div>
    </div>

    <!-- 题目类型分析 -->
    <div v-if="typeAnalysis.length > 0" class="mb-6">
      <h5 class="font-medium text-gray-800 mb-3">题目类型分析</h5>
      <div class="space-y-3">
        <div
          v-for="type in typeAnalysis"
          :key="type.type"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: type.color }"></div>
            <span class="font-medium">{{ getReviewTypeLabel(type.type) }}</span>
          </div>
          <div class="text-right">
            <div class="font-medium">{{ type.correct }} / {{ type.total }}</div>
            <div class="text-sm text-gray-600">{{ type.accuracy.toFixed(1) }}%</div>
          </div>
          <div class="w-24">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :style="{
                  width: `${type.accuracy}%`,
                  backgroundColor: type.color
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误单词分析 -->
    <div v-if="incorrectWords.length > 0" class="mb-6">
      <h5 class="font-medium text-gray-800 mb-3">错误单词</h5>
      <div class="space-y-2">
        <div
          v-for="word in incorrectWords"
          :key="word.wordId"
          class="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div class="flex-1">
            <div class="font-medium text-red-800">
              {{ word.word }}
            </div>
            <div class="text-sm text-red-600 mt-1">
              {{ word.meaning }}
            </div>
            <div class="text-xs text-red-500 mt-1">
              你的答案: {{ word.userAnswer }} | 正确答案: {{ word.correctAnswer }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-red-600">
              {{ getReviewTypeLabel(word.questionType) }}
            </div>
            <div class="text-xs text-red-500">用时 {{ word.timeSpent || 0 }}秒</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 时间分析 -->
    <div class="mb-6">
      <h5 class="font-medium text-gray-800 mb-3">时间分析</h5>
      <div class="grid md:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg text-center">
          <div class="text-lg font-bold text-blue-600">{{ averageTimePerQuestion.toFixed(1) }}秒</div>
          <div class="text-sm text-blue-700">平均答题时间</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg text-center">
          <div class="text-lg font-bold text-green-600">{{ fastestTime }}秒</div>
          <div class="text-sm text-green-700">最快答题</div>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg text-center">
          <div class="text-lg font-bold text-orange-600">{{ slowestTime }}秒</div>
          <div class="text-sm text-orange-700">最慢答题</div>
        </div>
      </div>
    </div>

    <!-- 学习建议 -->
    <div v-if="suggestions.length > 0" class="mb-6">
      <h5 class="font-medium text-gray-800 mb-3">学习建议</h5>
      <div class="space-y-2">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <svg
            class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="text-sm text-yellow-800">
            {{ suggestion }}
          </p>
        </div>
      </div>
    </div>

    <!-- 详细题目列表 -->
    <div v-if="showDetails">
      <div class="flex items-center justify-between mb-4">
        <h5 class="font-medium text-gray-800">详细题目</h5>
        <button class="text-blue-600 hover:text-blue-800 text-sm" @click="showDetails = false">收起详情</button>
      </div>

      <div class="space-y-3 max-h-80 overflow-y-auto">
        <div
          v-for="(question, index) in session.questions"
          :key="question.id"
          class="border rounded-lg p-4"
          :class="{
            'border-green-200 bg-green-50': question.isCorrect,
            'border-red-200 bg-red-50': !question.isCorrect
          }"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium">题目 {{ index + 1 }}</span>
            <div class="flex items-center space-x-2">
              <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                {{ getReviewTypeLabel(question.type) }}
              </span>
              <span
                class="text-xs px-2 py-1 rounded-full"
                :class="{
                  'bg-green-100 text-green-800': question.isCorrect,
                  'bg-red-100 text-red-800': !question.isCorrect
                }"
              >
                {{ question.isCorrect ? '正确' : '错误' }}
              </span>
            </div>
          </div>

          <div class="text-gray-700 mb-2">
            <strong>{{ question.word }}</strong>
          </div>

          <div class="text-sm text-gray-600 mb-2">
            用时: {{ question.timeSpent || 0 }}秒
            <span v-if="question.difficulty" class="ml-4">难度反馈: {{ question.difficulty }}/5</span>
          </div>

          <div v-if="!question.isCorrect" class="text-sm">
            <div class="text-red-600">你的答案: {{ question.userAnswer }}</div>
            <div class="text-green-600">正确答案: {{ question.correctAnswer }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center">
      <button class="text-blue-600 hover:text-blue-800 text-sm" @click="showDetails = true">查看详细题目</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ReviewSession } from '@/types'

interface Props {
  session: ReviewSession
}

const props = defineProps<Props>()

// 状态
const showDetails = ref(false)

// 复习类型标签
const reviewTypeLabels = {
  recognition: '单词识别',
  recall: '单词回忆',
  context: '语境理解',
  production: '单词造句'
}

// 题目类型颜色
const typeColors = {
  recognition: '#3B82F6',
  recall: '#10B981',
  context: '#8B5CF6',
  production: '#F59E0B'
}

// Computed
const accuracy = computed(() => {
  if (props.session.totalQuestions === 0) return 0
  return (props.session.correctAnswers / props.session.totalQuestions) * 100
})

const typeAnalysis = computed(() => {
  if (!props.session.questions) return []

  const analysis = new Map<string, { total: number; correct: number }>()

  props.session.questions.forEach(question => {
    const type = question.type
    if (!analysis.has(type)) {
      analysis.set(type, { total: 0, correct: 0 })
    }
    const data = analysis.get(type)!
    data.total++
    if (question.isCorrect) {
      data.correct++
    }
  })

  return Array.from(analysis.entries()).map(([type, data]) => ({
    type,
    total: data.total,
    correct: data.correct,
    accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
    color: typeColors[type as keyof typeof typeColors] || '#6B7280'
  }))
})

const incorrectWords = computed(() => {
  if (!props.session.questions) return []

  return props.session.questions
    .filter(q => !q.isCorrect)
    .map(q => ({
      wordId: q.wordId,
      word: q.word,
      meaning: q.meaning,
      questionType: q.type,
      userAnswer: q.userAnswer,
      correctAnswer: q.correctAnswer,
      timeSpent: q.timeSpent || 0
    }))
})

const averageTimePerQuestion = computed(() => {
  if (!props.session.questions || props.session.questions.length === 0) return 0
  const totalTime = props.session.questions.reduce((sum, q) => sum + (q.timeSpent || 0), 0)
  return totalTime / props.session.questions.length
})

const fastestTime = computed(() => {
  if (!props.session.questions || props.session.questions.length === 0) return 0
  return Math.min(...props.session.questions.map(q => q.timeSpent || 0))
})

const slowestTime = computed(() => {
  if (!props.session.questions || props.session.questions.length === 0) return 0
  return Math.max(...props.session.questions.map(q => q.timeSpent || 0))
})

const suggestions = computed(() => {
  const suggestions: string[] = []

  // 基于正确率的建议
  if (accuracy.value < 60) {
    suggestions.push('建议加强基础词汇复习，可以尝试降低难度设置。')
  } else if (accuracy.value > 90) {
    suggestions.push('表现优秀！可以尝试更高难度的复习内容。')
  }

  // 基于答题时间的建议
  if (averageTimePerQuestion.value > 15) {
    suggestions.push('答题时间偏长，建议加强单词熟练度练习。')
  }

  // 基于错误类型的建议
  const errorTypes = typeAnalysis.value.filter(t => t.accuracy < 70)
  if (errorTypes.length > 0) {
    const typeNames = errorTypes.map(t => getReviewTypeLabel(t.type)).join('、')
    suggestions.push(`在 ${typeNames} 方面表现不佳，建议针对性练习。`)
  }

  // 基于错误单词数量的建议
  if (incorrectWords.value.length > 5) {
    suggestions.push('错误单词较多，建议将这些单词加入重点复习列表。')
  }

  return suggestions
})

// 方法
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`
}

const getSessionTypeLabel = (type: string): string => {
  const labels = {
    quick: '快速复习',
    standard: '标准复习',
    intensive: '深度复习',
    adaptive: '自适应复习'
  }
  return labels[type as keyof typeof labels] || type
}

const getSessionStatusLabel = (status: string): string => {
  const labels = {
    active: '进行中',
    paused: '已暂停',
    completed: '已完成',
    abandoned: '已放弃'
  }
  return labels[status as keyof typeof labels] || status
}

const getSessionStatusClass = (status: string): string => {
  const classes = {
    active: 'bg-blue-100 text-blue-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    abandoned: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getReviewTypeLabel = (type: string): string => {
  return reviewTypeLabels[type as keyof typeof reviewTypeLabels] || type
}
</script>
