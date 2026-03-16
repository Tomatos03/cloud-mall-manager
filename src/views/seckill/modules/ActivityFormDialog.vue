<template>
    <el-dialog
        :model-value="visible"
        title="创建活动"
        width="560px"
        :close-on-click-modal="false"
        @update:model-value="(val: boolean) => emit('update:visible', val)"
    >
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
            <el-form-item label="活动名称" prop="name">
                <el-input
                    v-model="formData.name"
                    placeholder="请输入活动名称"
                    maxlength="100"
                    show-word-limit
                />
            </el-form-item>

            <el-form-item label="活动日期" prop="activityDate">
                <el-date-picker
                    v-model="formData.activityDate"
                    type="date"
                    placeholder="请选择活动日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    :disabled-date="disabledDate"
                />
            </el-form-item>

            <el-form-item label="开始小时" prop="startHour">
                <el-select v-model="formData.startHour" placeholder="请选择开始小时" class="w-full">
                    <el-option
                        v-for="hour in 24"
                        :key="hour - 1"
                        :label="`${hour - 1}:00-${hour}:00`"
                        :value="hour - 1"
                    />
                </el-select>
            </el-form-item>

            <el-form-item label="最大商品数" prop="maxItems">
                <el-input-number
                    v-model="formData.maxItems"
                    :min="1"
                    :max="10000"
                    controls-position="right"
                />
            </el-form-item>
        </el-form>

        <template #footer>
            <div class="flex justify-end gap-2">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" :loading="submitLoading" @click="handleConfirm">
                    创建
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { reactive, ref, watch } from 'vue'
    import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
    import { createSeckillActivity, type CreateSeckillActivityRequest } from '@/api/seckill'

    interface Props {
        visible: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        visible: false,
    })

    const emit = defineEmits<{
        'update:visible': [value: boolean]
        success: []
    }>()

    const formRef = ref<FormInstance>()
    const submitLoading = ref(false)

    const formData = reactive<CreateSeckillActivityRequest>({
        name: '',
        startHour: 0,
        activityDate: '',
        maxItems: 100,
    })

    const rules: FormRules<CreateSeckillActivityRequest> = {
        name: [
            { required: true, message: '请输入活动名称', trigger: 'blur' },
            { min: 2, max: 100, message: '活动名称长度在2-100个字符', trigger: 'blur' },
        ],
        activityDate: [{ required: true, message: '请选择活动日期', trigger: 'change' }],
        startHour: [{ required: true, message: '请选择开始小时', trigger: 'change' }],
        maxItems: [{ required: true, message: '请输入最大商品数', trigger: 'change' }],
    }

    const resetForm = () => {
        formData.name = ''
        formData.startHour = 0
        formData.activityDate = ''
        formData.maxItems = 100
        formRef.value?.clearValidate()
    }

    const disabledDate = (time: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return time.getTime() < today.getTime()
    }

    const handleConfirm = async () => {
        await formRef.value?.validate()

        submitLoading.value = true
        try {
            await createSeckillActivity({ ...formData })
            ElMessage.success('创建成功')
            emit('success')
            emit('update:visible', false)
            resetForm()
        } finally {
            submitLoading.value = false
        }
    }

    const handleCancel = () => {
        emit('update:visible', false)
        resetForm()
    }

    watch(
        () => props.visible,
        (visible) => {
            if (!visible) {
                resetForm()
            }
        },
    )
</script>
