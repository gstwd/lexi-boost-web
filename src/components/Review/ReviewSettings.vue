<template>
  <div class="review-settings bg-white rounded-lg shadow-lg p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">复习设置</h2>
      <p class="text-gray-600">配置你的复习偏好和难度设置</p>
    </div>

    <form class="space-y-6" @submit.prevent="saveSettings">
      <!-- 复习类型选择 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">复习类型</label>
        <div class="space-y-3">
          <label class="flex items-center">
            <input
              v-model="settings.sessionType"
              type="radio"
              value="quick"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div class="ml-3">
              <div class="font-medium text-gray-800">快速复习</div>
              <div class="text-sm text-gray-600">5-10分钟，专注高频错误词汇</div>
            </div>
          </label>
          <label class="flex items-center">
            <input
              v-model="settings.sessionType"
              type="radio"
              value="standard"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div class="ml-3">
              <div class="font-medium text-gray-800">标准复习</div>
              <div class="text-sm text-gray-600">15-30分钟，平衡各种复习题型</div>
            </div>
          </label>
          <label class="flex items-center">
            <input
              v-model="settings.sessionType"
              type="radio"
              value="intensive"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div class="ml-3">
              <div class="font-medium text-gray-800">深度复习</div>
              <div class="text-sm text-gray-600">30分钟以上，全面深入复习</div>
            </div>
          </label>
          <label class="flex items-center">
            <input
              v-model="settings.sessionType"
              type="radio"
              value="adaptive"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div class="ml-3">
              <div class="font-medium text-gray-800">自适应复习</div>
              <div class="text-sm text-gray-600">根据学习情况自动调整难度和内容</div>
            </div>
          </label>
        </div>
      </div>

      <!-- 题目数量 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          每次复习题目数量: {{ settings.questionsPerSession }}
        </label>
        <input v-model.number="settings.questionsPerSession" type="range" min="5" max="50" step="5" class="w-full" />
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>5 题</span>
          <span>25 题</span>
          <span>50 题</span>
        </div>
      </div>

      <!-- 复习模式偏好 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">复习模式偏好 (可多选)</label>
        <div class="grid md:grid-cols-2 gap-4">
          <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50">
            <input
              v-model="settings.preferredTypes"
              type="checkbox"
              value="recognition"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div class="ml-3">
              <div class="font-medium text-gray-800">单词识别</div>
              <div class="text-sm text-gray-600">看单词选择含义</div>
            </div>
          </label>
          <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50">
            <input
              v-model="settings.preferredTypes"
              type="checkbox"
              value="recall"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div class="ml-3">
              <div class="font-medium text-gray-800">单词回忆</div>
              <div class="text-sm text-gray-600">看含义输入单词</div>
            </div>
          </label>
          <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50">
            <input
              v-model="settings.preferredTypes"
              type="checkbox"
              value="context"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div class="ml-3">
              <div class="font-medium text-gray-800">语境理解</div>
              <div class="text-sm text-gray-600">根据语境理解单词</div>
            </div>
          </label>
          <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50">
            <input
              v-model="settings.preferredTypes"
              type="checkbox"
              value="production"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div class="ml-3">
              <div class="font-medium text-gray-800">单词造句</div>
              <div class="text-sm text-gray-600">用单词造句练习</div>
            </div>
          </label>
        </div>
      </div>

      <!-- 难度设置 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">难度偏好</label>
        <div class="space-y-2">
          <label class="flex items-center">
            <input
              v-model="settings.difficultyPreference"
              type="radio"
              value="easy"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2">偏向简单 - 更多已掌握的单词</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="settings.difficultyPreference"
              type="radio"
              value="balanced"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2">平衡难度 - 混合各种难度的单词</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="settings.difficultyPreference"
              type="radio"
              value="challenging"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2">挑战模式 - 更多困难和新单词</span>
          </label>
        </div>
      </div>

      <!-- 复习优先级 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">复习优先级</label>
        <div class="space-y-2">
          <label class="flex items-center justify-between">
            <span>遗忘曲线优化</span>
            <input v-model="settings.priorityWeights.forgettingCurve" type="range" min="0" max="100" class="w-32" />
            <span class="text-sm text-gray-600">{{ settings.priorityWeights.forgettingCurve }}%</span>
          </label>
          <label class="flex items-center justify-between">
            <span>错误频率</span>
            <input v-model="settings.priorityWeights.errorFrequency" type="range" min="0" max="100" class="w-32" />
            <span class="text-sm text-gray-600">{{ settings.priorityWeights.errorFrequency }}%</span>
          </label>
          <label class="flex items-center justify-between">
            <span>学习时间</span>
            <input v-model="settings.priorityWeights.recentLearning" type="range" min="0" max="100" class="w-32" />
            <span class="text-sm text-gray-600">{{ settings.priorityWeights.recentLearning }}%</span>
          </label>
          <label class="flex items-center justify-between">
            <span>用户标记</span>
            <input v-model="settings.priorityWeights.userMarked" type="range" min="0" max="100" class="w-32" />
            <span class="text-sm text-gray-600">{{ settings.priorityWeights.userMarked }}%</span>
          </label>
        </div>
      </div>

      <!-- 学习目标 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">每日学习目标</label>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-600 mb-1">复习时间 (分钟)</label>
            <input
              v-model.number="settings.dailyGoals.reviewTime"
              type="number"
              min="5"
              max="120"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">新单词数量</label>
            <input
              v-model.number="settings.dailyGoals.newWords"
              type="number"
              min="0"
              max="50"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <!-- 智能提醒 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">智能提醒设置</label>
        <div class="space-y-3">
          <label class="flex items-center">
            <input
              v-model="settings.notifications.enabled"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2">启用复习提醒</span>
          </label>

          <div v-if="settings.notifications.enabled" class="ml-6 space-y-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">提醒时间</label>
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-for="(time, index) in settings.notifications.times"
                  :key="index"
                  v-model="settings.notifications.times[index]"
                  type="time"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="settings.notifications.adaptive"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2">智能提醒 - 根据遗忘曲线调整提醒时间</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="settings.notifications.weekendsOnly"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2">仅工作日提醒</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 按钮 -->
      <div class="flex space-x-4 pt-6 border-t border-gray-200">
        <button
          type="submit"
          :disabled="saving"
          class="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {{ saving ? '保存中...' : '保存设置' }}
        </button>

        <button
          type="button"
          class="py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          @click="resetToDefaults"
        >
          恢复默认
        </button>

        <button
          type="button"
          class="py-3 px-6 text-gray-600 hover:text-gray-800 transition-colors"
          @click="$emit('close')"
        >
          取消
        </button>
      </div>

      <!-- 预设模板 -->
      <div class="border-t border-gray-200 pt-6">
        <h3 class="text-sm font-medium text-gray-700 mb-3">快速设置模板</h3>
        <div class="grid md:grid-cols-3 gap-4">
          <button
            type="button"
            class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
            @click="applyTemplate('beginner')"
          >
            <div class="font-medium text-gray-800 mb-1">初学者</div>
            <div class="text-xs text-gray-600">简单模式，重复较多，提醒频繁</div>
          </button>
          <button
            type="button"
            class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
            @click="applyTemplate('intermediate')"
          >
            <div class="font-medium text-gray-800 mb-1">进阶者</div>
            <div class="text-xs text-gray-600">平衡难度，适度重复，智能提醒</div>
          </button>
          <button
            type="button"
            class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
            @click="applyTemplate('advanced')"
          >
            <div class="font-medium text-gray-800 mb-1">高级用户</div>
            <div class="text-xs text-gray-600">挑战模式，少量重复，精准提醒</div>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useReviewsStore } from '@/store'
