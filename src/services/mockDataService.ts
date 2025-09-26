import type {
  ApiResponse,
  UserWordRecord,
  WordEntry,
  ReviewSchedule,
  ReviewSession,
  LearningStats,
  WordMasteryProgress,
  PersonalizedRecommendations,
  WordRecommendation,
  WeeklyGoal,
  StudyTimeRecommendation,
  DifficultyAdjustment,
  PaginatedResponse,
  DuplicationAnalysis
} from '@/types'

class MockDataService {
  private delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

  // Helper to create ApiResponse wrapper
  private createResponse<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    }
  }

  // Generate random dates
  private getRandomDate(daysBack: number = 30): string {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack))
    return date.toISOString()
  }

  private getRandomFutureDate(daysAhead: number = 7): string {
    const date = new Date()
    date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead))
    return date.toISOString()
  }

  // Mock word entries data
  private wordEntries: WordEntry[] = [
    {
      id: 1,
      word: "elaborate",
      language: "en",
      pronunciation: "/ɪˈlæbərət/",
      standardDefinitions: [
        {
          id: 1,
          meaning: "involving many carefully arranged parts or details; detailed and complicated in design and planning",
          partOfSpeech: "adjective",
          difficulty: 3.2,
          examples: ["they came to the party with an elaborate plan"],
          frequency: 850,
          synonyms: ["detailed", "complex", "intricate"]
        },
        {
          id: 2,
          meaning: "develop or present (a theory, policy, or system) in further detail",
          partOfSpeech: "verb",
          difficulty: 3.2,
          examples: ["he would not elaborate on his news"],
          frequency: 850
        }
      ],
      frequency: 850,
      difficulty: 3.2,
      etymology: "Late Middle English: from Latin elaboratus"
    },
    {
      id: 2,
      word: "substantial",
      language: "en",
      pronunciation: "/səbˈstænʃəl/",
      standardDefinitions: [
        {
          id: 3,
          meaning: "of considerable importance, size, or worth",
          partOfSpeech: "adjective",
          difficulty: 2.8,
          examples: ["a substantial amount of cash", "substantial changes were made"],
          frequency: 1200,
          synonyms: ["significant", "considerable", "important"]
        }
      ],
      frequency: 1200,
      difficulty: 2.8,
      etymology: "Middle English: from Old French substantiel"
    },
    {
      id: 3,
      word: "intricate",
      language: "en",
      pronunciation: "/ˈɪntrɪkət/",
      standardDefinitions: [
        {
          id: 4,
          meaning: "very complicated or detailed",
          partOfSpeech: "adjective",
          difficulty: 3.5,
          examples: ["an intricate network of canals"],
          frequency: 650,
          synonyms: ["complex", "elaborate", "complicated"]
        }
      ],
      frequency: 650,
      difficulty: 3.5,
      etymology: "Late Middle English: from Latin intricatus"
    },
    {
      id: 4,
      word: "paradigm",
      language: "en",
      pronunciation: "/ˈpærədaɪm/",
      standardDefinitions: [
        {
          id: 5,
          meaning: "a typical example or pattern of something; a model",
          partOfSpeech: "noun",
          difficulty: 4.1,
          examples: ["society's paradigm of the 'ideal woman'"],
          frequency: 420,
          synonyms: ["model", "framework", "pattern"]
        }
      ],
      frequency: 420,
      difficulty: 4.1,
      etymology: "Late Middle English: via late Latin from Greek paradeigma"
    },
    {
      id: 5,
      word: "resilience",
      language: "en",
      pronunciation: "/rɪˈzɪliəns/",
      standardDefinitions: [
        {
          id: 6,
          meaning: "the capacity to recover quickly from difficulties; toughness",
          partOfSpeech: "noun",
          difficulty: 3.0,
          examples: ["the often remarkable resilience of so many British institutions"],
          frequency: 890,
          synonyms: ["toughness", "flexibility", "adaptability"]
        }
      ],
      frequency: 890,
      difficulty: 3.0,
      etymology: "Mid 17th century: from Latin resilire 'to rebound'"
    }
  ]

  // Mock user word records
  private userWordRecords: UserWordRecord[] = [
    {
      id: 1,
      wordEntryId: 1,
      userId: 1,
      meaning: "详细阐述；精心制作的",
      context: "The architect presented an elaborate design for the new building.",
      sourceType: "reading",
      sourceDetail: "Academic Article - Page 15",
      confidence: 4.2,
      tags: ["architecture", "design"],
      createdAt: this.getRandomDate(10),
      updatedAt: this.getRandomDate(5)
    },
    {
      id: 2,
      wordEntryId: 2,
      userId: 1,
      meaning: "大量的，实质的",
      context: "There was substantial evidence to support the claim.",
      sourceType: "reading",
      sourceDetail: "News Article",
      confidence: 3.8,
      tags: ["legal", "evidence"],
      createdAt: this.getRandomDate(15),
      updatedAt: this.getRandomDate(8)
    },
    {
      id: 3,
      wordEntryId: 3,
      userId: 1,
      meaning: "复杂的，错综的",
      context: "The intricate details of the painting were mesmerizing.",
      sourceType: "reading",
      sourceDetail: "Art Book - Chapter 3",
      confidence: 3.5,
      tags: ["art", "description"],
      createdAt: this.getRandomDate(20),
      updatedAt: this.getRandomDate(12)
    },
    {
      id: 4,
      wordEntryId: 4,
      userId: 1,
      meaning: "范式，模式",
      context: "The new paradigm in education emphasizes collaborative learning.",
      sourceType: "listening",
      sourceDetail: "Educational Podcast - Episode 12",
      confidence: 4.0,
      tags: ["education", "theory"],
      createdAt: this.getRandomDate(7),
      updatedAt: this.getRandomDate(3)
    },
    {
      id: 5,
      wordEntryId: 5,
      userId: 1,
      meaning: "韧性，恢复力",
      context: "Her resilience helped her overcome many challenges.",
      sourceType: "conversation",
      sourceDetail: "Work Meeting",
      confidence: 4.5,
      tags: ["psychology", "personal"],
      createdAt: this.getRandomDate(12),
      updatedAt: this.getRandomDate(6)
    }
  ]

  // Mock review schedules
  private reviewSchedules: ReviewSchedule[] = [
    {
      id: 1,
      userId: 1,
      wordRecordId: 1,
      currentInterval: 3,
      nextReviewDate: this.getRandomFutureDate(3),
      reviewCount: 2,
      masterLevel: 2,
      difficultyFactor: 2.5,
      consecutiveCorrect: 2,
      status: 'due',
      priority: 5,
      lastReviewDate: this.getRandomDate(2),
      createdAt: this.getRandomDate(10),
      updatedAt: this.getRandomDate(2)
    },
    {
      id: 2,
      userId: 1,
      wordRecordId: 2,
      currentInterval: 1,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 1,
      masterLevel: 1,
      difficultyFactor: 2.3,
      consecutiveCorrect: 1,
      status: 'due',
      priority: 6,
      createdAt: this.getRandomDate(5),
      updatedAt: this.getRandomDate(1)
    },
    {
      id: 3,
      userId: 1,
      wordRecordId: 3,
      currentInterval: 7,
      nextReviewDate: this.getRandomFutureDate(1),
      reviewCount: 3,
      masterLevel: 3,
      difficultyFactor: 2.8,
      consecutiveCorrect: 3,
      status: 'overdue',
      priority: 8,
      lastReviewDate: this.getRandomDate(3),
      createdAt: this.getRandomDate(15),
      updatedAt: this.getRandomDate(3)
    },
    {
      id: 4,
      userId: 1,
      wordRecordId: 4,
      currentInterval: 14,
      nextReviewDate: this.getRandomFutureDate(5),
      reviewCount: 4,
      masterLevel: 4,
      difficultyFactor: 3.1,
      consecutiveCorrect: 4,
      status: 'pending',
      priority: 3,
      lastReviewDate: this.getRandomDate(7),
      createdAt: this.getRandomDate(20),
      updatedAt: this.getRandomDate(7)
    }
  ]

  // Words API Mock Methods
  async getWords(page = 1, limit = 20) {
    await this.delay()
    const words = Array.from({ length: limit }, (_, i) => ({
      id: (page - 1) * limit + i + 1,
      word: `word${(page - 1) * limit + i + 1}`,
      meaning: `意思${(page - 1) * limit + i + 1}`,
      pronunciation: `/pronunciation${i + 1}/`,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
      tags: ['tag1', 'tag2']
    }))

    return {
      words,
      total: 100,
      page,
      limit
    }
  }

  async getWordById(id: number) {
    await this.delay()
    return {
      id,
      word: `word${id}`,
      meaning: `意思${id}`,
      pronunciation: `/pronunciation${id}/`,
      difficulty: 'medium' as const,
      tags: ['tag1', 'tag2']
    }
  }

  async createWord(word: any) {
    await this.delay()
    return {
      id: Math.floor(Math.random() * 1000) + 100,
      ...word
    }
  }

  async updateWord(id: number, word: any) {
    await this.delay()
    return {
      id,
      ...word
    }
  }

  async deleteWord(_id: number) {
    await this.delay()
    // Returns void
  }

  async searchWordEntries(query: string, page = 1, limit = 20) {
    await this.delay()
    const filteredEntries = this.wordEntries.filter(entry =>
      entry.word.toLowerCase().includes(query.toLowerCase())
    )

    const start = (page - 1) * limit
    const items = filteredEntries.slice(start, start + limit)

    return this.createResponse<PaginatedResponse<WordEntry>>({
      items,
      total: filteredEntries.length,
      page,
      limit,
      totalPages: Math.ceil(filteredEntries.length / limit)
    })
  }

  async getWordEntry(word: string) {
    await this.delay()
    const entry = this.wordEntries.find(e => e.word.toLowerCase() === word.toLowerCase()) || this.wordEntries[0]
    return this.createResponse(entry)
  }

  async getWordEntryById(id: number) {
    await this.delay()
    const entry = this.wordEntries.find(e => e.id === id) || this.wordEntries[0]
    return this.createResponse(entry)
  }

  async createWordRecord(record: any) {
    await this.delay()
    const newRecord: UserWordRecord = {
      id: Math.floor(Math.random() * 1000) + 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...record
    }
    return this.createResponse(newRecord)
  }

  async getWordRecords(filters?: any, page = 1, limit = 20) {
    await this.delay()
    const start = (page - 1) * limit
    const items = this.userWordRecords.slice(start, start + limit)

    return this.createResponse<PaginatedResponse<UserWordRecord>>({
      items,
      total: this.userWordRecords.length,
      page,
      limit,
      totalPages: Math.ceil(this.userWordRecords.length / limit)
    })
  }

  async getWordRecord(id: number) {
    await this.delay()
    const record = this.userWordRecords.find(r => r.id === id) || this.userWordRecords[0]
    return this.createResponse(record)
  }

  async updateWordRecord(id: number, updates: any) {
    await this.delay()
    const record = this.userWordRecords.find(r => r.id === id) || this.userWordRecords[0]
    return this.createResponse({ ...record, ...updates, updatedAt: new Date().toISOString() })
  }

  async deleteWordRecord(id: number) {
    await this.delay()
    return this.createResponse(undefined)
  }

  async checkDuplication(word: string, meaning: string, context: string) {
    await this.delay()
    const analysis: DuplicationAnalysis = {
      id: Math.floor(Math.random() * 1000) + 1,
      wordEntryId: Math.floor(Math.random() * 5) + 1,
      userId: 1,
      recordIds: [1, 2],
      totalCount: 2,
      consistencyScore: Math.random() * 0.3 + 0.7,
      meaningEvolution: [
        {
          recordId: 1,
          meaning: meaning,
          confidence: 4.0,
          recordedAt: this.getRandomDate(7),
          semanticDistance: 0.1,
          isConsistent: true
        }
      ],
      contextSimilarity: Math.random() * 0.4 + 0.6,
      recommendations: [
        "Consider merging with existing record",
        "Different context provides new learning opportunity"
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return this.createResponse(analysis)
  }

  async getDuplicationAnalysis(wordEntryId: number) {
    await this.delay()
    const analysis: DuplicationAnalysis = {
      id: Math.floor(Math.random() * 1000) + 1,
      wordEntryId,
      userId: 1,
      recordIds: [],
      totalCount: 1,
      consistencyScore: 0.95,
      meaningEvolution: [],
      contextSimilarity: 0.95,
      recommendations: ["This appears to be a new unique record"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return this.createResponse(analysis)
  }

  async bulkCreateWordRecords(records: any[]) {
    await this.delay()
    const createdRecords = records.map((record, index) => ({
      id: Math.floor(Math.random() * 1000) + 200 + index,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...record
    }))
    return this.createResponse(createdRecords)
  }

  async exportWordRecords(filters?: any) {
    await this.delay()
    return this.createResponse({
      downloadUrl: 'https://example.com/download/words-export.csv'
    })
  }

  async getWordRecordStats(filters?: any) {
    await this.delay()
    return this.createResponse({
      totalRecords: this.userWordRecords.length,
      uniqueWords: this.wordEntries.length,
      averageConfidence: 3.8,
      sourceTypeDistribution: {
        reading: 45,
        listening: 25,
        conversation: 20,
        other: 10
      },
      locationDistribution: {
        'Academic Article': 30,
        'News Article': 25,
        'Book': 20,
        'Podcast': 15,
        'Meeting': 10
      }
    })
  }

  // Reviews API Mock Methods
  async getReviewSchedules(filters?: any, page = 1, limit = 20) {
    await this.delay()
    const start = (page - 1) * limit
    const items = this.reviewSchedules.slice(start, start + limit)

    return this.createResponse<PaginatedResponse<ReviewSchedule>>({
      items,
      total: this.reviewSchedules.length,
      page,
      limit,
      totalPages: Math.ceil(this.reviewSchedules.length / limit)
    })
  }

  async getDueReviews(limit = 50) {
    await this.delay()
    const dueReviews = this.reviewSchedules
      .filter(schedule => schedule.status === 'due' || schedule.status === 'overdue')
      .slice(0, limit)

    return this.createResponse(dueReviews)
  }

  async getReviewSchedule(id: number) {
    await this.delay()
    const schedule = this.reviewSchedules.find(s => s.id === id) || this.reviewSchedules[0]
    return this.createResponse(schedule)
  }

  async updateReviewSchedule(id: number, updates: any) {
    await this.delay()
    const schedule = this.reviewSchedules.find(s => s.id === id) || this.reviewSchedules[0]
    return this.createResponse({ ...schedule, ...updates, updatedAt: new Date().toISOString() })
  }

  async rescheduleReview(id: number, newDate: string) {
    await this.delay()
    const schedule = this.reviewSchedules.find(s => s.id === id) || this.reviewSchedules[0]
    return this.createResponse({ ...schedule, nextReviewDate: newDate, updatedAt: new Date().toISOString() })
  }

  async startReviewSession(wordRecordIds: number[]) {
    await this.delay()
    const sessionId = `session_${Date.now()}`
    const reviews = this.reviewSchedules.filter(s =>
      wordRecordIds.includes(s.wordRecordId)
    ).slice(0, 10)

    return this.createResponse({
      sessionId,
      reviews
    })
  }

  async submitReviewResult(sessionData: any) {
    await this.delay()
    const nextReviewDate = this.getRandomFutureDate(7)
    const reviewSession: ReviewSession = {
      id: Math.floor(Math.random() * 1000) + 1000,
      userId: 1,
      sessionId: sessionData.sessionId,
      wordRecordId: sessionData.wordRecordId,
      reviewType: sessionData.reviewType,
      accuracy: sessionData.accuracy,
      responseTime: sessionData.responseTime,
      userResponse: sessionData.userResponse,
      expectedResponse: sessionData.expectedResponse,
      contextShown: sessionData.contextShown,
      hintsUsed: sessionData.hintsUsed,
      feedback: sessionData.feedback,
      difficultyRating: sessionData.difficultyRating,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      duration: sessionData.responseTime,
      status: 'completed',
      totalQuestions: 1,
      correctAnswers: sessionData.accuracy >= 0.7 ? 1 : 0,
      questions: []
    }

    return this.createResponse({
      ...reviewSession,
      nextReviewDate
    })
  }

  async endReviewSession(sessionId: string) {
    await this.delay()
    return this.createResponse({
      completedReviews: Math.floor(Math.random() * 10) + 5,
      accuracy: Math.random() * 0.3 + 0.7,
      timeSpent: Math.floor(Math.random() * 1200) + 300,
      nextDueCount: Math.floor(Math.random() * 20) + 10
    })
  }

  async getReviewSessions(page = 1, limit = 20, filters?: any) {
    await this.delay()
    const sessions = Array.from({ length: limit }, (_, i) => ({
      id: (page - 1) * limit + i + 1,
      userId: 1,
      sessionId: `session_${(page - 1) * limit + i + 1}`,
      wordRecordId: Math.floor(Math.random() * 10) + 1,
      reviewType: ['recognition', 'recall', 'context'][Math.floor(Math.random() * 3)] as ReviewType,
      accuracy: Math.random() * 0.4 + 0.6,
      responseTime: Math.floor(Math.random() * 5000) + 1000,
      userResponse: 'User response',
      expectedResponse: 'Expected response',
      contextShown: Math.random() > 0.5,
      hintsUsed: Math.floor(Math.random() * 3),
      createdAt: this.getRandomDate(30),
      updatedAt: this.getRandomDate(30),
      startedAt: this.getRandomDate(30),
      completedAt: this.getRandomDate(29),
      duration: Math.floor(Math.random() * 3000) + 1000,
      status: 'completed' as const,
      totalQuestions: Math.floor(Math.random() * 10) + 5,
      correctAnswers: Math.floor(Math.random() * 8) + 3,
      questions: []
    }))

    return this.createResponse<PaginatedResponse<ReviewSession>>({
      items: sessions,
      total: 200,
      page,
      limit,
      totalPages: Math.ceil(200 / limit)
    })
  }

  async getReviewSession(id: number) {
    await this.delay()
    const session: ReviewSession = {
      id,
      userId: 1,
      sessionId: `session_${id}`,
      wordRecordId: Math.floor(Math.random() * 10) + 1,
      reviewType: 'recognition',
      accuracy: 0.85,
      responseTime: 2500,
      userResponse: 'User response',
      expectedResponse: 'Expected response',
      contextShown: true,
      hintsUsed: 1,
      createdAt: this.getRandomDate(7),
      updatedAt: this.getRandomDate(7),
      startedAt: this.getRandomDate(7),
      completedAt: this.getRandomDate(6),
      duration: 2500,
      status: 'completed',
      totalQuestions: 10,
      correctAnswers: 8,
      questions: []
    }
    return this.createResponse(session)
  }

  async getReviewStats(period: 'daily' | 'weekly' | 'monthly', limit = 30) {
    await this.delay()
    const dates = Array.from({ length: limit }, (_, i) => {
      const date = new Date()
      if (period === 'daily') {
        date.setDate(date.getDate() - i)
      } else if (period === 'weekly') {
        date.setDate(date.getDate() - i * 7)
      } else {
        date.setMonth(date.getMonth() - i)
      }
      return date.toISOString().split('T')[0]
    }).reverse()

    return this.createResponse({
      dates,
      reviewCounts: dates.map(() => Math.floor(Math.random() * 20) + 5),
      accuracyRates: dates.map(() => Math.random() * 0.3 + 0.7),
      timeSpent: dates.map(() => Math.floor(Math.random() * 1800) + 600),
      reviewTypes: {
        recognition: Math.floor(Math.random() * 50) + 20,
        recall: Math.floor(Math.random() * 40) + 15,
        context: Math.floor(Math.random() * 30) + 10
      },
      averageResponseTime: Math.floor(Math.random() * 2000) + 1500
    })
  }

  async getDashboardStats() {
    await this.delay()
    return this.createResponse({
      dueToday: Math.floor(Math.random() * 20) + 5,
      completedToday: Math.floor(Math.random() * 15) + 3,
      streak: Math.floor(Math.random() * 30) + 5,
      weeklyProgress: Math.random() * 0.4 + 0.6,
      averageAccuracy: Math.random() * 0.2 + 0.75,
      totalWordsLearned: Math.floor(Math.random() * 500) + 200,
      masteredWords: Math.floor(Math.random() * 300) + 100
    })
  }

  async getReviewSettings() {
    await this.delay()
    return this.createResponse({
      dailyGoal: 30,
      sessionLength: 20,
      reviewTypes: ['recognition', 'recall', 'context'] as any[],
      difficultySetting: 'adaptive' as const,
      showContext: true,
      allowHints: true,
      autoSchedule: true
    })
  }

  async updateReviewSettings(settings: any) {
    await this.delay()
    return this.createResponse(undefined)
  }

  async markMultipleAsReviewed(scheduleIds: number[], result: string) {
    await this.delay()
    return this.createResponse({
      updated: scheduleIds.length,
      nextReviews: this.reviewSchedules.slice(0, 5)
    })
  }

  async resetReviewProgress(wordRecordIds: number[]) {
    await this.delay()
    return this.createResponse(undefined)
  }

  // Analytics API Mock Methods
  async getLearningStats(filters: any) {
    await this.delay()
    const stats: LearningStats = {
      userId: 1,
      period: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate: new Date().toISOString(),
      wordsRecorded: Math.floor(Math.random() * 200) + 150,
      uniqueWordsRecorded: Math.floor(Math.random() * 180) + 140,
      duplicateRecords: Math.floor(Math.random() * 20) + 10,
      averageConfidence: Math.random() * 0.2 + 0.75,
      reviewSessions: Math.floor(Math.random() * 100) + 50,
      reviewsCompleted: Math.floor(Math.random() * 500) + 300,
      averageAccuracy: Math.random() * 0.2 + 0.75,
      timeSpent: Math.floor(Math.random() * 5000) + 2000,
      totalStudyTime: Math.floor(Math.random() * 5000) + 2000,
      consistencyDays: Math.floor(Math.random() * 25) + 10,
      monthlyStudyDays: Array.from({ length: 12 }, () => Math.floor(Math.random() * 25) + 10),
      wordsMastered: Math.floor(Math.random() * 100) + 80,
      wordsInProgress: Math.floor(Math.random() * 80) + 50,
      wordsStruggling: Math.floor(Math.random() * 30) + 10,
      contextTypes: {
        'academic': 30,
        'business': 25,
        'casual': 20,
        'technical': 15,
        'other': 10
      },
      locationTypes: {
        'home': 40,
        'work': 35,
        'school': 15,
        'other': 10
      },
      sourceTypes: {
        'reading': 45,
        'listening': 25,
        'conversation': 20,
        'media': 5,
        'study': 3,
        'other': 2
      },
      learningVelocity: Math.random() * 2 + 1,
      retentionRate: Math.random() * 0.3 + 0.7,
      reviewEfficiency: Math.random() * 0.3 + 0.7,
      weeklyGrowth: Math.random() * 0.3 - 0.1
    }
    return this.createResponse(stats)
  }

  async getHistoricalStats(period: any, limit = 30, groupBy = 'day') {
    await this.delay()
    const labels = Array.from({ length: limit }, (_, i) => {
      const date = new Date()
      if (groupBy === 'day') {
        date.setDate(date.getDate() - i)
      } else if (groupBy === 'week') {
        date.setDate(date.getDate() - i * 7)
      } else {
        date.setMonth(date.getMonth() - i)
      }
      return date.toISOString().split('T')[0]
    }).reverse()

    return this.createResponse({
      labels,
      datasets: {
        wordsRecorded: labels.map(() => Math.floor(Math.random() * 10) + 2),
        reviewsCompleted: labels.map(() => Math.floor(Math.random() * 25) + 5),
        accuracy: labels.map(() => Math.random() * 0.3 + 0.7),
        timeSpent: labels.map(() => Math.floor(Math.random() * 120) + 30),
        newWordsMastered: labels.map(() => Math.floor(Math.random() * 5) + 1)
      }
    })
  }

  async getWordMasteryProgress(filters?: any, page = 1, limit = 20) {
    await this.delay()
    const items: WordMasteryProgress[] = Array.from({ length: limit }, (_, i) => ({
      wordEntryId: (page - 1) * limit + i + 1,
      userId: 1,
      firstEncounter: this.getRandomDate(60),
      lastReview: this.getRandomDate(7),
      totalRecordings: Math.floor(Math.random() * 5) + 1,
      totalReviews: Math.floor(Math.random() * 15) + 3,
      currentMasteryLevel: Math.random() * 4 + 1,
      masteryTrend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as MasteryTrend,
      averageAccuracy: Math.random() * 0.3 + 0.7,
      meaningConsistency: Math.random() * 0.4 + 0.6,
      contextDiversity: Math.random() * 0.5 + 0.5,
      milestones: [
        {
          level: Math.floor(Math.random() * 3) + 2,
          achievedAt: this.getRandomDate(30),
          reviewsToAchieve: Math.floor(Math.random() * 10) + 5,
          timeToAchieve: Math.floor(Math.random() * 15) + 7
        }
      ]
    }))

    return this.createResponse({
      items,
      total: 150,
      page,
      limit,
      summary: {
        totalWords: 150,
        mastered: Math.floor(Math.random() * 50) + 30,
        inProgress: Math.floor(Math.random() * 70) + 50,
        struggling: Math.floor(Math.random() * 30) + 15,
        averageMasteryLevel: Math.random() * 1.5 + 2.5
      }
    })
  }

  async getWordMasteryDetail(wordEntryId: number) {
    await this.delay()
    const detail = {
      wordEntryId,
      userId: 1,
      firstEncounter: this.getRandomDate(60),
      lastReview: this.getRandomDate(7),
      totalRecordings: Math.floor(Math.random() * 5) + 1,
      totalReviews: Math.floor(Math.random() * 20) + 5,
      currentMasteryLevel: Math.random() * 2 + 3,
      masteryTrend: 'improving' as const,
      averageAccuracy: Math.random() * 0.2 + 0.8,
      masteryVelocity: Math.random() * 2 + 1,
      difficultyRating: Math.floor(Math.random() * 3) + 3,
      tags: ['advanced', 'academic'],
      milestones: [
        {
          date: this.getRandomDate(30),
          level: Math.random() * 2 + 2,
          trigger: 'accuracy_threshold'
        }
      ],
      recordHistory: Array.from({ length: 3 }, (_, i) => ({
        date: this.getRandomDate(30),
        meaning: `含义记录 ${i + 1}`,
        context: `上下文 ${i + 1}`,
        confidence: Math.random() * 2 + 3
      })),
      reviewHistory: Array.from({ length: 5 }, (_, i) => ({
        date: this.getRandomDate(20),
        reviewType: ['recognition', 'recall', 'context'][Math.floor(Math.random() * 3)],
        accuracy: Math.random() * 0.3 + 0.7,
        responseTime: Math.floor(Math.random() * 3000) + 1000
      }))
    }
    return this.createResponse(detail)
  }

  async getLearningPatterns() {
    await this.delay()
    return this.createResponse({
      optimalStudyTimes: [
        { hour: 9, performance: 0.92, sessionCount: 15 },
        { hour: 14, performance: 0.87, sessionCount: 12 },
        { hour: 19, performance: 0.89, sessionCount: 18 },
        { hour: 21, performance: 0.85, sessionCount: 10 }
      ],
      difficultyTrends: {
        easy: { accuracy: 0.95, timeSpent: 45 },
        medium: { accuracy: 0.82, timeSpent: 75 },
        hard: { accuracy: 0.68, timeSpent: 120 }
      },
      reviewTypeEfficiency: [
        { type: 'recognition', accuracy: 0.91, averageTime: 2200, improvementRate: 0.15 },
        { type: 'recall', accuracy: 0.76, averageTime: 3800, improvementRate: 0.22 },
        { type: 'context', accuracy: 0.83, averageTime: 2900, improvementRate: 0.18 }
      ],
      contextualLearning: [
        { context: 'Academic Articles', retentionRate: 0.88, wordCount: 45 },
        { context: 'Business Documents', retentionRate: 0.82, wordCount: 32 },
        { context: 'Casual Conversations', retentionRate: 0.75, wordCount: 23 }
      ]
    })
  }

  async getProgressPrediction(_targetMasteryLevel = 4) {
    await this.delay()
    const completionDate = new Date()
    completionDate.setDate(completionDate.getDate() + Math.floor(Math.random() * 60) + 30)

    return this.createResponse({
      estimatedCompletionDate: completionDate.toISOString(),
      wordsRemaining: Math.floor(Math.random() * 80) + 40,
      requiredDailyReviews: Math.floor(Math.random() * 15) + 10,
      confidenceInterval: {
        optimistic: new Date(completionDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        realistic: completionDate.toISOString(),
        pessimistic: new Date(completionDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      recommendations: [
        '保持当前学习节奏',
        '增加难词复习频率',
        '关注薄弱的词汇类别'
      ]
    })
  }

  async getComparativeAnalysis() {
    await this.delay()
    return this.createResponse({
      vsLastMonth: {
        wordsLearned: { current: 45, previous: 38, change: 18.4 },
        accuracy: { current: 0.84, previous: 0.79, change: 6.3 },
        timeSpent: { current: 1260, previous: 1080, change: 16.7 },
        consistency: { current: 22, previous: 18, change: 22.2 }
      },
      vsAverage: {
        learningVelocity: { user: 2.3, average: 1.8, percentile: 75 },
        retentionRate: { user: 0.87, average: 0.82, percentile: 68 },
        sessionLength: { user: 25, average: 20, percentile: 72 }
      }
    })
  }

  async exportAnalytics(format: string, _filters?: any) {
    await this.delay()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    return this.createResponse({
      downloadUrl: `https://example.com/download/analytics.${format}`,
      expiresAt: expiresAt.toISOString()
    })
  }

  async getPersonalizedInsights() {
    await this.delay()
    return this.createResponse({
      strengths: [
        '单词识别能力强',
        '学习时间稳定',
        '复习频率合理'
      ],
      weaknesses: [
        '回忆类题目正确率较低',
        '复杂词汇掌握不够',
        '上下文理解需要加强'
      ],
      recommendations: [
        {
          title: '增加回忆练习',
          description: '每天增加5-10道回忆类题目以提高记忆深度',
          priority: 'high' as const,
          category: 'review_strategy' as const
        },
        {
          title: '优化学习时间',
          description: '建议在上午9-11点学习效果最佳',
          priority: 'medium' as const,
          category: 'time_management' as const
        },
        {
          title: '加强语境学习',
          description: '多接触真实语境中的词汇使用',
          priority: 'high' as const,
          category: 'content' as const
        }
      ],
      achievements: [
        {
          title: '连续学习达人',
          description: '连续学习超过2周',
          unlockedAt: this.getRandomDate(7),
          icon: '🏆'
        },
        {
          title: '词汇大师',
          description: '掌握词汇超过100个',
          unlockedAt: this.getRandomDate(14),
          icon: '📚'
        }
      ],
      nextMilestones: [
        {
          title: '词汇达人',
          description: '掌握200个词汇',
          progress: 150,
          target: 200
        },
        {
          title: '复习专家',
          description: '完成1000次复习',
          progress: 750,
          target: 1000
        }
      ]
    })
  }

  async getVocabularyDistribution() {
    await this.delay()
    return this.createResponse({
      difficultyDistribution: {
        '1': 25,
        '2': 45,
        '3': 68,
        '4': 32,
        '5': 12
      },
      partOfSpeechDistribution: {
        'noun': 45,
        'verb': 38,
        'adjective': 32,
        'adverb': 18,
        'other': 12
      },
      frequencyDistribution: {
        veryCommon: 35,
        common: 58,
        uncommon: 42,
        rare: 15
      },
      sourceDistribution: {
        'reading': 75,
        'listening': 35,
        'conversation': 25,
        'other': 15
      },
      locationDistribution: {
        'Academic Articles': 45,
        'News': 32,
        'Books': 28,
        'Podcasts': 20,
        'Meetings': 15
      }
    })
  }

  // Recommendations API Mock Methods
  async getPersonalizedRecommendations() {
    await this.delay()
    const recommendations: PersonalizedRecommendations = {
      userId: 1,
      generatedAt: new Date().toISOString(),
      urgentReviews: Array.from({ length: 5 }, (_, i) => ({
        wordRecordId: i + 1,
        word: this.wordEntries[i % this.wordEntries.length]?.word || `word${i + 1}`,
        priority: Math.floor(Math.random() * 5) + 1,
        reviewType: ['recognition', 'recall', 'context'][Math.floor(Math.random() * 3)] as ReviewType,
        estimatedDuration: Math.floor(Math.random() * 5) + 2,
        reason: '复习间隔已超时',
        contexts: ['学术', '商务'],
        lastReviewDate: this.getRandomDate(10),
        urgencyLevel: 'high' as const
      })),
      dailyReviewPlan: [],
      weeklyGoals: [
        {
          type: 'new_words',
          target: 35,
          current: 28,
          description: '本周目标学习35个新单词',
          tips: ['保持学习节奏', '多样化学习内容']
        },
        {
          type: 'review',
          target: 150,
          current: 120,
          description: '本周目标完成150次复习',
          tips: ['每日复习', '及时巩固']
        }
      ],
      studyTimeOptimization: {
        optimalDuration: 45,
        bestTimes: ['09:00', '14:00', '19:00'],
        reasoning: '基于您的学习模式分析',
        sessionBreakdown: {
          newWords: 15,
          reviews: 25,
          practice: 5
        }
      },
      difficultyAdjustments: [],
      learningStrategies: [
        '增加视觉记忆辅助',
        '使用间隔重复算法',
        '结合上下文学习'
      ]
    }
    return this.createResponse(recommendations)
  }

  async refreshRecommendations() {
    await this.delay()
    return this.getPersonalizedRecommendations()
  }

  async getUrgentReviews(limit = 10) {
    await this.delay()
    const urgentReviews: WordRecommendation[] = Array.from({ length: limit }, (_, i) => ({
      wordRecordId: i + 1,
      word: this.wordEntries[i % this.wordEntries.length]?.word || `urgent_word${i + 1}`,
      meaning: `紧急复习含义${i + 1}`,
      priority: Math.floor(Math.random() * 2) + 4, // High priority (4-5)
      reason: '已超过最佳复习时间',
      estimatedDifficulty: Math.floor(Math.random() * 5) + 1,
      estimatedDuration: Math.floor(Math.random() * 5) + 2,
      lastReviewDate: this.getRandomDate(15),
      nextReviewDate: this.getRandomDate(1),
      reviewType: ['recognition', 'recall', 'context'][Math.floor(Math.random() * 3)] as any,
      contexts: ['紧急'],
      urgencyLevel: 'high' as const
    }))
    return this.createResponse(urgentReviews)
  }

  async getDailyReviewPlan(targetMinutes = 30) {
    await this.delay()
    const planSize = Math.floor(targetMinutes / 2) // Rough estimation
    const recommendations: WordRecommendation[] = Array.from({ length: planSize }, (_, i) => ({
      wordRecordId: i + 1,
      word: this.wordEntries[i % this.wordEntries.length]?.word || `plan_word${i + 1}`,
      meaning: `计划含义${i + 1}`,
      priority: Math.floor(Math.random() * 5) + 1,
      reason: '适合今日复习',
      estimatedDifficulty: Math.floor(Math.random() * 5) + 1,
      estimatedDuration: Math.floor(Math.random() * 3) + 1,
      lastReviewDate: this.getRandomDate(7),
      nextReviewDate: new Date().toISOString(),
      reviewType: ['recognition', 'recall', 'context'][Math.floor(Math.random() * 3)] as any,
      contexts: ['日常'],
      urgencyLevel: 'medium' as const
    }))

    return this.createResponse({
      recommendations,
      estimatedDuration: targetMinutes,
      breakdown: {
        newWords: Math.floor(planSize * 0.2),
        reviews: Math.floor(planSize * 0.7),
        practice: Math.floor(planSize * 0.1)
      }
    })
  }

  async getAdaptiveReviews(sessionLength = 20) {
    await this.delay()
    const adaptiveReviews: WordRecommendation[] = Array.from({ length: sessionLength }, (_, i) => ({
      wordRecordId: i + 1,
      word: this.wordEntries[i % this.wordEntries.length]?.word || `adaptive_word${i + 1}`,
      meaning: `自适应含义${i + 1}`,
      priority: Math.floor(Math.random() * 3) + 3, // Medium to high priority
      reason: '基于学习模式推荐',
      estimatedDifficulty: Math.floor(Math.random() * 3) + 2, // Adaptive difficulty
      estimatedDuration: Math.floor(Math.random() * 4) + 2,
      lastReviewDate: this.getRandomDate(10),
      nextReviewDate: this.getRandomFutureDate(3),
      reviewType: ['recognition', 'recall', 'context'][Math.floor(Math.random() * 3)] as any,
      contexts: ['自适应'],
      urgencyLevel: 'medium' as const
    }))
    return this.createResponse(adaptiveReviews)
  }

  async getWeeklyGoals() {
    await this.delay()
    const goals: WeeklyGoal[] = [
      {
        type: 'new_words',
        target: 35,
        current: 28,
        description: '本周目标学习35个新单词',
        tips: ['保持学习节奏', '多样化学习内容']
      },
      {
        type: 'review',
        target: 150,
        current: 120,
        description: '本周目标完成150次复习',
        tips: ['每日复习', '及时巩固']
      },
      {
        type: 'mastery',
        target: 85,
        current: 82,
        description: '维持85%以上的复习准确率',
        tips: ['重点练习薄弱词汇', '提高理解深度']
      }
    ]
    return this.createResponse(goals)
  }

  async updateGoalProgress(goalType: string, progress: number) {
    await this.delay()
    const updatedGoal: WeeklyGoal = {
      type: goalType as 'review' | 'new_words' | 'mastery' | 'consistency',
      target: 100,
      current: progress,
      description: '目标已更新',
      tips: ['保持学习节奏']
    }
    return this.createResponse(updatedGoal)
  }

  async getStudyTimeRecommendation() {
    await this.delay()
    const recommendation: StudyTimeRecommendation = {
      optimalDuration: 45,
      bestTimes: ['09:00-10:30', '14:00-15:30', '19:00-20:30'],
      reasoning: '上午9-10:30是您的最佳学习时间，建议每45分钟休息15分钟，避免连续学习超过90分钟',
      sessionBreakdown: {
        newWords: 15,
        reviews: 25,
        practice: 5
      }
    }
    return this.createResponse(recommendation)
  }

  async getDifficultyAdjustments() {
    await this.delay()
    const adjustments: DifficultyAdjustment[] = [
      {
        wordId: 1,
        word: 'elaborate',
        currentDifficulty: 3,
        suggestedDifficulty: 4,
        reason: '最近复习表现表明难度被低估',
        confidence: 0.85
      },
      {
        wordId: 2,
        word: 'substantial',
        currentDifficulty: 4,
        suggestedDifficulty: 3,
        reason: '连续多次正确回答，可以降低难度',
        confidence: 0.92
      }
    ]
    return this.createResponse(adjustments)
  }

  async applyDifficultyAdjustment(_wordId: number, _newDifficulty: number) {
    await this.delay()
    return this.createResponse(undefined)
  }

  async dismissDifficultyAdjustment(_wordId: number) {
    await this.delay()
    return this.createResponse(undefined)
  }

  async getLearningStrategies() {
    await this.delay()
    return this.createResponse({
      currentStrategies: [
        '间隔重复',
        '上下文学习',
        '主动回忆'
      ],
      suggestedStrategies: [
        {
          strategy: '视觉联想记忆',
          reason: '可以提高记忆效果30%',
          expectedImprovement: 0.30,
          difficulty: 'easy' as const
        },
        {
          strategy: '词汇造句练习',
          reason: '加深理解和应用能力',
          expectedImprovement: 0.25,
          difficulty: 'medium' as const
        },
        {
          strategy: '语音记忆辅助',
          reason: '利用听觉记忆增强效果',
          expectedImprovement: 0.20,
          difficulty: 'easy' as const
        }
      ],
      personalizedTips: [
        '根据您的学习模式，建议在上午学习新词',
        '利用碎片时间进行快速复习',
        '结合真实语境加深印象'
      ]
    })
  }

  async getContentRecommendations() {
    await this.delay()
    return this.createResponse({
      suggestedWords: [
        {
          word: 'sophisticated',
          reason: '与您已掌握的词汇相关性高',
          difficulty: 3.5,
          priority: 4,
          relatedWords: ['elaborate', 'complex', 'advanced']
        },
        {
          word: 'comprehensive',
          reason: '学术写作常用词汇',
          difficulty: 3.2,
          priority: 5,
          relatedWords: ['complete', 'thorough', 'extensive']
        }
      ],
      topicsToExplore: [
        {
          topic: '学术写作词汇',
          wordCount: 45,
          averageDifficulty: 3.8,
          description: '提升学术写作表达能力的核心词汇'
        },
        {
          topic: '商务沟通词汇',
          wordCount: 38,
          averageDifficulty: 3.2,
          description: '职场和商务环境必备词汇'
        }
      ],
      reviewMaterials: [
        {
          type: 'article' as const,
          title: '学术词汇应用指南',
          description: '如何在写作中正确使用学术词汇',
          difficulty: 3,
          estimatedTime: 15,
          url: 'https://example.com/academic-vocab-guide'
        },
        {
          type: 'exercise' as const,
          title: '词汇应用练习',
          description: '通过练习巩固词汇掌握',
          difficulty: 2,
          estimatedTime: 20
        }
      ]
    })
  }

  async provideFeedback(_recommendationId: string, _feedback: any) {
    await this.delay()
    return this.createResponse(undefined)
  }

  async getRecommendationHistory(page = 1, limit = 20) {
    await this.delay()
    const items = Array.from({ length: limit }, (_, i) => ({
      id: `rec_${(page - 1) * limit + i + 1}`,
      type: ['review', 'study_time', 'difficulty', 'strategy'][Math.floor(Math.random() * 4)],
      title: `推荐${(page - 1) * limit + i + 1}`,
      description: `这是推荐${(page - 1) * limit + i + 1}的描述`,
      createdAt: this.getRandomDate(30),
      followed: Math.random() > 0.5,
      rating: Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 3 : undefined
    }))

    return this.createResponse({
      items,
      total: 100,
      page,
      limit
    })
  }

  async getRecommendationSettings() {
    await this.delay()
    return this.createResponse({
      enabled: true,
      frequency: 'daily' as const,
      types: ['review', 'study_time', 'difficulty', 'content'],
      maxRecommendations: 10,
      difficulty: 'balanced' as const,
      includeContentSuggestions: true
    })
  }

  async updateRecommendationSettings(_settings: any) {
    await this.delay()
    return this.createResponse(undefined)
  }
}

export const mockDataService = new MockDataService()