<template>
  <div class="mastery-analysis bg-white rounded-lg shadow-lg p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">单词掌握度分析</h2>
      <p class="text-gray-600">深入分析每个单词的学习进度和掌握程度</p>
    </div>

    <!-- 筛选和搜索 -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="flex-1">
        <input
          v-model="filters.search"
          type="text"
          placeholder="搜索单词..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          @input="debouncedSearch"
        />
      </div>

      <div class="flex gap-2">
        <select
          v-model="filters.masteryLevel"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          @change="applyFilters"
        >
          <option value="all">所有掌握度</option>
          <option value="mastered">已掌握</option>
          <option value="learning">学习中</option>
          <option value="struggling">需加强</option>
          <option value="new">未复习</option>
        </select>

        <select
          v-model="filters.difficulty"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          @change="applyFilters"
        >
          <option value="all">所有难度</option>
          <option value="1">1 - 简单</option>
          <option value="2">2 - 较简单</option>
          <option value="3">3 - 中等</option>
          <option value="4">4 - 较难</option>
          <option value="5">5 - 困难</option>
        </select>

        <select
          v-model="sortBy"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          @change="applySorting"
        >
          <option value="masteryLevel">按掌握度</option>
          <option value="recentActivity">按最近活动</option>
          <option value="difficulty">按难度</option>
          <option value="errorRate">按错误率</option>
          <option value="alphabetical">按字母顺序</option>
        </select>
      </div>
    </div>

    <!-- 掌握度概览 -->
    <div class="grid md:grid-cols-4 gap-4 mb-6">
      <div class="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
        <div class="text-2xl font-bold text-green-600">
          {{ masteryStats.mastered }}
        </div>
        <div class="text-sm text-green-700">已掌握</div>
        <div class="text-xs text-green-600 mt-1">{{ getMasteryPercentage('mastered') }}%</div>
      </div>
      <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
        <div class="text-2xl font-bold text-blue-600">
          {{ masteryStats.learning }}
        </div>
        <div class="text-sm text-blue-700">学习中</div>
        <div class="text-xs text-blue-600 mt-1">{{ getMasteryPercentage('learning') }}%</div>
      </div>
      <div class="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
        <div class="text-2xl font-bold text-red-600">
          {{ masteryStats.struggling }}
        </div>
        <div class="text-sm text-red-700">需加强</div>
        <div class="text-xs text-red-600 mt-1">{{ getMasteryPercentage('struggling') }}%</div>
      </div>
      <div class="bg-gray-50 border border-gray-200 p-4 rounded-lg text-center">
        <div class="text-2xl font-bold text-gray-600">
          {{ masteryStats.new }}
        </div>
        <div class="text-sm text-gray-700">未复习</div>
        <div class="text-xs text-gray-600 mt-1">{{ getMasteryPercentage('new') }}%</div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">加载掌握度数据...</p>
    </div>

    <!-- 单词列表 -->
    <div v-else-if="filteredWords.length > 0" class="space-y-4">
      <div
        v-for="word in pageWords"
        :key="word.id"
        class="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="viewWordDetail(word)"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-4">
              <h3 class="text-lg font-semibold text-gray-800">
                {{ word.word }}
              </h3>
              <span class="px-2 py-1 text-xs rounded-full" :class="getMasteryLevelClass(word.masteryLevel)">
                {{ getMasteryLevelLabel(word.masteryLevel) }}
              </span>
              <span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">难度 {{ word.difficulty }}/5</span>
            </div>
            <p class="text-gray-600 mt-1">
              {{ word.meaning }}
            </p>
            <div class="flex items-center space-x-6 text-sm text-gray-500 mt-2">
              <span>复习 {{ word.reviewCount }} 次</span>
              <span>正确率 {{ (word.accuracy * 100).toFixed(1) }}%</span>
              <span>最近复习: {{ formatRelativeTime(word.lastReviewedAt) }}</span>
            </div>
          </div>

          <div class="text-right">
            <!-- 掌握度进度条 -->
            <div class="w-24 bg-gray-200 rounded-full h-2 mb-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :style="{
                  width: `${(word.masteryLevel / 5) * 100}%`,
                  backgroundColor: getMasteryLevelColor(word.masteryLevel)
                }"
              ></div>
            </div>
            <div class="text-sm text-gray-600">{{ word.masteryLevel.toFixed(1) }}/5.0</div>

            <!-- 趋势指示器 -->
            <div class="flex items-center justify-end mt-2">
              <svg
                v-if="word.masteryTrend === 'improving'"
                class="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <svg
                v-else-if="word.masteryTrend === 'declining'"
                class="w-4 h-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6"
                />
              </svg>
              <svg v-else class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
        <div class="text-sm text-gray-600">
          显示 {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, totalWords) }} / 共
          {{ totalWords }} 个单词
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

    <div v-else class="text-center py-12">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p class="text-gray-500">没有找到符合条件的单词</p>
    </div>

    <!-- 单词详情模态框 -->
    <div v-if="selectedWord" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">单词详细分析</h3>
          <button class="text-gray-400 hover:text-gray-600 text-2xl" @click="selectedWord = null">×</button>
        </div>

        <div class="p-6">
          <word-mastery-detail-component :word="selectedWord" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { WordMasteryDetail } from '@/types'
import WordMasteryDetailComponent from './WordMasteryDetail.vue'

// 状态
const loading = ref(false)
const selectedWord = ref<WordMasteryDetail | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const sortBy = ref('masteryLevel')

// 筛选器
const filters = reactive({
  search: '',
  masteryLevel: 'all',
  difficulty: 'all'
})

