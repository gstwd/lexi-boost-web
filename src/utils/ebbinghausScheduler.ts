/**
 * 艾宾浩斯遗忘曲线复习调度算法
 *
 * 基于艾宾浩斯遗忘曲线原理，实现智能的复习时间间隔调度
 * 支持个性化调整和自适应优化
 */

export interface ReviewRecord {
  wordId: number
  reviewDate: Date
  correct: boolean
  difficulty: number // 1-5，用户反馈的难度
  responseTime: number // 响应时间（秒）
  masteryLevel: number // 当前掌握度 0-5
}

export interface ScheduleParams {
  // 基础间隔系数（天）
  baseIntervals: number[]
  // 难度调整系数
  difficultyMultiplier: Record<number, number>
  // 正确率调整系数
  accuracyMultiplier: Record<string, number>
  // 最小/最大间隔（天）
  minInterval: number
  maxInterval: number
  // 个性化因子
  personalityFactor: number
}

export interface NextReview {
  wordId: number
  nextReviewDate: Date
  intervalDays: number
  confidence: number // 调度信心度 0-1
  priority: 'low' | 'medium' | 'high' | 'critical'
  reason: string
}

export class EbbinghausScheduler {
  private params: ScheduleParams

  constructor(params?: Partial<ScheduleParams>) {
    // 默认参数基于艾宾浩斯遗忘曲线
    this.params = {
      // 标准艾宾浩斯间隔：20分钟、1小时、9小时、1天、2天、6天、31天
      // 转换为天为单位，并适合长期学习
      baseIntervals: [0.01, 0.04, 0.375, 1, 2, 6, 13, 31, 90, 180],

      // 难度调整：难度越高，间隔越短
      difficultyMultiplier: {
        1: 1.3,  // 很简单，延长间隔
        2: 1.1,  // 简单
        3: 1.0,  // 中等
        4: 0.8,  // 困难，缩短间隔
        5: 0.6   // 很困难，显著缩短间隔
      },

      // 正确率调整
      accuracyMultiplier: {
        'excellent': 1.4,  // >95%
        'good': 1.2,       // 85-95%
        'fair': 1.0,       // 70-85%
        'poor': 0.7,       // 50-70%
        'failing': 0.4     // <50%
      },

      minInterval: 0.01,    // 最短14分钟
      maxInterval: 365,     // 最长1年
      personalityFactor: 1.0, // 个人学习特点调整

      ...params
    }
  }

  /**
   * 计算下次复习时间
   * @param wordId 单词ID
   * @param reviewHistory 复习历史记录
   * @param currentMasteryLevel 当前掌握度
   * @returns 下次复习安排
   */
  calculateNextReview(
    wordId: number,
    reviewHistory: ReviewRecord[],
    currentMasteryLevel: number
  ): NextReview {
    // 如果没有复习历史，使用第一个间隔
    if (reviewHistory.length === 0) {
      return this.createFirstReview(wordId)
    }

    const lastReview = reviewHistory[reviewHistory.length - 1]
    const reviewCount = reviewHistory.length
    const recentAccuracy = this.calculateRecentAccuracy(reviewHistory, 5)
    const avgDifficulty = this.calculateAverageDifficulty(reviewHistory, 3)
    const learningVelocity = this.calculateLearningVelocity(reviewHistory)

    // 确定基础间隔
    let intervalIndex = Math.min(reviewCount - 1, this.params.baseIntervals.length - 1)
    let baseInterval = this.params.baseIntervals[intervalIndex]

    // 如果上次回答错误，退回到较短的间隔
    if (!lastReview.correct) {
      intervalIndex = Math.max(0, intervalIndex - 2)
      baseInterval = this.params.baseIntervals[intervalIndex]
    }

    // 应用各种调整因子
    let adjustedInterval = baseInterval

    // 1. 难度调整
    const difficultyFactor = this.params.difficultyMultiplier[Math.round(avgDifficulty)] || 1.0
    adjustedInterval *= difficultyFactor

    // 2. 正确率调整
    const accuracyLevel = this.getAccuracyLevel(recentAccuracy)
    const accuracyFactor = this.params.accuracyMultiplier[accuracyLevel] || 1.0
    adjustedInterval *= accuracyFactor

    // 3. 掌握度调整
    const masteryFactor = this.getMasteryFactor(currentMasteryLevel)
    adjustedInterval *= masteryFactor

    // 4. 学习速度调整
    const velocityFactor = this.getVelocityFactor(learningVelocity)
    adjustedInterval *= velocityFactor

    // 5. 个性化调整
    adjustedInterval *= this.params.personalityFactor

    // 6. 时间衰减调整（考虑上次复习到现在的时间）
    const daysSinceLastReview = this.daysBetween(lastReview.reviewDate, new Date())
    const decayFactor = this.calculateDecayFactor(daysSinceLastReview, baseInterval)
    adjustedInterval *= decayFactor

    // 限制在合理范围内
    adjustedInterval = Math.max(this.params.minInterval,
                               Math.min(this.params.maxInterval, adjustedInterval))

    const nextReviewDate = new Date()
    nextReviewDate.setTime(nextReviewDate.getTime() + adjustedInterval * 24 * 60 * 60 * 1000)

    return {
      wordId,
      nextReviewDate,
      intervalDays: adjustedInterval,
      confidence: this.calculateConfidence(reviewHistory, adjustedInterval),
      priority: this.determinePriority(adjustedInterval, recentAccuracy, currentMasteryLevel),
      reason: this.generateReasonExplanation(
        baseInterval,
        adjustedInterval,
        difficultyFactor,
        accuracyFactor,
        masteryFactor
      )
    }
  }

