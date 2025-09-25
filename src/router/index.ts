import { createRouter, createWebHistory } from 'vue-router'
import WordsPage from '@/pages/WordsPage.vue'
import StudyPage from '@/pages/StudyPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/words'
    },
    {
      path: '/words',
      name: 'words',
      component: WordsPage,
      meta: {
        title: 'Words List'
      }
    },
    {
      path: '/study',
      name: 'study',
      component: StudyPage,
      meta: {
        title: 'Study'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/words'
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
