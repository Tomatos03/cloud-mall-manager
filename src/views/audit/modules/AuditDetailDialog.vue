<template>
    <el-dialog
        v-model="visible"
        title="审核详情"
        width="860px"
        destroy-on-close
        class="audit-detail-v2"
        append-to-body
    >
        <div
            v-if="data"
            v-loading="loading"
            class="max-h-[75vh] overflow-y-auto custom-scrollbar px-6 py-4"
        >
            <!-- 通用审核信息部分 -->
            <div class="space-y-6 pb-6 mt-1">
                <AuditCommonInfo :data="data" />

                <!-- 业务特定内容部分 -->
                <div class="space-y-6">
                    <component
                        v-if="businessComponent && businessData"
                        :is="businessComponent"
                        :data="businessData"
                    />
                </div>
            </div>
        </div>

        <!-- 操作按钮 (需要 audit:edit 权限) -->
        <template v-if="data && [AuditStatus.PENDING, AuditStatus.REAUDIT].includes(data.status)" #footer>
            <div class="flex justify-end gap-2 px-4 py-3">
                <el-button
                    v-auth="AUDIT_PERMISSIONS.EDIT"
                    type="danger"
                    plain
                    @click="handleReject"
                    :loading="loading"
                    class="rounded px-6"
                >
                    拒绝驳回
                </el-button>
                <el-button
                    v-auth="AUDIT_PERMISSIONS.EDIT"
                    type="primary"
                    @click="handlePass"
                    :loading="loading"
                    class="rounded px-8"
                >
                    审核通过
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'
    import { ElMessageBox, ElMessage } from 'element-plus'
    import { submitAudit, AuditStatus } from '@/api/audit'
    import { AUDIT_PERMISSIONS } from '@/constants/permissions'
    import AuditCommonInfo from './AuditCommonInfo.vue'
    import { getAuditRenderer } from './renderers'
    import type { AuditCommonData } from '../types'

    interface Props {
        modelValue: boolean
        data: AuditCommonData & { targetType: string; extraInfo: string }
    }

    const props = defineProps<Props>()
    const emit = defineEmits(['update:modelValue', 'success', 'reject'])

    const visible = computed({
        get: () => props.modelValue,
        set: (val) => emit('update:modelValue', val),
    })

    const loading = ref(false)

    // 获取业务渲染器和数据
    const businessComponent = computed(() => {
        if (!props.data) return null
        const renderer = getAuditRenderer(props.data.targetType)
        return renderer?.getDetailComponent() || null
    })

    const businessData = computed(() => {
        if (!props.data) return null
        const renderer = getAuditRenderer(props.data.targetType)
        if (!renderer) return null
        try {
            return renderer.parseExtraInfo(props.data.extraInfo)
        } catch {
            return null
        }
    })

    const handlePass = async () => {
        if (!props.data) return
        await ElMessageBox.confirm(`确认该申请合规并准予通过审核吗？`, '核验确认', {
            confirmButtonText: '核验通过',
            cancelButtonText: '取消',
            type: 'success',
            draggable: true,
        })

        loading.value = true
        try {
            await submitAudit(props.data.auditId, true)
            ElMessage.success('审核已通过')
            visible.value = false
            emit('success')
        } finally {
            loading.value = false
        }
    }

    const handleReject = () => {
        if (!props.data) return
        visible.value = false
        emit('reject', props.data)
    }
</script>

<style scoped>
    .audit-detail-v2 :deep(.el-dialog) {
        border-radius: 4px;
        overflow: hidden;
    }

    .audit-detail-v2 :deep(.el-dialog__header) {
        margin: 0;
        padding: 20px 24px;
        border-bottom: 1px solid #f1f5f9;
    }

    .audit-detail-v2 :deep(.el-dialog__title) {
        font-weight: 600;
        color: #1e293b;
        font-size: 16px;
    }

    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 4px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
</style>
