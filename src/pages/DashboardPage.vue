<template>
  <div class="dashboard-page min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">学习仪表板</h1>
        <p class="text-gray-600 mt-2">欢迎回来，继续你的词汇学习之旅！</p>
      </div>

      <!-- 快速统计卡片 -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">总录入单词</p>
              <p class="text-3xl font-bold text-blue-600">
                {{ stats?.totalWords || 0 }}
              </p>
              <p class="text-sm text-green-600 flex items-center mt-1">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                +{{ stats?.weeklyIncrease || 0 }} 本周
              </p>
            </div>
            <div class="bg-blue-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">已掌握单词</p>
              <p class="text-3xl font-bold text-green-600">
                {{ stats?.masteredWords || 0 }}
              </p>
              <p class="text-sm text-gray-600 mt-1">掌握率 {{ masteryRate }}%</p>
            </div>
            <div class="bg-green-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">学习天数</p>
              <p class="text-3xl font-bold text-purple-600">
                {{ stats?.studyDays || 0 }}
              </p>
              <p class="text-sm text-gray-600 mt-1">连续 {{ stats?.streakDays || 0 }} 天</p>
            </div>
            <div class="bg-purple-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">平均正确率</p>
              <p class="text-3xl font-bold text-orange-600">{{ accuracyPercentage }}%</p>
              <p class="text-sm text-gray-600 mt-1">最近复习表现</p>
            </div>
            <div class="bg-orange-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- 左侧区域 -->
        <div class="lg:col-span-2 space-y-8">
          <!-- 今日推荐 -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-800">今日推荐</h2>
              <router-link to="/recommendations" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                查看全部 →
              </router-link>
            </div>

            <div v-if="urgentReviews.length > 0" class="mb-6">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-center mb-3">
                  <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span class="font-medium text-red-800">紧急复习提醒</span>
                </div>
                <p class="text-red-700 text-sm mb-3">有 {{ urgentReviews.length }} 个单词需要立即复习，避免遗忘！</p>
                <button
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  @click="startUrgentReview"
                >
                  立即复习
                </button>
              </div>
            </div>

            <div v-if="dailyPlan" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 class="font-medium text-blue-800 mb-3">今日学习计划</h3>
              <div class="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div class="text-lg font-bold text-blue-600">
                    {{ dailyPlan.breakdown.reviews }}
                  </div>
                  <div class="text-xs text-blue-700">复习单词</div>
                </div>
                <div>
                  <div class="text-lg font-bold text-blue-600">
                    {{ dailyPlan.breakdown.newWords }}
                  </div>
                  <div class="text-xs text-blue-700">新增单词</div>
                </div>
                <div>
                  <div class="text-lg font-bold text-blue-600">
                    {{ dailyPlan.estimatedDuration }}
                  </div>
                  <div class="text-xs text-blue-700">预计分钟</div>
                </div>
              </div>
              <button
                class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                @click="startDailyPlan"
              >
                开始今日学习
              </button>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-6">快速操作</h2>
            <div class="grid md:grid-cols-2 gap-4">
              <router-link
                to="/input"
                class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div class="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <div class="font-medium text-gray-800">录入新单词</div>
                  <div class="text-sm text-gray-600">添加遇到的新单词</div>
                </div>
              </router-link>

              <router-link
                to="/review/session"
                class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div class="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <div class="font-medium text-gray-800">开始复习</div>
                  <div class="text-sm text-gray-600">智能复习已学单词</div>
                </div>
              </router-link>

              <router-link
                to="/analytics/dashboard"
                class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div class="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <div class="font-medium text-gray-800">学习统计</div>
                  <div class="text-sm text-gray-600">查看学习数据分析</div>
                </div>
              </router-link>

              <router-link
                to="/words"
                class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div class="bg-orange-100 p-3 rounded-full group-hover:bg-orange-200 transition-colors">
                  <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <div class="font-medium text-gray-800">单词库</div>
                  <div class="text-sm text-gray-600">管理和浏览单词</div>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- 右侧区域 -->
        <div class="space-y-8">
          <!-- 学习进度 -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="font-semibold text-gray-800 mb-4">本周进度</h3>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>新增单词</span>
                  <span>{{ weeklyGoal.words?.current || 0 }} / {{ weeklyGoal.words?.target || 50 }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${getProgressPercentage('words')}%` }"
                  />
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>复习次数</span>
                  <span>{{ weeklyGoal.reviews?.current || 0 }} / {{ weeklyGoal.reviews?.target || 30 }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-green-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${getProgressPercentage('reviews')}%` }"
                  />
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>学习时间</span>
                  <span>{{ weeklyGoal.time?.current || 0 }} / {{ weeklyGoal.time?.target || 300 }} 分钟</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${getProgressPercentage('time')}%` }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 最近学习的单词 -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-800">最近录入</h3>
              <router-link to="/words" class="text-blue-600 hover:text-blue-800 text-sm">查看全部 →</router-link>
            </div>
            <div v-if="recentWords.length > 0" class="space-y-3">
              <div
                v-for="word in recentWords.slice(0, 5)"
                :key="word.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex-1">
                  <div class="font-medium text-gray-800">
                    {{ word.word }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ word.meaning }}
                  </div>
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatRelativeTime(word.createdAt) }}
                </div>
              </div>
            </div>
            <div v-else class="text-center text-gray-500 py-8">
              <p>还没有录入任何单词</p>
              <router-link to="/input" class="text-blue-600 hover:text-blue-800 text-sm">
                开始录入第一个单词 →
              </router-link>
            </div>
          </div>

          <!-- 成就徽章 -->
          <div v-if="recentAchievements.length > 0" class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="font-semibold text-gray-800 mb-4">最新成就</h3>
            <div class="space-y-3">
              <div
                v-for="achievement in recentAchievements.slice(0, 3)"
                :key="achievement.id"
                class="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
              >
                <div class="text-2xl mr-3">
                  {{ achievement.icon }}
                </div>
                <div class="flex-1">
                  <div class="font-medium text-yellow-800 text-sm">
                    {{ achievement.title }}
                  </div>
                  <div class="text-xs text-yellow-600">
                    {{ achievement.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRecommendationsStore, useAnalyticsStore } from '@/store'
import { useRouter } from 'vue-router'

// Stores
const recommendationsStore = useRecommendationsStore()
const analyticsStore = useAnalyticsStore()
const router = useRouter()

// 状态
const loading = ref(false)

// 模拟数据
const stats = ref({
  totalWords: 156,
  masteredWords: 89,
  studyDays: 45,
  streakDays: 12,
  weeklyIncrease: 8,
  averageAccuracy: 0.847
})

const weeklyGoal = ref({
  words: { current: 8, target: 15 },
  reviews: { current: 12, target: 20 },
  time: { current: 180, target: 300 }
})

const recentWords = ref([
  { id: 1, word: 'elaborate', meaning: '详细阐述', createdAt: '2024-01-15T10:30:00Z' },
  { id: 2, word: 'substantial', meaning: '大量的', createdAt: '2024-01-14T15:20:00Z' },
  { id: 3, word: 'intricate', meaning: '复杂的', createdAt: '2024-01-13T09:45:00Z' }
])

const recentAchievements = ref([
  { id: 1, icon: '🎯', title: '连续学习达人', description: '连续学习12天' },
  { id: 2, icon: '⭐', title: '单词收集家', description: '录入单词超过150个' }
])

// Computed
const masteryRate = computed(() => {
  const total = stats.value.totalWords || 1
  return ((stats.value.masteredWords / total) * 100).toFixed(0)
})

const accuracyPercentage = computed(() => {
  return (stats.value.averageAccuracy * 100).toFixed(0)
})

const urgentReviews = computed(() => recommendationsStore.criticalUrgentReviews)
const dailyPlan = computed(() => recommendationsStore.dailyPlan)

// 方法
const getProgressPercentage = (type: string): number => {
  const goal = weeklyGoal.value[type as keyof typeof weeklyGoal.value]
  if (!goal) return 0
  return Math.min((goal.current / goal.target) * 100, 100)
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

const startUrgentReview = () => {
  router.push('/review/session')
}

const startDailyPlan = () => {
  router.push('/review/session')
}

const loadDashboardData = async () => {
  loading.value = true
  try {
    await Promise.allSettled([
      recommendationsStore.fetchUrgentReviews(5),
      recommendationsStore.fetchDailyPlan(30),
      analyticsStore.fetchLearningStats({ period: 'week' })
    ])
  } catch (error) {
    console.error('Load dashboard data failed:', error)
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  loadDashboardData()
})
</script>
