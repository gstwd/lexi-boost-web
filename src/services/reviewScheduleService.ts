/**
 * 复习调度服务
 * 封装艾宾浩斯算法，提供高级调度功能
 */

import {
  EbbinghausScheduler,
  type ReviewRecord,
  type NextReview,
  type ScheduleParams
} from '@/utils/ebbinghausScheduler'

export interface WordScheduleData {
  wordId: number
  word: string
  meaning: string
  difficulty: number
  masteryLevel: number
  reviewHistory: ReviewRecord[]
  lastReviewDate?: Date
  currentInterval?: number
}

export interface ScheduleSession {
  sessionId: string
  sessionType: 'daily' | 'focused' | 'overdue' | 'adaptive'
  words: NextReview[]
  estimatedDuration: number
  totalWords: number
  priorityDistribution: Record<string, number>
  createdAt: Date
}

export interface ScheduleStats {
  totalWords: number
  todaysDue: number
  overdue: number
  upcomingWeek: number
  averageInterval: number
  retentionRate: number
  difficultyDistribution: Record<number, number>
}

export class ReviewScheduleService {
  private scheduler: EbbinghausScheduler
  private userPreferences: {
    dailyTarget: number
    maxSessionTime: number
    preferredDifficulty: 'mixed' | 'easy' | 'hard'
    adaptiveScheduling: boolean
  }

  constructor(params?: Partial<ScheduleParams>) {
    this.scheduler = new EbbinghausScheduler(params)
    this.userPreferences = {
      dailyTarget: 30,
      maxSessionTime: 30, // 分钟
      preferredDifficulty: 'mixed',
      adaptiveScheduling: true
    }
  }

  /**
   * 生成每日复习计划
   */
  async generateDailySchedule(allWords: WordScheduleData[]): Promise<ScheduleSession> {
    // 计算所有单词的下次复习时间
    const allSchedules = allWords.map((word) =>
      this.scheduler.calculateNextReview(word.wordId, word.reviewHistory, word.masteryLevel)
    )

    // 获取目标日期需要复习的单词
    const todaysReviews = this.scheduler.getTodaysReviews(
      allSchedules,
      this.userPreferences.dailyTarget
    )

    // 如果今日复习数量不足，添加一些提前复习的单词
    if (todaysReviews.length < this.userPreferences.dailyTarget) {
      const additionalWords = this.selectAdditionalWords(
        allSchedules,
        todaysReviews,
        this.userPreferences.dailyTarget - todaysReviews.length
      )
      todaysReviews.push(...additionalWords)
    }

    return this.createScheduleSession('daily', todaysReviews)
  }

  /**
   * 生成逾期复习计划
   */
  async generateOverdueSchedule(allWords: WordScheduleData[]): Promise<ScheduleSession> {
    const allSchedules = allWords.map((word) =>
      this.scheduler.calculateNextReview(word.wordId, word.reviewHistory, word.masteryLevel)
    )

    const overdueReviews = this.scheduler.getOverdueReviews(allSchedules)

    return this.createScheduleSession('overdue', overdueReviews)
  }

  /**
   * 生成专项强化复习计划（针对困难单词）
   */
  async generateFocusedSchedule(
    allWords: WordScheduleData[],
    focusType: 'difficult' | 'low_mastery' | 'recent_errors'
  ): Promise<ScheduleSession> {
    let filteredWords: WordScheduleData[]

    switch (focusType) {
      case 'difficult':
        filteredWords = allWords.filter((w) => w.difficulty >= 4)
        break
      case 'low_mastery':
        filteredWords = allWords.filter((w) => w.masteryLevel < 2.5)
        break
      case 'recent_errors':
        filteredWords = allWords.filter((w) => {
          const recentReviews = w.reviewHistory.slice(-3)
          return recentReviews.some((r) => !r.correct)
        })
        break
      default:
        filteredWords = allWords
    }

    const schedules = filteredWords.map((word) =>
      this.scheduler.calculateNextReview(word.wordId, word.reviewHistory, word.masteryLevel)
    )

    // 优先选择需要复习的困难单词
    const focusedReviews = schedules
      .filter((s) => s.priority === 'high' || s.priority === 'critical')
      .slice(0, 20)

    return this.createScheduleSession('focused', focusedReviews)
  }

  /**
   * 生成自适应复习计划
   */
  async generateAdaptiveSchedule(
    allWords: WordScheduleData[],
    sessionLengthMinutes: number
  ): Promise<ScheduleSession> {
    const allSchedules = allWords.map((word) =>
      this.scheduler.calculateNextReview(word.wordId, word.reviewHistory, word.masteryLevel)
    )

    // 估算每个单词复习时间
    const wordsWithEstimatedTime = allSchedules.map((schedule) => {
      const word = allWords.find((w) => w.wordId === schedule.wordId)
      const estimatedTime = this.estimateReviewTime(word!, schedule)
      return { ...schedule, estimatedTime }
    })

    // 选择最优组合填满时间
    const selectedWords = this.selectOptimalWordCombination(
      wordsWithEstimatedTime,
      sessionLengthMinutes
    )

    return this.createScheduleSession('adaptive', selectedWords)
  }

  /**
   * 获取复习统计信息
   */
  async getScheduleStats(allWords: WordScheduleData[]): Promise<ScheduleStats> {
    const allSchedules = allWords.map((word) =>
      this.scheduler.calculateNextReview(word.wordId, word.reviewHistory, word.masteryLevel)
    )

    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)