import type { ReviewSettings } from '@/types'

const emit = defineEmits<{
  close: []
}>()

// Store
const reviewsStore = useReviewsStore()

// 状态
const saving = ref(false)

// 设置数据
const settings = reactive<ReviewSettings>({
  sessionType: 'adaptive',
  questionsPerSession: 20,
  preferredTypes: ['recognition', 'recall'],
  difficultyPreference: 'balanced',
  priorityWeights: {
    forgettingCurve: 40,
    errorFrequency: 30,
    recentLearning: 20,
    userMarked: 10
  },
  dailyGoals: {
    reviewTime: 30,
    newWords: 10
  },
  notifications: {
    enabled: true,
    times: ['09:00', '19:00'],
    adaptive: true,
    weekendsOnly: false
  }
})

// 模板设置
const templates = {
  beginner: {
    sessionType: 'standard' as const,
    questionsPerSession: 15,
    preferredTypes: ['recognition'],
    difficultyPreference: 'easy' as const,
    priorityWeights: {
      forgettingCurve: 50,
      errorFrequency: 30,
      recentLearning: 15,
      userMarked: 5
    },
    dailyGoals: {
      reviewTime: 20,
      newWords: 5
    },
    notifications: {
      enabled: true,
      times: ['09:00', '15:00', '21:00'],
      adaptive: false,
      weekendsOnly: false
    }
  },
  intermediate: {
    sessionType: 'adaptive' as const,
    questionsPerSession: 25,
    preferredTypes: ['recognition', 'recall', 'context'],
    difficultyPreference: 'balanced' as const,
    priorityWeights: {
      forgettingCurve: 40,
      errorFrequency: 25,
      recentLearning: 25,
      userMarked: 10
    },
    dailyGoals: {
      reviewTime: 30,
      newWords: 10
    },
    notifications: {
      enabled: true,
      times: ['09:00', '19:00'],
      adaptive: true,
      weekendsOnly: false
    }
  },
  advanced: {
    sessionType: 'intensive' as const,
    questionsPerSession: 35,
    preferredTypes: ['recall', 'context', 'production'],
    difficultyPreference: 'challenging' as const,
    priorityWeights: {
      forgettingCurve: 30,
      errorFrequency: 25,
      recentLearning: 30,
      userMarked: 15
    },
    dailyGoals: {
      reviewTime: 45,
      newWords: 15
    },
    notifications: {
      enabled: true,
      times: ['08:00', '20:00'],
      adaptive: true,
      weekendsOnly: true
    }
  }
}

// 方法
const saveSettings = async () => {
  saving.value = true

  try {
    await reviewsStore.updateSettings(settings)
    emit('close')
  } catch (error) {
    console.error('Save settings failed:', error)
    alert('保存设置失败，请重试')
  } finally {
    saving.value = false
  }
}

const resetToDefaults = () => {
  Object.assign(settings, templates.intermediate)
}

const applyTemplate = (templateName: keyof typeof templates) => {
  Object.assign(settings, templates[templateName])
}

const loadCurrentSettings = async () => {
  try {
    await reviewsStore.fetchSettings()
    if (reviewsStore.settings) {
      Object.assign(settings, reviewsStore.settings)
    }
  } catch (error) {
    console.error('Load settings failed:', error)
  }
}

// 初始化
onMounted(() => {
  loadCurrentSettings()
})
</script>
