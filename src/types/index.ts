// 基础类型定义
export interface BaseEntity {
  id: number
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  username: string
  email: string
  preferences: UserPreferences
  createdAt: string
}

export interface UserPreferences {
  dailyReviewGoal: number
  preferredStudyTime: string[]
  difficultyPreference: 'adaptive' | 'easy' | 'medium' | 'hard'
  reviewTypes: ReviewType[]
  reminderSettings: ReminderSettings
}

export interface ReminderSettings {
  enabled: boolean
  times: string[] // HH:mm format
  types: ('review' | 'new_words' | 'progress')[]
}

// 地理位置信息
export interface LocationInfo {
  name?: string
  coordinates?: [number, number] // [latitude, longitude]
  type?: 'home' | 'school' | 'work' | 'travel' | 'other'
  address?: string
}

// 单词词条（标准词典数据）
export interface WordEntry extends BaseEntity {
  word: string
  language: string
  standardDefinitions: Definition[]
  frequency: number // 使用频率 1-10000
  difficulty: number // 标准难度 1-5
  pronunciation?: string
  etymology?: string
}

// 标准释义
export interface Definition {
  id: number
  meaning: string
  partOfSpeech: PartOfSpeech
  difficulty: number
  examples: string[]
  pronunciation?: string
  frequency: number
  synonyms?: string[]
  antonyms?: string[]
}

export type PartOfSpeech =
  | 'noun' | 'verb' | 'adjective' | 'adverb'
  | 'pronoun' | 'preposition' | 'conjunction'
  | 'interjection' | 'article' | 'other'

// 用户单词记录
export interface UserWordRecord extends BaseEntity {
  wordEntryId: number
  userId: number
  meaning: string // 用户理解的含义
  context: string // 上下文
  location?: LocationInfo
  sourceType: SourceType
  sourceDetail?: string
  confidence: number // 1-5
  sessionId?: string
  tags?: string[]
  notes?: string
  wordEntry?: WordEntry // 关联的词条信息
}

export type SourceType = 'reading' | 'listening' | 'conversation' | 'media' | 'study' | 'other'

// 重复录入分析
export interface DuplicationAnalysis extends BaseEntity {
  wordEntryId: number
  userId: number
  recordIds: number[]
  totalCount: number
  consistencyScore: number // 0-1
  meaningEvolution: MeaningEvolution[]
  contextSimilarity: number
  recommendations: string[]
}

// 含义演进
export interface MeaningEvolution {
  recordId: number
  meaning: string
  confidence: number
  recordedAt: string
  semanticDistance: number
  isConsistent: boolean
}

// 复习调度
export interface ReviewSchedule extends BaseEntity {
  userId: number
  wordRecordId: number
  currentInterval: number // 天数
  nextReviewDate: string
  lastReviewDate?: string
  reviewCount: number
  masterLevel: number // 1-5
  difficultyFactor: number // 个人化难度因子
  consecutiveCorrect: number
  status: ReviewStatus
  priority: number // 1-10
}

export type ReviewStatus = 'pending' | 'due' | 'overdue' | 'completed' | 'mastered'

// 复习会话
export interface ReviewSession extends BaseEntity {
  userId: number
  wordRecordId: number
  reviewType: ReviewType
  accuracy: number // 0-1
  responseTime: number // 毫秒
  userResponse: string
  expectedResponse: string
  contextShown: boolean
  hintsUsed: number
  feedback?: string
  difficultyRating?: number

  // 会话扩展信息
  sessionId: string
  startedAt: string
  completedAt?: string
  duration: number // 毫秒
  status: 'active' | 'completed' | 'paused' | 'abandoned'
  totalQuestions: number
  correctAnswers: number
  questions: ReviewQuestion[]
}

// 复习问题
export interface ReviewQuestion {
  id: string
  wordRecordId: number
  word: string
  type: ReviewType
  question: string
  options?: string[]
  correctAnswer: string
  userAnswer?: string
  isCorrect?: boolean
  responseTime?: number
  hintsUsed: number
  difficulty: number
}

export type ReviewType = 'recognition' | 'recall' | 'context' | 'production' | 'synonym' | 'antonym'

// 学习统计
export interface LearningStats {
  userId: number
  period: StatsPeriod
  startDate: string
  endDate: string

  // 录入统计
  wordsRecorded: number
  uniqueWordsRecorded: number
  duplicateRecords: number
  averageConfidence: number

  // 复习统计
  reviewSessions: number
  reviewsCompleted: number
  averageAccuracy?: number
  timeSpent: number // 分钟
  totalStudyTime: number // 总学习时间（分钟）
  consistencyDays: number
  monthlyStudyDays: number[]

  // 进度统计
  wordsMastered: number
  wordsInProgress: number
  wordsStruggling: number

  // 分类统计
  contextTypes: Record<string, number>
  locationTypes: Record<string, number>
  sourceTypes: Record<SourceType, number>

  // 效率指标
  learningVelocity: number // 词/天
  retentionRate: number
  reviewEfficiency: number
  weeklyGrowth: number // 周增长率
}

export type StatsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | 'week'

// 单词掌握进度
export interface WordMasteryProgress {
  wordEntryId: number
  userId: number
  firstEncounter: string
  lastReview?: string
  totalRecordings: number
  totalReviews: number
  currentMasteryLevel: number
  masteryTrend: MasteryTrend
  averageAccuracy: number
  meaningConsistency: number
  contextDiversity: number
  estimatedMasteryDate?: string
  milestones: MasteryMilestone[]
}

export type MasteryTrend = 'improving' | 'stable' | 'declining' | 'fluctuating'

// 掌握度统计
export interface MasteryStats {
  mastered: number
  inProgress: number
  struggling: number
  notReviewed: number
  total: number
}

export interface MasteryMilestone {
  level: number
  achievedAt: string
  reviewsToAchieve: number
  timeToAchieve: number // 天数
}

// 个性化推荐
export interface PersonalizedRecommendations {
  userId: number
  generatedAt: string

  // 复习推荐
  urgentReviews: WordRecommendation[]
  dailyReviewPlan: WordRecommendation[]
  weeklyGoals: WeeklyGoal[]

  // 学习优化建议
  studyTimeOptimization: StudyTimeRecommendation
  difficultyAdjustments: DifficultyAdjustment[]
  learningStrategies: string[]
}

export interface WordRecommendation {
  wordRecordId: number
  word: string
  priority: number // 1-10
  reviewType: ReviewType
  estimatedDuration: number
  reason: string
  contexts: string[]
  lastReviewDate?: string
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface WeeklyGoal {
  type: 'review' | 'new_words' | 'mastery' | 'consistency'
  target: number
  current: number
  description: string
  tips: string[]
}

export interface StudyTimeRecommendation {
  optimalDuration: number
  bestTimes: string[]
  reasoning: string
  sessionBreakdown: {
    newWords: number
    reviews: number
    practice: number
  }
}

export interface DifficultyAdjustment {
  wordId: number
  word: string
  currentDifficulty: number
  suggestedDifficulty: number
  reason: string
  confidence: number
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 查询参数类型
export interface WordRecordFilters {
  startDate?: string
  endDate?: string
  sourceType?: SourceType
  confidence?: number[]
  tags?: string[]
  location?: string
  difficulty?: number[]
  search?: string
}

export interface ReviewFilters {
  status?: ReviewStatus[]
  priority?: number[]
  reviewType?: ReviewType[]
  dueDate?: string
  masteryLevel?: number[]
}

export interface StatsFilters {
  period: StatsPeriod
  startDate?: string
  endDate?: string
  groupBy?: 'day' | 'week' | 'month'
}