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
            v-if="auditInfo"
            v-loading="loading"
            class="max-h-[75vh] overflow-y-auto custom-scrollbar px-6 py-4"
        >
            <div class="space-y-6 pb-6 mt-1">
                <AuditCommonInfo :data="auditInfo" />

                <div class="space-y-6">
                    <component
                        v-if="businessComponent && businessData.length"
                        :is="businessComponent"
                        :data="businessData"
                        v-model:decisions="decisions"
                    />

                    <!-- 自动注入单对象决策表单 -->
                    <AuditDecisionForm v-if="shouldShowAutoDecisionForm" v-model="singleDecision" />

                    <div
                        v-else-if="!businessComponent || !businessData.length"
                        class="rounded border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500"
                    >
                        暂无审核对象数据
                    </div>
                </div>
            </div>
        </div>

        <template v-if="auditInfo && auditInfo.status === AuditStatus.PENDING" #footer>
            <div class="flex justify-end gap-3 px-4 py-3 border-t border-gray-50">
                <el-button @click="visible = false" class="rounded px-6"> 取消 </el-button>
                <el-button
                    v-auth="AUDIT_PERMISSIONS.EDIT"
                    type="primary"
                    @click="handleSubmit"
                    :loading="loading"
                    :disabled="!isAllDecided"
                    class="rounded px-8"
                >
                    确认提交审核
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { auditDecision } from '@/api/audit'
    import { AuditStatus, type AuditData, type AuditInfo, type AuditItemDecision } from '../types'
    import { AUDIT_PERMISSIONS } from '@/constants/permissions'
    import AuditCommonInfo from './AuditCommonInfo.vue'
    import AuditDecisionForm from './AuditDecisionForm.vue'
    import { getAuditRenderer } from '../renderers'

    interface Props {
        modelValue: boolean
        auditInfo: AuditInfo | null
        auditData: AuditData[] | null
    }

    const props = defineProps<Props>()
    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
        success: []
    }>()

    const visible = computed({
        get: () => props.modelValue,
        set: (val) => emit('update:modelValue', val),
    })

    const loading = ref(false)
    const decisions = ref<AuditItemDecision[]>([])

    // 监听业务数据变化，初始化决策列表
    watch(
        () => props.auditData,
        (newData) => {
            if (newData) {
                decisions.value = newData.map((item) => ({
                    auditItemId: item.id,
                    approved: null, // 明确初始化为 null
                    reason: '',
                }))
            } else {
                decisions.value = []
            }
        },
        { immediate: true },
    )

    const renderer = computed(() => {
        if (!props.auditInfo) return null
        return getAuditRenderer(props.auditInfo.bizType)
    })

    const businessComponent = computed(() => renderer.value?.getDetailComponent() ?? null)
    const businessData = computed(() => props.auditData ?? [])

    const shouldShowAutoDecisionForm = computed(() => {
        console.debug('判断是否显示自动决策表单', {
            auditStatus: props.auditInfo?.status,
            businessDataLength: businessData.value.length,
        })
        return props.auditInfo?.status === AuditStatus.PENDING && businessData.value.length === 1
    })

    // 单对象决策桥接（用于 v-model）
    const singleDecision = computed({
        get: () => decisions.value[0] || { auditItemId: '', approved: null, reason: '' },
        set: (val) => {
            if (decisions.value.length > 0) {
                decisions.value[0] = val
            }
        },
    })

    const isAllDecided = computed(() => {
        if (decisions.value.length === 0) return false
        return decisions.value.every((d) => d.approved !== null)
    })

    const handleSubmit = async () => {
        if (!props.auditInfo) return

        const auditNo = props.auditInfo.auditNo
        if (!auditNo) {
            ElMessage.error('审核批次标识缺失')
            return
        }

        // 校验逻辑
        const invalidDecisions = decisions.value.filter((d) => !d.approved && !d.reason?.trim())
        if (invalidDecisions.length > 0) {
            ElMessage.warning('驳回时必须填写审核备注/原因')
            return
        }

        await ElMessageBox.confirm('确认提交当前审核结果吗？提交后将无法撤回。', '操作确认', {
            confirmButtonText: '确定提交',
            cancelButtonText: '取消',
            type: 'warning',
            draggable: true,
        })

        loading.value = true
        try {
            await auditDecision({
                auditNo: auditNo,
                bizType: props.auditInfo.bizType,
                decisions: decisions.value,
            })
            ElMessage.success('审核提交成功')
            visible.value = false
            emit('success')
        } finally {
            loading.value = false
        }
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
