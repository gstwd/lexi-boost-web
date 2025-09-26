<template>
  <div class="line-chart-container" :style="{ width: width, height: height }">
    <v-chart ref="chartRef" :option="chartOption" :theme="theme" :autoresize="true" @click="onChartClick" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'

// 注册ECharts组件
use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

interface Props {
  option: EChartsOption
  width?: string
  height?: string
  theme?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  theme: 'default'
})

const emit = defineEmits<{
  click: [params: any]
}>()

const chartRef = ref<InstanceType<typeof VChart>>()

// 合并默认配置和传入的配置
const chartOption = computed(() => {
  const defaultOption: EChartsOption = {
    animation: true,
    animationDuration: 1000,
    responsive: true,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: {
        color: 'white'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }

  // 深度合并配置
  return {
    ...defaultOption,
    ...props.option,
    tooltip: {
      ...defaultOption.tooltip,
      ...props.option.tooltip
    },
    grid: {
      ...defaultOption.grid,
      ...props.option.grid
    }
  }
})

// 监听配置变化
watch(
  () => props.option,
  () => {
    // ECharts会自动处理配置更新
  },
  { deep: true }
)

const onChartClick = (params: any) => {
  emit('click', params)
}

// 暴露图表实例方法
const getEchartsInstance = () => {
  return chartRef.value?.getEchartsInstance()
}

defineExpose({
  getEchartsInstance
})
</script>

<style scoped>
.line-chart-container {
  position: relative;
}
</style>
