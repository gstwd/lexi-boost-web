<template>
  <div class="review-page min-h-screen bg-gray-50">
    <!-- 导航标签 -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-4xl mx-auto">
        <nav class="flex space-x-8">
          <router-link
            to="/review/session"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="{
              'bg-blue-100 text-blue-700': $route.name === 'review-session',
              'text-gray-500 hover:text-gray-700': $route.name !== 'review-session'
            }"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a6 6 0 006 6v-3"/>
            </svg>
            开始复习
          </router-link>

          <router-link
            to="/review/history"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="{
              'bg-blue-100 text-blue-700': $route.name === 'review-history',
              'text-gray-500 hover:text-gray-700': $route.name !== 'review-history'
            }"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            复习历史
          </router-link>

          <router-link
            to="/review/settings"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="{
              'bg-blue-100 text-blue-700': $route.name === 'review-settings',
              'text-gray-500 hover:text-gray-700': $route.name !== 'review-settings'
            }"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            复习设置
          </router-link>
        </nav>
      </div>
    </div>

    <!-- 路由内容 -->
    <div class="p-6">
      <div class="max-w-4xl mx-auto">
        <router-view />
      </div>
    </div>
  </div>
</template>