<template>
    <div class="h-full flex flex-col">
        <!-- 筛选栏 -->
        <div class="mb-4 flex gap-4">
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
                <template #productImage="{ row }">
                    <el-image
                        :src="row.productImage"
                        :preview-src-list="[row.productImage]"
                        preview-teleported
                        fit="cover"
                        class="w-16 h-16 rounded shadow-sm border border-gray-100"
                    >
                        <template #error>
                            <div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                无图片
                            </div>
                        </template>
                    </el-image>
                </template>

                <template #price="{ row }">
                    <div class="space-y-1">
                        <div class="text-red-600 font-semibold">¥{{ row.seckillPrice }}</div>
                        <div class="text-gray-400 text-sm line-through">
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
                    <div v-if="row.status === SeckillApplyStatus.REJECTED && row.rejectReason"
                         class="text-red-500 text-xs mt-1 max-w-32 truncate"
                         :title="row.rejectReason">
                        {{ row.rejectReason }}
                    </div>
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
                    <el-button
                        link
                        type="primary"
                        size="small"
                        @click="handleViewDetail(row)"
                    >
                        详情
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
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, watch } from 'vue'
    import Table from '@/components/table/Table.vue'
    import { ElMessage } from 'element-plus'
    import {
        getSeckillApplyPage,
        approveSeckillApply,
        rejectSeckillApply,
        batchAuditSeckillApply,
    } from '@/api/seckill'
    import {
        SeckillApplyStatus,
        SeckillApplyStatusMap,
        type SeckillApply,
    } from '@/api/seckill'
    import RejectDialog from './RejectDialog.vue'
    import ApplyDetailDialog from './ApplyDetailDialog.vue'

    interface Props {
        activityId: number
    }

    const props = defineProps<Props>()

    const columns = [
        { id: '1', label: '商品图片', key: 'productImage' },
        { id: '2', label: '商品名称', key: 'productName' },
        { id: '3', label: '所属商家', key: 'merchantName' },
        { id: '4', label: '秒杀价格', key: 'price' },
        { id: '5', label: '秒杀库存', key: 'stock' },
        { id: '6', label: '申请状态', key: 'status' },
    ]

    const data = ref<SeckillApply[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const selectList = ref<SeckillApply[]>([])

    const searchStatus = ref<SeckillApplyStatus | undefined>()
    const batchStatus = ref<number | undefined>()

    const showRejectDialog = ref(false)
    const showDetailDialog = ref(false)
    const selectedApply = ref<SeckillApply | null>(null)
    const rejectLoading = ref(false)

    const loadData = async () => {
        const params: any = {
            page: page.value,
            pageSize: pageSize.value,
        }
        if (props.activityId) {
            params.activityId = props.activityId
        }
        if (searchStatus.value !== undefined) {
            params.status = searchStatus.value
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
                .filter(row => row.status === SeckillApplyStatus.PENDING)
                .map(row => ({ applyId: row.id, approved: true }))

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
                row => row.status === SeckillApplyStatus.PENDING
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

    watch(() => props.activityId, () => {
        page.value = 1
        loadData()
    }, { immediate: true })
</script>

<style scoped>
</style>
