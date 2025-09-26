<template>
  <div class="recommendation-settings">
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-2">推荐系统设置</h3>
      <p class="text-gray-600">自定义推荐算法的参数，获得更个性化的学习建议</p>
    </div>

    <form @submit.prevent="saveSettings" class="space-y-6">
      <!-- 推荐总开关 -->
      <div>
        <label class="flex items-center">
          <input
            v-model="settings.enabled"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          >
          <span class="ml-3 font-medium text-gray-800">启用个性化推荐</span>
        </label>
        <p class="text-sm text-gray-600 mt-1">关闭后将不会生成任何推荐内容</p>
      </div>

      <div v-if="settings.enabled" class="space-y-6">
        <!-- 推荐频率 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">推荐更新频率</label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="settings.frequency"
                type="radio"
                value="daily"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <span class="ml-2">每日更新 - 根据当天学习情况调整</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="settings.frequency"
                type="radio"
                value="weekly"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <span class="ml-2">每周更新 - 基于一周学习数据生成</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="settings.frequency"
                type="radio"
                value="monthly"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <span class="ml-2">每月更新 - 长期趋势分析</span>
            </label>
          </div>
        </div>

        <!-- 推荐类型 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">推荐内容类型</label>
          <div class="grid md:grid-cols-2 gap-4">
            <label class="flex items-start p-3 border rounded-lg hover:bg-gray-50">
              <input
                v-model="settings.types"
                type="checkbox"
                value="review"
                class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <div class="ml-3">
                <div class="font-medium text-gray-800">复习推荐</div>
                <div class="text-sm text-gray-600">基于遗忘曲线的复习计划</div>
              </div>
            </label>
            <label class="flex items-start p-3 border rounded-lg hover:bg-gray-50">
              <input
                v-model="settings.types"
                type="checkbox"
                value="study_time"
                class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <div class="ml-3">
                <div class="font-medium text-gray-800">学习时间优化</div>
                <div class="text-sm text-gray-600">最佳学习时段建议</div>
              </div>
            </label>
            <label class="flex items-start p-3 border rounded-lg hover:bg-gray-50">
              <input
                v-model="settings.types"
                type="checkbox"
                value="difficulty"
                class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <div class="ml-3">
                <div class="font-medium text-gray-800">难度调整</div>
                <div class="text-sm text-gray-600">智能难度平衡建议</div>
              </div>
            </label>
            <label class="flex items-start p-3 border rounded-lg hover:bg-gray-50">
              <input
                v-model="settings.types"
                type="checkbox"
                value="content"
                class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <div class="ml-3">
                <div class="font-medium text-gray-800">内容推荐</div>
                <div class="text-sm text-gray-600">新单词和学习材料推荐</div>
              </div>
            </label>
          </div>
        </div>

        <!-- 推荐数量 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            每次推荐数量: {{ settings.maxRecommendations }}
          </label>
          <input
            v-model.number="settings.maxRecommendations"
            type="range"
            min="5"
            max="50"
            step="5"
            class="w-full"
          >
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 条</span>
            <span>25 条</span>
            <span>50 条</span>
          </div>
        </div>

        <!-- 难度偏好 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">难度偏好</label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="settings.difficulty"
                type="radio"
                value="conservative"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <span class="ml-2">保守型 - 偏向已掌握的单词，稳步提升</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="settings.difficulty"
                type="radio"
                value="balanced"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <span class="ml-2">平衡型 - 适中的难度混合，全面发展</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="settings.difficulty"
                type="radio"
                value="aggressive"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <span class="ml-2">激进型 - 挑战困难单词，快速提升</span>
            </label>
          </div>
        </div>

        <!-- 内容推荐设置 -->
        <div>
          <label class="flex items-center mb-3">
            <input
              v-model="settings.includeContentSuggestions"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            >
            <span class="ml-2 font-medium text-gray-800">启用内容推荐</span>
          </label>

          <div v-if="settings.includeContentSuggestions" class="ml-6 space-y-4">
            <div>
              <label class="block text-sm text-gray-700 mb-2">推荐来源偏好</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="contentSources"
                    type="checkbox"
                    value="frequency"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm">高频词汇</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="contentSources"
                    type="checkbox"
                    value="academic"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm">学术词汇</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="contentSources"
                    type="checkbox"
                    value="professional"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm">专业词汇</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="contentSources"
                    type="checkbox"
                    value="trending"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm">热门词汇</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm text-gray-700 mb-2">兴趣主题</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="topic in availableTopics"
                  :key="topic"
                  type="button"
                  @click="toggleTopic(topic)"
                  class="px-3 py-1 text-sm border rounded-full transition-colors"
                  :class="{
                    'bg-blue-100 text-blue-800 border-blue-300': selectedTopics.includes(topic),
                    'bg-gray-100 text-gray-700 border-gray-300': !selectedTopics.includes(topic)
                  }"
                >
                  {{ topic }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 高级设置 -->
        <div class="border-t border-gray-200 pt-6">
          <h4 class="font-medium text-gray-800 mb-4">高级设置</h4>

          <div class="space-y-4">
            <!-- 学习模式检测 -->
            <div>
              <label class="flex items-center">
                <input
                  v-model="advancedSettings.autoDetectLearningStyle"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="ml-2">自动检测学习模式</span>
              </label>
              <p class="text-xs text-gray-600 mt-1 ml-6">
                系统将分析你的学习行为，自动调整推荐策略
              </p>
            </div>

            <!-- 上下文学习 -->
            <div>
              <label class="flex items-center">
                <input
                  v-model="advancedSettings.contextualLearning"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="ml-2">启用上下文学习</span>
              </label>
              <p class="text-xs text-gray-600 mt-1 ml-6">
                基于你的录入语境推荐相关单词和表达
              </p>
            </div>

            <!-- 遗忘曲线个性化 -->
            <div>
              <label class="flex items-center">
                <input
                  v-model="advancedSettings.personalizedForgettingCurve"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="ml-2">个性化遗忘曲线</span>
              </label>
              <p class="text-xs text-gray-600 mt-1 ml-6">
                根据个人记忆特点调整复习间隔
              </p>
            </div>

            <!-- 社交学习 -->
            <div>
              <label class="flex items-center">
                <input
                  v-model="advancedSettings.socialLearning"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="ml-2">参考群体学习数据</span>
              </label>
              <p class="text-xs text-gray-600 mt-1 ml-6">
                匿名参考其他用户的学习模式进行优化
              </p>
            </div>
          </div>
        </div>

        <!-- 数据隐私 -->
        <div class="border-t border-gray-200 pt-6">
          <h4 class="font-medium text-gray-800 mb-4">数据与隐私</h4>
          <div class="space-y-3">
            <div class="flex items-start">
              <input
                v-model="privacySettings.allowDataCollection"
                type="checkbox"
                class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-800">允许匿名数据收集</div>
                <div class="text-xs text-gray-600 mt-1">
                  帮助改进推荐算法，所有数据都会匿名化处理
                </div>
              </div>
            </div>

            <div class="flex items-start">
              <input
                v-model="privacySettings.shareProgress"
                type="checkbox"
                class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-800">分享学习进度统计</div>
                <div class="text-xs text-gray-600 mt-1">
                  与其他用户对比学习效果，激励持续学习
                </div>
              </div>
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
          @click="resetToDefaults"
          class="py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          恢复默认
        </button>

        <button
          type="button"
          @click="$emit('close')"
          class="py-3 px-6 text-gray-600 hover:text-gray-800 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRecommendationsStore } from '@/store'

const emit = defineEmits<{
  close: []
}>()

// Store
const recommendationsStore = useRecommendationsStore()

// 状态
const saving = ref(false)

// 设置数据
const settings = reactive({
  enabled: true,
  frequency: 'daily',
  types: ['review', 'study_time', 'difficulty', 'content'],
  maxRecommendations: 15,
  difficulty: 'balanced',
  includeContentSuggestions: true
})

const contentSources = ref(['frequency', 'academic'])
const selectedTopics = ref(['科技', '商务'])

const availableTopics = [
  '科技', '商务', '学术', '医学', '法律', '艺术',
  '体育', '娱乐', '旅游', '生活', '教育', '环境'
]

const advancedSettings = reactive({
  autoDetectLearningStyle: true,
  contextualLearning: true,
  personalizedForgettingCurve: false,
  socialLearning: false
})

const privacySettings = reactive({
  allowDataCollection: false,
  shareProgress: false
})

// 方法
const toggleTopic = (topic: string) => {
  const index = selectedTopics.value.indexOf(topic)
  if (index > -1) {
    selectedTopics.value.splice(index, 1)
  } else {
    selectedTopics.value.push(topic)
  }
}

const saveSettings = async () => {
  saving.value = true

  try {
    const combinedSettings = {
      ...settings,
      contentSources: contentSources.value,
      selectedTopics: selectedTopics.value,
      advanced: advancedSettings,
      privacy: privacySettings
    }

    await recommendationsStore.updateSettings(combinedSettings)
    emit('close')
  } catch (error) {
    console.error('Save recommendation settings failed:', error)
    alert('保存设置失败，请重试')
  } finally {
    saving.value = false
  }
}

const resetToDefaults = () => {
  Object.assign(settings, {
    enabled: true,
    frequency: 'daily',
    types: ['review', 'study_time', 'difficulty', 'content'],
    maxRecommendations: 15,
    difficulty: 'balanced',
    includeContentSuggestions: true
  })

  contentSources.value = ['frequency', 'academic']
  selectedTopics.value = ['科技', '商务']

  Object.assign(advancedSettings, {
    autoDetectLearningStyle: true,
    contextualLearning: true,
    personalizedForgettingCurve: false,
    socialLearning: false
  })

  Object.assign(privacySettings, {
    allowDataCollection: false,
    shareProgress: false
  })
}

const loadCurrentSettings = async () => {
  try {
    await recommendationsStore.fetchSettings()
    if (recommendationsStore.settings) {
      Object.assign(settings, recommendationsStore.settings)
    }
  } catch (error) {
    console.error('Load recommendation settings failed:', error)
  }
}

// 初始化
onMounted(() => {
  loadCurrentSettings()
})
</script>