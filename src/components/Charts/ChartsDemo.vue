<template>
  <div class="charts-demo bg-white rounded-lg shadow-lg p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">数据可视化演示</h2>
      <p class="text-gray-600">ECharts 图表库集成示例</p>
    </div>

    <div class="space-y-8">
      <!-- 学习趋势线性图 -->
      <div class="mb-8">
        <h3 class="font-semibold text-gray-800 mb-4">学习趋势</h3>
        <div class="bg-white border rounded-lg p-4">
          <LineChart
            :option="learningTrendData"
            height="300px"
          />
        </div>
      </div>

      <!-- 掌握度分布饼图 -->
      <div class="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 class="font-semibold text-gray-800 mb-4">掌握度分布</h3>
          <div class="bg-white border rounded-lg p-4">
            <PieChart
              :option="masteryDistributionData"
              height="300px"
            />
          </div>
        </div>

        <!-- 难度分布柱状图 -->
        <div>
          <h3 class="font-semibold text-gray-800 mb-4">难度分布</h3>
          <div class="bg-white border rounded-lg p-4">
            <BarChart
              :option="difficultyDistributionData"
              height="300px"
            />
          </div>
        </div>
      </div>

      <!-- 学习时间分布 -->
      <div class="mb-8">
        <h3 class="font-semibold text-gray-800 mb-4">每日学习时间分布</h3>
        <div class="bg-white border rounded-lg p-4">
          <BarChart
            :option="studyTimeData"
            height="300px"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LineChart from '@/components/Charts/LineChart.vue'
import PieChart from '@/components/Charts/PieChart.vue'
import BarChart from '@/components/Charts/BarChart.vue'
import { ChartUtils } from '@/utils/chartUtils'

// 学习趋势模拟数据
const learningTrendRawData = [
  { date: '2024-01-01', wordsAdded: 5, reviewsCompleted: 12, accuracy: 0.85 },
  { date: '2024-01-02', wordsAdded: 8, reviewsCompleted: 15, accuracy: 0.78 },
  { date: '2024-01-03', wordsAdded: 6, reviewsCompleted: 18, accuracy: 0.82 },
  { date: '2024-01-04', wordsAdded: 10, reviewsCompleted: 20, accuracy: 0.88 },
  { date: '2024-01-05', wordsAdded: 7, reviewsCompleted: 16, accuracy: 0.91 },
  { date: '2024-01-06', wordsAdded: 9, reviewsCompleted: 22, accuracy: 0.87 },
  { date: '2024-01-07', wordsAdded: 4, reviewsCompleted: 14, accuracy: 0.93 }
]

const learningTrendData = computed(() =>
  ChartUtils.generateLearningTrendChart(learningTrendRawData)
)

// 掌握度分布数据
const masteryData = {
  mastered: 89,
  learning: 45,
  struggling: 23,
  notReviewed: 12
}

const masteryDistributionData = computed(() =>
  ChartUtils.generateMasteryDistributionChart(masteryData)
)

// 难度分布数据
const difficultyData = [
  { difficulty: 1, count: 12 },
  { difficulty: 2, count: 28 },
  { difficulty: 3, count: 45 },
  { difficulty: 4, count: 32 },
  { difficulty: 5, count: 15 }
]

const difficultyDistributionData = computed(() =>
  ChartUtils.generateDifficultyDistributionChart(difficultyData)
)

// 学习时间分布数据
const studyTimeRawData = [
  { hour: 8, minutes: 25, performance: 0.82 },
  { hour: 9, minutes: 35, performance: 0.88 },
  { hour: 10, minutes: 18, performance: 0.75 },
  { hour: 14, minutes: 22, performance: 0.71 },
  { hour: 19, minutes: 45, performance: 0.85 },
  { hour: 20, minutes: 38, performance: 0.89 },
  { hour: 21, minutes: 28, performance: 0.86 }
]

const studyTimeData = computed(() =>
  ChartUtils.generateStudyTimeChart(studyTimeRawData)
)
</script>