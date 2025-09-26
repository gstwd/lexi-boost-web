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
- **图表**: Chart.js + vue-chartjs
- **HTTP 客户端**: Axios
- **样式**: CSS3 + Element Plus 主题

## 📦 最新更新

### 2024年修复记录

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
- ✅ 生产构建功能正常（跳过类型检查）
- ⚠️ 严格类型检查存在一些高级组件的类型不匹配问题
- ✅ 基础功能和核心架构完整

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
```

### 开发工作流
1. 开发时使用 `npm run dev`
2. 构建测试使用 `npm run build:dev`
3. 部署前使用 `npm run build`（包含类型检查）

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