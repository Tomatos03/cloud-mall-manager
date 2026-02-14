<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <!-- 搜索筛选区域 -->
        <AuditFilter @change="handleFilterChange" @reset="handleReset" />

        <!-- 表格区域 -->
        <div class="flex-1 overflow-hidden">
            <Table :columns="columns" :data="data" height="100%" :showId="false">
                <!-- 审核申请ID -->
                <template #auditId="{ row }">
                    <span class="text-gray-600 text-sm font-mono">{{ row.auditId || '-' }}</span>
                </template>

                <!-- 申请人 -->
                <template #applicantName="{ row }">
                    <span class="text-gray-600 text-sm">{{ row.applicantName || '-' }}</span>
                </template>

                <!-- 业务类型 -->
                <template #targetType="{ row }">
                    <el-tag
                        :type="getTargetTypeInfo(row.targetType).type"
                        size="small"
                        effect="light"
                        class="px-3 rounded-full border-none"
                    >
                        {{ getTargetTypeInfo(row.targetType).label }}
                    </el-tag>
                </template>

                <!-- 提交时间 -->
                <template #createTime="{ row }">
                    <span class="text-gray-400 text-xs">{{ row.createTime || '-' }}</span>
                </template>

                <!-- 审核状态 -->
                <template #status="{ row }">
                    <el-tag
                        :type="getAuditStatusInfo(row.status).type"
                        size="small"
                        effect="light"
                        class="px-3 rounded-full border-none"
                    >
                        {{ getAuditStatusInfo(row.status).label }}
                    </el-tag>
                </template>

                <!-- 操作 -->
                <template #action="{ index }">
                    <el-button link type="primary" size="small" @click="onView(index)">
                        查看详情
                    </el-button>
                </template>
            </Table>
        </div>

        <!-- 分页区域 -->
        <div class="mt-6 flex justify-end">
            <el-pagination
                v-model:current-page="page"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                background
                layout="total, sizes, prev, pager, next, jumper"
                class="custom-pagination"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
            />
        </div>

        <!-- 审核详情对话框 -->
        <AuditDetailDialog
            v-if="currentAuditData"
            v-model="detailVisible"
            :data="currentAuditData"
            @success="loadData"
            @reject="handleRejectFromDetail"
        />

        <!-- 拒绝审核对话框 -->
        <AuditRejectDialog
            ref="auditRejectDialogRef"
            v-model="auditRejectDialogVisible"
            @success="handleRejectSuccess"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import Table from '@/components/table/Table.vue'
    import AuditDetailDialog from './modules/AuditDetailDialog.vue'
    import AuditFilter, { type FilterParams } from './modules/AuditFilter.vue'
    import AuditRejectDialog, {
        type AuditRejectDialogExposed,
    } from './modules/AuditRejectDialog.vue'
    import {
        pageAudit,
        AuditStatus,
        AuditStatusMap,
        AuditTargetType,
        AuditTargetTypeMap,
    } from '@/api/audit'
    import { useCategoryStore } from '@/stores/category'
    import { getAuditRenderer } from './modules/renderers'
    import type { AuditLogVO } from '@/api/audit'
    import type { AuditCommonData } from './types'

    interface AuditListRow {
        auditId: string
        applicantName: string
        targetType: string
        createTime: string
        status: AuditStatus
        reason?: string
    }

    interface AuditDetail extends AuditCommonData {
        extraInfo: string
    }

    // 初始化 store
    const categoryStore = useCategoryStore()

    // 通用表格列
    const columns = [
        { id: '1', label: '审核ID', key: 'auditId', minWidth: 90 },
        { id: '2', label: '申请人', key: 'applicantName', minWidth: 110 },
        { id: '3', label: '业务类型', key: 'targetType', minWidth: 90 },
        { id: '4', label: '提交时间', key: 'createTime', minWidth: 150 },
        { id: '5', label: '审核状态', key: 'status', minWidth: 110 },
    ]

    const data = ref<AuditListRow[]>([])
    const detailDataList = ref<AuditDetail[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)

    const detailVisible = ref(false)
    const currentAuditData = ref<AuditDetail>()

    const auditRejectDialogRef = ref<AuditRejectDialogExposed | null>(null)
    const auditRejectDialogVisible = ref(false)

    // 当前筛选参数
    const currentFilterParams = ref<FilterParams>({})

    const loadData = async () => {
        loading.value = true

        const res = await pageAudit({
            page: page.value,
            pageSize: pageSize.value,
            ...currentFilterParams.value,
        })

        // 解析审核数据
        const records = (res.data.records || []).map((item: AuditLogVO): AuditDetail => {
            return {
                auditId: item.auditId,
                targetType: item.targetType,
                targetId: item.targetId,
                status: item.status,
                statusName: item.statusName,
                reason: item.reason,
                applicantId: item.applicantId,
                applicantName: item.applicantName,
                auditorId: item.auditorId,
                auditorName: item.auditorName,
                extraInfo: item.extraInfo,
                createTime: item.createTime,
                auditTime: item.auditTime,
            }
        })

        detailDataList.value = records
        data.value = records.map(
            (item): AuditListRow => ({
                auditId: item.auditId,
                applicantName: item.applicantName,
                targetType: item.targetType,
                createTime: item.createTime,
                status: item.status as AuditStatus,
                reason: item.reason,
            }),
        )
        total.value = res.data.total
        loading.value = false
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

    const handleFilterChange = (filterParams: FilterParams) => {
        currentFilterParams.value = filterParams
        page.value = 1
        loadData()
    }

    const handleReset = () => {
        currentFilterParams.value = {}
        page.value = 1
        loadData()
    }

    const onView = (index: number) => {
        const detail = detailDataList.value?.[index]
        if (!detail) return

        currentAuditData.value = detail
        detailVisible.value = true
    }

    const handleRejectFromDetail = (auditData: AuditDetail) => {
        const row = data.value.find((item) => item.auditId === auditData.auditId)
        if (!row) return

        const renderer = getAuditRenderer(auditData.targetType)
        if (!renderer) return

        const businessData = renderer.parseExtraInfo(auditData.extraInfo)
        auditRejectDialogRef.value?.setData(
            row.auditId,
            businessData.goodsName || '未知',
            businessData.displayImageUrls?.[0] || '',
            row.applicantName,
            businessData.sellPoint,
        )
    }

    const handleRejectSuccess = () => {
        loadData()
    }

    const getAuditStatusInfo = (status: AuditStatus) => {
        return AuditStatusMap[status] || { label: '未知', type: 'info' as const }
    }

    const getTargetTypeInfo = (targetType: AuditLogVO['targetType']) => {
        const typeKey = targetType as AuditTargetType
        return {
            label: AuditTargetTypeMap[typeKey]?.label || '未知',
            type: 'info' as const,
        }
    }

    onMounted(async () => {
        Promise.all([categoryStore.loadCategoryList(), loadData()])
    })
</script>

<style scoped>
    .custom-pagination :deep(.el-pagination__total),
    .custom-pagination :deep(.el-pagination__jump) {
        color: #64748b;
        font-weight: 500;
    }

    .custom-pagination :deep(.btn-prev),
    .custom-pagination :deep(.btn-next),
    .custom-pagination :deep(.el-pager li) {
        background-color: white !important;
        border: 1px solid #f1f5f9 !important;
        border-radius: 6px !important;
        transition: all 0.2s;
    }

    .custom-pagination :deep(.el-pager li.is-active) {
        background-color: #3b82f6 !important;
        border-color: #3b82f6 !important;
        color: white !important;
        box-shadow: 0 2px 8px -2px rgba(59, 130, 246, 0.2);
    }
</style>
