<template>
    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="w-1 h-3.5 bg-primary rounded-full"></div>
                <h4 class="text-sm font-bold text-gray-700">秒杀商品列表</h4>
            </div>
            <el-tag type="info" size="small">共 {{ props.data.length }} 项</el-tag>
        </div>

        <el-table :data="props.data" size="small" border stripe style="width: 100%">
            <!-- 序号 -->
            <el-table-column type="index" label="序号" width="60" align="center" />

            <!-- 商品名称 -->
            <el-table-column label="商品名称" min-width="180">
                <template #default="{ row }">
                    <div v-if="row.data" class="flex items-center gap-2">
                        <el-image
                            v-if="row.data.mainImageUrl"
                            :src="row.data.mainImageUrl"
                            class="w-8 h-8 rounded border border-gray-100 shrink-0"
                            fit="cover"
                            :preview-src-list="[row.data.mainImageUrl]"
                            preview-teleported
                        />
                        <span class="text-sm text-gray-900 truncate" :title="row.data.goodsName">
                            {{ row.data.goodsName || '-' }}
                        </span>
                    </div>
                    <span v-else class="text-gray-400 text-xs italic">无法解析快照</span>
                </template>
            </el-table-column>

            <!-- 秒杀价 -->
            <el-table-column label="秒杀价" width="100" align="right">
                <template #default="{ row }">
                    <span v-if="row.data" class="text-red-500 font-bold font-mono">
                        ¥{{ row.data.seckillPrice || '0.00' }}
                    </span>
                    <span v-else>-</span>
                </template>
            </el-table-column>

            <!-- 秒杀库存 -->
            <el-table-column label="秒杀库存" width="100" align="center">
                <template #default="{ row }">
                    <span v-if="row.data" class="font-medium text-gray-700">
                        {{ row.data.stock ?? 0 }}
                    </span>
                    <span v-else>-</span>
                </template>
            </el-table-column>

            <!-- 当前状态 (仅针对非待审核) -->
            <el-table-column label="当前状态" width="100" align="center">
                <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)" size="small" effect="light">
                        {{ getStatusLabel(row.status) }}
                    </el-tag>
                </template>
            </el-table-column>

            <!-- 决策操作 -->
            <el-table-column label="决策操作" width="140" align="center">
                <template #default="{ row }">
                    <div
                        v-if="row.status === AuditItemStatus.PENDING"
                        class="flex items-center justify-center gap-3"
                    >
                        <span
                            class="cursor-pointer text-xs transition-colors hover:opacity-80"
                            :class="
                                getDecision(row.id).approved === true
                                    ? 'text-green-600 font-bold'
                                    : 'text-gray-400'
                            "
                            @click="getDecision(row.id).approved = true"
                        >
                            [通过]
                        </span>
                        <span
                            class="cursor-pointer text-xs transition-colors hover:opacity-80"
                            :class="
                                getDecision(row.id).approved === false
                                    ? 'text-red-600 font-bold'
                                    : 'text-gray-400'
                            "
                            @click="getDecision(row.id).approved = false"
                        >
                            [驳回]
                        </span>
                    </div>
                    <span v-else class="text-gray-400 text-xs italic">已归档</span>
                </template>
            </el-table-column>

            <!-- 审核备注 (驳回原因) -->
            <el-table-column label="审核备注 (驳回原因)" min-width="200">
                <template #default="{ row }">
                    <div v-if="row.status === AuditItemStatus.PENDING">
                        <el-input
                            v-model="getDecision(row.id).reason"
                            size="small"
                            :placeholder="
                                getDecision(row.id).approved ? '通过备注 (可选)' : '驳回原因 (必填)'
                            "
                            :status="
                                !getDecision(row.id).approved && !getDecision(row.id).reason
                                    ? 'error'
                                    : ''
                            "
                            clearable
                        />
                    </div>
                    <div v-else>
                        <span v-if="row.reason" class="text-xs text-red-500">
                            {{ row.reason }}
                        </span>
                        <span v-else class="text-gray-400 text-xs">-</span>
                    </div>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup lang="ts">
    import {
        AuditItemStatus,
        AuditItemStatusMap,
        type AuditRendererProps,
        type AuditItemDecision,
    } from '../types'
    import type { SeckillGoodsAudit } from '../schemas/seckillGoods'

    const props = defineProps<AuditRendererProps<SeckillGoodsAudit>>()
    const emit = defineEmits(['update:decisions'])

    /**
     * 获取或初始化某一行的决策对象
     */
    const getDecision = (id: string): AuditItemDecision => {
        const decision = props.decisions?.find((d) => d.auditItemId === id)
        if (decision) return decision

        // 防御性处理：如果没找到，理论上不应发生，因为 Dialog 会初始化
        const newDecision: AuditItemDecision = { auditItemId: id, approved: null, reason: '' }
        const newDecisions = [...(props.decisions || []), newDecision]
        emit('update:decisions', newDecisions)
        return newDecision
    }

    const getStatusLabel = (status: AuditItemStatus) => {
        return AuditItemStatusMap[status]?.label ?? '未知'
    }

    const getStatusType = (status: AuditItemStatus) => {
        const typeMap: Record<AuditItemStatus, string> = {
            [AuditItemStatus.PENDING]: 'warning',
            [AuditItemStatus.APPROVED]: 'success',
            [AuditItemStatus.REJECTED]: 'danger',
            [AuditItemStatus.REVOKED]: 'info',
        }
        return typeMap[status] ?? 'info'
    }
</script>

<style scoped></style>
