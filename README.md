# Lexi Boost - 词汇学习应用

一个现代化的 Vue 3 词汇学习 Web 应用，具有智能复习系统、学习分析和个性化推荐功能。

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 8

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

### 构建

```bash
# 生产环境构建（包含类型检查）
npm run build

# 开发环境构建（跳过类型检查，更快）
npm run build:dev

# 仅类型检查
npm run type-check
```

### 代码质量检查

```bash
# 运行 ESLint 检查代码质量
npm run lint

# 运行 ESLint 并自动修复问题
npm run lint:fix

# 使用 Prettier 格式化代码
npm run format

# 检查代码格式是否正确
npm run format:check

# 运行 linting 和格式化（推荐）
npm run lint:format
```

### 预览构建

```bash
npm run preview
```

## 🏗️ 项目结构

```
src/
├── api/              # API 接口定义
├── components/       # 可复用组件
├── pages/           # 页面组件
├── router/          # 路由配置
├── store/           # Pinia 状态管理
├── types/           # TypeScript 类型定义
├── utils/           # 工具函数
└── services/        # 业务逻辑服务
```

## 🎯 核心功能

### 📊 学习仪表板

- 学习进度概览
- 今日复习计划
- 统计数据可视化

### ✍️ 智能单词录入

- 重复检测与提醒
- 上下文信息记录
- 置信度评估

### 📚 词汇库管理

- 完整的 CRUD 操作
- 搜索和过滤功能
- 批量操作支持

### 🧠 艾宾浩斯复习系统

- 基于遗忘曲线的智能调度
- 多种复习模式
- 个性化难度调整

### 📈 学习分析

- 详细的学习统计
- 进度趋势图表
- 掌握度分析

### 🤖 智能推荐

- AI 驱动的学习建议
- 个性化复习计划
- 学习策略优化

## 🛠️ 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **UI 库**: Element Plus
- **图表**: ECharts + vue-echarts
- **HTTP 客户端**: Axios
- **代码质量**: ESLint + Prettier
- **样式**: CSS3 + Element Plus 主题

## 📦 最新更新

### 2024年更新记录

#### 最新功能

1. **代码质量工具**: 集成 ESLint 9.x 和 Prettier，提供完整的代码质量检查和格式化
2. **改进的构建流程**: 新增多种构建和检查命令，支持不同开发场景
3. **Vue 专用规则**: 配置了适合项目的 Vue 代码规范，平衡严格性和实用性

#### 解决的问题

1. **构建工具更新**: 升级 vue-tsc 到 v2.2.12 版本，解决构建兼容性问题
2. **导入路径修复**: 修正了多个文件中的导入路径错误
3. **未使用导入清理**: 清理了所有未使用的 TypeScript 导入声明
4. **构建配置优化**: 添加了开发构建选项，支持快速构建

#### 技术改进

- 增加了分离的类型检查命令
- 优化了构建流程
- 更新了项目文档

#### 当前状态

- ✅ 开发服务器正常运行
- ✅ 生产构建功能正常
- ✅ 代码质量工具完整配置（ESLint + Prettier）
- ✅ 类型检查和构建流程优化
- ✅ 基础功能和核心架构完整
- ⚠️ 部分高级组件存在类型检查待完善

## 🔧 开发说明

### 类型检查

项目使用严格的 TypeScript 配置。如需快速开发构建，建议使用：

```bash
npm run build:dev  # 跳过类型检查的快速构建
npm run type-check # 单独进行类型检查
```

### API 配置

在项目根目录创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_USE_MOCK_DATA=true
```

### 开发工作流

1. 开发时使用 `npm run dev`
2. 代码提交前运行 `npm run lint:format` 确保代码质量
3. 构建测试使用 `npm run build:dev`
4. 部署前使用 `npm run build`（包含类型检查）

### 代码规范

项目配置了 ESLint 和 Prettier 来确保代码质量和一致性：

- **ESLint**: 使用最新的 9.x 平面配置格式
- **Vue 规则**: 针对 Vue 3 Composition API 优化的规则集
- **TypeScript**: 严格的类型检查规则
- **格式化**: Prettier 自动格式化，单引号、无分号风格

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Vite 文档](https://vitejs.dev/)
- [Pinia 文档](https://pinia.vuejs.org/)
