import { createRouter, createWebHistory } from 'vue-router'
import WordsPage from '@/pages/WordsPage.vue'
import InputPage from '@/pages/InputPage.vue'
import ReviewPage from '@/pages/ReviewPage.vue'
import AnalyticsPage from '@/pages/AnalyticsPage.vue'
import RecommendationsPage from '@/pages/RecommendationsPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/DashboardPage.vue'),
      meta: {
        title: '学习仪表板',
        icon: 'dashboard'
      }
    },
    {
      path: '/words',
      name: 'words',
      component: WordsPage,
      meta: {
        title: '单词库',
        icon: 'book'
      }
    },
    {
      path: '/input',
      name: 'input',
      component: InputPage,
      meta: {
        title: '录入单词',
        icon: 'plus'
      }
    },
    {
      path: '/review',
      name: 'review',
      component: ReviewPage,
      children: [
        {
          path: '',
          redirect: 'session'
        },
        {
          path: 'session',
          name: 'review-session',
          component: () => import('@/components/Review/ReviewInterface.vue'),
          meta: {
            title: '开始复习'
          }
        },
        {
          path: 'history',
          name: 'review-history',
          component: () => import('@/components/Review/ReviewHistory.vue'),
          meta: {
            title: '复习历史'
          }
        },
        {
          path: 'settings',
          name: 'review-settings',
          component: () => import('@/components/Review/ReviewSettings.vue'),
          meta: {
            title: '复习设置'
          }
        }
      ],
      meta: {
        title: '复习系统',
        icon: 'refresh'
      }
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: AnalyticsPage,
      children: [
        {
          path: '',
          redirect: 'dashboard'
        },
        {
          path: 'dashboard',
          name: 'analytics-dashboard',
          component: () => import('@/components/Analytics/AnalyticsDashboard.vue'),
          meta: {
            title: '学习统计'
          }
        },
        {
          path: 'progress',
          name: 'progress-report',
          component: () => import('@/components/Analytics/ProgressReport.vue'),
          meta: {
            title: '进度报告'
          }
        },
        {
          path: 'mastery',
          name: 'mastery-analysis',
          component: () => import('@/components/Analytics/MasteryAnalysis.vue'),
          meta: {
            title: '掌握度分析'
          }
        },
        {
          path: 'charts',
          name: 'charts-demo',
          component: () => import('@/components/Charts/ChartsDemo.vue'),
          meta: {
            title: '图表演示'
          }
        }
      ],
      meta: {
        title: '学习分析',
        icon: 'chart'
      }
    },
    {
      path: '/recommendations',
      name: 'recommendations',
      component: RecommendationsPage,
      meta: {
        title: '智能推荐',
        icon: 'lightbulb'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard'
    }
  ]
})

router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - Lexi Boost`
  }
  next()
})

export default router
