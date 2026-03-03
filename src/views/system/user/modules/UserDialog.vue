<template>
    <el-dialog
        v-model="visible"
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
            <el-form-item label="角色" prop="roleIds">
                <el-select v-model="formData.roleIds" multiple placeholder="请选择角色" clearable>
                    <el-option
                        v-for="role in roles"
                        :key="role.id"
                        :label="role.name"
                        :value="String(role.id)"
                    />
                </el-select>
            </el-form-item>
        </el-form>

        <template #footer>
            <div class="text-right">
                <el-button @click="handleClose">取消</el-button>
                <el-button type="primary" :loading="isSubmitting" @click="handleSubmit"
                    >确定</el-button
                >
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, computed, reactive, watch } from 'vue'
    import type { FormInstance } from 'element-plus'

    interface RoleInfo {
        id: string | number
        name: string
    }

    const props = defineProps<{
        modelValue: boolean
        isEdit: boolean
        roles: RoleInfo[]
        userData?: {
            id: string
            username: string
            roleIds: string[]
        } | null
    }>()

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
        success: [data: { id: string; username: string; password: string; roleIds: string[] }]
    }>()

    const visible = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value),
    })

    const formRef = ref<FormInstance>()
    const isSubmitting = ref(false)

    const formData = reactive({
        id: '',
        username: '',
        password: '',
        roleIds: [] as string[],
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

    watch(
        () => props.modelValue,
        (newVal) => {
            if (newVal && props.userData) {
                formData.id = props.userData.id
                formData.username = props.userData.username
                formData.roleIds = props.userData.roleIds.map(String)
            } else if (newVal) {
                formData.id = ''
                formData.username = ''
                formData.password = ''
                formData.roleIds = []
                formRef.value?.resetFields()
            }
        },
    )

    const handleClose = () => {
        visible.value = false
    }

    const handleSubmit = async () => {
        await formRef.value?.validate()
        isSubmitting.value = true
        emit('success', { ...formData })
    }

    defineExpose({ setLoading: (val: boolean) => (isSubmitting.value = val) })
</script>
