<template>
  <div class="word-input-page max-w-4xl mx-auto bg-gray-50 p-6 rounded-2xl">
    <form class="space-y-8" @submit.prevent="handleSubmit">
      <!-- 单词输入 -->
      <section class="rounded-lg shadow-sm border border-gray-200 bg-white p-5">
        <h3 class="text-gray-800 font-semibold text-base mb-4 flex items-center">
          <span class="w-1.5 h-5 bg-blue-500 rounded mr-2"></span>
          单词 *
        </h3>
        <div class="relative">
          <input
            v-model="form.word"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="输入单词..."
            @blur="handleWordBlur"
            @input="handleWordInput"
          />
          <div
            v-if="searchSuggestions.length"
            class="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            <div
              v-for="suggestion in searchSuggestions"
              :key="suggestion.id"
              class="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              @click="selectWordSuggestion(suggestion)"
            >
              <div class="font-medium text-gray-800">{{ suggestion.word }}</div>
              <div class="text-sm text-gray-600 truncate">
                {{ suggestion.standardDefinitions[0]?.meaning }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 标准释义 -->
      <section v-if="selectedWordEntry" class="rounded-lg shadow-sm border border-gray-200 bg-white p-5">
        <h3 class="text-gray-800 font-semibold text-base mb-3 flex items-center">
          <span class="w-1.5 h-5 bg-blue-500 rounded mr-2"></span>
          标准释义
        </h3>
        <div class="space-y-2">
          <div
            v-for="(definition, i) in selectedWordEntry.standardDefinitions.slice(
              0,
              showAllDefinitions ? undefined : 3
            )"
            :key="i"
            class="text-sm border border-gray-100 rounded-md p-2 bg-gray-50"
          >
            <span class="text-blue-600 font-medium mr-2">{{ definition.partOfSpeech }}</span>
            <span>{{ definition.meaning }}</span>
          </div>
        </div>
        <button
          type="button"
          class="mt-3 text-sm text-blue-600 hover:underline"
          @click="showAllDefinitions = !showAllDefinitions"
        >
          {{ showAllDefinitions ? '收起' : `查看全部 ${selectedWordEntry.standardDefinitions.length} 个释义` }}
        </button>
      </section>

      <!-- 当前语境含义 -->
      <section class="rounded-lg shadow-sm border border-gray-200 bg-white p-5">
        <h3 class="text-gray-800 font-semibold text-base mb-4 flex items-center">
          <span class="w-1.5 h-5 bg-blue-500 rounded mr-2"></span>
          当前语境下的含义 *
        </h3>
        <div class="grid md:grid-cols-2 gap-4 mb-4">
          <input
            v-model="form.contextualMeaning.partOfSpeech"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="词性（如 n., v., adj.)"
          />
          <input
            v-model="form.contextualMeaning.chinese"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="中文释义"
          />
        </div>
        <input
          v-model="form.contextualMeaning.english"
          type="text"
          class="w-full mb-4 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="英文定义（可选）"
        />
      </section>

      <!-- 上下文 -->
      <section class="rounded-lg shadow-sm border border-gray-200 bg-white p-5">
        <h3 class="text-gray-800 font-semibold text-base mb-4 flex items-center">
          <span class="w-1.5 h-5 bg-blue-500 rounded mr-2"></span>
          上下文语境 *
        </h3>
        <textarea
          v-model="form.context"
          rows="4"
          required
          class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          placeholder="描述你遇到该单词的完整语境..."
        ></textarea>
      </section>

      <!-- 来源 -->
      <section class="rounded-lg shadow-sm border border-gray-200 bg-white p-5">
        <h3 class="text-gray-800 font-semibold text-base mb-4 flex items-center">
          <span class="w-1.5 h-5 bg-blue-500 rounded mr-2"></span>
          来源信息
        </h3>
        <div class="grid md:grid-cols-2 gap-4 mb-4">
          <select
            v-model="form.sourceType"
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="reading">阅读</option>
            <option value="listening">听力</option>
            <option value="media">媒体</option>
            <option value="study">学习</option>
            <option value="other">其他</option>
          </select>
          <input
            v-model="form.sourceDetail"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="来源详情，如书名、对话对象等"
          />
        </div>
      </section>

      <!-- 地点 -->
      <section class="rounded-lg shadow-sm border border-gray-200 bg-white p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-gray-800 font-semibold text-base flex items-center">
            <span class="w-1.5 h-5 bg-blue-500 rounded mr-2"></span>
            地点信息
          </h3>
          <label class="text-sm text-gray-600 flex items-center space-x-2">
            <input v-model="includeLocation" type="checkbox" class="rounded border-gray-300" />
            <span>记录地点</span>
          </label>
        </div>

        <div v-if="includeLocation" class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <input
              v-model="form.location.name"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="地点名称"
            />
            <select
              v-model="form.location.type"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="home">家</option>
              <option value="school">学校</option>
              <option value="work">工作</option>
              <option value="travel">旅行</option>
              <option value="other">其他</option>
            </select>
          </div>
          <button
            type="button"
            class="px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100"
            :disabled="gettingLocation"
            @click="getCurrentLocation"
          >
            {{ gettingLocation ? '获取中...' : '获取当前位置' }}
          </button>
          <div v-if="form.location.coordinates" class="text-sm text-green-600">✅ 已获取位置坐标</div>
        </div>
      </section>

      <!-- 标签 -->
      <section class="rounded-lg shadow-sm border border-gray-200 bg-white p-5">
        <h3 class="text-gray-800 font-semibold text-base mb-4 flex items-center">
          <span class="w-1.5 h-5 bg-blue-500 rounded mr-2"></span>
          标签
        </h3>
        <div class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="tag in form.tags"
            :key="tag"
            class="flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm"
          >
            {{ tag }}
            <button type="button" class="ml-2 hover:text-blue-900" @click="removeTag(tag)">×</button>
          </span>
        </div>
        <div class="flex border border-gray-300 rounded-md overflow-hidden">
          <input
            v-model="newTag"
            type="text"
            class="flex-1 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none border-0"
            placeholder="添加标签..."
            @keydown.enter.prevent="addTag"
          />
          <button type="button" class="px-6 bg-blue-600 text-white hover:bg-blue-700 transition" @click="addTag">
            添加
          </button>
        </div>
      </section>

      <!-- 备注 -->
      <section class="rounded-lg shadow-sm border border-gray-200 bg-white p-5">
        <h3 class="text-gray-800 font-semibold text-base mb-4 flex items-center">
          <span class="w-1.5 h-5 bg-blue-500 rounded mr-2"></span>
          备注
        </h3>
        <textarea
          v-model="form.notes"
          rows="3"
          class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          placeholder="其他需要记录的信息..."
        ></textarea>
      </section>

      <!-- 重复检测 -->
      <section v-if="duplicationWarning" class="rounded-lg shadow-sm border border-yellow-300 bg-yellow-50 p-5">
        <h4 class="font-semibold text-yellow-800 mb-2">检测到重复录入</h4>
        <p class="text-sm text-yellow-700 mb-3">{{ duplicationWarning.message }}</p>
        <div class="flex gap-3">
          <button
            type="button"
            class="text-sm bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md hover:bg-yellow-200"
            @click="viewDuplicationAnalysis"
          >
            查看详情
          </button>
          <button
            type="button"
            class="text-sm border border-yellow-300 text-yellow-800 px-4 py-2 rounded-md hover:bg-yellow-50"
            @click="ignoreDuplication"
          >
            仍然录入
          </button>
        </div>
      </section>

      <!-- 提交 -->
      <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <button
          type="submit"
          :disabled="submitting"
          class="flex-1 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-semibold"
        >
          {{ submitting ? '录入中...' : '录入单词' }}
        </button>
        <button
          type="button"
          class="py-3 px-6 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          @click="resetForm"
        >
          重置
        </button>
      </div>
    </form>

    <!-- 重复分析弹窗 -->
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
import DuplicationAnalysisModal from './DuplicationAnalysisModal.vue'
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
  contextualMeaning: {
    partOfSpeech: '',
    chinese: '',
    english: ''
  },
  context: '',
  sourceType: 'reading' as SourceType,
  sourceDetail: '',
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
