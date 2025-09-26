<template>
  <div class="pie-chart-container" :style="{ width: width, height: height }">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions
} from 'chart.js'

// 注册Chart.js组件
ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  data: ChartData<'pie'>
  options?: ChartOptions<'pie'>
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '300px',
  options: () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = (context.dataset.data as number[]).reduce((sum, val) => sum + val, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    }
  })
})

const chartRef = ref<HTMLCanvasElement>()
let chartInstance: ChartJS<'pie'> | null = null

const createChart = () => {
  if (!chartRef.value) return

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  chartInstance = new ChartJS(ctx, {
    type: 'pie',
    data: props.data,
    options: props.options
  })
}

const updateChart = () => {
  if (chartInstance) {
    chartInstance.data = props.data
    chartInstance.update()
  }
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

// 监听数据变化
watch(() => props.data, updateChart, { deep: true })

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  destroyChart()
})
</script>

<style scoped>
.pie-chart-container {
  position: relative;
}
</style>