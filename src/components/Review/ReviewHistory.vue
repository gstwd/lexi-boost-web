<template>
  <div class="review-history bg-white rounded-lg shadow-lg p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">复习历史</h2>
      <p class="text-gray-600">查看你的复习记录和学习进度</p>
    </div>

    <!-- 筛选和搜索 -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="flex-1">
        <input
          v-model="filters.search"
          type="text"
          placeholder="搜索单词或会话..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          @input="debouncedSearch"
        />
      </div>

      <div class="flex gap-2">
        <select
          v-model="filters.period"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          @change="applyFilters"
        >
          <option value="week">近一周</option>
          <option value="month">近一月</option>
          <option value="quarter">近三月</option>
          <option value="year">近一年</option>
          <option value="all">全部</option>
        </select>

        <select
          v-model="filters.type"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          @change="applyFilters"
        >
          <option value="all">所有类型</option>
          <option value="recognition">单词识别</option>
          <option value="recall">单词回忆</option>
          <option value="context">语境理解</option>
          <option value="production">单词造句</option>
        </select>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="grid md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-blue-600">
          {{ totalSessions }}
        </div>
        <div class="text-sm text-blue-700">总会话数</div>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-green-600">
          {{ totalQuestions }}
        </div>
        <div class="text-sm text-green-700">总题目数</div>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-purple-600">{{ averageAccuracy.toFixed(1) }}%</div>
        <div class="text-sm text-purple-700">平均正确率</div>
      </div>
      <div class="bg-orange-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-orange-600">
          {{ formatDuration(totalStudyTime) }}
        </div>
        <div class="text-sm text-orange-700">总学习时间</div>
      </div>
    </div>

    <!-- 学习趋势图表占位 -->
    <div class="mb-6">
      <h3 class="font-medium text-gray-800 mb-4">学习趋势</h3>
      <div class="bg-gray-100 rounded-lg p-6 h-64 flex items-center justify-center">
        <div class="text-center text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <div class="font-medium">学习趋势图表</div>
          <div class="text-sm">(图表功能开发中)</div>
        </div>
      </div>
    </div>

    <!-- 会话历史列表 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium text-gray-800">复习会话</h3>
        <div class="flex items-center space-x-2">
          <button
            class="px-3 py-1 text-sm rounded"
            :class="{
              'bg-blue-100 text-blue-800': viewMode === 'list',
              'text-gray-600 hover:text-gray-800': viewMode !== 'list'
            }"
            @click="viewMode = 'list'"
          >
            列表
          </button>
          <button
            class="px-3 py-1 text-sm rounded"
            :class="{
              'bg-blue-100 text-blue-800': viewMode === 'cards',
              'text-gray-600 hover:text-gray-800': viewMode !== 'cards'
            }"
            @click="viewMode = 'cards'"
          >
            卡片
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-gray-600">加载复习历史...</p>
      </div>

      <div v-else-if="sessions.length === 0" class="text-center py-8">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p class="text-gray-500">还没有复习记录</p>
        <p class="text-sm text-gray-400 mt-1">开始你的第一次复习吧！</p>
      </div>

      <!-- 列表视图 -->
      <div v-else-if="viewMode === 'list'" class="space-y-3">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          @click="viewSessionDetail(session)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-4">
                <span class="font-medium text-gray-800">{{ getSessionTypeLabel(session.type) }}</span>
                <span class="px-2 py-1 text-xs rounded-full" :class="getSessionStatusClass(session.status)">
                  {{ getSessionStatusLabel(session.status) }}
                </span>
              </div>
              <div class="text-sm text-gray-600 mt-1">
                {{ formatDate(session.startedAt) }}
                <span v-if="session.completedAt">· 耗时 {{ formatDuration(session.duration) }}</span>
              </div>
            </div>
            <div class="text-right">
              <div class="font-medium text-gray-800">{{ session.correctAnswers }} / {{ session.totalQuestions }}</div>
              <div class="text-sm text-gray-600">
                {{ ((session.correctAnswers / session.totalQuestions) * 100).toFixed(1) }}% 正确率
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 卡片视图 -->
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          @click="viewSessionDetail(session)"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="font-medium text-gray-800">{{ getSessionTypeLabel(session.type) }}</span>
            <span class="px-2 py-1 text-xs rounded-full" :class="getSessionStatusClass(session.status)">
              {{ getSessionStatusLabel(session.status) }}
            </span>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">题目数量:</span>
              <span class="font-medium">{{ session.totalQuestions }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">正确率:</span>
              <span class="font-medium">
                {{ ((session.correctAnswers / session.totalQuestions) * 100).toFixed(1) }}%
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">用时:</span>
              <span class="font-medium">{{ formatDuration(session.duration) }}</span>
            </div>
          </div>

          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full"
              :style="{ width: `${(session.correctAnswers / session.totalQuestions) * 100}%` }"
            />
          </div>

          <div class="text-xs text-gray-500 mt-2">
            {{ formatDate(session.startedAt) }}
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
        <div class="text-sm text-gray-600">
          显示 {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, totalSessions) }} / 共
          {{ totalSessions }} 条
        </div>
        <div class="flex items-center space-x-2">
          <button
            :disabled="currentPage === 1"
            class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>

          <div class="flex items-center space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              class="px-3 py-1 border rounded hover:bg-gray-50"
              :class="{
                'bg-blue-100 text-blue-800 border-blue-300': page === currentPage,
                'bg-white text-gray-700 border-gray-300': page !== currentPage
              }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 会话详情模态框 -->
    <div v-if="selectedSession" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">会话详情</h3>
          <button class="text-gray-400 hover:text-gray-600 text-2xl" @click="selectedSession = null">×</button>
        </div>

        <div class="p-6">
          <session-detail :session="selectedSession" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useReviewsStore } from '@/store'
