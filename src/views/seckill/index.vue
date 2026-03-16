<template>
    <div class="h-full flex flex-col p-5">
        <div class="mb-4 flex items-center justify-between">
            <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">创建活动</el-button>
            <el-button :icon="Refresh" @click="loadData">刷新</el-button>
        </div>

        <div class="flex-1 overflow-hidden" v-loading="loading">
            <Table :columns="columns" :data="data" height="100%" :showId="true">
                <template #status="{ row }">
                    <el-tag :type="getActivityStatusTagType(row.status)">
                        {{ getActivityStatusLabel(row.status) }}
                    </el-tag>
                </template>

                <template #time="{ row }">
                    <div class="text-sm text-gray-600">
                        {{ formatDate(row.activityDate) }} {{ formatHourRange(row.startHour) }}
                    </div>
                </template>

                <template #createTime="{ row }">
                    <span class="text-sm text-gray-600">{{ formatDateTime(row.createTime) }}</span>
                </template>

                <template #action="{ row }">
                    <el-button link type="primary" size="small" @click="onViewDetail(row.id)">
                        详情
                    </el-button>
                </template>
            </Table>
        </div>

        <div class="mt-4 flex justify-end">
            <el-pagination
                v-model:current-page="page"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="loadData"
                @size-change="handlePageSizeChange"
            />
        </div>

        <ActivityFormDialog
            v-model:visible="showCreateDialog"
            @success="handleCreateSuccess"
        />
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { Plus, Refresh } from '@element-plus/icons-vue'
    import Table from '@/components/table/Table.vue'
    import { getSeckillActivityList, type SeckillActivity } from '@/api/seckill'
    import { formatDate, formatDateTime } from '@/utils/format'
    import ActivityFormDialog from './modules/ActivityFormDialog.vue'

    const columns = [
        { id: '1', label: '活动名称', key: 'name', minWidth: 180 },
        { id: '2', label: '状态', key: 'status', width: 120 },
        { id: '3', label: '活动时间', key: 'time', minWidth: 220 },
        { id: '4', label: '最大商品数', key: 'maxItems', width: 120 },
        { id: '5', label: '创建时间', key: 'createTime', minWidth: 180 },
    ]

    const router = useRouter()

    const data = ref<SeckillActivity[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)

    const showCreateDialog = ref(false)

    const loadData = async () => {
        loading.value = true
        try {
            const res = await getSeckillActivityList({
                page: page.value,
                pageSize: pageSize.value,
            })
            data.value = res.data.records
            total.value = Number(res.data.total) || 0
            page.value = Number(res.data.current) || page.value
            pageSize.value = Number(res.data.size) || pageSize.value
        } finally {
            loading.value = false
        }
    }

    const handlePageSizeChange = async (value: number) => {
        pageSize.value = value
        page.value = 1
        await loadData()
    }

    const onViewDetail = (id: number) => {
        router.push(`/seckill/detail/${id}`)
    }

    const handleCreateSuccess = async () => {
        page.value = 1
        await loadData()
    }

    const formatHourRange = (hour: number) => {
        const nextHour = (hour + 1) % 24
        return `${String(hour).padStart(2, '0')}:00-${String(nextHour).padStart(2, '0')}:00`
    }

    const getActivityStatusLabel = (status: number) => {
        const map: Record<number, string> = {
            0: '待开始',
            1: '进行中',
            2: '已结束',
        }
        return map[status] ?? `状态${status}`
    }

    const getActivityStatusTagType = (status: number): 'info' | 'success' | 'warning' | 'danger' => {
        const map: Record<number, 'info' | 'success' | 'warning' | 'danger'> = {
            0: 'info',
            1: 'success',
            2: 'warning',
        }
        return map[status] ?? 'info'
    }

    onMounted(loadData)
</script>
