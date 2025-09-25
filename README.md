# Lexi Boost - 词汇学习Web应用

一个基于 Vue 3 的现代化词汇学习应用，帮助用户管理和学习单词，提供增删改查功能。

## 🚀 技术栈

### 核心技术
- **Vue 3** - 现代化的 JavaScript 前端框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 快速的前端构建工具
- **Pinia** - Vue 3 官方推荐的状态管理库
- **Vue Router** - Vue.js 官方路由管理器

### 样式与UI
- **TailwindCSS** - 实用优先的 CSS 框架
- **PostCSS** - CSS 后处理器
- **Autoprefixer** - CSS 自动添加浏览器前缀

### HTTP客户端
- **Axios** - Promise 基础的 HTTP 客户端

### 开发工具
- **vue-tsc** - Vue 组件的 TypeScript 类型检查器
- **@vitejs/plugin-vue** - Vite 的 Vue 插件

## 📁 项目结构

```
lexi-boost-web/
├── public/                    # 静态资源文件夹
│   └── vite.svg              # Vite 图标
├── src/                       # 源代码目录
│   ├── api/                   # API 相关文件
│   │   ├── client.ts         # HTTP 客户端配置 (Axios 实例)
│   │   ├── index.ts          # API 模块导出
│   │   └── words.ts          # 单词相关 API 接口
│   ├── pages/                # 页面组件
│   │   └── WordsPage.vue     # 单词列表页面
│   ├── router/               # 路由配置
│   │   └── index.ts          # Vue Router 路由定义
│   ├── store/                # 状态管理
│   │   ├── index.ts          # Pinia store 导出
│   │   └── words.ts          # 单词相关状态管理
│   ├── App.vue               # 根组件 (导航栏 + router-view)
│   ├── main.ts               # 应用入口文件
│   ├── style.css             # 全局样式文件 (TailwindCSS)
│   └── vite-env.d.ts         # Vite 环境类型声明
├── .env                      # 环境变量 (本地)
├── .env.example              # 环境变量示例文件
├── CLAUDE.md                 # Claude Code 项目说明文档
├── index.html                # HTML 模板
├── package.json              # 项目依赖和脚本配置
├── package-lock.json         # 依赖版本锁定文件
├── postcss.config.js         # PostCSS 配置
├── tailwind.config.js        # TailwindCSS 配置
├── tsconfig.json             # TypeScript 主配置文件
├── tsconfig.node.json        # Node.js 环境 TypeScript 配置
└── vite.config.ts            # Vite 构建工具配置
```

### 各部分作用说明

- **`src/api/`** - 处理所有HTTP请求，包含Axios客户端配置和词汇CRUD操作
- **`src/pages/`** - Vue页面组件，包含词汇列表界面
- **`src/router/`** - 路由配置，管理页面跳转和导航守卫
- **`src/store/`** - Pinia状态管理，处理全局状态（词汇数据、分页、加载状态等）

## ⚙️ 配置文件详解

### 1. `package.json` - 项目依赖和脚本配置
```json
{
  "name": "lexi-boost-web",           // 项目名称
  "private": true,                    // 私有项目，不发布到 npm
  "version": "0.0.0",                 // 项目版本号
  "type": "module",                   // 使用 ES 模块
  "scripts": {
    "dev": "vite",                    // 启动开发服务器
    "build": "vue-tsc && vite build", // 类型检查后构建生产版本
    "preview": "vite preview"          // 预览生产构建
  },
  "dependencies": {                   // 生产环境依赖
    "axios": "^1.6.0",              // HTTP 客户端
    "pinia": "^2.1.7",              // 状态管理
    "vue": "^3.4.0",                // Vue 3 核心
    "vue-router": "^4.2.5"          // 路由管理
  },
  "devDependencies": {               // 开发环境依赖
    "@types/node": "^24.5.2",       // Node.js 类型定义
    "@vitejs/plugin-vue": "^5.0.0", // Vite Vue 插件
    "autoprefixer": "^10.4.16",     // CSS 前缀自动添加
    "postcss": "^8.4.32",           // CSS 后处理器
    "tailwindcss": "^3.3.0",        // CSS 框架
    "typescript": "^5.2.0",         // TypeScript 编译器
    "vite": "^5.0.0",               // 构建工具
    "vue-tsc": "^1.8.0"             // Vue TypeScript 检查器
  }
}
```

### 2. `vite.config.ts` - Vite 构建工具配置
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'  // Vue 3 支持插件
import path from 'path'

