/**
 * 图表配置工具类
 * 提供常用的图表数据格式化和配置生成功能 (ECharts)
 */

import type { EChartsOption } from 'echarts'

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

  private static colorPalette = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#6366F1', // indigo
    '#EC4899', // pink
    '#6B7280' // gray
  ]

  /**
   * 生成学习趋势线性图配置
   */
  static generateLearningTrendChart(data: LearningTrendData[]): EChartsOption {
    const categories = data.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    })

    return {
      title: {
        text: '学习趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['新增单词', '复习次数', '正确率 (%)'],
        top: '8%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: categories,
        name: '日期',
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: [
        {
          type: 'value',
          name: '数量',
          position: 'left',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: '正确率 (%)',
          position: 'right',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ],
      series: [
        {
          name: '新增单词',
          type: 'line',
          data: data.map(d => d.wordsAdded),
          smooth: true,
          lineStyle: {
            color: this.colors.primary,
            width: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(59, 130, 246, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(59, 130, 246, 0.1)'
                }
              ]
            }
          }
        },
        {
          name: '复习次数',
          type: 'line',
          data: data.map(d => d.reviewsCompleted),
          smooth: true,
          lineStyle: {
            color: this.colors.secondary,
            width: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(16, 185, 129, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(16, 185, 129, 0.1)'
                }
              ]
            }
          }
        },
        {
          name: '正确率 (%)',
          type: 'line',
          yAxisIndex: 1,
          data: data.map(d => d.accuracy * 100),
          smooth: true,
          lineStyle: {
            color: this.colors.warning,
            width: 2
          }
        }
      ],
      animation: true,
      animationDuration: 1000
    }
  }

  /**
   * 生成学习趋势图表选项 (已集成到上面的方法中)
   */
  static getLearningTrendOptions(): EChartsOption {
    return {
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
      legend: {
        top: '5%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    }
  }

  /**
   * 生成掌握度分布饼图配置
   */
  static generateMasteryDistributionChart(data: MasteryDistributionData): EChartsOption {
    const pieData = [
      { value: data.mastered, name: '已掌握', itemStyle: { color: '#10B981' } },
      { value: data.learning, name: '学习中', itemStyle: { color: '#3B82F6' } },
      { value: data.struggling, name: '需加强', itemStyle: { color: '#EF4444' } },
      { value: data.notReviewed, name: '未复习', itemStyle: { color: '#6B7280' } }
    ]

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        bottom: '5%',
        left: 'center'
      },
      series: [
        {
          name: '掌握度分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: pieData,
          animationType: 'expansion',
          animationDuration: 1000
        }
      ]
    }
  }

  /**
   * 生成难度分布柱状图配置
   */
  static generateDifficultyDistributionChart(data: DifficultyData[]): EChartsOption {
    const categories = data.map(d => {
      const levels = ['', '简单', '较简单', '中等', '较难', '困难']
      return levels[d.difficulty] || `难度${d.difficulty}`
    })

    const barData = data.map((d, index) => ({
      value: d.count,
      itemStyle: {
        color: this.colorPalette[index % this.colorPalette.length]
      }
    }))

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: '单词数量'
      },
      series: [
        {
          name: '单词数量',
          type: 'bar',
          barWidth: '60%',
          data: barData,
          animationDelay: (idx: number) => idx * 100
        }
      ],
      animation: true,
      animationDuration: 1000
    }
  }

  /**
   * 生成学习时间分布柱状图配置
   */
  static generateStudyTimeChart(data: StudyTimeData[]): EChartsOption {
    const categories = data.map(d => `${d.hour}:00`)

    return {
      title: {
        text: '每日学习时间分布',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      legend: {
        data: ['学习时间 (分钟)', '学习效果 (%)'],
        top: '8%'
      },
      xAxis: {
        type: 'category',
        data: categories,
        name: '时间',
        nameLocation: 'middle',
        nameGap: 30,
        axisPointer: {
          type: 'shadow'
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '学习时间 (分钟)',
          position: 'left',
          axisLabel: {
            formatter: '{value} min'
          }
        },
        {
          type: 'value',
          name: '学习效果 (%)',
          position: 'right',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ],
      series: [
        {
          name: '学习时间 (分钟)',
          type: 'bar',
          data: data.map(d => d.minutes),
          itemStyle: {
            color: this.colors.primary
          },
          animationDelay: (idx: number) => idx * 100
        },
        {
          name: '学习效果 (%)',
          type: 'line',
          yAxisIndex: 1,
          data: data.map(d => d.performance * 100),
          lineStyle: {
            color: this.colors.secondary,
            width: 2
          },
          symbol: 'circle',
          symbolSize: 6
        }
      ],
      animation: true,
      animationDuration: 1000
    }
  }

  /**
   * 生成学习时间图表选项 (已集成到上面的方法中)
   */
  static getStudyTimeOptions(): EChartsOption {
    return {
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
      legend: {
        top: '5%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    }
  }

  /**
   * 生成复习间隔分布图
   */
  static generateReviewIntervalChart(intervals: number[]): EChartsOption {
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
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: groups.map(g => g.label),
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: '单词数量'
      },
      series: [
        {
          name: '单词数量',
          type: 'bar',
          barWidth: '60%',
          data,
          itemStyle: {
            color: this.colors.purple
          },
          animationDelay: (idx: number) => idx * 100
        }
      ],
      animation: true,
      animationDuration: 1000
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
  }): EChartsOption {
    return {
      title: {
        text: '学习能力雷达图',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: ['当前水平'],
        bottom: '10%'
      },
      radar: {
        indicator: [
          { name: '词汇量', max: 100 },
          { name: '准确率', max: 100 },
          { name: '一致性', max: 100 },
          { name: '反应速度', max: 100 },
          { name: '记忆保持', max: 100 }
        ],
        radius: '60%'
      },
      series: [
        {
          name: '学习能力',
          type: 'radar',
          data: [
            {
              value: [
                data.vocabulary,
                data.accuracy * 100,
                data.consistency * 100,
                (5 - data.speed) * 20,
                data.retention * 100
              ],
              name: '当前水平',
              areaStyle: {
                color: 'rgba(59, 130, 246, 0.2)'
              },
              lineStyle: {
                color: this.colors.primary
              },
              itemStyle: {
                color: this.colors.primary
              }
            }
          ],
          animationDuration: 1000
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
      color?: string
      label?: string
      chartType?: 'bar' | 'line' | 'pie'
    }
  ): EChartsOption {
    const categories = data.map(labelExtractor)
    const values = data.map(valueExtractor)
    const chartType = options?.chartType || 'bar'
    const color = options?.color || this.colors.primary

    if (chartType === 'pie') {
      return {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [
          {
            name: options?.label || '数据',
            type: 'pie',
            radius: '50%',
            data: categories.map((name, index) => ({
              value: values[index],
              name,
              itemStyle: {
                color: this.colorPalette[index % this.colorPalette.length]
              }
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    }

    return {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: categories
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: options?.label || '数据',
          type: chartType,
          data: values,
          itemStyle: {
            color
          },
          smooth: chartType === 'line'
        }
      ]
    }
  }

  /**
   * 生成默认的响应式图表选项
   */
  static getDefaultOptions(): EChartsOption {
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        textStyle: {
          color: 'white'
        }
      },
      legend: {
        top: '5%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      animation: true,
      animationDuration: 1000
    }
  }

  /**
   * 获取默认的ECharts主题配置
   */
  static getThemeConfig() {
    return {
      color: this.colorPalette,
      backgroundColor: 'transparent',
      textStyle: {},
      title: {
        textStyle: {
          color: '#333'
        },
        subtextStyle: {
          color: '#aaa'
        }
      },
      line: {
        itemStyle: {
          borderWidth: 2
        },
        lineStyle: {
          width: 2
        },
        symbolSize: 6,
        symbol: 'circle',
        smooth: false
      },
      radar: {
        itemStyle: {
          borderWidth: 2
        },
        lineStyle: {
          width: 2
        },
        symbolSize: 6,
        symbol: 'circle',
        smooth: false
      },
      bar: {
        itemStyle: {
          barBorderWidth: 0,
          barBorderColor: '#ccc'
        }
      },
      pie: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      scatter: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      boxplot: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      parallel: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      sankey: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      funnel: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      gauge: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      candlestick: {
        itemStyle: {
          color: '#fd1050',
          color0: '#0cf49a',
          borderColor: '#fd1050',
          borderColor0: '#0cf49a',
          borderWidth: 1
        }
      },
      graph: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        },
        lineStyle: {
          width: 1,
          color: '#aaa'
        },
        symbolSize: 6,
        symbol: 'circle',
        smooth: false,
        color: this.colorPalette,
        label: {
          color: '#eee'
        }
      },
      map: {
        itemStyle: {
          areaColor: '#eee',
          borderColor: '#444',
          borderWidth: 0.5
        },
        label: {
          color: '#000'
        },
        emphasis: {
          itemStyle: {
            areaColor: 'rgba(255,215,0,0.8)',
            borderColor: '#444',
            borderWidth: 1
          },
          label: {
            color: 'rgb(100,0,0)'
          }
        }
      },
      geo: {
        itemStyle: {
          areaColor: '#eee',
          borderColor: '#444',
          borderWidth: 0.5
        },
        label: {
          color: '#000'
        },
        emphasis: {
          itemStyle: {
            areaColor: 'rgba(255,215,0,0.8)',
            borderColor: '#444',
            borderWidth: 1
          },
          label: {
            color: 'rgb(100,0,0)'
          }
        }
      },
      categoryAxis: {
        axisLine: {
          show: true,
          lineStyle: {
            color: '#6E7079'
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#6E7079'
          }
        },
        axisLabel: {
          show: true,
          color: '#6E7079'
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: ['#E0E6F1']
          }
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: ['rgba(250,250,250,0.2)', 'rgba(210,219,238,0.2)']
          }
        }
      },
      valueAxis: {
        axisLine: {
          show: false,
          lineStyle: {
            color: '#6E7079'
          }
        },
        axisTick: {
          show: false,
          lineStyle: {
            color: '#6E7079'
          }
        },
        axisLabel: {
          show: true,
          color: '#6E7079'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#E0E6F1']
          }
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: ['rgba(250,250,250,0.2)', 'rgba(210,219,238,0.2)']
          }
        }
      },
      logAxis: {
        axisLine: {
          show: false,
          lineStyle: {
            color: '#6E7079'
          }
        },
        axisTick: {
          show: false,
          lineStyle: {
            color: '#6E7079'
          }
        },
        axisLabel: {
          show: true,
          color: '#6E7079'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#E0E6F1']
          }
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: ['rgba(250,250,250,0.2)', 'rgba(210,219,238,0.2)']
          }
        }
      },
      timeAxis: {
        axisLine: {
          show: true,
          lineStyle: {
            color: '#6E7079'
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#6E7079'
          }
        },
        axisLabel: {
          show: true,
          color: '#6E7079'
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: ['#E0E6F1']
          }
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: ['rgba(250,250,250,0.2)', 'rgba(210,219,238,0.2)']
          }
        }
      },
      toolbox: {
        iconStyle: {
          borderColor: '#999999'
        },
        emphasis: {
          iconStyle: {
            borderColor: '#666666'
          }
        }
      },
      legend: {
        textStyle: {
          color: '#333333'
        }
      },
      tooltip: {
        axisPointer: {
          lineStyle: {
            color: '#cccccc',
            width: 1
          },
          crossStyle: {
            color: '#cccccc',
            width: 1
          }
        }
      },
      timeline: {
        lineStyle: {
          color: '#DAE1F5',
          width: 2
        },
        itemStyle: {
          color: '#A4B1D7',
          borderWidth: 1
        },
        controlStyle: {
          color: '#A4B1D7',
          borderColor: '#A4B1D7',
          borderWidth: 1
        },
        checkpointStyle: {
          color: '#316bf3',
          borderColor: '#ffffff',
          borderWidth: 2
        },
        label: {
          color: '#A4B1D7'
        },
        emphasis: {
          itemStyle: {
            color: '#FFF'
          },
          controlStyle: {
            color: '#A4B1D7',
            borderColor: '#A4B1D7',
            borderWidth: 1
          },
          label: {
            color: '#A4B1D7'
          }
        }
      },
      visualMap: {
        color: ['#bf444c', '#d88273', '#f6efa6']
      },
      dataZoom: {
        handleSize: '100%',
        textStyle: {}
      },
      markPoint: {
        label: {
          color: '#eee'
        },
        emphasis: {
          label: {
            color: '#eee'
          }
        }
      }
    }
  }
}
