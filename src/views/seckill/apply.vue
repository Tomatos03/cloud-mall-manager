<template>
    <div class="h-full flex flex-col p-5">
        <!-- 筛选栏 -->
        <div class="mb-4 flex gap-4 flex-wrap">
            <el-select
                v-model="searchActivityId"
                placeholder="选择活动"
                clearable
                filterable
                style="width: 200px"
                @change="handleSearch"
            >
                <el-option
                    v-for="item in activityOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
            <el-select
                v-model="searchStatus"
                placeholder="申请状态"
                clearable
                style="width: 150px"
                @change="handleSearch"
            >
                <el-option
                    v-for="(item, key) in SeckillApplyStatusMap"
                    :key="key"
                    :label="item.label"
                    :value="Number(key)"
                />
            </el-select>
            <el-input
                v-model="searchKeyword"
                placeholder="搜索商品/商家名称"
                clearable
                style="width: 200px"
                :prefix-icon="Search"
                @clear="handleSearch"
                @keyup.enter="handleSearch"
            />
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
            <div class="flex-1"></div>
            <el-select
                v-model="batchStatus"
                placeholder="批量操作"
                clearable
                style="width: 150px"
                :disabled="selectList.length === 0"
                @change="handleBatchAction"
            >
                <el-option label="批量通过" :value="1" />
                <el-option label="批量驳回" :value="2" />
            </el-select>
        </div>

        <!-- 数据表格 -->
        <div class="flex-1 overflow-hidden">
            <Table
                :columns="columns"
                :data="data"
                height="100%"
                :showId="true"
                :showSelection="true"
                v-model:selectList="selectList"
            >
                <template #activity="{ row }">
                    <div>
                        <div class="font-medium">{{ row.activityName }}</div>
                        <div class="text-gray-400 text-xs">
                            {{ formatDateTimeRange(row.activityStartTime, row.activityEndTime) }}
                        </div>
                    </div>
                </template>

                <template #product="{ row }">
                    <div class="flex items-center space-x-3">
                        <el-image
                            :src="row.productImage"
                            :preview-src-list="[row.productImage]"
                            preview-teleported
                            fit="cover"
                            class="w-12 h-12 rounded shadow-sm border border-gray-100"
                        >
                            <template #error>
                                <div
                                    class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs"
                                >
                                    无图片
                                </div>
                            </template>
                        </el-image>
                        <div>
                            <div class="font-medium max-w-32 truncate" :title="row.productName">
                                {{ row.productName }}
                            </div>
                            <div class="text-gray-400 text-xs">{{ row.merchantName }}</div>
                        </div>
                    </div>
                </template>

                <template #price="{ row }">
                    <div class="space-y-1">
                        <div class="text-red-600 font-semibold">¥{{ row.seckillPrice }}</div>
                        <div class="text-gray-400 text-xs line-through">
                            ¥{{ row.productOriginalPrice }}
                        </div>
                    </div>
                </template>

                <template #stock="{ row }">
                    <div>
                        <span class="font-medium">{{ row.stock }}</span>
                    </div>
                </template>

                <template #status="{ row }">
                    <el-tag :type="SeckillApplyStatusMap[row.status].type">
                        {{ SeckillApplyStatusMap[row.status].label }}
                    </el-tag>
                    <div
                        v-if="row.status === SeckillApplyStatus.REJECTED && row.rejectReason"
                        class="text-red-500 text-xs mt-1 max-w-32 truncate"
                        :title="row.rejectReason"
                    >
                        {{ row.rejectReason }}
                    </div>
                </template>

                <template #applyTime="{ row }">
                    <div>{{ formatDateTime(row.createTime) }}</div>
                </template>

                <template #action="{ row }">
                    <el-button
                        v-if="row.status === SeckillApplyStatus.PENDING"
                        link
                        type="success"
                        size="small"
                        @click="handleApprove(row)"
                    >
                        通过
                    </el-button>
                    <el-button
                        v-if="row.status === SeckillApplyStatus.PENDING"
                        link
                        type="danger"
                        size="small"
                        @click="handleReject(row)"
                    >
                        驳回
                    </el-button>
                    <el-button link type="primary" size="small" @click="handleViewDetail(row)">
                        详情
                    </el-button>
                    <el-button link type="info" size="small" @click="handleViewActivity(row)">
                        活动详情
                    </el-button>
                </template>
            </Table>
        </div>

        <!-- 分页 -->
        <div class="mt-4 flex justify-end">
            <el-pagination
                v-model:current-page="page"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
            />
        </div>

        <!-- 驳回对话框 -->
        <RejectDialog
            v-model:visible="showRejectDialog"
            :apply="selectedApply"
            :loading="rejectLoading"
            @confirm="handleRejectConfirm"
        />

        <!-- 详情对话框 -->
        <ApplyDetailDialog
            v-model:visible="showDetailDialog"
            :apply="selectedApply"
            @refresh="loadData"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import Table from '@/components/table/Table.vue'
    import { Search, Refresh } from '@element-plus/icons-vue'
    import { ElMessage } from 'element-plus'
    import {
        getSeckillApplyPage,
        getSeckillActivityPage,
        approveSeckillApply,
        rejectSeckillApply,
        batchAuditSeckillApply,
    } from '@/api/seckill'
    import {
        SeckillApplyStatus,
        SeckillApplyStatusMap,
        type SeckillApply,
        type SeckillActivity,
    } from '@/api/seckill'
    import { formatDateTime, formatDateTimeRange } from '@/utils/format'
    import RejectDialog from './modules/RejectDialog.vue'
    import ApplyDetailDialog from './modules/ApplyDetailDialog.vue'

    const router = useRouter()

    const columns = [
        { id: '1', label: '活动', key: 'activity' },
        { id: '2', label: '商品', key: 'product' },
        { id: '3', label: '秒杀价格', key: 'price' },
        { id: '4', label: '秒杀库存', key: 'stock' },
        { id: '5', label: '申请状态', key: 'status' },
        { id: '6', label: '申请时间', key: 'applyTime' },
    ]

    const data = ref<SeckillApply[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const selectList = ref<SeckillApply[]>([])

    const searchActivityId = ref<number | undefined>()
    const searchStatus = ref<SeckillApplyStatus | undefined>()
    const searchKeyword = ref('')

    const activityOptions = ref<{ label: string; value: number }[]>([])
    const batchStatus = ref<number | undefined>()

    const showRejectDialog = ref(false)
    const showDetailDialog = ref(false)
    const selectedApply = ref<SeckillApply | null>(null)
    const rejectLoading = ref(false)

    // 加载活动选项
    const loadActivityOptions = async () => {
        try {
            const res = await getSeckillActivityPage({ page: 1, pageSize: 100 })
            activityOptions.value = res.data.records.map((item: SeckillActivity) => ({
                label: item.name,
                value: item.id,
            }))
        } catch {
            console.error('加载活动列表失败')
        }
    }

    const loadData = async () => {
        const params: any = {
            page: page.value,
            pageSize: pageSize.value,
        }
        if (searchActivityId.value !== undefined) {
            params.activityId = searchActivityId.value
        }
        if (searchStatus.value !== undefined) {
            params.status = searchStatus.value
        }
        if (searchKeyword.value) {
            params.keyword = searchKeyword.value
        }

        const res = await getSeckillApplyPage(params)
        data.value = res.data.records
        total.value = Number(res.data.total) || 0
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

    const handleSearch = () => {
        page.value = 1
        loadData()
    }

    const handleReset = () => {
        searchActivityId.value = undefined
        searchStatus.value = undefined
        searchKeyword.value = ''
        page.value = 1
        loadData()
    }

    const handleApprove = async (row: SeckillApply) => {
        try {
            await approveSeckillApply(row.id)
            ElMessage.success('已通过')
            loadData()
        } catch {
            ElMessage.error('操作失败')
        }
    }

    const handleReject = (row: SeckillApply) => {
        selectedApply.value = row
        showRejectDialog.value = true
    }

    const handleRejectConfirm = async (reason: string) => {
        rejectLoading.value = true
        try {
            if (selectedApply.value) {
                await rejectSeckillApply(selectedApply.value.id, reason)
                ElMessage.success('已驳回')
                showRejectDialog.value = false
                selectedApply.value = null
                loadData()
            }
        } catch {
            ElMessage.error('操作失败')
        } finally {
            rejectLoading.value = false
        }
    }

    const handleBatchAction = async (action: number) => {
        if (selectList.value.length === 0) {
            ElMessage.warning('请选择要操作的申请')
            batchStatus.value = undefined
            return
        }

        if (action === 1) {
            // 批量通过
            const requests = selectList.value
                .filter((row) => row.status === SeckillApplyStatus.PENDING)
                .map((row) => ({ applyId: row.id, approved: true }))

            if (requests.length === 0) {
                ElMessage.warning('没有可操作的申请（只能操作待审核状态）')
                batchStatus.value = undefined
                return
            }

            try {
                await batchAuditSeckillApply(requests)
                ElMessage.success(`已批量通过 ${requests.length} 条申请`)
                selectList.value = []
                batchStatus.value = undefined
                loadData()
            } catch {
                ElMessage.error('操作失败')
            }
        } else if (action === 2) {
            // 批量驳回
            const pendingApplies = selectList.value.filter(
                (row) => row.status === SeckillApplyStatus.PENDING,
            )

            if (pendingApplies.length === 0) {
                ElMessage.warning('没有可操作的申请（只能操作待审核状态）')
                batchStatus.value = undefined
                return
            }

            selectedApply.value = pendingApplies[0]
            showRejectDialog.value = true
            batchStatus.value = undefined
        }
    }

    const handleViewDetail = (row: SeckillApply) => {
        selectedApply.value = row
        showDetailDialog.value = true
    }

    const handleViewActivity = (row: SeckillApply) => {
        router.push(`/seckill/detail/${row.activityId}`)
    }

    onMounted(() => {
        loadActivityOptions()
        loadData()
    })
</script>

<style scoped></style>
