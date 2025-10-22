<template>
  <div class="word-page">
    <el-container>
      <el-header height="auto" class="header">
        <el-row justify="center">
          <el-col :span="20">
            <div class="header-content">
              <h1 class="page-title">词汇库</h1>
              <p class="page-subtitle">管理和探索你的词汇收藏</p>
            </div>
          </el-col>
        </el-row>
      </el-header>

      <el-main>
        <el-row justify="center">
          <el-col :span="20">
            <el-card v-loading="loading" element-loading-text="加载中...">
              <template #header>
                <div class="card-header">
                  <el-row justify="space-between" align="middle">
                    <el-col :span="12">
                      <el-text type="info">显示 {{ wordRecords.length }} / {{ recordPagination.total }} 个单词</el-text>
                    </el-col>
                    <el-col :span="12" style="text-align: right">
                      <el-button type="primary" :icon="Plus" @click="showAddDialog = true">添加单词</el-button>
                      <el-button :icon="Refresh" @click="refreshWords">刷新</el-button>
                    </el-col>
                  </el-row>
                </div>
              </template>

              <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb-4">
                <template #default>
                  <el-button type="danger" size="small" @click="refreshWords">重试</el-button>
                </template>
              </el-alert>

              <el-empty v-if="!loading && wordRecords.length === 0" description="暂无单词数据">
                <el-button type="primary" @click="showAddDialog = true">添加第一个单词</el-button>
              </el-empty>

              <el-row v-else :gutter="16">
                <el-col v-for="word in wordRecords" :key="word.id" :xs="24" :sm="12" :md="8" :lg="6" class="mb-4">
                  <el-card class="word-card" shadow="hover">
                    <template #header>
                      <div class="word-header">
                        <el-text tag="h3" class="word-title">
                          {{ word.word }}
                        </el-text>
                        <!-- TODO 以前是单词难度，待修改展示内容 -->
                        <el-tag :type="getDifficultyTagType(word.meaning)" size="small">
                          {{ getDifficultyText(word.meaning) }}
                        </el-tag>
                      </div>
                    </template>

                    <div class="word-content">
                      <el-text class="word-meaning">
                        {{ word.meaning }}
                      </el-text>

                      <div v-if="word.sourceType" class="word-pronunciation">
                        <el-text type="info" size="small">
                          <!-- TODO 以前是发音，待修改 -->
                          <el-icon><microphone /></el-icon>
                          {{ word.sourceType }}
                        </el-text>
                      </div>

                      <div v-if="word.tags && word.tags.length > 0" class="word-tags">
                        <el-tag v-for="tag in word.tags" :key="tag" size="small" effect="plain" class="tag-item">
                          {{ tag }}
                        </el-tag>
                      </div>
                    </div>

                    <template #footer>
                      <div class="word-actions">
                        <el-button type="primary" size="small" :icon="Edit" @click="editWord(word)">编辑</el-button>
                        <el-button type="danger" size="small" :icon="Delete" @click="deleteWord(word)">删除</el-button>
                      </div>
                    </template>
                  </el-card>
                </el-col>
              </el-row>

              <div v-if="totalPages > 1" class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="recordPagination.page"
                  :page-size="recordPagination.limit"
                  :total="recordPagination.total"
                  layout="prev, pager, next, jumper"
                  background
                  @current-change="goToPage"
                />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>

    <el-dialog v-model="showAddDialog" title="添加单词" width="500px" :before-close="handleDialogClose">
      <el-form :model="wordForm" label-width="80px">
        <el-form-item label="单词" required>
          <el-input v-model="wordForm.word" placeholder="请输入单词" />
        </el-form-item>
        <el-form-item label="释义" required>
          <el-input v-model="wordForm.meaning" type="textarea" :rows="3" placeholder="请输入单词释义" />
        </el-form-item>
        <el-form-item label="发音">
          <el-input v-model="wordForm.pronunciation" placeholder="请输入发音" />
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="wordForm.difficulty" placeholder="请选择难度">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="wordForm.tagsInput" placeholder="用逗号分隔多个标签" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSaveWord">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, reactive } from 'vue'
import { useWordsStore } from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Edit, Delete, Microphone } from '@element-plus/icons-vue'
import type { UserWordRecord } from '@/types'

const wordsStore = useWordsStore()

const { wordRecords, loading, error, recordPagination } = wordsStore
const totalPages = computed(() => wordsStore.totalRecordPages)

const showAddDialog = ref(false)
const wordForm = reactive({
  word: '',
  meaning: '',
  pronunciation: '',
  difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  tagsInput: ''
})

const getDifficultyTagType = (difficulty: string) => {
  const typeMap = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return typeMap[difficulty as keyof typeof typeMap] || 'info'
}

const getDifficultyText = (difficulty: string) => {
  const textMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return textMap[difficulty as keyof typeof textMap] || difficulty
}

const refreshWords = () => {
  wordsStore.fetchWordRecords({}, recordPagination.page, recordPagination.limit)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    wordsStore.fetchWordRecords({}, page, recordPagination.limit)
  }
}

const handleDialogClose = () => {
  showAddDialog.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(wordForm, {
    word: '',
    meaning: '',
    pronunciation: '',
    difficulty: 'medium' as const,
    tagsInput: ''
  })
}

const handleSaveWord = async () => {
  if (!wordForm.word || !wordForm.meaning) {
    ElMessage.error('请填写单词和释义')
    return
  }

  try {
    const tags = wordForm.tagsInput
      ? wordForm.tagsInput
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean)
      : []

    // await wordsStore.createWordRecord({
    //   word: wordForm.word,
    //   meaning: wordForm.meaning,
    //   tags: tags.length > 0 ? tags : undefined
    // })

    ElMessage.success('单词添加成功')
    handleDialogClose()
    refreshWords()
  } catch (error) {
    ElMessage.error('添加失败，请稍后重试')
  }
}

const editWord = (word: UserWordRecord) => {
  ElMessage.info('编辑功能开发中...')
}

const deleteWord = async (word: UserWordRecord) => {
  try {
    await ElMessageBox.confirm(`确定要删除单词 "${word.word}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await wordsStore.deleteWordRecord(word.id)
    ElMessage.success('删除成功')
    refreshWords()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

onMounted(() => {
  refreshWords()
})
</script>

<style scoped>
.word-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.card-header {
  padding: 0;
}

.word-card {
  height: 100%;
  transition: all 0.3s ease;
}

.word-card:hover {
  transform: translateY(-4px);
}

.word-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}

.word-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.word-content {
  padding: 16px 0;
}

.word-meaning {
  display: block;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
}

.word-pronunciation {
  margin-bottom: 12px;
}

.word-pronunciation .el-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.word-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  font-size: 12px;
}

.word-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .word-actions {
    justify-content: center;
  }
}
</style>
