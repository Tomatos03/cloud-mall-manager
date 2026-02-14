<template>
  <div class="h-full flex flex-col p-5 bg-[#f5f7fa]">
    <!-- 搜索栏 -->
    <div class="bg-white p-4 rounded mb-4 shadow-sm">
      <el-form :inline="true" :model="formFilters" class="flex-wrap">
        <el-form-item label="菜单名称">
          <el-input v-model="formFilters.label" placeholder="请输入菜单名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="路由地址">
          <el-input v-model="formFilters.route" placeholder="请输入路由地址" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格卡片 -->
    <div class="flex-1 bg-white p-4 rounded shadow-sm flex flex-col overflow-hidden">
      <!-- 表格头部操作 -->
      <div class="flex justify-between items-center mb-4">
        <div class="flex gap-2">
          <el-button @click="toggleExpand">
            {{ isExpanded ? '收起全部' : '展开全部' }}
          </el-button>
          <el-button v-if="hasOperatePermission()" type="primary" @click="handleAddCatalog">
            添加目录
          </el-button>
        </div>
        <div class="flex gap-2">
          <el-button circle @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <div class="flex-1 overflow-hidden">
        <Table
          ref="tableRef"
          :data="filteredTableData"
          :columns="tableColumns"
          row-key="id"
          highlight-current-row
          height="100%"
        >
          <template #label="{ row }">
            <div class="flex items-center">
              <el-icon v-if="row.meta?.icon" class="mr-2"><component :is="row.meta.icon" /></el-icon>
              <span>{{ row.label }}</span>
            </div>
          </template>

          <template #type="{ row }">
            <el-tag :type="getMenuTypeTag(row)">{{ getMenuTypeText(row) }}</el-tag>
          </template>

          <template #path="{ row }">
            <span class="text-gray-500">{{ row.meta?.link || row.path || '-' }}</span>
          </template>

          <template #status>
            <el-tag type="success">启用</el-tag>
          </template>

          <template #action="{ row }">
            <el-button link type="primary" @click="handleAddAuth(row)">新增</el-button>
            <el-button link type="primary" @click="handleEditAuth(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDeleteAuth(row)">删除</el-button>
          </template>
        </Table>
      </div>
    </div>

    <!-- 菜单弹窗 -->
    <MenuDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :editData="editData"
      :lockType="lockMenuType"
      :isEdit="isEdit"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, nextTick } from 'vue'
  import Table from '@/components/table/Table.vue'
  import MenuDialog from './modules/menu-dialog.vue'
  import { fetchUserRouteMenuTree, delMenu, addMenu } from '@/api/department'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import { Refresh } from '@element-plus/icons-vue'
  import { useUserStore } from '@/stores/user'
  import { useRoute } from 'vue-router'

  defineOptions({ name: 'Department' })

  // 状态管理
  const loading = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()

  const userStore = useUserStore()
  const route = useRoute()

  const hasOperatePermission = (): boolean => {
    // 简化权限判断，或者根据实际业务逻辑调整
    return true 
  }

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogType = ref<'menu' | 'catalog'>('menu')
  const editData = ref<any>(null)
  const lockMenuType = ref(false)
  const isEdit = ref(false)

  // 搜索相关
  const initialSearchState = {
    label: '',
    route: ''
  }

  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })

  const tableColumns = [
    { id: '1', label: '菜单名称', key: 'label', width: 220 },
    { id: '2', label: '类型', key: 'type', width: 100 },
    { id: '3', label: '路由/链接', key: 'path' },
    { id: '4', label: '排序', key: 'sort', width: 80 },
    { id: '5', label: '状态', key: 'status', width: 100 }
  ] as any

  onMounted(() => {
    getMenuList()
  })

  const tableData = ref<any[]>([])

  const getMenuList = async () => {
    loading.value = true
    const res = await fetchUserRouteMenuTree()
    tableData.value = res.data
    loading.value = false
  }

  const getMenuTypeTag = (row: any) => {
    if (row.meta?.isAuthButton) return 'danger'
    if (row.meta?.type === 'catalog') return 'info'
    if (row.meta?.link && row.meta?.isIframe) return 'success'
    return 'primary'
  }

  const getMenuTypeText = (row: any) => {
    if (row.meta?.isAuthButton) return '按钮'
    if (row.meta?.type === 'catalog') return '目录'
    if (row.meta?.link && row.meta?.isIframe) return '内嵌'
    return '菜单'
  }

  const handleReset = () => {
    Object.assign(formFilters, initialSearchState)
    handleSearch()
  }

  const handleSearch = () => {
    Object.assign(appliedFilters, formFilters)
  }

  const handleRefresh = () => {
    getMenuList()
  }

  const searchMenu = (items: any[]): any[] => {
    const results: any[] = []
    for (const item of items) {
      const searchLabel = appliedFilters.label.toLowerCase()
      const searchRoute = appliedFilters.route.toLowerCase()
      const labelMatch = !searchLabel || item.label.toLowerCase().includes(searchLabel)
      const pathMatch = !searchRoute || (item.path || '').toLowerCase().includes(searchRoute)

      let matchedChildren: any[] = []
      if (item.children && item.children.length > 0) {
        matchedChildren = searchMenu(item.children)
      }

      if (labelMatch || pathMatch || matchedChildren.length > 0) {
        results.push({
          ...item,
          children: matchedChildren.length > 0 ? matchedChildren : item.children
        })
      }
    }
    return results
  }

  const filteredTableData = computed(() => {
    if (!appliedFilters.label && !appliedFilters.route) return tableData.value
    return searchMenu(tableData.value)
  })

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    const processRows = (data: any[]) => {
      data.forEach(item => {
        if (item.children && item.children.length > 0) {
          tableRef.value?.elTableRef?.toggleRowExpansion(item, isExpanded.value)
          processRows(item.children)
        }
      })
    }
    processRows(filteredTableData.value)
  }

  const handleAddCatalog = () => {
    dialogType.value = 'catalog'
    editData.value = null
    lockMenuType.value = true
    isEdit.value = false
    dialogVisible.value = true
  }

  const handleAddAuth = (row: any) => {
    dialogType.value = 'menu'
    editData.value = { parentId: row.id }
    lockMenuType.value = false
    isEdit.value = false
    dialogVisible.value = true
  }

  const handleEditAuth = (row: any) => {
    dialogType.value = row.meta?.type === 'catalog' ? 'catalog' : 'menu'
    editData.value = JSON.parse(JSON.stringify(row))
    lockMenuType.value = false
    isEdit.value = true
    dialogVisible.value = true
  }

  const handleDeleteAuth = (row: any) => {
    ElMessageBox.confirm('确定要删除该项吗？', '提示', {
      type: 'warning'
    }).then(async () => {
      await delMenu([row.id])
      ElMessage.success('删除成功')
      getMenuList()
    })
  }

  const handleSubmit = async (formData: any, isEditMode: boolean) => {
    if (isEditMode) {
      // update logic
    } else {
      await addMenu(formData)
    }
    dialogVisible.value = false
    getMenuList()
  }
</script>

<style scoped>
/* Add any necessary styles here */
</style>
