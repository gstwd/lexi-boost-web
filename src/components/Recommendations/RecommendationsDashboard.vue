<template>
  <div class="recommendations-dashboard bg-white rounded-lg shadow-lg p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">个性化推荐</h2>
      <p class="text-gray-600">根据你的学习情况提供智能建议和优化方案</p>
    </div>

    <!-- 刷新控制 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-4">
        <div class="text-sm text-gray-600">
          最后更新: {{ formatDate(recommendations?.generatedAt || '') }}
        </div>
        <button
          @click="refreshRecommendations"
          :disabled="loading"
          class="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50 flex items-center"
        >
          <svg class="w-4 h-4 mr-1" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          {{ loading ? '更新中...' : '刷新推荐' }}
        </button>
      </div>

      <!-- 推荐设置 -->
      <button
        @click="showSettings = true"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        推荐设置
      </button>
    </div>

    <div v-if="loading && !recommendations" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">加载推荐内容...</p>
    </div>

    <div v-else-if="recommendations">
      <!-- 紧急复习提醒 -->
      <div v-if="urgentReviews.length > 0" class="mb-8">
        <div class="flex items-center mb-4">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <h3 class="font-semibold text-red-800">紧急复习</h3>
          <span class="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
            {{ urgentReviews.length }} 个单词
          </span>
        </div>

        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="word in urgentReviews.slice(0, 6)"
              :key="word.wordRecordId"
              class="flex items-center justify-between p-3 bg-white rounded border border-red-100 hover:shadow-sm transition-shadow"
            >
              <div class="flex-1">
                <div class="font-medium text-gray-800">{{ word.word }}</div>
                <div class="text-sm text-gray-600">{{ word.meaning || '未提供释义' }}</div>
                <div class="text-xs text-red-600 mt-1">
                  逾期 {{ getOverdueDays(word.dueDate || '') }} 天
                </div>
              </div>
              <button
                @click="reviewWord(word.wordRecordId)"
                class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                复习
              </button>
            </div>
          </div>

          <div v-if="urgentReviews.length > 6" class="text-center mt-4">
            <button
              @click="viewAllUrgent"
              class="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              查看全部 {{ urgentReviews.length }} 个紧急复习单词 →
            </button>
          </div>
        </div>
      </div>

      <!-- 今日学习计划 -->
      <div class="mb-8">
        <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
          <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          今日学习计划
        </h3>

        <div v-if="dailyPlan" class="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div class="grid md:grid-cols-4 gap-4 mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ dailyPlan.recommendations.length }}</div>
              <div class="text-sm text-blue-700">推荐复习</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ dailyPlan.breakdown.newWords }}</div>
              <div class="text-sm text-blue-700">新增单词</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ dailyPlan.breakdown.reviews }}</div>
              <div class="text-sm text-blue-700">复习单词</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ dailyPlan.estimatedDuration }}分钟</div>
              <div class="text-sm text-blue-700">预计用时</div>
            </div>
          </div>

          <div class="flex items-center justify-center">
            <button
              @click="startDailyPlan"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              开始今日学习
            </button>
          </div>
        </div>
      </div>

      <!-- 推荐单词 -->
      <div class="mb-8" v-if="contentRecommendations?.suggestedWords && contentRecommendations.suggestedWords.length > 0">
        <h3 class="font-semibold text-gray-800 mb-4">推荐学习单词</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div
            v-for="word in contentRecommendations?.suggestedWords?.slice(0, 4) || []"
            :key="word.word"
            class="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h4 class="font-medium text-gray-800">{{ word.word }}</h4>
                <div class="text-sm text-gray-600 mt-1">{{ word.reason }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-blue-600">难度 {{ word.difficulty }}/5</div>
                <div class="text-xs text-gray-500">优先级 {{ word.priority }}</div>
              </div>
            </div>

            <div v-if="word.relatedWords.length > 0" class="mb-3">
              <div class="text-xs text-gray-500 mb-1">相关词汇:</div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="relatedWord in word.relatedWords.slice(0, 3)"
                  :key="relatedWord"
                  class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {{ relatedWord }}
                </span>
              </div>
            </div>

            <button
              @click="addWordToStudyList(word.word)"
              class="w-full py-2 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
            >
              添加到学习列表
            </button>
          </div>
        </div>
      </div>

      <!-- 学习策略建议 -->
      <div class="mb-8" v-if="learningStrategies">
        <h3 class="font-semibold text-gray-800 mb-4">学习策略优化</h3>
        <div class="grid md:grid-cols-2 gap-6">
          <!-- 当前策略 -->
          <div class="border rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-3">当前使用的策略</h4>
            <div class="space-y-2">
              <div
                v-for="strategy in learningStrategies.currentStrategies.slice(0, 3)"
                :key="strategy"
                class="flex items-center p-2 bg-green-50 rounded"
              >
                <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-green-800 text-sm">{{ strategy }}</span>
              </div>
            </div>
          </div>

          <!-- 推荐策略 -->
          <div class="border rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-3">推荐尝试的策略</h4>
            <div class="space-y-3">
              <div
                v-for="strategy in learningStrategies.suggestedStrategies.slice(0, 2)"
                :key="strategy.strategy"
                class="p-3 bg-blue-50 border border-blue-200 rounded"
              >
                <div class="flex items-center justify-between mb-1">
                  <div class="font-medium text-blue-800 text-sm">{{ strategy.strategy }}</div>
                  <span class="text-xs px-2 py-1 rounded-full" :class="getDifficultyClass(strategy.difficulty)">
                    {{ strategy.difficulty }}
                  </span>
                </div>
                <div class="text-xs text-blue-700">{{ strategy.reason }}</div>
                <div class="text-xs text-blue-600 mt-1">
                  预期提升: {{ strategy.expectedImprovement }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习目标进度 -->
      <div class="mb-8" v-if="weeklyGoals.length > 0">
        <h3 class="font-semibold text-gray-800 mb-4">本周学习目标</h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="goal in weeklyGoals"
            :key="goal.id || goal.type"
            class="border rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-800">{{ getGoalTypeLabel(goal.type) }}</h4>
              <span class="text-sm" :class="getGoalStatusClass(goal.current, goal.target)">
                {{ goal.current }}/{{ goal.target }}
              </span>
            </div>

            <!-- 进度条 -->
            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :style="{
                  width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                  backgroundColor: getGoalProgressColor(goal.current, goal.target)
                }"
              ></div>
            </div>

            <div class="text-xs text-gray-600">
              {{ getGoalProgressText(goal.current, goal.target) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 个性化提示 -->
      <div v-if="learningStrategies?.personalizedTips && learningStrategies.personalizedTips.length > 0" class="mb-8">
        <h3 class="font-semibold text-gray-800 mb-4">个性化建议</h3>
        <div class="space-y-3">
          <div
            v-for="(tip, index) in learningStrategies?.personalizedTips?.slice(0, 3) || []"
            :key="index"
            class="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            <p class="text-yellow-800 text-sm">{{ tip }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
      <p class="text-gray-500 mb-4">暂无推荐内容</p>
      <button
        @click="refreshRecommendations"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        获取推荐
      </button>
    </div>

    <!-- 推荐设置模态框 -->
    <div v-if="showSettings" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">推荐设置</h3>
          <button
            @click="showSettings = false"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div class="p-6">
          <RecommendationSettings @close="showSettings = false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRecommendationsStore } from '@/store'
import RecommendationSettings from './RecommendationSettings.vue'

// Store
const recommendationsStore = useRecommendationsStore()

// 状态
const loading = ref(false)
const showSettings = ref(false)

// Computed
const recommendations = computed(() => recommendationsStore.recommendations)
const urgentReviews = computed(() => recommendationsStore.urgentReviews)
const dailyPlan = computed(() => recommendationsStore.dailyPlan)
const learningStrategies = computed(() => recommendationsStore.learningStrategies)
const contentRecommendations = computed(() => recommendationsStore.contentRecommendations)
const weeklyGoals = computed(() => recommendationsStore.weeklyGoals)

// 目标类型标签
const goalTypeLabels = {
  words: '新增单词',
  reviews: '复习次数',
  accuracy: '正确率',
  time: '学习时间',
  consistency: '学习天数'
}

// 方法
const formatDate = (dateString: string): string => {
  if (!dateString) return '未更新'
  return new Date(dateString).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getOverdueDays = (dueDateString: string): number => {
  if (!dueDateString) return 0
  const dueDate = new Date(dueDateString)
  const now = new Date()
  const diffTime = now.getTime() - dueDate.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

const getDifficultyClass = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'hard': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getGoalTypeLabel = (type: string): string => {
  return goalTypeLabels[type as keyof typeof goalTypeLabels] || type
}

const getGoalStatusClass = (current: number, target: number): string => {
  const progress = current / target
  if (progress >= 1) return 'text-green-600 font-medium'
  if (progress >= 0.7) return 'text-blue-600 font-medium'
  return 'text-gray-600'
}

const getGoalProgressColor = (current: number, target: number): string => {
  const progress = current / target
  if (progress >= 1) return '#10B981'
  if (progress >= 0.7) return '#3B82F6'
  return '#6B7280'
}

const getGoalProgressText = (current: number, target: number): string => {
  const progress = Math.min((current / target) * 100, 100)
  const remaining = Math.max(target - current, 0)

  if (progress >= 100) return '已完成 🎉'
  return `还需 ${remaining}，完成 ${progress.toFixed(0)}%`
}

const refreshRecommendations = async () => {
  loading.value = true
  try {
    await recommendationsStore.fetchAllRecommendations()
  } catch (error) {
    console.error('Refresh recommendations failed:', error)
  } finally {
    loading.value = false
  }
}

const reviewWord = async (wordRecordId: number) => {
  try {
    // 跳转到复习界面或开始单词复习
    console.log('Review word:', wordRecordId)
  } catch (error) {
    console.error('Review word failed:', error)
  }
}

const viewAllUrgent = () => {
  // 跳转到紧急复习页面
  console.log('View all urgent reviews')
}

const startDailyPlan = async () => {
  try {
    // 开始执行今日学习计划
    console.log('Start daily plan')
  } catch (error) {
    console.error('Start daily plan failed:', error)
  }
}

const addWordToStudyList = async (word: string) => {
  try {
    // 添加单词到学习列表
    console.log('Add word to study list:', word)
    alert(`已将"${word}"添加到学习列表`)
  } catch (error) {
    console.error('Add word to study list failed:', error)
  }
}

// 初始化
onMounted(() => {
  refreshRecommendations()
})
</script>