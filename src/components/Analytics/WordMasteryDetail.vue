<template>
  <div class="word-mastery-detail">
    <!-- 基本信息 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-xl font-bold text-gray-800">
            {{ word.word }}
          </h3>
          <p class="text-gray-600 mt-1">
            {{ word.meaning }}
          </p>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold" :style="{ color: getMasteryLevelColor(word.masteryLevel) }">
            {{ word.masteryLevel.toFixed(1) }}/5.0
          </div>
          <div class="text-sm text-gray-600">掌握度</div>
        </div>
      </div>

      <!-- 状态标签 -->
      <div class="flex items-center space-x-2 mb-4">
        <span class="px-3 py-1 text-sm rounded-full" :class="getMasteryLevelClass(word.masteryLevel)">
          {{ getMasteryLevelLabel(word.masteryLevel) }}
        </span>
        <span class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">难度 {{ word.difficulty }}/5</span>
        <span class="px-3 py-1 text-sm rounded-full" :class="getTrendClass(word.masteryTrend)">
          {{ formatTrend(word.masteryTrend) }}
        </span>
      </div>

      <!-- 掌握度进度条 -->
      <div class="mb-4">
        <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>掌握进度</span>
          <span>{{ ((word.masteryLevel / 5) * 100).toFixed(1) }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            class="h-3 rounded-full transition-all duration-500"
            :style="{
              width: `${(word.masteryLevel / 5) * 100}%`,
              backgroundColor: getMasteryLevelColor(word.masteryLevel)
            }"
          />
        </div>
      </div>
    </div>

    <!-- 核心统计 -->
    <div class="grid md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg text-center">
        <div class="text-2xl font-bold text-blue-600">
          {{ word.reviewCount }}
        </div>
        <div class="text-sm text-blue-700">复习次数</div>
      </div>
      <div class="bg-green-50 p-4 rounded-lg text-center">
        <div class="text-2xl font-bold text-green-600">{{ (word.accuracy * 100).toFixed(1) }}%</div>
        <div class="text-sm text-green-700">准确率</div>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg text-center">
        <div class="text-2xl font-bold text-purple-600">{{ word.averageResponseTime.toFixed(1) }}s</div>
        <div class="text-sm text-purple-700">平均用时</div>
      </div>
      <div class="bg-orange-50 p-4 rounded-lg text-center">
        <div class="text-2xl font-bold text-orange-600">{{ (word.retentionRate * 100).toFixed(1) }}%</div>
        <div class="text-sm text-orange-700">保持率</div>
      </div>
    </div>

    <!-- 学习表现分析 -->
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <!-- 优势领域 -->
      <div class="border rounded-lg p-4">
        <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          优势领域
        </h4>
        <div v-if="word.strengthAreas.length > 0" class="space-y-2">
          <div
            v-for="area in word.strengthAreas"
            :key="area"
            class="flex items-center justify-between p-2 bg-green-50 rounded"
          >
            <span class="text-green-800">{{ getQuestionTypeLabel(area) }}</span>
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div v-else class="text-gray-500 text-sm">暂无明显优势领域</div>
      </div>

      <!-- 薄弱环节 -->
      <div class="border rounded-lg p-4">
        <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          薄弱环节
        </h4>
        <div v-if="word.weaknessAreas.length > 0" class="space-y-2">
          <div
            v-for="area in word.weaknessAreas"
            :key="area"
            class="flex items-center justify-between p-2 bg-red-50 rounded"
          >
            <span class="text-red-800">{{ getQuestionTypeLabel(area) }}</span>
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <div v-else class="text-gray-500 text-sm">暂无明显薄弱环节</div>
      </div>
    </div>

    <!-- 错误模式分析 -->
    <div v-if="word.errorPatterns.length > 0" class="mb-6">
      <h4 class="font-semibold text-gray-800 mb-3">常见错误模式</h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="pattern in word.errorPatterns"
          :key="pattern"
          class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
        >
          {{ getErrorPatternLabel(pattern) }}
        </span>
      </div>
    </div>

    <!-- 复习计划 -->
    <div class="mb-6">
      <h4 class="font-semibold text-gray-800 mb-3">复习计划</h4>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <div class="text-sm text-blue-700 font-medium">下次复习</div>
            <div class="text-blue-800">
              {{ formatReviewDate(word.nextReviewDue) }}
            </div>
          </div>
          <div>
            <div class="text-sm text-blue-700 font-medium">建议间隔</div>
            <div class="text-blue-800">
              {{ getRecommendedInterval() }}
            </div>
          </div>
          <div>
            <div class="text-sm text-blue-700 font-medium">优先级</div>
            <div class="text-blue-800">
              {{ getReviewPriority() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习建议 -->
    <div class="mb-6">
      <h4 class="font-semibold text-gray-800 mb-3">个性化建议</h4>
      <div class="space-y-3">
        <div
          v-for="suggestion in generateSuggestions()"
          :key="suggestion.type"
          class="flex items-start space-x-3 p-3 rounded-lg"
          :class="getSuggestionClass(suggestion.type)"
        >
          <div class="flex-shrink-0 mt-0.5">
            <component :is="getSuggestionIcon(suggestion.type)" class="w-5 h-5" />
          </div>
          <div>
            <div class="font-medium" :class="getSuggestionTextClass(suggestion.type)">
              {{ suggestion.title }}
            </div>
            <div class="text-sm mt-1" :class="getSuggestionTextClass(suggestion.type)">
              {{ suggestion.description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习历史图表占位 -->
    <div class="mb-6">
      <h4 class="font-semibold text-gray-800 mb-3">学习历史</h4>
      <div class="bg-gray-100 rounded-lg p-6 h-48 flex items-center justify-center">
        <div class="text-center text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <div class="text-sm font-medium">掌握度变化趋势</div>
          <div class="text-xs">(图表功能开发中)</div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex items-center justify-center space-x-4">
      <button
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        @click="startReview"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        立即复习
      </button>
      <button
        class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
        @click="addToFavorites"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        加入收藏
      </button>
      <button
        class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
        @click="adjustDifficulty"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
          />
        </svg>
        调整难度
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WordMasteryDetail } from '@/types'

interface Props {
  word: WordMasteryDetail
}

const props = defineProps<Props>()

// 题型标签映射
const questionTypeLabels = {
  recognition: '单词识别',
  recall: '单词回忆',
  context: '语境理解',
  production: '单词造句'
}

// 错误模式标签映射
const errorPatternLabels = {
  spelling: '拼写错误',
  pronunciation: '发音错误',
  meaning: '含义混淆',
  'similar words confusion': '相似词混淆',
  'context misunderstanding': '语境误解'
}

// 建议类型
interface Suggestion {
  type: 'strength' | 'improvement' | 'schedule' | 'difficulty'
  title: string
  description: string
}

// 方法
const getMasteryLevelLabel = (level: number): string => {
  if (level >= 4.0) return '已掌握'
  if (level >= 2.5) return '学习中'
  if (level >= 1.0) return '需加强'
  return '未复习'
}

const getMasteryLevelClass = (level: number): string => {
  if (level >= 4.0) return 'bg-green-100 text-green-800'
  if (level >= 2.5) return 'bg-blue-100 text-blue-800'
  if (level >= 1.0) return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

const getMasteryLevelColor = (level: number): string => {
  if (level >= 4.0) return '#10B981'
  if (level >= 2.5) return '#3B82F6'
  if (level >= 1.0) return '#EF4444'
  return '#6B7280'
}

const getTrendClass = (trend: string): string => {
  switch (trend) {
    case 'improving':
      return 'bg-green-100 text-green-800'
    case 'declining':
      return 'bg-red-100 text-red-800'
    case 'stable':
      return 'bg-blue-100 text-blue-800'
    case 'fluctuating':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatTrend = (trend: string): string => {
  switch (trend) {
    case 'improving':
      return '上升'
    case 'declining':
      return '下降'
    case 'stable':
      return '稳定'
    case 'fluctuating':
      return '波动'
    default:
      return '未知'
  }
}

const getQuestionTypeLabel = (type: string): string => {
  return questionTypeLabels[type as keyof typeof questionTypeLabels] || type
}

const getErrorPatternLabel = (pattern: string): string => {
  return errorPatternLabels[pattern as keyof typeof errorPatternLabels] || pattern
}

const formatReviewDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return '立即复习'
  if (diffInHours < 24) return `${diffInHours}小时后`
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}天后`
  return date.toLocaleDateString('zh-CN')
}

const getRecommendedInterval = (): string => {
  if (props.word.masteryLevel >= 4.0) return '7天'
  if (props.word.masteryLevel >= 2.5) return '3天'
  if (props.word.masteryLevel >= 1.0) return '1天'
  return '立即'
}

const getReviewPriority = (): string => {
  if (props.word.masteryLevel < 1.0) return '高'
  if (props.word.masteryLevel < 2.5) return '中'
  if (props.word.masteryLevel < 4.0) return '中'
  return '低'
}

const generateSuggestions = (): Suggestion[] => {
  const suggestions: Suggestion[] = []

  // 基于掌握度的建议
  if (props.word.masteryLevel < 2.0) {
    suggestions.push({
      type: 'improvement',
      title: '加强基础练习',
      description: '该词掌握度较低，建议增加基础识别和回忆练习，每天复习2-3次。'
    })
  } else if (props.word.masteryLevel >= 4.0) {
    suggestions.push({
      type: 'strength',
      title: '保持优势',
      description: '你已经很好地掌握了这个单词，继续保持定期复习即可。'
    })
  }

  // 基于准确率的建议
  if (props.word.accuracy < 0.7) {
    suggestions.push({
      type: 'improvement',
      title: '提高准确率',
      description: '准确率偏低，建议重点练习薄弱的题型，加强记忆连接。'
    })
  }

  // 基于响应时间的建议
  if (props.word.averageResponseTime > 6.0) {
    suggestions.push({
      type: 'improvement',
      title: '提升反应速度',
      description: '答题时间较长，说明还不够熟练，建议增加快速识别练习。'
    })
  }

  // 基于复习计划的建议
  const nextReview = new Date(props.word.nextReviewDue)
  const now = new Date()
  if (nextReview.getTime() < now.getTime()) {
    suggestions.push({
      type: 'schedule',
      title: '需要复习',
      description: '已到复习时间，建议立即开始复习以巩固记忆。'
    })
  }

  // 基于错误模式的建议
  if (props.word.errorPatterns.includes('spelling')) {
    suggestions.push({
      type: 'improvement',
      title: '加强拼写练习',
      description: '经常出现拼写错误，建议进行拼写专项训练。'
    })
  }

  return suggestions.length > 0
    ? suggestions
    : [
        {
          type: 'strength',
          title: '学习状态良好',
          description: '目前的学习进度和表现都很不错，继续保持就好。'
        }
      ]
}

const getSuggestionClass = (type: string): string => {
  switch (type) {
    case 'strength':
      return 'bg-green-50 border border-green-200'
    case 'improvement':
      return 'bg-orange-50 border border-orange-200'
    case 'schedule':
      return 'bg-blue-50 border border-blue-200'
    case 'difficulty':
      return 'bg-purple-50 border border-purple-200'
    default:
      return 'bg-gray-50 border border-gray-200'
  }
}

const getSuggestionTextClass = (type: string): string => {
  switch (type) {
    case 'strength':
      return 'text-green-800'
    case 'improvement':
      return 'text-orange-800'
    case 'schedule':
      return 'text-blue-800'
    case 'difficulty':
      return 'text-purple-800'
    default:
      return 'text-gray-800'
  }
}

const getSuggestionIcon = (type: string) => {
  // 返回对应的SVG图标组件名称
  return 'svg'
}

const startReview = () => {
  console.log('Start review for word:', props.word.word)
  // 实现开始复习逻辑
}

const addToFavorites = () => {
  console.log('Add to favorites:', props.word.word)
  // 实现收藏功能
}

const adjustDifficulty = () => {
  console.log('Adjust difficulty for word:', props.word.word)
  // 实现难度调整功能
}
</script>
