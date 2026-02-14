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
                    <el-button v-auth="MENU_PERMISSIONS.ADD" type="primary" icon="Plus" @click="handleAddRoot">新增根资源</el-button>
                </div>
                <div class="flex items-center gap-2">
                    <el-button circle size="small" icon="Sort" @click="handleExpandAll" title="展开全部" />
                    <el-button circle size="small" icon="SortDown" @click="handleCollapseAll" title="收起全部" />
                    <el-button circle size="small" icon="Refresh" @click="handleRefresh" />
                </div>
            </div>

            <div class="p-4 flex-1 overflow-auto">
                <div class="mb-4 sticky top-0 bg-white z-10 pb-2">
                    <el-input
                        v-model="filterText"
                        placeholder="搜索资源"
                        prefix-icon="Search"
                        clearable
                        class="w-full!"
                    />
                </div>

                <el-tree
                    ref="treeRef"
                    :data="tableData"
                    node-key="id"
                    :props="{ label: 'meta.label', children: 'children' }"
                    :filter-node-method="filterNode"
                    highlight-current
                    :expand-on-click-node="false"
                    @node-click="handleNodeClick"
                >
                    <template #default="{ data }">
                        <span
                            class="flex items-center w-full py-1 text-sm transition-colors duration-200"
                            :class="{ 'text-primary font-semibold': currentNode?.id === data.id }"
                        >
                            <el-icon v-if="data.meta?.icon" class="mr-2 opacity-70">
                                <component :is="data.meta.icon" />
                            </el-icon>
                            <el-icon v-else class="mr-2 opacity-70"><MenuIcon /></el-icon>
                            <span>{{ data.meta.label }}</span>
                        </span>
                    </template>
                </el-tree>
            </div>
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
                            v-if="currentNode.type === MenuNodeType.CATALOG"
                            v-auth="MENU_PERMISSIONS.ADD"
                            icon="Plus"
                            @click="handleAddSubClick"
                            plain
                        >
                            新增资源
                        </el-button>
                        <el-button
                            v-if="currentNode.type === MenuNodeType.MENU"
                            v-auth="MENU_PERMISSIONS.ADD"
                            icon="Plus"
                            @click="handleAddSubClick"
                            plain
                        >
                            新增按钮
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

                <el-form
                    v-else
                    ref="formRef"
                    :model="form"
                    :rules="rules"
                    label-width="100px"
                    class="max-w-4xl mx-auto"
                >
                    <div class="mb-8">
                        <h3 class="text-lg font-semibold text-slate-800 mb-1">资源配置</h3>
                    </div>
                    <el-form-item v-if="form.parentId" label="父级资源">
                        <el-input :model-value="form.parentName" disabled class="w-1/2!" />
                    </el-form-item>

                    <el-row :gutter="24">
                        <el-col :span="12">
                            <el-form-item label="资源名称" prop="name">
                                <el-input
                                    v-model="form.label"
                                    placeholder="请输入资源名称"
                                    clearable
                                />
                            </el-form-item>
                        </el-col>
                        <el-col v-if="form.type !== MenuNodeType.CATALOG" :span="12">
                            <el-form-item label="资源编码" prop="code">
                                <el-input
                                    v-model="form.code"
                                    placeholder="请输入资源编码"
                                    clearable
                                />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="资源类型" prop="type">
                        <el-radio-group v-model="form.type">
                            <el-radio-button :value="MenuNodeType.CATALOG">目录</el-radio-button>
                            <el-radio-button :value="MenuNodeType.MENU">菜单</el-radio-button>
                            <el-radio-button :value="MenuNodeType.BUTTON">按钮</el-radio-button>
                        </el-radio-group>
                    </el-form-item>

                    <template v-if="form.type !== MenuNodeType.BUTTON">
                        <el-row :gutter="24">
                            <el-col :span="12">
                                <el-form-item label="路由路径" prop="path">
                                    <el-input
                                        v-model="form.path"
                                        placeholder="请输入路由路径"
                                        clearable
                                    />
                                </el-form-item>
                            </el-col>
                            <el-col v-if="form.type === MenuNodeType.MENU" :span="12">
                                <el-form-item label="组件路径" prop="component">
                                    <el-input
                                        v-model="form.component"
                                        placeholder="请输入组件路径"
                                        clearable
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="24">
                            <el-col :span="12">
                                <el-form-item label="图标" prop="icon">
                                    <el-input
                                        v-model="form.icon"
                                        placeholder="选择或输入图标"
                                        clearable
                                    >
                                        <template #append>
                                            <el-button
                                                icon="Search"
                                                @click="showIconPicker = true"
                                            />
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="排序号" prop="sort">
                                    <el-input-number
                                        v-model="form.sort"
                                        :min="0"
                                        class="w-full!"
                                        controls-position="right"
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </template>

                    <el-form-item label="启用状态" prop="isEnable">
                        <el-switch
                            v-model="form.isEnable"
                            active-text="启用"
                            inactive-text="禁用"
                            inline-prompt
                        />
                    </el-form-item>

                    <div
                        class="mt-12 pt-6 border-t border-slate-100 flex items-center justify-end gap-3"
                    >
                        <el-button @click="handleCancelEdit">取消</el-button>
                        <el-button v-if="form.id" v-auth="MENU_PERMISSIONS.DELETE" type="danger" plain @click="handleDeleteCurrent"
                            >删除资源</el-button
                        >
                        <el-button v-auth="MENU_PERMISSIONS.EDIT" type="primary" :loading="saving" class="px-8" @click="handleSave"
                            >保存更改</el-button
                        >
                    </div>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, reactive, onMounted, watch } from 'vue'
    import { ElMessageBox, ElMessage } from 'element-plus'
    import type { FormItemRule } from 'element-plus'
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

    defineOptions({ name: 'Menus' })

    interface FormValidatorCallback {
        (error?: Error | string): void
    }

    // 搜索过滤
    const filterText = ref('')
    const treeRef = ref()

    watch(filterText, (val) => {
        treeRef.value?.filter(val)
    })

    const filterNode = (value: string, data: MenuNode) => {
        if (!value) return true
        return data.meta.label.includes(value)
    }

    // 状态管理
    const loading = ref(false)
    const saving = ref(false)
    const showIconPicker = ref(false)
    const tableData = ref<MenuNode[]>([])
    const currentNode = ref<MenuNode | null>(null)
    const isAdding = ref(false)

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
        isEnable: true,
        parentId: '' as string,
        parentName: '',
    }
    const form = reactive({ ...initialForm })
    const formRef = ref()

    const rules = {
        label: [{ required: true, message: '请输入资源名称', trigger: 'blur' }],
        code: [
            {
                validator: (rule: FormItemRule, value: string, callback: FormValidatorCallback) => {
                    if (form.type === MenuNodeType.CATALOG) {
                        callback()
                    } else if (!value) {
                        callback(new Error('请输入资源编码'))
                    } else {
                        callback()
                    }
                },
                trigger: 'blur',
            },
        ],
        type: [{ required: true, message: '请选择资源类型', trigger: 'change' }],
        path: [
            {
                validator: (rule: FormItemRule, value: string, callback: FormValidatorCallback) => {
                    if (form.type === MenuNodeType.BUTTON) {
                        callback()
                    } else if (!value) {
                        callback(new Error('请输入路由路径'))
                    } else {
                        callback()
                    }
                },
                trigger: 'blur',
            },
        ],
        component: [
            {
                validator: (rule: FormItemRule, value: string, callback: FormValidatorCallback) => {
                    if (form.type === MenuNodeType.BUTTON || form.type === MenuNodeType.CATALOG) {
                        callback()
                    } else if (!value) {
                        callback(new Error('请输入组件路径'))
                    } else {
                        callback()
                    }
                },
                trigger: 'blur',
            },
        ],
        sort: [
            {
                validator: (rule: FormItemRule, value: number, callback: FormValidatorCallback) => {
                    if (form.type === MenuNodeType.BUTTON) {
                        callback()
                    } else if (value === undefined || value === null) {
                        callback(new Error('请输入排序号'))
                    } else {
                        callback()
                    }
                },
                trigger: 'blur',
            },
        ],
    }

    watch(
        () => form.type,
        (newType) => {
            if (newType === MenuNodeType.BUTTON) {
                form.path = ''
                form.component = ''
                form.icon = ''
                form.sort = 0
            } else if (newType === MenuNodeType.CATALOG) {
                form.component = ''
            }
        },
    )

    onMounted(() => {
        initMenuTree()
    })

    const initMenuTree = async () => {
        loading.value = true
        const res = await getMenuTree()
        tableData.value = res.data.children ?? []
        loading.value = false
    }

    const expandAllNodes = () => {
        const nodes = treeRef.value?.store?.nodesMap
        if (nodes) {
            Object.values(nodes).forEach((node: any) => {
                node.expanded = true
            })
        }
    }

    const collapseAllNodes = () => {
        const nodes = treeRef.value?.store?.nodesMap
        if (nodes) {
            Object.values(nodes).forEach((node: any) => {
                node.expanded = false
            })
        }
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
            form.type = MenuNodeType.MENU
        } else if (currentNode.value.type === MenuNodeType.MENU) {
            form.type = MenuNodeType.BUTTON
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

    // 展开全部节点
    const handleExpandAll = () => {
        expandAllNodes()
    }

    // 收起全部节点
    const handleCollapseAll = () => {
        collapseAllNodes()
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
            isEnable: form.isEnable,
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
