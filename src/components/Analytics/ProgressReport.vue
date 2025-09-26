<template>
  <div class="progress-report bg-white rounded-lg shadow-lg p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">学习进度报告</h2>
          <p class="text-gray-600">深入了解你的学习表现和成长轨迹</p>
        </div>
        <div class="flex items-center space-x-2">
          <select
            v-model="reportPeriod"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            @change="generateReport"
          >
            <option value="week">周报告</option>
            <option value="month">月报告</option>
            <option value="quarter">季度报告</option>
            <option value="year">年度报告</option>
          </select>
          <button
            @click="generateReport"
            :disabled="generating"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {{ generating ? '生成中...' : '更新报告' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="generating" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">生成学习报告中...</p>
    </div>

    <div v-else-if="report">
      <!-- 报告摘要 -->
      <div class="mb-8">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ getReportPeriodLabel(reportPeriod) }}总结
          </h3>
          <div class="text-blue-700 leading-relaxed">
            {{ report.summary }}
          </div>
        </div>
      </div>

      <!-- 核心数据对比 -->
      <div class="mb-8">
        <h3 class="font-semibold text-gray-800 mb-4">核心指标对比</h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white border rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="text-sm font-medium text-gray-600">新增单词</div>
              <div class="text-xs px-2 py-1 rounded-full" :class="getTrendClass(report.comparison.wordsAdded.trend)">
                {{ formatTrend(report.comparison.wordsAdded.trend) }}
              </div>
            </div>
            <div class="text-2xl font-bold text-gray-800">{{ report.comparison.wordsAdded.current }}</div>
            <div class="text-sm text-gray-500">上期: {{ report.comparison.wordsAdded.previous }}</div>
          </div>

          <div class="bg-white border rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="text-sm font-medium text-gray-600">复习会话</div>
              <div class="text-xs px-2 py-1 rounded-full" :class="getTrendClass(report.comparison.reviewSessions.trend)">
                {{ formatTrend(report.comparison.reviewSessions.trend) }}
              </div>
            </div>
            <div class="text-2xl font-bold text-gray-800">{{ report.comparison.reviewSessions.current }}</div>
            <div class="text-sm text-gray-500">上期: {{ report.comparison.reviewSessions.previous }}</div>
          </div>

          <div class="bg-white border rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="text-sm font-medium text-gray-600">平均正确率</div>
              <div class="text-xs px-2 py-1 rounded-full" :class="getTrendClass(report.comparison.averageAccuracy.trend)">
                {{ formatTrend(report.comparison.averageAccuracy.trend) }}
              </div>
            </div>
            <div class="text-2xl font-bold text-gray-800">{{ (report.comparison.averageAccuracy.current * 100).toFixed(1) }}%</div>
            <div class="text-sm text-gray-500">上期: {{ (report.comparison.averageAccuracy.previous * 100).toFixed(1) }}%</div>
          </div>

          <div class="bg-white border rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="text-sm font-medium text-gray-600">学习时长</div>
              <div class="text-xs px-2 py-1 rounded-full" :class="getTrendClass(report.comparison.studyTime.trend)">
                {{ formatTrend(report.comparison.studyTime.trend) }}
              </div>
            </div>
            <div class="text-2xl font-bold text-gray-800">{{ formatDuration(report.comparison.studyTime.current) }}</div>
            <div class="text-sm text-gray-500">上期: {{ formatDuration(report.comparison.studyTime.previous) }}</div>
          </div>
        </div>
      </div>

      <!-- 掌握度进步 -->
      <div class="mb-8">
        <h3 class="font-semibold text-gray-800 mb-4">掌握度进步</h3>
        <div class="grid md:grid-cols-2 gap-6">
          <!-- 进步最快的单词 -->
          <div class="border rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              进步最快
            </h4>
            <div class="space-y-3">
              <div
                v-for="word in report.masteryProgress.improved.slice(0, 5)"
                :key="word.wordId"
                class="flex items-center justify-between"
              >
                <div>
                  <div class="font-medium text-gray-800">{{ word.word }}</div>
                  <div class="text-sm text-gray-600">{{ word.meaning }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-green-600">
                    +{{ word.masteryImprovement.toFixed(1) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ word.previousLevel }} → {{ word.currentLevel }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 需要加强的单词 -->
          <div class="border rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6"/>
              </svg>
              需要加强
            </h4>
            <div class="space-y-3">
              <div
                v-for="word in report.masteryProgress.declined.slice(0, 5)"
                :key="word.wordId"
                class="flex items-center justify-between"
              >
                <div>
                  <div class="font-medium text-gray-800">{{ word.word }}</div>
                  <div class="text-sm text-gray-600">{{ word.meaning }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-red-600">
                    {{ word.masteryImprovement.toFixed(1) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ word.previousLevel }} → {{ word.currentLevel }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习模式分析 -->
      <div class="mb-8">
        <h3 class="font-semibold text-gray-800 mb-4">学习模式分析</h3>
        <div class="grid md:grid-cols-3 gap-6">
          <!-- 最活跃时间段 -->
          <div class="border rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-3">最活跃时间</h4>
            <div class="space-y-2">
              <div
                v-for="timeSlot in report.patterns.activeTimeSlots.slice(0, 3)"
                :key="timeSlot.hour"
                class="flex items-center justify-between"
              >
                <span class="text-gray-700">{{ formatHour(timeSlot.hour) }}</span>
                <div class="flex items-center space-x-2">
                  <div class="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-blue-500 h-2 rounded-full"
                      :style="{ width: `${(timeSlot.sessions / Math.max(...report.patterns.activeTimeSlots.map(t => t.sessions))) * 100}%` }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-600">{{ timeSlot.sessions }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 最佳题型表现 -->
          <div class="border rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-3">最佳题型</h4>
            <div class="space-y-2">
              <div
                v-for="type in report.patterns.bestQuestionTypes.slice(0, 3)"
                :key="type.type"
                class="flex items-center justify-between"
              >
                <span class="text-gray-700">{{ getQuestionTypeLabel(type.type) }}</span>
                <div class="flex items-center space-x-2">
                  <div class="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-green-500 h-2 rounded-full"
                      :style="{ width: `${type.accuracy * 100}%` }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-600">{{ (type.accuracy * 100).toFixed(0) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 学习一致性 -->
          <div class="border rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-3">学习一致性</h4>
            <div class="text-center mb-4">
              <div class="text-3xl font-bold text-blue-600">{{ report.patterns.consistency.streakDays }}</div>
              <div class="text-sm text-gray-600">连续学习天数</div>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">本期学习天数:</span>
                <span class="font-medium">{{ report.patterns.consistency.studyDays }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">平均每日时长:</span>
                <span class="font-medium">{{ formatDuration(report.patterns.consistency.averageDailyTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 个性化建议 -->
      <div class="mb-8">
        <h3 class="font-semibold text-gray-800 mb-4">个性化建议</h3>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <h4 class="font-medium text-blue-800 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              继续保持
            </h4>
            <div class="space-y-3">
              <div
                v-for="strength in report.recommendations.strengths"
                :key="strength.title"
                class="p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div class="font-medium text-green-800">{{ strength.title }}</div>
                <div class="text-sm text-green-700 mt-1">{{ strength.description }}</div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="font-medium text-orange-800 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              改进建议
            </h4>
            <div class="space-y-3">
              <div
                v-for="improvement in report.recommendations.improvements"
                :key="improvement.title"
                class="p-3 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <div class="font-medium text-orange-800">{{ improvement.title }}</div>
                <div class="text-sm text-orange-700 mt-1">{{ improvement.description }}</div>
                <div v-if="improvement.action" class="text-xs text-orange-600 mt-2 font-medium">
                  💡 {{ improvement.action }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下期目标 -->
      <div class="mb-8">
        <h3 class="font-semibold text-gray-800 mb-4">下期目标</h3>
        <div class="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ report.nextPeriodGoals.newWords }}</div>
              <div class="text-sm text-purple-700">新增单词目标</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ report.nextPeriodGoals.reviewSessions }}</div>
              <div class="text-sm text-purple-700">复习会话目标</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ (report.nextPeriodGoals.targetAccuracy * 100).toFixed(0) }}%</div>
              <div class="text-sm text-purple-700">目标正确率</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ formatDuration(report.nextPeriodGoals.studyTime) }}</div>
              <div class="text-sm text-purple-700">学习时长目标</div>
            </div>
          </div>
          <div class="mt-4 text-center text-purple-700">
            {{ report.nextPeriodGoals.motivation }}
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center justify-center space-x-4">
        <button
          @click="shareReport"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
          </svg>
          分享报告
        </button>
        <button
          @click="exportReport"
          class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          导出PDF
        </button>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <p class="text-gray-500 mb-4">还没有生成学习报告</p>
      <button
        @click="generateReport"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        生成第一份报告
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnalyticsStore } from '@/store'
import type { ProgressReport } from '@/types'

// Store
const analyticsStore = useAnalyticsStore()

// 状态
const generating = ref(false)
const reportPeriod = ref('month')
const report = ref<ProgressReport | null>(null)

// 题型标签映射
const questionTypeLabels = {
  recognition: '单词识别',
  recall: '单词回忆',
  context: '语境理解',
  production: '单词造句'
}

// 方法
const getReportPeriodLabel = (period: string): string => {
  const labels = {
    week: '本周',
    month: '本月',
    quarter: '本季度',
    year: '本年度'
  }
  return labels[period as keyof typeof labels] || period
}

const getTrendClass = (trend: number): string => {
  if (trend > 0) return 'bg-green-100 text-green-800'
  if (trend < 0) return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

const formatTrend = (trend: number): string => {
  if (trend === 0) return '持平'
  const sign = trend > 0 ? '+' : ''
  return `${sign}${trend.toFixed(1)}%`
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`
}

const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`
}

const getQuestionTypeLabel = (type: string): string => {
  return questionTypeLabels[type as keyof typeof questionTypeLabels] || type
}

const generateReport = async () => {
  generating.value = true

  try {
    // 模拟生成报告数据
    const mockReport: ProgressReport = {
      period: reportPeriod.value,
      startDate: getStartDate(reportPeriod.value),
      endDate: new Date().toISOString(),
      summary: generateSummary(reportPeriod.value),
      comparison: {
        wordsAdded: { current: 45, previous: 38, trend: 18.4 },
        reviewSessions: { current: 23, previous: 20, trend: 15.0 },
        averageAccuracy: { current: 0.842, previous: 0.795, trend: 5.9 },
        studyTime: { current: 1260, previous: 1080, trend: 16.7 }
      },
      masteryProgress: {
        improved: [
          {
            wordId: 1,
            word: 'elaborate',
            meaning: '详细阐述',
            previousLevel: 2.3,
            currentLevel: 3.8,
            masteryImprovement: 1.5
          },
          {
            wordId: 2,
            word: 'substantial',
            meaning: '大量的，实质的',
            previousLevel: 1.8,
            currentLevel: 3.2,
            masteryImprovement: 1.4
          }
        ],
        declined: [
          {
            wordId: 3,
            word: 'intricate',
            meaning: '复杂的，错综的',
            previousLevel: 3.5,
            currentLevel: 2.8,
            masteryImprovement: -0.7
          }
        ]
      },
      patterns: {
        activeTimeSlots: [
          { hour: 9, sessions: 12, averagePerformance: 0.89 },
          { hour: 19, sessions: 8, averagePerformance: 0.76 },
          { hour: 14, sessions: 6, averagePerformance: 0.82 }
        ],
        bestQuestionTypes: [
          { type: 'recognition', accuracy: 0.92, totalQuestions: 145 },
          { type: 'context', accuracy: 0.87, totalQuestions: 89 },
          { type: 'recall', accuracy: 0.73, totalQuestions: 112 }
        ],
        consistency: {
          streakDays: 12,
          studyDays: 18,
          averageDailyTime: 42
        }
      },
      recommendations: {
        strengths: [
          {
            title: '单词识别能力强',
            description: '在识别类题目中表现优异，正确率达到92%'
          },
          {
            title: '学习时间稳定',
            description: '能够保持规律的学习节奏，连续学习12天'
          }
        ],
        improvements: [
          {
            title: '加强单词回忆练习',
            description: '回忆类题目正确率相对较低，建议增加练习',
            action: '每天增加5-10道回忆类题目'
          },
          {
            title: '复习难词频率',
            description: '部分复杂单词掌握度有所下降',
            action: '将intricate等词加入重点复习列表'
          }
        ]
      },
      nextPeriodGoals: {
        newWords: 50,
        reviewSessions: 25,
        targetAccuracy: 0.85,
        studyTime: 1400,
        motivation: '继续保持学习热情，向着更高的目标前进！'
      }
    }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    report.value = mockReport

  } catch (error) {
    console.error('Generate report failed:', error)
    alert('生成报告失败，请重试')
  } finally {
    generating.value = false
  }
}

const getStartDate = (period: string): string => {
  const now = new Date()
  const start = new Date(now)

  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 7)
      break
    case 'month':
      start.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      start.setMonth(now.getMonth() - 3)
      break
    case 'year':
      start.setFullYear(now.getFullYear() - 1)
      break
  }

  return start.toISOString()
}

const generateSummary = (period: string): string => {
  const periodLabels = {
    week: '本周',
    month: '本月',
    quarter: '本季度',
    year: '本年度'
  }

  return `${periodLabels[period as keyof typeof periodLabels]}你的学习表现非常出色！共录入了45个新单词，完成了23次复习会话，平均正确率达到84.2%。你在单词识别方面表现特别突出，同时学习时间保持稳定增长。建议继续保持当前的学习节奏，并适当增加单词回忆类练习。`
}

const shareReport = () => {
  // 实现分享功能
  console.log('Share report')
  alert('分享功能开发中...')
}

const exportReport = async () => {
  try {
    // 调用导出API
    const exportUrl = await analyticsStore.exportAnalytics('pdf', {
      period: reportPeriod.value,
      includeReport: true
    })

    if (exportUrl) {
      const link = document.createElement('a')
      link.href = exportUrl
      link.download = `learning-report-${reportPeriod.value}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  } catch (error) {
    console.error('Export report failed:', error)
    alert('导出失败，请重试')
  }
}

// 初始化
onMounted(() => {
  generateReport()
})
</script>