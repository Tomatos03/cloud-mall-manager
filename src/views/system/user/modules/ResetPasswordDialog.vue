<template>
    <el-dialog v-model="visible" title="重置密码" width="500px" :close-on-click-modal="false">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
            <el-form-item label="用户名">
                <el-input v-model="formData.username" disabled />
            </el-form-item>
            <el-form-item label="新密码" prop="password">
                <el-input
                    v-model="formData.password"
                    type="password"
                    placeholder="请输入新密码"
                    clearable
                    show-password
                />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                    v-model="formData.confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    clearable
                    show-password
                />
            </el-form-item>
        </el-form>

        <template #footer>
            <div class="text-right">
                <el-button @click="handleClose">取消</el-button>
                <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, computed, reactive, watch } from 'vue'
    import type { FormInstance } from 'element-plus'

    const props = defineProps<{
        modelValue: boolean
        userData?: {
            id: string
            username: string
        } | null
    }>()

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
        success: [password: string]
    }>()

    const visible = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value),
    })

    const loading = ref(false)
    const formRef = ref<FormInstance>()

    const formData = reactive({
        id: '',
        username: '',
        password: '',
        confirmPassword: '',
    })

    const rules = {
        password: [
            { required: true, message: '请输入新密码', trigger: 'blur' },
            { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' },
        ],
        confirmPassword: [
            { required: true, message: '请再次输入新密码', trigger: 'blur' },
            {
                validator: (_rule: any, value: any, callback: any) => {
                    if (value !== formData.password) {
                        callback(new Error('两次输入的密码不一致'))
                    } else {
                        callback()
                    }
                },
                trigger: 'blur',
            },
        ],
    }

    watch(
        () => props.modelValue,
        (newVal) => {
            if (newVal && props.userData) {
                formData.id = props.userData.id
                formData.username = props.userData.username
            } else if (newVal) {
                formData.id = ''
                formData.username = ''
                formData.password = ''
                formData.confirmPassword = ''
                formRef.value?.resetFields()
            }
        },
    )

    const handleClose = () => {
        visible.value = false
    }

    const handleSubmit = async () => {
        await formRef.value?.validate()
        loading.value = true
        emit('success', formData.password)
    }

    const setLoading = (val: boolean) => {
        loading.value = val
    }

    defineExpose({ setLoading })
</script>
