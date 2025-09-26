/**
 * 图表配置工具类
 * 提供常用的图表数据格式化和配置生成功能
 */

import type { ChartData, ChartOptions } from 'chart.js'

export interface LearningTrendData {
  date: string
  wordsAdded: number
  reviewsCompleted: number
  accuracy: number
}

export interface MasteryDistributionData {
  mastered: number
  learning: number
  struggling: number
  notReviewed: number
}

export interface DifficultyData {
  difficulty: number
  count: number
}

export interface StudyTimeData {
  hour: number
  minutes: number
  performance: number
}

export class ChartUtils {
  // 颜色配置
  private static colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    indigo: '#6366F1',
    pink: '#EC4899',
    gray: '#6B7280'
  }

  private static backgroundColors = [
    'rgba(59, 130, 246, 0.8)',  // blue
    'rgba(16, 185, 129, 0.8)',  // green
    'rgba(245, 158, 11, 0.8)',  // yellow
    'rgba(239, 68, 68, 0.8)',   // red
    'rgba(139, 92, 246, 0.8)',  // purple
    'rgba(99, 102, 241, 0.8)',  // indigo
    'rgba(236, 72, 153, 0.8)',  // pink
    'rgba(107, 114, 128, 0.8)'  // gray
  ]

  private static borderColors = [
    'rgba(59, 130, 246, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(245, 158, 11, 1)',
    'rgba(239, 68, 68, 1)',
    'rgba(139, 92, 246, 1)',
    'rgba(99, 102, 241, 1)',
    'rgba(236, 72, 153, 1)',
    'rgba(107, 114, 128, 1)'
  ]

  /**
   * 生成学习趋势线性图配置
   */
  static generateLearningTrendChart(data: LearningTrendData[]): ChartData<'line'> {
    const labels = data.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    })

    return {
      labels,
      datasets: [
        {
          label: '新增单词',
          data: data.map(d => d.wordsAdded),
          borderColor: this.colors.primary,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        },
        {
          label: '复习次数',
          data: data.map(d => d.reviewsCompleted),
          borderColor: this.colors.secondary,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        },
        {
          label: '正确率 (%)',
          data: data.map(d => d.accuracy * 100),
          borderColor: this.colors.warning,
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    }
  }

  /**
   * 生成学习趋势图表选项
   */
  static getLearningTrendOptions(): ChartOptions<'line'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '学习趋势',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || ''
              if (label) {
                label += ': '
              }
              if (context.datasetIndex === 2) { // 正确率
                label += context.parsed.y.toFixed(1) + '%'
              } else {
                label += context.parsed.y
              }
              return label
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: '日期'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: '数量'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: '正确率 (%)'
          },
          grid: {
            drawOnChartArea: false
          },
          min: 0,
          max: 100
        }
      }
    }
  }

  /**
   * 生成掌握度分布饼图配置
   */
  static generateMasteryDistributionChart(data: MasteryDistributionData): ChartData<'pie'> {
    return {
      labels: ['已掌握', '学习中', '需加强', '未复习'],
      datasets: [
        {
          data: [data.mastered, data.learning, data.struggling, data.notReviewed],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',  // 绿色 - 已掌握
            'rgba(59, 130, 246, 0.8)',  // 蓝色 - 学习中
            'rgba(239, 68, 68, 0.8)',   // 红色 - 需加强
            'rgba(107, 114, 128, 0.8)'  // 灰色 - 未复习
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(107, 114, 128, 1)'
          ],
          borderWidth: 2
        }
      ]
    }
  }

  /**
   * 生成难度分布柱状图配置
   */
  static generateDifficultyDistributionChart(data: DifficultyData[]): ChartData<'bar'> {
    const labels = data.map(d => {
      const levels = ['', '简单', '较简单', '中等', '较难', '困难']
      return levels[d.difficulty] || `难度${d.difficulty}`
    })

    return {
      labels,
      datasets: [
        {
          label: '单词数量',
          data: data.map(d => d.count),
          backgroundColor: this.backgroundColors.slice(0, data.length),
          borderColor: this.borderColors.slice(0, data.length),
          borderWidth: 1
        }
      ]
    }
  }

  /**
   * 生成学习时间分布柱状图配置
   */
  static generateStudyTimeChart(data: StudyTimeData[]): ChartData<'bar'> {
    const labels = data.map(d => `${d.hour}:00`)

    return {
      labels,
      datasets: [
        {
          label: '学习时间 (分钟)',
          data: data.map(d => d.minutes),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: '学习效果 (%)',
          data: data.map(d => d.performance * 100),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    }
  }

  /**
   * 生成学习时间图表选项
   */
  static getStudyTimeOptions(): ChartOptions<'bar'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '每日学习时间分布',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: '时间'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: '学习时间 (分钟)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: '学习效果 (%)'
          },
          grid: {
            drawOnChartArea: false
          },
          min: 0,
          max: 100
        }
      }
    }
  }

  /**
   * 生成复习间隔分布图
   */
  static generateReviewIntervalChart(intervals: number[]): ChartData<'bar'> {
    // 将间隔分组
    const groups = [
      { label: '当天', min: 0, max: 1 },
      { label: '1-3天', min: 1, max: 3 },
      { label: '4-7天', min: 4, max: 7 },
      { label: '1-2周', min: 8, max: 14 },
      { label: '2-4周', min: 15, max: 28 },
      { label: '1个月+', min: 29, max: Infinity }
    ]

    const data = groups.map(group => {
      return intervals.filter(interval => interval >= group.min && interval < group.max).length
    })

    return {
      labels: groups.map(g => g.label),
      datasets: [
        {
          label: '单词数量',
          data: data,
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 1
        }
      ]
    }
  }

  /**
   * 生成进度对比雷达图数据
   */
  static generateProgressRadarChart(data: {
    vocabulary: number
    accuracy: number
    consistency: number
    speed: number
    retention: number
  }): ChartData<'radar'> {
    return {
      labels: ['词汇量', '准确率', '一致性', '反应速度', '记忆保持'],
      datasets: [
        {
          label: '当前水平',
          data: [
            data.vocabulary,
            data.accuracy * 100,
            data.consistency * 100,
            (5 - data.speed) * 20, // 速度越快分数越高
            data.retention * 100
          ],
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
        }
      ]
    }
  }

  /**
   * 格式化图表数据的辅助方法
   */
  static formatChartData<T>(
    data: T[],
    labelExtractor: (item: T) => string,
    valueExtractor: (item: T) => number,
    options?: {
      backgroundColor?: string
      borderColor?: string
      label?: string
    }
  ): ChartData<'bar'> {
    return {
      labels: data.map(labelExtractor),
      datasets: [
        {
          label: options?.label || '数据',
          data: data.map(valueExtractor),
          backgroundColor: options?.backgroundColor || this.colors.primary,
          borderColor: options?.borderColor || this.colors.primary,
          borderWidth: 1
        }
      ]
    }
  }

  /**
   * 生成默认的响应式图表选项
   */
  static getDefaultOptions(): ChartOptions<any> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  }
}