import type { ReviewSession, ReviewSessionFilters } from '@/types'
import SessionDetail from './SessionDetail.vue'

// Store
const reviewsStore = useReviewsStore()

// 状态
const loading = ref(false)
const viewMode = ref<'list' | 'cards'>('list')
const selectedSession = ref<ReviewSession | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

// 筛选器
const filters = reactive<ReviewSessionFilters>({
  search: '',
  period: 'month',
  type: 'all',
  status: 'all'
})

// 搜索防抖
let searchTimeout: number | null = null

// Computed
const sessions = computed(() => reviewsStore.sessions || [])
const totalSessions = computed(() => reviewsStore.sessions?.length || 0)
const totalPages = computed(() => Math.ceil(totalSessions.value / pageSize.value))

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []

  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)

  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(total, start + 4)
    } else {
      start = Math.max(1, end - 4)
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const totalQuestions = computed(() => {
  return sessions.value.reduce((sum: number, session: any) => sum + session.totalQuestions, 0)
})

const averageAccuracy = computed(() => {
  if (sessions.value.length === 0) return 0
  const totalCorrect = sessions.value.reduce((sum: number, session: any) => sum + session.correctAnswers, 0)
  return (totalCorrect / totalQuestions.value) * 100
})

const totalStudyTime = computed(() => {
  return sessions.value.reduce((sum: number, session: any) => sum + (session.duration || 0), 0)
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

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const applyFilters = async () => {
  loading.value = true
  currentPage.value = 1

  try {
    await reviewsStore.fetchSessionHistory(filters, currentPage.value, pageSize.value)
  } catch (error) {
    console.error('Apply filters failed:', error)
  } finally {
    loading.value = false
  }
}

const changePage = async (page: number) => {
  if (page < 1 || page > totalPages.value) return

  currentPage.value = page
  loading.value = true

  try {
    await reviewsStore.fetchSessionHistory(filters, currentPage.value, pageSize.value)
  } catch (error) {
    console.error('Change page failed:', error)
  } finally {
    loading.value = false
  }
}

const viewSessionDetail = (session: ReviewSession) => {
  selectedSession.value = session
}

// 初始化
onMounted(() => {
  applyFilters()
})
</script>
