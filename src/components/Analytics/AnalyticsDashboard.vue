<template>
  <div class="analytics-dashboard bg-white rounded-lg shadow-lg p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">学习统计</h2>
      <p class="text-gray-600">查看你的学习数据和进步情况</p>
    </div>

    <!-- 时间筛选 -->
    <div class="flex flex-wrap gap-4 mb-6">
      <div class="flex items-center space-x-2">
        <label class="text-sm font-medium text-gray-700">时间范围:</label>
        <select
          v-model="selectedPeriod"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          @change="fetchData"
        >
          <option value="week">近一周</option>
          <option value="month">近一月</option>
          <option value="quarter">近三月</option>
          <option value="year">近一年</option>
        </select>
      </div>

      <div class="flex items-center space-x-2">
        <label class="text-sm font-medium text-gray-700">数据类型:</label>
        <div class="flex space-x-2">
          <label class="flex items-center">
            <input
              v-model="dataTypes"
              type="checkbox"
              value="words"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-1 text-sm">单词</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="dataTypes"
              type="checkbox"
              value="reviews"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-1 text-sm">复习</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="dataTypes"
              type="checkbox"
              value="time"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-1 text-sm">时间</span>
          </label>
        </div>
      </div>

      <button
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
        @click="exportData"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        导出数据
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
      <p class="text-gray-600">加载统计数据...</p>
    </div>

    <div v-else>
      <!-- 核心指标卡片 -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">录入单词</p>
              <p class="text-3xl font-bold">
                {{ stats?.wordsRecorded || 0 }}
              </p>
              <div class="flex items-center mt-2">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <span class="text-sm">+{{ stats?.weeklyGrowth || 0 }} 本周</span>
              </div>
            </div>
            <div class="text-blue-200">
              <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm">复习次数</p>
              <p class="text-3xl font-bold">
                {{ stats?.reviewsCompleted || 0 }}
              </p>
              <div class="flex items-center mt-2">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <span class="text-sm">+{{ stats?.weeklyGrowth || 0 }} 本周</span>
              </div>
            </div>
            <div class="text-green-200">
              <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm">平均正确率</p>
              <p class="text-3xl font-bold">{{ ((stats?.averageAccuracy || 0) * 100).toFixed(1) }}%</p>
              <div class="flex items-center mt-2">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <span class="text-sm">+{{ ((stats?.weeklyGrowth || 0) * 100).toFixed(1) }}% 本周</span>
              </div>
            </div>
            <div class="text-purple-200">
              <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-orange-100 text-sm">学习时间</p>
              <p class="text-3xl font-bold">
                {{ formatStudyTime(stats?.totalStudyTime || 0) }}
              </p>
              <div class="flex items-center mt-2">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <span class="text-sm">+{{ formatStudyTime(stats?.weeklyGrowth || 0) }} 本周</span>
              </div>
            </div>
            <div class="text-orange-200">
              <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习趋势图表 -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-800">学习趋势</h3>
          <div class="flex space-x-2">
            <button
              v-for="chartType in chartTypes"
              :key="chartType.value"
              class="px-3 py-1 text-sm rounded-lg transition-colors"
              :class="{
                'bg-blue-100 text-blue-800': selectedChartType === chartType.value,
                'text-gray-600 hover:text-gray-800': selectedChartType !== chartType.value
              }"
              @click="selectedChartType = chartType.value"
            >
              {{ chartType.label }}
            </button>
          </div>
        </div>

        <div class="bg-white border rounded-lg p-4">
          <line-chart
            v-if="
              (selectedChartType === 'words' || selectedChartType === 'reviews' || selectedChartType === 'accuracy') &&
              chartDataReady
            "
            :option="getTrendChartData(selectedChartType)"
            height="300px"
          />
          <bar-chart
            v-else-if="selectedChartType === 'time' && chartDataReady"
            :option="getTimeChartData()"
            height="300px"
          />
          <div v-else class="flex items-center justify-center h-72 text-gray-500">加载图表数据中...</div>
        </div>
      </div>

      <!-- 掌握度分析 -->
      <div class="mb-8">
        <h3 class="font-semibold text-gray-800 mb-4">单词掌握度分布</h3>
        <div class="grid md:grid-cols-2 gap-6">
          <!-- 掌握度饼图 -->
          <div class="bg-white border rounded-lg p-4">
            <pie-chart :option="getMasteryDistributionChartData()" height="280px" />
          </div>

          <!-- 掌握度统计 -->
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 bg-green-500 rounded-full" />
                <span class="font-medium text-green-800">已掌握</span>
              </div>
              <div class="text-right">
                <div class="font-bold text-green-600">
                  {{ masteryStats?.mastered || 0 }}
                </div>
                <div class="text-sm text-green-600">{{ masteryPercentage.mastered }}%</div>
              </div>
            </div>

            <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 bg-blue-500 rounded-full" />
                <span class="font-medium text-blue-800">学习中</span>
              </div>
              <div class="text-right">
                <div class="font-bold text-blue-600">
                  {{ masteryStats?.inProgress || 0 }}
                </div>
                <div class="text-sm text-blue-600">{{ masteryPercentage.inProgress }}%</div>
              </div>
            </div>

            <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 bg-red-500 rounded-full" />
                <span class="font-medium text-red-800">需加强</span>
              </div>
              <div class="text-right">
                <div class="font-bold text-red-600">
                  {{ masteryStats?.struggling || 0 }}
                </div>
                <div class="text-sm text-red-600">{{ masteryPercentage.struggling }}%</div>
              </div>
            </div>

            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 bg-gray-400 rounded-full" />
                <span class="font-medium text-gray-800">未复习</span>
              </div>
              <div class="text-right">
                <div class="font-bold text-gray-600">
                  {{
                    (masteryStats?.total || 0) -
                      (masteryStats?.mastered || 0) -
                      (masteryStats?.inProgress || 0) -
                      (masteryStats?.struggling || 0) || 0
                  }}
                </div>
                <div class="text-sm text-gray-600">{{ masteryPercentage.notReviewed }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习模式分析 -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <!-- 最佳学习时间 -->
        <div class="bg-white border rounded-lg p-6">
          <h4 class="font-semibold text-gray-800 mb-4">最佳学习时间</h4>
          <div v-if="bestStudyTime" class="text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">
              {{ formatHour(bestStudyTime.hour) }}
            </div>
            <div class="text-gray-600 mb-4">效率最高的学习时段</div>
            <div class="bg-blue-50 p-3 rounded-lg">
              <div class="text-sm text-blue-700">平均正确率: {{ (bestStudyTime.performance * 100).toFixed(1) }}%</div>
              <div class="text-sm text-blue-600">学习次数: {{ bestStudyTime.sessionCount }}</div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500">暂无足够数据分析</div>
        </div>

        <!-- 学习连续性 -->
        <div class="bg-white border rounded-lg p-6">
          <h4 class="font-semibold text-gray-800 mb-4">学习连续性</h4>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">
              {{ stats?.consistencyDays || 0 }}
            </div>
            <div class="text-gray-600 mb-4">连续学习天数</div>
            <div class="bg-green-50 p-3 rounded-lg">
              <div class="text-sm text-green-700">本月学习: {{ stats?.monthlyStudyDays?.length || 0 }} 天</div>
              <div class="text-sm text-green-600">
                目标达成: {{ (((stats?.monthlyStudyDays?.length || 0) / 30) * 100).toFixed(1) }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 个性化洞察 -->
      <div v-if="insights" class="mb-8">
        <h3 class="font-semibold text-gray-800 mb-4">个性化分析</h3>
        <div class="grid md:grid-cols-3 gap-6">
          <!-- 优势领域 -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 class="font-medium text-green-800 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              你的优势
            </h5>
            <ul class="space-y-2">
              <li v-for="strength in insights.strengths.slice(0, 3)" :key="strength" class="text-sm text-green-700">
                • {{ strength }}
              </li>
            </ul>
          </div>

          <!-- 改进建议 -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 class="font-medium text-yellow-800 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              需要改进
            </h5>
            <ul class="space-y-2">
              <li v-for="weakness in insights.weaknesses.slice(0, 3)" :key="weakness" class="text-sm text-yellow-700">
                • {{ weakness }}
              </li>
            </ul>
          </div>

          <!-- 学习建议 -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 class="font-medium text-blue-800 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              学习建议
            </h5>
            <ul class="space-y-2">
              <li v-for="rec in highPriorityRecommendations.slice(0, 3)" :key="rec.title" class="text-sm text-blue-700">
                • {{ rec.title }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 成就徽章 -->
      <div v-if="achievements && achievements.length > 0" class="mb-8">
        <h3 class="font-semibold text-gray-800 mb-4">最新成就</h3>
        <div class="flex flex-wrap gap-4">
          <div
            v-for="achievement in achievements.slice(0, 6)"
            :key="achievement.title"
            class="flex items-center space-x-3 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4"
          >
            <div class="text-2xl">
              {{ achievement.icon }}
            </div>
            <div>
              <div class="font-medium text-yellow-800">
                {{ achievement.title }}
              </div>
              <div class="text-sm text-yellow-600">
                {{ achievement.description }}
              </div>
              <div class="text-xs text-yellow-500">
                {{ formatDate(achievement.unlockedAt) }}
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
import { useAnalyticsStore } from '@/store'
import LineChart from '@/components/Charts/LineChart.vue'
import PieChart from '@/components/Charts/PieChart.vue'
import BarChart from '@/components/Charts/BarChart.vue'
import { ChartUtils } from '@/utils/chartUtils'

// Store
const analyticsStore = useAnalyticsStore()

// 状态
const loading = ref(false)
const selectedPeriod = ref('month')
const selectedChartType = ref('words')
const dataTypes = ref(['words', 'reviews', 'time'])

// 图表类型选项
const chartTypes = [
  { value: 'words', label: '单词录入' },
  { value: 'reviews', label: '复习次数' },
  { value: 'accuracy', label: '正确率' },
  { value: 'time', label: '学习时间' }
]

// Computed
const stats = computed(() => analyticsStore.stats)
const masteryStats = computed(() => analyticsStore.masteryDistribution)
const bestStudyTime = computed(() => analyticsStore.bestStudyTime)
const insights = computed(() => analyticsStore.personalizedInsights)
const achievements = computed(() => insights.value?.achievements || [])
const highPriorityRecommendations = computed(() => analyticsStore.highPriorityRecommendations)

const masteryPercentage = computed(() => {
  const total = masteryStats.value?.total || 1
  return {
    mastered: (((masteryStats.value?.mastered || 0) / total) * 100).toFixed(1),
    inProgress: (((masteryStats.value?.inProgress || 0) / total) * 100).toFixed(1),
    struggling: (((masteryStats.value?.struggling || 0) / total) * 100).toFixed(1),
    notReviewed: (
      ((total -
        (masteryStats.value?.mastered || 0) -
        (masteryStats.value?.inProgress || 0) -
        (masteryStats.value?.struggling || 0)) /
        total) *
      100
    ).toFixed(1)
  }
})

const chartDataReady = computed(() => {
  return !loading.value && selectedPeriod.value && selectedChartType.value
})

// 方法
const formatStudyTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h${remainingMinutes}m` : `${hours}h`
}

const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const fetchData = async () => {
  loading.value = true

  try {
    const filters = {
      period: selectedPeriod.value as any,
      includeTypes: dataTypes.value
    }

    // 使用 Promise.allSettled 避免单个请求失败导致整体失败
    const results = await Promise.allSettled([
      analyticsStore.fetchLearningStats?.(filters) || Promise.resolve(),
      analyticsStore.fetchHistoricalStats?.(selectedPeriod.value as any) || Promise.resolve(),
      analyticsStore.fetchMasteryProgress?.() || Promise.resolve(),
      analyticsStore.fetchLearningPatterns?.() || Promise.resolve(),
      analyticsStore.fetchPersonalizedInsights?.() || Promise.resolve()
    ])

    // 检查哪些请求失败了
    const failedRequests = results.filter(result => result.status === 'rejected')
    if (failedRequests.length > 0) {
      console.warn(`${failedRequests.length} analytics requests failed:`, failedRequests)
    }
  } catch (error) {
    console.error('Fetch analytics data failed:', error)
  } finally {
    loading.value = false
  }
}

const exportData = async () => {
  try {
    const format = 'csv' // 可以让用户选择
    const filters = {
      period: selectedPeriod.value as any,
      includeTypes: dataTypes.value
    }

    // 检查 exportAnalytics 方法是否存在
    if (!analyticsStore.exportAnalytics) {
      console.warn('Export analytics method not available')
      alert('导出功能暂时不可用')
      return
    }

    const exportResult = await analyticsStore.exportAnalytics(format, filters)
    const exportUrl = typeof exportResult === 'string' ? exportResult : exportResult?.downloadUrl
    if (exportUrl) {
      // 触发下载
      const link = document.createElement('a')
      link.href = exportUrl
      link.download = `learning-analytics-${selectedPeriod.value}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  } catch (error) {
    console.error('Export data failed:', error)
    alert('导出失败，请重试')
  }
}

// Chart data generation methods
const getTrendChartData = (type: string) => {
  try {
    const sampleData = generateSampleTrendData()

    if (!sampleData || sampleData.length === 0) {
      console.warn('No sample data generated for trend chart')
      return { labels: [], datasets: [] }
    }

    if (type === 'words' || type === 'reviews') {
      return ChartUtils.generateLearningTrendChart(sampleData)
    } else if (type === 'accuracy') {
      const categories = sampleData.map(d => {
        const date = new Date(d.date)
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
      })

      return {
        tooltip: {
          trigger: 'axis' as const
        },
        xAxis: {
          type: 'category' as const,
          data: categories,
          name: '日期',
          nameLocation: 'middle' as const,
          nameGap: 30
        },
        yAxis: {
          type: 'value' as const,
          name: '正确率 (%)',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            name: '正确率',
            type: 'line' as const,
            data: sampleData.map(d => d.accuracy * 100),
            smooth: true,
            lineStyle: {
              color: '#F59E0B',
              width: 2
            },
            areaStyle: {
              color: {
                type: 'linear' as const,
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(245, 158, 11, 0.3)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(245, 158, 11, 0.1)'
                  }
                ]
              }
            }
          }
        ],
        animation: true,
        animationDuration: 1000
      }
    }
    return {}
  } catch (error) {
    console.error('Error generating trend chart data:', error)
    return {}
  }
}

