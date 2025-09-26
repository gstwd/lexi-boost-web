<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">重复录入分析</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>

      <div class="p-6" v-if="analysis">
        <!-- 概览信息 -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 class="font-medium text-blue-800 mb-3">录入概览</h3>
          <div class="grid md:grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ analysis.totalCount }}</div>
              <div class="text-sm text-blue-700">总录入次数</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ (analysis.consistencyScore * 100).toFixed(1) }}%</div>
              <div class="text-sm text-blue-700">语义一致性</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ (analysis.contextSimilarity * 100).toFixed(1) }}%</div>
              <div class="text-sm text-blue-700">上下文相似度</div>
            </div>
          </div>
        </div>

        <!-- 含义演进 -->
        <div class="mb-6">
          <h3 class="font-medium text-gray-800 mb-4">含义理解演进</h3>
          <div class="space-y-3">
            <div
              v-for="(evolution, index) in analysis.meaningEvolution"
              :key="evolution.recordId"
              class="border rounded-lg p-4"
              :class="{
                'border-green-200 bg-green-50': evolution.isConsistent,
                'border-red-200 bg-red-50': !evolution.isConsistent
              }"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium">
                  第 {{ index + 1 }} 次录入
                </span>
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-gray-500">
                    {{ formatDate(evolution.recordedAt) }}
                  </span>
                  <span
                    class="px-2 py-1 rounded-full text-xs"
                    :class="{
                      'bg-green-100 text-green-800': evolution.isConsistent,
                      'bg-red-100 text-red-800': !evolution.isConsistent
                    }"
                  >
                    {{ evolution.isConsistent ? '一致' : '不一致' }}
                  </span>
                </div>
              </div>

              <p class="text-gray-700 mb-2">{{ evolution.meaning }}</p>

              <div class="flex items-center justify-between text-sm text-gray-600">
                <span>信心度: {{ evolution.confidence }}/5</span>
                <span>语义距离: {{ evolution.semanticDistance.toFixed(3) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分析建议 -->
        <div class="mb-6" v-if="analysis.recommendations.length > 0">
          <h3 class="font-medium text-gray-800 mb-4">系统建议</h3>
          <div class="space-y-2">
            <div
              v-for="(recommendation, index) in analysis.recommendations"
              :key="index"
              class="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-yellow-800">{{ recommendation }}</p>
            </div>
          </div>
        </div>

        <!-- 历史记录预览 -->
        <div class="mb-6">
          <h3 class="font-medium text-gray-800 mb-4">历史记录</h3>
          <div class="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
            <div class="text-sm text-gray-600 space-y-3">
              <div v-for="recordId in analysis.recordIds.slice(0, 3)" :key="recordId">
                <div class="font-medium">记录 #{{ recordId }}</div>
                <div class="text-xs text-gray-500 mt-1">点击查看详细内容...</div>
              </div>
              <div v-if="analysis.recordIds.length > 3" class="text-center">
                <button class="text-blue-600 hover:text-blue-800 text-sm">
                  查看全部 {{ analysis.recordIds.length }} 条记录
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 一致性分析图表 -->
        <div class="mb-6" v-if="showChart">
          <h3 class="font-medium text-gray-800 mb-4">一致性趋势</h3>
          <div class="bg-gray-100 rounded-lg p-4 h-40 flex items-center justify-center">
            <div class="text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <div class="text-sm">一致性趋势图表</div>
              <div class="text-xs">(图表功能开发中)</div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex space-x-4 pt-6 border-t border-gray-200">
          <button
            @click="$emit('continue')"
            class="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            继续录入
          </button>

          <button
            @click="editCurrentEntry"
            class="py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            修改当前录入
          </button>

          <button
            @click="viewPreviousEntries"
            class="py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            查看历史录入
          </button>

          <button
            @click="$emit('close')"
            class="py-3 px-6 text-gray-600 hover:text-gray-800 transition-colors"
          >
            取消
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else class="p-6 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">分析数据加载中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DuplicationAnalysis } from '@/types'

interface Props {
  analysis: DuplicationAnalysis | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  continue: []
}>()

const showChart = ref(true) // 控制是否显示图表，实际项目中可能基于数据量决定

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const editCurrentEntry = () => {
  // 发出编辑事件，父组件处理
  emit('close')
  // 可以传递需要编辑的信息
}

const viewPreviousEntries = () => {
  // 跳转到历史记录页面或打开历史记录模态框
  console.log('View previous entries for word:', props.analysis?.wordEntryId)
  // 实际实现中可能需要路由跳转或打开新的模态框
}
</script>