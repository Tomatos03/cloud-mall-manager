<template>
    <div class="h-full flex flex-col p-5">
        <div class="flex justify-between items-center mb-4">
            <el-button type="primary" :icon="Plus" @click="onAdd">添加用户</el-button>
        </div>

        <div class="flex-1 overflow-hidden">
            <Table :columns="columns" :data="data" height="100%" :showId="true">
                <template #role="{ row }">
                    <el-tag :type="getRoleTagType(row.role)">
                        {{ getRoleLabel(row.role) }}
                    </el-tag>
                </template>
                <template #action="{ row }">
                    <el-button
                        size="small"
                        type="warning"
                        :disabled="isCurrentUser(row)"
                        @click="onEdit(row)"
                    >
                        编辑
                    </el-button>
                    <el-button
                        size="small"
                        type="primary"
                        :disabled="isCurrentUser(row)"
                        @click="onResetPassword(row)"
                    >
                        重置密码
                    </el-button>
                    <el-button
                        size="small"
                        type="danger"
                        :disabled="isCurrentUser(row)"
                        @click="onDelete(row)"
                    >
                        删除
                    </el-button>
                </template>
            </Table>
        </div>

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
            width="500px"
            :close-on-click-modal="false"
        >
            <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="formData.username" placeholder="请输入用户名" clearable />
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
                <el-form-item label="角色类型" prop="role">
                    <el-select
                        v-model="formData.role"
                        placeholder="请选择角色类型"
                        style="width: 100%"
                    >
                        <el-option label="管理员" value="ADMIN" />
                        <el-option label="普通用户" value="NORMAL" />
                        <el-option label="商户" value="MERCHANT" />
                    </el-select>
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="dialog-footer">
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
                <div class="dialog-footer">
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
    import type { UserItem, UserRole } from '@/api/admin/user'
    import { getAdminApi } from '@/api/client'
    import { useUserStore } from '@/stores/user'

    const userStore = useUserStore()
    const currentUserId = computed(() => userStore.id)

    const columns = [
        { id: '1', label: '用户名', key: 'username' },
        { id: '2', label: '角色类型', key: 'role' },
    ]

    const data = ref<UserItem[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)

    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const submitLoading = ref(false)
    const formRef = ref()

    const resetPasswordDialogVisible = ref(false)
    const resetPasswordLoading = ref(false)
    const resetPasswordFormRef = ref()
    const resetPasswordFormData = reactive({
        id: '',
        username: '',
        password: '',
        confirmPassword: '',
    })

    const formData = reactive<{
        id: string
        username: string
        password: string
        role: UserRole
    }>({
        id: '',
        username: '',
        password: '',
        role: 'NORMAL',
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
        role: [{ required: true, message: '请选择角色类型', trigger: 'change' }],
    }

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

    const loadData = async () => {
        try {
            loading.value = true
            const api = getAdminApi()
            const res = await api.fetchUserPage({ page: page.value, pageSize: pageSize.value })
            data.value = res.data.records
            total.value = Number(res.data.total) || 0
        } catch (error) {
            console.error('加载用户列表失败:', error)
            ElMessage.error('加载数据失败')
        } finally {
            loading.value = false
        }
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

    const getRoleTagType = (role: UserRole) => {
        const roleMap = {
            ADMIN: 'danger',
            NORMAL: '',
            MERCHANT: 'warning',
        }
        return roleMap[role] || ''
    }

    const getRoleLabel = (role: UserRole) => {
        const roleMap = {
            ADMIN: '管理员',
            NORMAL: '普通用户',
            MERCHANT: '商户',
        }
        return roleMap[role] || role
    }

    const isCurrentUser = (row: UserItem) => {
        return String(row.id) === String(currentUserId.value)
    }

    const resetForm = () => {
        formData.id = ''
        formData.username = ''
        formData.password = ''
        formData.role = 'NORMAL'
        formRef.value?.resetFields()
    }

    const onAdd = () => {
        isEdit.value = false
        resetForm()
        dialogVisible.value = true
    }

    const onEdit = async (row: UserItem) => {
        if (isCurrentUser(row)) {
            ElMessage.warning('不能编辑自己的账户')
            return
        }
        try {
            isEdit.value = true
            const api = getAdminApi()
            const res = await api.getUserById(row.id)
            const user = res.data
            formData.id = user.id
            formData.username = user.username
            formData.password = ''
            formData.role = user.role
            dialogVisible.value = true
        } catch (error) {
            console.error('加载用户数据失败:', error)
            ElMessage.error('加载用户数据失败')
        }
    }

    const onSubmit = async () => {
        try {
            await formRef.value?.validate()
            submitLoading.value = true

            const api = getAdminApi()
            if (isEdit.value) {
                await api.updateUser({
                    id: formData.id,
                    username: formData.username,
                    role: formData.role,
                })
                ElMessage.success('用户编辑成功')
            } else {
                await api.addUser({
                    username: formData.username,
                    password: formData.password,
                    role: formData.role,
                })
                ElMessage.success('用户添加成功')
            }

            dialogVisible.value = false
            loadData()
        } catch (error) {
            console.error('提交失败:', error)
            if (error !== false) {
                ElMessage.error('操作失败')
            }
        } finally {
            submitLoading.value = false
        }
    }

    const onResetPassword = (row: UserItem) => {
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
        try {
            await resetPasswordFormRef.value?.validate()
            resetPasswordLoading.value = true

            const api = getAdminApi()
            await api.resetUserPassword(resetPasswordFormData.id, resetPasswordFormData.password)
            ElMessage.success('密码重置成功')
            resetPasswordDialogVisible.value = false
        } catch (error) {
            console.error('重置密码失败:', error)
            if (error !== false) {
                ElMessage.error('重置密码失败')
            }
        } finally {
            resetPasswordLoading.value = false
        }
    }

    const onDelete = async (row: UserItem) => {
        if (isCurrentUser(row)) {
            ElMessage.warning('不能删除自己的账户')
            return
        }
        try {
            await ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '删除确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            })

            const api = getAdminApi()
            await api.deleteUser(row.id)
            ElMessage.success('用户删除成功')
            loadData()
        } catch (error) {
            if (error !== 'cancel') {
                console.error('删除失败:', error)
                ElMessage.error('删除失败')
            }
        }
    }

    onMounted(() => {
        loadData()
    })
</script>

<style scoped>
    .dialog-footer {
        text-align: right;
    }
</style>