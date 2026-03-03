<template>
    <div class="h-full flex flex-col p-5">
        <!-- 顶部操作栏 -->
        <div class="flex justify-start items-center mb-4">
            <el-button v-auth="USER_PERMISSIONS.ADD" type="primary" :icon="Plus" @click="onAdd">
                添加用户
            </el-button>
        </div>

        <!-- 表格区域 -->
        <div class="flex-1 overflow-hidden">
            <Table :columns="columns" :data="userList" height="100%" :showId="true">
                <template #roles="{ row }">
                    <div class="flex flex-wrap gap-1 max-w-xs overflow-hidden">
                        <template v-if="row.roleIds.length === 0">
                            <span class="text-gray-400"> - </span>
                        </template>
                        <template v-else>
                            <template v-for="roleId in row.roleIds">
                                <el-tag
                                    v-if="roleNameMap[roleId]"
                                    type="success"
                                    size="small"
                                    :title="roleNameMap[roleId]"
                                >
                                    <span class="truncate inline-block max-w-20">{{
                                        roleNameMap[roleId]
                                    }}</span>
                                </el-tag>
                            </template>
                        </template>
                    </div>
                </template>
                <template #action="{ row }">
                    <el-button
                        v-auth="USER_PERMISSIONS.EDIT"
                        link
                        type="primary"
                        size="small"
                        :disabled="isCurrentUser(row)"
                        @click="onEdit(row)"
                    >
                        编辑
                    </el-button>
                    <el-button
                        v-auth="USER_PERMISSIONS.EDIT"
                        link
                        type="primary"
                        size="small"
                        :disabled="isCurrentUser(row)"
                        @click="onResetPassword(row)"
                    >
                        重置密码
                    </el-button>
                    <el-button
                        v-auth="USER_PERMISSIONS.DELETE"
                        link
                        type="danger"
                        size="small"
                        :disabled="isCurrentUser(row)"
                        @click="onDelete(row)"
                    >
                        删除
                    </el-button>
                </template>
            </Table>
        </div>

        <!-- 分页 -->
        <div class="mt-4 flex justify-end">
            <el-pagination
                v-model:current-page="page"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
            />
        </div>

        <!-- 添加/编辑用户对话框 -->
        <UserDialog
            v-model="dialogVisible"
            :is-edit="isEdit"
            :roles="allRoles"
            :user-data="currentUserData"
            @success="handleUserSubmit"
        />

        <!-- 重置密码对话框 -->
        <ResetPasswordDialog
            v-model="resetPasswordDialogVisible"
            :user-data="currentResetPasswordUserData"
            @success="handleResetPasswordSubmit"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { Plus } from '@element-plus/icons-vue'
    import Table from '@/components/table/Table.vue'
    import UserDialog from './modules/UserDialog.vue'
    import ResetPasswordDialog from './modules/ResetPasswordDialog.vue'
    import type { UserListItem, RoleInfo, UserFormData } from '@/api/user'
    import { fetchUserPage, addUser, updateUser, resetUserPassword, deleteUser } from '@/api/user'
    import { fetchRoleList } from '@/api/role'
    import { useUserStore } from '@/stores/user'
    import { USER_PERMISSIONS } from '@/constants/permissions'

    const userStore = useUserStore()
    const currentUserId = computed(() => userStore.uid)

    const columns = [
        { id: '1', label: '用户名', key: 'username' },
        { id: '2', label: '角色', key: 'roles' },
    ]

    // ============ 列表数据 ============
    const userList = ref<UserListItem[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)

    // ============ 用户编辑对话框 ============
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const currentUserData = ref<{
        id: string
        username: string
        roleIds: string[]
    } | null>(null)

    // ============ 角色列表 ============
    const allRoles = ref<RoleInfo[]>([])

    // 使用 computed 创建响应式的角色映射对象
    const roleNameMap = computed(() => {
        const map: Record<string, string> = {}
        allRoles.value.forEach((role) => {
            map[role.id] = role.name
        })
        return map
    })

    // ============ 重置密码对话框 ============
    const resetPasswordDialogVisible = ref(false)
    const currentResetPasswordUserData = ref<{
        id: string
        username: string
    } | null>(null)

    // ============ 方法 ============
    const loadData = async () => {
        loading.value = true
        const res = await fetchUserPage({ page: page.value, pageSize: pageSize.value })
        userList.value = res.data.records
        total.value = Number(res.data.total) || 0
        loading.value = false
    }

    const loadRoles = async () => {
        const res = await fetchRoleList({ page: 1, pageSize: 1000 })
        allRoles.value = res.data.records
    }

    const handlePageChange = (val: number) => {
        page.value = val
        loadData()
    }

    const handleSizeChange = (val: number) => {
        pageSize.value = val
        page.value = 1
        loadData()
    }

    const isCurrentUser = (row: UserListItem) => {
        return String(row.id) === String(currentUserId.value)
    }

    // ============ 用户编辑 ============
    const onAdd = () => {
        isEdit.value = false
        currentUserData.value = null
        dialogVisible.value = true
    }

    const onEdit = (row: UserListItem) => {
        if (isCurrentUser(row)) {
            ElMessage.warning('不能编辑自己的账户')
            return
        }
        isEdit.value = true
        currentUserData.value = {
            id: row.id,
            username: row.username,
            roleIds: row.roleIds,
        }
        dialogVisible.value = true
    }

    const handleUserSubmit = async (formData: UserFormData) => {
        if (isEdit.value) {
            await updateUser(formData)
            ElMessage.success('用户编辑成功')
        } else {
            await addUser(formData)
            ElMessage.success('用户添加成功')
        }

        dialogVisible.value = false
        loadData()
    }

    // ============ 重置密码 ============
    const onResetPassword = (row: UserListItem) => {
        if (isCurrentUser(row)) {
            ElMessage.warning('不能重置自己的密码')
            return
        }
        currentResetPasswordUserData.value = {
            id: row.id,
            username: row.username,
        }
        resetPasswordDialogVisible.value = true
    }

    const handleResetPasswordSubmit = async (password: string) => {
        if (!currentResetPasswordUserData.value) return
        await resetUserPassword(currentResetPasswordUserData.value.id, password)
        ElMessage.success('密码重置成功')
        resetPasswordDialogVisible.value = false
    }

    // ============ 删除用户 ============
    const onDelete = async (row: UserListItem) => {
        if (isCurrentUser(row)) {
            ElMessage.warning('不能删除自己的账户')
            return
        }
        await ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '删除确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })

        await deleteUser(row.id)
        ElMessage.success('用户删除成功')
        loadData()
    }

    onMounted(async () => {
        await loadRoles() // 先加载角色
        await loadData() // 再加载用户列表
    })
</script>
