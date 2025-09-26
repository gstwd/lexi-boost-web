<template>
  <div class="recommendations-page min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">智能推荐</h1>
        <p class="text-gray-600 mt-2">根据你的学习情况提供个性化的学习建议和优化方案</p>
      </div>

      <!-- 推荐仪表板 -->
      <recommendations-dashboard />
    </div>
  </div>
</template>

<script setup lang="ts">
import RecommendationsDashboard from '@/components/Recommendations/RecommendationsDashboard.vue'
</script>
