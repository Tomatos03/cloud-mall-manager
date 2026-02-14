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
            <Table :columns="columns" :data="data" height="100%" :showId="true">
                <template #roles="{ row }">
                    <div class="flex flex-wrap gap-1 max-w-xs overflow-hidden">
                        <el-tag
                            v-for="role in getUserRoles(row.id)"
                            :key="role.id"
                            type="success"
                            size="small"
                            :title="role.name"
                        >
                            <span class="truncate inline-block max-w-20">{{ role.name }}</span>
                        </el-tag>
                        <span v-if="!getUserRoles(row.id).length" class="text-gray-400">
                            -
                        </span>
                        <span v-else-if="isRolesTruncated(row.id)" class="text-gray-500 text-sm leading-7">
                            ...
                        </span>
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
        <el-dialog
            v-model="dialogVisible"
            :title="isEdit ? '编辑用户' : '添加用户'"
            width="600px"
            :close-on-click-modal="false"
        >
            <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
                <el-form-item label="用户名" prop="username">
                    <el-input
                        v-model="formData.username"
                        :disabled="isEdit"
                        placeholder="请输入用户名"
                        clearable
                    />
                </el-form-item>
                <el-form-item v-if="!isEdit" label="密码" prop="password">
                    <el-input
                        v-model="formData.password"
                        type="password"
                        placeholder="请输入密码"
                        clearable
                        show-password
                    />
                </el-form-item>
                <el-form-item v-if="isEdit" label="角色" prop="roleIds">
                    <el-select
                        v-model="formData.roleIds"
                        multiple
                        placeholder="请选择角色"
                        clearable
                    >
                        <el-option
                            v-for="role in allRoles"
                            :key="role.id"
                            :label="role.name"
                            :value="role.id"
                        />
                    </el-select>
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="text-right">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" :loading="submitLoading" @click="onSubmit">
                        确定
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 重置密码对话框 -->
        <el-dialog
            v-model="resetPasswordDialogVisible"
            title="重置密码"
            width="500px"
            :close-on-click-modal="false"
        >
            <el-form
                ref="resetPasswordFormRef"
                :model="resetPasswordFormData"
                :rules="resetPasswordRules"
                label-width="100px"
            >
                <el-form-item label="用户名">
                    <el-input v-model="resetPasswordFormData.username" disabled />
                </el-form-item>
                <el-form-item label="新密码" prop="password">
                    <el-input
                        v-model="resetPasswordFormData.password"
                        type="password"
                        placeholder="请输入新密码"
                        clearable
                        show-password
                    />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input
                        v-model="resetPasswordFormData.confirmPassword"
                        type="password"
                        placeholder="请再次输入新密码"
                        clearable
                        show-password
                    />
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="text-right">
                    <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
                    <el-button
                        type="primary"
                        :loading="resetPasswordLoading"
                        @click="onSubmitResetPassword"
                    >
                        确定
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, reactive, computed } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { Plus } from '@element-plus/icons-vue'
    import Table from '@/components/table/Table.vue'
    import type { UserListItem, RoleListItem, RoleInfo } from '@/api/user'
    import {
        fetchUserPage,
        getUserById,
        addUser,
        updateUser,
        resetUserPassword,
        deleteUser,
        assignUserRoles,
    } from '@/api/user'
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
    const data = ref<UserListItem[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)

    // ============ 用户编辑对话框 ============
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const submitLoading = ref(false)
    const formRef = ref()

    const formData = reactive<{
        id: string
        username: string
        password: string
        roleIds: string[]
    }>({
        id: '',
        username: '',
        password: '',
        roleIds: [],
    })

    const rules = {
        username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
        ],
        password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' },
        ],
    }

    // ============ 角色列表 ============
    const allRoles = ref<RoleInfo[]>([])

    // ============ 重置密码对话框 ============
    const resetPasswordDialogVisible = ref(false)
    const resetPasswordLoading = ref(false)
    const resetPasswordFormRef = ref()
    const resetPasswordFormData = reactive({
        id: '',
        username: '',
        password: '',
        confirmPassword: '',
    })

    const resetPasswordRules = {
        password: [
            { required: true, message: '请输入新密码', trigger: 'blur' },
            { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' },
        ],
        confirmPassword: [
            { required: true, message: '请再次输入新密码', trigger: 'blur' },
            {
                validator: (_rule: any, value: any, callback: any) => {
                    if (value !== resetPasswordFormData.password) {
                        callback(new Error('两次输入的密码不一致'))
                    } else {
                        callback()
                    }
                },
                trigger: 'blur',
            },
        ],
    }

    // ============ 方法 ============
    const loadData = async () => {
        loading.value = true
        const res = await fetchUserPage({ page: page.value, pageSize: pageSize.value })
        data.value = res.data.records
        total.value = Number(res.data.total) || 0
        loading.value = false
    }

    const loadRoles = async () => {
        const res = await fetchRoleList({ page: 1, pageSize: 1000 })
        allRoles.value = res.data.records
    }

    const getUserRoles = (userId: string): RoleListItem[] => {
        const user = data.value.find((u) => u.id === userId)
        return user?.roles || []
    }

    const isRolesTruncated = (userId: string): boolean => {
        const roles = getUserRoles(userId)
        // 如果角色数大于2，则认为可能被截断
        // 可根据实际容器宽度调整这个数值
        return roles.length > 2
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

    const resetForm = () => {
        formData.id = ''
        formData.username = ''
        formData.password = ''
        formData.roleIds = []
        formRef.value?.resetFields()
    }

    // ============ 用户编辑 ============
    const onAdd = () => {
        isEdit.value = false
        resetForm()
        dialogVisible.value = true
    }

    const onEdit = async (row: UserListItem) => {
        if (isCurrentUser(row)) {
            ElMessage.warning('不能编辑自己的账户')
            return
        }
        isEdit.value = true
        const res = await getUserById(row.id)
        const user = res.data
        formData.id = user.id
        formData.username = user.username
        formData.password = ''
        formData.roleIds = (user.roles || []).map((role: RoleInfo) => role.id)
        dialogVisible.value = true
    }

    const onSubmit = async () => {
        await formRef.value?.validate()
        submitLoading.value = true

        try {
            if (isEdit.value) {
                await updateUser({
                    id: formData.id,
                    username: formData.username,
                })
                // 分配角色
                await assignUserRoles(formData.id, formData.roleIds)
                ElMessage.success('用户编辑成功')
            } else {
                await addUser({
                    username: formData.username,
                    password: formData.password,
                })
                ElMessage.success('用户添加成功')
            }

            dialogVisible.value = false
            submitLoading.value = false
            loadData()
        } catch (error) {
            submitLoading.value = false
            throw error
        }
    }

    // ============ 重置密码 ============
    const onResetPassword = (row: UserListItem) => {
        if (isCurrentUser(row)) {
            ElMessage.warning('不能重置自己的密码')
            return
        }
        resetPasswordFormData.id = row.id
        resetPasswordFormData.username = row.username
        resetPasswordFormData.password = ''
        resetPasswordFormData.confirmPassword = ''
        resetPasswordFormRef.value?.resetFields()
        resetPasswordDialogVisible.value = true
    }

    const onSubmitResetPassword = async () => {
        await resetPasswordFormRef.value?.validate()
        resetPasswordLoading.value = true

        await resetUserPassword(resetPasswordFormData.id, resetPasswordFormData.password)
        ElMessage.success('密码重置成功')
        resetPasswordDialogVisible.value = false
        resetPasswordLoading.value = false
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

    onMounted(() => {
        loadData()
        loadRoles()
    })
</script>