    const todaysDue = this.scheduler.getTodaysReviews(allSchedules).length
    const overdue = this.scheduler.getOverdueReviews(allSchedules).length
    const upcomingWeek = allSchedules.filter(
      (s) => s.nextReviewDate > today && s.nextReviewDate <= nextWeek
    ).length

    const intervals = allSchedules.map((s) => s.intervalDays)
    const averageInterval =
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length

    // 计算保持率
    const recentReviews = allWords.flatMap((w) => w.reviewHistory.slice(-1))
    const retentionRate =
      recentReviews.length > 0
        ? recentReviews.filter((r) => r.correct).length / recentReviews.length
        : 0

    // 难度分布
    const difficultyDistribution = allWords.reduce((dist, word) => {
      dist[word.difficulty] = (dist[word.difficulty] || 0) + 1
      return dist
    }, {} as Record<number, number>)

    return {
      totalWords: allWords.length,
      todaysDue,
      overdue,
      upcomingWeek,
      averageInterval,
      retentionRate,
      difficultyDistribution
    }
  }

  /**
   * 优化调度参数
   */
  async optimizeScheduling(allWords: WordScheduleData[]): Promise<void> {
    const historicalData = allWords.map((word) => ({
      wordId: word.wordId,
      reviewHistory: word.reviewHistory,
      actualRetention: this.calculateWordRetention(word.reviewHistory)
    }))

    const optimizedParams = this.scheduler.optimizeParameters(historicalData)
    this.scheduler = new EbbinghausScheduler(optimizedParams)
  }

  /**
   * 更新用户偏好
   */
  updatePreferences(preferences: Partial<typeof this.userPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...preferences }
  }

  /**
   * 记录复习结果，更新调度
   */
  async recordReviewResult(
    wordId: number,
    correct: boolean,
    difficulty: number,
    responseTime: number,
    masteryLevel: number
  ): Promise<void> {
    const reviewRecord: ReviewRecord = {
      wordId,
      reviewDate: new Date(),
      correct,
      difficulty,
      responseTime,
      masteryLevel
    }

    // 这里可以更新数据库或调用API
    // 实际应用中需要持久化这个记录
    console.log('Recording review result:', reviewRecord)
  }

  // 私有方法

  private selectAdditionalWords(
    allSchedules: NextReview[],
    currentSelection: NextReview[],
    needed: number
  ): NextReview[] {
    const currentIds = new Set(currentSelection.map((r) => r.wordId))
    const candidates = allSchedules
      .filter((s) => !currentIds.has(s.wordId))
      .filter((s) => s.nextReviewDate > new Date()) // 未到期的单词
      .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime()) // 按时间排序

    return candidates.slice(0, needed)
  }

  private createScheduleSession(
    type: ScheduleSession['sessionType'],
    words: NextReview[]
  ): ScheduleSession {
    const priorityDistribution = words.reduce((dist, word) => {
      dist[word.priority] = (dist[word.priority] || 0) + 1
      return dist
    }, {} as Record<string, number>)

    // 估算总时间（基于单词数量和优先级）
    const estimatedDuration = words.reduce((total, word) => {
      const baseTime = 1.5 // 基础时间1.5分钟每词
      const priorityMultiplier = {
        low: 1.0,
        medium: 1.2,
        high: 1.5,
        critical: 2.0
      }
      return total + baseTime * (priorityMultiplier[word.priority] || 1.0)
    }, 0)

    return {
      sessionId: this.generateSessionId(),
      sessionType: type,
      words: words.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }),
      estimatedDuration: Math.round(estimatedDuration),
      totalWords: words.length,
      priorityDistribution,
      createdAt: new Date()
    }
  }

  private estimateReviewTime(word: WordScheduleData, schedule: NextReview): number {
    let baseTime = 90 // 基础90秒

    // 根据优先级调整
    switch (schedule.priority) {
      case 'critical':
        baseTime *= 2
        break
      case 'high':
        baseTime *= 1.5
        break
      case 'low':
        baseTime *= 0.8
        break
    }

    // 根据历史响应时间调整
    if (word.reviewHistory.length > 0) {
      const avgResponseTime =
        word.reviewHistory.reduce((sum, r) => sum + r.responseTime, 0) / word.reviewHistory.length
      baseTime = (baseTime + avgResponseTime * 1000) / 2
    }

    return baseTime / 1000 // 转换为秒
  }

  private selectOptimalWordCombination(
    words: Array<NextReview & { estimatedTime: number }>,
    targetMinutes: number
  ): NextReview[] {
    const targetSeconds = targetMinutes * 60
    const sortedWords = words.sort((a, b) => {
      // 按优先级和效率排序
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff

      // 优先级相同时，选择时间效率高的
      return a.estimatedTime - b.estimatedTime
    })

    const selected: NextReview[] = []
    let totalTime = 0

    for (const word of sortedWords) {
      if (totalTime + word.estimatedTime <= targetSeconds) {
        selected.push(word)
        totalTime += word.estimatedTime
      }
    }

    return selected
  }

  private calculateWordRetention(history: ReviewRecord[]): number {
    if (history.length === 0) return 0.5

    const recentReviews = history.slice(-10) // 最近10次
    return recentReviews.filter((r) => r.correct).length / recentReviews.length
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// 单例模式导出默认实例
export const reviewScheduleService = new ReviewScheduleService()
export default reviewScheduleService
