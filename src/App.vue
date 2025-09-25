<template>
  <div id="app">
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/" class="text-xl font-bold text-indigo-600">
                Lexi Boost
              </router-link>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/words"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                active-class="border-indigo-500 text-gray-900"
              >
                Words
              </router-link>
              <router-link
                to="/study"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                active-class="border-indigo-500 text-gray-900"
              >
                Study
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.router-link-active {
  @apply border-indigo-500 text-gray-900;
}
</style>