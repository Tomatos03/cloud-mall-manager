<template>
    <div class="p-5 bg-gray-50 min-h-[calc(100vh-120px)]">
        <el-card shadow="never" class="border-none! rounded-lg!">
            <!-- 顶部操作栏 -->
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-3">
                    <el-button-group>
                        <el-tooltip content="展开全部" placement="top">
                            <el-button :icon="Expand" @click="toggleExpandAll(true)" />
                        </el-tooltip>
                        <el-tooltip content="收起全部" placement="top">
                            <el-button :icon="Fold" @click="toggleExpandAll(false)" />
                        </el-tooltip>
                    </el-button-group>
                </div>
                <div class="flex items-center gap-3">
                    <el-button
                        v-auth="CATEGORY_PERMISSIONS.ADD"
                        type="primary"
                        :icon="Plus"
                        @click="openAddDialog(null)"
                    >
                        添加一级分类
                    </el-button>
                    <el-button :icon="Refresh" @click="loadCategoryTree" :loading="loading" />
                </div>
            </div>

            <!-- 分类表格 -->
            <el-table
                ref="tableRef"
                v-loading="loading"
                :data="categoryTree"
                row-key="id"
                class="w-full rounded overflow-hidden"
                :header-cell-style="{ backgroundColor: '#f8f9fb', color: '#606266' }"
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            >
                <el-table-column prop="name" label="分类名称" min-width="220">
                    <template #default="{ row }">
                        <span class="font-medium text-gray-800">{{ row.name }}</span>
                    </template>
                </el-table-column>

                <el-table-column prop="sort" label="排序" width="100" align="center" />

                <el-table-column prop="status" label="状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-switch
                            v-model="row.status"
                            :active-value="1"
                            :inactive-value="0"
                            size="small"
                            @change="(val: any) => handleStatusChange(row, val)"
                            :disabled="isStatusDisabled(row)"
                        />
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="200" align="right" fixed="right">
                    <template #default="{ row }">
                        <div class="flex justify-end gap-1">
                            <el-button
                                v-if="canAddChild(row)"
                                v-auth="CATEGORY_PERMISSIONS.ADD"
                                link
                                type="primary"
                                @click="openAddDialog(row)"
                            >
                                添加子类
                            </el-button>
                            <el-button
                                v-auth="CATEGORY_PERMISSIONS.EDIT"
                                link
                                type="primary"
                                @click="editCategory(row)"
                            >
                                编辑
                            </el-button>
                            <el-button
                                v-auth="CATEGORY_PERMISSIONS.DELETE"
                                link
                                type="danger"
                                @click="delCategory(row)"
                            >
                                删除
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 添加/编辑分类对话框 -->
        <el-dialog
            v-model="dialogVisible"
            :title="dialogTitle"
            width="460px"
            destroy-on-close
            class="custom-minimal-dialog"
        >
            <el-form :model="formData" :rules="rules" ref="formRef" label-position="top" class="px-1">
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入分类名称" />
                </el-form-item>
                <el-form-item label="上级分类" v-if="formData.parentId">
                    <el-input :value="parentCategoryName" disabled />
                </el-form-item>
                <div class="flex gap-5">
                    <el-form-item label="状态" prop="status" class="flex-1">
                        <el-radio-group v-model="formData.status">
                            <el-radio :label="1">启用</el-radio>
                            <el-radio :label="0">禁用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="排序值" prop="sort" class="flex-1">
                        <el-input-number
                            v-model="formData.sort"
                            :min="0"
                            controls-position="right"
                            class="w-full!"
                        />
                    </el-form-item>
                </div>
            </el-form>
            <template #footer>
                <div class="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" :loading="submitLoading" @click="submitForm">
                        提交
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
    import { ref, reactive, computed, onMounted, nextTick } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { Plus, Refresh, Expand, Fold } from '@element-plus/icons-vue'
    import {
        deleteCategory,
        updateCategory,
        addCategory,
        getCategoryAllTree,
        type CategoryNode,
        type CategoryFormData,
    } from '@/api/category'
    import { CATEGORY_PERMISSIONS } from '@/constants/permissions'

    type Category = CategoryNode

    interface FormData extends CategoryFormData {
        parentStatus?: number | boolean
    }

    const tableRef = ref()
    const categoryTree = ref<Category[]>([])
    const loading = ref(false)
    const submitLoading = ref(false)
    const dialogVisible = ref(false)
    const parentCategoryName = ref('')
    const formRef = ref()

    const formData = reactive<FormData>({
        name: '',
        status: 1,
        sort: 1,
        parentId: null,
        level: 1,
        parentStatus: undefined,
    })

    const dialogTitle = computed(() => {
        if (formData.id) return '编辑分类'
        return formData.parentId ? '添加子分类' : '添加一级分类'
    })

    const rules = {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
    }

    const normalizeStatus = (status?: number | boolean): number => {
        if (status === undefined || status === null) return 1
        return typeof status === 'boolean' ? (status ? 1 : 0) : Number(status) === 0 ? 0 : 1
    }

    const canAddChild = (row: Category): boolean => Number(row.level ?? 0) < 3

    const isStatusDisabled = (row: Category) => {
        if (row.parentId) {
            const parent = findCategoryInTree(categoryTree.value, row.parentId)
            return normalizeStatus(parent?.status) === 0
        }
        return false
    }

    const toggleExpandAll = (expanded: boolean) => {
        const toggleRow = (rows: Category[]) => {
            rows.forEach((row) => {
                tableRef.value?.toggleRowExpansion(row, expanded)
                if (row.children) toggleRow(row.children)
            })
        }
        toggleRow(categoryTree.value)
    }

    const normalizeTreeData = (list: Category[]): Category[] => {
        return list.map((item) => {
            const newItem = {
                ...item,
                status: normalizeStatus(item.status),
            }
            if (newItem.children && newItem.children.length > 0) {
                newItem.children = normalizeTreeData(newItem.children)
            }
            return newItem
        })
    }

    const loadCategoryTree = async () => {
        loading.value = true
        try {
            const response = await getCategoryAllTree()
            const list = (Array.isArray(response) ? response : (response as any).data) || []
            categoryTree.value = normalizeTreeData(list)
        } finally {
            loading.value = false
        }
    }

    const handleStatusChange = async (row: Category, val: number) => {
        if (loading.value) return

        try {
            const submitData: CategoryFormData = {
                id: row.id,
                name: row.name,
                status: val,
                sort: row.sort || 0,
                level: Number(row.level || 1),
                parentId: row.parentId
            }
            await updateCategory(submitData)
            ElMessage.success('状态更新成功')
            await loadCategoryTree()
        } catch {
            row.status = val === 1 ? 0 : 1
        }
    }

    const openAddDialog = (parent: Category | null) => {
        if (parent && Number(parent.level ?? 0) >= 3) {
            ElMessage.warning('最多只能添加三级分类')
            return
        }
        Object.assign(formData, {
            id: undefined,
            name: '',
            status: parent ? normalizeStatus(parent.status) : 1,
            sort: 1,
            parentId: parent ? parent.id : null,
            level: parent ? Number(parent.level ?? 0) + 1 : 1,
            parentStatus: parent?.status,
        })
        parentCategoryName.value = parent?.name || ''
        dialogVisible.value = true
        nextTick(() => formRef.value?.clearValidate())
    }

    const editCategory = (row: Category) => {
        Object.assign(formData, {
            id: row.id,
            name: row.name,
            status: normalizeStatus(row.status),
            sort: row.sort ?? 1,
            parentId: row.parentId ?? null,
            level: Number(row.level ?? 1),
        })
        if (row.parentId) {
            const parent = findCategoryInTree(categoryTree.value, row.parentId)
            parentCategoryName.value = parent?.name || ''
        } else {
            parentCategoryName.value = ''
        }
        dialogVisible.value = true
        nextTick(() => formRef.value?.clearValidate())
    }

    const delCategory = async (row: Category) => {
        if (row.children && row.children.length > 0) {
            return ElMessage.warning('该分类下有子分类，无法删除')
        }
        try {
            await ElMessageBox.confirm(`确定删除分类 "${row.name}" 吗？`, '提示', {
                type: 'warning',
                confirmButtonText: '删除',
                cancelButtonText: '取消',
            })
            await deleteCategory(row.id)
            ElMessage.success('删除成功')
            loadCategoryTree()
        } catch {}
    }

    const findCategoryInTree = (tree: Category[], targetId: string): Category | null => {
        for (const item of tree) {
            if (item.id === targetId) return item
            if (item.children) {
                const found = findCategoryInTree(item.children, targetId)
                if (found) return found
            }
        }
        return null
    }

    const submitForm = async () => {
        if (!(await formRef.value?.validate())) return
        submitLoading.value = true
        try {
            const submitData: CategoryFormData = {
                id: formData.id,
                name: formData.name,
                status: formData.status,
                sort: formData.sort,
                level: Number(formData.level || 1),
                parentId: formData.parentId
            }

            if (formData.id) {
                await updateCategory(submitData)
                ElMessage.success('更新成功')
            } else {
                await addCategory(submitData)
                ElMessage.success('添加成功')
            }

            dialogVisible.value = false
            loadCategoryTree()
        } finally {
            submitLoading.value = false
        }
    }

    onMounted(() => {
        loadCategoryTree()
    })
</script>

<style lang="scss">
/* 全局微调，因为 Tailwind 无法直接通过 class 渗透进 Element Plus 的内部结构 */
.custom-minimal-dialog {
    .el-dialog__header {
        margin-right: 0;
        padding: 20px 24px;
        border-bottom: 1px solid #f3f4f6;
        .el-dialog__title {
            font-size: 16px;
            font-weight: 600;
        }
    }
    .el-dialog__body {
        padding: 24px;
    }
    .el-dialog__footer {
        padding: 0; /* 已经在 template 中用 tailwind 处理了内容区域 */
    }
}
</style>