const getTimeChartData = () => {
  try {
    const sampleTimeData = [
      { hour: 8, minutes: 25, performance: 0.82 },
      { hour: 9, minutes: 35, performance: 0.88 },
      { hour: 10, minutes: 18, performance: 0.75 },
      { hour: 14, minutes: 22, performance: 0.71 },
      { hour: 19, minutes: 45, performance: 0.85 },
      { hour: 20, minutes: 38, performance: 0.89 },
      { hour: 21, minutes: 28, performance: 0.86 }
    ]
    return ChartUtils.generateStudyTimeChart(sampleTimeData)
  } catch (error) {
    console.error('Error generating time chart data:', error)
    return {}
  }
}

const getMasteryDistributionChartData = () => {
  try {
    const masteryData = {
      mastered: masteryStats.value?.mastered || 89,
      learning: masteryStats.value?.inProgress || 45,
      struggling: masteryStats.value?.struggling || 23,
      notReviewed:
        (masteryStats.value?.total || 169) -
          (masteryStats.value?.mastered || 89) -
          (masteryStats.value?.inProgress || 45) -
          (masteryStats.value?.struggling || 23) || 12
    }
    return ChartUtils.generateMasteryDistributionChart(masteryData)
  } catch (error) {
    console.error('Error generating mastery distribution chart data:', error)
    return {}
  }
}

const generateSampleTrendData = () => {
  // Generate sample data based on the current period and type
  const days =
    selectedPeriod.value === 'week'
      ? 7
      : selectedPeriod.value === 'month'
        ? 30
        : selectedPeriod.value === 'quarter'
          ? 90
          : 365

  const today = new Date()
  const data = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split('T')[0],
      wordsAdded: Math.floor(Math.random() * 10) + 1,
      reviewsCompleted: Math.floor(Math.random() * 15) + 5,
      accuracy: 0.7 + Math.random() * 0.25 // 70% to 95%
    })
  }

  return data
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>
