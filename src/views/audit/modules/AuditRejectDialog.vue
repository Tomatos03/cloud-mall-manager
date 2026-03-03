<template>
    <el-dialog
        v-model="visible"
        :title="dialogTitle"
        width="550px"
        append-to-body
        class="audit-dialog"
        @close="resetForm"
    >
        <!-- 申请信息卡片 -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-start gap-4 mb-4">
                <!-- 仅在有图片时显示 -->
                <el-image
                    v-if="form.image"
                    :src="form.image"
                    class="w-16 h-16 rounded shadow-sm shrink-0"
                    fit="cover"
                />
                <div class="flex-1 overflow-hidden">
                    <div class="font-bold text-gray-800 truncate">{{ form.title }}</div>
                    <div v-if="form.subTitle" class="text-xs text-gray-500 mt-2 line-clamp-2">
                        {{ form.subTitle }}
                    </div>
                </div>
            </div>

            <!-- 扩展信息展示项 -->
            <div v-if="form.extraInfo.length > 0" class="mb-4 space-y-2">
                <div
                    v-for="(item, index) in form.extraInfo"
                    :key="index"
                    class="flex justify-between text-xs"
                >
                    <span class="text-gray-500">{{ item.label }}：</span>
                    <span class="text-gray-700 font-medium">{{ item.value }}</span>
                </div>
            </div>

            <!-- 申请人信息 -->
            <div class="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span class="text-xs text-gray-500">申请人</span>
                <span class="text-sm text-gray-700 font-medium">{{ form.applicant }}</span>
            </div>
        </div>

        <el-form :model="form" label-position="top">
            <el-form-item label="拒绝原因" required>
                <el-input
                    v-model="form.msg"
                    type="textarea"
                    placeholder="请输入详细的拒绝理由，方便申请人修改"
                    :rows="4"
                />
            </el-form-item>
        </el-form>

        <template #footer>
            <div class="flex gap-3 justify-end">
                <el-button @click="visible = false" class="rounded-lg px-6"> 取消 </el-button>
                <el-button
                    type="primary"
                    :loading="submitting"
                    @click="handleSubmit"
                    class="rounded-lg px-8"
                >
                    确认拒绝
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, reactive, computed } from 'vue'
    import { ElMessage } from 'element-plus'
    import { auditDecision } from '@/api/audit'
    import { AuditTargetType } from '@/views/audit/types'

    export interface AuditRejectOptions {
        id: string
        targetType: AuditTargetType
        title: string
        applicant: string
        image?: string
        subTitle?: string
        extraInfo?: Array<{ label: string; value: string }>
        dialogTitle?: string
    }

    export interface AuditRejectDialogExposed {
        /**
         * 打开并初始化拒绝审核对话框
         */
        open: (options: AuditRejectOptions) => void
    }

    interface AuditRejectForm {
        id: string
        targetType?: AuditTargetType
        msg: string
        title: string
        image: string
        applicant: string
        subTitle: string
        extraInfo: Array<{ label: string; value: string }>
    }

    const props = defineProps<{
        modelValue: boolean
    }>()

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
        success: []
    }>()

    const submitting = ref(false)
    const dialogTitle = ref('拒绝审核申请')

    const form = reactive<AuditRejectForm>({
        id: '',
        targetType: undefined,
        msg: '',
        title: '',
        image: '',
        applicant: '',
        subTitle: '',
        extraInfo: [],
    })

    const visible = computed({
        get: () => props.modelValue,
        set: (value: boolean) => emit('update:modelValue', value),
    })

    const resetForm = () => {
        form.id = ''
        form.msg = ''
        form.title = ''
        form.image = ''
        form.applicant = ''
        form.subTitle = ''
        form.extraInfo = []
        dialogTitle.value = '拒绝审核申请'
    }

    const handleSubmit = async () => {
        if (!form.msg.trim()) {
            ElMessage.warning('请填写拒绝原因')
            return
        }

        if (!form.targetType) {
            ElMessage.error('业务类型丢失，请重试')
            return
        }

        submitting.value = true
        try {
            await auditDecision({
                auditId: form.id,
                targetType: form.targetType,
                approved: false,
                reason: form.msg,
            })
            ElMessage.success('审核操作已提交')
            visible.value = false
            emit('success')
        } finally {
            submitting.value = false
        }
    }

    const open = (options: AuditRejectOptions) => {
        form.id = options.id
        form.targetType = options.targetType
        form.title = options.title
        form.image = options.image || ''
        form.applicant = options.applicant
        form.subTitle = options.subTitle || ''
        form.extraInfo = options.extraInfo || []
        dialogTitle.value = options.dialogTitle || '拒绝审核申请'
        visible.value = true
    }

    // 暴露方法供父组件调用
    defineExpose({
        open,
    })
</script>

<style scoped>
    .audit-dialog :deep(.el-dialog) {
        border-radius: 20px;
        overflow: hidden;
    }

    .audit-dialog :deep(.el-dialog__header) {
        border-bottom: 1px solid #f1f5f9;
        padding: 20px 24px;
        margin-right: 0;
    }

    .audit-dialog :deep(.el-dialog__title) {
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
    }

    .audit-dialog :deep(.el-dialog__body) {
        padding: 24px;
    }

    .audit-dialog :deep(.el-form-item__label) {
        font-weight: 600;
        color: #475569;
        margin-bottom: 8px;
    }

    .audit-dialog :deep(.el-textarea__inner) {
        border-radius: 12px;
        padding: 12px;
        background-color: #f8fafc;
        border-color: #e2e8f0;
        transition: all 0.2s;
    }

    .audit-dialog :deep(.el-textarea__inner:focus) {
        background-color: white;
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .line-clamp-2 {
        display: -webkit-box;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