  /**
   * 批量计算多个单词的复习安排
   */
  calculateBatchReview(
    words: Array<{
      wordId: number
      reviewHistory: ReviewRecord[]
      masteryLevel: number
    }>
  ): NextReview[] {
    return words.map(word =>
      this.calculateNextReview(word.wordId, word.reviewHistory, word.masteryLevel)
    )
  }

  /**
   * 获取今日需要复习的单词
   */
  getTodaysReviews(scheduledReviews: NextReview[], targetCount?: number): NextReview[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todaysReviews = scheduledReviews
      .filter(review => review.nextReviewDate >= today && review.nextReviewDate < tomorrow)
      .sort((a, b) => {
        // 首先按优先级排序
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (priorityDiff !== 0) return priorityDiff

        // 然后按时间排序
        return a.nextReviewDate.getTime() - b.nextReviewDate.getTime()
      })

    return targetCount ? todaysReviews.slice(0, targetCount) : todaysReviews
  }

  /**
   * 获取逾期复习的单词
   */
  getOverdueReviews(scheduledReviews: NextReview[]): NextReview[] {
    const now = new Date()
    return scheduledReviews
      .filter(review => review.nextReviewDate < now)
      .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime())
  }

  /**
   * 智能调整算法参数
   */
  optimizeParameters(
    historicalData: Array<{
      wordId: number
      reviewHistory: ReviewRecord[]
      actualRetention: number
    }>
  ): ScheduleParams {
    // 分析历史数据，优化参数
    const performanceByInterval: Record<number, { correct: number, total: number }> = {}

    historicalData.forEach(word => {
      word.reviewHistory.forEach((review, index) => {
        if (index > 0) {
          const prevReview = word.reviewHistory[index - 1]
          const interval = this.daysBetween(prevReview.reviewDate, review.reviewDate)
          const intervalKey = Math.round(interval)

          if (!performanceByInterval[intervalKey]) {
            performanceByInterval[intervalKey] = { correct: 0, total: 0 }
          }

          performanceByInterval[intervalKey].total++
          if (review.correct) {
            performanceByInterval[intervalKey].correct++
          }
        }
      })
    })

    // 基于表现数据调整基础间隔
    const optimizedIntervals = [...this.params.baseIntervals]
    const targetRetention = 0.85 // 目标保持率85%

    Object.entries(performanceByInterval).forEach(([intervalStr, stats]) => {
      const interval = parseInt(intervalStr)
      const retention = stats.correct / stats.total

      // 找到最接近的基础间隔
      let closestIndex = 0
      let minDiff = Math.abs(this.params.baseIntervals[0] - interval)

      this.params.baseIntervals.forEach((baseInterval, index) => {
        const diff = Math.abs(baseInterval - interval)
        if (diff < minDiff) {
          minDiff = diff
          closestIndex = index
        }
      })

      // 调整间隔
      if (retention < targetRetention) {
        // 保持率低，缩短间隔
        optimizedIntervals[closestIndex] *= 0.9
      } else if (retention > targetRetention + 0.1) {
        // 保持率高，延长间隔
        optimizedIntervals[closestIndex] *= 1.1
      }
    })

    return {
      ...this.params,
      baseIntervals: optimizedIntervals
    }
  }

  // 私有辅助方法

  private createFirstReview(wordId: number): NextReview {
    const nextReviewDate = new Date()
    nextReviewDate.setTime(nextReviewDate.getTime() + this.params.baseIntervals[0] * 24 * 60 * 60 * 1000)

    return {
      wordId,
      nextReviewDate,
      intervalDays: this.params.baseIntervals[0],
      confidence: 0.5,
      priority: 'medium',
      reason: '首次复习，使用标准初始间隔'
    }
  }

  private calculateRecentAccuracy(history: ReviewRecord[], recentCount: number): number {
    if (history.length === 0) return 0.5

    const recentReviews = history.slice(-recentCount)
    const correctCount = recentReviews.filter(r => r.correct).length
    return correctCount / recentReviews.length
  }

  private calculateAverageDifficulty(history: ReviewRecord[], recentCount: number): number {
    if (history.length === 0) return 3

    const recentReviews = history.slice(-recentCount)
    const totalDifficulty = recentReviews.reduce((sum, r) => sum + r.difficulty, 0)
    return totalDifficulty / recentReviews.length
  }

  private calculateLearningVelocity(history: ReviewRecord[]): number {
    if (history.length < 3) return 1.0

    // 计算掌握度提升速度
    const recent = history.slice(-3)
    const masteryImprovement = recent[recent.length - 1].masteryLevel - recent[0].masteryLevel
    const timeSpan = this.daysBetween(recent[0].reviewDate, recent[recent.length - 1].reviewDate)

    return timeSpan > 0 ? masteryImprovement / timeSpan : 1.0
  }

  private getMasteryFactor(masteryLevel: number): number {
    // 掌握度越高，间隔越长
    if (masteryLevel >= 4.5) return 1.3
    if (masteryLevel >= 3.5) return 1.1
    if (masteryLevel >= 2.5) return 1.0
    if (masteryLevel >= 1.5) return 0.8
    return 0.6
  }

  private getVelocityFactor(velocity: number): number {
    // 学习速度快的可以延长间隔
    if (velocity > 0.5) return 1.2
    if (velocity > 0.2) return 1.0
    if (velocity > -0.2) return 0.9
    return 0.7 // 掌握度下降，缩短间隔
  }

  private calculateDecayFactor(daysSinceLastReview: number, expectedInterval: number): number {
    // 如果距离上次复习时间过长，需要缩短下次间隔
    const ratio = daysSinceLastReview / expectedInterval
    if (ratio > 1.5) return 0.7 // 严重逾期
    if (ratio > 1.2) return 0.85 // 轻微逾期
    return 1.0
  }

  private getAccuracyLevel(accuracy: number): string {
    if (accuracy >= 0.95) return 'excellent'
    if (accuracy >= 0.85) return 'good'
    if (accuracy >= 0.70) return 'fair'
    if (accuracy >= 0.50) return 'poor'
    return 'failing'
  }

  private calculateConfidence(history: ReviewRecord[], intervalDays: number): number {
    // 基于历史表现和间隔长度计算信心度
    const accuracy = this.calculateRecentAccuracy(history, 5)
    const consistency = this.calculateConsistency(history)

    let confidence = (accuracy + consistency) / 2

    // 间隔越长，信心度略微降低
    if (intervalDays > 30) confidence *= 0.9
    if (intervalDays > 90) confidence *= 0.85

    return Math.max(0, Math.min(1, confidence))
  }

  private calculateConsistency(history: ReviewRecord[]): number {
    if (history.length < 3) return 0.5

    const recentAccuracies = []
    for (let i = Math.max(0, history.length - 5); i < history.length; i++) {
      const window = history.slice(Math.max(0, i - 2), i + 1)
      const windowAccuracy = window.filter(r => r.correct).length / window.length
      recentAccuracies.push(windowAccuracy)
    }

    // 计算标准差，越小越一致
    const mean = recentAccuracies.reduce((sum, acc) => sum + acc, 0) / recentAccuracies.length
    const variance = recentAccuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / recentAccuracies.length
    const stdDev = Math.sqrt(variance)

    return Math.max(0, 1 - stdDev * 2) // 标准差越小，一致性越高
  }

  private determinePriority(
    intervalDays: number,
    accuracy: number,
    masteryLevel: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    // 逾期时间长或掌握度低的优先级高
    if (intervalDays < 0 && Math.abs(intervalDays) > 7) return 'critical' // 逾期超过一周
    if (intervalDays < 0 && Math.abs(intervalDays) > 2) return 'high'     // 逾期超过两天
    if (masteryLevel < 2.0 || accuracy < 0.6) return 'high'              // 掌握度低或错误率高
    if (intervalDays < 1) return 'medium'                                 // 今日需复习
    return 'low'
  }

  private generateReasonExplanation(
    baseInterval: number,
    adjustedInterval: number,
    difficultyFactor: number,
    accuracyFactor: number,
    masteryFactor: number
  ): string {
    const adjustmentRatio = adjustedInterval / baseInterval
    let reason = `基础间隔${baseInterval.toFixed(1)}天`

    if (adjustmentRatio > 1.2) {
      reason += '，由于表现良好延长间隔'
    } else if (adjustmentRatio < 0.8) {
      reason += '，由于需要加强练习缩短间隔'
    }

    const factors = []
    if (difficultyFactor !== 1.0) {
      factors.push(difficultyFactor > 1 ? '题目简单' : '题目困难')
    }
    if (accuracyFactor !== 1.0) {
      factors.push(accuracyFactor > 1 ? '正确率高' : '正确率低')
    }
    if (masteryFactor !== 1.0) {
      factors.push(masteryFactor > 1 ? '掌握度高' : '掌握度低')
    }

    if (factors.length > 0) {
      reason += `（${factors.join('，')}）`
    }

    return reason
  }

  private daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime())
    return diffTime / (1000 * 60 * 60 * 24)
  }
}