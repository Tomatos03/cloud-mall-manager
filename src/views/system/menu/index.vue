<template>
    <div class="h-full flex p-2.5 gap-6 overflow-hidden">
        <!-- 左侧资源树 -->
        <div
            class="w-80 bg-white rounded-lg shadow-sm flex flex-col overflow-hidden border border-slate-200"
        >
            <div
                class="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white"
            >
                <div class="flex items-center gap-2">
                    <el-button
                        v-auth="MENU_PERMISSIONS.ADD"
                        type="primary"
                        icon="Plus"
                        @click="handleAddRoot"
                        >新增根资源</el-button
                    >
                </div>
                <div class="flex items-center gap-2">
                    <el-button
                        circle
                        size="small"
                        icon="Sort"
                        @click="handleExpandAll"
                        title="展开全部"
                    />
                    <el-button
                        circle
                        size="small"
                        icon="SortDown"
                        @click="handleCollapseAll"
                        title="收起全部"
                    />
                    <el-button circle size="small" icon="Refresh" @click="handleRefresh" />
                </div>
            </div>

            <MenuTree
                ref="treeRef"
                :data="tableData"
                :current-id="currentNode?.id"
                @node-click="handleNodeClick"
            />
        </div>

        <!-- 右侧详情/编辑区 -->
        <div
            class="flex-1 bg-white rounded-lg shadow-sm flex flex-col overflow-hidden border border-slate-200"
        >
            <div
                class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white"
            >
                <div class="flex items-center gap-3">
                    <span v-if="!form.id && !isAdding" class="text-slate-400 text-sm font-medium"
                        >请选择左侧资源项或点击新增</span
                    >
                </div>
                <div class="flex items-center gap-3">
                    <template v-if="currentNode && !isAdding">
                        <el-button
                            v-if="
                                currentNode.type === MenuNodeType.CATALOG ||
                                currentNode.type === MenuNodeType.MENU
                            "
                            v-auth="MENU_PERMISSIONS.ADD"
                            icon="Plus"
                            @click="handleAddSubClick"
                            plain
                        >
                            新增子资源
                        </el-button>
                        <el-button
                            v-if="currentNode.type !== MenuNodeType.MENU"
                            v-auth="MENU_PERMISSIONS.DELETE"
                            type="danger"
                            plain
                            icon="Delete"
                            @click="handleDeleteCurrent"
                        >
                            删除
                        </el-button>
                    </template>
                </div>
            </div>

            <div class="flex-1 overflow-auto p-8">
                <div v-if="!form.id && !isAdding" class="h-full flex items-center justify-center">
                    <el-empty description="选择一个资源项开始编辑，或点击上方按钮新增" />
                </div>

                <MenuForm
                    v-else
                    ref="formRef"
                    :form="form"
                    :saving="saving"
                    @save="handleSave"
                    @cancel="handleCancelEdit"
                    @delete="handleDeleteCurrent"
                    @show-icon-picker="showIconPicker = true"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, reactive, onMounted } from 'vue'
    import { ElMessageBox, ElMessage } from 'element-plus'
    import {
        addMenu,
        updateMenu,
        delMenu,
        MenuNodeType,
        type MenuFormData,
        type MenuNode,
        getMenuTree,
    } from '@/api/menu'
    import { MENU_PERMISSIONS } from '@/constants/permissions'
    import MenuTree from './modules/MenuTree.vue'
    import MenuForm from './modules/MenuForm.vue'

    defineOptions({ name: 'Menus' })

    // 状态管理
    const loading = ref(false)
    const saving = ref(false)
    const showIconPicker = ref(false)
    const tableData = ref<MenuNode[]>([])
    const currentNode = ref<MenuNode | null>(null)
    const isAdding = ref(false)
    const treeRef = ref()
    const formRef = ref()

    // 表单数据
    const initialForm = {
        id: '',
        label: '',
        code: '',
        type: MenuNodeType.MENU,
        description: '',
        path: '',
        component: '',
        icon: '',
        sort: 0,
        enable: true,
        hidden: false,
        parentId: '',
        parentName: '',
    }
    const form = reactive({ ...initialForm })

    onMounted(() => {
        initMenuTree()
    })

    const initMenuTree = async () => {
        loading.value = true
        const res = await getMenuTree()
        tableData.value = res.data.children ?? []
        loading.value = false
    }

    // 点击节点
    const handleNodeClick = (data: MenuNode) => {
        currentNode.value = data
        isAdding.value = false

        // 填充表单
        Object.assign(form, initialForm)
        form.id = data.id
        form.label = data.meta.label
        form.path = data.meta.path ?? ''
        form.component = data.meta.component ?? ''
        form.icon = data.meta.icon ?? ''
        form.type = data.type
        form.code = data.code
        form.sort = data.sort
        form.hidden = !!data.meta.hidden
        form.enable = !!data.enable

        // 处理父级信息
        const node = treeRef.value?.getNode(data.id)
        if (node && node.parent && node.parent.key) {
            form.parentId = node.parent.data.id as string
            form.parentName = node.parent.data.meta.label
        }
    }

    // 新增根资源
    const handleAddRoot = () => {
        currentNode.value = null
        isAdding.value = true
        Object.assign(form, initialForm)
        treeRef.value?.setCurrentKey(null)
    }

    const handleAddSubClick = () => {
        if (!currentNode.value) return
        isAdding.value = true
        Object.assign(form, initialForm)
        form.parentId = currentNode.value.id as string
        form.parentName = currentNode.value.meta.label
        form.id = ''
        // 根据父级类型设置子节点默认类型
        if (currentNode.value.type === MenuNodeType.CATALOG) {
            form.type = MenuNodeType.MENU // 目录下只能添加菜单
        } else if (currentNode.value.type === MenuNodeType.MENU) {
            form.type = MenuNodeType.BUTTON // 菜单下默认添加按钮，或者保持为菜单由用户选择
        } else if (currentNode.value.type === MenuNodeType.BUTTON) {
            // 按钮下不能添加任何子资源
            ElMessage.warning('按钮类型资源不能添加子资源')
            isAdding.value = false
            return
        }
    }

    const handleCancelEdit = () => {
        if (currentNode.value) {
            handleNodeClick(currentNode.value)
        } else {
            isAdding.value = false
            Object.assign(form, initialForm)
        }
    }

    const handleExpandAll = () => {
        treeRef.value?.expandAll()
    }

    const handleCollapseAll = () => {
        treeRef.value?.collapseAll()
    }

    // 保存
    const handleSave = async () => {
        await formRef.value.validate()
        saving.value = true

        const submitData: MenuFormData = {
            label: form.label,
            code: form.code,
            type: form.type,
            sort: form.type === MenuNodeType.BUTTON ? 0 : form.sort,
            enable: form.enable,
            hidden: form.hidden,
            ...(form.type !== MenuNodeType.BUTTON && { path: form.path }),
            ...(form.type === MenuNodeType.MENU && { component: form.component }),
            ...(form.type !== MenuNodeType.BUTTON && form.icon && { icon: form.icon }),
            ...(form.parentId && { parentId: form.parentId }),
        }

        if (form.id) {
            // 编辑
            submitData.id = form.id
            await updateMenu(form.id, submitData)
            ElMessage.success('更新成功')
        } else {
            // 新增
            await addMenu(submitData)
            ElMessage.success('添加成功')
        }

        await initMenuTree()
        isAdding.value = false
        saving.value = false
    }

    // 删除
    const handleDeleteCurrent = () => {
        if (!form.id) return
        confirmDelete(form.id)
    }

    const confirmDelete = async (id: string) => {
        await ElMessageBox.confirm('确定要删除该资源及其所有子资源吗？', '提示', {
            type: 'warning',
            confirmButtonText: '确定',
            cancelButtonText: '取消',
        })
        await delMenu([id])
        ElMessage.success('删除成功')
        if (currentNode.value?.id === id) {
            currentNode.value = null
            Object.assign(form, initialForm)
        }
        initMenuTree()
    }

    const handleRefresh = () => {
        initMenuTree()
    }
</script>

<style scoped>
    :deep(.el-tree-node__content) {
        height: auto;
        padding: 4px 0;
    }

    :deep(.el-tree-node.is-current > .el-tree-node__content) {
        background-color: var(--el-color-primary-light-9) !important;
    }

    :deep(.el-tree-node__content:hover) {
        background-color: var(--el-fill-color-light);
    }

    :deep(.el-form-item__label) {
        font-weight: 500;
    }
</style>
