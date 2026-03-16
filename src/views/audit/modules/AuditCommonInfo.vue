<template>
    <div class="bg-white rounded border border-gray-100 p-5">
        <div class="flex flex-wrap gap-x-12 gap-y-6">
            <div class="space-y-1.5 min-w-30">
                <span class="text-xs text-gray-500 block tracking-wider uppercase font-medium">
                    当前审核状态
                </span>
                <div class="flex items-center gap-2">
                    <div
                        class="w-2 h-2 rounded-full"
                        :class="getStatusColorClass(data.status)"
                    ></div>
                    <span class="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {{ getStatusLabel(data.status) }}
                    </span>
                </div>
            </div>

            <div class="space-y-1.5 min-w-30">
                <span class="text-xs text-gray-500 block tracking-wider uppercase font-medium">
                    申请人
                </span>
                <span class="text-sm text-gray-700 font-medium whitespace-nowrap">
                    {{ data.applicantName || '-' }}
                </span>
            </div>

            <div class="space-y-1.5 min-w-40">
                <span class="text-xs text-gray-500 block tracking-wider uppercase font-medium">
                    申请提交时间
                </span>
                <span class="text-sm text-gray-700 font-medium whitespace-nowrap">
                    {{ data.createTime || '-' }}
                </span>
            </div>

            <div v-if="data.status !== AuditStatus.PENDING" class="space-y-1.5 min-w-40">
                <span class="text-xs text-gray-500 block tracking-wider uppercase font-medium">
                    最后处理时间
                </span>
                <span class="text-sm text-gray-700 font-medium whitespace-nowrap">
                    {{ data.auditTime || '-' }}
                </span>
            </div>

            <div
                v-if="
                    data.status === AuditStatus.APPROVED ||
                    data.status === AuditStatus.REJECTED ||
                    data.status === AuditStatus.PARTIAL
                "
                class="space-y-1.5 min-w-30"
            >
                <span class="text-xs text-gray-500 block tracking-wider uppercase font-medium">
                    审核执行人
                </span>
                <span class="text-sm text-gray-700 font-medium whitespace-nowrap">
                    {{ data.auditorName || '系统' }}
                </span>
            </div>

            <div v-if="data.status === AuditStatus.REVOKED" class="w-full">
                <div class="pt-4 border-t border-gray-50">
                    <div
                        class="bg-gray-50 border border-gray-100 rounded p-3 text-xs text-gray-500 italic"
                    >
                        该审核申请已被商家撤回，当前信息仅供留档查看。
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { AuditStatus, AuditStatusMap, type AuditInfo } from '@/views/audit/types'

    interface Props {
        data: AuditInfo
    }

    defineProps<Props>()

    const statusColorMap: Record<string, string> = {
        [AuditStatus.PENDING]: 'bg-blue-500',
        [AuditStatus.APPROVED]: 'bg-green-500',
        [AuditStatus.REJECTED]: 'bg-red-500',
        [AuditStatus.PARTIAL]: 'bg-amber-500',
        [AuditStatus.REVOKED]: 'bg-gray-400',
    }

    const getStatusLabel = (status: string): string => {
        return AuditStatusMap[status as AuditStatus]?.label || '-'
    }

    const getStatusColorClass = (status: string): string => {
        return statusColorMap[status] || 'bg-gray-400'
    }
</script>
