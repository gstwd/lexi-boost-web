<template>
  <div class="line-chart-container" :style="{ width: width, height: height }">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions
} from 'chart.js'

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  data: ChartData<'line'>
  options?: ChartOptions<'line'>
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  options: () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  })
})

const chartRef = ref<HTMLCanvasElement>()
let chartInstance: ChartJS<'line'> | null = null

const createChart = () => {
  if (!chartRef.value) return

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  try {
    chartInstance = new ChartJS(ctx, {
      type: 'line',
      data: props.data,
      options: props.options
    })
  } catch (error) {
    console.error('Failed to create line chart:', error)
  }
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
  try {
    createChart()
  } catch (error) {
    console.error('Failed to mount LineChart:', error)
  }
})

onUnmounted(() => {
  destroyChart()
})
</script>

<style scoped>
.line-chart-container {
  position: relative;
}
</style>