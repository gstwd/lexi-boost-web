<template>
  <div class="analytics-page min-h-screen bg-gray-50">
    <!-- 导航标签 -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-6xl mx-auto">
        <nav class="flex space-x-8">
          <router-link
            to="/analytics/dashboard"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="{
              'bg-blue-100 text-blue-700': $route.name === 'analytics-dashboard',
              'text-gray-500 hover:text-gray-700': $route.name !== 'analytics-dashboard'
            }"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            学习统计
          </router-link>

          <router-link
            to="/analytics/progress"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="{
              'bg-blue-100 text-blue-700': $route.name === 'progress-report',
              'text-gray-500 hover:text-gray-700': $route.name !== 'progress-report'
            }"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            进度报告
          </router-link>

          <router-link
            to="/analytics/mastery"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="{
              'bg-blue-100 text-blue-700': $route.name === 'mastery-analysis',
              'text-gray-500 hover:text-gray-700': $route.name !== 'mastery-analysis'
            }"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            掌握度分析
          </router-link>
        </nav>
      </div>
    </div>

    <!-- 路由内容 -->
    <div class="p-6">
      <div class="max-w-6xl mx-auto">
        <router-view />
      </div>
    </div>
  </div>
</template>