export default defineConfig({
  plugins: [vue()],                   // 启用 Vue 插件
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')  // 设置 @ 别名指向 src 目录
    }
  }
})
```

### 3. `tsconfig.json` - TypeScript 主配置
```json
{
  "compilerOptions": {
    "target": "ES2020",                      // 编译目标版本
    "useDefineForClassFields": true,         // 使用标准的类字段定义
    "lib": ["ES2020", "DOM", "DOM.Iterable"], // 包含的库文件
    "module": "ESNext",                      // 模块系统
    "skipLibCheck": true,                    // 跳过库文件类型检查（提升编译速度）

    /* 打包工具模式 */
    "moduleResolution": "bundler",           // 模块解析策略（适用于 Vite）
    "allowImportingTsExtensions": true,      // 允许导入 .ts 扩展名
    "resolveJsonModule": true,               // 解析 JSON 模块
    "isolatedModules": true,                 // 独立模块（每个文件单独编译）
    "noEmit": true,                          // 不输出文件（由 Vite 处理）
    "jsx": "preserve",                       // 保留 JSX（由 Vue 处理）

    /* 代码检查 */
    "strict": true,                          // 启用严格模式
    "noUnusedLocals": true,                  // 检查未使用的局部变量
    "noUnusedParameters": true,              // 检查未使用的参数
    "noFallthroughCasesInSwitch": true,     // 检查 switch 语句的 fallthrough

    /* 路径映射 */
    "baseUrl": ".",                          // 基础路径
    "paths": {
      "@/*": ["src/*"]                       // @ 别名映射到 src/*
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"], // 包含的文件
  "references": [{ "path": "./tsconfig.node.json" }] // 引用 Node.js 配置
}
```

### 4. `tsconfig.node.json` - Node.js 环境 TypeScript 配置
```json
{
  "compilerOptions": {
    "composite": true,                       // 启用项目引用
    "skipLibCheck": true,                    // 跳过库检查
    "module": "ESNext",                      // 使用 ESNext 模块
    "moduleResolution": "bundler",           // 打包工具模块解析
    "allowSyntheticDefaultImports": true     // 允许合成默认导入
  },
  "include": ["vite.config.ts"]              // 仅包含 Vite 配置文件
}
```

### 5. `tailwind.config.js` - TailwindCSS 配置
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",                          // 扫描 HTML 文件
    "./src/**/*.{vue,js,ts,jsx,tsx}",       // 扫描 src 下所有相关文件
  ],
  theme: {
    extend: {},                              // 主题扩展（当前为空）
  },
  plugins: [],                               // 插件列表（当前为空）
}
```

### 6. `postcss.config.js` - PostCSS 配置
```javascript
export default {
  plugins: {
    tailwindcss: {},                         // TailwindCSS 插件
    autoprefixer: {},                        // 自动前缀插件
  },
}
```

### 7. `.env.example` - 环境变量示例
```bash
# API Base URL
VITE_API_BASE_URL=http://localhost:3001    # 后端 API 地址
```

### 8. `index.html` - HTML 模板
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />  <!-- 网站图标 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <!-- 响应式设置 -->
    <title>Lexi Boost Web</title>            <!-- 页面标题 -->
  </head>
  <body>
    <div id="app"></div>                     <!-- Vue 应用挂载点 -->
    <script type="module" src="/src/main.ts"></script> <!-- 应用入口脚本 -->
  </body>
</html>
```

## 🔄 项目开发流程

### 1. 环境准备
```bash
# 克隆项目
git clone <repository-url>
cd lexi-boost-web

# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env

# 编辑环境变量（根据需要修改API地址）
# VITE_API_BASE_URL=http://localhost:3001
```

### 2. 开发流程
```bash
# 启动开发服务器
npm run dev

# 项目将在 http://localhost:5173 启动
```

### 3. 构建和部署
```bash
# 类型检查 + 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 4. 项目架构模式

#### 状态管理模式
- 使用 Pinia store 管理全局状态
- Words Store 处理单词数据的 CRUD 操作
- 包含加载状态、错误处理、分页信息

#### API 调用模式
- 统一的 Axios 客户端配置
- 集中的 API 接口定义
- 请求/响应拦截器用于日志和错误处理

#### 路由管理
- 声明式路由配置
- 导航守卫设置动态页面标题
- 默认重定向到 `/words` 页面

#### 组件模式
- 使用 Composition API 和 `<script setup>` 语法
- 页面组件放在 `src/pages/` 目录
- 路径别名 `@` 指向 `src/` 目录

## 📊 数据模型

### Word 接口
```typescript
interface Word {
  id: number                    // 单词ID
  word: string                  // 单词内容
  meaning: string               // 中文释义
  pronunciation?: string        // 发音（可选）
  difficulty: 'easy' | 'medium' | 'hard'  // 难度等级
  tags?: string[]              // 标签列表（可选）
}
```

### API 响应格式
```typescript
// 分页响应
interface PaginatedResponse<T> {
  data: T[]                     // 数据列表
  pagination: {
    page: number                // 当前页码
    limit: number               // 每页条数
    total: number               // 总条数
  }
}
```

## 🛠️ 开发规范

### 1. 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 模式
- 使用 `<script setup>` 语法糖
- 组件名使用 PascalCase
- 文件名使用 camelCase

### 2. 样式规范
- 优先使用 TailwindCSS 工具类
- 避免编写自定义 CSS
- 使用响应式设计原则
- 保持一致的间距和颜色方案

### 3. 提交规范
- 使用清晰的提交信息
- 功能开发使用 feature 分支
- 代码审查后合并到主分支

## 🔧 故障排除

### 常见问题
1. **端口占用**: 如果 5173 端口被占用，Vite 会自动选择下一个可用端口
2. **API 连接失败**: 检查 `.env` 文件中的 `VITE_API_BASE_URL` 配置
3. **类型错误**: 运行 `npm run build` 查看详细的 TypeScript 错误信息

### 开发工具推荐
- **VS Code** + Vue Language Features (Volar) 扩展
- **Vue DevTools** 浏览器扩展（用于调试）
- **Tailwind CSS IntelliSense** 扩展

## 📈 后续开发建议

### 功能扩展
- 添加用户认证系统
- 实现单词学习进度跟踪
- 添加语音播放功能
- 实现离线模式

### 技术优化
- 添加单元测试 (Vitest)
- 实现 PWA 功能
- 添加国际化支持 (Vue I18n)
- 优化 Bundle 大小

---

> 这个项目使用现代化的前端技术栈，适合学习 Vue 3 生态系统的最佳实践。如有问题，请参考各技术的官方文档或提交 Issue。