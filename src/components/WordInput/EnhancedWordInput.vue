<template>
  <div class="enhanced-word-input bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">录入新单词</h2>
      <p class="text-gray-600">记录你遇到的单词，包括语境和地点信息</p>
    </div>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <!-- 单词输入 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">单词 *</label>
        <div class="relative">
          <input
            v-model="form.word"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="输入单词..."
            @blur="handleWordBlur"
            @input="handleWordInput"
          />
          <!-- 词条搜索建议 -->
          <div
            v-if="searchSuggestions.length > 0"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div
              v-for="suggestion in searchSuggestions"
              :key="suggestion.id"
              class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              @click="selectWordSuggestion(suggestion)"
            >
              <div class="font-medium text-gray-800">
                {{ suggestion.word }}
              </div>
              <div class="text-sm text-gray-600">
                {{ suggestion.standardDefinitions[0]?.meaning.substring(0, 100) }}...
              </div>
              <div class="text-xs text-gray-500 mt-1">
                <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {{ suggestion.standardDefinitions[0]?.partOfSpeech }}
                </span>
                <span class="ml-2">难度: {{ suggestion.difficulty }}/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 标准释义显示 -->
      <div v-if="selectedWordEntry" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-medium text-blue-800 mb-2">标准释义</h3>
        <div class="space-y-2">
          <div
            v-for="(definition, index) in selectedWordEntry.standardDefinitions.slice(0, 3)"
            :key="index"
            class="text-sm"
          >
            <span class="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-2">
              {{ definition.partOfSpeech }}
            </span>
            <span class="text-gray-700">{{ definition.meaning }}</span>
          </div>
        </div>
        <button
          type="button"
          class="text-blue-600 text-sm mt-2 hover:text-blue-800"
          @click="showAllDefinitions = !showAllDefinitions"
        >
          {{ showAllDefinitions ? '收起' : `查看全部 ${selectedWordEntry.standardDefinitions.length} 个释义` }}
        </button>
      </div>

      <!-- 用户理解的含义 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">你理解的含义 *</label>
        <textarea
          v-model="form.meaning"
          required
          rows="3"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-colors"
          placeholder="用你自己的话描述这个单词的含义..."
        />
      </div>

      <!-- 上下文 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">上下文语境 *</label>
        <textarea
          v-model="form.context"
          required
          rows="4"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-colors"
          placeholder="描述你是在什么情况下遇到这个单词的，包括完整的句子或段落..."
        />
      </div>

      <!-- 来源信息 -->
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">来源类型</label>
          <select
            v-model="form.sourceType"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          >
            <option value="reading">阅读</option>
            <option value="listening">听力</option>
            <option value="conversation">对话</option>
            <option value="media">媒体</option>
            <option value="study">学习</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">信心度</label>
          <select
            v-model.number="form.confidence"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          >
            <option value="1">1 - 不确定</option>
            <option value="2">2 - 有点把握</option>
            <option value="3">3 - 比较确定</option>
            <option value="4">4 - 很确定</option>
            <option value="5">5 - 完全确定</option>
          </select>
        </div>
      </div>

      <!-- 来源详情 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">来源详情</label>
        <input
          v-model="form.sourceDetail"
          type="text"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          placeholder="如：书名、文章标题、对话对象等..."
        />
      </div>

      <!-- 地点信息 -->
      <div class="border-t pt-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-medium text-gray-800">地点信息</h3>
          <label class="flex items-center">
            <input
              v-model="includeLocation"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-600">记录地点</span>
          </label>
        </div>

        <div v-if="includeLocation" class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">地点名称</label>
              <input
                v-model="form.location.name"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="如：家里、学校、咖啡厅..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">地点类型</label>
              <select
                v-model="form.location.type"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="home">家</option>
                <option value="school">学校</option>
                <option value="work">工作场所</option>
                <option value="travel">旅行</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <button
              type="button"
              class="flex items-center px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              :disabled="gettingLocation"
              @click="getCurrentLocation"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {{ gettingLocation ? '获取中...' : '获取当前位置' }}
            </button>

            <span v-if="form.location.coordinates" class="text-sm text-gray-600">已获取位置坐标</span>
          </div>
        </div>
      </div>

      <!-- 标签 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">标签</label>
        <div class="flex flex-wrap gap-2 mb-3">
          <span
            v-for="tag in form.tags"
            :key="tag"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
          >
            {{ tag }}
            <button type="button" class="ml-2 w-4 h-4 text-blue-600 hover:text-blue-800" @click="removeTag(tag)">
              ×
            </button>
          </span>
        </div>
        <div class="flex">
          <input
            v-model="newTag"
            type="text"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="添加标签..."
            @keydown.enter.prevent="addTag"
          />
          <button
            type="button"
            class="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
            @click="addTag"
          >
            添加
          </button>
        </div>
      </div>

      <!-- 备注 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">备注</label>
        <textarea
          v-model="form.notes"
          rows="2"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-colors"
          placeholder="其他需要记录的信息..."
        />
      </div>

      <!-- 重复检测提醒 -->
      <div v-if="duplicationWarning" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex items-start">
          <svg
            class="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <div>
            <h4 class="font-medium text-yellow-800 mb-1">检测到重复录入</h4>
            <p class="text-sm text-yellow-700">
              {{ duplicationWarning.message }}
            </p>
            <div class="mt-2 space-x-2">
              <button
                type="button"
                class="text-sm text-yellow-800 hover:text-yellow-900 underline"
                @click="viewDuplicationAnalysis"
              >
                查看分析详情
              </button>
              <button
                type="button"
                class="text-sm text-yellow-800 hover:text-yellow-900 underline"
                @click="ignoreDuplication"
              >
                仍然录入
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="flex space-x-4 pt-6">
        <button
          type="submit"
          :disabled="submitting"
          class="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {{ submitting ? '录入中...' : '录入单词' }}
        </button>

        <button
          type="button"
          class="py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          @click="resetForm"
        >
          重置
        </button>
      </div>
    </form>

    <!-- 重复分析模态框 -->
    <duplication-analysis-modal
      v-if="showDuplicationModal"
      :analysis="duplicationAnalysisData"
      @close="showDuplicationModal = false"
      @continue="continueDespiteDuplication"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useWordsStore } from '@/store'
