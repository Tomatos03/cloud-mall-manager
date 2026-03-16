<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <AuditFilter @change="handleFilterChange" @reset="handleReset" />

        <div class="flex-1 overflow-hidden">
            <Table :columns="columns" :data="data" height="100%" :showId="false" :loading="loading">
                <template #auditNo="{ row }">
                    <span class="text-gray-600 text-sm font-mono">{{ row.auditNo || '-' }}</span>
                </template>

                <template #applicantName="{ row }">
                    <span class="text-gray-600 text-sm">{{ row.applicantName || '-' }}</span>
                </template>

                <template #bizType="{ row }">
                    <el-tag
                        :type="getBizTypeInfo(row.bizType).type"
                        size="small"
                        effect="light"
                        class="px-3 rounded-full border-none"
                    >
                        {{ getBizTypeInfo(row.bizType).label }}
                    </el-tag>
                </template>

                <template #createTime="{ row }">
                    <span class="text-gray-400 text-xs">{{ row.createTime || '-' }}</span>
                </template>

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

                <template #action="{ row }">
                    <el-button
                        link
                        type="primary"
                        size="small"
                        :loading="detailLoading && viewingAuditNo === row.auditNo"
                        @click="onView(row)"
                    >
                        查看详情
                    </el-button>
                </template>
            </Table>
        </div>

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

        <AuditDetailDialog
            v-if="currentAuditInfo"
            v-model="detailVisible"
            :audit-info="currentAuditInfo"
            :audit-data="currentAuditData"
            @success="loadData"
        />
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref } from 'vue'
    import Table from '@/components/table/Table.vue'
    import AuditDetailDialog from './modules/AuditDetailDialog.vue'
    import AuditFilter, { type FilterParams } from './modules/AuditFilter.vue'
    import { getAuditDetail, pageAudit } from '@/api/audit'
    import {
        AuditStatus,
        AuditStatusMap,
        AuditBizType,
        AuditBizTypeMap,
        type AuditData,
        type AuditDetail,
        type AuditInfo,
        type AuditRow,
    } from '@/views/audit/types'
    import { useCategoryStore } from '@/stores/category'
    import { getAuditRenderer } from './renderers'

    const categoryStore = useCategoryStore()

    const columns = [
        { id: '1', label: '审核编号', key: 'auditNo', minWidth: 120 },
        { id: '2', label: '申请人', key: 'applicantName', minWidth: 110 },
        { id: '3', label: '业务类型', key: 'bizType', minWidth: 100 },
        { id: '4', label: '提交时间', key: 'createTime', minWidth: 150 },
        { id: '5', label: '审核状态', key: 'status', minWidth: 110 },
    ]

    const data = ref<AuditInfo[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)
    const detailLoading = ref(false)
    const viewingAuditNo = ref('')

    const detailVisible = ref(false)
    const currentAuditInfo = ref<AuditInfo | null>(null)
    const currentAuditData = ref<AuditData[]>([])

    const currentFilterParams = ref<FilterParams>({})

    const toAuditInfo = (item: AuditRow): AuditInfo => {
        return {
            auditId: item.auditId,
            auditNo: item.auditNo,
            bizType: item.bizType,
            status: item.status,
            applicantId: item.applicantId,
            applicantName: item.applicantName,
            auditorId: item.auditorId,
            auditorName: item.auditorName,
            createTime: item.createTime,
            auditTime: item.auditTime,
        }
    }

    const convertAuditItemsToData = (
        auditItems: AuditDetail,
        bizType: AuditBizType,
    ): AuditData[] => {
        const renderer = getAuditRenderer(bizType)
        if (!renderer) {
            return []
        }

        return auditItems.map((item) => ({
            id: item.id,
            status: item.status,
            reason: item.reason,
            data: renderer.parseSnapshot(item.snapshot) ?? null,
        }))
    }

    const loadData = async () => {
        loading.value = true
        try {
            const res = await pageAudit({
                page: page.value,
                pageSize: pageSize.value,
                ...currentFilterParams.value,
            })

            const records = (res.data.records ?? []).map(toAuditInfo)
            data.value = records
            total.value = res.data.total
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

    const onView = async (row: AuditInfo) => {
        detailLoading.value = true
        viewingAuditNo.value = row.auditNo
        currentAuditInfo.value = row
        detailVisible.value = true
        currentAuditData.value = []

        try {
            const res = await getAuditDetail(row.auditNo)
            const auditDetail = res.data ?? []
            currentAuditData.value = convertAuditItemsToData(auditDetail, row.bizType)
        } finally {
            detailLoading.value = false
            viewingAuditNo.value = ''
        }
    }

    const getAuditStatusInfo = (status: AuditStatus) => {
        return AuditStatusMap[status] || { label: '未知', type: 'info' as const }
    }

    const getBizTypeInfo = (bizType: AuditBizType) => {
        return AuditBizTypeMap[bizType] || { label: '未知', type: 'info' as const }
    }

    onMounted(() => {
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