// 搜索防抖
let searchTimeout: NodeJS.Timeout | null = null

// 模拟数据
const words = ref<WordMasteryDetail[]>([
  {
    id: 1,
    wordEntryId: 101,
    word: 'elaborate',
    meaning: '详细阐述；精心制作的',
    difficulty: 4,
    masteryLevel: 3.8,
    masteryTrend: 'improving',
    accuracy: 0.82,
    reviewCount: 12,
    correctCount: 10,
    lastReviewedAt: '2024-01-15T10:30:00Z',
    averageResponseTime: 4.2,
    consistencyScore: 0.75,
    retentionRate: 0.88,
    forgettingRate: 0.12,
    nextReviewDue: '2024-01-18T10:30:00Z',
    strengthAreas: ['recognition', 'context'],
    weaknessAreas: ['production'],
    errorPatterns: ['spelling', 'pronunciation'],
    learningHistory: []
  },
  {
    id: 2,
    wordEntryId: 102,
    word: 'substantial',
    meaning: '大量的；实质的；重要的',
    difficulty: 3,
    masteryLevel: 4.2,
    masteryTrend: 'stable',
    accuracy: 0.91,
    reviewCount: 8,
    correctCount: 7,
    lastReviewedAt: '2024-01-14T15:20:00Z',
    averageResponseTime: 3.1,
    consistencyScore: 0.88,
    retentionRate: 0.94,
    forgettingRate: 0.06,
    nextReviewDue: '2024-01-20T15:20:00Z',
    strengthAreas: ['recognition', 'recall'],
    weaknessAreas: ['context'],
    errorPatterns: ['similar words confusion'],
    learningHistory: []
  },
  {
    id: 3,
    wordEntryId: 103,
    word: 'intricate',
    meaning: '复杂的；错综复杂的',
    difficulty: 5,
    masteryLevel: 2.1,
    masteryTrend: 'declining',
    accuracy: 0.58,
    reviewCount: 15,
    correctCount: 9,
    lastReviewedAt: '2024-01-13T09:45:00Z',
    averageResponseTime: 7.8,
    consistencyScore: 0.42,
    retentionRate: 0.61,
    forgettingRate: 0.39,
    nextReviewDue: '2024-01-16T09:45:00Z',
    strengthAreas: [],
    weaknessAreas: ['recall', 'production', 'context'],
    errorPatterns: ['meaning confusion', 'spelling'],
    learningHistory: []
  }
])

// Computed
const masteryStats = computed(() => {
  const stats = { mastered: 0, learning: 0, struggling: 0, new: 0 }
  words.value.forEach(word => {
    if (word.masteryLevel >= 4.0) stats.mastered++
    else if (word.masteryLevel >= 2.5) stats.learning++
    else if (word.masteryLevel >= 1.0) stats.struggling++
    else stats.new++
  })
  return stats
})

const totalWords = computed(() => words.value.length)

const filteredWords = computed(() => {
  let filtered = words.value

  // 搜索筛选
  if (filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(
      word => word.word.toLowerCase().includes(searchTerm) || word.meaning.toLowerCase().includes(searchTerm)
    )
  }

  // 掌握度筛选
  if (filters.masteryLevel !== 'all') {
    filtered = filtered.filter(word => {
      switch (filters.masteryLevel) {
        case 'mastered':
          return word.masteryLevel >= 4.0
        case 'learning':
          return word.masteryLevel >= 2.5 && word.masteryLevel < 4.0
        case 'struggling':
          return word.masteryLevel >= 1.0 && word.masteryLevel < 2.5
        case 'new':
          return word.masteryLevel < 1.0
        default:
          return true
      }
    })
  }

  // 难度筛选
  if (filters.difficulty !== 'all') {
    filtered = filtered.filter(word => word.difficulty === parseInt(filters.difficulty))
  }

  return filtered
})

const sortedWords = computed(() => {
  const sorted = [...filteredWords.value]

  switch (sortBy.value) {
    case 'masteryLevel':
      return sorted.sort((a, b) => b.masteryLevel - a.masteryLevel)
    case 'recentActivity':
      return sorted.sort((a, b) => new Date(b.lastReviewedAt).getTime() - new Date(a.lastReviewedAt).getTime())
    case 'difficulty':
      return sorted.sort((a, b) => b.difficulty - a.difficulty)
    case 'errorRate':
      return sorted.sort((a, b) => 1 - a.accuracy - (1 - b.accuracy))
    case 'alphabetical':
      return sorted.sort((a, b) => a.word.localeCompare(b.word))
    default:
      return sorted
  }
})

const totalPages = computed(() => Math.ceil(sortedWords.value.length / pageSize.value))

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

const pageWords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedWords.value.slice(start, end)
})

// 方法
const getMasteryPercentage = (type: keyof typeof masteryStats.value): string => {
  const total = totalWords.value || 1
  return ((masteryStats.value[type] / total) * 100).toFixed(1)
}

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

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return '刚刚'
  if (diffInHours < 24) return `${diffInHours}小时前`
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}天前`
  return date.toLocaleDateString('zh-CN')
}

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

const applyFilters = () => {
  currentPage.value = 1
}

const applySorting = () => {
  currentPage.value = 1
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const viewWordDetail = (word: WordMasteryDetail) => {
  selectedWord.value = word
}

const loadData = async () => {
  loading.value = true
  try {
    // 这里应该调用 analyticsStore.fetchMasteryProgress()
    // 现在使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (error) {
    console.error('Load mastery analysis failed:', error)
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  loadData()
})
</script>
