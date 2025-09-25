<template>
  <div id="app">
    <el-container>
      <el-header height="auto" class="app-header">
        <div class="nav-content">
          <div class="logo-section">
            <router-link to="/" class="logo">
              <el-text tag="h1" size="large" class="logo-text">Lexi Boost</el-text>
            </router-link>
          </div>
          <div class="nav-section">
            <el-menu
              :default-active="$route.path"
              mode="horizontal"
              :ellipsis="false"
              router
              class="nav-menu"
            >
              <el-menu-item index="/words" class="nav-item">
                <el-icon><Collection /></el-icon>
                词汇库
              </el-menu-item>
            </el-menu>
          </div>
        </div>
      </el-header>

      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { Collection } from '@element-plus/icons-vue'
</script>

<style scoped>
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 12px 0;
  z-index: 1000;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  flex-shrink: 0;
}

.logo {
  text-decoration: none;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.nav-section {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.nav-menu {
  border-bottom: none;
  background: transparent;
}

.nav-item {
  font-weight: 500;
  font-size: 15px;
}

.nav-item .el-icon {
  margin-right: 6px;
}

.app-main {
  padding: 0;
  min-height: calc(100vh - 80px);
}

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

@media (max-width: 768px) {
  .nav-content {
    padding: 0 16px;
  }

  .logo-text {
    font-size: 20px;
  }

  .nav-item {
    font-size: 14px;
    padding: 0 12px;
  }
}
</style>