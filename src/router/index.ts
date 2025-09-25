import { createRouter, createWebHistory } from 'vue-router'
import WordsPage from '@/pages/WordsPage.vue'

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