import type { UserWordRecord, WordEntry, LocationInfo, SourceType, DuplicationAnalysis } from '@/types'

// Store
const wordsStore = useWordsStore()

// 状态
const submitting = ref(false)
const includeLocation = ref(false)
const gettingLocation = ref(false)
const searchSuggestions = ref<WordEntry[]>([])
const selectedWordEntry = ref<WordEntry | null>(null)
const showAllDefinitions = ref(false)
const newTag = ref('')
const duplicationWarning = ref<{ message: string } | null>(null)
const showDuplicationModal = ref(false)
const duplicationAnalysisData = ref<DuplicationAnalysis | null>(null)

// 表单数据
const form = reactive({
  word: '',
  meaning: '',
  context: '',
  sourceType: 'reading' as SourceType,
  sourceDetail: '',
  confidence: 3,
  location: {
    name: '',
    type: 'home' as 'home' | 'school' | 'work' | 'travel' | 'other',
    coordinates: null as [number, number] | null
  } as LocationInfo,
  tags: [] as string[],
  notes: ''
})

// 搜索防抖
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const handleWordInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(async () => {
    if (form.word.trim().length >= 2) {
      await searchWordEntries(form.word.trim())
    } else {
      searchSuggestions.value = []
      selectedWordEntry.value = null
    }
  }, 300)
}

const searchWordEntries = async (query: string) => {
  try {
    await wordsStore.searchWordEntries(query, 1, 5)
    searchSuggestions.value = wordsStore.searchResults
  } catch (error) {
    console.error('Search failed:', error)
  }
}

const selectWordSuggestion = (entry: WordEntry) => {
  form.word = entry.word
  selectedWordEntry.value = entry
  searchSuggestions.value = []
}

const handleWordBlur = () => {
  // 延迟清空搜索建议，允许点击选择
  setTimeout(() => {
    searchSuggestions.value = []
  }, 200)
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('您的浏览器不支持地理位置功能')
    return
  }

  gettingLocation.value = true
  navigator.geolocation.getCurrentPosition(
    position => {
      form.location.coordinates = [position.coords.latitude, position.coords.longitude]
      gettingLocation.value = false
    },
    error => {
      console.error('获取位置失败:', error)
      alert('获取位置失败，请检查权限设置')
      gettingLocation.value = false
    }
  )
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  const index = form.tags.indexOf(tag)
  if (index > -1) {
    form.tags.splice(index, 1)
  }
}

// 重复检测
watch([() => form.word, () => form.meaning, () => form.context], async ([word, meaning, context]) => {
  if (word.trim() && meaning.trim() && context.trim()) {
    // 防抖检查重复
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      await checkDuplication(word.trim(), meaning.trim(), context.trim())
    }, 1000)
  }
})

const checkDuplication = async (word: string, meaning: string, context: string) => {
  try {
    const analysis = await wordsStore.checkDuplication(word, meaning, context)
    if (analysis && analysis.totalCount > 0) {
      duplicationWarning.value = {
        message: `你已经录入过 "${word}" ${analysis.totalCount} 次，语义一致性为 ${(analysis.consistencyScore * 100).toFixed(1)}%`
      }
      duplicationAnalysisData.value = analysis
    } else {
      duplicationWarning.value = null
    }
  } catch (error) {
    console.error('Duplication check failed:', error)
  }
}

const viewDuplicationAnalysis = () => {
  showDuplicationModal.value = true
}

const ignoreDuplication = () => {
  duplicationWarning.value = null
}

const continueDespiteDuplication = () => {
  showDuplicationModal.value = false
  duplicationWarning.value = null
}

const handleSubmit = async () => {
  submitting.value = true

  try {
    const recordData: Omit<UserWordRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      wordEntryId: selectedWordEntry.value?.id || 0, // 需要后端处理词条创建
      userId: 1, // 临时硬编码，实际应从认证状态获取
      meaning: form.meaning,
      context: form.context,
      location: includeLocation.value ? form.location : undefined,
      sourceType: form.sourceType,
      sourceDetail: form.sourceDetail || undefined,
      confidence: form.confidence,
      tags: form.tags.length > 0 ? form.tags : undefined,
      notes: form.notes || undefined,
      sessionId: Date.now().toString() // 临时会话ID
    }

    await wordsStore.createWordRecord(recordData)

    // 成功提示
    alert('单词录入成功！')
    resetForm()
  } catch (error) {
    console.error('Submit failed:', error)
    alert('录入失败，请重试')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    word: '',
    meaning: '',
    context: '',
    sourceType: 'reading' as SourceType,
    sourceDetail: '',
    confidence: 3,
    location: {
      name: '',
      type: 'home',
      coordinates: null
    },
    tags: [],
    notes: ''
  })

  selectedWordEntry.value = null
  searchSuggestions.value = []
  includeLocation.value = false
  duplicationWarning.value = null
  showDuplicationModal.value = false
}
</script>
