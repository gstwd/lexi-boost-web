<template>
  <div class="input-page min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">录入新单词</h1>
        <p class="text-gray-600 mt-2">记录你遇到的新单词，包括语境和来源信息</p>
      </div>

      <!-- 录入组件 -->
      <EnhancedWordInput />
    </div>
  </div>
</template>

<script setup lang="ts">
import EnhancedWordInput from '@/components/WordInput/EnhancedWordInput.vue'
</script>