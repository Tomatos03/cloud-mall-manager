<template>
    <div class="h-full flex p-2.5 gap-6 overflow-hidden bg-[#f8fafc]">
        <!-- 左侧角色列表 -->
        <div
            class="w-96 bg-white rounded-lg shadow-sm flex flex-col overflow-hidden border border-slate-200"
        >
            <div
                class="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white"
            >
                <el-button
                    v-auth="ROLE_PERMISSIONS.ADD"
                    type="primary"
                    icon="Plus"
                    @click="handleAddRole"
                    >新增角色</el-button
                >
                <el-button circle size="small" icon="Refresh" @click="loadRoleList" />
            </div>

            <div class="p-4 flex-1 flex flex-col overflow-hidden">
                <div class="mb-4">
                    <el-input
                        v-model="searchForm.roleName"
                        placeholder="搜索角色名称"
                        prefix-icon="Search"
                        clearable
                        @input="handleSearch"
                    />
                </div>

                <div v-loading="loading" class="flex-1 overflow-auto pr-1">
                    <div
                        v-for="role in tableData"
                        :key="role.id"
                        class="group mb-3 p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all duration-200 relative"
                        :class="{
                            'border-primary bg-primary/5 shadow-sm': activeRoleId === role.id,
                        }"
                        @click="handleSelectRole(role)"
                    >
                        <div class="flex justify-between items-start mb-1">
                            <h4
                                class="font-semibold text-slate-800 group-hover:text-primary transition-colors"
                            >
                                {{ role.name }}
                            </h4>
                            <el-tag
                                :type="role.enable ? 'success' : 'info'"
                                size="small"
                                effect="plain"
                                class="rounded-md"
                            >
                                {{ role.enable ? '启用' : '禁用' }}
                            </el-tag>
                        </div>
                        <p class="text-xs text-slate-500 line-clamp-1">
                            {{ role.description || '暂无描述' }}
                        </p>

                        <!-- 悬浮删除按钮 -->
                        <div
                            class="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <el-button
                                v-auth="ROLE_PERMISSIONS.DELETE"
                                type="danger"
                                link
                                :icon="Delete"
                                @click.stop="handleDeleteRole(role)"
                            />
                        </div>
                    </div>

                    <el-empty
                        v-if="tableData.length === 0"
                        description="暂无角色数据"
                        :image-size="80"
                    />
                </div>

                <!-- 简单的分页 -->
                <div
                    class="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400"
                >
                    <span>共 {{ pagination.total }} 条</span>
                    <el-pagination
                        v-model:current-page="pagination.current"
                        :page-size="pagination.size"
                        layout="prev, next"
                        small
                        @current-change="loadRoleList"
                    />
                </div>
            </div>
        </div>

        <!-- 右侧详情/配置区 -->
        <div
            class="flex-1 bg-white rounded-lg shadow-sm flex flex-col overflow-hidden border border-slate-200"
        >
            <div v-if="!activeRole && !isAdding" class="h-full flex items-center justify-center">
                <div class="text-center">
                    <el-empty description="请从左侧选择一个角色以查看详情或配置权限" />
                </div>
            </div>

            <template v-else>
                <div class="px-6 py-2 border-b border-slate-100 bg-white">
                    <el-tabs v-model="activeTab" class="role-tabs">
                        <el-tab-pane label="基本信息" name="basic" />
                        <el-tab-pane label="权限分配" name="permission" />
                    </el-tabs>
                </div>

                <div class="flex-1 overflow-auto p-8">
                    <!-- 基本信息表单 -->
                    <div v-if="activeTab === 'basic'" class="max-w-2xl mx-auto">
                        <div class="mb-8">
                            <h3 class="text-lg font-semibold text-slate-800 mb-1">角色信息</h3>
                            <p class="text-sm text-slate-500">设置角色的基础属性及状态</p>
                        </div>

                        <el-form
                            ref="roleFormRef"
                            :model="roleForm"
                            :rules="roleRules"
                            label-position="top"
                        >
                            <el-form-item label="角色名称" prop="name">
                                <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
                            </el-form-item>

                            <el-form-item label="角色描述" prop="description">
                                <el-input
                                    v-model="roleForm.description"
                                    type="textarea"
                                    :rows="4"
                                    placeholder="请输入角色描述"
                                />
                            </el-form-item>

                            <el-form-item label="状态设置">
                                <div
                                    class="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100"
                                >
                                    <span class="text-sm font-medium text-slate-600"
                                        >是否启用该角色</span
                                    >
                                    <el-switch v-model="roleForm.enabled" />
                                </div>
                            </el-form-item>

                            <div
                                class="mt-12 pt-6 border-t border-slate-100 flex justify-end gap-3"
                            >
                                <el-button @click="resetRoleForm">重置</el-button>
                                <el-button
                                    v-auth="ROLE_PERMISSIONS.EDIT"
                                    type="primary"
                                    :loading="saving"
                                    class="px-8"
                                    @click="handleSaveRole"
                                >
                                    保存设置
                                </el-button>
                            </div>
                        </el-form>
                    </div>

                    <!-- 权限分配 -->
                    <div
                        v-if="activeTab === 'permission'"
                        class="h-full flex flex-col max-w-4xl mx-auto"
                    >
                        <div class="mb-6 flex justify-between items-end">
                            <div>
                                <h3 class="text-lg font-semibold text-slate-800 mb-1">菜单权限</h3>
                                <p class="text-sm text-slate-500">勾选角色可访问的菜单资源</p>
                            </div>
                            <div class="flex gap-2">
                                <el-button
                                    v-auth="ROLE_PERMISSIONS.EDIT"
                                    size="small"
                                    @click="toggleExpandAll"
                                    >全部展开/折叠</el-button
                                >
                                <el-button
                                    v-auth="ROLE_PERMISSIONS.EDIT"
                                    size="small"
                                    @click="toggleSelectAll"
                                    >全选/取消</el-button
                                >
                            </div>
                        </div>

                        <div
                            class="flex-1 min-h-100 p-6 rounded-xl border border-slate-100 bg-slate-50/50 overflow-auto"
                        >
                            <el-tree
                                ref="permissionTreeRef"
                                :data="filteredMenuTree"
                                show-checkbox
                                node-key="id"
                                :props="{ label: 'meta.label', children: 'children' }"
                                default-expand-all
                                check-strictly
                                class="bg-transparent!"
                            >
                                <template #default="{ data }">
                                    <span class="flex items-center gap-2">
                                        <el-icon v-if="data.meta?.icon" class="opacity-50"
                                            ><component :is="data.meta.icon"
                                        /></el-icon>
                                        <span class="text-sm text-slate-700">
                                            {{ data.meta.label }}
                                        </span>
                                    </span>
                                </template>
                            </el-tree>
                        </div>

                        <div class="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                            <el-button
                                v-auth="ROLE_PERMISSIONS.EDIT"
                                type="primary"
                                class="px-8"
                                @click="handleSavePermissions"
                            >
                                保存权限
                            </el-button>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue'
    import {
        fetchRoleList,
        fetchRoleMenuIds,
        assignRoleMenus,
        addRole,
        updateRole,
        deleteRoleById,
    } from '@/api/role'
    import { type MenuNode, getMenuTree } from '@/api/menu'
    import { ElMessageBox, ElMessage } from 'element-plus'
    import { Delete } from '@element-plus/icons-vue'
    import type { Role, RoleFormData } from '@/api/role'
    import { ROLE_PERMISSIONS } from '@/constants/permissions'

    defineOptions({ name: 'RoleManagement' })

    // 状态管理
    const loading = ref(false)
    const saving = ref(false)
    const activeTab = ref('basic')
    const tableData = ref<Role[]>([])
    const activeRoleId = ref<string | null>(null)
    const activeRole = ref<Role | null>(null)
    const isAdding = ref(false)

    // 分页
    const pagination = reactive({
        current: 1,
        size: 10,
        total: 0,
    })

    // 搜索
    const searchForm = reactive({
        roleName: '',
    })

    // 表单
    const roleForm = reactive<RoleFormData>({
        name: '',
        description: '',
        enabled: true,
    })
    const roleFormRef = ref()
    const roleRules = {
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    }

    // 权限相关
    const menuRootNode = ref<MenuNode>()
    const permissionTreeRef = ref()
    const isExpandAll = ref(true)
    const isSelectAll = ref(false)

    // 过滤掉home根节点的菜单树
    const filteredMenuTree = computed(() => {
        return menuRootNode.value?.children || []
    })

    // 数据获取
    const loadRoleList = async () => {
        loading.value = true
        try {
            const res = await fetchRoleList({
                page: pagination.current,
                pageSize: pagination.size,
                roleName: searchForm.roleName,
            })
            tableData.value = res.data.records || []
            pagination.total = res.data.total || 0

            // 如果有选中的ID，自动选中
            if (activeRoleId.value) {
                const found = tableData.value.find((r) => r.id === activeRoleId.value)
                if (found) handleSelectRole(found)
            }
        } finally {
            loading.value = false
        }
    }

    const handleSearch = () => {
        pagination.current = 1
        loadRoleList()
    }

    const handleSelectRole = async (role: Role) => {
        isAdding.value = false
        activeRoleId.value = role.id
        activeRole.value = role

        // 填充表单
        Object.assign(roleForm, {
            name: role.name,
            description: role.description,
            enable: role.enable,
        })

        // 获取权限数据
        if (activeTab.value === 'permission') {
            loadRolePermissions()
        }
    }

    const loadRolePermissions = async () => {
        if (!activeRoleId.value) return

        // 如果菜单树为空，先加载完整菜单树
        if (!menuRootNode.value) {
            const menuRes = await getMenuTree()
            menuRootNode.value = menuRes.data
        }

        // 获取角色已有的菜单权限
        const res = await fetchRoleMenuIds(activeRoleId.value)
        const roleMenuIds = res.data || []

        nextTick(() => {
            if (permissionTreeRef.value) {
                // 清空之前的选择，然后设置新的选中状态
                permissionTreeRef.value.setCheckedKeys(roleMenuIds)
            }
        })
    }

    watch(activeTab, (val) => {
        if (val === 'permission' && activeRoleId.value) {
            loadRolePermissions()
        }
    })

    const handleAddRole = () => {
        activeRoleId.value = null
        activeRole.value = null
        isAdding.value = true
        activeTab.value = 'basic'
        Object.assign(roleForm, {
            name: '',
            description: '',
            enable: true,
        })
    }

    const handleSaveRole = async () => {
        if (!roleFormRef.value) return
        try {
            await roleFormRef.value.validate()
            saving.value = true

            if (activeRoleId.value) {
                await updateRole(activeRoleId.value, roleForm)
                ElMessage.success('角色信息已更新')
            } else {
                const newRoleRes = await addRole(roleForm)
                const newRole = newRoleRes.data
                activeRoleId.value = newRole.id
                activeRole.value = newRole
                isAdding.value = false
                ElMessage.success('成功创建新角色')
            }
            loadRoleList()
        } finally {
            saving.value = false
        }
    }

    const resetRoleForm = () => {
        if (activeRole.value) {
            Object.assign(roleForm, {
                name: activeRole.value.name,
                description: activeRole.value.description,
                enable: activeRole.value.enable,
            })
        } else {
            Object.assign(roleForm, {
                name: '',
                description: '',
                enable: true,
            })
        }
    }

    const handleDeleteRole = (role: Role) => {
        ElMessageBox.confirm(`确定要永久删除角色 "${role.name}" 吗？此操作不可恢复。`, '危险提示', {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'error',
        }).then(async () => {
            await deleteRoleById(role.id)
            ElMessage.success('角色已成功删除')
            if (activeRoleId.value === role.id) {
                activeRoleId.value = null
                activeRole.value = null
            }
            loadRoleList()
        })
    }

    // 权限操作
    const handleSavePermissions = async () => {
        if (!activeRoleId.value || !permissionTreeRef.value) return

        // 获取所有被选中的节点
        const checkedKeys = permissionTreeRef.value.getCheckedKeys()
        // 获取所有半选状态的节点（部分子节点被选中的父节点）
        const indeterminateKeys = permissionTreeRef.value.getHalfCheckedKeys()

        // 合并被选中和半选状态的节点
        const allSelectedKeys = [...new Set([...checkedKeys, ...indeterminateKeys])]

        await assignRoleMenus(activeRoleId.value, allSelectedKeys)
        ElMessage.success('权限配置已保存')
    }

    const toggleExpandAll = () => {
        isExpandAll.value = !isExpandAll.value
        const nodes = permissionTreeRef.value.store.nodesMap
        for (const i in nodes) {
            nodes[i].expanded = isExpandAll.value
        }
    }

    const toggleSelectAll = () => {
        isSelectAll.value = !isSelectAll.value
        if (isSelectAll.value) {
            const allKeys: string[] = []
            const traverse = (list: MenuNode[]) => {
                list.forEach((item) => {
                    allKeys.push(item.id)
                    if (item.children) traverse(item.children)
                })
            }

            traverse(menuRootNode.value?.children ?? [])
            permissionTreeRef.value.setCheckedKeys(allKeys)
        } else {
            permissionTreeRef.value.setCheckedKeys([])
        }
    }

    onMounted(async () => {
        // 加载完整的菜单树和角色列表
        const menuRes = await getMenuTree()
        menuRootNode.value = menuRes.data

        loadRoleList()
    })
</script>

<style scoped>
    .role-tabs :deep(.el-tabs__header) {
        margin: 0;
        padding: 0 16px;
    }

    .role-tabs :deep(.el-tabs__nav-wrap::after) {
        display: none;
    }

    .role-tabs :deep(.el-tabs__item) {
        font-size: 14px;
    }

    :deep(.el-tree) {
        background: transparent;
    }

    :deep(.el-tree-node__content) {
        height: auto;
        padding: 6px 0;
    }

    :deep(.el-tree-node__content:hover) {
        background-color: transparent;
    }
</style>
